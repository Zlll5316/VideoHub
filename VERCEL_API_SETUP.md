# Vercel API 代理配置说明

## ✅ 已完成的修复

### 1. UI 白底问题修复
- ✅ 强制右侧边栏使用深色背景 `bg-[#0a0a0a]`
- ✅ 修复错误弹窗样式（透明磨砂红背景）
- ✅ 所有文本输入框强制深色背景
- ✅ 移除了所有 `dark:` 依赖，直接硬编码深色样式

### 2. CORS 问题修复
- ✅ 创建了 Vercel API 代理：`api/notion.ts`
- ✅ 前端自动检测环境，生产环境使用 `/api/notion`，开发环境使用本地后端

## 🔧 Vercel 环境变量配置

**重要**：部署到 Vercel 后，必须在 Vercel Dashboard 中配置以下环境变量：

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到你的 `VideoHub` 项目

2. **进入项目设置**
   - 点击项目 → Settings → Environment Variables

3. **添加以下环境变量**：
   ```
   NOTION_API_KEY=你的Notion API密钥
   DATABASE_ID=你的Notion数据库ID
   ```

4. **重新部署**
   - 配置环境变量后，需要重新部署才能生效
   - 在 Deployments 页面，点击最新的部署 → "Redeploy"

## 📋 API 代理工作原理

### 开发环境（localhost）
- 前端请求：`http://localhost:8000/fetch_video_list`
- 需要本地运行 `python main.py`

### 生产环境（Vercel）
- 前端请求：`/api/notion`
- Vercel serverless function 代理请求到 Notion API
- 自动处理 CORS，无需本地后端

## 🧪 测试步骤

1. **本地测试**：
   ```bash
   npm run dev
   # 确保 main.py 后端正在运行
   ```

2. **生产环境测试**：
   - 部署到 Vercel
   - 配置环境变量
   - 访问网站，检查：
     - ✅ 侧边栏是否为深色背景
     - ✅ 错误弹窗是否为深色样式
     - ✅ Notion 数据是否能正常加载

## 🐛 如果还有问题

1. **检查 Vercel 函数日志**：
   - Vercel Dashboard → 项目 → Functions
   - 查看 `/api/notion` 的日志

2. **检查环境变量**：
   - 确认 `NOTION_API_KEY` 和 `DATABASE_ID` 已正确配置
   - 确认已重新部署

3. **检查浏览器控制台**：
   - 查看是否有 CORS 错误
   - 查看网络请求是否成功
