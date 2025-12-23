import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, FolderHeart, Play } from 'lucide-react';
import { Video } from '../types';

interface BentoGridProps {
  recentVideos?: Video[]; // 最近采集的视频
  onCollectClick?: () => void;
  totalVideos?: number;
  likedCount?: number; // 收藏数量
  onFavoritesClick?: () => void; // 点击收藏夹的回调
}

interface CollectionItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  count: number;
}

export default function BentoGrid({ recentVideos = [], onCollectClick, likedCount = 0, onFavoritesClick }: BentoGridProps) {
  const navigate = useNavigate();

  const collections: CollectionItem[] = [
    {
      id: 'favorites',
      title: '我的收藏',
      icon: FolderHeart,
      color: 'text-red-400',
      count: likedCount,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* 最近采集卡 - 占据 2 列 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card lg:col-span-2 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 backdrop-blur-sm">
              <Clock className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">最近采集</h3>
          </div>
          {recentVideos.length > 3 && (
            <button
              onClick={() => navigate('/library')}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看全部 →
            </button>
          )}
        </div>
        <div className="space-y-3">
          {recentVideos.length > 0 ? (
            recentVideos.slice(0, 3).map((video, index) => (
              <motion.div 
                key={video.id} 
                className="flex items-center gap-4 p-4 rounded-lg glass-effect hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ x: 4, scale: 1.01 }}
                onClick={() => navigate(`/video/${video.id}`)}
              >
                {/* 封面缩略图 */}
                <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                  <img 
                    src={video.coverUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/160x90/1e293b/64748b?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* 视频信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {video.duration && (
                      <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toFixed(0).padStart(2, '0')}</span>
                    )}
                    {video.tags && video.tags.length > 0 && (
                      <span className="text-purple-400">#{video.tags[0].replace('#', '')}</span>
                    )}
                  </div>
                </div>
                
                {/* 箭头指示 */}
                <div className="text-slate-500 group-hover:text-purple-400 transition-colors">
                  →
                </div>
              </motion.div>
            ))
          ) : (
            // 空状态：显示提示信息
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-2">还没有采集任何视频</p>
              <button
                onClick={onCollectClick}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                点击开始采集 →
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 采集卡 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card-glow p-8 cursor-pointer"
        onClick={onCollectClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.5)] backdrop-blur-sm">
            <Plus className="text-purple-400" size={36} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">极速采集</h3>
            <p className="text-sm text-slate-400 font-light">粘贴链接，一键入库</p>
          </div>
        </div>
      </motion.div>

      {/* 收藏夹卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card p-8"
      >
        <div className="flex flex-col h-full justify-center">
          <div className="text-center mb-6">
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 to-pink-600/20 border border-red-500/30 backdrop-blur-sm w-fit mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <FolderHeart className="text-red-400" size={32} />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">我的收藏</h3>
            <p className="text-sm text-slate-400 font-light">
              {likedCount > 0 ? `已收藏 ${likedCount} 个视频` : '还没有收藏任何视频'}
            </p>
          </div>
          
          {/* 收藏按钮 - 大按钮样式 */}
          {collections.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => {
                if (collections[0].id === 'favorites' && onFavoritesClick) {
                  onFavoritesClick();
                } else {
                  navigate(`/folder/${collections[0].id}`);
                }
              }}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <FolderHeart className="text-red-400 group-hover:text-red-300 transition-colors" size={20} />
                  <span className="text-base font-semibold text-white">
                    {collections[0].title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                    {collections[0].count}
                  </span>
                  <motion.div
                    className="text-slate-400 group-hover:text-red-400 transition-colors"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
              {/* 悬停时的光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity" />
            </motion.button>
          )}
          
          {/* 空状态提示 */}
          {likedCount === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-slate-500 mt-4"
            >
              在视频详情页点击 ❤️ 开始收藏
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
