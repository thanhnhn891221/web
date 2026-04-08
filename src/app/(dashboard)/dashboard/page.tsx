'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, ShoppingCart, TrendingUp, DollarSign,
  Activity, Clock, CheckCircle, AlertTriangle, Zap,
  Layers, Shield, BarChart3, Settings, Globe, MoreHorizontal,
  ChevronRight, Factory, Warehouse, Truck, Server,
  Calculator, Gauge, Megaphone, Lightbulb, ClipboardList,
  Network, LucideIcon
} from 'lucide-react';
import { MODULES, MODULE_GROUPS, getModulesByGroup } from '@/lib/modules';
import { StatCard } from '@/components/ui';

// Map each module's icon string to the actual Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3, Shield, Network, Factory, ShoppingCart,
  CheckCircle, ClipboardList, Warehouse, Truck, Server,
  Users, Calculator, Gauge, Megaphone, Lightbulb,
  TrendingUp, Layers,
};

// Fake Data
const stats = [
  { title: 'Tổng nhân sự', value: '248', change: +5.2, icon: Users, color: 'var(--primary-500)' },
  { title: 'Đơn hàng tháng', value: '1,432', change: +12.8, icon: ShoppingCart, color: 'var(--accent-500)' },
  { title: 'Doanh thu (VND)', value: '2.4B', change: +8.1, icon: TrendingUp, color: 'var(--primary-600)' },
  { title: 'Lợi nhuận (VND)', value: '680M', change: -2.3, icon: DollarSign, color: 'var(--rose)' },
];

const recentActivities = [
  { icon: CheckCircle, text: 'Đơn hàng #OMS-1254 đã được duyệt', time: '2 phút trước', color: 'var(--emerald)' },
  { icon: Users, text: 'Nhân viên mới Nguyễn Văn A — Phòng IT', time: '15 phút trước', color: 'var(--primary-500)' },
  { icon: AlertTriangle, text: 'Kho NVL tại CN2 sắp hết hàng', time: '1 giờ trước', color: 'var(--amber)' },
  { icon: Zap, text: 'Chiến dịch Marketing Q2 đã kích hoạt', time: '2 giờ trước', color: 'var(--accent-500)' },
  { icon: Activity, text: 'Dây chuyền SX #3 đạt 98% năng suất', time: '3 giờ trước', color: 'var(--emerald)' },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState('Quản trị viên');

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aio-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.name) setUserName(parsed.user.name);
      }
    } catch {}
  }, []);

  const renderModuleGroup = (groupId: keyof typeof MODULE_GROUPS) => {
    const groupInfo = MODULE_GROUPS[groupId];
    const mods = getModulesByGroup(groupId);
    if (!mods.length) return null;

    return (
      <div key={groupId} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{groupInfo.name}</h3>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        {/* Horizontal scroll native snap for mobile */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 hide-scrollbar">
          {mods.map((mod) => (
            <Link
              key={mod.id}
              href={mod.isEnabled ? mod.href : '#'}
              onClick={(e) => !mod.isEnabled && e.preventDefault()}
              className={`
                min-w-[140px] w-[140px] sm:w-auto sm:min-w-0 snap-start shrink-0
                group relative flex flex-col items-center gap-3 p-5 rounded-2xl border
                transition-all duration-300
                ${mod.isEnabled
                  ? 'border-transparent bg-white hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                  : 'border-dashed border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                }
              `}
              style={mod.isEnabled ? { boxShadow: '0 4px 20px rgba(0,0,0,0.03)' } : {}}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:-translate-y-2 relative overflow-hidden"
                style={{
                  background: mod.isEnabled ? `linear-gradient(135deg, var(--primary-700), var(--primary-800))` : 'var(--slate-200)',
                  boxShadow: mod.isEnabled ? `inset 2px 2px 4px rgba(255,255,255,0.2), inset -3px -3px 6px rgba(0,0,0,0.4), 0 8px 16px var(--primary-800)` : 'none',
                  border: mod.isEnabled ? '1px solid var(--primary-500)' : '1px solid transparent'
                }}
              >
                {/* 3D Gloss / Light reflection */}
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[70%] bg-white/10 rounded-b-[50%] pointer-events-none rotate-[-10deg]" />

                <div
                  className="w-7 h-7 flex items-center justify-center relative z-10"
                  style={{ color: '#FFD700', opacity: mod.isEnabled ? 1 : 0.4, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}
                >
                  {(() => { const Icon = ICON_MAP[mod.icon] || Layers; return <Icon size={28} strokeWidth={2.2} />; })()}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{mod.code}</p>
                <p className="text-[11px] mt-1 text-slate-500 font-medium leading-tight line-clamp-2">
                  {mod.nameVi}
                </p>
              </div>
              {!mod.isEnabled && (
                <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded bg-slate-200 font-bold text-slate-500">
                  WIP
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO BANNER (Red Corporate) */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-lg animate-fade-in"
        style={{ background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-500) 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 blur-2xl rounded-full translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <span className="text-xs uppercase tracking-widest font-bold">AIO.MS Workspace</span>
            <span>•</span>
            <span className="text-xs">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">{getGreeting()}, {userName}!</h1>
          <p className="text-sm sm:text-base opacity-90 max-w-lg mb-6 sm:mb-0">
            Hôm nay bạn có <strong className="text-accent-300">3 báo cáo</strong> cần phê duyệt và <strong className="text-accent-300">1 cảnh báo</strong> tồn kho.
          </p>
        </div>

        <div className="relative z-10 shrink-0 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-3 bg-white text-[var(--primary-700)] font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
            Xử lý ngay <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. STATS GRID (StatCard Components) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat) => (
          <StatCard 
            key={stat.title} 
            title={stat.title} 
            value={stat.value} 
            change={stat.change} 
            icon={stat.icon} 
            color={stat.color} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. GROUPED MODULES (Main Panel) */}
        <div className="lg:col-span-2">
          {/* We map the exact groups the user defined */}
          {renderModuleGroup('bi')}
          {renderModuleGroup('operations')}
          {renderModuleGroup('market')}
          {renderModuleGroup('support')}
          {renderModuleGroup('system')}
        </div>

        {/* 4. CHARTS & ACTIVITIES (Right Panel) */}
        <div className="space-y-6">
          
          {/* Fake Visual Chart Block */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Hiệu suất Doanh thu</h2>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">7 ngày</span>
            </div>
            
            {/* CSS Fake Bar Chart for mobile scale */}
            <div className="h-[180px] flex items-end justify-between gap-2">
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end items-center gap-2 group cursor-pointer">
                  <div 
                    className="w-full rounded-md transition-all duration-300 group-hover:opacity-80"
                    style={{ 
                      height: `${h}%`, 
                      background: i === 6 ? 'linear-gradient(to top, var(--primary-500), var(--accent-400))' : 'var(--slate-200)'
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{i+1}/4</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Hoạt động Gần đây</h2>
              <Clock size={16} className="text-slate-400" />
            </div>

            <div className="space-y-5">
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-3 group">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `${activity.color}15` }}
                    >
                      <Icon size={14} style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 leading-snug">{activity.text}</p>
                      <p className="text-[11px] mt-1 text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-6 py-3 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors rounded-xl flex justify-center items-center gap-1">
              Xem tất cả <MoreHorizontal size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
