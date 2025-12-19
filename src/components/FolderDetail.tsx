import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Folder as FolderIcon, MoreHorizontal } from 'lucide-react';

// Mock Data for folders (模拟数据)
const folderData: Record<string, { title: string; count: number }> = {
  'saas': { title: 'SaaS 界面灵感', count: 128 },
  '3d': { title: '3D 动效参考', count: 42 },
  'landing': { title: '落地页设计', count: 86 },
  'saas-inspiration': { title: 'SaaS 界面灵感', count: 128 },
  '3d-motion': { title: '3D 动效参考', count: 42 },
  'landing-pages': { title: '落地页设计', count: 86 },
  'startups': { title: 'Startups 案例', count: 64 },
  'e-commerce': { title: 'E-commerce 设计', count: 32 },
  'mobile-apps': { title: 'Mobile Apps', count: 56 },
  'brand-promo': { title: '品牌宣传片', count: 88 },
  'ui-interaction': { title: 'UI 交互演示', count: 72 },
  'q4-campaign': { title: 'Q4 大促', count: 128 },
  'competitor-ads': { title: '竞品广告', count: 64 },
  'ui-kit-2': { title: 'UI Kit 2.0', count: 32 },
  'memes': { title: 'Memes', count: 256 },
};

// Mock Video Data (复用一部分 Library 的数据)
const mockFolderVideos = [
  {
    id: 'f1',
    title: 'Linear 产品更新 - 极简设计',
    cover: 'https://cdn.dribbble.com/userupload/13264533/file/original-552788c3b83758655779472418616062.jpg?resize=1024x768',
    likes: '2.1k',
    views: '55k',
    tags: ['SaaS', '极简风格'],
    duration: '02:15',
    addedBy: 'Alex',
  },
  {
    id: 'f2',
    title: 'Notion AI 全新功能演示',
    cover: 'https://cdn.dribbble.com/userupload/13264532/file/original-34236386756842652648243843646678.png?resize=1024x768',
    likes: '3.2k',
    views: '128k',
    tags: ['SaaS', 'AI生成'],
    duration: '01:45',
    addedBy: 'Sarah',
  },
  {
    id: 'f3',
    title: 'Framer 交互原理演示',
    cover: 'https://cdn.dribbble.com/userupload/13264535/file/original-18368624872834284646423746636847.jpg?resize=1024x768',
    likes: '1.5k',
    views: '42k',
    tags: ['SaaS', '交互设计'],
    duration: '03:20',
    addedBy: 'Mike',
  },
  {
    id: 'f4',
    title: 'Stripe 支付流程演示',
    cover: 'https://cdn.dribbble.com/userupload/13264537/file/original-23868624872834284646423746636847.jpg?resize=1024x768',
    likes: '4.2k',
    views: '150k',
    tags: ['SaaS', '金融电子'],
    duration: '01:30',
    addedBy: 'Alex',
  },
  {
    id: 'f5',
    title: 'Raycast 快速启动器介绍',
    cover: 'https://cdn.dribbble.com/userupload/13264539/file/original-552788c3b83758655779472418616062.jpg?resize=1024x768',
    likes: '1.8k',
    views: '60k',
    tags: ['SaaS', '效率工具'],
    duration: '02:00',
    addedBy: 'Sarah',
  },
  {
    id: 'f6',
    title: 'Figma 2024 新功能预览',
    cover: 'https://cdn.dribbble.com/userupload/13264541/file/original-34236386756842652648243843646678.png?resize=1024x768',
    likes: '5.5k',
    views: '210k',
    tags: ['SaaS', '设计工具'],
    duration: '04:10',
    addedBy: 'Mike',
  },
];

const FolderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 获取当前文件夹信息，如果找不到则使用默认值
  const currentFolder = (id && folderData[id]) || { title: '未知文件夹', count: 0 };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FolderIcon size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentFolder.title}</h1>
                <p className="text-sm text-slate-400">{currentFolder.count} 个视频</p>
              </div>
            </div>
          </div>
          <motion.button
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal size={24} />
          </motion.button>
        </div>

        {/* 视频列表 (瀑布流) */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {mockFolderVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-6 break-inside-avoid group cursor-pointer"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="premium-card overflow-hidden">
                {/* Cover Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={video.cover}
                    alt={video.title}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/800x450/1e293b/64748b?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-snug">
                    {video.title}
                  </h4>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="text-purple-400">❤️</span>
                      <span>{video.likes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-blue-400">👁️</span>
                      <span>{video.views}</span>
                    </span>
                    <span className="text-slate-500">{video.duration}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-purple-600/30 text-purple-200 rounded-md text-xs font-medium border border-purple-500/40 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Added by Info */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                      {video.addedBy.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">由 {video.addedBy} 添加</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {mockFolderVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">该收藏夹暂无视频</p>
            <p className="text-slate-500 text-sm mt-2">请尝试添加更多内容</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDetail;
