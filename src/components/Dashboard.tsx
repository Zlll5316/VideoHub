import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BentoGrid from './BentoGrid';
import DiscoveryFeed from './DiscoveryFeed';
import AddVideoModal from './AddVideoModal';
import youtubeData from '../assets/youtube_data.json';
import { Video } from '../types';

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
  const [recentVideos, setRecentVideos] = useState<Video[]>([]); // 最近采集的视频
  const [likedCount, setLikedCount] = useState(0); // 收藏数量
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 从 Notion 加载数据
  useEffect(() => {
    const loadFromNotion = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 开始从 Notion 加载数据...');
        const response = await fetch(`${API_URL}/fetch_video_list`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(60000) // 增加超时时间到60秒，Notion API 可能很慢
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Notion 返回结果:', result);
        
        if (result.status === 'success' && result.data) {
          console.log(`📦 Dashboard: Notion 返回 ${result.data.length} 条原始数据`);
          
          // 将 Notion 数据转换为 Video 格式
          // 🔥 临时修改：显示所有视频（包括没有URL的），确保有内容显示
          const notionVideos: Video[] = result.data
            .filter((item: any) => {
              // 至少要有标题
              return item && (item.title || item.id);
            })
            .map((item: any) => {
            // 从 URL 提取视频 ID（如果是 YouTube 链接）
            let videoId = item.id;
            if (item.url && item.url.includes('youtube.com/watch?v=')) {
              videoId = item.url.split('v=')[1]?.split('&')[0] || item.id;
            } else if (item.url && item.url.includes('youtu.be/')) {
              videoId = item.url.split('youtu.be/')[1]?.split('?')[0] || item.id;
            }
            
            // 根据标签推断 category
            const getCategory = (tags: string[]): Video['category'] => {
              const tagStr = tags.join(' ').toLowerCase();
              if (tagStr.includes('saas')) return 'saas';
              if (tagStr.includes('tech') || tagStr.includes('电子')) return 'consumer_tech';
              if (tagStr.includes('lifestyle') || tagStr.includes('家居')) return 'lifestyle';
              if (tagStr.includes('motion') || tagStr.includes('动画')) return 'motion_art';
              if (tagStr.includes('edu') || tagStr.includes('教育')) return 'children_edu';
              return 'saas';
            };
            
            // 根据标题推断 type
            const getType = (title: string): Video['type'] => {
              const titleLower = title.toLowerCase();
              if (titleLower.includes('tutorial') || titleLower.includes('教程')) return 'tutorial';
              if (titleLower.includes('feature') || titleLower.includes('功能')) return 'feature_promo';
              if (titleLower.includes('brand') || titleLower.includes('品牌')) return 'brand_promo';
              return 'feature_promo';
            };
            
            return {
              id: videoId,
              title: item.title,
              coverUrl: item.cover || '', // 后端已经从 URL 提取了封面
              videoUrl: item.url || '',
              sourceType: 'reference' as const,
              category: getCategory(item.tags || []),
              type: getType(item.title || ''),
              tags: item.tags || [],
              stats: {
                views: 0,
                likes: 0
              },
              analysis: {
                hexPalette: [],
                scriptNotes: '',
                motionNotes: ''
              },
              sourceUrl: item.url, // 原始 URL，用于嵌入播放
              publishDate: new Date(),
              isLiked: false,
              createdAt: new Date()
            };
          });
          
          // 读取收藏状态
          const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
          const likedVideoIds = new Set(likedVideos.map((id: string) => String(id)));
          
          // 标记已收藏的视频
          notionVideos.forEach(video => {
            video.isLiked = likedVideoIds.has(String(video.id));
          });
          
          console.log(`📊 Dashboard: 转换后得到 ${notionVideos.length} 个视频对象`);
          
          if (notionVideos.length === 0) {
            console.warn('⚠️ Dashboard: 转换后没有视频，原始数据:', result.data.slice(0, 3));
          }
          
          setVideos(notionVideos);
          setLikedCount(likedVideoIds.size);
          
          // 获取最近采集的视频（取前5个）
          setRecentVideos(notionVideos.slice(0, 5));
          console.log(`✅ Dashboard: 成功加载 ${notionVideos.length} 个视频（来自 Notion）`);
        } else {
          console.warn('⚠️ Dashboard: Notion 返回数据格式错误');
          // 🔥 关键修改：不再回退到本地数据，只显示空列表
          setVideos([]);
          setRecentVideos([]);
          setLikedCount(0);
          console.log('⚠️ Dashboard: 仅显示 Notion 数据，不显示本地 YouTube 数据');
        }
      } catch (error: any) {
        console.error('❌ Dashboard: 从 Notion 加载失败:', error);
        const errorMsg = error.message || error.toString();
        console.error('错误详情:', errorMsg);
        
        // 如果是超时错误，给用户提示
        if (errorMsg.includes('timeout') || errorMsg.includes('AbortError')) {
          alert(`⚠️ 请求超时\n\nNotion API 响应较慢，请稍后刷新页面重试。\n\n如果持续超时，请检查：\n1. 网络连接\n2. Notion API 是否正常\n3. 后端日志是否有错误`);
        }
        
        // 🔥 关键修改：不再回退到本地数据，只显示空列表
        setVideos([]);
        setRecentVideos([]);
        setLikedCount(0);
        console.log('⚠️ Dashboard: 仅显示 Notion 数据，不显示本地 YouTube 数据');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFromNotion();
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

  // Discovery Feed: 显示4个视频（打乱顺序）
  const discoveryVideos = [...videos].sort(() => Math.random() - 0.5).slice(0, 4);

  // 如果数据还在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在从 Notion 加载数据...</p>
        </div>
      </div>
    );
  }

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
            recentVideos={recentVideos}
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
