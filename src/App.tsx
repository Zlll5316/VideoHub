import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import VideoDetail from './components/VideoDetail';
import Collection from './components/Collection';
import Settings from './components/Settings';
import SaaSReport from './components/SaaSReport';
import Shortcuts from './components/Shortcuts';
import FolderDetail from './components/FolderDetail';
import TeamSpace from './components/TeamSpace';
import TaskDetail from './components/TaskDetail';
import { supabase } from './lib/supabase';

function AppContent() {
  return (
    <Routes>
      {/* 其他页面 - 使用 Layout 包裹（包含 Sidebar） */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/task-detail/:id" element={<TaskDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/trends" element={<SaaSReport />} />
        <Route path="/shortcuts" element={<Shortcuts />} />
        <Route path="/folder/:id" element={<FolderDetail />} />
        <Route path="/team" element={<TeamSpace />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 App 组件加载，开始检查 Supabase 连接...');
    
    // 添加超时机制，防止一直卡在加载状态
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Supabase 连接超时，继续加载页面');
      setLoading(false);
    }, 3000); // 3秒超时（缩短到3秒）

    // 获取初始会话
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        if (error) {
          console.error('❌ Supabase 连接错误:', error);
          // 即使有错误也继续，让用户至少能看到登录页
        } else {
          console.log('✅ Supabase 连接成功，session:', session ? '已登录' : '未登录');
        }
        setSession(session);
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('❌ Supabase 连接异常:', error);
        // 即使异常也继续，让用户至少能看到登录页
        setLoading(false);
      });

    // 监听认证状态变化
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('🔄 认证状态变化:', session ? '已登录' : '已登出');
        setSession(session);
      });

      return () => {
        clearTimeout(timeoutId);
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('❌ 设置认证监听失败:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">正在连接...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 渲染 App，session:', session ? '已登录' : '未登录');

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-200">
      <Router>
        {!session ? (
          <>
            <Login />
            <div className="fixed bottom-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-xs text-yellow-400 max-w-xs">
              💡 提示：如果看不到登录表单，请检查浏览器控制台是否有错误
            </div>
          </>
        ) : (
          <AppContent />
        )}
      </Router>
    </div>
  );
}

export default App
