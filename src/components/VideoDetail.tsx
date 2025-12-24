import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Loader2, Activity, Layers, AlertCircle, FolderPlus, X } from 'lucide-react';
import { Palette } from 'color-thief-react';
import localJsonData from '../assets/youtube_data.json';
import { supabase } from '../lib/supabase'; 

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'motion' | 'script'>('visual');
  
  // 获取后端 API URL（从环境变量或使用默认值）
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const [analysis, setAnalysis] = useState<any>({
    visual: { style: "等待分析...", status: 'idle' },
    motion: { analysis: "等待分析...", status: 'idle' },
    script: { structure: [], status: 'idle' },
    status: 'idle', 
    notes: "准备连接 AI..."
  });
  
  // 从视频封面提取的真实颜色
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorsExtracting, setColorsExtracting] = useState(false);
  
  // 收藏状态
  const [isLiked, setIsLiked] = useState(false);
  
  // 分享到团队状态
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [teamFolders, setTeamFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 加载团队文件夹
  const loadTeamFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        return;
      }

      // 获取用户的团队
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (!team) {
        alert('请先在团队空间创建团队');
        return;
      }

      // 获取团队文件夹
      const { data: folders, error } = await supabase
        .from('team_folders')
        .select('*')
        .eq('team_id', team.id)
        .order('name');

      if (error) throw error;
      setTeamFolders(folders || []);
    } catch (error: any) {
      console.error('加载团队文件夹失败:', error);
      alert(`加载失败: ${error.message || '未知错误'}`);
    }
  };

  // 分享视频到团队
  const handleShareToTeam = async () => {
    if (!id || !selectedFolder) {
      alert('请选择文件夹');
      return;
    }

    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        return;
      }

      // 获取团队 ID
      const { data: team } = await supabase
        .from('team_folders')
        .select('team_id')
        .eq('id', selectedFolder)
        .single();

      if (!team) {
        alert('文件夹不存在');
        return;
      }

      // 检查视频是否已在 Supabase 中
      let videoId = id;
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('url', video?.url || video?.videoSource || '')
        .single();

      if (!existingVideo) {
        // 如果视频不在数据库中，先创建
        const { data: newVideo, error: createError } = await supabase
          .from('videos')
          .insert({
            title: video?.title || video?.videoName || '未知标题',
            url: video?.url || video?.videoSource || '',
            thumbnail_url: video?.coverUrl || video?.coverImage || '',
            tags: video?.tags || [],
            user_id: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        videoId = newVideo.id;
      } else {
        videoId = existingVideo.id;
      }

      // 分享到团队文件夹
      const { error: shareError } = await supabase
        .from('team_videos')
        .insert({
          team_id: team.team_id,
          folder_id: selectedFolder,
          video_id: videoId,
          added_by: user.id,
        });

      if (shareError) {
        if (shareError.code === '23505') {
          alert('该视频已经在此文件夹中');
        } else {
          throw shareError;
        }
      } else {
        alert('视频已分享到团队！');
        setIsShareModalOpen(false);
        setSelectedFolder(null);
      }
    } catch (error: any) {
      console.error('分享失败:', error);
      alert(`分享失败: ${error.message || '未知错误'}`);
    } finally {
      setIsSharing(false);
    }
  };
  
  // 加载收藏状态
  useEffect(() => {
    if (id) {
      const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
      setIsLiked(likedVideos.includes(String(id)));
    }
  }, [id]);
  
  // 切换收藏状态
  const toggleLike = () => {
    if (!id) return;
    
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    const videoId = String(id);
    
    if (isLiked) {
      // 取消收藏
      const newLikedVideos = likedVideos.filter((vid: string) => vid !== videoId);
      localStorage.setItem('likedVideos', JSON.stringify(newLikedVideos));
      setIsLiked(false);
    } else {
      // 添加收藏
      if (!likedVideos.includes(videoId)) {
        likedVideos.push(videoId);
        localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
        setIsLiked(true);
      }
    }
  };

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((mouseEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseEvent.clientX;
      if (newWidth > 300 && newWidth < 800) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    let allTasks: any[] = [];
    const localStoreData = localStorage.getItem('tasks');
    if (localStoreData) { try { allTasks = JSON.parse(localStoreData); } catch (e) {} }
    if (localJsonData && Array.isArray(localJsonData)) { allTasks = [...allTasks, ...localJsonData]; }
    const uniqueTasksMap = new Map();
    allTasks.forEach((item: any) => { uniqueTasksMap.set(String(item.id), item); });
    const foundVideo = uniqueTasksMap.get(String(id));
    if (foundVideo) { setVideo(foundVideo); setLoading(false); } else { setLoading(false); }
  }, [id]);

  // 🔥 核心：请求 Python 后端（带重试机制和健康检查）
  useEffect(() => {
    if (!id) return;

    const checkBackendHealth = async (): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5秒超时
        });
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 后端健康检查通过:', data);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('⚠️ 后端健康检查失败:', e);
        return false;
      }
    };

    const fetchRealData = async (retryCount = 0) => {
        const maxRetries = 2;
        setAnalysis((prev:any) => ({ 
          ...prev, 
          status: 'loading', 
          notes: retryCount > 0 ? `正在重试连接... (${retryCount}/${maxRetries})` : "正在连接 Python 后端..." 
        }));

        try {
            // 先检查后端健康状态
            if (retryCount === 0) {
              console.log('🔍 检查后端健康状态...');
              const isHealthy = await checkBackendHealth();
              if (!isHealthy) {
                throw new Error('BACKEND_NOT_RUNNING');
              }
            }

            console.log(`🔍 开始分析视频 ID: ${id}`);
            console.log(`📡 请求地址: ${API_URL}/analyze_video?video_id=${id}`);
            
            // 请求后端 API，设置超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
            
            const response = await fetch(`${API_URL}/analyze_video?video_id=${id}`, {
              signal: controller.signal,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ 后端返回数据:', data);

            if (data.status === 'success') {
                // ✅ 修复点：直接使用对象，不要再 JSON.parse 了
                const aiData = data.ai_result;
                
                // 注意：不再使用 AI 返回的配色，而是从视频封面真实提取
                setAnalysis({
                    visual: { 
                        style: aiData.visual_style || "未识别到风格", 
                        status: 'done'
                    },
                    motion: { analysis: aiData.motion_analysis || "未识别到动效", status: 'done' },
                    script: { structure: aiData.script_structure || [], status: 'done' },
                    status: 'success',
                    notes: "AI 分析成功"
                });
                console.log('✅ AI 分析完成并已更新状态');
            } else {
                // 处理错误状态，确保错误信息能正确显示
                const errorMsg = data.message || "AI 返回错误";
                console.error('❌ 后端返回错误:', errorMsg);
                
                // 错误信息已经由后端格式化，直接使用
                let errorDetails = errorMsg;
                
                // 如果是配额错误，添加更详细的说明
                if (errorMsg.includes('配额') || errorMsg.includes('quota') || errorMsg.includes('Quota') || errorMsg.includes('429')) {
                    errorDetails = errorMsg + "\n\n💡 提示：Google Gemini API 免费版有使用限制。如果需要更多配额，可以：\n1. 等待配额重置（通常24小时）\n2. 访问 https://aistudio.google.com/app/apikey 查看配额使用情况\n3. 考虑升级到付费计划";
                }
                
                setAnalysis((prev:any) => ({ 
                    ...prev, 
                    status: 'error', 
                    notes: "AI 分析失败",
                    errorDetails: errorDetails
                }));
                return; // 直接返回，不再抛出错误
            }
        } catch (e: any) {
            console.error("❌ 连接失败:", e);
            
            // 如果是网络错误且还有重试次数，则重试
            if (retryCount < maxRetries && (e.name === 'TypeError' || e.name === 'AbortError')) {
              console.log(`🔄 准备重试 (${retryCount + 1}/${maxRetries})...`);
              setTimeout(() => {
                fetchRealData(retryCount + 1);
              }, 2000); // 2秒后重试
              return;
            }
            
            // 最终失败，显示详细的错误信息
            let errorMessage = "连接失败！";
            let errorDetails = "";
            
            if (e.message === 'BACKEND_NOT_RUNNING') {
              errorMessage = "后端服务未运行";
              errorDetails = "请按照以下步骤操作：\n1. 打开终端，进入项目目录\n2. 运行命令: python main.py\n3. 等待看到 '✅ Google 连接测试通过！后端服务准备就绪。'\n4. 刷新此页面";
            } else if (e.name === 'AbortError') {
              errorMessage = "请求超时（30秒）";
              errorDetails = "后端响应时间过长。可能是网络问题或代理配置错误。";
            } else if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
              errorMessage = "无法连接到后端服务";
              errorDetails = `请确保：\n1. Python 后端 (main.py) 正在运行\n2. 后端运行在 ${API_URL}\n3. 检查终端是否有错误信息`;
            } else {
              errorMessage = `错误: ${e.message || e.toString()}`;
              errorDetails = "请查看浏览器控制台获取详细错误信息";
            }
            
            setAnalysis((prev:any) => ({ 
                ...prev, 
                status: 'error', 
                notes: errorMessage,
                errorDetails: errorDetails
            }));
        }
    };

    fetchRealData();
  }, [id]);

  if (loading) return <div className="p-10 flex items-center justify-center text-white">加载中...</div>;
  if (!video) return <div className="p-10 text-white">视频未找到 ID: {id}</div>;

  const title = video.title || video.videoName || "无标题";
  const videoUrl = video.url || video.videoSource;
  const tags = video.tags || ['SaaS', 'Demo'];
  // 获取封面图 URL
  const coverImageUrl = video.coverUrl || video.coverImage || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  
  // 优先使用视频数据中保存的颜色，如果没有则使用提取的颜色
  const displayColors: string[] = Array.isArray(video?.colors) ? video.colors 
    : Array.isArray(video?.analysis?.hexPalette) ? video.analysis.hexPalette 
    : Array.isArray(extractedColors) ? extractedColors 
    : [];

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try { const vId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop(); if (vId) return `https://www.youtube.com/embed/${vId}`; } catch (e) { return url; }
    return url;
  };

  const TabButton = ({ name, label, icon }: { name: typeof activeTab, label: string, icon?: React.ReactNode }) => (
    <button onClick={() => setActiveTab(name)} className={`flex-1 flex items-center justify-center py-4 text-sm font-medium border-b-2 transition-all ${activeTab === name ? 'border-blue-500 text-blue-400 bg-gray-900' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
      {icon} <span className={icon ? "ml-2" : ""}>{label}</span>
    </button>
  );

  const AnalysisSection = ({ title, children, loading=false }: any) => (
      <section className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
          <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">{title}</h4>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
          {children}
      </section>
  );

  return (
    <div className={`flex flex-col bg-black text-white font-sans w-full h-[calc(100vh-20px)] overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      <div className="h-14 px-6 border-b border-gray-800 flex justify-between items-center bg-black shrink-0">
        <div className="flex items-center gap-4 flex-1">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5 mr-2" /><span className="font-medium">返回</span></button>
            <div className="h-4 w-px bg-gray-800 mx-2"></div>
            <h1 className="text-sm font-bold text-gray-300 truncate max-w-2xl">{title}</h1>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={toggleLike}
             className={`p-2 hover:bg-gray-800 rounded-lg transition ${
               isLiked ? 'text-red-500' : 'text-gray-400'
             }`}
             title={isLiked ? '取消收藏' : '收藏'}
           >
             <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
           </button>
           <button 
             onClick={async () => {
               await loadTeamFolders();
               setIsShareModalOpen(true);
             }}
             className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition"
             title="分享到团队"
           >
             <Share2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-gray-950 flex flex-col relative overflow-y-auto min-w-[400px]">
          <div className="w-full bg-black shadow-2xl relative shrink-0 border-b border-gray-800">
            <div className="w-full aspect-video max-h-[70vh]">
                <iframe src={getEmbedUrl(videoUrl)} title={title} className={`w-full h-full ${isResizing ? 'pointer-events-none' : ''}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
          <div className="p-8 flex-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center"><Layers className="w-4 h-4 mr-2"/> Keyframe Storyboard</h3>
             <div className="grid grid-cols-4 gap-4">
                <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><img src={`https://img.youtube.com/vi/${String(id)}/1.jpg`} className="w-full h-full object-cover opacity-80"/></div>
                <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><img src={`https://img.youtube.com/vi/${String(id)}/2.jpg`} className="w-full h-full object-cover opacity-80"/></div>
                <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><img src={`https://img.youtube.com/vi/${String(id)}/3.jpg`} className="w-full h-full object-cover opacity-80"/></div>
                <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"><img src={`https://img.youtube.com/vi/${String(id)}/0.jpg`} className="w-full h-full object-cover opacity-80"/></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">* 关键帧由 YouTube 自动生成。</p>
          </div>
        </div>

        <div className="w-[4px] bg-gray-900 hover:bg-blue-500 cursor-col-resize hover:w-[6px] transition-all duration-150 z-50 flex flex-col justify-center items-center group relative border-l border-gray-800" onMouseDown={startResizing}>
            <div className="h-8 w-1 bg-gray-700 rounded-full group-hover:bg-white transition-colors"></div>
        </div>

        <div ref={sidebarRef} style={{ width: sidebarWidth }} className="border-l border-gray-800 bg-black flex flex-col shrink-0 h-full relative z-20">
          <div className="flex shrink-0 border-b border-gray-800">
            <TabButton name="visual" label="视觉" icon={<span>🎨</span>} />
            <TabButton name="motion" label="动效" icon={<span>⚡️</span>} />
            <TabButton name="script" label="脚本" icon={<span>📝</span>} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {analysis.status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-400 text-xs mb-4">
                    <div className="flex gap-2 items-start mb-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-semibold mb-1">{analysis.notes}</div>
                            {analysis.errorDetails && (
                                <div className="text-red-300/80 whitespace-pre-line text-[10px] leading-relaxed mt-2">
                                    {analysis.errorDetails}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={async () => {
                                // 先检查健康状态
                                setAnalysis((prev:any) => ({ 
                                    ...prev, 
                                    status: 'loading', 
                                    notes: "正在检查后端状态..." 
                                }));
                                
                                try {
                                    const healthResponse = await fetch(`${API_URL}/health`, {
                                        method: 'GET',
                                        signal: AbortSignal.timeout(5000)
                                    });
                                    
                                    if (!healthResponse.ok) {
                                        throw new Error('后端未运行');
                                    }
                                    
                                    const healthData = await healthResponse.json();
                                    console.log('✅ 后端健康检查通过:', healthData);
                                    
                                    // 健康检查通过，开始分析
                                    setAnalysis((prev:any) => ({ 
                                        ...prev, 
                                        status: 'loading', 
                                        notes: "正在重新分析..." 
                                    }));
                                    
                                    const response = await fetch(`${API_URL}/analyze_video?video_id=${id}`, {
                                      method: 'GET',
                                      headers: { 'Content-Type': 'application/json' }
                                    });
                                    
                                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                                    
                                    const data = await response.json();
                                    if (data.status === 'success') {
                                        const aiData = data.ai_result;
                                        setAnalysis({
                                            visual: { 
                                                style: aiData.visual_style || "未识别到风格", 
                                                status: 'done'
                                            },
                                            motion: { analysis: aiData.motion_analysis || "未识别到动效", status: 'done' },
                                            script: { structure: aiData.script_structure || [], status: 'done' },
                                            status: 'success',
                                            notes: "AI 分析成功"
                                        });
                                    } else {
                                        const errorMsg = data.message || "AI 返回错误";
                                        let errorDetails = "";
                                        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Quota')) {
                                            errorDetails = "API 配额已用完。\n\n解决方案：\n1. 等待一段时间后重试\n2. 检查 Google AI Studio 的配额限制\n3. 考虑升级到付费计划";
                                        } else {
                                            errorDetails = errorMsg;
                                        }
                                        setAnalysis((prev:any) => ({ 
                                            ...prev, 
                                            status: 'error', 
                                            notes: "重试失败",
                                            errorDetails: errorDetails
                                        }));
                                    }
                                } catch (e: any) {
                                    setAnalysis((prev:any) => ({ 
                                        ...prev, 
                                        status: 'error', 
                                        notes: `重试失败: ${e.message || e.toString()}`,
                                        errorDetails: "请确保后端服务正在运行"
                                    }));
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-xs font-medium transition"
                        >
                            🔄 重新分析
                        </button>
                        <button 
                            onClick={async () => {
                                setAnalysis((prev:any) => ({ 
                                    ...prev, 
                                    status: 'loading', 
                                    notes: "正在检查后端状态..." 
                                }));
                                
                                try {
                                    const response = await fetch(`${API_URL}/health`, {
                                        method: 'GET',
                                        signal: AbortSignal.timeout(5000)
                                    });
                                    
                                    if (response.ok) {
                                        const data = await response.json();
                                        alert(`✅ 后端运行正常！\n\n状态: ${data.status}\n消息: ${data.message}\n代理: ${data.proxy}`);
                                        setAnalysis((prev:any) => ({ 
                                            ...prev, 
                                            status: 'idle',
                                            notes: "后端检查完成，可以开始分析"
                                        }));
                                    } else {
                                        throw new Error('后端未响应');
                                    }
                                } catch (e: any) {
                                    alert(`❌ 后端未运行！\n\n请执行以下步骤：\n1. 打开终端\n2. 运行: python main.py\n3. 等待看到 "✅ Google 连接测试通过"\n4. 刷新页面`);
                                    setAnalysis((prev:any) => ({ 
                                        ...prev, 
                                        status: 'error',
                                        notes: "后端未运行",
                                        errorDetails: "请运行 python main.py 启动后端服务"
                                    }));
                                }
                            }}
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition"
                        >
                            🔍 检查后端
                        </button>
                    </div>
                </div>
            )}
            
            {analysis.status === 'loading' && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-400 text-xs mb-4 flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <div>{analysis.notes}</div>
                </div>
            )}
            
             {activeTab === 'visual' && (
                <>
                    <AnalysisSection title="AI VISUAL STYLE" loading={analysis.status === 'loading'}>
                        <div className={`bg-gray-900/50 p-4 rounded-lg border border-gray-800 text-sm text-gray-400 italic leading-relaxed ${analysis.status === 'loading'?'animate-pulse':''}`}>
                            "{analysis.visual.style}"
                        </div>
                    </AnalysisSection>
                    
                    {/* 配色方案 - 从视频封面真实提取 */}
                    <AnalysisSection title="COLOR PALETTE">
                        {/* 隐藏的图片用于提取颜色 */}
                        {coverImageUrl && displayColors.length === 0 && (
                            <div className="absolute inset-0 pointer-events-none opacity-0 w-1 h-1 overflow-hidden">
                                <Palette
                                    src={`${coverImageUrl}?t=${new Date().getTime()}`}
                                    colorCount={4}
                                    format="hex"
                                    crossOrigin="anonymous"
                                >
                                    {({ data, loading }) => {
                                        if (!loading && data && Array.isArray(data) && data.length > 0 && !colorsExtracting) {
                                            setColorsExtracting(true);
                                            setTimeout(() => {
                                                setExtractedColors(data.slice(0, 4));
                                                setColorsExtracting(false);
                                            }, 100);
                                        }
                                        return null;
                                    }}
                                </Palette>
                            </div>
                        )}
                        
                        {displayColors.length > 0 ? (
                            <div className="flex gap-2">
                                {displayColors.slice(0, 4).map((color: string, index: number) => (
                                    <div
                                        key={index}
                                        className="flex-1 h-16 rounded-lg border border-white/10 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                            <span className="text-xs font-mono text-white drop-shadow-lg">{color}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="flex-1 h-16 rounded-lg border border-white/10 bg-slate-800/50 flex items-center justify-center">
                                        <Loader2 size={16} className="animate-spin text-slate-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </AnalysisSection>
                    
                    <AnalysisSection title="TAGS">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map((tag: string, index: number) => (
                                <span key={index} className="px-2.5 py-1 bg-gray-900 text-gray-300 text-xs rounded border border-gray-800 hover:border-gray-600 cursor-pointer transition">#{tag}</span>
                            ))}
                         </div>
                    </AnalysisSection>
                </>
            )}

            {activeTab === 'motion' && (
                 <AnalysisSection title="AI MOTION ANALYSIS" loading={analysis.status === 'loading'}>
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
                        <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-300 leading-relaxed">{analysis.motion.analysis}</p>
                    </div>
                </AnalysisSection>
            )}

            {activeTab === 'script' && (
                <AnalysisSection title="AI SCRIPT STRUCTURE" loading={analysis.status === 'loading'}>
                     <div className="space-y-4">
                        {analysis.script.structure && analysis.script.structure.length > 0 ? analysis.script.structure.map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-16 text-xs font-mono text-blue-400 text-right mt-1 shrink-0">{item.time}</div>
                                <div className="flex-1 bg-gray-900/50 p-3 rounded border border-gray-800">
                                    <h5 className="text-xs font-bold text-gray-200 mb-1">{item.label}</h5>
                                    <p className="text-xs text-gray-400 leading-relaxed">{item.summary}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-500 text-center py-4">AI 分析中...</div>
                        )}
                    </div>
                </AnalysisSection>
            )}
          </div>
        </div>
      </div>

      {/* 分享到团队模态框 */}
      {isShareModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsShareModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                  <Share2 className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">分享到团队</h2>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  选择文件夹
                </label>
                {teamFolders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FolderPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>还没有文件夹</p>
                    <p className="text-xs mt-2">请在团队空间创建文件夹</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {teamFolders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`w-full px-4 py-3 text-left rounded-lg border transition-all ${
                          selectedFolder === folder.id
                            ? 'bg-purple-600/20 border-purple-500/50 text-white'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FolderPlus size={18} />
                          <span className="font-medium">{folder.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  disabled={isSharing}
                  className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-all border border-slate-700/50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleShareToTeam}
                  disabled={!selectedFolder || isSharing || teamFolders.length === 0}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分享中...
                    </>
                  ) : (
                    '确认分享'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}