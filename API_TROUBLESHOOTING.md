# API 连接问题排查指南

## 🔍 快速诊断步骤

### 1. 检查后端服务是否运行

在终端运行：
```bash
# 检查 8000 端口是否被占用
lsof -i :8000

# 或者
netstat -an | grep 8000
```

如果没有输出，说明后端没有运行。启动后端：
```bash
cd /Users/arui/Desktop/VideoHub_Project
python main.py
```

你应该看到类似这样的输出：
```
🌍 代理配置已应用: http://10.20.160.120:8118
📡 正在测试与 Google 的连接...
✅ Google 连接测试通过！后端服务准备就绪。
INFO:     Started server process [xxxxx]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. 测试后端健康检查端点

在浏览器中打开：
```
http://localhost:8000/health
```

或者用 curl：
```bash
curl http://localhost:8000/health
```

如果返回 JSON 数据，说明后端正常运行。

### 3. 检查前端 API URL 配置

前端默认使用 `http://localhost:8000`，但可以通过环境变量覆盖。

**创建或检查 `.env` 文件**（在项目根目录）：
```bash
# 如果后端在本地运行
VITE_API_URL=http://localhost:8000

# 如果后端部署在其他地方（例如 Railway、Render）
# VITE_API_URL=https://your-backend.railway.app
```

**重要**：修改 `.env` 后需要**重启前端开发服务器**！

### 4. 检查 CORS 配置

后端已经配置了 CORS，允许所有来源：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

如果还是遇到 CORS 错误，可能是浏览器缓存问题，尝试：
- 清除浏览器缓存
- 使用无痕模式
- 重启浏览器

### 5. 检查代理设置

后端需要代理才能访问 YouTube 和 Google API。

**当前代理配置**（在 `main.py` 第 16 行）：
```python
PROXY_URL = "http://10.20.160.120:8118"
```

**如果代理不可用**：
1. 检查代理服务器是否运行
2. 确认代理地址和端口是否正确
3. 如果使用本地代理（如 Clash），可能需要改成：
   ```python
   PROXY_URL = "http://127.0.0.1:7890"  # 或其他端口
   ```

### 6. 常见错误和解决方案

#### 错误：`Failed to fetch` 或 `Network Error`
- **原因**：后端服务未运行或无法访问
- **解决**：确保 `python main.py` 正在运行

#### 错误：`CORS policy` 相关
- **原因**：浏览器阻止跨域请求
- **解决**：检查后端 CORS 配置，清除浏览器缓存

#### 错误：`Connection refused`
- **原因**：端口 8000 被占用或后端未启动
- **解决**：
  ```bash
  # 杀死占用 8000 端口的进程
  lsof -ti:8000 | xargs kill -9
  
  # 重新启动后端
  python main.py
  ```

#### 错误：`Timeout` 或请求超时
- **原因**：代理连接失败或网络问题
- **解决**：检查代理设置，测试代理是否可用

### 7. 调试技巧

#### 在浏览器控制台查看请求
1. 打开浏览器开发者工具（F12）
2. 切换到 "Network" 标签
3. 尝试调用 API（例如点击"更新视频"按钮）
4. 查看请求的 URL、状态码和错误信息

#### 在后端查看日志
后端会打印详细的日志，包括：
- 收到的请求
- API 调用状态
- 错误信息

### 8. 测试 API 端点

#### 健康检查
```bash
curl http://localhost:8000/health
```

#### 获取最新视频（需要代理）
```bash
curl http://localhost:8000/fetch_latest_videos
```

#### 分析视频（需要代理和 API Key）
```bash
curl "http://localhost:8000/analyze_video?video_id=ZK-rNEhJIDs"
```

### 9. 如果还是不行

1. **检查防火墙**：确保 8000 端口没有被防火墙阻止
2. **检查 Python 版本**：确保使用 Python 3.8+
3. **检查依赖**：确保所有依赖已安装
   ```bash
   pip install -r requirements.txt
   ```
4. **查看完整错误信息**：检查浏览器控制台和后端终端的完整错误堆栈

### 10. 联系支持

如果以上步骤都无法解决问题，请提供：
- 浏览器控制台的完整错误信息
- 后端终端的完整日志
- 你的操作系统和 Python 版本
- 网络环境（是否使用代理、VPN 等）
