# Vercel API 路由修复指南

## ✅ 已完成的修复

### 1. 文件结构验证
- ✅ `api/notion.ts` 位于项目根目录 `/api/notion.ts`
- ✅ 不在 `src/` 目录下
- ✅ `.vercelignore` 未忽略 `api/` 目录

### 2. Vercel 配置优化
已更新 `vercel.json`：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. 依赖检查
- ✅ `@vercel/node` 已安装在 `devDependencies` 中

## 🔍 如果问题仍然存在

### 检查 Vercel 部署日志

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到你的项目

2. **查看部署日志**
   - 进入项目 → Deployments
   - 点击最新的部署
   - 查看 "Build Logs" 和 "Function Logs"

3. **检查 Function 日志**
   - 进入项目 → Functions
   - 查看 `/api/notion` 的执行日志
   - 确认是否有编译错误

### 可能的问题和解决方案

#### 问题 1: Vercel 没有识别 TypeScript 文件
**解决方案**: 确保 `@vercel/node` 在 `dependencies` 而不是 `devDependencies`

如果问题持续，可以尝试：
```bash
npm install @vercel/node --save
```

#### 问题 2: 环境变量未配置
**检查**: Vercel Dashboard → Settings → Environment Variables
- `NOTION_API_KEY`
- `DATABASE_ID`

#### 问题 3: 构建配置冲突
如果问题持续，可以尝试移除 `vercel.json` 中的 `buildCommand` 和 `outputDirectory`，让 Vercel 自动检测：
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🧪 测试步骤

1. **重新部署**
   - 在 Vercel Dashboard 中点击 "Redeploy"
   - 或推送新的 commit 触发自动部署

2. **测试 API**
   - 在浏览器中访问: `https://你的域名.vercel.app/api/notion`
   - 应该返回 JSON: `{"status":"success","data":[...]}`
   - 不应该返回 HTML 或 TypeScript 源代码

3. **检查前端**
   - 打开网站
   - 打开浏览器开发者工具 (F12)
   - 查看 Network 标签
   - 检查 `/api/notion` 请求的响应

## 📝 当前配置总结

- **API 文件位置**: `/api/notion.ts` ✅
- **Vercel 配置**: `vercel.json` 已配置 rewrites ✅
- **依赖**: `@vercel/node` 已安装 ✅
- **文件结构**: 正确 ✅

如果所有配置都正确但问题仍然存在，请检查 Vercel 的部署日志和函数执行日志。
