# 🔧 解决 PGRST205 错误 - 详细步骤

## 错误信息
```
错误代码: PGRST205
错误信息: Could not find the table 'public.teams' in the schema cache
```

## ✅ 解决方案（按顺序执行）

### 步骤 1：执行 SQL 脚本创建表

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 登录并选择你的项目

2. **打开 SQL Editor**
   - 点击左侧菜单的 "SQL Editor"

3. **执行 SQL 脚本**
   - 打开项目中的文件：`解决PGRST205错误.sql`
   - 复制所有内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

### 步骤 2：刷新 Schema Cache（重要！）

这是解决 PGRST205 错误的关键步骤！

**方法 A：通过 Dashboard（推荐）**
1. 在 Supabase Dashboard 中
2. 点击左侧菜单的 **"Settings"**（设置）
3. 点击 **"API"** 标签
4. 找到 **"Reload schema"** 或 **"Refresh schema"** 按钮
5. 点击刷新

**方法 B：等待自动刷新**
- Schema cache 通常会在几分钟内自动刷新
- 等待 2-3 分钟后刷新应用页面

**方法 C：重启项目（如果方法 A 找不到按钮）**
1. 在 Supabase Dashboard 中
2. 点击左侧菜单的 **"Settings"**
3. 点击 **"General"**
4. 找到 **"Restart project"** 或类似选项
5. 重启项目（这会导致 schema cache 刷新）

### 步骤 3：验证表已创建

在 SQL Editor 中执行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'team_members', 'team_folders', 'team_videos');
```

**应该返回 4 行**：
- teams
- team_members
- team_folders
- team_videos

### 步骤 4：刷新应用页面

1. 回到应用（localhost:5173）
2. 按 `Cmd/Ctrl + R` 刷新页面
3. 应该就能正常加载了！

## 🔍 如果还是不行

### 检查 1：表真的创建了吗？

在 Supabase Dashboard 中：
1. 点击左侧菜单的 **"Table Editor"**
2. 看看能否看到 `teams` 表
3. 如果看不到，说明表没有创建成功

### 检查 2：Schema Cache 刷新了吗？

1. 等待 5 分钟
2. 或者尝试重启 Supabase 项目
3. 或者联系 Supabase 支持

### 检查 3：权限问题

1. 确保你使用的是项目所有者账号
2. 或者联系项目管理员

## 💡 为什么会出现 PGRST205？

这个错误表示：
- 表可能已经创建了
- 但是 Supabase 的 API 层（PostgREST）的 schema cache 还没有更新
- 需要手动刷新 schema cache

## 🆘 还是不行？

请告诉我：
1. 在 Table Editor 中能看到表吗？
2. SQL 脚本执行成功了吗？
3. 刷新 schema cache 后还是报错吗？

有了这些信息，我会继续帮你解决！
