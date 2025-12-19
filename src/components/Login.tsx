import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 注册
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          alert(`注册失败: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        alert('注册成功！请检查邮箱验证链接。');
        setIsLoading(false);
      } else {
        // 登录 - 必须调用 supabase.auth.signInWithPassword
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // 登录失败必须报错，不能放行
          alert(`登录失败: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        // 登录成功会自动触发 onAuthStateChange，但也要停止加载状态
        setIsLoading(false);
      }
    } catch (error) {
      alert(`发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* 背景光斑 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-purple-500/20 blur-3xl rounded-full"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-500/20 blur-3xl rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      {/* 登录卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="premium-card p-10 backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple via-primary-blue to-primary-purple bg-clip-text text-transparent tracking-tight mb-2">
              VideoHub
            </h1>
            <p className="text-slate-400 text-sm">灵感监控中心</p>
          </div>

          {/* Welcome Title */}
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Sign In/Sign Up Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
            >
              {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>

          {/* Footer Text */}
          {isSignUp && (
            <p className="text-center text-xs text-slate-500 mt-6">
              注册后请检查邮箱验证链接
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
