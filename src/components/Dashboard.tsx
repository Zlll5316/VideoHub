import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BentoGrid from './BentoGrid';
import DiscoveryFeed from './DiscoveryFeed';
import AddVideoModal from './AddVideoModal';
import youtubeData from '../assets/youtube_data.json';
import { Video, Trend } from '../types';

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
    if (tagStr.includes('motion') || tagStr.includes('动画')) return 'motion_art';
    if (tagStr.includes('edu') || tagStr.includes('教育')) return 'children_edu';
    return 'saas'; // 默认
  };

  // 根据标题推断 type
  const getType = (title: string): Video['type'] => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('tutorial') || titleLower.includes('教程')) return 'tutorial';
    if (titleLower.includes('feature') || titleLower.includes('功能')) return 'feature_promo';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [likedCount, setLikedCount] = useState(0); // 收藏数量

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
    setLikedCount(likedVideoIds.size);

    // 生成趋势数据（基于标签统计）
    const tagCounts: Record<string, number> = {};
    convertedVideos.forEach(video => {
      video.tags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    });

    const trendsData: Trend[] = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        id: `trend-${index}`,
        name,
        count,
        rank: index + 1,
      }));

    setTrends(trendsData);
  }, []);

  const handleCollectClick = () => {
    // 打开采集弹窗
    setIsCollectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCollectModalOpen(false);
  };

  const handleSaveSuccess = () => {
    // 保存成功后刷新数据
    const tasks = getVideoData();
    const convertedVideos = tasks
      .filter(task => task.status === 'completed')
      .map(convertToVideo);
    setVideos(convertedVideos);
  };

  const handleQuickCollect = (url: string) => {
    // 快速采集：使用 window.location.href 强制跳转
    if (url && url.trim()) {
      window.location.href = '/collection?newUrl=' + encodeURIComponent(url.trim());
    } else {
      window.location.href = '/collection';
    }
  };

  // Discovery Feed: 显示所有视频（打乱顺序）
  const discoveryVideos = [...videos].sort(() => Math.random() - 0.5);

  return (
    <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              灵感监控中心
            </h1>
            <p className="text-lg text-slate-400 font-light">
              实时追踪竞品动态，发现设计灵感 · 已采集 <span className="text-purple-400 font-semibold">{videos.length}</span> 个视频
            </p>
          </div>

          {/* Bento Grid */}
          <BentoGrid 
            trends={trends} 
            onCollectClick={handleCollectClick}
            likedCount={likedCount}
            onFavoritesClick={() => navigate('/library?liked=true')}
          />

          {/* Discovery Feed */}
          {discoveryVideos.length > 0 && <DiscoveryFeed videos={discoveryVideos} />}
        </div>

        {/* 采集弹窗 */}
        <AddVideoModal
          isOpen={isCollectModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
          onQuickCollect={handleQuickCollect}
        />
    </div>
  );
}
