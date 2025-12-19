import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import FreshDrops from './FreshDrops';
import BentoGrid from './BentoGrid';
import DiscoveryFeed from './DiscoveryFeed';
import { mockVideos, mockTrends, mockFreshDrops } from '../data/mockData';

export default function Dashboard() {
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectUrl, setCollectUrl] = useState('');

  const handleCollectClick = () => {
    setIsCollectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCollectModalOpen(false);
    setCollectUrl('');
  };

  const handleStartAnalysis = () => {
    if (!collectUrl.trim()) return;
    // TODO: 实现采集逻辑
    console.log('开始分析:', collectUrl);
    handleCloseModal();
  };

  return (
    <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              灵感监控中心
            </h1>
            <p className="text-lg text-slate-400 font-light">实时追踪竞品动态，发现设计灵感</p>
          </div>

          {/* Fresh Drops */}
          {mockFreshDrops.length > 0 && <FreshDrops videos={mockFreshDrops} />}

          {/* Bento Grid */}
          <BentoGrid trends={mockTrends} onCollectClick={handleCollectClick} />

          {/* Discovery Feed */}
          <DiscoveryFeed videos={mockVideos} />
        </div>

        {/* 采集弹窗 */}
        <AnimatePresence>
          {isCollectModalOpen && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              
              {/* 弹窗内容 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-w-2xl backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative">
                  {/* 关闭按钮 */}
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>

                  {/* 标题 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                      <Sparkles className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">极速灵感采集</h2>
                  </div>

                  {/* URL 输入框 */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={collectUrl}
                      onChange={(e) => setCollectUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStartAnalysis()}
                      placeholder="粘贴视频/文章链接..."
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm text-lg"
                      autoFocus
                    />
                  </div>

                  {/* 按钮组 */}
                  <div className="flex gap-4 justify-end">
                    <motion.button
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-all border border-slate-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      取消
                    </motion.button>
                    <motion.button
                      onClick={handleStartAnalysis}
                      disabled={!collectUrl.trim()}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      whileHover={{ scale: collectUrl.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: collectUrl.trim() ? 0.95 : 1 }}
                    >
                      开始分析
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </div>
  );
}
