import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, FolderHeart } from 'lucide-react';
import { Trend } from '../types';

interface BentoGridProps {
  trends: Trend[];
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

export default function BentoGrid({ trends, onCollectClick, likedCount = 0, onFavoritesClick }: BentoGridProps) {
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
      {/* 趋势卡 - 占据 2 列 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card lg:col-span-2 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 backdrop-blur-sm">
            <TrendingUp className="text-purple-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">SaaS 视频流行趋势</h3>
        </div>
        <div className="space-y-3">
          {trends.slice(0, 3).map((trend, index) => (
            <motion.div 
              key={trend.id} 
              className="flex items-center justify-between p-4 rounded-lg glass-effect hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group"
              whileHover={{ x: 4, scale: 1.01 }}
              onClick={() => navigate('/trends')}
            >
              <div className="flex items-center gap-4">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index === 0 ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]' :
                  index === 1 ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]' :
                  'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                } group-hover:scale-110`}>
                  {trend.rank}
                </span>
                <span className="text-white font-medium text-base">{trend.name}</span>
              </div>
              <span className="text-sm text-slate-400 font-light">{trend.count} 个视频</span>
            </motion.div>
          ))}
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
