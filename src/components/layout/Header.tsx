'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, Sun, Moon, Menu, ChevronRight, LogOut, User, Shield, Compass, RefreshCw, Check, X, Eye, Plus, Edit, Trash2, Key } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { MODULES } from '@/lib/modules';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface RolePermission {
  moduleCode: string;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RoleData {
  id: string;
  code: string;
  name: string;
  permissions?: RolePermission[];
}

interface EmployeeData {
  code: string;
  department: string;
  position: string;
  status: string;
  level: string;
}

interface SessionData {
  user: SessionUser;
  roles?: RoleData[];
  employee?: EmployeeData | null;
}

// ─── Sync Status Types ───────────────────────────────────
interface SyncTask {
  key: string;
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

import { ConfirmModal, Modal, Badge } from '@/components/ui';

export default function Header({ sidebarCollapsed, onMenuToggle, darkMode, onThemeToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '', loading: false });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // ─── Sync State ─────────────────────────────────────────
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([
    { key: 'session', label: 'Phiên đăng nhập', status: 'pending' },
    { key: 'hms', label: 'Nhân sự (HMS)', status: 'pending' },
    { key: 'kms', label: 'Phân quyền (KMS)', status: 'pending' },
  ]);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInitialized = useRef(false);

  const updateSyncTask = useCallback((key: string, status: SyncTask['status']) => {
    setSyncTasks(prev => prev.map(t => t.key === key ? { ...t, status } : t));
  }, []);

  // ─── Background Sync Engine (Non-intrusive) ─────────────
  const runBackgroundSync = useCallback(async (moduleCode?: string) => {
    // If we're already syncing and no specific module is requested, skip
    if (!moduleCode && isSyncing) return;
    
    setIsSyncing(true);

    // 1. Sync Session
    if (!moduleCode || moduleCode === 'session') {
      updateSyncTask('session', 'loading');
      try {
        const stored = localStorage.getItem('aio-session');
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.data) {
          const newSession: SessionData = {
            user: { id: data.data.userId, name: data.data.name, email: data.data.email },
            roles: data.data.roles,
            employee: data.data.employee,
          };
          const existingSession = stored ? JSON.parse(stored) : {};
          const merged = { ...existingSession, ...newSession };
          localStorage.setItem('aio-session', JSON.stringify(merged));
          setSession(merged);
          updateSyncTask('session', 'done');
        } else {
          updateSyncTask('session', 'error');
        }
      } catch {
        updateSyncTask('session', 'error');
      }
    }

    // 2. Prefetch HMS data
    if (!moduleCode || moduleCode === 'hms') {
      updateSyncTask('hms', 'loading');
      try {
        const [empRes, deptRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/departments'),
        ]);
        const empJson = await empRes.json();
        const deptJson = await deptRes.json();
        
        // Silent Refresh: Only update if successful, don't clear beforehand
        if (empJson.success) sessionStorage.setItem('hms_employees', JSON.stringify(empJson.data));
        if (deptJson.success) sessionStorage.setItem('hms_departments', JSON.stringify(deptJson.data));
        
        // Post-sync update event for active pages
        window.dispatchEvent(new CustomEvent('aio-sync-complete', { detail: { module: 'hms' } }));
        updateSyncTask('hms', 'done');
      } catch {
        updateSyncTask('hms', 'error');
      }
    }

    // 3. Prefetch KMS/Roles data
    if (!moduleCode || moduleCode === 'kms') {
      updateSyncTask('kms', 'loading');
      try {
        const roleRes = await fetch('/api/core/roles');
        const roleJson = await roleRes.json();
        if (roleJson.success) {
          sessionStorage.setItem('aio_kms_rbac_cache', JSON.stringify(roleJson.data));
          sessionStorage.setItem('hms_roles', JSON.stringify(roleJson.data.roles));
          window.dispatchEvent(new CustomEvent('aio-sync-complete', { detail: { module: 'kms' } }));
        }
        updateSyncTask('kms', 'done');
      } catch {
        updateSyncTask('kms', 'error');
      }
    }

    setIsSyncing(false);
  }, [updateSyncTask, isSyncing]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp', loading: false });
      return;
    }
    setPasswordStatus({ type: '', message: '', loading: true });
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus({ type: 'success', message: 'Thay đổi mật khẩu thành công.', loading: false });
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordForm({ current: '', new: '', confirm: '' });
          setPasswordStatus({ type: '', message: '', loading: false });
        }, 2000);
      } else {
        setPasswordStatus({ type: 'error', message: data.error || 'Có lỗi xảy ra', loading: false });
      }
    } catch {
      setPasswordStatus({ type: 'error', message: 'Lỗi kết nối', loading: false });
    }
  };

  // Handle global sync triggers from other components
  useEffect(() => {
    const handleGlobalSync = (e: any) => {
      const targetModule = e.detail?.module;
      runBackgroundSync(targetModule);
    };
    window.addEventListener('aio-sync-request', handleGlobalSync);
    return () => window.removeEventListener('aio-sync-request', handleGlobalSync);
  }, [runBackgroundSync]);

  // Load session from localStorage immediately, then trigger background sync
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aio-session');
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    // Kick off background sync
    runBackgroundSync();
  }, [runBackgroundSync]);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (syncRef.current && !syncRef.current.contains(target)) {
        setShowSyncPanel(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const executeLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client-side logout even if API fails
    }
    localStorage.removeItem('aio-session');
    sessionStorage.clear();
    document.cookie = 'aio-session=; path=/; max-age=0';
    document.cookie = 'aio-token=; path=/; max-age=0';
    router.push('/login');
  };

  // Force re-sync
  const handleForceSync = () => {
    syncInitialized.current = false;
    setSyncTasks(prev => prev.map(t => ({ ...t, status: 'pending' as const })));
    runBackgroundSync();
  };

  // Build breadcrumb from pathname
  const getBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return [{ label: 'Tổng quan' }];

    const items: { label: string; href?: string; labelExt?: string }[] = [
      { label: 'Tổng quan', href: '/dashboard' },
    ];

    const moduleCode = parts[1]?.toUpperCase();
    const mod = MODULES.find((m) => m.code === moduleCode);
    if (mod) {
      items.push({ label: mod.code, labelExt: ` — ${mod.nameVi}` });
    } else if (parts[1]) {
      items.push({ label: parts[1].charAt(0).toUpperCase() + parts[1].slice(1) });
    }

    return items;
  };

  const breadcrumb = getBreadcrumb();
  const userName = session?.user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ─── Compute sync stats ────────────────────────────
  const syncDoneCount = syncTasks.filter(t => t.status === 'done').length;
  const syncTotal = syncTasks.length;
  const allSyncDone = syncDoneCount === syncTotal;

  // ─── Status color helpers ──────────────────────────
  const statusLabel: Record<string, string> = {
    active: 'Đang làm việc',
    probation: 'Thử việc',
    on_leave: 'Nghỉ phép',
    resigned: 'Đã nghỉ',
  };

  const levelLabel: Record<string, string> = {
    intern: 'Thực tập sinh',
    junior: 'Nhân viên',
    senior: 'Chuyên viên',
    lead: 'Trưởng nhóm',
    manager: 'Trưởng phòng',
    director: 'Giám đốc',
  };

  return (
    <header
      className={`glass fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-6 transition-all duration-300 left-0 ${
        sidebarCollapsed ? 'md:left-[72px]' : 'md:left-[260px]'
      }`}
    >
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={14} className="text-[var(--text-muted)]" />}
              <span
                className={`
                  ${i === breadcrumb.length - 1
                    ? 'font-semibold text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors'
                  } text-sm whitespace-nowrap
                `}
              >
                {item.label}
                {item.labelExt && <span className="hidden sm:inline">{item.labelExt}</span>}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Search size={18} />
        </button>

        {/* Desktop Search */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="cursor-text hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--slate-50)] dark:bg-[var(--slate-800)] border border-[var(--border-color)] transition-colors min-w-[200px]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            onClick={(e) => { e.preventDefault(); alert("Chức năng tìm kiếm toàn cầu đang được tích hợp."); }}
            className="cursor-text bg-transparent text-sm outline-none w-full placeholder:text-[var(--text-muted)] border-none pointer-events-none"
            readOnly
          />
          <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-color)] text-[var(--text-muted)] font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Sync Status Icon */}
        <div className="relative" ref={syncRef}>
          <button 
            onClick={() => setShowSyncPanel(!showSyncPanel)}
            className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Trạng thái đồng bộ dữ liệu"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin text-[var(--primary-500)]' : (allSyncDone ? 'text-emerald-500' : 'text-[var(--text-muted)]')} />
            {!allSyncDone && !isSyncing && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
            )}
          </button>
          
          {showSyncPanel && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden animate-scale-in bg-[var(--primary-950)] text-white"
                 style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--primary-800)' }}>
              <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--primary-800)' }}>
                <span className="font-semibold text-sm">Đồng bộ dữ liệu</span>
                <button 
                  onClick={handleForceSync}
                  className="text-[10px] text-white/70 cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Đồng bộ lại
                </button>
              </div>
              <div className="p-2 space-y-1">
                {syncTasks.map(task => (
                  <div key={task.key} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 group">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium">{task.label}</span>
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-[10px]">
                      {task.status === 'loading' && <RefreshCw size={12} className="animate-spin text-blue-400" />}
                      <span className={`cursor-pointer hover:underline ${
                        task.status === 'loading' ? 'text-blue-400' :
                        task.status === 'done' ? 'text-emerald-400' :
                        task.status === 'error' ? 'text-rose-400' : 'text-white/40'
                      }`} onClick={() => runBackgroundSync(task.key)}>
                        {task.status === 'loading' ? 'Sync...' :
                         task.status === 'done' ? 'Done' :
                         task.status === 'error' ? 'Retry' : 'Pending'}
                      </span>
                      {task.status !== 'loading' && (
                         <button onClick={() => runBackgroundSync(task.key)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                            <RefreshCw size={10} />
                         </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t text-center" style={{ borderColor: 'var(--primary-800)' }}>
                <span className="text-[10px] text-white/40">{syncDoneCount}/{syncTotal} hoàn tất</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--rose)] border border-white" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden animate-scale-in bg-[var(--primary-950)] text-white"
                 style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--primary-800)' }}>
              <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--primary-800)' }}>
                <span className="font-semibold text-sm">Thông báo</span>
                <span className="text-[10px] text-white/70 cursor-pointer hover:text-white transition-colors">Đánh dấu tất cả đã đọc</span>
              </div>
              <div className="p-8 flex flex-col items-center justify-center pointer-events-none opacity-50">
                <Bell size={24} className="mb-2" />
                <span className="text-xs">Chưa có thông báo nào.</span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-3 ml-2 pl-3 border-l border-[var(--border-color)] hover:opacity-80 transition-opacity"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs text-[var(--text-muted)]">{getGreeting()}</p>
              <p className="text-sm font-semibold leading-tight">{userName}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))' }}
            >
              {userInitial}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden animate-scale-in bg-[var(--primary-950)] text-white"
              style={{
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                border: '1px solid var(--primary-800)',
              }}
            >
              {/* User Info */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--primary-800)' }}>
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs mt-0.5 text-white/60">
                  {session?.user?.email || ''}
                </p>
                {session?.roles && session.roles.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={12} className="text-[var(--primary-400)]" />
                    <span className="text-xs font-medium text-[var(--primary-400)]">
                      {session.roles[0].name}
                    </span>
                    {session.roles.length > 1 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--primary-800)] text-[var(--primary-100)]"
                      >
                        +{session.roles.length - 1} roles
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--primary-800)] transition-colors text-left"
                  onClick={() => { setShowUserMenu(false); setIsProfileModalOpen(true); }}
                >
                  <User size={16} className="text-white/60" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--primary-800)] transition-colors text-left"
                  onClick={() => { setShowUserMenu(false); setIsRoleModalOpen(true); }}
                >
                  <Shield size={16} className="text-white/60" />
                  <span>Quyền của tôi</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t" style={{ borderColor: 'var(--primary-800)' }}>
                <button
                  onClick={() => { setShowUserMenu(false); setIsLogoutModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-rose-500/20 transition-colors text-left text-rose-400 hover:text-rose-300"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-[var(--bg-card)] rounded-xl shadow-2xl overflow-hidden border border-[var(--border-color)] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)]">
              <Search className="text-[var(--text-muted)] mr-3" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="Tìm kiếm ứng dụng, tài liệu, báo cáo..." 
                className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] text-lg placeholder-[var(--text-muted)]"
              />
              <kbd className="hidden sm:inline-block ml-3 px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--slate-100)] dark:bg-[var(--primary-900)] text-[var(--text-muted)]">ESC</kbd>
            </div>
            <div className="p-4 bg-[var(--slate-50)] dark:bg-[var(--primary-900)]/10 min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--primary-500)15' }}>
                 <Compass size={40} className="text-[var(--primary-500)]" />
              </div>
              <p className="text-[var(--text-primary)] font-bold text-lg">Bắt đầu gõ để tìm kiếm trên AIO.MS Workspace</p>
              <p className="text-[var(--text-secondary)] text-sm mt-1 max-w-sm">Hỗ trợ tìm kiếm: Phân hệ, Cảnh báo, Nhân viên, Mã đơn hàng...</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Xác nhận Đăng xuất"
        message="Bạn có chắc chắn muốn thoát khỏi hệ thống AIO.MS không? Phiên làm việc sẽ kết thúc ngay lập tức."
        type="warning"
        onConfirm={executeLogout}
      />

      {/* Profile Modal */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Hồ sơ nhân viên"
        size="md"
      >
        <div className="flex flex-col items-center p-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4"
               style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))' }}>
            {userInitial}
          </div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-white/60 text-sm">{session?.user?.email}</p>
          
          {session?.employee ? (
            <div className="w-full mt-6 space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Mã NV:</span>
                <span className="font-semibold text-white">{session.employee.code}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Phòng ban:</span>
                <span className="font-semibold text-white">{session.employee.department}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Vị trí chức danh:</span>
                <span className="font-semibold text-white">{session.employee.position}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Trạng thái:</span>
                <Badge variant="success">{statusLabel[session.employee.status] || session.employee.status}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Cấp bậc:</span>
                <Badge variant="default">{levelLabel[session.employee.level] || session.employee.level}</Badge>
              </div>
            </div>
          ) : (
             <div className="w-full mt-6 p-4 rounded-xl border border-white/20 bg-white/5 text-white/70 text-sm text-center">
               <p className="font-medium mb-1">⚙️ Tài khoản hệ thống</p>
               <p className="text-xs text-white/50">Tài khoản này chưa liên kết với hồ sơ nhân sự trong phân hệ HMS. Vui lòng liên hệ quản trị viên nếu cần bổ sung.</p>
             </div>
          )}

          {/* Show role summary in profile too */}
          {session?.roles && session.roles.length > 0 && (
            <div className="w-full mt-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-bold">Vai trò hệ thống</p>
              <div className="flex flex-wrap gap-2">
                {session.roles.map(r => (
                  <span key={r.code} className="text-xs px-3 py-1.5 rounded-full bg-[var(--primary-600)] text-white font-medium">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Change Password Toggle */}
          <div className="w-full mt-4 pt-4 border-t border-white/10">
             <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
               <span className="flex items-center gap-2"><Key size={16} className="text-amber-400" /> Đổi mật khẩu đăng nhập</span>
               <ChevronRight size={16} className={`transition-transform ${isChangingPassword ? 'rotate-90' : ''}`} />
             </button>
             
             {isChangingPassword && (
               <form onSubmit={handleChangePassword} className="mt-3 space-y-3 animate-fade-in p-4 rounded-xl bg-black/20 border border-white/5">
                 <div className="space-y-1">
                   <label className="text-xs text-white/60">Mật khẩu hiện tại</label>
                   <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-[var(--primary-400)] transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-white/60">Mật khẩu mới</label>
                   <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-[var(--primary-400)] transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs text-white/60">Xác nhận mật khẩu mới</label>
                   <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-[var(--primary-400)] transition-colors" />
                 </div>
                 
                 {passwordStatus.message && (
                   <div className={`p-2 rounded text-xs text-center font-medium ${passwordStatus.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                     {passwordStatus.message}
                   </div>
                 )}
                 
                 <button type="submit" disabled={passwordStatus.loading} className="w-full py-2.5 rounded-lg bg-[var(--primary-500)] text-white text-sm font-bold disabled:opacity-50">
                    {passwordStatus.loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                 </button>
               </form>
             )}
          </div>
        </div>
      </Modal>

      {/* Roles & Permissions Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        title="Thông tin phân quyền cá nhân"
        size="lg"
      >
        <div className="space-y-4">
           {session?.roles && session.roles.length > 0 ? (
             <div className="space-y-6">
                {session.roles.map(role => (
                  <div key={role.code} className="border border-white/10 rounded-xl overflow-hidden">
                    {/* Role header */}
                    <div className="flex items-center gap-3 p-4 bg-white/5">
                      <Shield size={20} className="text-[var(--primary-400)]" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{role.name}</h4>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider">{role.code}</p>
                      </div>
                    </div>
                    
                    {/* Permission matrix */}
                    {role.permissions && role.permissions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-white/5 text-white/50 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2 text-left font-bold">Phân hệ</th>
                              <th className="px-3 py-2 text-center font-bold"><Eye size={12} className="inline" /> Xem</th>
                              <th className="px-3 py-2 text-center font-bold"><Plus size={12} className="inline" /> Tạo</th>
                              <th className="px-3 py-2 text-center font-bold"><Edit size={12} className="inline" /> Sửa</th>
                              <th className="px-3 py-2 text-center font-bold"><Trash2 size={12} className="inline" /> Xóa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {role.permissions.map(perm => (
                              <tr key={perm.moduleCode} className="hover:bg-white/5">
                                <td className="px-4 py-2">
                                  <span className="font-semibold text-white">{perm.moduleCode}</span>
                                  <span className="text-white/40 ml-1.5">{perm.moduleName}</span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {perm.canView ? <Check size={14} className="inline text-emerald-400" /> : <X size={14} className="inline text-white/20" />}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {perm.canCreate ? <Check size={14} className="inline text-blue-400" /> : <X size={14} className="inline text-white/20" />}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {perm.canEdit ? <Check size={14} className="inline text-amber-400" /> : <X size={14} className="inline text-white/20" />}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {perm.canDelete ? <Check size={14} className="inline text-rose-400" /> : <X size={14} className="inline text-white/20" />}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-white/40 text-xs">Chưa có quyền nào được cấu hình cho vai trò này.</div>
                    )}
                  </div>
                ))}
             </div>
           ) : (
             <p className="text-white/50 text-sm">Chưa được gán vào nhóm phân quyền nào.</p>
           )}
           <p className="text-xs text-amber-500/80 mt-4 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg">
             Lưu ý: Nếu một vai trò mới được cấp vừa xong, bạn có thể cần phải <b>Đăng xuất và đăng nhập lại</b> để token đồng bộ quyền mới vào Client Middleware.
           </p>
        </div>
      </Modal>
    </header>
  );
}
