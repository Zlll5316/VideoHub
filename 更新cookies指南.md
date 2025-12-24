# 🍪 更新 cookies.txt 完整指南（究极方案）

## 为什么需要更新 cookies.txt？

YouTube 会定期检测和封禁自动化请求。当出现"YouTube 拦截"时，通常是因为 cookies 过期了。

## 📋 方法一：使用 Chrome 扩展（推荐，最简单）

### 步骤：

1. **安装扩展**
   - 打开 Chrome 浏览器
   - 访问：https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc
   - 点击"添加至 Chrome"

2. **导出 cookies**
   - 访问 https://www.youtube.com
   - **确保已登录你的 YouTube 账号**
   - 点击扩展图标
   - 选择 "youtube.com"
   - 点击 "Export" 或 "导出"
   - 保存为 `cookies.txt`

3. **替换文件**
   - 将下载的 `cookies.txt` 复制到项目根目录
   - 替换旧的 `cookies.txt` 文件

## 📋 方法二：使用 Firefox 扩展

1. 安装扩展：https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/
2. 访问 YouTube 并登录
3. 点击扩展图标导出
4. 保存到项目根目录

## 📋 方法三：手动导出（高级）

如果你熟悉浏览器开发者工具：

1. 打开 Chrome 开发者工具（F12）
2. 切换到 Application 标签
3. 左侧选择 Cookies → https://www.youtube.com
4. 手动复制所有 cookies 并转换为 Netscape 格式

## ⚠️ 重要提示

1. **必须登录**：导出 cookies 时，确保已登录 YouTube 账号
2. **定期更新**：建议每周更新一次 cookies.txt
3. **文件位置**：确保 `cookies.txt` 在项目根目录 `/Users/arui/Desktop/VideoHub_Project/`
4. **文件格式**：必须是 Netscape cookie 格式

## 🔍 验证 cookies.txt 是否有效

运行后端后，查看终端日志：
- ✅ 看到 "🍪 发现 cookies.txt，正在启用伪装模式..." = cookies 文件存在
- ✅ 视频分析成功 = cookies 有效
- ❌ 仍然被拦截 = cookies 已过期，需要更新

## 💡 如果还是被拦截

1. **等待 10-15 分钟**：可能是请求频率过高
2. **更换网络**：尝试使用不同的网络环境
3. **检查 cookies 格式**：确保是 Netscape 格式
4. **使用 VPN**：如果 IP 被完全封禁
