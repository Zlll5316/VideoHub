import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Link as LinkIcon, Heart, LayoutList, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import localJsonData from '../assets/youtube_data.json'; 

export default function Collection() {
  const navigate = useNavigate();
  const [localInput, setLocalInput] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  // 新增：当前激活的 Tab ('all' | 'liked')
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');

  // 初始化数据
  useEffect(() => {
    // 1. 加载任务列表
    const localStoreData = localStorage.getItem('tasks');
    let allTasks: any[] = [];
    if (localStoreData) {
      try { allTasks = JSON.parse(localStoreData); } catch (e) {}
    }
    if (localJsonData && Array.isArray(localJsonData)) {
        const existingIds = new Set(allTasks.map(t => String(t.id)));
        const newItems = localJsonData.filter((item: any) => !existingIds.has(String(item.id)));
        allTasks = [...allTasks, ...newItems];
    }
    // 简单去重
    const uniqueTasks = Array.from(new Map(allTasks.map(item => [item.id, item])).values());
    setTasks(uniqueTasks);

    // 2. 加载收藏状态
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
        setLikedIds(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  // 切换收藏
  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发卡片跳转
    const newLikedIds = new Set(likedIds);
    if (newLikedIds.has(String(id))) {
        newLikedIds.delete(String(id));
    } else {
        newLikedIds.add(String(id));
    }
    setLikedIds(newLikedIds);
    localStorage.setItem('likedVideos', JSON.stringify(Array.from(newLikedIds)));
  };

  // 添加任务 (逻辑保持不变)
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addNewTask = (url: string) => {
    const videoId = getYouTubeId(url);
    if (!videoId) { alert("链接格式错误"); return; }
    if (tasks.some(t => String(t.id) === String(videoId))) { alert("已存在"); setLocalInput(''); return; }

    const coverImg = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const newTask = {
        id: videoId,
        title: url,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        cover: coverImg,
        coverUrl: coverImg,
        collectedAt: new Date().toLocaleString(),
        duration: '00:00',
        tags: ['手动采集'],
        status: 'pending'
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setLocalInput('');
  };

  const handleManualSubmit = () => {
    if (localInput.trim()) addNewTask(localInput.trim());
  };

  // 根据 Tab 筛选显示的数据
  const displayTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => likedIds.has(String(t.id)));

  return (
    <div className="flex-1 overflow-y-auto bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 头部标题区 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">采集任务队列</h2>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-400">
              {tasks.length}
            </span>
          </div>
          <button 
             onClick={() => { localStorage.removeItem('tasks'); window.location.reload(); }}
             className="text-xs text-red-500 hover:text-red-400 underline"
          >
             清除手动数据
          </button>
        </div>

        {/* 输入框 */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 mb-6 flex gap-3 shadow-lg shadow-purple-900/5 transition-all focus-within:border-purple-500/50 focus-within:bg-gray-900/50">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="粘贴 YouTube 链接 (例如 https://www.youtube.com/watch?v=...)"
              className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-sm text-white focus:ring-0 placeholder-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
          </div>
          <button 
              onClick={handleManualSubmit}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
              <Plus className="w-4 h-4" /> 采集
          </button>
        </div>

        {/* 新增：Tab 切换栏 */}
        <div className="flex items-center gap-2 mb-6">
            <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
                <LayoutList className="w-4 h-4" /> 全部任务
            </button>
            <button 
                onClick={() => setActiveTab('liked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'liked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
                <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'fill-current' : ''}`} /> 我的收藏
            </button>
        </div>

        {/* 列表区域 */}
        <div className="space-y-3">
        {displayTasks.length === 0 ? (
            <div className="text-center py-20 text-gray-600 bg-gray-900/20 rounded-xl border border-dashed border-gray-800">
                <p>列表为空</p>
            </div>
        ) : (
            displayTasks.map((task: any) => {
            const cover = task.coverUrl || task.coverImage || task.thumbnail || task.cover;
            const isLiked = likedIds.has(String(task.id));
            
            return (
                <div 
                key={task.id} 
                className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 p-3 rounded-xl flex items-center gap-4 group hover:border-gray-700 hover:bg-gray-900/60 transition-all duration-200"
                >
                {/* 封面 */}
                <div 
                    className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden relative shrink-0 cursor-pointer shadow-lg"
                    onClick={() => navigate(`/video/${task.id}`)}
                >
                    {cover ? (
                        <img src={cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Cover</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition">
                        <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition scale-90 group-hover:scale-100 drop-shadow-lg" />
                    </div>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                    <h3 
                        className="font-bold text-sm mb-1 truncate cursor-pointer hover:text-purple-400 transition"
                        onClick={() => navigate(`/video/${task.id}`)}
                    >
                        {task.title || task.videoName || task.url}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> 已采集</span>
                        <span>{task.collectedAt?.split(' ')[0] || '刚刚'}</span>
                    </div>

                    <div className="flex gap-2">
                        {task.tags?.slice(0,3).map((tag:string, i:number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded border border-gray-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 操作栏 (关键修改) */}
                <div className="flex gap-2 px-2 border-l border-gray-800/50 pl-4">
                    {/* 收藏按钮 */}
                    <button 
                        onClick={(e) => toggleLike(task.id, e)}
                        className={`p-2 rounded-lg transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-gray-600 hover:text-red-400 hover:bg-gray-800'}`}
                        title={isLiked ? "取消收藏" : "加入收藏"}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* 删除按钮 */}
                    <button 
                        className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 transition"
                        title="删除任务"
                        onClick={() => {
                            const newTasks = tasks.filter(t => t.id !== task.id);
                            setTasks(newTasks);
                            localStorage.setItem('tasks', JSON.stringify(newTasks));
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                </div>
            );
            })
        )}
        </div>
      </div>
    </div>
  );
}