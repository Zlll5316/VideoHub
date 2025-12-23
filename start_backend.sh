#!/bin/bash

# 后端服务启动脚本

echo "🚀 正在启动 VideoHub 后端服务..."
echo ""

# 检查端口是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 8000 已被占用，正在尝试关闭..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动后端服务
echo "📡 启动后端服务 (http://localhost:8000)..."
echo ""

python3 main.py
