import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Loader2, Layers, AlertCircle, FolderPlus, X } from 'lucide-react';
import { Palette } from 'color-thief-react';
import localJsonData from '../assets/youtube_data.json';
import { supabase } from '../lib/supabase'; 

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 检测环境：生产环境使用 Vercel API 代理，开发环境使用本地后端
  const getApiUrl = (endpoint: string = 'fetch_video_list', useFallback = false) => {
    if (import.meta.env.VITE_API_URL) {
      return `${import.meta.env.VITE_API_URL}/${endpoint}`;
    }
    // 生产环境使用相对路径（Vercel serverless function）
    if (!useFallback && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api/notion';
    }
    // 开发环境：优先使用本地后端，失败时回退到 Vercel 生产 API
    if (!useFallback) {
      return `http://localhost:8000/${endpoint}`;
    }
    // 回退模式：使用 Vercel 生产环境的完整 URL
    return 'https://video-hub-swart.vercel.app/api/notion';
  };
  
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
  
  // 新增：用于处理复制色值的状态
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
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
        setIsSharing(false);
        return;
      }

      // 检查用户是否是团队成员且状态为 Active
      const { data: member } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.team_id)
        .eq('user_id', user.id)
        .eq('status', 'Active')
        .maybeSingle();

      if (!member) {
        alert('您不是团队成员或邀请尚未激活，无法分享视频');
        setIsSharing(false);
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

  // 复制色值处理函数
  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
        setCopiedColor(color);
        // 1.5秒后重置状态
        setTimeout(() => setCopiedColor(null), 1500);
    }).catch(err => {
        console.error('无法复制颜色:', err);
    });
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

  // 加载视频数据（优先从 Notion，然后从本地）
  useEffect(() => {
    const loadVideoData = async () => {
      setLoading(true);
      try {
        console.log('🔍 VideoDetail: 开始加载视频数据，ID:', id);
        
        // 1. 优先从 Notion 加载
        try {
          const response = await fetch(getApiUrl('fetch_video_list'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(60000) // 增加超时时间到60秒
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success' && result.data) {
              // 查找匹配的视频（通过 ID 或 URL）
              console.log(`🔍 VideoDetail: 在 ${result.data.length} 个视频中查找 ID: ${id}`);
              
              const notionVideo = result.data.find((item: any) => {
                // 匹配 Notion ID
                if (item.id === id) {
                  return true;
                }
                // 匹配从 URL 提取的 YouTube ID
                if (item.url) {
                  if (item.url.includes('youtube.com/watch?v=')) {
                    const videoId = item.url.split('v=')[1]?.split('&')[0];
                    if (videoId === id) {
                      return true;
                    }
                  } else if (item.url.includes('youtu.be/')) {
                    const videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
                    if (videoId === id) {
                      return true;
                    }
                  }
                  // 如果 URL 包含 ID（部分匹配）
                  if (item.url.includes(id)) {
                    return true;
                  }
                }
                return false;
              });
              
              if (notionVideo) {
                // 转换为 Video 格式
                let videoId = notionVideo.id;
                if (notionVideo.url && notionVideo.url.includes('youtube.com/watch?v=')) {
                  videoId = notionVideo.url.split('v=')[1]?.split('&')[0] || notionVideo.id;
                } else if (notionVideo.url && notionVideo.url.includes('youtu.be/')) {
                  videoId = notionVideo.url.split('youtu.be/')[1]?.split('?')[0] || notionVideo.id;
                }
                
                const videoData = {
                  id: videoId,
                  title: notionVideo.title,
                  videoName: notionVideo.title,
                  url: notionVideo.url,
                  videoSource: notionVideo.url,
                  coverUrl: notionVideo.cover,
                  coverImage: notionVideo.cover,
                  tags: notionVideo.tags || [],
                  analysis: notionVideo.analysis || '',
                  sourceUrl: notionVideo.url
                };
                
                setVideo(videoData);
                setLoading(false);
                return;
              }
            }
          }
        } catch (notionError) {
          console.warn('⚠️ VideoDetail: 从 Notion 加载失败，尝试本地数据:', notionError);
        }
        
        // 2. 回退到本地数据
        let allTasks: any[] = [];
        const localStoreData = localStorage.getItem('tasks');
        if (localStoreData) { 
          try { 
            allTasks = JSON.parse(localStoreData); 
          } catch (e) {
            console.error('解析本地任务数据失败:', e);
          }
        }
        if (localJsonData && Array.isArray(localJsonData)) { 
          allTasks = [...allTasks, ...localJsonData]; 
        }
        
        const uniqueTasksMap = new Map();
        allTasks.forEach((item: any) => { 
          uniqueTasksMap.set(String(item.id), item); 
        });
        
        const foundVideo = uniqueTasksMap.get(String(id));
        if (foundVideo) { 
          setVideo(foundVideo); 
        } else {
          console.warn('❌ VideoDetail: 未找到视频，ID:', id);
        }
      } catch (error) {
        console.error('❌ VideoDetail: 加载视频数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideoData();
  }, [id]);

  // 从 Notion 加载分析数据
  useEffect(() => {
    if (!id) return;

    // 从 Notion 加载分析数据
    const loadAnalysisFromNotion = async () => {
        setAnalysis((prev:any) => ({ 
          ...prev, 
          status: 'loading', 
          notes: "正在从 Notion 加载分析数据..." 
        }));

        try {
            console.log(`📡 从 Notion 加载视频分析数据...`);
            
            const response = await fetch(getApiUrl('fetch_video_list'), {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Notion 返回数据:', result);

            if (result.status === 'success' && result.data) {
                // 根据当前视频 ID 查找对应的 Notion 数据
                // 尝试匹配：可能是完整的 Notion ID，也可能是从 URL 提取的 YouTube ID
                const notionItem = result.data.find((item: any) => {
                  // 如果 item.id 匹配
                  if (item.id === id) return true;
                  // 如果 item.url 包含当前 ID
                  if (item.url && item.url.includes(id)) return true;
                  // 如果从 item.url 提取的 YouTube ID 匹配
                  if (item.url && item.url.includes('youtube.com/watch?v=')) {
                    const videoId = item.url.split('v=')[1]?.split('&')[0];
                    if (videoId === id) return true;
                  }
                  return false;
                });
                
                if (notionItem && notionItem.analysis) {
                    // Notion 的分析内容是纯文本，直接使用
                    const analysisText = notionItem.analysis;
                    
                    // 尝试解析为 JSON（如果用户格式化了）
                    let analysisData;
                    try {
                        analysisData = JSON.parse(analysisText);
                    } catch {
                        // 如果不是 JSON，当作纯文本处理，显示在所有 Tab 中
                        analysisData = {
                            visual_style: analysisText,
                            motion_analysis: analysisText,
                            script_structure: []
                        };
                    }
                    
                    setAnalysis({
                        visual: { 
                            style: analysisData.visual_style || analysisText || "暂无分析内容", 
                            status: 'done'
                        },
                        motion: { 
                            analysis: analysisData.motion_analysis || analysisText || "暂无分析内容", 
                            status: 'done' 
                        },
                        script: { 
                            structure: analysisData.script_structure || [], 
                            status: 'done' 
                        },
                        status: 'success',
                        notes: `已从 Notion 加载分析数据 (${analysisText.length} 字符)`
                    });
                    
                    console.log('✅ 从 Notion 加载分析数据成功，长度:', analysisText.length);
                } else {
                    // 没有找到对应的分析数据
                    setAnalysis({
                        visual: { 
                            style: "该视频在 Notion 中暂无分析内容，请在 Notion 中补充", 
                            status: 'done'
                        },
                        motion: { 
                            analysis: "该视频在 Notion 中暂无分析内容，请在 Notion 中补充", 
                            status: 'done' 
                        },
                        script: { 
                            structure: [], 
                            status: 'done' 
                        },
                        status: 'success',
                        notes: "Notion 中暂无此视频的分析内容"
                    });
                }
            } else {
                throw new Error('Notion 返回数据格式错误');
            }
        } catch (e: any) {
            console.error("❌ 从 Notion 加载失败:", e);
            
            // 判断错误类型
            const isNetworkError = e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError') || e.message?.includes('timeout');
            const isServerError = e.message?.includes('HTTP 5') || e.message?.includes('HTTP 4');
            
            let errorMessage = "无法从 Notion 加载分析数据";
            let errorDetails = `错误: ${e.message || e.toString()}`;
            
            if (isNetworkError) {
                errorMessage = "网络连接失败";
                errorDetails = "无法连接到 Notion API 服务。\n\n可能原因：\n1. 网络连接问题\n2. Notion API 服务暂时不可用\n3. 请稍后重试";
            } else if (isServerError) {
                errorMessage = "Notion API 服务错误";
                errorDetails = "Notion API 返回了错误响应。\n\n可能原因：\n1. Notion API Token 配置错误\n2. Notion 数据库权限问题\n3. 请检查后端配置";
            } else {
                errorDetails = `错误: ${e.message || e.toString()}\n\n请确保：\n1. Notion API 配置正确\n2. 该视频在 Notion 数据库中存在\n3. 网络连接正常`;
            }
            
            setAnalysis((prev:any) => ({ 
                ...prev, 
                status: 'error', 
                notes: errorMessage,
                errorDetails: errorDetails
            }));
        }
    };

    loadAnalysisFromNotion();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col bg-black text-white font-sans w-full h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">正在加载视频详情...</p>
            <p className="text-slate-500 text-xs mt-2">ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!video) {
    return (
      <div className="flex flex-col bg-black text-white font-sans w-full h-screen overflow-hidden">
        <div className="h-14 px-6 border-b border-gray-800 flex items-center bg-black shrink-0">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">返回</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">视频未找到</p>
            <p className="text-slate-400 text-sm">ID: {id}</p>
            <p className="text-slate-500 text-xs mt-4">请检查视频 ID 是否正确，或返回上一页</p>
          </div>
        </div>
      </div>
    );
  }

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
    
    // 如果已经是嵌入链接，直接返回
    if (url.includes('embed') || url.includes('player')) return url;
    
    try {
      // YouTube 支持
      if (url.includes('youtube.com/watch?v=')) {
        const vId = url.split('v=')[1]?.split('&')[0];
        if (vId) return `https://www.youtube.com/embed/${vId}`;
      } else if (url.includes('youtu.be/')) {
        const vId = url.split('youtu.be/')[1]?.split('?')[0];
        if (vId) return `https://www.youtube.com/embed/${vId}`;
      }
      
      // Vimeo 支持
      if (url.includes('vimeo.com/')) {
        const vId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (vId) return `https://player.vimeo.com/video/${vId}`;
      }
      
      // 其他情况返回原 URL
      return url;
    } catch (e) {
      console.error('解析视频 URL 失败:', e);
      return url;
    }
  };

  const AnalysisSection = ({ title, children, loading=false }: any) => (
      <section className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
          <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">{title}</h4>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          </div>
          {children}
      </section>
  );

  return (
    <div className={`flex flex-col bg-[#0a0a0a] text-white font-sans w-full h-[calc(100vh-20px)] overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`} style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      <div className="h-14 px-6 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a] shrink-0" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="flex items-center gap-4 flex-1">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition"><ArrowLeft className="w-5 h-5 mr-2" /><span className="font-medium">返回</span></button>
            <div className="h-4 w-px bg-gray-800 mx-2"></div>
            <h1 className="text-sm font-bold text-white truncate max-w-2xl" style={{ color: '#ffffff' }}>{title}</h1>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={toggleLike}
             className={`p-2 hover:bg-gray-800 rounded-lg transition ${
               isLiked ? 'text-red-500' : 'text-gray-400'
             }`}
             style={{ color: isLiked ? '#ef4444' : '#9ca3af' }}
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
             style={{ color: '#9ca3af' }}
           >
             <Share2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-[#0a0a0a] flex flex-col relative overflow-y-auto min-w-[400px] custom-scrollbar" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="w-full bg-[#0a0a0a] shadow-2xl relative shrink-0 border-b border-gray-800" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="w-full aspect-video max-h-[70vh]">
                <iframe src={getEmbedUrl(videoUrl)} title={title} className={`w-full h-full ${isResizing ? 'pointer-events-none' : ''}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
          <div className="p-8 flex-1 bg-[#0a0a0a]" style={{ backgroundColor: '#0a0a0a' }}>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center" style={{ color: '#9ca3af' }}><Layers className="w-4 h-4 mr-2"/> Keyframe Storyboard</h3>
             <div className="grid grid-cols-4 gap-4">
                {/* 从视频 URL 提取 ID 用于关键帧 */}
                {(() => {
                  let videoId = String(id);
                  if (videoUrl) {
                    if (videoUrl.includes('youtube.com/watch?v=')) {
                      videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoId;
                    } else if (videoUrl.includes('youtu.be/')) {
                      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || videoId;
                    }
                  }
                  return (
                    <>
                      <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${videoId}/1.jpg`} className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).src = coverImageUrl; }} />
                      </div>
                      <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${videoId}/2.jpg`} className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).src = coverImageUrl; }} />
                      </div>
                      <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${videoId}/3.jpg`} className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).src = coverImageUrl; }} />
                      </div>
                      <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${videoId}/0.jpg`} className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).src = coverImageUrl; }} />
                      </div>
                    </>
                  );
                })()}
            </div>
            <p className="text-xs text-gray-400 mt-2" style={{ color: '#9ca3af' }}>* 关键帧由 YouTube 自动生成。</p>
          </div>
        </div>

        <div className="w-[4px] bg-gray-900 hover:bg-blue-500 cursor-col-resize hover:w-[6px] transition-all duration-150 z-50 flex flex-col justify-center items-center group relative border-l border-gray-800" onMouseDown={startResizing}>
            <div className="h-8 w-1 bg-gray-700 rounded-full group-hover:bg-blue-400 transition-colors"></div>
        </div>

        <div ref={sidebarRef} style={{ width: sidebarWidth }} className="border-l border-gray-800 bg-[#0a0a0a] flex flex-col shrink-0 h-full relative z-20">
          {/* 统一的"视频分析"标题 */}
          <div className="flex shrink-0 border-b border-gray-800 px-6 py-4 bg-[#0a0a0a]">
            <h3 className="text-lg font-semibold text-white">视频分析</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0a0a0a] custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #0a0a0a' }}>
            {/* 降级模式提示 - 显示为警告，不是错误 */}
            {analysis.status === 'success' && analysis.degraded && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-yellow-400 text-xs mb-4">
                    <div className="flex gap-2 items-start mb-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-semibold mb-1">⚠️ YouTube 拦截提示</div>
                            <div className="text-yellow-300/80 whitespace-pre-line text-[10px] leading-relaxed mt-2">
                                {analysis.degradedMessage || "YouTube 拦截了请求，请检查 cookies.txt 文件或稍后重试。"}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {analysis.status === 'error' && (
                <div className="bg-red-950/90 backdrop-blur-sm border border-red-800 p-4 rounded-lg text-red-100 text-xs mb-4">
                    <div className="flex gap-2 items-start mb-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-300" />
                        <div className="flex-1">
                            <div className="font-semibold mb-1 text-red-100">{analysis.notes}</div>
                            {analysis.errorDetails && (
                                <div className="text-red-200/90 whitespace-pre-line text-[10px] leading-relaxed mt-2">
                                    {analysis.errorDetails}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={async () => {
                                setAnalysis((prev:any) => ({ 
                                    ...prev, 
                                    status: 'loading', 
                                    notes: "正在从 Notion 重新加载..." 
                                }));
                                
                                try {
                                    // 重新从 Notion 加载
                                    const response = await fetch(getApiUrl('fetch_video_list'), {
                                      method: 'GET',
                                      headers: { 'Content-Type': 'application/json' },
                                      signal: AbortSignal.timeout(30000)
                                    });
                                    
                                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                                    
                                    const result = await response.json();
                                    if (result.status === 'success' && result.data) {
                                        const notionItem = result.data.find((item: any) => {
                                          if (item.id === id) return true;
                                          if (item.url && item.url.includes(id)) return true;
                                          if (item.url && item.url.includes('youtube.com/watch?v=')) {
                                            const videoId = item.url.split('v=')[1]?.split('&')[0];
                                            if (videoId === id) return true;
                                          }
                                          return false;
                                        });
                                        
                                        if (notionItem && notionItem.analysis) {
                                            let analysisData;
                                            try {
                                                analysisData = JSON.parse(notionItem.analysis);
                                            } catch {
                                                analysisData = {
                                                    visual_style: notionItem.analysis,
                                                    motion_analysis: notionItem.analysis,
                                                    script_structure: []
                                                };
                                            }
                                            
                                            setAnalysis({
                                                visual: { 
                                                    style: analysisData.visual_style || notionItem.analysis || "暂无分析内容", 
                                                    status: 'done'
                                                },
                                                motion: { 
                                                    analysis: analysisData.motion_analysis || notionItem.analysis || "暂无分析内容", 
                                                    status: 'done' 
                                                },
                                                script: { 
                                                    structure: analysisData.script_structure || [], 
                                                    status: 'done' 
                                                },
                                                status: 'success',
                                                notes: "已从 Notion 重新加载"
                                            });
                                        } else {
                                            setAnalysis((prev:any) => ({ 
                                                ...prev, 
                                                status: 'error', 
                                                notes: "Notion 中暂无此视频的分析内容",
                                                errorDetails: "请在 Notion 数据库中补充该视频的分析内容"
                                            }));
                                        }
                                    } else {
                                        setAnalysis((prev:any) => ({ 
                                            ...prev, 
                                            status: 'error', 
                                            notes: "无法从 Notion 加载数据",
                                            errorDetails: result.message || "未知错误"
                                        }));
                                    }
                                } catch (e: any) {
                                    const isNetworkError = e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError') || e.message?.includes('timeout');
                                    setAnalysis((prev:any) => ({ 
                                        ...prev, 
                                        status: 'error', 
                                        notes: isNetworkError ? "网络连接失败" : `重试失败: ${e.message || e.toString()}`,
                                        errorDetails: isNetworkError 
                                            ? "无法连接到 Notion API 服务，请检查网络连接" 
                                            : `错误: ${e.message || e.toString()}`
                                    }));
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium transition"
                        >
                            🔄 重新加载
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
            
            {/* 合并所有分析内容到一个区域 */}
            <>
                {/* 主要分析内容 */}
                <AnalysisSection title="分析内容" loading={analysis.status === 'loading'}>
                    <div className={`bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 text-sm text-gray-300 leading-relaxed whitespace-pre-line ${analysis.status === 'loading'?'animate-pulse':''}`} style={{ backgroundColor: '#1a1a1a', color: '#d1d5db' }}>
                        {analysis.visual.style || analysis.motion.analysis || "暂无分析内容"}
                    </div>
                </AnalysisSection>
                
                {/* 配色方案 - 从视频封面真实提取 */}
                <AnalysisSection title="封面色值">
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
                                    onClick={() => handleCopyColor(color)}
                                    className="flex-1 h-16 rounded-lg border border-white/10 overflow-hidden group cursor-pointer hover:scale-105 transition-transform relative"
                                    style={{ backgroundColor: color }}
                                    title="点击复制色值"
                                >
                                    <div className={`h-full w-full flex items-center justify-center transition-opacity bg-black/20 ${copiedColor === color ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <span className="text-xs font-mono text-white drop-shadow-lg font-bold">
                                            {copiedColor === color ? '已复制' : color}
                                        </span>
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
                            <span key={index} className="px-2.5 py-1 bg-[#1a1a1a] text-gray-300 text-xs rounded border border-gray-800 hover:border-gray-600 cursor-pointer transition" style={{ backgroundColor: '#1a1a1a', color: '#d1d5db' }}>#{tag}</span>
                        ))}
                     </div>
                </AnalysisSection>
            </>
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
            <div className="w-full max-w-md backdrop-blur-xl bg-[#0a0a0a] border border-gray-800 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative">
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