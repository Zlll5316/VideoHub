import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function AppContent() {
  return (
    <Routes>
      {/* 登录页面 - 独立显示，无 Layout */}
      <Route path="/login" element={<Login />} />
      
      {/* 其他页面 - 使用 Layout 包裹（包含 Sidebar） */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/collection" element={<Collection />} />
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
  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-200">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App
