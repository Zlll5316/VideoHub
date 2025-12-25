import os
import time
import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ==========================================
# 🚨 配置区域
# ==========================================
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
DATABASE_ID = os.getenv("DATABASE_ID", "2d3e8a9a934180f08bf0f20a67aa1c62")

MY_PROXIES = {
    "http": "http://10.20.160.120:8118",
    "https": "http://10.20.160.120:8118"
}
os.environ["http_proxy"] = MY_PROXIES["http"]
os.environ["https_proxy"] = MY_PROXIES["https"]

CACHE_DURATION = 1  
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

class VideoRequest(BaseModel):
    url: str

# 辅助解析器 (用于标签、公司等)
def get_prop_values(prop_data):
    if not prop_data: return []
    p_type = prop_data.get("type")
    
    if p_type == "multi_select":
        return [t['name'] for t in prop_data.get("multi_select", [])]
    elif p_type == "select":
        select_obj = prop_data.get("select")
        return [select_obj['name']] if select_obj else []
    elif p_type == "rich_text":
        # 对于公司/产品，如果用逗号分隔，这里负责拆分
        text_list = prop_data.get("rich_text", [])
        if text_list:
            raw_text = "".join([t.get("plain_text", "") for t in text_list]) # 先拼起来
            if "," in raw_text: return [t.strip() for t in raw_text.split(",")]
            return [raw_text] if raw_text else []
    elif p_type == "title":
        text_list = prop_data.get("title", [])
        return [text_list[0].get("plain_text")] if text_list else []
    return []

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

@app.get("/fetch_video_list")
async def fetch_notion_data():
    print(f"\n🔍 [读取] 开始连接 Notion...")
    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    
    try:
        response = requests.post(url, headers=NOTION_HEADERS, proxies=MY_PROXIES, timeout=30)
        if response.status_code != 200:
            return {"status": "error", "message": "API error"}

        data = response.json()
        results = data.get("results", [])
        print(f"✅ 成功读取到 {len(results)} 条数据")

        clean_videos = []
        for page in results:
            props = page.get("properties", {})
            
            # 1. 标题
            title_vals = get_prop_values(props.get("名称", {}))
            title = title_vals[0] if title_vals else "无标题"
            
            # 2. URL
            url_vals = props.get("URL", {}).get("url")
            video_url = url_vals if url_vals else ""
            
            # 3. 👇 【关键修复】视频分析：强行拼接所有碎片
            analysis = ""
            analysis_col = props.get("视频分析", {})
            if analysis_col.get("rich_text"):
                # 把 text_list 里的每一个片段都连起来，不管是换行还是加粗
                analysis = "".join([t.get("plain_text", "") for t in analysis_col["rich_text"]])
            if not analysis:
                analysis = "暂无分析内容"

            # 4. 封面
            cover_img = ""
            cover_data = page.get("cover", {})
            if cover_data:
                if cover_data['type'] == 'external': cover_img = cover_data['external']['url']
                elif cover_data['type'] == 'file': cover_img = cover_data['file']['url']
            if not cover_img and video_url:
                cover_img = get_youtube_thumbnail(video_url)
            if not cover_img:
                cover_img = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"

            # 5. 标签类字段
            company_tags = get_prop_values(props.get("公司/产品", {}))
            type_tags = get_prop_values(props.get("动画类型", {}))
            technique_tags = get_prop_values(props.get("表现手法", {}))
            feature_tags = get_prop_values(props.get("典型特征", {}))

            clean_videos.append({
                "id": page["id"],
                "title": title,
                "url": video_url,
                "analysis": analysis, # 现在这里是完整长文本了
                "cover": cover_img,
                "company": company_tags,
                "animationType": type_tags,
                "technique": technique_tags,
                "features": feature_tags
            })
        
        return {"status": "success", "data": clean_videos}

    except Exception as e:
        print(f"❌ 报错: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/add_video")
async def add_video(video: VideoRequest):
    print(f"\n📥 [写入] 收到新视频请求: {video.url}")
    thumbnail = get_youtube_thumbnail(video.url)
    if not thumbnail:
        thumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"

    new_page_data = {
        "parent": {"database_id": DATABASE_ID},
        "properties": {
            "名称": {"title": [{"text": {"content": "新采集视频 (请修改标题)"}}]},
            "URL": {"url": video.url},
            "视频分析": {"rich_text": [{"text": {"content": "等待分析..."}}]}
        },
        "cover": {"type": "external", "external": {"url": thumbnail}}
    }
    
    try:
        response = requests.post("https://api.notion.com/v1/pages", headers=NOTION_HEADERS, json=new_page_data, proxies=MY_PROXIES, timeout=30)
        if response.status_code == 200:
            global_cache["data"] = [] # 清空缓存
            return {"status": "success"}
        else:
            raise HTTPException(status_code=500, detail=f"Notion Error: {response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    os.system("lsof -ti:8000 | xargs kill -9") 
    uvicorn.run(app, host="0.0.0.0", port=8000)