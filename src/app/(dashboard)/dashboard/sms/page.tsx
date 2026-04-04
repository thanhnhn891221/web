'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, Search, Phone, Mail, MapPin, Star, ShoppingBag } from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

const TIER_COLORS: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: '#CD7F32' }, silver: { label: 'Silver', color: '#C0C0C0' },
  gold: { label: 'Gold', color: '#FFD700' }, platinum: { label: 'Platinum', color: '#B0B0B0' },
};

const STAGE_MAP: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; pct: number }> = {
  new: { label: 'Lead mới', variant: 'default', pct: 10 },
  contacted: { label: 'Đã liên hệ', variant: 'info', pct: 30 },
  qualified: { label: 'Đủ điều kiện', variant: 'info', pct: 50 },
  proposal: { label: 'Đã gửi đề xuất', variant: 'warning', pct: 75 },
  won: { label: 'Chốt thành công', variant: 'success', pct: 100 },
  lost: { label: 'Thất bại', variant: 'danger', pct: 0 },
};

type Tab = 'customers' | 'pipeline';

export default function SMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('customers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCust, resLeads] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/leads')
        ]);
        const jsonCust = await resCust.json();
        const jsonLeads = await resLeads.json();
        
        if (jsonCust.success) setCustomers(jsonCust.data);
        if (jsonLeads.success) setLeads(jsonLeads.data);
      } catch (err) {
        console.error('Error fetching SMS data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  // Defaulting to 0 since our fresh mock doesn't have totalRevenue populated for all.
  const totalRev = customers.reduce((s, c) => s + (c.rating || 0), 0); // Temporary using rating or 0
  const pipeVal = leads.filter(p => !p.status?.startsWith('lost')).reduce((s, p) => s + (p.value || 0), 0);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
        <StatCard title="Khách hàng" value={customers.length} icon={Users} color="var(--primary-500)" />
        <StatCard title="Leads Tiềm năng" value={leads.length} icon={Users} color="var(--emerald)" />
        <StatCard title="Pipeline" value={fmt(pipeVal)} icon={Target} color="var(--amber)" changeLabel="Đang chờ chốt" />
        <StatCard title="Tỷ lệ chốt" value="62%" icon={TrendingUp} color="var(--accent-500)" change={8.5} />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([{ key: 'customers' as Tab, label: 'Khách hàng', icon: Users }, { key: 'pipeline' as Tab, label: 'Pipeline', icon: Target }]).map(tab => {
          const Icon = tab.icon;
          return (<button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <Icon size={16} />{tab.label}</button>);
        })}
      </div>

      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Đang kết nối khối Thị Trường...</p>
        </div>
      ) : (
        <>
          {activeTab === 'customers' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Tìm khách hàng..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {filtered.map(c => {
                  const t = TIER_COLORS[c.tier] || TIER_COLORS.bronze;
                  return (
                    <Card key={c.id} hover padding="lg" className="group cursor-pointer" onClick={() => setSelected(c)}>
                      <div className="flex items-start justify-between">
                        <div><p className="text-xs font-mono font-semibold" style={{ color: 'var(--primary-500)' }}>{c.type}</p>
                          <h3 className="text-base font-semibold mt-1">{c.name}</h3></div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: `${t.color}20`, color: t.color }}><Star size={12} /> {t.label}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p><p className="text-sm font-semibold truncate">{c.email}</p></div>
                        <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Số điện thoại</p><p className="text-sm font-semibold truncate">{c.phone}</p></div>
                      </div>
                    </Card>);
                })}
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-3 animate-fade-in">
              {leads.map(deal => {
                const stage = STAGE_MAP[deal.status] || STAGE_MAP.new;
                return (
                  <Card key={deal.id} hover padding="lg">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2"><h3 className="text-sm font-semibold">{deal.company || deal.name}</h3><Badge variant={stage.variant}>{stage.label}</Badge></div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Liên hệ: {deal.name} ({deal.phone})</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>Ngày tạo: {new Date(deal.createdAt).toLocaleDateString('vi-VN')}</span><span>Mức phí: <strong className="text-[var(--text-primary)]">{deal.priority}</strong></span>
                        </div>
                      </div>
                      <p className="text-lg font-bold" style={{ color: 'var(--primary-500)' }}>{fmt(deal.value)}</p>
                    </div>
                    <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stage.pct}%`, background: deal.status === 'won' ? 'var(--emerald)' : 'var(--primary-500)' }} />
                    </div>
                  </Card>);
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} description={`Loại: ${selected?.type}`}
        footer={<Button variant="ghost" onClick={() => setSelected(null)}>Đóng</Button>}>
        {selected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ l: 'Số điện thoại', v: selected.phone, i: Phone },
              { l: 'Email', v: selected.email, i: Mail }, 
              { l: 'Ngày tạo', v: new Date(selected.createdAt).toLocaleDateString('vi-VN'), i: ShoppingBag }
            ].map((f, idx) => { const I = f.i; return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                <I size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div className="min-w-0"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.l}</p><p className="text-sm font-medium mt-0.5 truncate w-full">{f.v}</p></div>
              </div>); })}
          </div>
        )}
      </Modal>
    </div>
  );
}
