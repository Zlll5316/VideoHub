import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link as LinkIcon, ArrowRight, Heart, Clock, Sparkles, Upload, Archive } from 'lucide-react';
import { Video } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickCollectUrl, setQuickCollectUrl] = useState('');
  
  // 检测环境：生产环境使用 Vercel API 代理，开发环境使用本地后端
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return `${import.meta.env.VITE_API_URL}/fetch_video_list`;
    }
    // 生产环境使用 Vercel API 代理
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api/notion';
    }
    // 开发环境使用本地后端
    return 'http://localhost:8000/fetch_video_list';
  };

  // 从 Notion 加载数据
  useEffect(() => {
    const loadFromNotion = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 开始从 Notion 加载数据...');
        const response = await fetch(getApiUrl(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(60000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          const notionVideos: Video[] = result.data
            .filter((item: any) => item && (item.title || item.id))
            .map((item: any) => {
              let videoId = item.id;
              if (item.url && item.url.includes('youtube.com/watch?v=')) {
                videoId = item.url.split('v=')[1]?.split('&')[0] || item.id;
              } else if (item.url && item.url.includes('youtu.be/')) {
                videoId = item.url.split('youtu.be/')[1]?.split('?')[0] || item.id;
              }
              
              const getCategory = (tags: string[]): Video['category'] => {
                const tagStr = tags.join(' ').toLowerCase();
                if (tagStr.includes('saas')) return 'saas';
                if (tagStr.includes('tech') || tagStr.includes('电子')) return 'consumer_tech';
                if (tagStr.includes('lifestyle') || tagStr.includes('家居')) return 'lifestyle';
                if (tagStr.includes('motion') || tagStr.includes('动画')) return 'motion_art';
                if (tagStr.includes('edu') || tagStr.includes('教育')) return 'children_edu';
                return 'saas';
              };
              
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
                coverUrl: item.cover || '',
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
                  scriptNotes: item.analysis || '',
                  motionNotes: ''
                },
                sourceUrl: item.url,
                publishDate: new Date(),
                isLiked: false,
                createdAt: new Date()
              };
            });
          
          // 读取收藏状态
          const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
          const likedVideoIds = new Set(likedVideos.map((id: string) => String(id)));
          
          notionVideos.forEach(video => {
            video.isLiked = likedVideoIds.has(String(video.id));
          });
          
          // 按时间倒序排列
          notionVideos.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          });
          
          setVideos(notionVideos);
        } else {
          setVideos([]);
        }
      } catch (error: any) {
        console.error('❌ Dashboard: 从 Notion 加载失败:', error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFromNotion();
  }, []);

  // 统计数据
  const stats = useMemo(() => {
    const totalVideos = videos.length;
    
    // SaaS 类视频
    const saasVideos = videos.filter(v => 
      v.category === 'saas' || 
      v.title.toLowerCase().includes('saas') ||
      v.tags.some(tag => tag.toLowerCase().includes('saas'))
    ).length;
    
    // 本周新增
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const addedThisWeek = videos.filter(v => {
      const created = v.createdAt?.getTime() || 0;
      return created >= oneWeekAgo.getTime();
    }).length;
    
    // 已分析数量
    const analyzed = videos.filter(v => v.analysis?.scriptNotes && v.analysis.scriptNotes !== '').length;
    
    return {
      totalVideos,
      saasVideos,
      addedThisWeek,
      analyzed
    };
  }, [videos]);

  // 最近活动（6-8条）
  const recentActivity = useMemo(() => {
    return videos.slice(0, 8);
  }, [videos]);

  // 收藏的视频（前4个）
  const favoriteVideos = useMemo(() => {
    return videos.filter(v => v.isLiked).slice(0, 4);
  }, [videos]);

  // 颜色趋势（从所有视频提取）
  const colorTrend = useMemo(() => {
    const allColors: string[] = [];
    videos.forEach(v => {
      if (v.analysis?.hexPalette && v.analysis.hexPalette.length > 0) {
        allColors.push(...v.analysis.hexPalette);
      }
    });
    
    if (allColors.length === 0) {
      return ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    }
    
    return allColors.slice(0, 8);
  }, [videos]);

  // 快速采集处理
  const handleQuickCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCollectUrl.trim()) {
      navigate(`/collection?newUrl=${encodeURIComponent(quickCollectUrl.trim())}`);
    } else {
      navigate('/collection');
    }
  };

  // 格式化时间
  const formatTime = (date?: Date) => {
    if (!date) return '未知时间';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 骨架屏组件
  const SkeletonItem = () => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30 animate-pulse">
      <div className="w-24 h-14 bg-gray-700 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a] min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <div className="h-32 bg-gray-900/60 rounded-xl animate-pulse"></div>
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="col-span-3">
                <div className="h-32 bg-gray-900/60 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] min-h-screen relative">
      {/* 背景纹理：点阵图案 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          {/* 第一行：欢迎与操作 Banner (Col-span-12) */}
          <div className="col-span-12 bg-gradient-to-r from-purple-900/20 via-purple-900/10 to-transparent border border-white/5 rounded-xl p-8 hover:border-purple-500/30 transition-all relative overflow-hidden">
            {/* 背景装饰图标 */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Sparkles className="w-full h-full text-purple-400" />
            </div>
            
            <div className="relative z-10 flex items-center justify-between gap-8">
              {/* 左侧：欢迎语 */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">欢迎回来，创作者。</h1>
                <p className="text-gray-400 text-sm">今天想要看点什么？</p>
              </div>
              
              {/* 右侧：输入框（命令行风格） */}
              <form onSubmit={handleQuickCollect} className="flex-1 max-w-2xl">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 hover:border-purple-500/30 transition-all">
                  <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={quickCollectUrl}
                    onChange={(e) => setQuickCollectUrl(e.target.value)}
                    placeholder="粘贴 YouTube 链接开始采集..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 第二行：核心数据区 (4个小卡片，每个 Col-span-3) */}
          <div className="col-span-12 grid grid-cols-12 gap-6">
            {/* 卡片 1: 总资产 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 hover:bg-gray-800/80 transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">总资产</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.totalVideos}</div>
                <div className="text-xs text-gray-500">个视频在库中</div>
              </div>
            </div>

            {/* 卡片 2: SaaS 类 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 hover:bg-gray-800/80 transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">SaaS 类别</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.saasVideos}</div>
                <div className="text-xs text-gray-500">个 SaaS 视频</div>
              </div>
            </div>

            {/* 卡片 3: 本周新增 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 hover:bg-gray-800/80 transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">本周新增</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">+{stats.addedThisWeek}</div>
                <div className="text-xs text-gray-500">个新增</div>
              </div>
            </div>

            {/* 卡片 4: 已分析 */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 hover:bg-gray-800/80 transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">已分析</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.analyzed}</div>
                <div className="text-xs text-gray-500">个已完成</div>
              </div>
            </div>
          </div>

          {/* 第三行：主内容区 */}
          {/* 左侧 (Col-span-8)：最近动态 */}
          <div className="col-span-12 lg:col-span-8 bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                最近动态
              </h2>
              <button
                onClick={() => navigate('/library')}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-sm">暂无最近动态</p>
                </div>
              ) : (
                <>
                  {recentActivity.map((video) => {
                    const hasAnalysis = video.analysis?.scriptNotes && video.analysis.scriptNotes !== '';
                    
                    return (
                      <div
                        key={video.id}
                        onClick={() => navigate(`/video/${video.id}`)}
                        className="flex items-center gap-4 p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 hover:border-purple-500/20 transition-all cursor-pointer group"
                      >
                        {/* 封面图 */}
                        <div className="w-20 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0 border border-gray-700">
                          {video.coverUrl ? (
                            <img
                              src={video.coverUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                              无封面
                            </div>
                          )}
                        </div>

                        {/* 标题 + 标签 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white mb-1.5 truncate group-hover:text-purple-400 transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {video.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded border border-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="text-xs text-gray-500">{formatTime(video.createdAt)}</span>
                          </div>
                        </div>

                        {/* 状态 + 箭头 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasAnalysis ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded border border-green-500/20">
                              已入库
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-[10px] font-medium rounded border border-gray-600">
                              待处理
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 骨架屏填充（如果不足8条） */}
                  {recentActivity.length < 8 && Array.from({ length: 8 - recentActivity.length }).map((_, idx) => (
                    <SkeletonItem key={`skeleton-${idx}`} />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* 右侧 (Col-span-4)：灵感胶囊 */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* 卡片 A: 我的收藏 */}
            <div className="bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                  我的收藏
                </h3>
                {favoriteVideos.length > 0 && (
                  <button
                    onClick={() => navigate('/favorites')}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    查看全部
                  </button>
                )}
              </div>
              
              {favoriteVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-xs">暂无收藏</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {favoriteVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => navigate(`/video/${video.id}`)}
                      className="aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-700 group"
                    >
                      {video.coverUrl ? (
                        <img
                          src={video.coverUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          无封面
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 卡片 B: 色彩趋势 */}
            <div className="bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">色彩趋势</h3>
              {colorTrend.length === 0 ? (
                <div className="h-12 bg-gray-800/30 rounded border border-dashed border-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600">暂无颜色数据</span>
                </div>
              ) : (
                <div className="flex h-12 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                  {colorTrend.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-full relative group cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 卡片 C: 快捷入口 */}
            <div className="bg-gray-900/60 backdrop-blur border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/collection')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 group-hover:bg-purple-500/30 transition-colors">
                    <Upload className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">导入 YouTube</span>
                </button>
                
                <button
                  onClick={() => navigate('/library')}
                  className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 group-hover:bg-blue-500/30 transition-colors">
                    <Archive className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">查看归档</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
