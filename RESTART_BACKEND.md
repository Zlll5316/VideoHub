# 🔄 重启后端服务（解决404错误）

## 问题原因
后端服务可能运行的是旧版本代码，导致 `/fetch_latest_videos` 路由未注册。

## ✅ 解决步骤

### 方法1：使用启动脚本（推荐）

```bash
cd /Users/arui/Desktop/VideoHub_Project
./start_backend.sh
```

### 方法2：手动重启

```bash
# 1. 关闭旧进程
lsof -ti:8000 | xargs kill -9

# 2. 等待2秒
sleep 2

# 3. 启动新服务
cd /Users/arui/Desktop/VideoHub_Project
python3 main.py
```

### 方法3：如果端口被占用

```bash
# 查看占用端口的进程
lsof -i :8000

# 强制关闭
kill -9 <PID>

# 然后重新启动
python3 main.py
```

## ✅ 验证修复

启动后，在**新的终端窗口**运行：

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试获取最新视频（应该不再返回404）
curl http://localhost:8000/fetch_latest_videos
```

如果 `/fetch_latest_videos` 返回 JSON 数据（而不是 `{"detail":"Not Found"}`），说明修复成功！

## 📝 预期输出

启动后端后，你应该看到：

```
🌍 代理配置已应用: http://10.20.160.120:8118
📡 正在测试与 Google 的连接...
✅ Google 连接测试通过！后端服务准备就绪。
INFO:     Started server process [xxxxx]
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## ⚠️ 注意事项

1. **保持后端运行**：后端服务需要一直运行，不要关闭终端窗口
2. **如果关闭了终端**：需要重新运行启动命令
3. **修改代码后**：需要重启后端服务才能生效
