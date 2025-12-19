import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

const tagColors = [
  'bg-purple-600/30 text-purple-200 border-purple-500/40',
  'bg-blue-600/30 text-blue-200 border-blue-500/40',
  'bg-red-600/30 text-red-200 border-red-500/40',
  'bg-green-600/30 text-green-200 border-green-500/40',
  'bg-yellow-600/30 text-yellow-200 border-yellow-500/40',
  'bg-pink-600/30 text-pink-200 border-pink-500/40',
  'bg-cyan-600/30 text-cyan-200 border-cyan-500/40',
  'bg-orange-600/30 text-orange-200 border-orange-500/40',
];

export default function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: '#SaaS', color: tagColors[0], count: 45 },
    { id: '2', name: '#3D渲染', color: tagColors[1], count: 32 },
    { id: '3', name: '#玻璃拟态', color: tagColors[2], count: 28 },
    { id: '4', name: '#UI交互演示', color: tagColors[3], count: 25 },
    { id: '5', name: '#流畅转场', color: tagColors[4], count: 22 },
    { id: '6', name: '#2D MG动画', color: tagColors[5], count: 18 },
    { id: '7', name: '#动力文字', color: tagColors[6], count: 15 },
    { id: '8', name: '#实拍抠像', color: tagColors[7], count: 12 },
    { id: '9', name: '#C4D', color: tagColors[0], count: 10 },
    { id: '10', name: '#Rive', color: tagColors[1], count: 8 },
  ]);

  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: tagColors[Math.floor(Math.random() * tagColors.length)],
      count: 0,
    };

    setTags([...tags, newTag]);
    setNewTagName('');
  };

  const handleEditTag = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    if (tag) {
      setEditingTagId(tagId);
      setEditingName(tag.name);
    }
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      setEditingTagId(null);
      return;
    }

    setTags(
      tags.map((tag) =>
        tag.id === editingTagId ? { ...tag, name: editingName.trim() } : tag
      )
    );
    setEditingTagId(null);
    setEditingName('');
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('确定要删除这个标签吗？')) {
      setTags(tags.filter((tag) => tag.id !== tagId));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            标签管理中心
          </h1>
          <p className="text-lg text-slate-400 font-light">管理所有视频标签，组织你的灵感库</p>
        </div>

        {/* Create New Tag */}
        <div className="premium-card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">新建标签</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="输入标签名称（如：3D动效）"
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
            />
            <motion.button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              创建
            </motion.button>
          </div>
        </div>

        {/* Tags Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">现有标签</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="premium-card p-5 relative group"
                  onMouseEnter={() => setHoveredTagId(tag.id)}
                  onMouseLeave={() => setHoveredTagId(null)}
                >
                  {editingTagId === tag.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-400 hover:bg-slate-800/50 rounded transition-colors"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTagId(null);
                          setEditingName('');
                        }}
                        className="p-2 text-red-400 hover:bg-slate-800/50 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border backdrop-blur-sm ${tag.color}`}
                        >
                          {tag.name}
                        </span>
                        <AnimatePresence>
                          {hoveredTagId === tag.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-2"
                            >
                              <button
                                onClick={() => handleEditTag(tag.id)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/50 rounded transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="text-sm text-slate-400">
                        使用次数: <span className="text-white font-semibold">{tag.count}</span>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {tags.length === 0 && (
            <div className="premium-card p-12 text-center">
              <p className="text-slate-400 text-lg">暂无标签</p>
              <p className="text-slate-500 text-sm mt-2">创建第一个标签开始组织你的内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
