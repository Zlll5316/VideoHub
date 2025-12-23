# VideoHub Project

一个专业的视频灵感管理与分析平台，支持视频采集、AI 分析、团队协作等功能。

## ✨ 功能特性

- 🎬 **视频采集**: 支持 YouTube 链接快速采集，自动提取元数据和颜色
- 🤖 **AI 分析**: 使用真实 AI（Gemini/OpenAI）分析视频视觉风格、动效节奏、脚本结构
- 🎨 **颜色提取**: 从视频封面真实提取配色方案
- 📚 **智能库**: 多维度筛选、排序、瀑布流展示
- 👥 **团队协作**: 团队空间、成员管理、共享资源
- 🔍 **全局搜索**: 快速查找视频和内容

## 🚀 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，填入你的配置
   ```

3. **启动前端**
   ```bash
   npm run dev
   # 访问 http://localhost:5173
   ```

4. **启动后端**
   ```bash
   python main.py
   # 后端运行在 http://localhost:8000
   ```

### 构建生产版本

```bash
npm run build
# 构建后的文件在 dist/ 目录
```

## 📦 部署

详细部署指南请查看 [DEPLOY.md](./DEPLOY.md)

### 快速部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 快速部署到 Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

## 🔧 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Python + FastAPI + Uvicorn
- **数据库**: Supabase (PostgreSQL)
- **AI 分析**: Google Gemini API / OpenAI API
- **动画**: Framer Motion
- **图标**: Lucide React

## 📝 环境变量

创建 `.env` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-key

# 后端 API 地址（部署后改为实际的后端 URL）
VITE_API_URL=http://localhost:8000
```

## 🎨 设计规范

- **主题**: 沉浸式深色模式
- **背景色**: slate-950
- **主色调**: 霓虹紫 (#8b5cf6) + 电光蓝 (#3b82f6)
- **风格**: 磨砂玻璃、发光边框、平滑动画

## 📁 项目结构

```
VideoHub_Project/
├── src/                    # 前端代码
│   ├── components/        # React 组件
│   ├── lib/               # 工具库（Supabase 等）
│   ├── assets/            # 静态资源
│   └── types/             # TypeScript 类型
├── main.py                # 后端 FastAPI 服务
├── requirements.txt       # Python 依赖
├── dist/                  # 构建输出（运行 npm run build 后）
└── DEPLOY.md              # 部署指南
```

## 🔑 API 配置

### Gemini API（主要）
- 在 `main.py` 中配置 `API_KEY`
- 如果配额用完，会自动切换到 OpenAI

### OpenAI API（备选）
- 设置环境变量：`export OPENAI_API_KEY='你的Key'`
- 新用户有 $5 免费额度，无需信用卡

## 📄 许可证

MIT
