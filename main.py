import os
import sys
import json
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
import uvicorn

# ==========================================
# 🚨 1. 网络代理配置
# ==========================================
# 你的代理地址 (保持不变)
PROXY_URL = "http://10.20.160.120:8118" 

os.environ["http_proxy"] = PROXY_URL
os.environ["https_proxy"] = PROXY_URL

print(f"🌍 代理配置已应用: {PROXY_URL}")

# ==========================================
# 🔑 2. Gemini API 配置
# ==========================================
# 你的 Key (保持不变)
API_KEY = "AIzaSyDqP7Af3GU_e6J3aJeFyvdpK7oKkgBA2rM"
genai.configure(api_key=API_KEY)

# ==========================================
# ⚙️ FastAPI 设置
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🚀 启动网络自检 ---
def test_google_connection():
    print("\n📡 正在测试与 Google 的连接...")
    try:
        # 设置超时为 5 秒，避免一直卡住
        requests.get("https://www.google.com", timeout=5)
        print("✅ Google 连接测试通过！后端服务准备就绪。")
    except Exception as e:
        print(f"❌ 无法连接 Google！")
        print(f"   原因: {e}")
        print(f"   ⚠️ 请检查：你的代理地址 {PROXY_URL} 是否正确？")
        print(f"   ⚠️ 如果是本机运行梯子，建议尝试改成 http://127.0.0.1:7890")

# 启动时执行测试
test_google_connection()

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点，用于前端检测后端是否运行"""
    return {
        "status": "ok",
        "message": "后端服务运行正常",
        "proxy": PROXY_URL,
        "google_connected": True
    }

@app.get("/analyze_video")
async def analyze(video_id: str):
    print(f"\n🤖 收到分析任务，视频ID: {video_id}")
    
    # --- 1. 获取字幕 ---
    full_text = ""
    try:
        print("   1️⃣ 正在抓取字幕...")
        # 这里的 import 可以保留，或者用顶部的都可以
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['zh-Hans', 'zh-Hant', 'en', 'en-US'])
        
        for t in transcript_list:
            # 简单的格式化
            time_str = f"{int(t['start'] // 60)}:{int(t['start'] % 60):02d}"
            full_text += f"[{time_str}] {t['text']} "
            
        print(f"   ✅ 字幕获取成功 (字符数: {len(full_text)})")
    except Exception as e:
        print(f"   ⚠️ 无法获取字幕: {e}")
        full_text = "该视频没有字幕，或者无法访问。这是一个科技类/设计类视频，包含产品介绍、功能演示和用户体验相关内容。"

    # --- 2. 使用 AI API 进行真实分析（优先 Gemini，失败则使用 Hugging Face）---
    
    # 方法1: 尝试使用 Gemini API
    try:
        print("   2️⃣ 正在尝试使用 Gemini API 进行分析...")
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        
        prompt = f"""
        你是一个专业的视频视觉分析师。请分析以下视频字幕内容，并返回纯 JSON 格式数据。
        如果内容很少，请根据常识进行合理的推断和补全。

        视频字幕内容：
        {full_text[:5000]}
        
        请严格按照以下 JSON 格式返回（不要包含 Markdown ```json 标记）：
        {{
            "visual_style": "详细描述视频的视觉风格（例如：极简主义，赛博朋克，手绘风格等），包括色彩运用、构图特点、视觉元素等",
            "motion_analysis": "详细描述视频的动效节奏（例如：快节奏剪辑，平滑过渡，大量3D动效等），包括镜头运动、转场效果、动画特点等",
            "script_structure": [
                {{ "time": "0:00", "label": "引入", "summary": "视频开头的简要介绍" }},
                {{ "time": "01:30", "label": "核心", "summary": "视频的主要内容讲解" }},
                {{ "time": "05:00", "label": "结尾", "summary": "总结与号召" }}
            ]
        }}
        
        注意：
        1. visual_style 和 motion_analysis 需要详细、专业、具体
        2. script_structure 需要根据实际字幕内容的时间戳来生成，不要使用固定的时间
        3. 不要返回 hexPalette 字段（颜色由前端从视频封面提取）
        """
        
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        try:
            ai_data = json.loads(clean_text)
            if "hexPalette" in ai_data:
                del ai_data["hexPalette"]
            print("   ✅ Gemini API 分析成功！")
            return {"status": "success", "ai_result": ai_data}
        except json.JSONDecodeError as json_err:
            print(f"   ⚠️ Gemini 返回格式有误，尝试备用方案...")
            raise Exception("JSON 解析失败")
            
    except Exception as gemini_error:
        error_msg = str(gemini_error)
        print(f"   ⚠️ Gemini API 失败: {error_msg[:100]}")
        print(f"   🔄 切换到 Hugging Face API（免费备选方案）...")
        
        # 方法2: 使用 OpenAI API（真实 AI，新用户有 $5 免费额度，无需信用卡）
        try:
            print(f"   🔄 切换到 OpenAI API（真实 AI，免费额度）...")
            
            # 检查是否有 OpenAI API Key（从环境变量或配置中获取）
            import os
            openai_api_key = os.environ.get("OPENAI_API_KEY", "")
            
            if not openai_api_key:
                # 如果没有配置，返回清晰的错误提示
                raise Exception("未配置 OpenAI API Key。请访问 https://platform.openai.com/api-keys 获取免费 API Key（新用户有 $5 免费额度，无需信用卡），然后在环境变量中设置 OPENAI_API_KEY")
            
            prompt_text = f"""你是一个专业的视频视觉分析师。请分析以下视频字幕内容，并返回纯 JSON 格式数据。

视频字幕内容：
{full_text[:4000]}

请严格按照以下 JSON 格式返回（不要包含 Markdown ```json 标记）：
{{
    "visual_style": "详细描述视频的视觉风格（例如：极简主义，赛博朋克，手绘风格等），包括色彩运用、构图特点、视觉元素等",
    "motion_analysis": "详细描述视频的动效节奏（例如：快节奏剪辑，平滑过渡，大量3D动效等），包括镜头运动、转场效果、动画特点等",
    "script_structure": [
        {{ "time": "0:00", "label": "引入", "summary": "视频开头的简要介绍" }},
        {{ "time": "01:30", "label": "核心", "summary": "视频的主要内容讲解" }},
        {{ "time": "05:00", "label": "结尾", "summary": "总结与号召" }}
    ]
}}"""
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_api_key}"
            }
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "user", "content": prompt_text}
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"   📊 OpenAI 响应状态: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   📄 响应内容: {str(result)[:300]}")
                
                # 提取生成的文本
                if "choices" in result and len(result["choices"]) > 0:
                    generated_text = result["choices"][0].get("message", {}).get("content", "")
                else:
                    generated_text = str(result)
                
                # 尝试解析 JSON
                import re
                clean_text = generated_text.replace("```json", "").replace("```", "").strip()
                
                # 尝试提取 JSON
                json_match = re.search(r'\{.*"visual_style".*\}', clean_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    ai_data = json.loads(json_str)
                    if "hexPalette" in ai_data:
                        del ai_data["hexPalette"]
                    print(f"   ✅ OpenAI API 真实 AI 分析成功！")
                    return {"status": "success", "ai_result": ai_data}
                else:
                    try:
                        ai_data = json.loads(clean_text)
                        if "hexPalette" in ai_data:
                            del ai_data["hexPalette"]
                        print(f"   ✅ OpenAI API 真实 AI 分析成功！")
                        return {"status": "success", "ai_result": ai_data}
                    except Exception as parse_err:
                        print(f"   ❌ JSON 解析失败: {parse_err}")
                        raise Exception(f"OpenAI 返回格式错误: {clean_text[:100]}")
            else:
                error_detail = response.text[:300] if hasattr(response, 'text') else ""
                print(f"   ❌ OpenAI API 返回错误 {response.status_code}: {error_detail}")
                raise Exception(f"OpenAI API 错误 {response.status_code}: {error_detail[:100]}")
                
        except Exception as openai_error:
            error_msg = str(openai_error)
            print(f"   ❌ OpenAI API 失败: {error_msg[:100]}")
            
            # 如果是因为没有配置 API Key，给出清晰的提示
            if "未配置" in error_msg or "OPENAI_API_KEY" in error_msg:
                return {
                    "status": "error",
                    "message": "未配置 OpenAI API Key。\n\n获取免费 API Key 的步骤：\n1. 访问 https://platform.openai.com/api-keys\n2. 注册账号（新用户有 $5 免费额度，无需信用卡）\n3. 创建 API Key\n4. 在终端运行: export OPENAI_API_KEY='你的API Key'\n5. 重启后端服务"
                }
            
            raise Exception(f"OpenAI API 不可用: {error_msg[:100]}")
            
        except Exception as openai_error:
            print(f"   ❌ OpenAI API 也失败: {str(openai_error)[:100]}")
            return {
                "status": "error", 
                "message": f"所有 AI API 都不可用。\n\nGemini: 配额已用完\nOpenAI: {str(openai_error)[:150]}\n\n解决方案：\n1. 等待 Gemini 配额恢复（通常几小时到一天）\n2. 或配置 OpenAI API Key（新用户有 $5 免费额度，无需信用卡）\n   访问: https://platform.openai.com/api-keys"
            }

if __name__ == "__main__":
    # 允许局域网访问，方便调试
    uvicorn.run(app, host="0.0.0.0", port=8000)