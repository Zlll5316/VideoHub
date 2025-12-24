# 🚀 部署到 Vercel 指南

## ✅ 代码已推送到 GitHub

代码已经成功推送到 GitHub 仓库：`https://github.com/Zlll5316/VideoHub.git`

## 📋 部署步骤

### 方法 1：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问：https://vercel.com/dashboard
   - 登录你的账号

2. **找到你的项目**
   - 在 Dashboard 中找到 `VideoHub` 项目
   - 或者访问：https://vercel.com/dashboard/[你的用户名]/VideoHub

3. **触发重新部署**
   - 点击项目进入详情页
   - 点击 **"Deployments"** 标签
   - 找到最新的部署记录
   - 点击右侧的 **"..."** 菜单
   - 选择 **"Redeploy"** 或 **"Redeploy with existing Build Cache"**

4. **等待部署完成**
   - 部署通常需要 1-3 分钟
   - 可以在部署页面查看实时日志

### 方法 2：通过 Vercel CLI

如果你已经安装了 Vercel CLI：

```bash
# 1. 登录 Vercel（如果还没登录）
vercel login

# 2. 部署到生产环境
vercel --prod

# 或者直接部署
cd /Users/arui/Desktop/VideoHub_Project
vercel --prod
```

### 方法 3：自动部署（如果已连接 GitHub）

如果 Vercel 已经连接到你的 GitHub 仓库，**推送代码后会自动触发部署**。

检查自动部署：
1. 访问 Vercel Dashboard
2. 进入项目设置
3. 查看 "Git" 设置，确认已连接到正确的 GitHub 仓库

## ⚙️ 环境变量配置

确保 Vercel 项目中配置了以下环境变量：

1. **打开 Vercel Dashboard**
   - 进入项目设置
   - 点击 **"Environment Variables"**

2. **添加/检查以下变量**：
   ```
   VITE_SUPABASE_URL=https://rgcnkyzpauiuipfrwpnm.supabase.co
   VITE_SUPABASE_KEY=你的Supabase Key
   VITE_API_URL=你的后端API地址（如果后端也部署了）
   ```

3. **重要**：修改环境变量后，需要**重新部署**才能生效

## 🔍 验证部署

部署完成后：

1. **访问网站**：https://video-hub-swart.vercel.app/
2. **检查功能**：
   - 登录功能
   - 团队空间
   - 文件夹创建/删除
   - 视频分享

## 🐛 如果部署失败

### 检查构建日志

1. 在 Vercel Dashboard 中查看部署日志
2. 检查是否有构建错误
3. 常见问题：
   - 环境变量缺失
   - 构建命令失败
   - 依赖安装失败

### 常见错误解决

**错误：环境变量未设置**
- 解决：在 Vercel Dashboard 中添加环境变量

**错误：构建失败**
- 解决：检查 `package.json` 中的构建脚本
- 确保 `npm run build` 能成功执行

**错误：路由404**
- 解决：检查 `vercel.json` 配置
- 确保 SPA 路由配置正确

## 📝 快速部署命令

如果使用 Vercel CLI，可以运行：

```bash
cd /Users/arui/Desktop/VideoHub_Project
vercel --prod
```

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已连接到 GitHub 仓库
- [ ] 环境变量已配置
- [ ] 构建命令正常（`npm run build`）
- [ ] 部署成功
- [ ] 网站功能正常

## 🆘 需要帮助？

如果遇到问题，请告诉我：
1. 部署日志中的错误信息
2. 具体的错误步骤
3. Vercel Dashboard 的截图
