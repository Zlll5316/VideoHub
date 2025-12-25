import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ExternalLink, Play, Briefcase, Film, Layers, Zap, Search, X } from 'lucide-react';

// 定义我们新的数据结构
interface NotionVideo {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  analysis: string;
  // 👇 对应 Notion 的4列
  company: string[];
  animationType: string[];
  technique: string[];
  features: string[];
  isLiked: boolean;
}

export default function Library() {
  const navigate = useNavigate();
  
  // 4组筛选状态
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [videos, setVideos] = useState<NotionVideo[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 检测环境：生产环境使用 Vercel API 代理，开发环境优先使用本地后端，失败时回退到 Vercel API
  const getApiUrl = (useFallback = false) => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // 生产环境或使用回退时，使用 Vercel API 代理
    if (useFallback || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      return '/api/notion';
    }
    // 开发环境优先使用本地后端
    return 'http://localhost:8000/fetch_video_list';
  };

  // 1. 加载数据（支持自动回退到 Vercel API）
  const loadFromNotion = async (useFallback = false) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = getApiUrl(useFallback);
      console.log('📡 Library: 开始加载数据，API URL:', apiUrl);
      console.log('📡 Library: 当前环境:', window.location.hostname);
      console.log('📡 Library: 使用回退模式:', useFallback);
      
      const response = await fetch(apiUrl, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000) 
      });
      
      console.log('📡 Library: 响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Library: API 响应错误:', response.status, errorText);
        throw new Error(`API 错误: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📡 Library: 收到数据:', {
        status: result.status,
        dataLength: result.data?.length || 0,
        hasData: !!result.data
      });
      
      if (result.status === 'success' && result.data && Array.isArray(result.data)) {
        const notionVideos: NotionVideo[] = result.data.map((item: any) => ({
          id: item.id,
          title: item.title || '无标题',
          coverUrl: item.cover || '',
          videoUrl: item.url || '',
          analysis: item.analysis || '',
          // 接收后端发来的4个数组
          company: item.company || [],
          animationType: item.animationType || [],
          technique: item.technique || [],
          features: item.features || [],
          isLiked: false
        }));
        console.log('✅ Library: 成功加载', notionVideos.length, '个视频');
        setVideos(notionVideos);
        setError(null);
      } else {
        console.warn('⚠️ Library: API 返回的数据格式不正确:', result);
        setVideos([]);
        setError(result.message || '数据格式错误');
      }
    } catch (error: any) {
      console.error('❌ Library: 加载失败:', error);
      
      // 如果是本地开发环境且本地后端连接失败，自动回退到 Vercel API
      if (!useFallback && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
          (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'))) {
        console.log('🔄 Library: 本地后端连接失败，自动回退到 Vercel API 代理...');
        // 递归调用，使用回退模式
        return loadFromNotion(true);
      }
      
      setVideos([]);
      if (error.name === 'AbortError') {
        setError('请求超时，请检查网络连接或稍后重试');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        if (useFallback) {
          setError('无法连接到服务器，请检查网络连接或 Vercel 部署状态');
        } else {
          setError('无法连接到本地后端服务，已自动切换到 Vercel API 代理');
        }
      } else {
        setError(error.message || '加载数据失败，请刷新重试');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFromNotion(); }, []);

  // 2. 自动计算每一行有哪些选项 (去重)
  const getOptions = (key: keyof Pick<NotionVideo, 'company' | 'animationType' | 'technique' | 'features'>) => {
    const set = new Set<string>();
    videos.forEach(v => v[key].forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  };

  const companyOptions = useMemo(() => getOptions('company'), [videos]);
  const typeOptions = useMemo(() => getOptions('animationType'), [videos]);
  const techniqueOptions = useMemo(() => getOptions('technique'), [videos]);
  const featureOptions = useMemo(() => getOptions('features'), [videos]);

  // 3. 多重筛选逻辑 (AND关系) + 搜索
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      // 筛选器匹配
      const matchCompany = selectedCompany === 'all' || v.company.includes(selectedCompany);
      const matchType = selectedType === 'all' || v.animationType.includes(selectedType);
      const matchTech = selectedTechnique === 'all' || v.technique.includes(selectedTechnique);
      const matchFeature = selectedFeature === 'all' || v.features.includes(selectedFeature);
      
      // 搜索匹配（如果搜索框有内容）
      let matchSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = v.title.toLowerCase().includes(query);
        const companyMatch = v.company.some(c => c.toLowerCase().includes(query));
        const typeMatch = v.animationType.some(t => t.toLowerCase().includes(query));
        const techniqueMatch = v.technique.some(t => t.toLowerCase().includes(query));
        const featureMatch = v.features.some(f => f.toLowerCase().includes(query));
        const analysisMatch = v.analysis?.toLowerCase().includes(query) || false;
        
        matchSearch = titleMatch || companyMatch || typeMatch || techniqueMatch || featureMatch || analysisMatch;
      }
      
      return matchCompany && matchType && matchTech && matchFeature && matchSearch;
    });
  }, [videos, selectedCompany, selectedType, selectedTechnique, selectedFeature, searchQuery]);

  const handleUpdateVideos = () => {
    setIsUpdating(true);
    setTimeout(() => { loadFromNotion(false).then(() => setIsUpdating(false)); }, 500);
  };

  // 通用筛选按钮组件
  const FilterRow = ({ label, icon: Icon, options, selected, onSelect }: any) => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-2 border-b border-[#333]/50 last:border-0">
      <div className="flex items-center gap-2 text-slate-400 text-sm min-w-[100px]">
        <Icon className="w-4 h-4" />
        <span>{label}:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect('all')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            selected === 'all' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white hover:bg-[#333]'
          }`}
        >
          全部
        </button>
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-3 py-1 rounded-md text-xs transition-all border ${
              selected === opt 
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50' 
                : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212]">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Notion 创意库</h1>
            <p className="text-sm text-slate-400">已同步 <span className="text-purple-400">{videos.length}</span> 个视频 · 多维度筛选</p>
          </div>
          <button onClick={handleUpdateVideos} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isUpdating ? 'bg-slate-700 text-slate-400' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'}`}>
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? '更新中...' : '刷新数据'}</span>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索品牌、视频标题或标签..."
              className="w-full pl-12 pr-12 py-3 bg-[#1e1e1e] border border-[#333] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500">
              找到 <span className="text-purple-400 font-medium">{filteredVideos.length}</span> 个匹配的视频
            </p>
          )}
        </div>

        {/* 4行筛选器区域 */}
        <div className="mb-10 bg-[#1e1e1e] rounded-xl border border-[#333] p-6 space-y-2">
          <FilterRow label="公司/品牌" icon={Briefcase} options={companyOptions} selected={selectedCompany} onSelect={setSelectedCompany} />
          <FilterRow label="动画类型" icon={Film} options={typeOptions} selected={selectedType} onSelect={setSelectedType} />
          <FilterRow label="表现手法" icon={Layers} options={techniqueOptions} selected={selectedTechnique} onSelect={setSelectedTechnique} />
          <FilterRow label="典型特征" icon={Zap} options={featureOptions} selected={selectedFeature} onSelect={setSelectedFeature} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/90 backdrop-blur-sm border border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-red-400 text-lg">⚠️</div>
              <div className="flex-1">
                <h3 className="text-red-200 font-medium mb-1">加载失败</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <button
                  onClick={() => loadFromNotion(false)}
                  className="mt-3 px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-200 rounded-lg text-sm transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 视频列表 */}
        {loading ? (
          <div className="text-center py-20 text-slate-500"><RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 opacity-50"/>读取中...</div>
        ) : error ? (
          <div className="text-center py-20 text-slate-500">
            <p className="mb-4">无法加载视频数据</p>
            <button
              onClick={() => loadFromNotion(false)}
              className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
            >
              点击重试
            </button>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video) => (
                  <motion.div key={video.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="break-inside-avoid">
                    <div onClick={() => navigate(`/video/${video.id}`, { state: { videoData: video } })} className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden hover:border-[#555] transition-all group cursor-pointer shadow-lg hover:shadow-purple-900/10">
                      <div className="relative aspect-video bg-black">
                        <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="text-white fill-white w-10 h-10 opacity-80" /></div>
                        <a href={video.videoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-purple-600 transition-colors z-10 opacity-0 group-hover:opacity-100"><ExternalLink className="w-3.5 h-3.5" /></a>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-white mb-3 hover:text-purple-400 transition-colors line-clamp-2">{video.title}</h3>
                        {/* 展示标签 (优先展示公司和类型) */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {video.company.slice(0,1).map(t => <span key={t} className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">{t}</span>)}
                          {video.animationType.slice(0,1).map(t => <span key={t} className="text-[10px] bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/50">{t}</span>)}
                          {video.features.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-[#2a2a2a] text-slate-400 px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                        {video.analysis ? (
                          <div className="text-[11px] text-slate-500 bg-[#252525] p-2 rounded border border-[#333] line-clamp-3 leading-relaxed">{video.analysis}</div>
                        ) : <div className="text-[11px] text-slate-700 italic">暂无分析</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filteredVideos.length === 0 && !error && (
              <div className="text-center py-20 text-slate-500">没有找到匹配的视频</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}