import json
import yt_dlp

def scrape_youtube_data():
    # 这里定义我们要搜的词
    queries = [
        "SaaS explainer video animation",
        "App promo video motion graphics"
    ]
    
    all_videos = []
    
    # === 关键设置 ===
    # 如果你的代理端口不是 7890，请在这里修改 (比如改成 8118)
    # 根据你之前的截图，我们先试 7890
    proxy_url = 'http://10.44.254.143:8118'

    ydl_opts = {
        'skip_download': True,       # 不下载视频
        'ignoreerrors': True,        # 遇到错误继续
        'quiet': True,               # 少输出废话
        'no_warnings': True,
        'proxy': proxy_url,          # 使用代理
        'extract_flat': True,        # 快速抓取模式
    }

    print("🚀 开始抓取 YouTube 数据，请稍等...")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for query in queries:
            print(f"正在搜索关键词: {query} ...")
            try:
                # 搜前 20 个
                search_results = ydl.extract_info(f"ytsearch20:{query}", download=False)
                
                if 'entries' in search_results:
                    for entry in search_results['entries']:
                        if entry:
                            # 构造我们需要的数据格式
                            video_data = {
                                'videoName': entry.get('title'),
                                'videoSource': entry.get('url'),
                                # YouTube 封面图通常是这个格式
                                'coverImage': f"https://i.ytimg.com/vi/{entry.get('id')}/maxresdefault.jpg",
                                'id': entry.get('id'),
                                'duration': entry.get('duration'),
                                'tags': ['SaaS', 'YouTube', 'Animation']
                            }
                            all_videos.append(video_data)
                            print(f"✅ 抓取到: {video_data['videoName'][:20]}...")
            except Exception as e:
                print(f"❌ 搜索出错: {e}")

    # 保存文件
    output_file = 'youtube_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_videos, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 大功告成！共抓取 {len(all_videos)} 个视频。")
    print(f"数据已保存到当前目录下的: {output_file}")

if __name__ == "__main__":
    scrape_youtube_data()