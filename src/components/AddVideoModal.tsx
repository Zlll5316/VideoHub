import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
// 1. 确保引入了这个库
import { Palette } from 'color-thief-react';
import { supabase } from '../lib/supabase';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onQuickCollect?: (url: string) => void; 
}

interface VideoPreview {
  title: string;
  thumbnailUrl: string;
  url: string;
  colors: string[];
  tags: string[];
}

export default function AddVideoModal({ isOpen, onClose, onSuccess, onQuickCollect }: AddVideoModalProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // 状态：标记颜色是否提取完成
  const [colorsExtracted, setColorsExtracted] = useState(false);

  // 生成标签的逻辑
  const generateTags = (title: string): string[] => {
    const titleLower = title.toLowerCase();
    const tags: string[] = [];
    const keywordMap: Record<string, string> = {
      '教程': '#教程', 'tutorial': '#教程',
      '设计': '#设计', 'design': '#设计',
      'vlog': '#Vlog', 'ui': '#UI设计', 'ux': '#UX设计',
      'saas': '#SaaS', '3d': '#3D',
      '动画': '#动画', 'animation': '#动画',
      '品牌': '#品牌', 'brand': '#品牌',
      '产品': '#产品', 'product': '#产品',
      '演示': '#演示', 'demo': '#演示',
    };
    for (const [keyword, tag] of Object.entries(keywordMap)) {
      if (titleLower.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
    if (tags.length === 0) tags.push('#未分类');
    return tags.slice(0, 3);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setPreview(null);
    setColorsExtracted(false);

    try {
      const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
      const response = await fetch(noembedUrl);
      const data = await response.json();

      if (data.error) {
        alert(`获取视频信息失败: ${data.error}`);
        setIsAnalyzing(false);
        return;
      }

      const title = data.title || '未知标题';
      const thumbnailUrl = data.thumbnail_url || '';

      if (!thumbnailUrl) {
        alert('无法获取视频封面图');
        setIsAnalyzing(false);
        return;
      }

      const tags = generateTags(title);

      setPreview({
        title,
        thumbnailUrl,
        url,
        colors: [], 
        tags,
      });

      setIsAnalyzing(false);
    } catch (error) {
      alert(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsAnalyzing(false);
    }
  };

  const handleColorExtracted = (colors: string[]) => {
    // 只有当颜色还没提取过的时候才更新，防止死循环
    if (preview && !colorsExtracted) {
      setPreview(prev => prev ? ({
        ...prev,
        colors: colors.slice(0, 4), // 取前4个颜色
      }) : null);
      setColorsExtracted(true);
    }
  };

  const handleSave = async () => {
    if (!preview || preview.colors.length === 0) {
      alert('正在提取颜色，请稍等一秒...');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert('请先登录');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from('videos').insert({
        title: preview.title,
        url: preview.url,
        thumbnail_url: preview.thumbnailUrl,
        tags: preview.tags,
        colors: preview.colors,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert('视频已保存到库中！');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.log(error);
      alert('保存失败，请检查网络');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setPreview(null);
    setColorsExtracted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-3xl backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                  <Sparkles className="text-purple-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">智能视频采集</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">YouTube 链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
                    placeholder="粘贴 YouTube 视频链接..."
                    className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm text-lg"
                    disabled={isAnalyzing}
                    autoFocus
                  />
                  <motion.button
                    onClick={() => {
                      if (onQuickCollect && url.trim()) {
                        onQuickCollect(url.trim());
                        onClose();
                      } else {
                        handleAnalyze();
                      }
                    }}
                    disabled={!url.trim() || isAnalyzing}
                    className="px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {onQuickCollect ? <span>开始采集</span> : isAnalyzing ? <><Loader2 size={20} className="animate-spin" /><span>分析中...</span></> : <span>开始分析</span>}
                  </motion.button>
                </div>
              </div>

              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">预览</h3>
                  
                  {/* 封面图区域 */}
                  <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-800/50">
                    <img 
                        src={preview.thumbnailUrl} 
                        alt={preview.title} 
                        className="w-full h-auto object-cover"
                        // 2. 这里的 crossOrigin 也很重要
                        crossOrigin="anonymous" 
                    />
                    
                    {/* 👇 核心修复：强制 Palette 读取颜色 👇 */}
                    {preview.thumbnailUrl && !colorsExtracted && (
                      <div className="absolute inset-0 pointer-events-none opacity-0">
                         <Palette
                          // 3. 加上时间戳，防止浏览器因为缓存了无跨域头的图片而拒绝读取
                          src={preview.thumbnailUrl + '?t=' + new Date().getTime()}
                          colorCount={4}
                          format="hex"
                          crossOrigin="anonymous"
                        >
                          {({ data, loading }) => {
                            if (!loading && data) {
                                // 提取到颜色后，更新状态
                                setTimeout(() => handleColorExtracted(data), 0);
                            }
                            return null;
                          }}
                        </Palette>
                      </div>
                    )}

                    {!colorsExtracted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">正在提取颜色...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="text-base font-semibold text-white mb-4 line-clamp-2">{preview.title}</h4>

                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">标签</p>
                    <div className="flex flex-wrap gap-2">
                      {preview.tags.map((tag, index) => (
                        <span key={index} className="px-2.5 py-1 bg-purple-600/30 text-purple-200 rounded-md text-xs border border-purple-500/40">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">主色调</p>
                    {preview.colors.length > 0 ? (
                      <div className="flex gap-2">
                        {preview.colors.map((color, index) => (
                          <div key={index} className="flex-1 h-12 rounded-lg border border-white/10" style={{ backgroundColor: color }} title={color} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="flex-1 h-12 rounded-lg border border-white/10 bg-slate-800/50 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-slate-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4 justify-end">
                <motion.button onClick={handleClose} className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-lg">取消</motion.button>
                {preview && (
                  <motion.button
                    onClick={handleSave}
                    // 只有提取出颜色了，保存按钮才亮
                    disabled={isSaving || !colorsExtracted || preview.colors.length === 0}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <><Loader2 size={18} className="animate-spin" /><span>保存中...</span></> : <><Save size={18} /><span>保存到库</span></>}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}