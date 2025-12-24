import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Folder as FolderIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import VideoCard from './VideoCard';

interface FolderVideo {
  id: string;
  video_id: string;
  title: string;
  coverUrl: string;
  addedBy: string;
  addedByAvatar: string;
  createdAt: string;
}

const FolderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<any>(null);
  const [videos, setVideos] = useState<FolderVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 加载当前用户
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // 加载文件夹数据
  useEffect(() => {
    if (!id || !currentUser) return;
    loadFolderData();
  }, [id, currentUser]);

  const loadFolderData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 1. 加载文件夹信息
      const { data: folderData, error: folderError } = await supabase
        .from('team_folders')
        .select('*')
        .eq('id', id)
        .single();

      if (folderError) {
        console.error('加载文件夹失败:', folderError);
        alert('文件夹不存在或无法访问');
        navigate('/team');
        return;
      }

      setFolder(folderData);

      // 2. 加载文件夹内的视频
      const { data: teamVideos, error: videosError } = await supabase
        .from('team_videos')
        .select(`
          *,
          videos (
            id,
            title,
            thumbnail_url,
            url
          )
        `)
        .eq('folder_id', id)
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('加载视频失败:', videosError);
        setVideos([]);
        return;
      }

      // 3. 获取添加者信息
      const userIds = [...new Set((teamVideos || []).map((tv: any) => tv.added_by).filter(Boolean))];
      const { data: membersData } = await supabase
        .from('team_members')
        .select('user_id, email')
        .in('user_id', userIds);

      const memberMap = new Map((membersData || []).map((m: any) => [m.user_id, m.email]));

      // 4. 构建视频列表
      const videosList: FolderVideo[] = (teamVideos || []).map((tv: any) => {
        const addedByEmail = memberMap.get(tv.added_by) || tv.added_by || '未知用户';
        const addedBy = addedByEmail.split('@')[0];
        const addedByAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(addedBy)}&background=3b82f6&color=fff`;

        return {
          id: tv.id,
          video_id: tv.video_id || tv.videos?.id || '',
          title: tv.videos?.title || '未知标题',
          coverUrl: tv.videos?.thumbnail_url || 'https://via.placeholder.com/800x450',
          addedBy,
          addedByAvatar,
          createdAt: tv.created_at,
        };
      });

      setVideos(videosList);
    } catch (error: any) {
      console.error('加载文件夹数据失败:', error);
      alert(`加载失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-slate-400">加载文件夹中...</p>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">文件夹不存在</p>
          <button
            onClick={() => navigate('/team')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            返回团队空间
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FolderIcon size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{folder.name}</h1>
                <p className="text-sm text-slate-400">{videos.length} 个视频</p>
              </div>
            </div>
          </div>
        </div>

        {/* 视频列表 (瀑布流) */}
        {videos.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <FolderIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">该文件夹暂无视频</p>
            <p className="text-slate-500 text-sm mt-2">分享视频到团队文件夹后，会显示在这里</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-6 break-inside-avoid group cursor-pointer"
                onClick={() => navigate(`/video/${video.video_id}`)}
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

                    {/* Added by Info */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <img
                        src={video.addedByAvatar}
                        alt={video.addedBy}
                        className="w-5 h-5 rounded-full border border-white/10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/20/1e293b/64748b?text=U';
                        }}
                      />
                      <span className="text-xs text-slate-500">由 {video.addedBy} 添加</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDetail;
