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
import { MODULES, MODULE_GROUPS, getModuleByCode } from '@/lib/modules';
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

  const bmsModule = getModuleByCode('BMS');
  const groupsToMap = Object.entries(MODULE_GROUPS).filter(([k]) => k !== 'bi') as [ModuleInfo['group'], typeof MODULE_GROUPS[keyof typeof MODULE_GROUPS]][];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const renderModuleLink = (mod: ModuleInfo, active: boolean, groupKey?: string) => {
    const Icon = getIcon(mod.icon);
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
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
          }
        `}
        onClick={(e) => (!mod.isEnabled || !isPermitted) && e.preventDefault()}
        title={collapsed ? `${mod.code} - ${mod.nameVi}` : undefined}
      >
        {active && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ background: mod.color || 'var(--accent-400)' }}
          />
        )}

        <div
          className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200"
          style={{
            background: active
              ? `${mod.color}30`
              : hoveredGroup === groupKey && groupKey
                ? `${mod.color}15`
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
              <p className="text-[11px] text-white/40 truncate">{mod.nameVi}</p>
            </div>
            {(!mod.isEnabled || !isPermitted) && <Lock size={12} className="text-white/20" />}
          </div>
        )}
      </Link>
    );
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
          flex flex-col border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${collapsed ? '-translate-x-full md:translate-x-0 md:w-[72px]' : 'translate-x-0 w-[260px]'}
        `}
        style={{ background: 'var(--primary-800)' }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white"
            >
              <span className="font-bold text-sm" style={{ color: 'var(--primary-700)' }}>A</span>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="text-white font-bold text-lg tracking-tight leading-none">
                  AIO.MS
                </h1>
                <p className="text-white/50 text-[10px] tracking-widest uppercase">
                  Enterprise Suite
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Link */}
        <div className="px-3 pt-4 pb-2 space-y-1">
          <Link
            href="/dashboard"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200
              ${isActive('/dashboard') && pathname === '/dashboard'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <LayoutDashboard size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-bold">Tổng quan</span>}
          </Link>
        </div>

        {/* Module Groups */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5 mt-2 custom-scrollbar">
          {/* Standalone BMS BI Modul now inside scroller */}
          {bmsModule && renderModuleLink(bmsModule, isActive(bmsModule.href), 'bi')}

          {groupsToMap.map(([groupKey, groupInfo]) => {
            const groupModules = MODULES.filter((m) => m.group === groupKey).sort((a,b) => a.order - b.order);
            if (!groupModules.length) return null;
            
            const GroupIcon = getIcon(groupInfo.icon);

            return (
              <div
                key={groupKey}
                onMouseEnter={() => setHoveredGroup(groupKey)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {!collapsed ? (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <GroupIcon size={12} className="text-white/30" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/40">
                      {groupInfo.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-px bg-white/20 rounded-full" />
                  </div>
                )}

                <div className="space-y-0.5">
                  {groupModules.map((mod) => renderModuleLink(mod, isActive(mod.href), groupKey))}
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
              rounded-lg text-white/50 hover:text-white hover:bg-white/10
              transition-all duration-200
            "
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-xs font-medium">Thu gọn hệ thống</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
