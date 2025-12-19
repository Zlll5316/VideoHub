import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, MoreVertical, Mail, FolderOpen, Plus } from 'lucide-react';
import { mockVideos } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
  dateAdded: string;
}

interface TeamFolder {
  id: string;
  name: string;
  count: number;
  updatedAt: string;
}

interface InspirationVideo {
  id: string;
  title: string;
  coverUrl: string;
  addedBy: string;
  addedByAvatar: string;
}

export default function TeamSpace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resources' | 'members'>('resources');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock 成员数据
  const members: TeamMember[] = [
    {
      id: '1',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Owner',
      status: 'Active',
      dateAdded: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: 'https://i.pravatar.cc/150?img=47',
      role: 'Admin',
      status: 'Active',
      dateAdded: '2024-02-20',
    },
    {
      id: '3',
      name: 'Michael Zhang',
      email: 'michael.z@example.com',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'Editor',
      status: 'Active',
      dateAdded: '2024-03-10',
    },
    {
      id: '4',
      name: 'Emily Wang',
      email: 'emily.wang@example.com',
      avatar: 'https://i.pravatar.cc/150?img=45',
      role: 'Editor',
      status: 'Active',
      dateAdded: '2024-03-18',
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david.kim@example.com',
      avatar: 'https://i.pravatar.cc/150?img=13',
      role: 'Viewer',
      status: 'Pending',
      dateAdded: '2024-04-05',
    },
    {
      id: '6',
      name: 'Lisa Brown',
      email: 'lisa.brown@example.com',
      avatar: 'https://i.pravatar.cc/150?img=20',
      role: 'Viewer',
      status: 'Active',
      dateAdded: '2024-04-12',
    },
  ];

  // Mock 所有团队文件夹数据
  const allFolders: TeamFolder[] = [
    { id: '1', name: 'SaaS 界面灵感', count: 128, updatedAt: '2024-04-15' },
    { id: '2', name: '3D 动效参考', count: 42, updatedAt: '2024-04-14' },
    { id: '3', name: '落地页设计', count: 86, updatedAt: '2024-04-13' },
    { id: '4', name: 'Startups 案例', count: 64, updatedAt: '2024-04-12' },
    { id: '5', name: 'E-commerce 设计', count: 32, updatedAt: '2024-04-11' },
    { id: '6', name: 'Mobile Apps', count: 56, updatedAt: '2024-04-10' },
    { id: '7', name: '品牌宣传片', count: 98, updatedAt: '2024-04-09' },
    { id: '8', name: 'UI 交互演示', count: 72, updatedAt: '2024-04-08' },
  ];

  // Mock 最新采集视频数据（带发布者信息）
  const recentSaves: InspirationVideo[] = mockVideos.slice(0, 12).map((video, index) => {
    const contributors = ['Alex', 'Sarah', 'Mike'];
    const contributorAvatars = [
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=47',
      'https://i.pravatar.cc/150?img=33',
    ];
    return {
      id: video.id,
      title: video.title,
      coverUrl: video.coverUrl,
      addedBy: contributors[index % 3],
      addedByAvatar: contributorAvatars[index % 3],
    };
  });

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    console.log('发送邀请到:', inviteEmail);
    handleCloseModal();
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'Owner':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'Admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Editor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Viewer':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'Owner':
        return '所有者';
      case 'Admin':
        return '管理员';
      case 'Editor':
        return '编辑者';
      case 'Viewer':
        return '查看者';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Acme 设计团队
            </h1>
            {/* 成员头像组 */}
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full border-2 border-slate-800"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40/1e293b/64748b?text=U';
                  }}
                />
              ))}
              {members.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                  +{members.length - 4}
                </div>
              )}
            </div>
          </div>
          <motion.button
            onClick={handleInviteClick}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus size={20} />
            邀请成员
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/5">
          {[
            { id: 'resources', label: '📂 团队资源' },
            { id: 'members', label: '👥 成员管理' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* 上半部分：文件夹区域 */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-white">📁 所有文件夹</h3>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-700/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    新建文件夹
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allFolders.map((folder, index) => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="premium-card p-6 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/folder/${folder.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30">
                          <FolderOpen className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{folder.name}</h3>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>{folder.count} 个视频</span>
                        <span>{formatDate(folder.updatedAt)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 下半部分：最新采集流 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-6">⏱️ 最新采集动态</h3>
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                  {recentSaves.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-6 break-inside-avoid group cursor-pointer"
                      onClick={() => navigate(`/video/${video.id}`)}
                    >
                      <div className="premium-card overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={video.coverUrl}
                            alt={video.title}
                            className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/800x450/1e293b/64748b?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-snug">
                            {video.title}
                          </h4>
                          
                          {/* Publisher Info */}
                          <div className="flex items-center gap-2 mt-2">
                            <img
                              src={video.addedByAvatar}
                              alt={video.addedBy}
                              className="w-5 h-5 rounded-full border border-white/10"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/20/1e293b/64748b?text=U';
                              }}
                            />
                            <span className="text-xs text-slate-400">
                              由 {video.addedBy} 添加
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                          角色
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                          加入时间
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, index) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-10 h-10 rounded-full border-2 border-white/10"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40/1e293b/64748b?text=U';
                                }}
                              />
                              <div>
                                <div className="text-white font-medium">{member.name}</div>
                                <div className="text-sm text-slate-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getRoleColor(member.role)}`}
                            >
                              {getRoleLabel(member.role)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  member.status === 'Active'
                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                    : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                                }`}
                              />
                              <span className="text-sm text-slate-300">
                                {member.status === 'Active' ? '活跃' : '待激活'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-400">
                            {formatDate(member.dateAdded)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <motion.button
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MoreVertical size={18} />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 邀请弹窗 */}
        <AnimatePresence>
          {isInviteModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-w-md backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative">
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
                      <Mail className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">邀请成员</h2>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                      placeholder="user@example.com"
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                      autoFocus
                    />
                  </div>
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
                      onClick={handleSendInvite}
                      disabled={!inviteEmail.trim()}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      whileHover={{ scale: inviteEmail.trim() ? 1.05 : 1 }}
                      whileTap={{ scale: inviteEmail.trim() ? 0.95 : 1 }}
                    >
                      发送邀请
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
