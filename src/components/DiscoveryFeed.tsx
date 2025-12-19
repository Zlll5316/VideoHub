import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { Heart, Eye } from 'lucide-react';

interface DiscoveryFeedProps {
  videos: Video[];
}

export default function DiscoveryFeed({ videos }: DiscoveryFeedProps) {
  const navigate = useNavigate();

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">猜你喜欢</h2>
        <span className="text-base text-slate-400 font-light">发现更多灵感</span>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-6 break-inside-avoid group cursor-pointer"
            onClick={() => handleVideoClick(video.id)}
          >
            <div className="premium-card overflow-hidden">
              {/* Cover Image */}
              <div className="relative overflow-hidden">
                <img
                  src={video.coverUrl}
                  alt={video.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x450/1e293b/64748b?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Source Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${
                  video.sourceType === 'competitor'
                    ? 'bg-red-600/40 text-red-200 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-blue-600/40 text-blue-200 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                }`}>
                  {video.sourceType === 'competitor' ? '竞品' : '参考'}
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-4 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg glass-effect">
                    <Eye size={14} />
                    <span className="font-medium">{video.stats.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg glass-effect">
                    <Heart size={14} />
                    <span className="font-medium">{video.stats.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-purple-600/30 text-purple-200 rounded-md text-xs font-medium border border-purple-500/40 backdrop-blur-sm shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                    >
                      {tag}
                    </span>
                  ))}
                  {video.tags.length > 3 && (
                    <span className="px-2.5 py-1 text-slate-500 text-xs font-light">
                      +{video.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Author */}
                <div className="text-xs text-slate-400 font-light">
                  {video.author} · {new Date(video.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
