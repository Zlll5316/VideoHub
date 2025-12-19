import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Heart, Link as LinkIcon, ExternalLink, Bookmark, Share2, Download, Globe, X, User, Building2, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { mockVideos } from '../data/mockData';

type TabType = 'visual' | 'motion' | 'script';

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // 收藏弹窗状态
  const [saveToPersonal, setSaveToPersonal] = useState(false);
  const [saveToTeam, setSaveToTeam] = useState(false);
  const [selectedPersonalFolder, setSelectedPersonalFolder] = useState<string | null>(null);
  const [selectedTeamFolder, setSelectedTeamFolder] = useState<string | null>(null);
  const [creatingFolderLocation, setCreatingFolderLocation] = useState<'personal' | 'team' | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Mock 文件夹数据
  const personalFolders = [
    { id: 'p1', name: '我的收藏夹', count: 12 },
    { id: 'p2', name: 'SaaS 界面灵感', count: 8 },
    { id: 'p3', name: '3D 动效参考', count: 5 },
  ];
  
  const teamFolders = [
    { id: 't1', name: '团队共享库', count: 24 },
    { id: 't2', name: '设计参考', count: 15 },
    { id: 't3', name: '竞品分析', count: 9 },
  ];

  // 查找视频数据
  const video = mockVideos.find(v => v.id === id);
  
  // 初始化 isLiked 状态
  useEffect(() => {
    if (video?.isLiked) {
      setIsLiked(true);
    }
  }, [video]);

  if (!video) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">视频不存在</p>
          <button
            onClick={() => navigate('/library')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回情报库
          </button>
        </div>
      </div>
    );
  }

  // 生成关键帧故事板（模拟8-12张关键画面）
  const keyFrames = Array.from({ length: 10 }, (_, i) => {
    const seconds = i * 2;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      id: `frame-${i}`,
      time: `${minutes}:${String(secs).padStart(2, '0')}`,
      thumbnail: video.coverUrl, // 实际应该从视频中提取
    };
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: 'visual', label: '视觉分析' },
    { id: 'motion', label: '动效笔记' },
    { id: 'script', label: '脚本结构' },
  ];

  // 获取源站名称
  const getSourceName = (url?: string) => {
    if (!url) return '本地文件';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    return '外部链接';
  };

  // Toast 提示
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 处理收藏按钮点击
  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  // 处理保存确认
  const handleSaveConfirm = () => {
    if (!saveToPersonal && !saveToTeam) return;
    
    setIsSaved(true);
    setIsSaveModalOpen(false);
    
    // 重置状态
    setSaveToPersonal(false);
    setSaveToTeam(false);
    setSelectedPersonalFolder(null);
    setSelectedTeamFolder(null);
    setCreatingFolderLocation(null);
    setNewFolderName('');
    
    showToast('Successfully saved to selected locations.');
  };

  // 处理新建文件夹
  const handleCreateFolder = (location: 'personal' | 'team') => {
    if (!newFolderName.trim()) return;
    
    // TODO: 实际创建文件夹逻辑
    console.log(`创建${location === 'personal' ? '个人' : '团队'}文件夹:`, newFolderName);
    
    // 模拟创建后自动选中
    if (location === 'personal') {
      const newId = `p${Date.now()}`;
      setSelectedPersonalFolder(newId);
      setSaveToPersonal(true);
    } else {
      const newId = `t${Date.now()}`;
      setSelectedTeamFolder(newId);
      setSaveToTeam(true);
    }
    
    setNewFolderName('');
    setCreatingFolderLocation(null);
  };

  // 获取保存按钮文字
  const getSaveButtonText = () => {
    if (!saveToPersonal && !saveToTeam) return 'Save';
    if (saveToPersonal && saveToTeam) return 'Save to Both';
    if (saveToPersonal) return 'Save to Personal';
    return 'Save to Team';
  };

  // 处理分享
  const handleShare = async () => {
    const currentUrl = `${window.location.origin}${location.pathname}`;
    try {
      await navigator.clipboard.writeText(currentUrl);
      showToast('分析页链接已复制，可分享给团队成员');
    } catch (err) {
      showToast('复制失败，请手动复制链接');
    }
  };

  // 处理下载/访问源站
  const handleDownloadOrSource = () => {
    if (video?.isLocalFile) {
      // 本地上传文件，触发下载
      showToast('开始下载视频...');
    } else if (video?.sourceUrl) {
      // 外部链接，在新标签页打开
      window.open(video.sourceUrl, '_blank');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">返回情报库</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            <span>{video.author}</span>
            <span>·</span>
            <span>{new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
            <span>·</span>
            <span>{video.stats.views.toLocaleString()} 次观看</span>
          </div>
          {/* 原始链接展示 */}
          {video.sourceUrl && (
            <motion.a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-purple-500/50 transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LinkIcon size={16} className="text-purple-400" />
              <span className="text-sm font-medium">Source: {getSourceName(video.sourceUrl)}</span>
              <ExternalLink size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
            </motion.a>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex gap-6">
          {/* Left Column - 70% */}
          <div className="flex-[7] space-y-6">
            {/* Video Player */}
            <div className="premium-card overflow-hidden shadow-[0_0_40px_rgba(147,51,234,0.3)]">
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                {/* Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img
                    src={video.coverUrl}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
                
                {/* Play Button Overlay */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-purple-600/90 backdrop-blur-sm flex items-center justify-center border-2 border-purple-400/50 shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:bg-purple-600 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="text-white" size={32} fill="white" />
                    ) : (
                      <Play className="text-white ml-1" size={32} fill="white" />
                    )}
                  </motion.button>
                  <p className="text-slate-300 text-sm">点击播放视频</p>
                </div>

                {/* Playback Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-1/3 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <button className="p-2 hover:bg-slate-800/50 rounded transition-colors">
                      <SkipBack size={16} />
                    </button>
                    <button className="p-2 hover:bg-slate-800/50 rounded transition-colors">
                      <SkipForward size={16} />
                    </button>
                    <select
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-slate-300 text-xs"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Like Button */}
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isLiked
                    ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart
                  size={18}
                  fill={isLiked ? 'currentColor' : 'none'}
                  className={isLiked ? 'text-red-500' : 'text-slate-300'}
                />
                <span className="text-sm">{isLiked ? '已喜欢' : '喜欢'}</span>
              </motion.button>

              {/* Save Button */}
              <motion.button
                onClick={handleSaveClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isSaved
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                <span className="text-sm">收藏</span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={18} />
                <span className="text-sm">分享</span>
              </motion.button>

              {/* Download/Source Button */}
              <motion.button
                onClick={handleDownloadOrSource}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {video?.isLocalFile ? (
                  <>
                    <Download size={18} />
                    <span className="text-sm">下载视频</span>
                  </>
                ) : (
                  <>
                    <Globe size={18} />
                    <span className="text-sm">访问源站</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
                >
                  <div className="px-6 py-3 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center gap-3">
                    <span className="text-white text-sm font-medium">{toastMessage}</span>
                    <button
                      onClick={() => setToastMessage(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Modal */}
            <AnimatePresence>
              {isSaveModalOpen && (
                <>
                  {/* Background Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSaveModalOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />

                  {/* Modal Content */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-full max-w-2xl backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative max-h-[90vh] overflow-y-auto">
                      {/* Close Button */}
                      <button
                        onClick={() => setIsSaveModalOpen(false)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>

                      {/* Title */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                          <Bookmark className="text-purple-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">保存视频</h2>
                      </div>

                      {/* Accordion Panels */}
                      <div className="space-y-4 mb-6">
                        {/* Panel A: Personal Collection */}
                        <div className="premium-card overflow-hidden">
                          {/* Header */}
                          <motion.button
                            onClick={() => setSaveToPersonal(!saveToPersonal)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                saveToPersonal
                                  ? 'bg-purple-600 border-purple-500'
                                  : 'border-slate-600 bg-transparent'
                              }`}>
                                {saveToPersonal && <Check size={14} className="text-white" />}
                              </div>
                              <User size={20} className="text-blue-400" />
                              <span className="text-white font-medium">Save to Personal</span>
                            </div>
                            {saveToPersonal ? (
                              <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={20} className="text-slate-400" />
                            )}
                          </motion.button>

                          {/* Body */}
                          <AnimatePresence>
                            {saveToPersonal && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {/* Folder List */}
                                  {personalFolders.map((folder) => (
                                    <motion.button
                                      key={folder.id}
                                      onClick={() => setSelectedPersonalFolder(folder.id)}
                                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                        selectedPersonalFolder === folder.id
                                          ? 'bg-purple-600/20 border border-purple-500/40'
                                          : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                                      }`}
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                          selectedPersonalFolder === folder.id
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-slate-600'
                                        }`}>
                                          {selectedPersonalFolder === folder.id && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                          )}
                                        </div>
                                        <span className="text-white text-sm font-medium">{folder.name}</span>
                                      </div>
                                      <span className="text-xs text-slate-400">{folder.count} items</span>
                                    </motion.button>
                                  ))}

                                  {/* New Folder Input or Button */}
                                  {creatingFolderLocation === 'personal' ? (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center gap-2 mt-2"
                                    >
                                      <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder('personal')}
                                        placeholder="文件夹名称"
                                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                                        autoFocus
                                      />
                                      <motion.button
                                        onClick={() => handleCreateFolder('personal')}
                                        disabled={!newFolderName.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        创建
                                      </motion.button>
                                      <motion.button
                                        onClick={() => {
                                          setCreatingFolderLocation(null);
                                          setNewFolderName('');
                                        }}
                                        className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg text-sm font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        取消
                                      </motion.button>
                                    </motion.div>
                                  ) : (
                                    <motion.button
                                      onClick={() => setCreatingFolderLocation('personal')}
                                      className="w-full flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all mt-2"
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Plus size={16} />
                                      <span className="text-sm font-medium">New Folder</span>
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Panel B: Team Library */}
                        <div className="premium-card overflow-hidden">
                          {/* Header */}
                          <motion.button
                            onClick={() => setSaveToTeam(!saveToTeam)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                saveToTeam
                                  ? 'bg-purple-600 border-purple-500'
                                  : 'border-slate-600 bg-transparent'
                              }`}>
                                {saveToTeam && <Check size={14} className="text-white" />}
                              </div>
                              <Building2 size={20} className="text-emerald-400" />
                              <span className="text-white font-medium">Save to Team</span>
                            </div>
                            {saveToTeam ? (
                              <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={20} className="text-slate-400" />
                            )}
                          </motion.button>

                          {/* Body */}
                          <AnimatePresence>
                            {saveToTeam && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {/* Folder List */}
                                  {teamFolders.map((folder) => (
                                    <motion.button
                                      key={folder.id}
                                      onClick={() => setSelectedTeamFolder(folder.id)}
                                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                        selectedTeamFolder === folder.id
                                          ? 'bg-purple-600/20 border border-purple-500/40'
                                          : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                                      }`}
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                          selectedTeamFolder === folder.id
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-slate-600'
                                        }`}>
                                          {selectedTeamFolder === folder.id && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                          )}
                                        </div>
                                        <span className="text-white text-sm font-medium">{folder.name}</span>
                                      </div>
                                      <span className="text-xs text-slate-400">{folder.count} items</span>
                                    </motion.button>
                                  ))}

                                  {/* New Folder Input or Button */}
                                  {creatingFolderLocation === 'team' ? (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center gap-2 mt-2"
                                    >
                                      <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder('team')}
                                        placeholder="文件夹名称"
                                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                                        autoFocus
                                      />
                                      <motion.button
                                        onClick={() => handleCreateFolder('team')}
                                        disabled={!newFolderName.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        创建
                                      </motion.button>
                                      <motion.button
                                        onClick={() => {
                                          setCreatingFolderLocation(null);
                                          setNewFolderName('');
                                        }}
                                        className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg text-sm font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        取消
                                      </motion.button>
                                    </motion.div>
                                  ) : (
                                    <motion.button
                                      onClick={() => setCreatingFolderLocation('team')}
                                      className="w-full flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all mt-2"
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Plus size={16} />
                                      <span className="text-sm font-medium">New Folder</span>
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-end pt-4 border-t border-slate-800/50">
                        <motion.button
                          onClick={() => setIsSaveModalOpen(false)}
                          className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-all border border-slate-700/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          取消
                        </motion.button>
                        <motion.button
                          onClick={handleSaveConfirm}
                          disabled={!saveToPersonal && !saveToTeam}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          whileHover={{ scale: saveToPersonal || saveToTeam ? 1.05 : 1 }}
                          whileTap={{ scale: saveToPersonal || saveToTeam ? 0.95 : 1 }}
                        >
                          {getSaveButtonText()}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Key Frames Storyboard */}
            <div className="premium-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">关键帧故事板</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {keyFrames.map((frame, index) => (
                  <motion.div
                    key={frame.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 w-32 cursor-pointer group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all">
                      <img
                        src={frame.thumbnail}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2">
                        <p className="text-xs text-white font-medium">{frame.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 30% */}
          <div className="flex-[3]">
            <div className="premium-card p-6 sticky top-8">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-purple-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* 视觉分析 Tab */}
                {activeTab === 'visual' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        主色调配色板
                      </h4>
                      <div className="flex gap-3 mb-4">
                        {video.analysis.hexPalette.map((color, index) => (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <div
                              className="w-16 h-16 rounded-lg border-2 border-slate-700/50 shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-slate-400 font-mono">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        高清封面
                      </h4>
                      <div className="rounded-lg overflow-hidden border border-slate-700/50">
                        <img
                          src={video.coverUrl}
                          alt="Cover"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        标签
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-purple-600/30 text-purple-200 rounded-md text-xs font-medium border border-purple-500/40 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 风格深度解析 */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        风格深度解析
                      </h4>
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                        <p className="text-slate-300 text-sm leading-relaxed text-justify">
                          该视频采用了高饱和度的霓虹色调（紫色/蓝色）与深色背景形成强烈对比，营造出极具未来感的科技氛围。构图上运用了大量的几何图形和发光线条引导视线，信息呈现清晰且富有层次感，非常适合表现数字化产品和前沿技术主题。
                        </p>
                      </div>
                    </div>

                    {/* 相似风格参考 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        相似风格参考
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
                          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop',
                          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=200&fit=crop',
                        ].map((imgUrl, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden border border-white/10 aspect-video relative group cursor-pointer"
                          >
                            <img
                              src={imgUrl}
                              alt={`Similar style ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/300x200/1e293b/64748b?text=Image';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 动效笔记 Tab */}
                {activeTab === 'motion' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        动效参考点
                      </h4>
                      <div className="glass-effect p-4 rounded-lg">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                          {video.analysis.motionNotes || '暂无动效笔记'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        关键时间点
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">0:15</span>
                          <p className="text-slate-300 text-sm flex-1">弹窗阻尼感参考</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">0:30</span>
                          <p className="text-slate-300 text-sm flex-1">转场动画流畅</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">1:05</span>
                          <p className="text-slate-300 text-sm flex-1">交互反馈细节</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 脚本结构 Tab */}
                {activeTab === 'script' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        脚本结构
                      </h4>
                      <div className="glass-effect p-4 rounded-lg">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                          {video.analysis.scriptNotes || '暂无脚本笔记'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        时间轴结构
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">0-5s</span>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">痛点引入</p>
                            <p className="text-slate-400 text-xs">快速建立用户共鸣</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">5-20s</span>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">功能演示</p>
                            <p className="text-slate-400 text-xs">核心功能展示</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 glass-effect rounded-lg">
                          <span className="text-purple-400 text-xs font-mono font-semibold">20-30s</span>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">价值总结</p>
                            <p className="text-slate-400 text-xs">强化核心卖点</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
