import { LayoutDashboard, Library, Download, Settings, LogOut, Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'library', label: '情报库', icon: Library },
  { id: 'collect', label: '采集', icon: Download },
  { id: 'team', label: '团队空间', icon: Users },
  { id: 'settings', label: '设置', icon: Settings },
];

export default function Sidebar({ activeMenu = 'dashboard', onMenuChange }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: 清除登录状态
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen glass-effect border-r border-slate-200 dark:border-slate-800/50 flex flex-col backdrop-blur-xl bg-white dark:bg-[#0a0a12] transition-colors duration-300">
      {/* Logo */}
      <div className="p-8 border-b border-slate-200 dark:border-slate-800/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-purple via-primary-blue to-primary-purple bg-clip-text text-transparent tracking-tight">
          VideoHub
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-light">灵感监控中心</p>
      </div>

      {/* 搜索框区域 - Fixed Spacing & Layout */}
      <div className="px-6 mb-6 mt-4">
        <div className="group flex items-center bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900/80 border border-slate-300 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10 focus-within:border-indigo-500/50 rounded-lg px-3 h-10 transition-all duration-200">
          {/* 搜索图标 */}
          <Search size={16} className="text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
          
          {/* 输入框 - 使用 flex-1 占据剩余空间，min-w-0 防止溢出 */}
          <input 
            type="text" 
            placeholder="Search..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-300 ml-2 placeholder:text-slate-500 dark:placeholder:text-slate-600 min-w-0"
          />
          
          {/* 快捷键 Badge - 确保在大容器内部 */}
          <div className="hidden group-hover:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded text-[10px] font-medium text-slate-600 dark:text-slate-500 ml-2">
            <span className="text-xs">⌘</span>K
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onMenuChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-primary-purple/20 to-primary-blue/20 text-indigo-600 dark:text-white border border-primary-purple/40 shadow-glow-purple'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent'
              }`}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-purple to-primary-blue rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon size={20} className={isActive ? 'text-primary-purple' : ''} />
              <span className={`font-medium ${isActive ? 'text-indigo-600 dark:text-white' : ''}`}>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 space-y-2">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent transition-all"
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} />
          <span className="font-medium">退出登录</span>
        </motion.button>
        <p className="text-xs text-slate-500 dark:text-slate-500 text-center font-light">
          © 2024 VideoHub
        </p>
      </div>
    </div>
  );
}
