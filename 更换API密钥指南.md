# 🔑 更换 Gemini API Key 指南

## ⚠️ 当前问题

你的 API Key 已被 Google 标记为泄露，无法继续使用。

错误信息：`403 Your API key was reported as leaked. Please use another API key.`

## ✅ 解决步骤

### 1. 获取新的 API Key

1. 访问：https://aistudio.google.com/app/apikey
2. 登录你的 Google 账号
3. 如果旧 Key 还在，先删除它
4. 点击 "Create API Key" 创建新 Key
5. 复制新的 API Key

### 2. 更新代码中的 API Key

打开 `main.py` 文件，找到第 24 行：

```python
API_KEY = "AIzaSyDqP7Af3GU_e6J3aJeFyvdpK7oKkgBA2rM"  # 旧 Key（已泄露）
```

替换为：

```python
API_KEY = "你的新API Key"  # 新 Key
```

### 3. 重启后端服务

```bash
# 关闭旧进程
lsof -ti:8000 | xargs kill -9

# 启动新服务
python3 main.py
```

或者使用启动脚本：
```bash
./一键启动后端.command
```

## 🔒 安全提示

1. **不要分享 API Key**：
   - 不要将 API Key 提交到公开的 GitHub 仓库
   - 不要在聊天、论坛等公开场合分享
   - 不要截图包含 API Key 的代码

2. **使用环境变量**（推荐）：
   可以改为从环境变量读取，而不是硬编码：
   ```python
   import os
   API_KEY = os.environ.get("GEMINI_API_KEY", "默认值")
   ```
   
   然后在启动时设置：
   ```bash
   export GEMINI_API_KEY="你的新Key"
   python3 main.py
   ```

3. **添加到 .gitignore**：
   如果使用 `.env` 文件存储 Key，确保 `.gitignore` 包含：
   ```
   .env
   *.key
   ```

## ✅ 验证新 Key

更新后，可以运行测试脚本验证：

```bash
python3 test_api.py
```

或者直接测试：

```bash
python3 -c "
import google.generativeai as genai
genai.configure(api_key='你的新Key')
models = genai.list_models()
print(f'✅ 新 Key 有效！可以访问 {len(list(models))} 个模型')
"
```

## 📝 快速操作

1. 访问：https://aistudio.google.com/app/apikey
2. 创建新 Key
3. 编辑 `main.py` 第 24 行，替换 API_KEY
4. 重启后端：`./一键启动后端.command`
5. 完成！
