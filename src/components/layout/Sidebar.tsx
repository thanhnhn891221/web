'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, Server, Users, ShoppingCart, Warehouse, Truck,
  Factory, CheckCircle, Lightbulb, Megaphone, TrendingUp,
  ClipboardList, Network, Calculator, Gauge, BarChart3,
  ChevronLeft, ChevronRight, Layers, Settings, Globe, Crown,
  LayoutDashboard, LucideIcon, Lock
} from 'lucide-react';
import { MODULES, MODULE_GROUPS } from '@/lib/modules';
import { ModuleInfo } from '@/types';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Server, Users, ShoppingCart, Warehouse, Truck,
  Factory, CheckCircle, Lightbulb, Megaphone, TrendingUp,
  ClipboardList, Network, Calculator, Gauge, BarChart3,
  Layers, Settings, Globe, Crown, LayoutDashboard, Lock,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Shield;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [allowedModules, setAllowedModules] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aio-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.permissions) {
          const allowed = new Set<string>();
          parsed.permissions.forEach((p: any) => {
            if (p.canView) allowed.add(p.moduleCode);
          });
          setAllowedModules(allowed);
        }
        if (parsed.roles?.some((r: any) => r.code === 'super_admin' || r.code === 'admin')) {
          setIsAdmin(true);
        }
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const groups = Object.entries(MODULE_GROUPS) as [ModuleInfo['group'], typeof MODULE_GROUPS[keyof typeof MODULE_GROUPS]][];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${collapsed ? '-translate-x-full md:translate-x-0 md:w-[72px]' : 'translate-x-0 w-[260px]'}
        `}
        style={{ background: 'var(--bg-sidebar)' }}
      >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.3)',
            }}
          >
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-white font-bold text-lg tracking-tight leading-none">
                AIO.MS
              </h1>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">
                Enterprise Suite
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overview Link */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200
            ${isActive('/dashboard')
              ? 'bg-white/12 text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/6'
            }
          `}
        >
          <LayoutDashboard size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Tổng quan</span>}
        </Link>
      </div>

      {/* Module Groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {groups.map(([groupKey, groupInfo]) => {
          const groupModules = MODULES.filter((m) => m.group === groupKey);
          const GroupIcon = getIcon(groupInfo.icon);

          return (
            <div
              key={groupKey}
              onMouseEnter={() => setHoveredGroup(groupKey)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              {/* Group Header */}
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                  <GroupIcon size={12} className="text-white/30" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-white/30">
                    {groupInfo.name}
                  </span>
                </div>
              )}

              {collapsed && (
                <div className="flex justify-center py-1.5 mb-1">
                  <div className="w-6 h-px bg-white/15 rounded-full" />
                </div>
              )}

              {/* Module Links */}
              <div className="space-y-0.5">
                {groupModules.map((mod) => {
                  const Icon = getIcon(mod.icon);
                  const active = isActive(mod.href);
                  const isPermitted = !isLoaded || isAdmin || allowedModules.has(mod.code);

                  return (
                    <Link
                      key={mod.id}
                      href={mod.isEnabled && isPermitted ? mod.href : '#'}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${(!mod.isEnabled || !isPermitted) ? 'cursor-not-allowed opacity-40' : ''}
                        ${active
                          ? 'bg-white/12 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/6'
                        }
                      `}
                      onClick={(e) => (!mod.isEnabled || !isPermitted) && e.preventDefault()}
                      title={collapsed ? `${mod.code} - ${mod.nameVi}` : undefined}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: mod.color }}
                        />
                      )}

                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{
                          background: active
                            ? `${mod.color}22`
                            : hoveredGroup === groupKey
                              ? `${mod.color}0a`
                              : 'transparent',
                        }}
                      >
                        <Icon
                          size={18}
                          style={{ color: active ? mod.color : undefined }}
                        />
                      </div>

                      {!collapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">{mod.code}</p>
                            <p className="text-[11px] text-white/30 truncate">{mod.nameVi}</p>
                          </div>
                          {(!mod.isEnabled || !isPermitted) && <Lock size={12} className="text-white/20" />}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="
            w-full flex items-center justify-center gap-2 px-3 py-2
            rounded-lg text-white/40 hover:text-white hover:bg-white/6
            transition-all duration-200
          "
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Thu gọn</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
