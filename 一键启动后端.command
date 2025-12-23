#!/bin/bash

# 切换到项目目录
cd "$(dirname "$0")"

echo "🚀 正在启动 VideoHub 后端服务..."
echo ""

# 检查并关闭旧进程
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  检测到端口 8000 已被占用，正在关闭旧进程..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动后端服务
echo "📡 启动后端服务..."
echo "📍 服务地址: http://localhost:8000"
echo ""
echo "⚠️  请保持此窗口打开，关闭窗口会停止后端服务"
echo ""

python3 main.py
