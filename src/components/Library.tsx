import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCategory, VideoType, Video } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Clock, Timer } from 'lucide-react';
import youtubeData from '../assets/youtube_data.json';

// TypeScript 类型定义
interface YouTubeVideo {
  videoName: string;
  videoSource: string;
  coverImage: string;
  id: string;
  duration: number;
  tags: string[];
}

interface CollectionTask {
  id: string;
  url: string;
  title: string;
  coverUrl?: string;
  thumbnail?: string;
  duration?: number;
  tags?: string[];
  status: 'processing' | 'completed' | 'failed';
  date: string;
}

// 统一数据获取函数：和 Collection.tsx 保持一致
const getVideoData = (): CollectionTask[] => {
  try {
    const saved = localStorage.getItem('my_video_tasks');
    const savedTasks = saved ? (JSON.parse(saved) as CollectionTask[]) : [];
    
    // 从 JSON 文件获取最新数据
    const youtubeVideos = youtubeData as YouTubeVideo[];
    const jsonTasks: CollectionTask[] = youtubeVideos.map((video) => ({
      id: video.id,
      url: video.videoSource,
      title: video.videoName,
      coverUrl: video.coverImage,
      thumbnail: video.coverImage,
      duration: video.duration,
      tags: video.tags,
      status: 'completed' as const,
      date: new Date().toLocaleString()
    }));
    
    // 对比数量：如果 JSON 数据更多，自动覆盖 localStorage
    if (jsonTasks.length > savedTasks.length) {
      console.log(`检测到新数据：JSON 有 ${jsonTasks.length} 个视频，localStorage 有 ${savedTasks.length} 个，自动更新...`);
      localStorage.setItem('my_video_tasks', JSON.stringify(jsonTasks));
      return jsonTasks;
    }
    
    // 如果 localStorage 有数据且数量不少于 JSON，使用 localStorage
    if (savedTasks.length > 0) {
      return savedTasks;
    }
    
    // 如果都没有，使用 JSON 数据
    return jsonTasks;
  } catch (e) {
    console.error('加载任务失败:', e);
    // 出错时回退到 JSON 数据
    const youtubeVideos = youtubeData as YouTubeVideo[];
    return youtubeVideos.map((video) => ({
      id: video.id,
      url: video.videoSource,
      title: video.videoName,
      coverUrl: video.coverImage,
      thumbnail: video.coverImage,
      duration: video.duration,
      tags: video.tags,
      status: 'completed' as const,
      date: new Date().toLocaleString()
    }));
  }
};

// 将 CollectionTask 转换为 Video 格式
const convertToVideo = (task: CollectionTask): Video => {
  // 根据标签推断 category
  const getCategory = (tags: string[]): Video['category'] => {
    const tagStr = tags.join(' ').toLowerCase();
    if (tagStr.includes('saas')) return 'saas';
    if (tagStr.includes('tech') || tagStr.includes('电子')) return 'consumer_tech';
    if (tagStr.includes('lifestyle') || tagStr.includes('家居')) return 'lifestyle';
    if (tagStr.includes('motion') || tagStr.includes('动画') || tagStr.includes('animation')) return 'motion_art';
    if (tagStr.includes('edu') || tagStr.includes('教育')) return 'children_edu';
    return 'saas'; // 默认
  };

  // 根据标题推断 type
  const getType = (title: string): Video['type'] => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('tutorial') || titleLower.includes('教程') || titleLower.includes('how to')) return 'tutorial';
    if (titleLower.includes('feature') || titleLower.includes('功能') || titleLower.includes('demo')) return 'feature_promo';
    return 'brand_promo'; // 默认
  };

  // 根据标签推断 sourceType
  const getSourceType = (tags: string[]): Video['sourceType'] => {
    const tagStr = tags.join(' ').toLowerCase();
    if (tagStr.includes('competitor') || tagStr.includes('竞品')) return 'competitor';
    return 'reference'; // 默认
  };

  return {
    id: task.id,
    title: task.title,
    coverUrl: task.coverUrl || task.thumbnail || '',
    videoUrl: task.url,
    sourceType: getSourceType(task.tags || []),
    category: getCategory(task.tags || []),
    type: getType(task.title),
    tags: task.tags || [],
    stats: {
      views: Math.floor(Math.random() * 200000) + 10000, // 模拟浏览量
      likes: Math.floor(Math.random() * 5000) + 500, // 模拟点赞数
    },
    analysis: {
      hexPalette: ['#8b5cf6', '#3b82f6', '#0f172a'], // 默认调色板
      scriptNotes: '',
      motionNotes: '',
    },
    createdAt: new Date(task.date),
    publishedAt: new Date(task.date),
    duration: task.duration,
    sourceUrl: task.url,
    isLocalFile: false,
  };
};

// 筛选器选项定义
const categoryOptions: { value: VideoCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'saas', label: 'SaaS' },
  { value: 'consumer_tech', label: '消费电子' },
  { value: 'lifestyle', label: '家居' },
  { value: 'motion_art', label: '动态设计' },
  { value: 'children_edu', label: '教育' },
];

const styleOptions: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '3d_render', label: '3D动效' },
  { value: 'ui_demo', label: '极简录屏' },
  { value: 'mixed_media', label: '实拍' },
  { value: '2d_mg', label: '2D动画' },
  { value: 'kinetic_typography', label: '文字动画' },
];

const typeOptions: { value: VideoType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'brand_promo', label: '品牌宣传片' },
  { value: 'feature_promo', label: '功能宣传片' },
  { value: 'tutorial', label: '教程' },
];

const tagOptions: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'BentoGrid', label: '#BentoGrid' },
  { value: '暗色模式', label: '#暗色模式' },
  { value: 'AI生成', label: '#AI生成' },
  { value: '微交互', label: '#微交互' },
  { value: 'Glassmorphism', label: '#Glassmorphism' },
  { value: '数据可视化', label: '#数据可视化' },
];

// 根据标签判断视觉技法
const getVideoStyle = (tags: string[]): string => {
  const tagStr = tags.join(' ').toLowerCase();
  if (tagStr.includes('2d') || tagStr.includes('mg') || tagStr.includes('扁平')) return '2d_mg';
  if (tagStr.includes('3d') || tagStr.includes('c4d') || tagStr.includes('渲染') || tagStr.includes('玻璃拟态') || tagStr.includes('animation')) return '3d_render';
  if (tagStr.includes('ui') || tagStr.includes('交互')) return 'ui_demo';
  if (tagStr.includes('文字') || tagStr.includes('typography')) return 'kinetic_typography';
  if (tagStr.includes('实拍') || tagStr.includes('混合')) return 'mixed_media';
  return 'all';
};

type SortType = 'popular' | 'newest' | 'duration';

export default function Library() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<VideoType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [sortType, setSortType] = useState<SortType>('popular');
  const [videos, setVideos] = useState<Video[]>([]);

  // 从 URL 参数读取 liked 状态
  useEffect(() => {
    const likedParam = searchParams.get('liked');
    if (likedParam === 'true') {
      setShowLikedOnly(true);
    }
  }, [searchParams]);

  // 加载真实数据
  useEffect(() => {
    const tasks = getVideoData();
    const convertedVideos = tasks
      .filter(task => task.status === 'completed') // 只显示已完成的任务
      .map(convertToVideo);
    
    // 读取收藏状态
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    const likedVideoIds = new Set(likedVideos.map((id: string) => String(id)));
    
    // 标记已收藏的视频
    convertedVideos.forEach(video => {
      video.isLiked = likedVideoIds.has(String(video.id));
    });
    
    setVideos(convertedVideos);
  }, []);

  // 筛选和排序逻辑
  const filteredVideos = useMemo(() => {
    // 先筛选
    let allVideos = videos.filter((video) => {
      const categoryMatch = selectedCategory === 'all' || video.category === selectedCategory;
      const typeMatch = selectedType === 'all' || video.type === selectedType;
      const styleMatch = selectedStyle === 'all' || getVideoStyle(video.tags) === selectedStyle;
      const tagMatch = selectedTag === 'all' || video.tags.some(tag => 
        tag.toLowerCase().includes(selectedTag.toLowerCase()) || 
        tag.includes(selectedTag)
      );
      const likedMatch = !showLikedOnly || video.isLiked === true;
      
      return categoryMatch && typeMatch && styleMatch && tagMatch && likedMatch;
    });

    // 再排序
    const sortedVideos = [...allVideos].sort((a, b) => {
      switch (sortType) {
        case 'popular':
          // 按 views 从高到低
          return (b.stats.views || 0) - (a.stats.views || 0);
        case 'newest':
          // 按 publishedAt 从近到远
          const dateA = a.publishedAt?.getTime() || a.createdAt.getTime();
          const dateB = b.publishedAt?.getTime() || b.createdAt.getTime();
          return dateB - dateA;
        case 'duration':
          // 按 duration 从长到短
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });
    
    return sortedVideos;
  }, [videos, selectedCategory, selectedStyle, selectedType, selectedTag, showLikedOnly, sortType]);

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  创意情报库
                </h1>
                <p className="text-lg text-slate-400 font-light">
                  通过风格与技法，发现设计灵感 · 共 <span className="text-purple-400 font-semibold">{videos.length}</span> 个视频
                </p>
              </div>
              {/* 我喜欢的开关 */}
              <motion.button
                onClick={() => setShowLikedOnly(!showLikedOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showLikedOnly
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">❤️</span>
                <span className="text-sm">只看喜欢 (My Likes)</span>
              </motion.button>
            </div>
          </div>

          {/* 复合筛选器 */}
          <div className="mb-12 space-y-6">
            {/* 维度一：赛道 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                赛道
              </h3>
              <div className="flex flex-wrap gap-3">
                {categoryOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedCategory(option.value as VideoCategory | 'all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === option.value
                        ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                        : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 维度二：风格 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                风格
              </h3>
              <div className="flex flex-wrap gap-3">
                {styleOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedStyle(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedStyle === option.value
                        ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                        : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 维度三：类型 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                类型
              </h3>
              <div className="flex flex-wrap gap-3">
                {typeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedType(option.value as VideoType | 'all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedType === option.value
                        ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                        : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 维度四：热门标签 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                热门标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedTag(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                      selectedTag === option.value
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] border-purple-500/50'
                        : 'bg-slate-800/30 text-slate-300 border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 工具栏：结果数量 + 排序切换器 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-slate-400">
              共找到 <span className="text-white font-semibold">{filteredVideos.length}</span> 个灵感
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setSortType('popular')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortType === 'popular'
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame size={16} />
                综合热度
              </motion.button>
              <motion.button
                onClick={() => setSortType('newest')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortType === 'newest'
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock size={16} />
                最新发布
              </motion.button>
              <motion.button
                onClick={() => setSortType('duration')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortType === 'duration'
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Timer size={16} />
                视频时长
              </motion.button>
            </div>
          </div>

          {/* 瀑布流布局 */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="mb-6 break-inside-avoid group cursor-pointer"
                >
                  <div 
                    className="premium-card overflow-hidden"
                    onClick={() => handleVideoClick(video.id)}
                  >
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
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 leading-snug">
                        {video.title}
                      </h3>
                      
                      {/* Stats - 点赞数/浏览量 */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="text-purple-400">❤️</span>
                          <span>{video.stats.likes.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-blue-400">👁️</span>
                          <span>{video.stats.views.toLocaleString()}</span>
                        </span>
                      </div>

                      {/* Tags - 优先显示技术向标签 */}
                      <div className="flex flex-wrap gap-2">
                        {video.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-purple-600/30 text-purple-200 rounded-md text-xs font-medium border border-purple-500/40 backdrop-blur-sm shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 2 && (
                          <span className="px-2.5 py-1 text-slate-500 text-xs font-light">
                            +{video.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 空状态 */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">没有找到匹配的视频</p>
              <p className="text-slate-500 text-sm mt-2">请尝试调整筛选条件</p>
            </div>
          )}
        </div>
    </div>
  );
}
