'use client';

import React, { useState } from 'react';
import {
  ShoppingCart, Plus, Search, Filter, Eye, Edit, Trash2,
  Package, Truck, CheckCircle, Clock, AlertTriangle,
  FileText, DollarSign, Building2, Calendar, MoreHorizontal,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard } from '@/components/ui';

// ─── PMS Mock Data ──────────────────────────────────

interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  totalOrders: number;
  status: 'active' | 'inactive';
}

interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  items: { name: string; qty: number; unit: string; price: number }[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  createdBy: string;
  createdAt: string;
  expectedDate: string;
  note?: string;
}

const SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Công ty TNHH Nguyên liệu Sài Gòn', code: 'NCC-001', contact: 'Nguyễn Văn Bình', email: 'binh@nlsg.vn', phone: '028-1234-5678', category: 'Nguyên vật liệu', rating: 4.8, totalOrders: 156, status: 'active' },
  { id: '2', name: 'Nhà máy Bao bì Đồng Nai', code: 'NCC-002', contact: 'Trần Thị Cúc', email: 'cuc@bbdn.vn', phone: '0251-234-5678', category: 'Bao bì', rating: 4.5, totalOrders: 89, status: 'active' },
  { id: '3', name: 'Đại lý Hóa chất Miền Nam', code: 'NCC-003', contact: 'Lê Hoàng Duy', email: 'duy@hcmn.vn', phone: '028-8765-4321', category: 'Hóa chất', rating: 4.2, totalOrders: 67, status: 'active' },
  { id: '4', name: 'Công ty CP Máy móc Á Châu', code: 'NCC-004', contact: 'Phạm Minh Đức', email: 'duc@mmac.vn', phone: '024-5678-1234', category: 'Máy móc', rating: 4.6, totalOrders: 34, status: 'active' },
  { id: '5', name: 'Xưởng Nhựa Tân Phú', code: 'NCC-005', contact: 'Hoàng Thị Lan', email: 'lan@ntp.vn', phone: '028-9876-5432', category: 'Nhựa', rating: 3.9, totalOrders: 42, status: 'inactive' },
];

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: '1', code: 'PO-2026-001', supplierId: '1', supplierName: 'Công ty TNHH Nguyên liệu Sài Gòn', items: [{ name: 'Bột mì cao cấp', qty: 500, unit: 'kg', price: 18000 }, { name: 'Đường tinh luyện', qty: 300, unit: 'kg', price: 22000 }], totalAmount: 15600000, status: 'approved', createdBy: 'Admin', createdAt: '2026-03-28', expectedDate: '2026-04-05', note: 'Đơn gấp cho dây chuyền SX #2' },
  { id: '2', code: 'PO-2026-002', supplierId: '2', supplierName: 'Nhà máy Bao bì Đồng Nai', items: [{ name: 'Hộp carton 30x20x15', qty: 2000, unit: 'cái', price: 5500 }], totalAmount: 11000000, status: 'ordered', createdBy: 'Phạm Đức Anh', createdAt: '2026-03-29', expectedDate: '2026-04-03' },
  { id: '3', code: 'PO-2026-003', supplierId: '3', supplierName: 'Đại lý Hóa chất Miền Nam', items: [{ name: 'Chất tẩy rửa công nghiệp', qty: 50, unit: 'thùng', price: 450000 }], totalAmount: 22500000, status: 'pending', createdBy: 'Admin', createdAt: '2026-03-30', expectedDate: '2026-04-10' },
  { id: '4', code: 'PO-2026-004', supplierId: '1', supplierName: 'Công ty TNHH Nguyên liệu Sài Gòn', items: [{ name: 'Tinh bột ngô', qty: 200, unit: 'kg', price: 15000 }, { name: 'Phụ gia thực phẩm E330', qty: 100, unit: 'kg', price: 85000 }], totalAmount: 11500000, status: 'received', createdBy: 'Trần Minh Tuấn', createdAt: '2026-03-15', expectedDate: '2026-03-25' },
  { id: '5', code: 'PO-2026-005', supplierId: '4', supplierName: 'Công ty CP Máy móc Á Châu', items: [{ name: 'Băng tải mini 2m', qty: 1, unit: 'chiếc', price: 45000000 }], totalAmount: 45000000, status: 'draft', createdBy: 'Admin', createdAt: '2026-03-31', expectedDate: '2026-04-20' },
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; icon: React.ElementType }> = {
  draft: { label: 'Nháp', variant: 'default', icon: FileText },
  pending: { label: 'Chờ duyệt', variant: 'warning', icon: Clock },
  approved: { label: 'Đã duyệt', variant: 'info', icon: CheckCircle },
  ordered: { label: 'Đã đặt hàng', variant: 'info', icon: Truck },
  received: { label: 'Đã nhận', variant: 'success', icon: Package },
  cancelled: { label: 'Đã hủy', variant: 'danger', icon: AlertTriangle },
};

type Tab = 'orders' | 'suppliers';

export default function PMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreateModal, setIsCreateModal] = useState(false);

  const filteredOrders = PURCHASE_ORDERS.filter((po) => {
    const matchSearch = po.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPending = PURCHASE_ORDERS.filter(po => po.status === 'pending').length;
  const totalValue = PURCHASE_ORDERS.reduce((sum, po) => sum + po.totalAmount, 0);

  const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(30, 80%, 50%, 0.12)' }}>
            <ShoppingCart size={22} style={{ color: 'hsl(30, 80%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PMS — Quản lý Mua hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Quản lý đơn mua hàng, nhà cung cấp, vật tư</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => setIsCreateModal(true)}>Tạo đơn mua</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng đơn mua" value={PURCHASE_ORDERS.length} icon={FileText} color="var(--primary-500)" />
        <StatCard title="Chờ duyệt" value={totalPending} icon={Clock} color="var(--amber)" changeLabel="Cần xử lý" />
        <StatCard title="Nhà cung cấp" value={SUPPLIERS.filter(s => s.status === 'active').length} icon={Building2} color="var(--accent-500)" changeLabel="Đang hợp tác" />
        <StatCard title="Tổng giá trị" value={formatCurrency(totalValue)} icon={DollarSign} color="var(--emerald)" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([
          { key: 'orders' as Tab, label: 'Đơn mua hàng', icon: FileText },
          { key: 'suppliers' as Tab, label: 'Nhà cung cấp', icon: Building2 },
        ]).map((tab) => {
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

      {/* ─── Orders Tab ─── */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Tìm theo mã đơn, nhà cung cấp..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm outline-none">
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--slate-50)' }}>
                    {['Mã đơn', 'Nhà cung cấp', 'Số mặt hàng', 'Tổng giá trị', 'Trạng thái', 'Ngày tạo', 'Dự kiến nhận', ''].map((h, i) => (
                      <th key={i} className={`${i === 7 ? 'text-right' : 'text-left'} text-xs font-semibold uppercase tracking-wider px-5 py-3`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {filteredOrders.map((po) => {
                    const status = STATUS_CONFIG[po.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={po.id} className="group hover:bg-[var(--slate-25)] transition-colors duration-150 cursor-pointer" onClick={() => setSelectedOrder(po)}>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>{po.code}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm">{po.supplierName}</td>
                        <td className="px-5 py-3.5 text-sm text-center">{po.items.length}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-right">{formatCurrency(po.totalAmount)}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={status.variant} icon={StatusIcon}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(po.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(po.expectedDate).toLocaleDateString('vi-VN')}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--slate-100)] transition-all">
                            <MoreHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              Hiển thị {filteredOrders.length} / {PURCHASE_ORDERS.length} đơn mua hàng
            </div>
          </Card>
        </div>
      )}

      {/* ─── Suppliers Tab ─── */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {SUPPLIERS.map((s) => (
            <Card key={s.id} hover padding="lg" className="group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'hsl(30, 80%, 50%, 0.1)' }}>
                    <Building2 size={22} style={{ color: 'hsl(30, 80%, 50%)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.code}</p>
                    <Badge variant={s.status === 'active' ? 'success' : 'danger'}>{s.status === 'active' ? 'Hoạt động' : 'Ngừng'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--amber)' }}>{s.rating}</span>
                  <span className="text-amber-400">★</span>
                </div>
              </div>
              <h3 className="text-base font-semibold mt-4 leading-snug">{s.name}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.category}</p>
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Liên hệ</p>
                  <p className="text-sm font-medium">{s.contact}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tổng đơn</p>
                  <p className="text-sm font-medium">{s.totalOrders} đơn</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Order Detail Modal ─── */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết — ${selectedOrder?.code}`}
        description={selectedOrder?.supplierName}
        size="lg"
        footer={<Button variant="ghost" onClick={() => setSelectedOrder(null)}>Đóng</Button>}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Trạng thái', value: STATUS_CONFIG[selectedOrder.status].label },
                { label: 'Người tạo', value: selectedOrder.createdBy },
                { label: 'Ngày tạo', value: new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') },
                { label: 'Dự kiến nhận', value: new Date(selectedOrder.expectedDate).toLocaleDateString('vi-VN') },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="text-sm font-semibold mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Danh sách hàng hóa</h4>
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--slate-50)' }}>
                      <th className="text-left text-xs font-semibold uppercase px-4 py-2" style={{ color: 'var(--text-muted)' }}>Tên hàng</th>
                      <th className="text-right text-xs font-semibold uppercase px-4 py-2" style={{ color: 'var(--text-muted)' }}>SL</th>
                      <th className="text-right text-xs font-semibold uppercase px-4 py-2" style={{ color: 'var(--text-muted)' }}>Đơn giá</th>
                      <th className="text-right text-xs font-semibold uppercase px-4 py-2" style={{ color: 'var(--text-muted)' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-sm">{item.name}</td>
                        <td className="px-4 py-2.5 text-sm text-right">{item.qty} {item.unit}</td>
                        <td className="px-4 py-2.5 text-sm text-right">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2.5 text-sm text-right font-semibold">{formatCurrency(item.qty * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--slate-50)' }}>
                      <td colSpan={3} className="px-4 py-2.5 text-sm font-semibold text-right">Tổng cộng:</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-right" style={{ color: 'var(--primary-500)' }}>{formatCurrency(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedOrder.note && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--amber-light)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--amber)' }}>Ghi chú</p>
                <p className="text-sm mt-1">{selectedOrder.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
