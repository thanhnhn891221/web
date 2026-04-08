'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Menu, ChevronRight, LogOut, User, Shield, Compass } from 'lucide-react';
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

interface SessionData {
  user: SessionUser;
  roles?: { code: string; name: string }[];
}

import { ConfirmModal } from '@/components/ui';

export default function Header({ sidebarCollapsed, onMenuToggle, darkMode, onThemeToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aio-session');
      if (stored) {
        setSession(JSON.parse(stored));
      }
      
      // Auto refresh session from API
      fetch('/api/auth/me').then(res => res.json()).then(data => {
         if (data.success && data.data && data.data.name !== session?.user?.name) {
             const newSession = { ...JSON.parse(stored || '{}'), user: data.data };
             localStorage.setItem('aio-session', JSON.stringify(newSession));
             setSession(newSession);
         }
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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
    // Clear old cookie format too
    document.cookie = 'aio-session=; path=/; max-age=0';
    document.cookie = 'aio-token=; path=/; max-age=0';
    router.push('/login');
  };

  // Force refresh session from network
  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data) {
        const stored = localStorage.getItem('aio-session');
        const newSession = { ...JSON.parse(stored || '{}'), user: data.data };
        localStorage.setItem('aio-session', JSON.stringify(newSession));
        setSession(newSession);
      }
    } catch {
      // Ignore network errors here
    }
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
  const primaryRole = session?.roles?.[0]?.name || '';

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

        {/* Notifications */}
        <div className="relative">
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
              if (!showUserMenu) refreshSession(); // refresh data whenever opening menu
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
                {primaryRole && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={12} className="text-[var(--primary-400)]" />
                    <span className="text-xs font-medium text-[var(--primary-400)]">
                      {primaryRole}
                    </span>
                    {session?.roles && session.roles.length > 1 && (
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
                  onClick={() => { setShowUserMenu(false); router.push('/dashboard/kms?tab=settings'); }}
                >
                  <User size={16} className="text-white/60" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--primary-800)] transition-colors text-left"
                  onClick={() => { setShowUserMenu(false); router.push('/dashboard/kms'); }}
                >
                  <Shield size={16} className="text-white/60" />
                  <span>Quản lý vai trò</span>
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
            <div className="p-4 bg-[var(--slate-50)] dark:bg-[var(--primary-950)]/50 min-h-[300px] flex flex-col items-center justify-center text-center">
              <Compass size={48} className="text-[var(--primary-400)] mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)] font-medium">Bắt đầu gõ để tìm kiếm trên AIO.MS Workspace</p>
              <p className="text-[var(--text-muted)] text-sm mt-2">Hỗ trợ tìm kiếm: Phân hệ, Cảnh báo, Nhân viên, Mã đơn hàng...</p>
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
    </header>
  );
}
