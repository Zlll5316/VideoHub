import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Heart } from 'lucide-react';
// 注意：请确认下面这个 json 的路径是否正确，如果红线报错，请修改路径指向你 src 下的 json 文件
import localJsonData from '../assets/youtube_data.json';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 获取所有数据源
    const localStoreData = localStorage.getItem('tasks');
    let allTasks = [];

    // 优先读取缓存
    if (localStoreData) {
      try {
        allTasks = JSON.parse(localStoreData);
      } catch (e) {
        console.error("读取缓存失败", e);
      }
    }

    // 如果缓存为空，或者找不到数据，把 JSON 数据合并进来兜底
    if (!allTasks || allTasks.length === 0) {
      allTasks = localJsonData;
    }

    console.log("🔍 正在查找 ID:", id);
    console.log("📦 当前数据总量:", allTasks.length);

    // 2. 核心修复：强制类型转换查找！
    // 不管 id 是数字还是字符串，统一转成 String 再对比
    const foundVideo = allTasks.find((item: any) => String(item.id) === String(id));

    if (foundVideo) {
      console.log("✅ 找到视频:", foundVideo.title || foundVideo.videoName);
      setVideo(foundVideo);
    } else {
      console.error("❌ 未找到视频，请检查 ID 是否匹配");
    }
    
    setLoading(false);
  }, [id]);

  if (loading) return <div className="p-8 text-white">加载中...</div>;

  if (!video) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">视频不存在 (ID: {id})</h2>
        <p className="text-gray-400 mb-8">请检查控制台(F12)查看详细调试日志</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          返回首页
        </button>
      </div>
    );
  }

  // 处理字段兼容性 (防止 JSON 和 接口定义字段名不一致)
  const title = video.title || video.videoName;
  const videoUrl = video.url || video.videoSource;
  // 处理 YouTube 嵌入链接
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const vId = url.split('v=')[1]?.split('&')[0];
    if (vId) return `https://www.youtube.com/embed/${vId}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </button>
        <div className="flex gap-3">
           <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><Heart className="w-5 h-5" /></button>
           <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：播放器 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
            <iframe 
              src={getEmbedUrl(videoUrl)} 
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {video.tags && video.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：信息栏 */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" /> 
              视频信息
            </h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>时长</span>
                <span className="text-white">{video.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>ID</span>
                <span className="text-white font-mono">{id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}