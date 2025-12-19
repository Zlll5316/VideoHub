import { motion } from 'framer-motion';
import { Video } from '../types';

interface FreshDropsProps {
  videos: Video[];
}

export default function FreshDrops({ videos }: FreshDropsProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Fresh Drops</h2>
        <span className="px-3 py-1.5 bg-red-600/30 text-red-200 rounded-full text-xs font-semibold border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)] backdrop-blur-sm">
          🔴 New
        </span>
        <span className="text-base text-slate-400 font-light">竞品速递 · 近 24 小时</span>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-72 group cursor-pointer"
          >
            <div className="premium-card overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={video.coverUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x450/1e293b/64748b?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Source Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${
                  video.sourceType === 'competitor'
                    ? 'bg-red-600/40 text-red-200 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-blue-600/40 text-blue-200 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                }`}>
                  {video.sourceType === 'competitor' ? '竞品' : '参考'}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-light">
                  <span>{video.author}</span>
                  <span className="text-slate-500">·</span>
                  <span>{video.stats.views.toLocaleString()} 次观看</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
