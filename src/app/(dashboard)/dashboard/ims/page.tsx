'use client';

import React from 'react';
import {
  Server, Shield, Activity, Database, HardDrive,
  Clock, FileText, AlertCircle, CheckCircle, Lock
} from 'lucide-react';

const SYSTEM_LOGS = [
  { id: '1', action: 'login', user: 'Admin', module: 'CORE', detail: 'Đăng nhập hệ thống thành công', time: '2 phút trước', icon: Lock, color: 'var(--primary-500)' },
  { id: '2', action: 'create', user: 'Trần Minh Tuấn', module: 'HMS', detail: 'Tạo mới nhân viên NV-010', time: '15 phút trước', icon: CheckCircle, color: 'var(--emerald)' },
  { id: '3', action: 'update', user: 'Admin', module: 'IMS', detail: 'Cập nhật cấu hình SMTP Mail Server', time: '1 giờ trước', icon: Server, color: 'var(--accent-500)' },
  { id: '4', action: 'export', user: 'Lê Thị Hương Giang', module: 'HMS', detail: 'Xuất báo cáo nhân sự tháng 3', time: '2 giờ trước', icon: FileText, color: 'var(--sky)' },
  { id: '5', action: 'delete', user: 'Admin', module: 'IMS', detail: 'Xóa phiên đăng nhập hết hạn', time: '5 giờ trước', icon: AlertCircle, color: 'var(--rose)' },
];

const SYSTEM_STATS = [
  { label: 'Uptime', value: '99.98%', icon: Activity, color: 'var(--emerald)' },
  { label: 'DB Size', value: '2.4 GB', icon: Database, color: 'var(--primary-500)' },
  { label: 'Storage', value: '18/50 GB', icon: HardDrive, color: 'var(--accent-500)' },
  { label: 'Sessions', value: '24', icon: Shield, color: 'var(--amber)' },
];

export default function IMSPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'hsl(250, 60%, 52%, 0.12)' }}
        >
          <Server size={22} style={{ color: 'hsl(250, 60%, 52%)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IMS — Quản lý CNTT</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bảo mật, hạ tầng hệ thống, audit logs & tenant
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {SYSTEM_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Nhật ký Hệ thống (Audit Log)</h2>
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cập nhật real-time</span>
          </div>
        </div>

        <div className="space-y-3">
          {SYSTEM_LOGS.map((log) => {
            const Icon = log.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--slate-50)] transition-colors group"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${log.color}12` }}
                >
                  <Icon size={18} style={{ color: log.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{log.user}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--slate-100)', color: 'var(--text-muted)' }}>
                      {log.module}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{log.detail}</p>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
