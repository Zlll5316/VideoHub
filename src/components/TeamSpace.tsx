import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Mail, FolderOpen, Plus, Loader2, Trash2, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
  dateAdded: string;
  user_id: string | null;
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
  video_id: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
}

export default function TeamSpace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resources' | 'members'>('resources');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Viewer');
  const [isInviting, setIsInviting] = useState(false);
  
  // 数据状态
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [folders, setFolders] = useState<TeamFolder[]>([]);
  const [recentSaves, setRecentSaves] = useState<InspirationVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 多选状态
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 加载当前用户
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // 加载团队数据
  useEffect(() => {
    if (!currentUser) return;
    loadTeamData();
  }, [currentUser]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.action-area')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadTeamData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // 1. 查找用户是否已有团队（使用 maybeSingle 避免没有数据时报错）
      let { data: teamInfo, error: teamInfoError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      // 检查是否是表不存在的错误
      if (teamInfoError) {
        console.error('查询团队错误详情:', {
          code: teamInfoError.code,
          message: teamInfoError.message,
          details: teamInfoError.details,
          hint: teamInfoError.hint
        });
        
        if (teamInfoError.code === '42P01' || teamInfoError.code === 'PGRST205' || teamInfoError.message?.includes('does not exist') || teamInfoError.message?.includes('Could not find the table')) {
          alert(`数据库表尚未创建或 Schema Cache 未刷新！\n\n错误代码: ${teamInfoError.code}\n错误信息: ${teamInfoError.message}\n\n解决方案（按顺序尝试）：\n\n方案 1：执行 SQL 脚本\n1. 打开 "最简单-直接创建表.sql" 文件\n2. 复制所有内容\n3. 在 Supabase SQL Editor 中执行\n4. 等待 2-3 分钟让 schema cache 刷新\n5. 刷新页面\n\n方案 2：手动创建表\n1. 查看 "手动创建表-图文指南.md" 文件\n2. 按照步骤在 Table Editor 中手动创建表\n\n方案 3：如果还是不行\n1. 在 Supabase Dashboard → Settings → API\n2. 找到 "Reload schema" 按钮并点击\n3. 等待几分钟后刷新页面`);
          setLoading(false);
          return;
        }
        // 其他错误，尝试创建团队
        console.warn('查询团队失败，尝试创建:', teamInfoError);
      }

      // 如果没有团队，创建一个默认团队
      if (!teamInfo) {
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert({
            name: '我的团队',
            owner_id: currentUser.id,
            description: '默认团队空间',
          })
          .select()
          .single();

        if (createError) {
          if (createError.code === '42P01' || createError.message?.includes('does not exist')) {
            alert('数据库表尚未创建！\n\n请按照以下步骤操作：\n1. 登录 Supabase Dashboard\n2. 进入 SQL Editor\n3. 执行 数据库表结构.sql 中的所有 SQL 语句\n4. 刷新页面重试');
            setLoading(false);
            return;
          }
          throw createError;
        }
        teamInfo = newTeam;

        // 自动添加创建者为 Owner
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: teamInfo.id,
            user_id: currentUser.id,
            email: currentUser.email || '',
            role: 'Owner',
            status: 'Active',
          });

        if (memberError && memberError.code !== '42P01') {
          console.warn('添加成员失败（可能表不存在）:', memberError);
        }
      } else {
        // 团队已存在，检查当前用户是否是成员
        const { data: existingMembers, error: checkError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamInfo.id)
          .eq('user_id', currentUser.id);

        if (checkError && checkError.code !== '42P01') {
          console.warn('检查成员失败:', checkError);
        } else if (!existingMembers || existingMembers.length === 0) {
          // 当前用户不是成员，自动添加为 Owner
          console.log('⚠️ 当前用户不是团队成员，自动添加为 Owner...');
          const { error: addMemberError } = await supabase
            .from('team_members')
            .insert({
              team_id: teamInfo.id,
              user_id: currentUser.id,
              email: currentUser.email || '',
              role: 'Owner',
              status: 'Active',
            });

          if (addMemberError) {
            console.error('自动添加成员失败:', addMemberError);
            // 不阻止继续，让用户知道问题
            alert(`⚠️ 检测到您不是团队成员，已尝试自动添加。\n\n如果仍然无法操作，请在 Supabase Dashboard 中手动将您的用户添加到 team_members 表，role 设置为 'Owner'。\n\n错误: ${addMemberError.message}`);
          } else {
            console.log('✅ 已自动添加当前用户为 Owner');
          }
        }
      }

      if (!teamInfo) {
        throw new Error('无法创建或获取团队');
      }

      setTeam(teamInfo);

      // 2. 加载成员列表
      await loadMembers(teamInfo.id);

      // 3. 加载文件夹
      await loadFolders(teamInfo.id);

      // 4. 加载最新分享的视频
      await loadRecentVideos(teamInfo.id);
    } catch (error: any) {
      console.error('加载团队数据失败:', error);
      const errorMsg = error?.message || '未知错误';
      const errorCode = error?.code || '';
      
      if (errorCode === '42P01' || errorMsg.includes('does not exist')) {
        alert('数据库表尚未创建！\n\n请按照以下步骤操作：\n1. 登录 Supabase Dashboard\n2. 进入 SQL Editor\n3. 执行 数据库表结构.sql 中的所有 SQL 语句\n4. 刷新页面重试');
      } else if (errorCode === '42501' || errorMsg.includes('permission denied')) {
        alert('权限不足！\n\n可能原因：\n1. RLS 策略未正确配置\n2. 请检查数据库表结构.sql 中的 RLS 策略是否已执行');
      } else {
        alert(`加载团队数据失败\n\n错误: ${errorMsg}\n\n请检查：\n1. 数据库表是否已创建\n2. 网络连接是否正常\n3. 浏览器控制台是否有更多错误信息`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      // 如果是表不存在，静默失败（会在主函数中处理）
      if (error.code === '42P01') {
        console.warn('team_members 表不存在');
        return;
      }
      console.error('加载成员失败:', error);
      return;
    }

    // 获取用户信息（如果有 user_id）
    const membersWithInfo: TeamMember[] = await Promise.all(
      (data || []).map(async (member) => {
        let name = null;
        let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.email)}&background=8b5cf6&color=fff`;

        if (member.user_id) {
          // 尝试从 auth.users 获取用户信息（需要 Supabase 函数或直接查询）
          // 这里简化处理，使用邮箱作为名称
          name = member.email.split('@')[0];
        } else {
          name = member.email.split('@')[0];
        }

        return {
          id: member.id,
          name,
          email: member.email,
          avatar,
          role: member.role as TeamMember['role'],
          status: member.status as TeamMember['status'],
          dateAdded: member.created_at,
          user_id: member.user_id,
        };
      })
    );

    console.log('📋 已加载成员列表:', membersWithInfo.map(m => ({ email: m.email, role: m.role, user_id: m.user_id })));
    setMembers(membersWithInfo);
  };

  const loadFolders = async (teamId: string) => {
    try {
      // 获取文件夹列表
      const { data: foldersData, error: foldersError } = await supabase
        .from('team_folders')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (foldersError) {
        // 如果是表不存在，静默失败（会在主函数中处理）
        if (foldersError.code === '42P01') {
          console.warn('team_folders 表不存在');
          return;
        }
        console.error('加载文件夹失败:', foldersError);
        return;
      }

      // 获取每个文件夹的视频数量
      const foldersWithCount: TeamFolder[] = await Promise.all(
        (foldersData || []).map(async (folder) => {
          const { count, error: countError } = await supabase
            .from('team_videos')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id);

          // 如果查询失败，返回 0
          const videoCount = (countError || !count) ? 0 : count;

          return {
            id: folder.id,
            name: folder.name,
            count: videoCount,
            updatedAt: folder.updated_at || folder.created_at,
          };
        })
      );

      console.log('✅ 加载到的文件夹:', foldersWithCount.length, '个', foldersWithCount);
      setFolders(foldersWithCount);
      
      // 验证 state 是否更新
      setTimeout(() => {
        console.log('📊 当前 folders state:', folders.length, '个文件夹');
      }, 100);
    } catch (error) {
      console.error('❌ loadFolders 异常:', error);
      setFolders([]);
    }
  };

  const loadRecentVideos = async (teamId: string) => {
    // 获取最近分享的视频
    const { data: teamVideos, error } = await supabase
      .from('team_videos')
      .select(`
        *,
        videos (
          id,
          title,
          thumbnail_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // 如果是表不存在，静默失败（会在主函数中处理）
      if (error.code === '42P01') {
        console.warn('team_videos 表不存在');
        return;
      }
      console.error('加载分享视频失败:', error);
      return;
    }

    // 获取所有添加者的 user_id，然后查询成员信息
    const userIds = [...new Set((teamVideos || []).map((tv: any) => tv.added_by))];
    const { data: membersData } = await supabase
      .from('team_members')
      .select('user_id, email')
      .in('user_id', userIds.filter(Boolean));

    const memberMap = new Map((membersData || []).map((m: any) => [m.user_id, m.email]));

    // 构建视频列表
    const videosWithUser: InspirationVideo[] = (teamVideos || []).map((tv: any) => {
      const addedByEmail = memberMap.get(tv.added_by) || tv.added_by || '未知用户';
      const addedBy = addedByEmail.split('@')[0];
      const addedByAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(addedBy)}&background=3b82f6&color=fff`;

      return {
        id: tv.id,
        video_id: tv.video_id,
        title: tv.videos?.title || '未知标题',
        coverUrl: tv.videos?.thumbnail_url || 'https://via.placeholder.com/800x450',
        addedBy,
        addedByAvatar,
      };
    });

    setRecentSaves(videosWithUser);
  };

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteRole('Viewer');
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !team || !currentUser) return;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert('请输入有效的邮箱地址');
      return;
    }

    setIsInviting(true);
    try {
      // 检查是否已经是成员
      const { data: existing } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('email', inviteEmail.trim())
        .single();

      if (existing) {
        alert('该邮箱已经是团队成员');
        setIsInviting(false);
        return;
      }

      // 创建邀请
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          email: inviteEmail.trim(),
          role: inviteRole,
          status: 'Pending',
          invited_by: currentUser.id,
        });

      if (error) throw error;

      alert('邀请已发送！');
      handleCloseModal();
      
      // 重新加载成员列表
      await loadMembers(team.id);
    } catch (error: any) {
      console.error('发送邀请失败:', error);
      alert(`发送邀请失败: ${error.message || '未知错误'}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberEmail: string) => {
    if (!team || !currentUser) return;
    
    // 检查当前用户权限
    const currentMember = members.find(m => m.user_id === currentUser.id);
    if (!currentMember || (currentMember.role !== 'Owner' && currentMember.role !== 'Admin')) {
      alert('只有管理员可以删除成员');
      return;
    }

    if (!confirm(`确定要移除成员 ${memberEmail} 吗？`)) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', team.id);

      if (error) throw error;

      alert('成员已移除');
      await loadMembers(team.id);
    } catch (error: any) {
      console.error('删除成员失败:', error);
      alert(`删除成员失败: ${error.message || '未知错误'}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!team || !currentUser) return;

    const folderName = prompt('请输入文件夹名称:');
    if (!folderName?.trim()) return;

    try {
      const { data: newFolder, error } = await supabase
        .from('team_folders')
        .insert({
          team_id: team.id,
          name: folderName.trim(),
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (error) {
        console.error('创建文件夹错误:', error);
        throw error;
      }

      console.log('✅ 文件夹创建成功:', newFolder);
      
      // 立即更新文件夹列表（强制刷新）
      console.log('🔄 开始刷新文件夹列表...');
      await loadFolders(team.id);
      
      // 再次确认刷新（防止异步问题）
      setTimeout(async () => {
        console.log('🔄 二次刷新文件夹列表...');
        await loadFolders(team.id);
      }, 500);
      
      // 显示成功提示
      alert('文件夹创建成功！');
    } catch (error: any) {
      console.error('创建文件夹失败:', error);
      alert(`创建文件夹失败: ${error.message || '未知错误'}`);
    }
  };

  // 检查用户是否有删除权限
  const checkDeletePermission = () => {
    if (!currentUser) {
      console.log('❌ 权限检查：用户未登录');
      return false;
    }
    
    const currentMember = members.find(m => m.user_id === currentUser.id);
    if (!currentMember) {
      console.log('❌ 权限检查：用户不是团队成员', { userId: currentUser.id, membersCount: members.length });
      return false;
    }
    
    const hasPermission = currentMember.role === 'Owner' || currentMember.role === 'Admin' || currentMember.role === 'Editor';
    console.log('✅ 权限检查：', { 
      userId: currentUser.id, 
      role: currentMember.role, 
      hasPermission,
      allMembers: members.map(m => ({ id: m.user_id, role: m.role }))
    });
    
    // Owner, Admin, Editor 都可以删除
    return hasPermission;
  };

  // 切换文件夹选中状态
  const toggleFolderSelection = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发文件夹点击事件
    
    // 检查权限
    if (!checkDeletePermission()) {
      alert('只有编辑者及以上权限可以选择文件夹');
      return;
    }
    
    setSelectedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFolders.size === folders.length) {
      setSelectedFolders(new Set());
    } else {
      setSelectedFolders(new Set(folders.map(f => f.id)));
    }
  };

  // 单个删除文件夹
  const handleDeleteFolder = async (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发文件夹点击事件
    
    if (!team || !currentUser) return;

    // 检查当前用户权限
    const currentMember = members.find(m => m.user_id === currentUser.id);
    if (!currentMember || (currentMember.role !== 'Owner' && currentMember.role !== 'Admin' && currentMember.role !== 'Editor')) {
      alert('只有编辑者及以上权限可以删除文件夹');
      return;
    }

    if (!confirm(`确定要删除文件夹 "${folderName}" 吗？\n\n删除后，文件夹内的所有视频分享记录也会被删除。`)) return;

    await deleteFolders([folderId]);
  };

  // 批量删除文件夹
  const handleBatchDelete = async () => {
    if (!team || !currentUser || selectedFolders.size === 0) return;

    // 检查当前用户权限
    if (!checkDeletePermission()) {
      alert('只有编辑者及以上权限可以删除文件夹');
      return;
    }

    const selectedFolderList = folders.filter(f => selectedFolders.has(f.id));
    const folderNames = selectedFolderList.map(f => f.name).join('、');

    if (!confirm(`确定要删除以下 ${selectedFolders.size} 个文件夹吗？\n\n${folderNames}\n\n删除后，文件夹内的所有视频分享记录也会被删除。`)) return;

    await deleteFolders(Array.from(selectedFolders));
  };

  // 执行删除操作（支持单个和批量）
  const deleteFolders = async (folderIds: string[]) => {
    if (!team) return;

    setIsDeleting(true);
    try {
      // 批量删除
      const { error } = await supabase
        .from('team_folders')
        .delete()
        .in('id', folderIds)
        .eq('team_id', team.id);

      if (error) throw error;

      alert(`成功删除 ${folderIds.length} 个文件夹`);
      
      // 清空选中状态
      setSelectedFolders(new Set());
      
      // 刷新文件夹列表
      await loadFolders(team.id);
    } catch (error: any) {
      console.error('删除文件夹失败:', error);
      alert(`删除文件夹失败: ${error.message || '未知错误'}`);
    } finally {
      setIsDeleting(false);
    }
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

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-slate-400">加载团队数据中...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">无法加载团队信息</p>
          <button
            onClick={loadTeamData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              {team.name}
            </h1>
            {/* 成员头像组 */}
            <div className="flex -space-x-2">
              {members.filter(m => m.status === 'Active').slice(0, 4).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name || member.email}
                  className="w-10 h-10 rounded-full border-2 border-slate-800"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40/1e293b/64748b?text=U';
                  }}
                />
              ))}
              {members.filter(m => m.status === 'Active').length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                  +{members.filter(m => m.status === 'Active').length - 4}
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
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-white">📁 所有文件夹</h3>
                    {folders.length > 0 && (
                      <motion.button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-700/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={selectedFolders.size === folders.length ? '取消全选' : '全选'}
                      >
                        {selectedFolders.size === folders.length ? (
                          <CheckSquare size={14} className="text-purple-400" />
                        ) : (
                          <Square size={14} />
                        )}
                        <span>{selectedFolders.size === folders.length ? '取消全选' : '全选'}</span>
                      </motion.button>
                    )}
                    {selectedFolders.size > 0 && (
                      <span className="text-sm text-slate-400">
                        已选择 {selectedFolders.size} 个
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedFolders.size > 0 && (
                      <motion.button
                        onClick={handleBatchDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/30 disabled:opacity-50"
                        whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                        whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            删除中...
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            批量删除 ({selectedFolders.size})
                          </>
                        )}
                      </motion.button>
                    )}
                    <motion.button
                      onClick={handleCreateFolder}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-700/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={16} />
                      新建文件夹
                    </motion.button>
                  </div>
                </div>
                {folders.length === 0 ? (
                  <div className="premium-card p-12 text-center">
                    <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">还没有文件夹，创建一个开始吧！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {folders.map((folder, index) => {
                      const canDelete = checkDeletePermission();
                      const isSelected = selectedFolders.has(folder.id);
                      const isDropdownOpen = openDropdown === folder.id;
                      
                      return (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`premium-card p-6 cursor-pointer group relative transition-all ${
                            isSelected ? 'ring-2 ring-purple-500/50 bg-purple-500/10' : ''
                          }`}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            // 如果点击的是复选框区域、删除按钮或下拉菜单，不导航
                            const target = e.target as HTMLElement;
                            if (!target.closest('.checkbox-area') && !target.closest('.action-area') && !target.closest('.dropdown-menu')) {
                              navigate(`/folder/${folder.id}`);
                            }
                          }}
                        >
                          {/* 复选框 - 所有文件夹都显示 */}
                          <motion.div
                            className="checkbox-area absolute top-3 left-3 z-10"
                            onClick={(e) => {
                              if (canDelete) {
                                toggleFolderSelection(folder.id, e);
                              } else {
                                e.stopPropagation();
                                alert('只有编辑者及以上权限可以选择文件夹');
                              }
                            }}
                            whileHover={{ scale: canDelete ? 1.1 : 1 }}
                            whileTap={{ scale: canDelete ? 0.9 : 1 }}
                            title={canDelete ? (isSelected ? '取消选择' : '选择文件夹') : '需要编辑者及以上权限'}
                          >
                            {isSelected ? (
                              <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/50">
                                <CheckSquare size={18} className="text-purple-400" />
                              </div>
                            ) : (
                              <div className={`p-1.5 rounded-lg border transition-opacity ${
                                canDelete 
                                  ? 'bg-slate-800/50 border-slate-700/50 opacity-0 group-hover:opacity-100' 
                                  : 'bg-slate-900/50 border-slate-800/50 opacity-50'
                              }`}>
                                <Square size={18} className="text-slate-400" />
                              </div>
                            )}
                          </motion.div>
                          
                          {/* 右下角下拉菜单 */}
                          <div className="action-area absolute bottom-3 right-3 z-10">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(isDropdownOpen ? null : folder.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="更多操作"
                            >
                              <MoreVertical size={16} />
                            </motion.button>
                            
                            {/* 下拉菜单 */}
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="dropdown-menu absolute bottom-full right-0 mb-2 w-32 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {canDelete ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdown(null);
                                      handleDeleteFolder(folder.id, folder.name, e);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                  >
                                    <Trash2 size={14} />
                                    删除文件夹
                                  </button>
                                ) : (
                                  <div className="px-4 py-2 text-xs text-slate-500">
                                    需要编辑者权限
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                          
                          {/* 右上角删除按钮（备选，悬停时显示） */}
                          {canDelete && (
                            <motion.button
                              onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                              className="absolute top-2 right-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="删除文件夹"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30">
                              <FolderOpen className="text-blue-400" size={20} />
                            </div>
                            <h3 className={`text-lg font-bold flex-1 ${
                              isSelected ? 'text-purple-300' : 'text-white'
                            }`}>
                              {folder.name}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>{folder.count} 个视频</span>
                            <span>{formatDate(folder.updatedAt)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 下半部分：最新采集流 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-6">⏱️ 最新采集动态</h3>
                {recentSaves.length === 0 ? (
                  <div className="premium-card p-12 text-center">
                    <p className="text-slate-400">还没有分享的视频</p>
                  </div>
                ) : (
                  <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {recentSaves.map((video, index) => (
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
                )}
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
                      {members.map((member, index) => {
                        const currentMember = members.find(m => m.user_id === currentUser?.id);
                        const canDelete = currentMember && (currentMember.role === 'Owner' || currentMember.role === 'Admin') && member.id !== currentMember.id;
                        
                        return (
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
                                  alt={member.name || member.email}
                                  className="w-10 h-10 rounded-full border-2 border-white/10"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/40/1e293b/64748b?text=U';
                                  }}
                                />
                                <div>
                                  <div className="text-white font-medium">{member.name || member.email}</div>
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
                              {canDelete && (
                                <motion.button
                                  onClick={() => handleDeleteMember(member.id, member.email)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="移除成员"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
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
                      onKeyPress={(e) => e.key === 'Enter' && !isInviting && handleSendInvite()}
                      placeholder="user@example.com"
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                      autoFocus
                      disabled={isInviting}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      角色
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                      disabled={isInviting}
                    >
                      <option value="Viewer">查看者</option>
                      <option value="Editor">编辑者</option>
                      <option value="Admin">管理员</option>
                    </select>
                  </div>
                  <div className="flex gap-4 justify-end">
                    <motion.button
                      onClick={handleCloseModal}
                      disabled={isInviting}
                      className="px-6 py-3 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-all border border-slate-700/50 disabled:opacity-50"
                      whileHover={{ scale: isInviting ? 1 : 1.05 }}
                      whileTap={{ scale: isInviting ? 1 : 0.95 }}
                    >
                      取消
                    </motion.button>
                    <motion.button
                      onClick={handleSendInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      whileHover={{ scale: inviteEmail.trim() && !isInviting ? 1.05 : 1 }}
                      whileTap={{ scale: inviteEmail.trim() && !isInviting ? 0.95 : 1 }}
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          发送中...
                        </>
                      ) : (
                        '发送邀请'
                      )}
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
