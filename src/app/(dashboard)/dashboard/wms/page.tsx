'use client';

import React, { useState } from 'react';
import {
  Warehouse, Search, Plus, Package, ArrowUpRight, ArrowDownRight,
  MapPin, Layers, BarChart3, AlertTriangle, CheckCircle, Clock,
  ArrowRightLeft, TrendingUp, Eye, Filter
} from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

// ─── WMS Mock Data ──────────────────────────────────

interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  capacity: number;
  usedCapacity: number;
  manager: string;
  status: 'active' | 'maintenance';
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  quantity: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer';
  itemName: string;
  sku: string;
  quantity: number;
  unit: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  refCode?: string;
}

const WAREHOUSES: WarehouseLocation[] = [
  { id: '1', name: 'Kho Trung tâm Bình Dương', code: 'KHO-BD', address: 'KCN Mỹ Phước 3, Bình Dương', capacity: 5000, usedCapacity: 3750, manager: 'Bùi Văn Nam', status: 'active' },
  { id: '2', name: 'Kho Chi nhánh TP.HCM', code: 'KHO-HCM', address: 'Q.Thủ Đức, TP.HCM', capacity: 2000, usedCapacity: 1680, manager: 'Nguyễn Thị Hoa', status: 'active' },
  { id: '3', name: 'Kho Nguyên liệu Đồng Nai', code: 'KHO-DN', address: 'KCN Amata, Đồng Nai', capacity: 3000, usedCapacity: 2100, manager: 'Trần Quốc Hùng', status: 'active' },
  { id: '4', name: 'Kho Lạnh Vũng Tàu', code: 'KHO-VT', address: 'KCN Phú Mỹ, Bà Rịa VT', capacity: 1500, usedCapacity: 450, manager: 'Lê Văn Tùng', status: 'maintenance' },
];

const INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'NVL-001', name: 'Bột mì cao cấp', category: 'Nguyên vật liệu', warehouseId: '3', warehouseName: 'KHO-DN', zone: 'A1', quantity: 2500, minStock: 500, unit: 'kg', lastUpdated: '2026-03-31', status: 'in_stock' },
  { id: '2', sku: 'NVL-002', name: 'Đường tinh luyện', category: 'Nguyên vật liệu', warehouseId: '3', warehouseName: 'KHO-DN', zone: 'A2', quantity: 180, minStock: 200, unit: 'kg', lastUpdated: '2026-03-30', status: 'low_stock' },
  { id: '3', sku: 'BB-001', name: 'Hộp carton 30x20x15', category: 'Bao bì', warehouseId: '1', warehouseName: 'KHO-BD', zone: 'B1', quantity: 8500, minStock: 1000, unit: 'cái', lastUpdated: '2026-03-31', status: 'in_stock' },
  { id: '4', sku: 'TP-001', name: 'Bánh quy vị bơ 200g', category: 'Thành phẩm', warehouseId: '1', warehouseName: 'KHO-BD', zone: 'C1', quantity: 12000, minStock: 2000, unit: 'hộp', lastUpdated: '2026-03-31', status: 'in_stock' },
  { id: '5', sku: 'TP-002', name: 'Bánh mì sandwich 400g', category: 'Thành phẩm', warehouseId: '2', warehouseName: 'KHO-HCM', zone: 'C2', quantity: 3200, minStock: 500, unit: 'gói', lastUpdated: '2026-03-31', status: 'in_stock' },
  { id: '6', sku: 'NVL-003', name: 'Phụ gia E330', category: 'Nguyên vật liệu', warehouseId: '3', warehouseName: 'KHO-DN', zone: 'A3', quantity: 0, minStock: 50, unit: 'kg', lastUpdated: '2026-03-28', status: 'out_of_stock' },
  { id: '7', sku: 'HC-001', name: 'Chất tẩy rửa CN', category: 'Hóa chất', warehouseId: '3', warehouseName: 'KHO-DN', zone: 'D1', quantity: 35, minStock: 20, unit: 'thùng', lastUpdated: '2026-03-29', status: 'in_stock' },
  { id: '8', sku: 'TP-003', name: 'Kẹo dẻo trái cây 150g', category: 'Thành phẩm', warehouseId: '1', warehouseName: 'KHO-BD', zone: 'C3', quantity: 450, minStock: 500, unit: 'túi', lastUpdated: '2026-03-30', status: 'low_stock' },
];

const MOVEMENTS: StockMovement[] = [
  { id: '1', type: 'in', itemName: 'Bột mì cao cấp', sku: 'NVL-001', quantity: 500, unit: 'kg', toWarehouse: 'KHO-DN', reason: 'Nhập từ PO-2026-001', createdBy: 'Admin', createdAt: '2026-03-31T14:30:00', refCode: 'PO-2026-001' },
  { id: '2', type: 'out', itemName: 'Bánh quy vị bơ 200g', sku: 'TP-001', quantity: 2000, unit: 'hộp', fromWarehouse: 'KHO-BD', reason: 'Xuất cho đơn hàng OMS-1254', createdBy: 'Bùi Văn Nam', createdAt: '2026-03-31T10:15:00', refCode: 'OMS-1254' },
  { id: '3', type: 'transfer', itemName: 'Bánh mì sandwich 400g', sku: 'TP-002', quantity: 500, unit: 'gói', fromWarehouse: 'KHO-BD', toWarehouse: 'KHO-HCM', reason: 'Điều chuyển bổ sung CN HCM', createdBy: 'Admin', createdAt: '2026-03-30T16:45:00' },
  { id: '4', type: 'in', itemName: 'Hộp carton 30x20x15', sku: 'BB-001', quantity: 3000, unit: 'cái', toWarehouse: 'KHO-BD', reason: 'Nhập từ PO-2026-002', createdBy: 'Phạm Đức Anh', createdAt: '2026-03-30T09:00:00', refCode: 'PO-2026-002' },
  { id: '5', type: 'out', itemName: 'Kẹo dẻo trái cây 150g', sku: 'TP-003', quantity: 1200, unit: 'túi', fromWarehouse: 'KHO-BD', reason: 'Xuất cho đại lý DMS-045', createdBy: 'Admin', createdAt: '2026-03-29T11:20:00', refCode: 'DMS-045' },
];

const STOCK_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  in_stock: { label: 'Đủ hàng', variant: 'success' },
  low_stock: { label: 'Sắp hết', variant: 'warning' },
  out_of_stock: { label: 'Hết hàng', variant: 'danger' },
};

const MOVEMENT_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  in: { label: 'Nhập kho', color: 'var(--emerald)', icon: ArrowDownRight },
  out: { label: 'Xuất kho', color: 'var(--rose)', icon: ArrowUpRight },
  transfer: { label: 'Điều chuyển', color: 'var(--sky)', icon: ArrowRightLeft },
};

type Tab = 'inventory' | 'warehouses' | 'movements';

export default function WMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const categories = [...new Set(INVENTORY.map(i => i.category))];
  const filteredInventory = INVENTORY.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const lowStockCount = INVENTORY.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = INVENTORY.filter(i => i.status === 'out_of_stock').length;
  const totalItems = INVENTORY.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(200, 70%, 45%, 0.12)' }}>
            <Warehouse size={22} style={{ color: 'hsl(200, 70%, 45%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WMS — Quản lý Kho bãi</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Quản lý tồn kho, nhập xuất, điều chuyển</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={ArrowDownRight}>Nhập kho</Button>
          <Button variant="outline" icon={ArrowUpRight}>Xuất kho</Button>
          <Button icon={ArrowRightLeft}>Điều chuyển</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng kho" value={WAREHOUSES.filter(w => w.status === 'active').length} icon={Warehouse} color="var(--primary-500)" changeLabel="Đang hoạt động" />
        <StatCard title="Mặt hàng trong kho" value={totalItems.toLocaleString()} icon={Package} color="var(--accent-500)" />
        <StatCard title="Sắp hết hàng" value={lowStockCount} icon={AlertTriangle} color="var(--amber)" changeLabel="Cần bổ sung" />
        <StatCard title="Hết hàng" value={outOfStockCount} icon={AlertTriangle} color="var(--rose)" changeLabel="Cần xử lý gấp" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([
          { key: 'inventory' as Tab, label: 'Tồn kho', icon: Package },
          { key: 'warehouses' as Tab, label: 'Kho bãi', icon: MapPin },
          { key: 'movements' as Tab, label: 'Nhập/Xuất', icon: ArrowRightLeft },
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

      {/* ─── Inventory Tab ─── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Tìm theo tên, SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm outline-none">
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--slate-50)' }}>
                    {['SKU', 'Tên hàng', 'Danh mục', 'Kho', 'Vị trí', 'Tồn kho', 'Tối thiểu', 'Trạng thái'].map((h, i) => (
                      <th key={i} className={`${i >= 5 ? 'text-right' : 'text-left'} text-xs font-semibold uppercase tracking-wider px-5 py-3`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {filteredInventory.map((item) => {
                    const stockStatus = STOCK_STATUS[item.status];
                    const stockPct = item.minStock > 0 ? Math.round((item.quantity / (item.minStock * 5)) * 100) : 100;
                    return (
                      <tr key={item.id} className="group hover:bg-[var(--slate-25)] transition-colors duration-150 cursor-pointer" onClick={() => setSelectedItem(item)}>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-semibold" style={{ color: 'var(--primary-500)' }}>{item.sku}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium">{item.name}</td>
                        <td className="px-5 py-3.5"><Badge>{item.category}</Badge></td>
                        <td className="px-5 py-3.5 text-sm">{item.warehouseName}</td>
                        <td className="px-5 py-3.5"><Badge variant="info">{item.zone}</Badge></td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-bold">{item.quantity.toLocaleString()}</span>
                          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-right" style={{ color: 'var(--text-muted)' }}>{item.minStock}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Warehouses Tab ─── */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in stagger-children">
          {WAREHOUSES.map((wh) => {
            const usagePct = Math.round((wh.usedCapacity / wh.capacity) * 100);
            const usageColor = usagePct > 85 ? 'var(--rose)' : usagePct > 60 ? 'var(--amber)' : 'var(--emerald)';
            return (
              <Card key={wh.id} hover padding="lg" className="group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{wh.name}</h3>
                      <Badge variant={wh.status === 'active' ? 'success' : 'warning'}>{wh.status === 'active' ? 'Hoạt động' : 'Bảo trì'}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{wh.address}</span>
                    </div>
                  </div>
                  <Badge variant="custom" color="var(--primary-500)" bg="var(--primary-50)">{wh.code}</Badge>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Sử dụng kho</span>
                    <span className="text-sm font-bold" style={{ color: usageColor }}>{usagePct}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${usagePct}%`, background: `linear-gradient(90deg, ${usageColor}, ${usageColor}cc)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{wh.usedCapacity.toLocaleString()} / {wh.capacity.toLocaleString()} pallet</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Quản lý: {wh.manager}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Movements Tab ─── */}
      {activeTab === 'movements' && (
        <div className="space-y-4 animate-fade-in">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--slate-50)' }}>
                    {['Loại', 'Mặt hàng', 'Số lượng', 'Từ kho', 'Đến kho', 'Lý do', 'Người thực hiện', 'Thời gian'].map((h, i) => (
                      <th key={i} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {MOVEMENTS.map((mv) => {
                    const config = MOVEMENT_CONFIG[mv.type];
                    const MvIcon = config.icon;
                    return (
                      <tr key={mv.id} className="hover:bg-[var(--slate-25)] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${config.color}15` }}>
                              <MvIcon size={14} style={{ color: config.color }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: config.color }}>{config.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium">{mv.itemName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{mv.sku}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold">{mv.quantity} {mv.unit}</td>
                        <td className="px-5 py-3.5 text-sm">{mv.fromWarehouse || '—'}</td>
                        <td className="px-5 py-3.5 text-sm">{mv.toWarehouse || '—'}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm">{mv.reason}</p>
                          {mv.refCode && <Badge className="mt-1">{mv.refCode}</Badge>}
                        </td>
                        <td className="px-5 py-3.5 text-sm">{mv.createdBy}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(mv.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Inventory Detail Modal ─── */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || ''}
        description={`SKU: ${selectedItem?.sku}`}
        footer={<Button variant="ghost" onClick={() => setSelectedItem(null)}>Đóng</Button>}
      >
        {selectedItem && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Danh mục', value: selectedItem.category },
              { label: 'Kho', value: selectedItem.warehouseName },
              { label: 'Vị trí', value: selectedItem.zone },
              { label: 'Tồn kho', value: `${selectedItem.quantity.toLocaleString()} ${selectedItem.unit}` },
              { label: 'Tối thiểu', value: `${selectedItem.minStock} ${selectedItem.unit}` },
              { label: 'Cập nhật', value: new Date(selectedItem.lastUpdated).toLocaleDateString('vi-VN') },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p className="text-sm font-semibold mt-1">{f.value}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
