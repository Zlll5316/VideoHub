import { useState, useEffect } from 'react';
import { ArrowLeft, Play, ExternalLink, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import localJsonData from '../assets/youtube_data.json'; 

export default function Favorites() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // 1. 获取所有收藏的 ID
    const likedVideosStr = localStorage.getItem('likedVideos');
    const likedIds: string[] = likedVideosStr ? JSON.parse(likedVideosStr) : [];

    if (likedIds.length === 0) {
        setTasks([]);
        return;
    }

    // 2. 获取所有可用视频数据 (合并本地缓存的任务和 JSON 文件)
    let allSourceData: any[] = [];
    const localTaskData = localStorage.getItem('tasks');
    if (localTaskData) {
      try { allSourceData = JSON.parse(localTaskData); } catch (e) {}
    }
    if (localJsonData && Array.isArray(localJsonData)) {
        allSourceData = [...allSourceData, ...localJsonData];
    }

    // 3. 筛选去重
    const uniqueMap = new Map();
    allSourceData.forEach((item: any) => {
        if (likedIds.includes(String(item.id))) {
            uniqueMap.set(String(item.id), item);
        }
    });

    setTasks(Array.from(uniqueMap.values()));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" /> 
                我的收藏
            </h2>
            <p className="text-gray-400 text-sm mt-1">共收藏 {tasks.length} 个视频</p>
          </div>
        </div>

        {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                <Heart className="w-16 h-16 mb-4 opacity-20" />
                <p>暂无收藏视频</p>
                <button onClick={() => navigate('/')} className="mt-4 text-purple-400 hover:text-purple-300 text-sm">去发现视频</button>
            </div>
        ) : (
            <div className="space-y-3">
            {tasks.map((task: any) => {
            const cover = task.coverUrl || task.coverImage || task.thumbnail || task.cover || `https://img.youtube.com/vi/${task.id}/hqdefault.jpg`;
            return (
                <div key={task.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center gap-4 group hover:border-gray-700 transition">
                <div className="w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden relative shrink-0 cursor-pointer" onClick={() => navigate(`/video/${task.id}`)}>
                    <img src={cover} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${task.id}/hqdefault.jpg`} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition scale-90 group-hover:scale-100" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-2 truncate cursor-pointer hover:text-blue-400 transition" onClick={() => navigate(`/video/${task.id}`)}>{task.title || task.videoName}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{task.collectedAt || task.date || '未知时间'}</span>
                        <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3"/> {task.duration || '00:00'}</span>
                    </div>
                </div>
                <div className="px-4"><Heart className="w-5 h-5 text-red-500 fill-current" /></div>
                </div>
            );
            })}
            </div>
        )}
      </div>
    </div>
  );
}
