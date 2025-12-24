-- ==========================================
-- 快速测试：验证表是否存在
-- ==========================================
-- 在 Supabase SQL Editor 中执行这个查询
-- 看看表是否真的创建了
-- ==========================================

-- 查询 1：检查表是否存在
SELECT 
  table_name,
  '表存在' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'team_members', 'team_folders', 'team_videos')
ORDER BY table_name;

-- ==========================================
-- 预期结果：
-- 如果返回 4 行，说明表已创建 ✅
-- 如果返回 0 行，说明表不存在 ❌
-- ==========================================

-- 查询 2：检查表的详细信息
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON t.table_schema = c.table_schema 
  AND t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('teams', 'team_members', 'team_folders', 'team_videos')
GROUP BY t.table_name
ORDER BY t.table_name;

-- ==========================================
-- 这个查询会显示每个表有多少列
-- teams 应该有 6 列
-- team_members 应该有 8 列
-- team_folders 应该有 7 列
-- team_videos 应该有 6 列
-- ==========================================

-- 查询 3：检查 RLS 状态
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '已启用'
    ELSE '已禁用'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('teams', 'team_members', 'team_folders', 'team_videos')
ORDER BY tablename;

-- ==========================================
-- 如果 RLS 状态显示"已禁用"，这是正常的
-- 因为我们为了测试暂时禁用了 RLS
-- ==========================================
