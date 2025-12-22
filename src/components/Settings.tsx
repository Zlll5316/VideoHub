import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Key, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type TabType = 'account' | 'api';

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: 'account', label: '账户', icon: User },
  { id: 'api', label: 'API 配置', icon: Key },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('sk-1234567890abcdef');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // 获取当前登录用户
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('获取用户信息失败:', error);
          setUser(null);
        } else {
          setUser(user);
          // 如果有用户元数据中的用户名，可以设置
          if (user?.user_metadata?.username) {
            setUsername(user.user_metadata.username);
          }
        }
      } catch (error) {
        console.error('获取用户信息异常:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSave = () => {
    // TODO: 实现保存逻辑
    console.log('保存设置');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            系统设置
          </h1>
          <p className="text-lg text-slate-400 font-light">管理你的账户和偏好设置</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="premium-card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-purple-600/20 text-white border border-purple-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <div className="premium-card p-8">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">账户设置</h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                  ) : !user ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">未登录</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          用户名
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="请输入用户名"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          邮箱地址
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700/30 rounded-lg text-slate-400 cursor-not-allowed transition-all backdrop-blur-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">邮箱地址不可修改</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">API 配置</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                      >
                        {showApiKey ? '隐藏' : '显示'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">用于访问 API 服务的密钥</p>
                  </div>
                </motion.div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <motion.button
                  onClick={handleSave}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={18} />
                  保存设置
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
