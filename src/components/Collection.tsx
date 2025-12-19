import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';

type TaskStatus = 'processing' | 'completed' | 'failed';

interface CollectionTask {
  id: string;
  url: string;
  coverUrl: string;
  title: string;
  status: TaskStatus;
  progress: number;
}

export default function Collection() {
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState<CollectionTask[]>([
    {
      id: '1',
      url: 'https://www.bilibili.com/video/BV1234567890',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=120&fit=crop',
      title: 'Notion AI 全新功能演示',
      status: 'processing',
      progress: 65,
    },
    {
      id: '2',
      url: 'https://www.youtube.com/watch?v=abc123',
      coverUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=120&fit=crop',
      title: 'Figma 2024 设计系统更新',
      status: 'completed',
      progress: 100,
    },
    {
      id: '3',
      url: 'https://www.douyin.com/video/1234567890',
      coverUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=120&fit=crop',
      title: 'Apple Vision Pro 沉浸式体验',
      status: 'failed',
      progress: 0,
    },
  ]);

  const handleCollect = () => {
    if (!url.trim()) return;

    const newTask: CollectionTask = {
      id: Date.now().toString(),
      url: url.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=200&h=120&fit=crop',
      title: '正在解析...',
      status: 'processing',
      progress: 0,
    };

    setTasks([newTask, ...tasks]);
    setUrl('');

    // 模拟进度更新
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === newTask.id
            ? {
                ...task,
                progress: Math.min(task.progress + 10, 100),
                status: task.progress >= 90 ? 'completed' : 'processing',
                title: task.progress >= 90 ? '采集完成' : task.title,
              }
            : task
        )
      );
    }, 500);

    setTimeout(() => clearInterval(interval), 5000);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="text-blue-400 animate-spin" size={20} />;
      case 'completed':
        return <CheckCircle2 className="text-green-400" size={20} />;
      case 'failed':
        return <XCircle className="text-red-400" size={20} />;
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            极速采集工作台
          </h1>
          <p className="text-lg text-slate-400 font-light">粘贴链接，一键入库</p>
        </div>

        {/* URL Input Section */}
        <div className="premium-card p-8 mb-12">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCollect()}
                placeholder="粘贴 B站、抖音、YouTube、视频号、小红书 链接..."
                className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
              />
            </div>
            <motion.button
              onClick={handleCollect}
              disabled={!url.trim()}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={20} />
              开始采集
            </motion.button>
          </div>
        </div>

        {/* Task Queue */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">采集任务队列</h2>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-6"
              >
                <div className="flex gap-6">
                  {/* Cover Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-700/50">
                      <img
                        src={task.coverUrl}
                        alt={task.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {task.title}
                        </h3>
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1 truncate"
                        >
                          <ExternalLink size={14} />
                          {task.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-slate-400">{getStatusText(task.status)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {task.status === 'processing' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">采集进度</span>
                          <span className="text-xs text-slate-400">{task.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    {task.status === 'failed' && (
                      <div className="mt-4">
                        <p className="text-sm text-red-400">采集失败，请检查链接是否正确</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {tasks.length === 0 && (
              <div className="premium-card p-12 text-center">
                <p className="text-slate-400 text-lg">暂无采集任务</p>
                <p className="text-slate-500 text-sm mt-2">在上方输入链接开始采集</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
