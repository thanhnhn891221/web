'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, Search, Phone, Mail, MapPin, Star, ShoppingBag } from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

const CUSTOMERS = [
  { id: '1', code: 'KH-001', name: 'Siêu thị CoopMart', contact: 'Lê Thị Hà', phone: '028-1234-5678', email: 'ha@coopmart.vn', address: 'TP.HCM', totalOrders: 156, totalRevenue: 2400000000, tier: 'platinum' },
  { id: '2', code: 'KH-002', name: 'Bách Hóa Xanh', contact: 'Trần Minh An', phone: '028-9876-5432', email: 'an@bhx.vn', address: 'TP.HCM', totalOrders: 98, totalRevenue: 1800000000, tier: 'gold' },
  { id: '3', code: 'KH-003', name: 'Vinmart', contact: 'Nguyễn Quốc Việt', phone: '024-5555-6666', email: 'viet@vinmart.vn', address: 'Hà Nội', totalOrders: 72, totalRevenue: 950000000, tier: 'gold' },
  { id: '4', code: 'KH-004', name: 'Đại lý Phương Nam', contact: 'Phạm Văn Long', phone: '0251-234-5678', email: 'long@gmail.com', address: 'Đồng Nai', totalOrders: 45, totalRevenue: 320000000, tier: 'silver' },
  { id: '5', code: 'KH-005', name: 'Mini Stop Q.1', contact: 'Hoàng Thị Dung', phone: '028-7777-8888', email: 'dung@ministop.vn', address: 'Q.1, TP.HCM', totalOrders: 23, totalRevenue: 85000000, tier: 'bronze' },
];

const PIPELINE = [
  { id: '1', customer: 'Siêu thị Lotte', product: 'Gói combo bánh mì Q2', value: 500000000, stage: 'negotiation', probability: 75, owner: 'Phạm Đức Anh' },
  { id: '2', customer: 'Circle K Việt Nam', product: 'HĐ độc quyền kẹo dẻo', value: 1200000000, stage: 'proposal', probability: 50, owner: 'Hoàng Minh Châu' },
  { id: '3', customer: '7-Eleven VN', product: 'Cung cấp sandwich tươi', value: 800000000, stage: 'qualified', probability: 30, owner: 'Phạm Đức Anh' },
  { id: '4', customer: 'BigC', product: 'Chương trình KM mùa hè', value: 350000000, stage: 'lead', probability: 15, owner: 'Hoàng Minh Châu' },
  { id: '5', customer: 'Family Mart', product: 'HĐ nước ép cam tươi', value: 420000000, stage: 'closed_won', probability: 100, owner: 'Phạm Đức Anh' },
];

const TIER_COLORS: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: '#CD7F32' }, silver: { label: 'Silver', color: '#C0C0C0' },
  gold: { label: 'Gold', color: '#FFD700' }, platinum: { label: 'Platinum', color: '#B0B0B0' },
};

const STAGE_MAP: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; pct: number }> = {
  lead: { label: 'Lead mới', variant: 'default', pct: 10 }, qualified: { label: 'Đủ điều kiện', variant: 'info', pct: 30 },
  proposal: { label: 'Đã gửi đề xuất', variant: 'info', pct: 50 }, negotiation: { label: 'Đang đàm phán', variant: 'warning', pct: 75 },
  closed_won: { label: 'Chốt thành công', variant: 'success', pct: 100 }, closed_lost: { label: 'Thất bại', variant: 'danger', pct: 0 },
};

type Tab = 'customers' | 'pipeline';

export default function SMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('customers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<(typeof CUSTOMERS)[0] | null>(null);
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const totalRev = CUSTOMERS.reduce((s, c) => s + c.totalRevenue, 0);
  const pipeVal = PIPELINE.filter(p => !p.stage.startsWith('closed')).reduce((s, p) => s + p.value, 0);
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(15, 80%, 55%, 0.12)' }}>
            <TrendingUp size={22} style={{ color: 'hsl(15, 80%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SMS — Quản lý Bán hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Doanh số, khách hàng, pipeline & loyalty</p>
          </div>
        </div>
        <Button icon={Users}>Thêm khách hàng</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Khách hàng" value={CUSTOMERS.length} icon={Users} color="var(--primary-500)" />
        <StatCard title="Doanh thu tổng" value={fmt(totalRev)} icon={DollarSign} color="var(--emerald)" />
        <StatCard title="Pipeline" value={fmt(pipeVal)} icon={Target} color="var(--amber)" changeLabel="Đang chờ chốt" />
        <StatCard title="Tỷ lệ chốt" value="62%" icon={TrendingUp} color="var(--accent-500)" change={8.5} />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([{ key: 'customers' as Tab, label: 'Khách hàng', icon: Users }, { key: 'pipeline' as Tab, label: 'Pipeline', icon: Target }]).map(tab => {
          const Icon = tab.icon;
          return (<button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
            <Icon size={16} />{tab.label}</button>);
        })}
      </div>

      {activeTab === 'customers' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Tìm khách hàng..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filtered.map(c => {
              const t = TIER_COLORS[c.tier];
              return (
                <Card key={c.id} hover padding="lg" className="group cursor-pointer" onClick={() => setSelected(c)}>
                  <div className="flex items-start justify-between">
                    <div><p className="text-xs font-mono font-semibold" style={{ color: 'var(--primary-500)' }}>{c.code}</p>
                      <h3 className="text-base font-semibold mt-1">{c.name}</h3></div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: `${t.color}20`, color: t.color }}><Star size={12} /> {t.label}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tổng đơn</p><p className="text-sm font-bold">{c.totalOrders}</p></div>
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Doanh thu</p><p className="text-sm font-bold">{(c.totalRevenue / 1e9).toFixed(1)}B</p></div>
                  </div>
                </Card>);
            })}
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="space-y-3 animate-fade-in">
          {PIPELINE.map(deal => {
            const stage = STAGE_MAP[deal.stage];
            return (
              <Card key={deal.id} hover padding="lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{deal.customer}</h3><Badge variant={stage.variant}>{stage.label}</Badge></div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{deal.product}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>Phụ trách: {deal.owner}</span><span>Xác suất: <strong>{deal.probability}%</strong></span>
                    </div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--primary-500)' }}>{fmt(deal.value)}</p>
                </div>
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                  <div className="h-full rounded-full" style={{ width: `${stage.pct}%`, background: deal.stage === 'closed_won' ? 'var(--emerald)' : 'var(--primary-500)' }} />
                </div>
              </Card>);
          })}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} description={selected?.code}
        footer={<Button variant="ghost" onClick={() => setSelected(null)}>Đóng</Button>}>
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            {[{ l: 'Liên hệ', v: selected.contact, i: Users }, { l: 'SĐT', v: selected.phone, i: Phone },
              { l: 'Email', v: selected.email, i: Mail }, { l: 'Địa chỉ', v: selected.address, i: MapPin },
              { l: 'Tổng đơn', v: `${selected.totalOrders} đơn`, i: ShoppingBag }, { l: 'Doanh thu', v: fmt(selected.totalRevenue), i: DollarSign },
            ].map(f => { const I = f.i; return (
              <div key={f.l} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                <I size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.l}</p><p className="text-sm font-medium mt-0.5">{f.v}</p></div>
              </div>); })}
          </div>
        )}
      </Modal>
    </div>
  );
}
