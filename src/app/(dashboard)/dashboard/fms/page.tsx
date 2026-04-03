'use client';

import React, { useState } from 'react';
import {
  Factory, Zap, Clock, BarChart3, CheckCircle, AlertTriangle,
  Settings, Activity, Users, Play, Pause, TrendingUp
} from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

interface ProductionLine {
  id: string;
  name: string;
  product: string;
  status: 'running' | 'idle' | 'maintenance' | 'changeover';
  efficiency: number;
  output: number;
  target: number;
  shift: string;
  operator: string;
  startTime: string;
}

interface ProductionOrder {
  id: string;
  code: string;
  product: string;
  quantity: number;
  completed: number;
  unit: string;
  line: string;
  priority: 'high' | 'medium' | 'low';
  status: 'queued' | 'in_progress' | 'completed' | 'on_hold';
  deadline: string;
}

const LINES: ProductionLine[] = [
  { id: '1', name: 'Dây chuyền SX #1', product: 'Bánh quy vị bơ 200g', status: 'running', efficiency: 96, output: 4800, target: 5000, shift: 'Ca sáng (06:00-14:00)', operator: 'Trần Văn Hùng', startTime: '06:00' },
  { id: '2', name: 'Dây chuyền SX #2', product: 'Bánh mì sandwich 400g', status: 'running', efficiency: 88, output: 2100, target: 2500, shift: 'Ca sáng (06:00-14:00)', operator: 'Nguyễn Thị Mai', startTime: '06:00' },
  { id: '3', name: 'Dây chuyền SX #3', product: 'Kẹo dẻo trái cây 150g', status: 'idle', efficiency: 0, output: 0, target: 3000, shift: 'Chờ nguyên liệu', operator: '—', startTime: '—' },
  { id: '4', name: 'Dây chuyền Đóng gói', product: 'Đóng gói thành phẩm', status: 'running', efficiency: 92, output: 6500, target: 7000, shift: 'Ca sáng (06:00-14:00)', operator: 'Lê Đức Phong', startTime: '06:15' },
  { id: '5', name: 'Dây chuyền Chiết rót', product: 'Nước ép trái cây 500ml', status: 'maintenance', efficiency: 0, output: 0, target: 4000, shift: 'Bảo trì định kỳ', operator: 'KCS Team', startTime: '—' },
];

const ORDERS: ProductionOrder[] = [
  { id: '1', code: 'LSX-001', product: 'Bánh quy vị bơ 200g', quantity: 10000, completed: 7200, unit: 'hộp', line: 'DC #1', priority: 'high', status: 'in_progress', deadline: '2026-04-01' },
  { id: '2', code: 'LSX-002', product: 'Bánh mì sandwich 400g', quantity: 5000, completed: 2100, unit: 'gói', line: 'DC #2', priority: 'medium', status: 'in_progress', deadline: '2026-04-02' },
  { id: '3', code: 'LSX-003', product: 'Kẹo dẻo trái cây 150g', quantity: 8000, completed: 0, unit: 'túi', line: 'DC #3', priority: 'high', status: 'on_hold', deadline: '2026-04-03' },
  { id: '4', code: 'LSX-004', product: 'Nước ép cam 500ml', quantity: 6000, completed: 6000, unit: 'chai', line: 'DC Chiết rót', priority: 'low', status: 'completed', deadline: '2026-03-31' },
  { id: '5', code: 'LSX-005', product: 'Bánh quy socola 250g', quantity: 4000, completed: 0, unit: 'hộp', line: 'DC #1', priority: 'medium', status: 'queued', deadline: '2026-04-05' },
];

const LINE_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; icon: React.ElementType }> = {
  running: { label: 'Đang chạy', variant: 'success', icon: Play },
  idle: { label: 'Chờ', variant: 'warning', icon: Pause },
  maintenance: { label: 'Bảo trì', variant: 'danger', icon: Settings },
  changeover: { label: 'Chuyển đổi', variant: 'default', icon: Activity },
};

const PRIORITY_MAP: Record<string, { label: string; variant: 'danger' | 'warning' | 'default' }> = {
  high: { label: 'Cao', variant: 'danger' },
  medium: { label: 'Trung bình', variant: 'warning' },
  low: { label: 'Thấp', variant: 'default' },
};

const ORDER_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  queued: { label: 'Đợi SX', variant: 'default' },
  in_progress: { label: 'Đang SX', variant: 'info' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  on_hold: { label: 'Tạm dừng', variant: 'warning' },
};

type Tab = 'lines' | 'orders';

export default function FMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('lines');
  const runningLines = LINES.filter(l => l.status === 'running').length;
  const avgEfficiency = Math.round(LINES.filter(l => l.status === 'running').reduce((s, l) => s + l.efficiency, 0) / Math.max(runningLines, 1));
  const totalOutput = LINES.reduce((s, l) => s + l.output, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(340, 65%, 48%, 0.12)' }}>
            <Factory size={22} style={{ color: 'hsl(340, 65%, 48%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FMS — Quản lý Nhà máy</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sản xuất, dây chuyền, năng suất & lệnh SX</p>
          </div>
        </div>
        <Button icon={Play}>Tạo lệnh SX</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Dây chuyền" value={`${runningLines}/${LINES.length}`} icon={Factory} color="hsl(340, 65%, 48%)" changeLabel="Đang chạy" />
        <StatCard title="Hiệu suất TB" value={`${avgEfficiency}%`} icon={Zap} color="var(--emerald)" />
        <StatCard title="Sản lượng hôm nay" value={totalOutput.toLocaleString()} icon={BarChart3} color="var(--primary-500)" changeLabel="sản phẩm" />
        <StatCard title="Lệnh SX đang chạy" value={ORDERS.filter(o => o.status === 'in_progress').length} icon={Activity} color="var(--amber)" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([
          { key: 'lines' as Tab, label: 'Dây chuyền', icon: Factory },
          { key: 'orders' as Tab, label: 'Lệnh sản xuất', icon: Activity },
        ]).map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'lines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in stagger-children">
          {LINES.map(line => {
            const st = LINE_STATUS[line.status];
            const pct = line.target > 0 ? Math.round((line.output / line.target) * 100) : 0;
            return (
              <Card key={line.id} hover padding="lg" className="group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{line.name}</h3>
                      <Badge variant={st.variant} icon={st.icon}>{st.label}</Badge>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{line.product}</p>
                  </div>
                  {line.status === 'running' && (
                    <span className="text-2xl font-bold" style={{ color: line.efficiency >= 90 ? 'var(--emerald)' : 'var(--amber)' }}>
                      {line.efficiency}%
                    </span>
                  )}
                </div>
                {line.status === 'running' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: 'var(--text-muted)' }}>Sản lượng</span>
                      <span className="font-semibold">{line.output.toLocaleString()} / {line.target.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--emerald)' : pct >= 70 ? 'var(--amber)' : 'var(--rose)' }} />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><Clock size={12} /> {line.shift}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {line.operator}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'orders' && (
        <Card padding="none" className="animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--slate-50)' }}>
                  {['Mã LSX', 'Sản phẩm', 'Tiến độ', 'Dây chuyền', 'Ưu tiên', 'Trạng thái', 'Hạn'].map((h, i) => (
                    <th key={i} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {ORDERS.map(order => {
                  const pct = Math.round((order.completed / order.quantity) * 100);
                  const pri = PRIORITY_MAP[order.priority];
                  const os = ORDER_STATUS[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-[var(--slate-25)] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>{order.code}</td>
                      <td className="px-5 py-3.5 text-sm">{order.product}</td>
                      <td className="px-5 py-3.5">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold">{pct}%</span>
                            <span style={{ color: 'var(--text-muted)' }}>{order.completed.toLocaleString()}/{order.quantity.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--emerald)' : 'var(--primary-500)' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">{order.line}</td>
                      <td className="px-5 py-3.5"><Badge variant={pri.variant}>{pri.label}</Badge></td>
                      <td className="px-5 py-3.5"><Badge variant={os.variant}>{os.label}</Badge></td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(order.deadline).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
