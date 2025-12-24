-- ==========================================
-- 解决 PGRST205 错误：表在 schema cache 中找不到
-- ==========================================
-- 这个错误通常是因为：
-- 1. 表确实不存在
-- 2. 表创建了但 schema cache 没有刷新
-- ==========================================

-- 步骤 1：先检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'team_members', 'team_folders', 'team_videos');

-- 如果上面的查询返回 0 行，说明表不存在，执行下面的创建语句
-- 如果返回 4 行，说明表已存在，跳到步骤 2

-- ==========================================
-- 步骤 2：如果表不存在，创建表
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

-- 4. 创建团队视频表
CREATE TABLE IF NOT EXISTS public.team_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.team_folders(id) ON DELETE SET NULL,
  video_id UUID NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, folder_id, video_id)
);

-- ==========================================
-- 步骤 3：创建索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_folders_team_id ON public.team_folders(team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_team_id ON public.team_videos(team_id);

-- ==========================================
-- 步骤 4：禁用 RLS（临时，用于测试）
-- ==========================================
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_videos DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 步骤 5：刷新 schema cache（重要！）
-- ==========================================
-- 在 Supabase Dashboard 中：
-- 1. 点击左侧菜单的 "Settings"
-- 2. 点击 "API"
-- 3. 找到 "Reload schema" 或 "Refresh schema" 按钮
-- 4. 点击刷新
-- 
-- 或者等待几分钟，schema cache 会自动刷新
-- ==========================================

-- ==========================================
-- 验证：再次检查表是否存在
-- ==========================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'team_members', 'team_folders', 'team_videos');

-- 应该返回 4 行
