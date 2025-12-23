#!/bin/bash
# VideoHub 快速部署脚本

echo "🚀 开始部署 VideoHub 项目..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在从 env.example 创建..."
    cp env.example .env
    echo "✅ 请编辑 .env 文件，填入你的配置"
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建前端
echo "🔨 构建生产版本..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件在 dist/ 目录"
    echo ""
    echo "🌐 部署选项："
    echo "1. Vercel: vercel"
    echo "2. Netlify: netlify deploy --prod --dir=dist"
    echo "3. GitHub Pages: 查看 DEPLOY.md"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
