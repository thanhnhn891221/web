'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Menu, ChevronRight, LogOut, User, Shield } from 'lucide-react';
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
        <button className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Search size={18} />
        </button>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--slate-50)] dark:bg-[var(--slate-800)] border border-[var(--border-color)] transition-colors min-w-[200px]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-[var(--text-muted)]"
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
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden animate-scale-in bg-white"
                 style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)' }}>
              <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold text-sm">Thông báo</span>
                <span className="text-[10px] text-blue-500 cursor-pointer hover:underline">Đánh dấu tất cả đã đọc</span>
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
              className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden animate-scale-in"
              style={{
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
              }}
            >
              {/* User Info */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {session?.user?.email || ''}
                </p>
                {primaryRole && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={12} style={{ color: 'var(--primary-400)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--primary-400)' }}>
                      {primaryRole}
                    </span>
                    {session?.roles && session.roles.length > 1 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--primary-50)', color: 'var(--primary-500)' }}
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
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--slate-100)] transition-colors text-left"
                  onClick={() => { setShowUserMenu(false); router.push('/dashboard/core?tab=settings'); }}
                >
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--slate-100)] transition-colors text-left"
                  onClick={() => { setShowUserMenu(false); router.push('/dashboard/core'); }}
                >
                  <Shield size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>Quản lý vai trò</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => { setShowUserMenu(false); setIsLogoutModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  style={{ color: 'var(--rose)' }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
