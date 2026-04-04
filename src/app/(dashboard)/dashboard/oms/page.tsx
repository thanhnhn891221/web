'use client';

import React, { useState } from 'react';
import { ClipboardList, Search, Package, Truck, CheckCircle, Clock, AlertTriangle, DollarSign, Eye } from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

const ORDERS = [
  { id: '1', code: 'OMS-1254', customer: 'Siêu thị CoopMart', items: 15, total: 18500000, status: 'processing', channel: 'B2B Direct', date: '2026-03-31', delivery: '2026-04-02' },
  { id: '2', code: 'OMS-1255', customer: 'Đại lý Phương Nam', items: 8, total: 7200000, status: 'shipped', channel: 'B2B Direct', date: '2026-03-31', delivery: '2026-04-01' },
  { id: '3', code: 'OMS-1256', customer: 'Bách Hóa Xanh', items: 22, total: 32000000, status: 'delivered', channel: 'B2B Direct', date: '2026-03-29', delivery: '2026-03-31' },
  { id: '4', code: 'OMS-1257', customer: 'Mini Stop Q.1', items: 5, total: 3800000, status: 'pending', channel: 'B2B Marketplace', date: '2026-03-31', delivery: '2026-04-03' },
  { id: '5', code: 'OMS-1258', customer: 'Vinmart', items: 30, total: 45000000, status: 'confirmed', channel: 'B2B Direct', date: '2026-03-30', delivery: '2026-04-04' },
  { id: '6', code: 'OMS-1259', customer: 'Circle K', items: 12, total: 15600000, status: 'cancelled', channel: 'B2B Marketplace', date: '2026-03-28', delivery: '—' },
];

const STATUS: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', variant: 'default', icon: Clock },
  confirmed: { label: 'Đã xác nhận', variant: 'info', icon: CheckCircle },
  processing: { label: 'Đang xử lý', variant: 'warning', icon: Package },
  shipped: { label: 'Đang giao', variant: 'info', icon: Truck },
  delivered: { label: 'Đã giao', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', variant: 'danger', icon: AlertTriangle },
};

export default function OMSPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/sales-orders');
        const json = await res.json();
        if (json.success) setOrders(json.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const filtered = orders.filter(o => (filter === 'all' || o.status === filter) && (o.code.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())));
  const totalValue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(190, 70%, 42%, 0.12)' }}>
            <ClipboardList size={22} style={{ color: 'hsl(190, 70%, 42%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OMS — Quản lý Đơn hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ghi nhận, đồng bộ & xử lý đơn hàng toàn vẹn</p>
          </div>
        </div>
        <Button icon={ClipboardList}>Tạo đơn hàng</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng đơn" value={orders.length} icon={ClipboardList} color="var(--primary-500)" />
        <StatCard title="Đang xử lý" value={orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length} icon={Clock} color="var(--amber)" />
        <StatCard title="Đã giao" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle} color="var(--emerald)" />
        <StatCard title="Tổng giá trị" value={fmt(totalValue)} icon={DollarSign} color="var(--accent-500)" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Tìm mã đơn, khách hàng..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm outline-none">
          <option value="all">Tất cả</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <Card padding="none" className="animate-fade-in">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Đang tải đơn hàng...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <ClipboardList size={40} className="mb-4 text-[var(--text-muted)] opacity-50" />
            <p className="text-[var(--text-secondary)] font-medium">Không tìm thấy đơn hàng</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ background: 'var(--slate-50)' }}>
                  {['Mã đơn', 'Khách hàng', 'Mặt hàng', 'Giá trị', 'Kênh', 'Trạng thái', 'Ngày tạo', 'Giao hàng'].map((h, i) => (
                    <th key={i} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {filtered.map(o => {
                    const st = STATUS[o.status] || STATUS.pending; const StIcon = st.icon;
                    return (
                      <tr key={o.id} className="group hover:bg-[var(--slate-25)] transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                        <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>{o.code}</td>
                        <td className="px-5 py-3.5 text-sm font-medium">{o.customerName}</td>
                        <td className="px-5 py-3.5 text-sm text-center">{o.itemsCount}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold">{fmt(o.totalAmount)}</td>
                        <td className="px-5 py-3.5"><Badge>{o.channel || 'B2B'}</Badge></td>
                        <td className="px-5 py-3.5"><Badge variant={st.variant} icon={StIcon}>{st.label}</Badge></td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString('vi-VN') : '—'}</td>
                      </tr>);
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {filtered.map(o => {
                const st = STATUS[o.status] || STATUS.pending; const StIcon = st.icon;
                return (
                  <div key={o.id} className="p-4 flex flex-col gap-3 active:bg-[var(--slate-50)] transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ background: `var(--slate-100)`, color: 'var(--primary-500)' }}>
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--primary-600)]">{o.code}</p>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{o.customerName}</p>
                        </div>
                      </div>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <div className="flex flex-col gap-1 text-[var(--text-muted)]">
                        <span>MH: <strong className="text-[var(--text-primary)]">{o.itemsCount}</strong></span>
                        <span>Ngày tạo: {new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{fmt(o.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="px-5 py-3 border-t text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>Hiển thị {filtered.length} / {orders.length} đơn hàng</div>
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.code || ''} description={selected?.customerName}
        footer={<Button variant="ghost" onClick={() => setSelected(null)}>Đóng</Button>}>
        {selected && (
          <div className="grid grid-cols-2 gap-3">
            {[{ l: 'Trạng thái', v: STATUS[selected.status]?.label || selected.status }, { l: 'Kênh bán', v: selected.channel || 'B2B' },
              { l: 'Số mặt hàng', v: `${selected.itemsCount} SP` }, { l: 'Tổng giá trị', v: fmt(selected.totalAmount) },
              { l: 'Ngày tạo', v: new Date(selected.createdAt).toLocaleDateString('vi-VN') }, { l: 'Ngày giao', v: selected.expectedDelivery ? new Date(selected.expectedDelivery).toLocaleDateString('vi-VN') : '—' },
            ].map(f => (<div key={f.l} className="p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.l}</p><p className="text-sm font-semibold mt-1">{f.v}</p></div>))}
          </div>
        )}
      </Modal>
    </div>
  );
}
