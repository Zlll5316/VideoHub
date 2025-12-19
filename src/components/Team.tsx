import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, MoreVertical, Mail } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
  dateAdded: string;
}

export default function Team() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock 成员数据
  const [members] = useState<TeamMember[]>([
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
  ]);

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    // TODO: 实现邀请逻辑
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Team Settings
            </h1>
            <p className="text-lg text-slate-400 font-light">
              Manage members and permissions
            </p>
          </div>
          <motion.button
            onClick={handleInviteClick}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus size={20} />
            Invite Member
          </motion.button>
        </div>

        {/* 成员列表 */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Action
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
                    {/* User */}
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

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getRoleColor(member.role)}`}
                      >
                        {member.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            member.status === 'Active'
                              ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                              : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                          }`}
                        />
                        <span className="text-sm text-slate-300">{member.status}</span>
                      </div>
                    </td>

                    {/* Date Added */}
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {formatDate(member.dateAdded)}
                    </td>

                    {/* Action */}
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

        {/* 邀请弹窗 */}
        <AnimatePresence>
          {isInviteModalOpen && (
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
                <div className="w-full max-w-md backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.2)] p-8 relative">
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
                      <Mail className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">邀请成员</h2>
                  </div>

                  {/* 邮箱输入框 */}
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
