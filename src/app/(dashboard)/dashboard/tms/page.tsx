'use client';

import React, { useState } from 'react';
import {
  Truck, MapPin, Clock, Package, Navigation, CheckCircle,
  AlertTriangle, Phone, User, ArrowRight, Eye, Calendar
} from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

// ─── TMS Mock Data ──────────────────────────────────

interface Shipment {
  id: string;
  code: string;
  orderCode: string;
  customer: string;
  address: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  items: number;
  weight: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  createdAt: string;
  estimatedDelivery: string;
  currentLocation?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  activeShipments: number;
  completedToday: number;
  status: 'available' | 'on_route' | 'off_duty';
  rating: number;
}

const SHIPMENTS: Shipment[] = [
  { id: '1', code: 'SHP-001', orderCode: 'OMS-1254', customer: 'Siêu thị CoopMart Lê Hồng Phong', address: '242 Lê Hồng Phong, Q.5, TP.HCM', driver: 'Nguyễn Hoàng Long', driverPhone: '0912-345-678', vehicle: '51A-12345', items: 15, weight: '120 kg', status: 'in_transit', createdAt: '2026-03-31T08:00:00', estimatedDelivery: '2026-03-31T14:00:00', currentLocation: 'Q.Thủ Đức → Q.5 (70%)' },
  { id: '2', code: 'SHP-002', orderCode: 'OMS-1255', customer: 'Đại lý Phương Nam', address: '88 Nguyễn Huệ, Biên Hòa, Đồng Nai', driver: 'Trần Đức Mạnh', driverPhone: '0923-456-789', vehicle: '60C-67890', items: 8, weight: '85 kg', status: 'picked_up', createdAt: '2026-03-31T09:30:00', estimatedDelivery: '2026-03-31T16:00:00', currentLocation: 'KCN Mỹ Phước (Đã lấy hàng)' },
  { id: '3', code: 'SHP-003', orderCode: 'OMS-1250', customer: 'Bách Hóa Xanh - CN Bình Dương', address: '45 Đại lộ Bình Dương, TX. TDM', driver: 'Lê Thanh Tùng', driverPhone: '0934-567-890', vehicle: '61D-11111', items: 22, weight: '200 kg', status: 'delivered', createdAt: '2026-03-31T06:00:00', estimatedDelivery: '2026-03-31T11:00:00' },
  { id: '4', code: 'SHP-004', orderCode: 'OMS-1258', customer: 'Mini Stop Q.1', address: '50 Nguyễn Du, Q.1, TP.HCM', driver: 'Phạm Minh Khoa', driverPhone: '0945-678-901', vehicle: '51B-22222', items: 5, weight: '35 kg', status: 'pending', createdAt: '2026-03-31T10:00:00', estimatedDelivery: '2026-04-01T09:00:00' },
  { id: '5', code: 'SHP-005', orderCode: 'OMS-1248', customer: 'Vinmart - CN Gò Vấp', address: '100 Nguyễn Oanh, Gò Vấp, TP.HCM', driver: 'Nguyễn Hoàng Long', driverPhone: '0912-345-678', vehicle: '51A-12345', items: 12, weight: '95 kg', status: 'failed', createdAt: '2026-03-30T14:00:00', estimatedDelivery: '2026-03-31T08:00:00', currentLocation: 'Khách không nhận — sai sản phẩm' },
];

const DRIVERS: Driver[] = [
  { id: '1', name: 'Nguyễn Hoàng Long', phone: '0912-345-678', vehicle: 'Xe tải 1.5T', licensePlate: '51A-12345', activeShipments: 1, completedToday: 3, status: 'on_route', rating: 4.9 },
  { id: '2', name: 'Trần Đức Mạnh', phone: '0923-456-789', vehicle: 'Xe tải 2T', licensePlate: '60C-67890', activeShipments: 1, completedToday: 2, status: 'on_route', rating: 4.7 },
  { id: '3', name: 'Lê Thanh Tùng', phone: '0934-567-890', vehicle: 'Xe tải 1T', licensePlate: '61D-11111', activeShipments: 0, completedToday: 4, status: 'available', rating: 4.8 },
  { id: '4', name: 'Phạm Minh Khoa', phone: '0945-678-901', vehicle: 'Xe van 500kg', licensePlate: '51B-22222', activeShipments: 0, completedToday: 1, status: 'available', rating: 4.5 },
  { id: '5', name: 'Võ Quốc Bảo', phone: '0956-789-012', vehicle: 'Xe tải 3T', licensePlate: '61E-33333', activeShipments: 0, completedToday: 0, status: 'off_duty', rating: 4.3 },
];

const SHIP_STATUS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; icon: React.ElementType }> = {
  pending: { label: 'Chờ lấy hàng', variant: 'default', icon: Clock },
  picked_up: { label: 'Đã lấy hàng', variant: 'info', icon: Package },
  in_transit: { label: 'Đang giao', variant: 'warning', icon: Truck },
  delivered: { label: 'Đã giao', variant: 'success', icon: CheckCircle },
  failed: { label: 'Thất bại', variant: 'danger', icon: AlertTriangle },
};

const DRIVER_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  available: { label: 'Sẵn sàng', variant: 'success' },
  on_route: { label: 'Đang giao', variant: 'warning' },
  off_duty: { label: 'Nghỉ', variant: 'default' },
};

type Tab = 'shipments' | 'drivers';

export default function TMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('shipments');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const deliveredToday = SHIPMENTS.filter(s => s.status === 'delivered').length;
  const inTransit = SHIPMENTS.filter(s => s.status === 'in_transit' || s.status === 'picked_up').length;
  const successRate = Math.round((deliveredToday / Math.max(SHIPMENTS.length, 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(280, 55%, 50%, 0.12)' }}>
            <Truck size={22} style={{ color: 'hsl(280, 55%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TMS — Quản lý Giao hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logistics, giao nhận, tài xế & tracking</p>
          </div>
        </div>
        <Button icon={Truck}>Tạo vận đơn</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng vận đơn" value={SHIPMENTS.length} icon={Package} color="var(--primary-500)" />
        <StatCard title="Đang vận chuyển" value={inTransit} icon={Truck} color="var(--amber)" changeLabel="Trên đường" />
        <StatCard title="Đã giao hôm nay" value={deliveredToday} icon={CheckCircle} color="var(--emerald)" />
        <StatCard title="Tỷ lệ giao OK" value={`${successRate}%`} icon={Navigation} color="var(--accent-500)" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([
          { key: 'shipments' as Tab, label: 'Vận đơn', icon: Package },
          { key: 'drivers' as Tab, label: 'Tài xế', icon: User },
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

      {/* ─── Shipments Tab ─── */}
      {activeTab === 'shipments' && (
        <div className="space-y-3 animate-fade-in">
          {SHIPMENTS.map((ship) => {
            const status = SHIP_STATUS[ship.status];
            const StatusIcon = status.icon;
            return (
              <Card key={ship.id} hover padding="lg" className="group" onClick={() => setSelectedShipment(ship)}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `hsl(280, 55%, 50%, 0.1)` }}
                  >
                    <StatusIcon size={20} style={{ color: 'hsl(280, 55%, 50%)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--primary-500)' }}>{ship.code}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                        <Badge>{ship.orderCode}</Badge>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold mt-1.5">{ship.customer}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ship.address}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1"><User size={12} /> {ship.driver}</span>
                      <span className="flex items-center gap-1"><Truck size={12} /> {ship.vehicle}</span>
                      <span className="flex items-center gap-1"><Package size={12} /> {ship.items} mặt hàng · {ship.weight}</span>
                    </div>

                    {ship.currentLocation && (
                      <div className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                        style={{ background: 'var(--sky-light)', color: 'var(--sky)' }}>
                        <Navigation size={12} /> {ship.currentLocation}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Drivers Tab ─── */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {DRIVERS.map((driver) => {
            const dStatus = DRIVER_STATUS[driver.status];
            return (
              <Card key={driver.id} hover padding="lg" className="group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, hsl(280, 55%, 50%), hsl(280, 55%, 40%))' }}>
                      {driver.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{driver.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{driver.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={dStatus.variant}>{dStatus.label}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-center">
                    <p className="text-lg font-bold">{driver.activeShipments}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang giao</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{driver.completedToday}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hôm nay</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: 'var(--amber)' }}>{driver.rating}★</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đánh giá</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Truck size={12} /> {driver.vehicle} · <span className="font-mono">{driver.licensePlate}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Shipment Detail Modal ─── */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        title={`Vận đơn ${selectedShipment?.code}`}
        description={selectedShipment?.customer}
        size="lg"
        footer={<Button variant="ghost" onClick={() => setSelectedShipment(null)}>Đóng</Button>}
      >
        {selectedShipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Trạng thái', value: SHIP_STATUS[selectedShipment.status].label },
                { label: 'Đơn hàng', value: selectedShipment.orderCode },
                { label: 'Tài xế', value: selectedShipment.driver },
                { label: 'SĐT', value: selectedShipment.driverPhone },
                { label: 'Biển số', value: selectedShipment.vehicle },
                { label: 'Trọng lượng', value: selectedShipment.weight },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                  <p className="text-sm font-semibold mt-1">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--slate-50)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} style={{ color: 'var(--primary-500)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Địa chỉ giao hàng</p>
              </div>
              <p className="text-sm font-semibold">{selectedShipment.address}</p>
            </div>
            {selectedShipment.currentLocation && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--sky-light)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--sky)' }}>Vị trí hiện tại</p>
                <p className="text-sm font-semibold mt-1">{selectedShipment.currentLocation}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
