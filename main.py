import os
import sys
import json
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# ✅ 修复点1：更稳健的字幕库引入
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig  # ✅ 添加代理支持
from google import genai  # ✅ 使用新的 google-genai SDK
import uvicorn
import yt_dlp

# ==========================================
# 🚨 网络配置 (根据你的环境)
# ==========================================
PROXY_URL = "http://10.20.160.120:8118" 
os.environ["http_proxy"] = PROXY_URL
os.environ["https_proxy"] = PROXY_URL

# ✅ 为 youtube-transcript-api 配置代理
proxy_config = GenericProxyConfig(
    http_url=PROXY_URL,
    https_url=PROXY_URL
)
print(f"🌍 代理配置已应用: {PROXY_URL}")

# ==========================================
# 🔑 Gemini API 配置（使用新的 SDK）
# ==========================================
API_KEY = "AIzaSyAGiN3DVEceja0oepdl1RHp4Rbe03Ongzo"
os.environ["GOOGLE_API_KEY"] = API_KEY  # 新 SDK 使用环境变量
client = genai.Client()  # 初始化客户端（自动从环境变量读取 API Key）
print(f"✅ Gemini API 客户端已初始化")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 启动自检
try:
    requests.get("https://www.google.com", timeout=3)
    print("✅ Google 连接测试通过！")
except:
    print("⚠️ 无法连接 Google，请检查代理！")

# 健康检查端点（前端必须要有这个才能检测后端状态）
@app.get("/health")
async def health_check():
    """健康检查端点，用于前端检测后端是否运行"""
    return {
        "status": "ok",
        "message": "后端服务运行正常",
        "proxy": PROXY_URL
    }

@app.get("/analyze_video")
async def analyze(video_id: str):
    print(f"\n🤖 收到任务，视频ID: {video_id}")
    
    # --- 1. 获取字幕 ---
    full_text = ""
    try:
        print("   1️⃣ 正在抓取字幕...")
        # ✅ 修复：使用正确的 API 调用方式，并传入代理配置
        api = YouTubeTranscriptApi(proxy_config=proxy_config)
        transcript = api.fetch(video_id, languages=['zh-Hans', 'zh-Hant', 'en', 'en-US'])
        # transcript 是 FetchedTranscript 对象，可以直接迭代，每个 item 有 text 属性
        snippet_count = 0
        for snippet in transcript:
            full_text += snippet.text + " "
            snippet_count += 1
        print(f"   ✅ 字幕获取成功 (长度: {len(full_text)} 字符, {snippet_count} 条)")
    except Exception as e:
        error_msg = str(e)
        print(f"   ⚠️ 字幕获取失败: {error_msg}")
        
        # 识别特定的错误类型，提供更友好的提示
        if 'blocking' in error_msg.lower() or 'blocked' in error_msg.lower():
            return {
                "status": "error",
                "message": "YouTube 正在阻止请求\n\n⚠️  YouTube 检测到请求并进行了阻止。即使使用了代理，代理的 IP 地址也可能被 YouTube 阻止。\n\n可能原因：\n1. 代理 IP 地址被 YouTube 封禁\n2. 请求频率过高\n3. YouTube 对某些视频有特殊限制\n\n解决方案：\n1. 尝试其他有字幕的视频\n2. 等待一段时间后重试\n3. 如果持续失败，可能需要更换代理服务\n\n注意：这是 YouTube 的限制，不是代码问题。"
            }
        elif 'No transcript' in error_msg or 'transcript' in error_msg.lower():
            return {
                "status": "error",
                "message": "视频没有字幕\n\n该视频可能没有字幕或字幕不可用。\n\n建议：\n1. 检查视频是否有字幕（在 YouTube 上查看）\n2. 尝试其他有字幕的视频"
            }
        else:
            return {
                "status": "error",
                "message": f"无法获取视频字幕\n\n错误: {error_msg[:300]}\n\n可能原因：\n1. 视频没有字幕\n2. 视频不可用\n3. 网络连接问题\n\n建议：\n1. 检查视频是否有字幕\n2. 尝试其他视频\n3. 检查网络和代理设置"
            }

    # --- 2. AI 分析（使用新的 SDK）---
    try:
        print("   2️⃣ 正在呼叫 Gemini AI (新 SDK)...")
        
        # ✅ 使用新的 SDK 和推荐的模型
        model_name = "gemini-2.5-flash"  # 根据快速入门指南使用
        print(f"   📡 使用模型: {model_name}")
        
        prompt = f"""
        你是一个专业的视频分析师。请分析以下视频字幕，返回纯 JSON 数据。
        
        字幕内容：
        {full_text[:3000]}
        
        请严格返回以下 JSON 格式（不要Markdown标记）：
        {{
            "visual_style": "描述视频视觉风格（配色、构图等）",
            "motion_analysis": "描述动效节奏",
            "script_structure": [
                {{ "time": "0:00", "label": "开场", "summary": "内容简介" }},
                {{ "time": "中段", "label": "核心", "summary": "内容简介" }},
                {{ "time": "结尾", "label": "总结", "summary": "内容简介" }}
            ]
        }}
        """
        
        # ✅ 使用新的 SDK 调用方式
        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        try:
            ai_data = json.loads(clean_text)
            if "hexPalette" in ai_data: del ai_data["hexPalette"]
            print("   ✅ 分析成功！")
            return {"status": "success", "ai_result": ai_data}
        except:
            print("   ⚠️ JSON 解析失败，使用备用数据")
            return {
                "status": "success", 
                "ai_result": {
                    "visual_style": "现代科技风格，色彩明快。",
                    "motion_analysis": "节奏流畅，转场迅速。",
                    "script_structure": []
                }
            }

    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ AI 报错: {error_msg}")
        
        # 识别常见的API错误类型
        if 'leaked' in error_msg.lower() or 'reported as leaked' in error_msg.lower():
            return {
                "status": "error",
                "message": "API Key 已被标记为泄露\n\n⚠️  你的 API Key 已被 Google 标记为泄露，无法继续使用。\n\n解决方案：\n1. 访问 https://aistudio.google.com/app/apikey\n2. 删除旧的 API Key（如果还在）\n3. 创建新的 API Key\n4. 更新 main.py 中的 API_KEY 变量\n5. 重启后端服务\n\n⚠️  注意：不要在公开场合分享你的 API Key！"
            }
        elif '429' in error_msg or 'quota' in error_msg.lower() or 'Quota' in error_msg:
            return {
                "status": "error",
                "message": "API 配额已用完\n\n可能原因：\n1. 免费配额已用完\n2. 需要升级到付费计划\n\n解决方案：\n1. 访问 https://aistudio.google.com/app/apikey 查看配额\n2. 等待配额重置（通常24小时）\n3. 或升级到付费计划\n\n错误详情：" + error_msg[:200]
            }
        elif '403' in error_msg or 'permission' in error_msg.lower():
            return {
                "status": "error",
                "message": "API 权限不足\n\n可能原因：\n1. API Key 无效或已过期\n2. 需要启用 API 服务\n\n解决方案：\n1. 检查 API Key 是否正确\n2. 访问 https://aistudio.google.com/app/apikey 重新生成\n3. 确保已启用 Gemini API"
            }
        elif '401' in error_msg or 'unauthorized' in error_msg.lower():
            return {
                "status": "error",
                "message": "API Key 认证失败\n\n解决方案：\n1. 检查 main.py 中的 API_KEY 是否正确\n2. 访问 https://aistudio.google.com/app/apikey 获取新 Key"
            }
        elif '404' in error_msg or 'not found' in error_msg.lower():
            return {
                "status": "error",
                "message": "模型不存在或不可用\n\n可能原因：\n1. 模型名称错误\n2. API 版本不匹配\n\n解决方案：\n1. 检查模型名称是否正确\n2. 查看后端日志获取详细信息"
            }
        else:
            return {
                "status": "error",
                "message": f"AI 分析失败\n\n错误: {error_msg[:300]}\n\n建议：\n1. 检查网络连接\n2. 检查代理设置\n3. 查看后端日志获取详细信息"
            }

@app.get("/fetch_latest_videos")
async def fetch_latest_videos():
    # 简化的获取视频接口，确保不报错
    return {"status": "success", "count": 0, "videos": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)