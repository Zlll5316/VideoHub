import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Play, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. 引入

// ⚠️ 路径确保正确 (data 或 assets)
import localJsonData from '../assets/youtube_data.json'; 

export default function Collection() {
  const navigate = useNavigate(); // 2. 初始化
  const [localInput, setLocalInput] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  // 初始化数据
  useEffect(() => {
    const localStoreData = localStorage.getItem('tasks');
    let allTasks: any[] = [];
    if (localStoreData) {
      try { allTasks = JSON.parse(localStoreData); } catch (e) {}
    }
    // 合并 JSON 数据
    if (localJsonData && Array.isArray(localJsonData)) {
        // 简单去重合并
        const existingIds = new Set(allTasks.map(t => String(t.id)));
        const newItems = localJsonData.filter((item: any) => !existingIds.has(String(item.id)));
        allTasks = [...allTasks, ...newItems];
    }
    setTasks(allTasks);
  }, []);

  // 添加任务逻辑 (模拟)
  const addNewTask = (url: string) => {
    // 这里仅做演示，实际应调用后端接口
    alert(`添加采集任务: ${url}`);
  };

  const handleManualSubmit = () => {
    if (localInput.trim()) {
      addNewTask(localInput.trim());
      setLocalInput('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">采集任务队列</h2>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-400">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* 输入框 */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 mb-8 flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="在此处直接粘贴链接，按回车采集..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
          </div>
          <button 
              onClick={handleManualSubmit}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
              <Plus className="w-4 h-4" /> 采集
          </button>
        </div>

        {/* 列表 */}
        <div className="space-y-3">
        {tasks.map((task: any) => {
           const cover = task.coverImage || task.thumbnail || task.coverUrl;
           return (
            <div 
              key={task.id} 
              className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center gap-4 group hover:border-gray-700 transition"
            >
              {/* 3. 核心修改：点击封面跳转 */}
              <div 
                className="w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden relative shrink-0 cursor-pointer"
                onClick={() => navigate(`/video/${task.id}`)}
              >
                  {cover ? (
                     <img src={cover} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Cover</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                     <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition scale-90 group-hover:scale-100" />
                  </div>
              </div>

              <div className="flex-1 min-w-0">
                {/* 3. 核心修改：点击标题跳转 */}
                <h3 
                    className="font-bold text-base mb-2 truncate cursor-pointer hover:text-blue-400 transition"
                    onClick={() => navigate(`/video/${task.id}`)}
                >
                    {task.title || task.videoName}
                </h3>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                   <span>{task.collectedAt || '2025/12/22 19:09:53'}</span>
                   <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3"/> {task.duration || '00:00'}</span>
                </div>

                <div className="flex gap-2 mt-3">
                    {task.tags && Array.isArray(task.tags) && task.tags.slice(0,3).map((tag:string, i:number) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20">
                            {tag}
                        </span>
                    ))}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition px-2">
                <button className="p-2 hover:bg-gray-800 rounded text-gray-500 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                </button>
                <button 
                    className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition"
                    onClick={() => navigate(`/video/${task.id}`)}
                >
                     <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
           );
        })}
        </div>
      </div>
    </div>
  );
}