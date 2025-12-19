import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') {
      setActiveMenu('dashboard');
    } else if (path === '/library') {
      setActiveMenu('library');
    } else if (path.startsWith('/video/')) {
      setActiveMenu('library'); // 视频详情页保持 library 菜单激活
    } else if (path.startsWith('/folder/')) {
      setActiveMenu('library'); // 收藏夹详情页保持 library 菜单激活
    } else if (path === '/collection') {
      setActiveMenu('collect');
    } else if (path === '/team') {
      setActiveMenu('team');
    } else if (path === '/settings') {
      setActiveMenu('settings');
    } else if (path === '/trends') {
      setActiveMenu('dashboard'); // SaaS趋势属于dashboard相关
    } else if (path === '/shortcuts') {
      setActiveMenu('dashboard'); // 快速入口属于dashboard相关
    }
  }, [location]);

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/dashboard');
    } else if (menu === 'library') {
      navigate('/library');
    } else if (menu === 'collect') {
      navigate('/collection');
    } else if (menu === 'team') {
      navigate('/team');
    } else if (menu === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      <Outlet />
    </div>
  );
}
