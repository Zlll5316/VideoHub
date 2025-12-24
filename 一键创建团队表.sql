-- ==========================================
-- VideoHub 团队功能 - 一键创建所有表
-- ==========================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制此文件所有内容
-- 4. 粘贴到 SQL Editor
-- 5. 点击 "Run" 执行
-- ==========================================

-- 1. 创建团队表
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建团队成员表
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Owner', 'Admin', 'Editor', 'Viewer')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- 3. 创建团队文件夹表
CREATE TABLE IF NOT EXISTS public.team_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建团队视频表
CREATE TABLE IF NOT EXISTS public.team_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.team_folders(id) ON DELETE SET NULL,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, folder_id, video_id)
);

-- ==========================================
-- 创建索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_folders_team_id ON public.team_folders(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_team_id ON public.team_videos(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_folder_id ON public.team_videos(folder_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_video_id ON public.team_videos(video_id);

-- ==========================================
-- 启用 RLS (Row Level Security)
-- ==========================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_videos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS 策略 - Teams
-- ==========================================
DROP POLICY IF EXISTS "团队成员可以查看团队" ON public.teams;
CREATE POLICY "团队成员可以查看团队" ON public.teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "用户可以创建团队" ON public.teams;
CREATE POLICY "用户可以创建团队" ON public.teams
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "团队所有者可以更新团队" ON public.teams;
CREATE POLICY "团队所有者可以更新团队" ON public.teams
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- ==========================================
-- RLS 策略 - Team Members
-- ==========================================
DROP POLICY IF EXISTS "团队成员可以查看成员" ON public.team_members;
CREATE POLICY "团队成员可以查看成员" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "管理员可以邀请成员" ON public.team_members;
CREATE POLICY "管理员可以邀请成员" ON public.team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('Owner', 'Admin')
      AND tm.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "管理员可以删除成员" ON public.team_members;
CREATE POLICY "管理员可以删除成员" ON public.team_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('Owner', 'Admin')
      AND tm.status = 'Active'
    )
  );

-- ==========================================
-- RLS 策略 - Team Folders
-- ==========================================
DROP POLICY IF EXISTS "团队成员可以查看文件夹" ON public.team_folders;
CREATE POLICY "团队成员可以查看文件夹" ON public.team_folders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_folders.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "编辑者可以创建文件夹" ON public.team_folders;
CREATE POLICY "编辑者可以创建文件夹" ON public.team_folders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_folders.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Owner', 'Admin', 'Editor')
      AND team_members.status = 'Active'
    )
  );

-- ==========================================
-- RLS 策略 - Team Videos
-- ==========================================
DROP POLICY IF EXISTS "团队成员可以查看分享视频" ON public.team_videos;
CREATE POLICY "团队成员可以查看分享视频" ON public.team_videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_videos.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "编辑者可以分享视频" ON public.team_videos;
CREATE POLICY "编辑者可以分享视频" ON public.team_videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_videos.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Owner', 'Admin', 'Editor')
      AND team_members.status = 'Active'
    )
  );

-- ==========================================
-- 完成！
-- ==========================================
-- 执行完成后，你应该能看到：
-- ✅ 4 个表已创建
-- ✅ 所有索引已创建
-- ✅ RLS 已启用
-- ✅ 所有策略已创建
-- 
-- 现在可以刷新应用页面了！
-- ==========================================
