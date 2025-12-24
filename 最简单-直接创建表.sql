-- ==========================================
-- 最简单版本：直接创建表，不依赖任何其他表
-- ==========================================
-- 如果之前的脚本都失败了，试试这个
-- ==========================================

-- 删除表（如果存在，用于重新创建）
DROP TABLE IF EXISTS public.team_videos CASCADE;
DROP TABLE IF EXISTS public.team_folders CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- 1. 创建团队表（最基础的表）
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建团队成员表
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  user_id UUID,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Viewer',
  status TEXT NOT NULL DEFAULT 'Pending',
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email),
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE
);

-- 3. 创建团队文件夹表
CREATE TABLE public.team_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE
);

-- 4. 创建团队视频表
CREATE TABLE public.team_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  folder_id UUID,
  video_id UUID NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, folder_id, video_id),
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES public.team_folders(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_folders_team_id ON public.team_folders(team_id);
CREATE INDEX idx_team_videos_team_id ON public.team_videos(team_id);

-- 禁用 RLS（用于测试，确保能访问）
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_videos DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 验证：检查表是否创建成功
-- ==========================================
SELECT 
  'teams' as table_name,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'teams'
UNION ALL
SELECT 
  'team_members' as table_name,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'team_members'
UNION ALL
SELECT 
  'team_folders' as table_name,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'team_folders'
UNION ALL
SELECT 
  'team_videos' as table_name,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'team_videos';

-- 如果返回 4 行，每行的 row_count 都是 1，说明表创建成功
-- ==========================================
