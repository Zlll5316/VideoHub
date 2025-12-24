-- ==========================================
-- VideoHub 团队功能数据库表结构
-- ==========================================

-- 1. 团队表 (teams)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 团队成员表 (team_members)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL 表示待激活邀请
  email TEXT NOT NULL, -- 邀请邮箱
  role TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Owner', 'Admin', 'Editor', 'Viewer')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email) -- 每个邮箱在团队中只能有一条记录
);

-- 3. 团队文件夹表 (team_folders)
CREATE TABLE IF NOT EXISTS team_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 团队视频表 (team_videos) - 视频分享到团队文件夹
CREATE TABLE IF NOT EXISTS team_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES team_folders(id) ON DELETE SET NULL, -- NULL 表示未分类
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, folder_id, video_id) -- 防止重复分享
);

-- ==========================================
-- 索引优化
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_folders_team_id ON team_folders(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_team_id ON team_videos(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_folder_id ON team_videos(folder_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_video_id ON team_videos(video_id);

-- ==========================================
-- Row Level Security (RLS) 策略
-- ==========================================

-- 启用 RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_videos ENABLE ROW LEVEL SECURITY;

-- Teams: 团队成员可以查看自己所在的团队
CREATE POLICY "团队成员可以查看团队" ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

-- Teams: 用户可以创建团队
CREATE POLICY "用户可以创建团队" ON teams
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Teams: 团队所有者可以更新团队
CREATE POLICY "团队所有者可以更新团队" ON teams
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Team Members: 团队成员可以查看成员列表
CREATE POLICY "团队成员可以查看成员" ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'Active'
    )
  );

-- Team Members: 团队管理员可以邀请成员
CREATE POLICY "管理员可以邀请成员" ON team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('Owner', 'Admin')
      AND tm.status = 'Active'
    )
  );

-- Team Members: 管理员可以删除成员
CREATE POLICY "管理员可以删除成员" ON team_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('Owner', 'Admin')
      AND tm.status = 'Active'
    )
  );

-- Team Folders: 团队成员可以查看文件夹
CREATE POLICY "团队成员可以查看文件夹" ON team_folders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_folders.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

-- Team Folders: 编辑者及以上可以创建文件夹
CREATE POLICY "编辑者可以创建文件夹" ON team_folders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_folders.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Owner', 'Admin', 'Editor')
      AND team_members.status = 'Active'
    )
  );

-- Team Videos: 团队成员可以查看分享的视频
CREATE POLICY "团队成员可以查看分享视频" ON team_videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_videos.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

-- Team Videos: 编辑者及以上可以分享视频
CREATE POLICY "编辑者可以分享视频" ON team_videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_videos.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Owner', 'Admin', 'Editor')
      AND team_members.status = 'Active'
    )
  );

-- ==========================================
-- 辅助函数：获取用户默认团队
-- ==========================================

-- 创建或获取用户的默认团队
CREATE OR REPLACE FUNCTION get_or_create_default_team(user_id UUID)
RETURNS UUID AS $$
DECLARE
  team_id UUID;
BEGIN
  -- 查找用户是否已有团队
  SELECT id INTO team_id
  FROM teams
  WHERE owner_id = user_id
  LIMIT 1;
  
  -- 如果没有，创建一个默认团队
  IF team_id IS NULL THEN
    INSERT INTO teams (name, owner_id, description)
    VALUES ('我的团队', user_id, '默认团队空间')
    RETURNING id INTO team_id;
    
    -- 自动添加创建者为 Owner
    INSERT INTO team_members (team_id, user_id, email, role, status)
    SELECT 
      team_id,
      user_id,
      (SELECT email FROM auth.users WHERE id = user_id),
      'Owner',
      'Active';
  END IF;
  
  RETURN team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
