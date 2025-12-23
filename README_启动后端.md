# 🚀 启动后端服务 - 超简单指南

## 方法1：双击启动（最简单）✨

1. 在 Finder 中找到项目文件夹
2. 双击 `一键启动后端.command` 文件
3. 等待看到 "✅ Google 连接测试通过！"
4. 保持窗口打开，然后刷新浏览器

## 方法2：使用终端

```bash
cd /Users/arui/Desktop/VideoHub_Project
python3 main.py
```

## ✅ 启动成功的标志

看到以下输出说明启动成功：

```
🌍 代理配置已应用: http://10.20.160.120:8118
✅ Google 连接测试通过！
INFO:     Started server process [xxxxx]
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 🔍 验证后端运行

打开浏览器访问：
```
http://localhost:8000/health
```

或者在新终端运行：
```bash
curl http://localhost:8000/health
```

应该返回：
```json
{"status":"ok","message":"后端服务运行正常","proxy":"http://10.20.160.120:8118"}
```

## ⚠️ 重要提示

1. **保持终端窗口打开**：关闭窗口会停止后端服务
2. **不要按 Ctrl+C**：除非你想停止服务
3. **修改代码后**：需要重启后端才能生效

## ❌ 常见问题

### 问题：端口被占用
```bash
lsof -ti:8000 | xargs kill -9
python3 main.py
```

### 问题：模块未找到
```bash
pip3 install -r requirements.txt
```

### 问题：权限错误
```bash
chmod +x 一键启动后端.command
```
