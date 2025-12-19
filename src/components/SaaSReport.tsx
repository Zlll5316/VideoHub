import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Zap, ArrowLeft } from 'lucide-react';

export default function SaaSReport() {
  const navigate = useNavigate();

  const reportCards = [
    {
      id: '1',
      title: '本周热门赛道',
      icon: TrendingUp,
      data: [
        { label: 'AI 工具', value: '32%', trend: '+12%' },
        { label: '协作平台', value: '28%', trend: '+8%' },
        { label: '数据分析', value: '24%', trend: '+5%' },
        { label: '设计工具', value: '16%', trend: '-3%' },
      ],
    },
    {
      id: '2',
      title: '融资风向标',
      icon: DollarSign,
      data: [
        { label: '种子轮', value: '$2.5M', trend: '15 起' },
        { label: 'A 轮', value: '$12.8M', trend: '8 起' },
        { label: 'B 轮', value: '$45.2M', trend: '3 起' },
        { label: 'C 轮+', value: '$120M', trend: '1 起' },
      ],
    },
    {
      id: '3',
      title: '用户增长趋势',
      icon: Users,
      data: [
        { label: '月活增长', value: '18.5%', trend: '↑' },
        { label: '付费转化', value: '12.3%', trend: '↑' },
        { label: '留存率', value: '85.2%', trend: '↑' },
        { label: '流失率', value: '4.8%', trend: '↓' },
      ],
    },
    {
      id: '4',
      title: '技术趋势',
      icon: Zap,
      data: [
        { label: 'AI 集成', value: '68%', trend: '+25%' },
        { label: '低代码', value: '45%', trend: '+18%' },
        { label: 'API 优先', value: '52%', trend: '+15%' },
        { label: '微服务', value: '38%', trend: '+8%' },
      ],
    },
  ];

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
            SaaS 行业深度追踪报告
          </h1>
          <p className="text-lg text-slate-400 font-light">实时洞察行业动态，把握市场脉搏</p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 backdrop-blur-sm">
                    <Icon className="text-purple-400" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{card.title}</h2>
                </div>

                <div className="space-y-3">
                  {card.data.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 rounded-lg glass-effect hover:bg-slate-800/60 transition-all"
                    >
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">{item.value}</span>
                        <span className="text-xs px-2 py-1 rounded bg-purple-600/30 text-purple-200 border border-purple-500/40">
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
