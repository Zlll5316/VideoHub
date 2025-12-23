import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, FolderOpen, FolderHeart, FolderGit2, Layout } from 'lucide-react';
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
    {
      id: 'saas',
      title: 'SaaS 界面灵感',
      icon: FolderHeart,
      color: 'text-blue-400',
      count: 128,
    },
    {
      id: '3d',
      title: '3D 动效参考',
      icon: FolderGit2,
      color: 'text-purple-400',
      count: 42,
    },
    {
      id: 'landing',
      title: '落地页设计',
      icon: Layout,
      color: 'text-emerald-400',
      count: 86,
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
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 backdrop-blur-sm w-fit mb-4">
              <FolderOpen className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">我的收藏夹</h3>
            <p className="text-sm text-slate-400 font-light mb-6">常访问的资源分类</p>
          </div>
          
          {/* 收藏分类列表 */}
          <div className="space-y-2">
            {collections.map((collection, index) => {
              const Icon = collection.icon;
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (collection.id === 'favorites' && onFavoritesClick) {
                      onFavoritesClick();
                    } else {
                      navigate(`/folder/${collection.id}`);
                    }
                  }}
                >
                  <Icon className={`${collection.color} flex-shrink-0`} size={18} />
                  <span className="flex-1 text-sm font-medium text-slate-200">
                    {collection.title}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                    {collection.count} items
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
