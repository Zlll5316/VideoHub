-- ==========================================
-- 快速测试：检查表是否存在
-- ==========================================
-- 在 Supabase SQL Editor 中执行这个查询
-- 看看表是否真的创建了

SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'team_members', 'team_folders', 'team_videos')
ORDER BY table_name;

-- ==========================================
-- 如果上面的查询返回 4 行，说明表已创建
-- 如果返回 0 行或少于 4 行，说明表没有创建成功
-- ==========================================
