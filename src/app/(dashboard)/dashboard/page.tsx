'use client';

import React from 'react';
import {
  Users, ShoppingCart, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, BarChart3,
  Clock, CheckCircle, AlertTriangle, Zap
} from 'lucide-react';
import Link from 'next/link';
import { MODULES, MODULE_GROUPS } from '@/lib/modules';

const stats = [
  {
    title: 'Tổng nhân sự',
    value: '248',
    change: +5.2,
    icon: Users,
    color: 'var(--primary-500)',
    bgColor: 'var(--primary-50)',
  },
  {
    title: 'Đơn hàng tháng',
    value: '1,432',
    change: +12.8,
    icon: ShoppingCart,
    color: 'var(--accent-500)',
    bgColor: 'var(--accent-50)',
  },
  {
    title: 'Doanh thu',
    value: '₫2.4B',
    change: +8.1,
    icon: TrendingUp,
    color: 'var(--emerald)',
    bgColor: 'var(--emerald-light)',
  },
  {
    title: 'Lợi nhuận',
    value: '₫680M',
    change: -2.3,
    icon: DollarSign,
    color: 'var(--amber)',
    bgColor: 'var(--amber-light)',
  },
];

const recentActivities = [
  { icon: CheckCircle, text: 'Đơn hàng #OMS-1254 đã được duyệt', time: '2 phút trước', color: 'var(--emerald)' },
  { icon: Users, text: 'Nhân viên mới Nguyễn Văn A — Phòng IT', time: '15 phút trước', color: 'var(--primary-500)' },
  { icon: AlertTriangle, text: 'Kho NVL tại CN2 sắp hết hàng', time: '1 giờ trước', color: 'var(--amber)' },
  { icon: Zap, text: 'Chiến dịch Marketing Q2 đã kích hoạt', time: '2 giờ trước', color: 'var(--accent-500)' },
  { icon: Activity, text: 'Dây chuyền SX #3 đạt 98% năng suất', time: '3 giờ trước', color: 'var(--emerald)' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển Tổng quan</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Chào mừng bạn đến với AIO.MS — Hệ thống Quản trị Toàn diện
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;

          return (
            <div key={stat.title} className="card p-5 group cursor-default">
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: stat.bgColor }}
                >
                  <Icon size={22} style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                  }`}
                >
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Quick Access */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Phân hệ Hệ sinh thái</h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              {MODULES.filter((m) => m.isEnabled).length}/{MODULES.length} Đang hoạt động
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
            {MODULES.map((mod) => (
              <Link
                key={mod.id}
                href={mod.isEnabled ? mod.href : '#'}
                onClick={(e) => !mod.isEnabled && e.preventDefault()}
                className={`
                  group relative flex flex-col items-center gap-2 p-4 rounded-xl border
                  transition-all duration-200
                  ${mod.isEnabled
                    ? 'border-[var(--border-color)] hover:border-transparent hover:shadow-lg cursor-pointer'
                    : 'border-dashed border-[var(--border-color)] opacity-40 cursor-not-allowed'
                  }
                `}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: mod.isEnabled ? `${mod.color}15` : 'var(--slate-100)',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-sm"
                    style={{ background: mod.color, opacity: mod.isEnabled ? 1 : 0.3 }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold">{mod.code}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {mod.nameVi}
                  </p>
                </div>
                {!mod.isEnabled && (
                  <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded bg-[var(--slate-100)] text-[var(--text-muted)]">
                    Sắp ra mắt
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Hoạt động Gần đây</h2>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex items-start gap-3 group">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${activity.color}15` }}
                  >
                    <Icon size={16} style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{activity.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
