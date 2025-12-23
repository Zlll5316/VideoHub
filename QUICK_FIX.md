# 🚨 API 快速修复指南

## 问题：分析API和更新API返回404错误

### ✅ 已确认
- 后端服务正在运行（端口8000）
- 健康检查端点正常：`/health` ✅

### 🔧 快速修复步骤

#### 1. 重启后端服务（推荐）

```bash
# 方法1：使用启动脚本
./start_backend.sh

# 方法2：手动启动
# 先关闭旧进程
lsof -ti:8000 | xargs kill -9

# 再启动
python3 main.py
```

#### 2. 测试API端点

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试获取最新视频
curl http://localhost:8000/fetch_latest_videos

# 测试分析视频（替换VIDEO_ID）
curl "http://localhost:8000/analyze_video?video_id=ZK-rNEhJIDs"
```

#### 3. 使用测试脚本

```bash
python3 test_api.py
```

#### 4. 检查前端API地址

确保前端使用的API地址正确：
- 默认：`http://localhost:8000`
- 可通过环境变量 `VITE_API_URL` 修改

检查 `.env` 文件（如果存在）：
```bash
VITE_API_URL=http://localhost:8000
```

**重要**：修改 `.env` 后需要重启前端开发服务器！

#### 5. 清除浏览器缓存

有时浏览器缓存会导致问题：
- 按 `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows) 强制刷新
- 或使用无痕模式测试

### 📋 常见问题

#### Q: 后端启动后立即退出？
A: 检查是否有语法错误或依赖缺失：
```bash
python3 -m py_compile main.py  # 检查语法
pip3 install -r requirements.txt  # 安装依赖
```

#### Q: 端口8000被占用？
A: 关闭占用端口的进程：
```bash
lsof -ti:8000 | xargs kill -9
```

#### Q: 代理连接失败？
A: 检查 `main.py` 中的 `PROXY_URL` 是否正确：
```python
PROXY_URL = "http://10.20.160.120:8118"  # 确认这个地址可用
```

#### Q: 前端显示404但后端正常？
A: 可能是路由问题，检查：
1. 后端日志中是否有请求记录
2. 前端请求的URL是否正确
3. 浏览器控制台的完整错误信息

### 🔍 调试技巧

#### 查看后端日志
后端会打印所有请求的详细信息，包括：
- 收到的请求
- API调用状态
- 错误信息

#### 查看浏览器控制台
1. 打开开发者工具（F12）
2. 切换到 "Network" 标签
3. 尝试调用API
4. 查看请求的详细信息

#### 使用测试工具
运行 `test_api.py` 可以快速诊断问题：
```bash
python3 test_api.py
```

### 📞 如果还是不行

请提供以下信息：
1. 后端终端的完整日志
2. 浏览器控制台的错误信息
3. 运行 `test_api.py` 的输出
4. 你的操作系统和Python版本
