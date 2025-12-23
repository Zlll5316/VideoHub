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
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-200">
      <Router>
        {!session ? (
          <Login />
        ) : (
          <AppContent />
        )}
      </Router>
    </div>
  );
}

export default App
