import { Play, Clock } from 'lucide-react';
// 1. 引入跳转钩子
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';

interface FreshDropsProps {
  videos: Video[];
}

// 格式化时长（秒转分钟:秒）
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function FreshDrops({ videos }: FreshDropsProps) {
  // 2. 初始化跳转函数
  const navigate = useNavigate();

  if (!videos || videos.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Fresh Drops <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full">New</span>
        </h2>
        <span className="text-gray-500 text-sm">只展示最近 24 小时</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => {
          const cover = video.coverUrl || '';
          
          return (
            <div 
              key={video.id} 
              // 3. 核心修改：添加点击事件，跳转到详情页
              onClick={() => navigate(`/video/${video.id}`)}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition cursor-pointer"
            >
              {/* 封面图 */}
              <div className="aspect-video bg-gray-800 relative overflow-hidden">
                {cover ? (
                  <img src={cover} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">No Cover</div>
                )}
                
                {/* 悬停播放按钮 */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-[2px]">
                   <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                      <Play className="w-4 h-4 fill-current" />
                   </div>
                </div>
                
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono border border-white/10">
                    {video.sourceUrl?.includes('youtube') ? 'YouTube' : 'Video'}
                </div>
              </div>

              {/* 信息 */}
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-2 leading-relaxed group-hover:text-blue-400 transition">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                     {video.stats?.views ? `${video.stats.views.toLocaleString()} 次观看` : '刚刚发布'}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                    <Clock className="w-3 h-3" /> {formatDuration(video.duration)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}