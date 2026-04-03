'use client';

import React from 'react';
import { Network, MapPin, Users, TrendingUp, DollarSign, ShoppingBag, Star, Phone, BarChart3 } from 'lucide-react';
import { Button, Badge, Card, StatCard } from '@/components/ui';

const DISTRIBUTORS = [
  { id: '1', code: 'DL-001', name: 'Đại lý Phương Nam', region: 'Đồng Nai', type: 'Cấp 1', contact: 'Phạm Văn Long', phone: '0251-234-5678', revenue: 320000000, orders: 45, stores: 12, rating: 4.5 },
  { id: '2', code: 'DL-002', name: 'NPP Miền Tây Sông Hậu', region: 'Cần Thơ', type: 'Cấp 1', contact: 'Trần Thị Bích', phone: '0292-345-6789', revenue: 580000000, orders: 78, stores: 25, rating: 4.7 },
  { id: '3', code: 'DL-003', name: 'Đại lý Tây Nguyên', region: 'Đắk Lắk', type: 'Cấp 2', contact: 'Nguyễn Văn Hùng', phone: '0262-456-7890', revenue: 150000000, orders: 22, stores: 8, rating: 4.2 },
  { id: '4', code: 'DL-004', name: 'NPP Bắc Trung Bộ', region: 'Đà Nẵng', type: 'Cấp 1', contact: 'Lê Quốc Việt', phone: '0236-567-8901', revenue: 420000000, orders: 56, stores: 18, rating: 4.6 },
  { id: '5', code: 'DL-005', name: 'Đại lý Sài Gòn Food', region: 'TP.HCM', type: 'Cấp 1', contact: 'Hoàng Minh Tuấn', phone: '028-678-9012', revenue: 890000000, orders: 112, stores: 35, rating: 4.8 },
  { id: '6', code: 'DL-006', name: 'Đại lý Hà Nội Express', region: 'Hà Nội', type: 'Cấp 2', contact: 'Vũ Thị Ngọc', phone: '024-789-0123', revenue: 280000000, orders: 34, stores: 10, rating: 4.3 },
];

const TYPE_COLORS: Record<string, string> = { 'Cấp 1': 'var(--emerald)', 'Cấp 2': 'var(--amber)' };

export default function DMSPage() {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const totalRev = DISTRIBUTORS.reduce((s, d) => s + d.revenue, 0);
  const totalStores = DISTRIBUTORS.reduce((s, d) => s + d.stores, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(260, 55%, 52%, 0.12)' }}>
            <Network size={22} style={{ color: 'hsl(260, 55%, 52%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DMS — Quản lý Phân phối</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mạng lưới đại lý, kênh phân phối, vùng miền</p>
          </div>
        </div>
        <Button icon={Network}>Thêm đại lý</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng đại lý" value={DISTRIBUTORS.length} icon={Network} color="hsl(260, 55%, 52%)" />
        <StatCard title="Điểm bán" value={totalStores} icon={MapPin} color="var(--accent-500)" />
        <StatCard title="Doanh thu kênh" value={fmt(totalRev)} icon={DollarSign} color="var(--emerald)" />
        <StatCard title="Rating TB" value={`${(DISTRIBUTORS.reduce((s, d) => s + d.rating, 0) / DISTRIBUTORS.length).toFixed(1)}★`} icon={Star} color="var(--amber)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
        {DISTRIBUTORS.map(dist => (
          <Card key={dist.id} hover padding="lg" className="group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono font-semibold" style={{ color: 'var(--primary-500)' }}>{dist.code}</p>
                <h3 className="text-base font-semibold mt-1">{dist.name}</h3>
              </div>
              <Badge variant="custom" color={TYPE_COLORS[dist.type]} bg={`${TYPE_COLORS[dist.type]}15`}>{dist.type}</Badge>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dist.region}</span>
              <span className="ml-auto flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--amber)' }}>{dist.rating}★</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Doanh thu</p><p className="text-sm font-bold">{(dist.revenue / 1e6).toFixed(0)}M</p></div>
              <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đơn hàng</p><p className="text-sm font-bold">{dist.orders}</p></div>
              <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Điểm bán</p><p className="text-sm font-bold">{dist.stores}</p></div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Users size={12} /> {dist.contact} · <Phone size={12} /> {dist.phone}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
