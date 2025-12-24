-- ==========================================
-- 简化版：仅创建表，不创建 RLS 策略
-- 用于快速测试
-- ==========================================

-- 1. 创建团队表
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建团队成员表
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Viewer',
  status TEXT NOT NULL DEFAULT 'Pending',
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- 3. 创建团队文件夹表
CREATE TABLE IF NOT EXISTS public.team_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建团队视频表（如果 videos 表不存在，先注释掉外键）
CREATE TABLE IF NOT EXISTS public.team_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.team_folders(id) ON DELETE SET NULL,
  video_id UUID NOT NULL,  -- 暂时不添加外键约束
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, folder_id, video_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_folders_team_id ON public.team_folders(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_team_id ON public.team_videos(team_id);

-- 暂时禁用 RLS（用于测试）
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_videos DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 完成！
-- 这个版本移除了所有 RLS 策略和外键约束
-- 用于快速测试，确认表能正常创建和使用
-- ==========================================
