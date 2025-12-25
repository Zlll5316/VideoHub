# 🔧 Vercel API 路由问题排查指南

## ✅ 已完成的修复

1. ✅ 删除了 `api/notion.ts`（避免与 `api/notion.js` 冲突）
2. ✅ 只保留 `api/notion.js`（JavaScript 格式）
3. ✅ `api/` 文件夹在根目录（与 `package.json` 同级）
4. ✅ `vercel.json` 配置正确

## 🚨 如果仍然报错 "export def..." 

### 步骤 1: 检查 Vercel 部署状态

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到你的项目

2. **检查最新部署**
   - 进入项目 → Deployments
   - 查看最新部署的状态
   - **必须看到绿色 ✅ "Ready"**

3. **如果部署失败或还在进行中**
   - 等待部署完成
   - 或点击 "Redeploy" 重新部署

### 步骤 2: 检查 Vercel Functions

1. **进入 Functions 页面**
   - Vercel Dashboard → 项目 → Functions

2. **确认 `/api/notion` 存在**
   - 应该能看到 `/api/notion` 函数
   - 如果看不到，说明 Vercel 没有识别到 API 文件

3. **查看 Function 日志**
   - 点击 `/api/notion` 函数
   - 查看 "Logs" 标签
   - 检查是否有错误信息

### 步骤 3: 手动触发重新部署

如果自动部署没有生效：

1. **在 Vercel Dashboard 中**
   - 进入项目 → Deployments
   - 点击最新的部署
   - 点击 "Redeploy" 按钮
   - 选择 "Use existing Build Cache" = **取消勾选**（强制重新构建）

2. **或者通过 Git 触发**
   ```bash
   # 创建一个空提交来触发重新部署
   git commit --allow-empty -m "触发 Vercel 重新部署"
   git push origin main
   ```

### 步骤 4: 检查环境变量

1. **进入环境变量设置**
   - Vercel Dashboard → 项目 → Settings → Environment Variables

2. **确认以下变量已配置**：
   - `NOTION_API_KEY` = 你的 Notion API 密钥
   - `DATABASE_ID` 或 `NOTION_DATABASE_ID` = 你的数据库 ID

3. **重新部署**
   - 配置环境变量后，必须重新部署才能生效

### 步骤 5: 清除浏览器缓存

1. **硬刷新页面**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **清除缓存**
   - 打开开发者工具 (F12)
   - 右键点击刷新按钮
   - 选择 "清空缓存并硬性重新加载"

### 步骤 6: 直接测试 API 端点

在浏览器中直接访问：
```
https://你的域名.vercel.app/api/notion
```

**期望结果**：
```json
{
  "status": "success",
  "data": [...]
}
```

**如果仍然返回源代码**：
- 检查 Vercel Dashboard → Functions → `/api/notion` 是否存在
- 如果不存在，说明 Vercel 没有识别到文件
- 检查 GitHub 仓库，确认 `api/notion.js` 在根目录

## 🔍 诊断命令

在本地运行以下命令，确认文件结构：

```bash
cd /Users/arui/Desktop/VideoHub_Project

# 检查文件结构
ls -la api/
# 应该只看到 notion.js

# 检查文件位置
pwd
# 应该显示项目根目录路径

# 检查 vercel.json
cat vercel.json
# 应该显示 rewrites 配置
```

## 📝 当前配置总结

| 项目 | 状态 | 位置 |
|------|------|------|
| API 文件 | ✅ | `/api/notion.js` |
| 文件格式 | ✅ | JavaScript (.js) |
| 文件位置 | ✅ | 根目录（与 package.json 同级）|
| 旧文件 | ✅ | `api/notion.ts` 已删除 |
| Vercel 配置 | ✅ | `vercel.json` 已配置 |

## ⚠️ 如果问题仍然存在

1. **检查 GitHub 仓库**
   - 访问你的 GitHub 仓库
   - 确认 `api/notion.js` 文件存在
   - 确认文件在根目录（不在 `src/` 里）

2. **检查 Vercel 项目设置**
   - Vercel Dashboard → 项目 → Settings → General
   - 确认 "Root Directory" 设置为项目根目录（通常是 `/`）

3. **联系 Vercel 支持**
   - 如果以上步骤都正确但问题仍然存在
   - 可能是 Vercel 平台的问题
   - 可以在 Vercel Dashboard 中提交支持请求

## 🎯 快速检查清单

- [ ] Vercel 部署状态为 "Ready" ✅
- [ ] Functions 页面能看到 `/api/notion`
- [ ] 环境变量已配置（`NOTION_API_KEY`, `DATABASE_ID`）
- [ ] GitHub 仓库中 `api/notion.js` 在根目录
- [ ] 浏览器已清除缓存
- [ ] 直接访问 `/api/notion` 返回 JSON 而不是源代码

如果所有项目都 ✅，但问题仍然存在，请检查 Vercel 的 Function 日志获取详细错误信息。
