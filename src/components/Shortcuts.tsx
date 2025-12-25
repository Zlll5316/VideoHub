import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Wand2,
  UploadCloud,
  FileOutput,
  Palette,
  Database,
  Users,
  Radar,
  Bookmark,
  BarChart3,
  Zap,
  Building2,
  Eye
} from 'lucide-react';

interface ShortcutItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  color: string;
}

interface ShortcutGroup {
  id: string;
  title: string;
  icon: any;
  items: ShortcutItem[];
}

export default function Shortcuts() {
  const navigate = useNavigate();

  const shortcutGroups: ShortcutGroup[] = [
    {
      id: 'creative-tools',
      title: '效率工具箱',
      icon: Zap,
      items: [
        {
          id: 'ai-decompose',
          title: 'AI 智能拆解',
          description: '一键提取视频分镜与脚本',
          icon: Wand2,
          link: '/library',
          color: 'from-purple-600/30 to-purple-500/30 border-purple-500/30',
        },
        {
          id: 'batch-upload',
          title: '批量上传',
          description: '支持多格式视频并发上传',
          icon: UploadCloud,
          link: '/collection',
          color: 'from-blue-600/30 to-blue-500/30 border-blue-500/30',
        },
        {
          id: 'storyboard-export',
          title: '故事板导出',
          description: '生成 PDF 格式的分镜报告',
          icon: FileOutput,
          link: '/library',
          color: 'from-cyan-600/30 to-cyan-500/30 border-cyan-500/30',
        },
      ],
    },
    {
      id: 'brand-assets',
      title: '团队资产',
      icon: Building2,
      items: [
        {
          id: 'brand-vi',
          title: '品牌 VI 规范',
          description: 'Logo、字体与标准色板',
          icon: Palette,
          link: '/settings',
          color: 'from-pink-600/30 to-pink-500/30 border-pink-500/30',
        },
        {
          id: 'asset-pool',
          title: '公用素材池',
          description: '片头片尾、音效与版权图',
          icon: Database,
          link: '/library',
          color: 'from-green-600/30 to-green-500/30 border-green-500/30',
        },
        {
          id: 'member-permissions',
          title: '成员权限',
          description: '管理团队成员与访问级别',
          icon: Users,
          link: '/team',
          color: 'from-orange-600/30 to-orange-500/30 border-orange-500/30',
        },
      ],
    },
    {
      id: 'intelligence',
      title: '情报监控',
      icon: Eye,
      items: [
        {
          id: 'competitor-tracking',
          title: '竞品追踪',
          description: '实时监控竞品视频动态',
          icon: Radar,
          link: '/dashboard',
          color: 'from-red-600/30 to-red-500/30 border-red-500/30',
        },
        {
          id: 'my-collections',
          title: '我的收藏',
          description: '管理已采集的灵感视频',
          icon: Bookmark,
          link: '/favorites',
          color: 'from-yellow-600/30 to-yellow-500/30 border-yellow-500/30',
        },
        {
          id: 'data-dashboard',
          title: '数据大屏',
          description: '查看团队整体使用数据',
          icon: BarChart3,
          link: '/dashboard',
          color: 'from-indigo-600/30 to-indigo-500/30 border-indigo-500/30',
        },
      ],
    },
  ];

  const handleClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">返回仪表盘</span>
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            快速入口
          </h1>
          <p className="text-lg text-slate-400 font-light">功能强大的指挥中心</p>
        </div>

        {/* Shortcut Groups */}
        {shortcutGroups.map((group, groupIndex) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.id} className="mb-12">
              {/* Group Header */}
              <h3 className="text-lg font-semibold text-white mb-4 mt-8 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 backdrop-blur-sm">
                  <GroupIcon size={18} className="text-purple-400" />
                </div>
                {group.title}
              </h3>

              {/* Group Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const globalIndex = groupIndex * 3 + itemIndex;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: globalIndex * 0.05 }}
                      className="premium-card p-6 cursor-pointer group hover:border-primary-purple/60 transition-all duration-300"
                      onClick={() => handleClick(item.link)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className={`p-3 rounded-lg bg-gradient-to-br ${item.color} border backdrop-blur-sm flex-shrink-0`}
                          whileHover={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="text-white" size={24} />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
