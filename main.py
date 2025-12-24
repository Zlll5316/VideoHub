import os
import time
import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ==========================================
# 🚨 配置区域 (从环境变量读取，不要硬编码密钥)
# ==========================================
# 从环境变量读取 Notion API Key（在本地开发时设置环境变量）
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
if not NOTION_API_KEY:
    print("⚠️ 警告: NOTION_API_KEY 未设置，请设置环境变量")
DATABASE_ID = os.getenv("DATABASE_ID", "2d3e8a9a934180f08bf0f20a67aa1c62")

MY_PROXIES = {
    "http": "http://10.20.160.120:8118",
    "https": "http://10.20.160.120:8118"
}
os.environ["http_proxy"] = MY_PROXIES["http"]
os.environ["https_proxy"] = MY_PROXIES["https"]

CACHE_DURATION = 300  
# ==========================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

global_cache = {"data": [], "last_updated": 0}

def get_youtube_thumbnail(url):
    try:
        video_id = ""
        if "youtu.be" in url:
            video_id = url.split("/")[-1].split("?")[0]
        elif "v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        if video_id:
            return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    except:
        pass
    return ""

# 🛠️ 辅助函数：通用标签解析 (支持 Multi-select 和 Select)
def parse_multi_select(prop_data):
    if not prop_data: return []
    # 如果是多选 (Multi-select)
    if prop_data.get("type") == "multi_select":
        return [t['name'] for t in prop_data.get("multi_select", [])]
    # 如果是单选 (Select)
    elif prop_data.get("type") == "select":
        select_obj = prop_data.get("select")
        return [select_obj['name']] if select_obj else []
    return []

@app.get("/fetch_video_list")
async def fetch_notion_data():
    current_time = time.time()
    
    if current_time - global_cache["last_updated"] < CACHE_DURATION and global_cache["data"]:
        print(f"🚀 [高速] 使用本地缓存")
        return {"status": "success", "data": global_cache["data"]}

    print(f"\n🔄 [加载中] 正在连接 Notion (ID: {DATABASE_ID})...")
    print(f"🔑 使用 Token: {NOTION_API_KEY[:10]}...") 

    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    
    try:
        response = requests.post(url, headers=NOTION_HEADERS, proxies=MY_PROXIES, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ 读取失败 (代码 {response.status_code}): {response.text}")
            return {"status": "error", "message": f"API token is invalid or network error."}

        data = response.json()
        results = data.get("results", [])
        print(f"✅ 成功读取到 {len(results)} 条数据，正在分类解析...")

        clean_videos = []
        for page in results:
            props = page.get("properties", {})
            
            # 1. 基础信息
            title = "无标题"
            name_col = props.get("名称", {})
            if name_col.get("title"):
                title = name_col["title"][0].get("plain_text", "无标题")

            video_url = ""
            url_col = props.get("URL", {})
            if url_col.get("url"): video_url = url_col["url"]
            elif url_col.get("rich_text") and len(url_col["rich_text"]) > 0:
                video_url = url_col["rich_text"][0].get("plain_text", "")

            analysis = "暂无分析内容"
            analysis_col = props.get("视频分析", {})
            if analysis_col.get("rich_text"):
                analysis = "".join([t.get("plain_text", "") for t in analysis_col["rich_text"]])

            # 2. 👇 核心修改：读取4个独立的分类列
            # 注意：这里会尝试兼容 单选(Select) 和 多选(Multi-select)
            company_tags = parse_multi_select(props.get("公司", {}))
            type_tags = parse_multi_select(props.get("动画类型", {}))
            technique_tags = parse_multi_select(props.get("表现手法", {}))
            feature_tags = parse_multi_select(props.get("典型特征", {}))

            # 3. 封面处理
            cover_img = ""
            cover_data = page.get("cover", {})
            if cover_data:
                if cover_data['type'] == 'external': cover_img = cover_data['external']['url']
                elif cover_data['type'] == 'file': cover_img = cover_data['file']['url']
            
            if not cover_img and video_url:
                cover_img = get_youtube_thumbnail(video_url)
            if not cover_img:
                cover_img = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"

            clean_videos.append({
                "id": page["id"],
                "title": title,
                "url": video_url,
                "analysis": analysis,
                "cover": cover_img,
                # 👇 将4个分类分别传给前端
                "company": company_tags,
                "animationType": type_tags,
                "technique": technique_tags,
                "features": feature_tags
            })

        global_cache["data"] = clean_videos
        global_cache["last_updated"] = current_time
        
        return {"status": "success", "data": clean_videos}

    except Exception as e:
        print(f"❌ 代码报错: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/health")
def health_check(): return {"status": "ok"}

if __name__ == "__main__":
    os.system("lsof -ti:8000 | xargs kill -9") 
    uvicorn.run(app, host="0.0.0.0", port=8000)