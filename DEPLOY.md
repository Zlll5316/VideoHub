# 🚀 VideoHub 项目部署指南

## 📋 部署前准备

### 1. 环境变量配置

创建 `.env` 文件（前端）和配置后端环境变量：

#### 前端环境变量（`.env`）
```bash
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_KEY=你的Supabase公开密钥
```

#### 后端环境变量（`main.py` 中配置）
- `API_KEY`: Gemini API Key（可选，如果配额用完）
- `OPENAI_API_KEY`: OpenAI API Key（可选，作为备选）
- `PROXY_URL`: 代理地址（如果需要）

### 2. 构建生产版本

```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 构建后的文件在 dist/ 目录
```

## 🌐 部署选项

### 方案 A: Vercel 部署（推荐，最简单）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署前端**
   ```bash
   cd /Users/arui/Desktop/VideoHub_Project
   vercel
   ```

3. **配置环境变量**
   - 在 Vercel 项目设置中添加：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_KEY`

4. **后端部署**
   - 后端需要单独部署到支持 Python 的服务器
   - 推荐使用：Railway、Render、Fly.io 等

### 方案 B: Netlify 部署

1. **安装 Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **部署**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **配置环境变量**（在 Netlify 控制台）

### 方案 C: GitHub Pages 部署

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **修改 package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://你的用户名.github.io/VideoHub_Project"
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

### 方案 D: 传统服务器部署

1. **上传文件**
   ```bash
   # 将 dist/ 目录上传到服务器
   scp -r dist/* user@your-server.com:/var/www/html/
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 🔧 后端服务部署

### 使用 Railway（推荐）

1. 访问 https://railway.app
2. 创建新项目，选择 "Deploy from GitHub repo"
3. 添加环境变量：
   - `API_KEY` (Gemini API Key)
   - `OPENAI_API_KEY` (可选)
   - `PROXY_URL` (如果需要)
4. Railway 会自动部署并提供一个公共 URL

### 使用 Render

1. 访问 https://render.com
2. 创建新的 "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Build Command: `pip install -r requirements.txt` (需要创建 requirements.txt)
   - Start Command: `python main.py`
5. 添加环境变量

### 使用 Fly.io

1. 安装 Fly CLI
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. 初始化
   ```bash
   fly launch
   ```

3. 部署
   ```bash
   fly deploy
   ```

## 📝 创建 requirements.txt

创建 `requirements.txt` 文件：

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
youtube-transcript-api==0.6.1
google-generativeai==0.3.2
requests==2.31.0
```

## 🔗 前后端连接配置

部署后，需要在环境变量中配置后端 API 地址：

1. 在 `.env` 文件中添加：
   ```bash
   VITE_API_URL=https://your-backend-url.com
   ```
2. 重新构建前端：
   ```bash
   npm run build
   ```

**注意**：代码已自动支持环境变量配置，无需手动修改代码。

## ✅ 部署检查清单

- [ ] 前端构建成功（`npm run build`）
- [ ] 环境变量已配置
- [ ] 后端服务已部署并运行
- [ ] 前端可以访问后端 API
- [ ] Supabase 连接正常
- [ ] 所有功能测试通过

## 🐛 常见问题

### 1. 前端无法连接后端
- 检查后端服务是否运行
- 检查 CORS 配置
- 检查 API URL 是否正确

### 2. Supabase 连接失败
- 检查环境变量是否正确
- 检查 Supabase 项目是否激活

### 3. AI 分析不工作
- 检查 API Key 是否配置
- 检查配额是否用完
- 查看后端日志

## 📞 技术支持

如有问题，请查看：
- 后端日志：`/tmp/videohub_backend.log`
- 浏览器控制台错误信息
- 网络请求状态
