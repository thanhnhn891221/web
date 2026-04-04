'use client';

import React, { useState } from 'react';
import {
  Truck, MapPin, Clock, Package, Navigation, CheckCircle,
  AlertTriangle, Phone, User, ArrowRight, Eye, Calendar
} from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

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
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  const [shipments, setShipments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resShip, resDrv] = await Promise.all([
          fetch('/api/shipments'),
          fetch('/api/drivers')
        ]);
        const jsonShip = await resShip.json();
        const jsonDrv = await resDrv.json();
        
        if (jsonShip.success) setShipments(jsonShip.data);
        if (jsonDrv.success) setDrivers(jsonDrv.data);
      } catch (err) {
        console.error('Error fetching TMS data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const deliveredToday = shipments.filter(s => s.status === 'delivered').length;
  const inTransit = shipments.filter(s => s.status === 'in_transit' || s.status === 'picked_up').length;
  const successRate = Math.round((deliveredToday / Math.max(shipments.length, 1)) * 100);

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
        <StatCard title="Tổng vận đơn" value={shipments.length} icon={Package} color="var(--primary-500)" />
        <StatCard title="Đang vận chuyển" value={inTransit} icon={Truck} color="var(--amber)" changeLabel="Trên đường" />
        <StatCard title="Đã giao" value={deliveredToday} icon={CheckCircle} color="var(--emerald)" />
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
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Đang kết nối khối Vận hành...</p>
        </div>
      ) : activeTab === 'shipments' && (
        <div className="space-y-3 animate-fade-in">
          {shipments.map((ship) => {
            const status = SHIP_STATUS[ship.status] || SHIP_STATUS.pending;
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
                    <h3 className="text-sm font-semibold mt-1.5">{ship.customerName || ship.customer}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ship.address}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1"><User size={12} /> {ship.driverName || ship.driver}</span>
                      <span className="flex items-center gap-1"><Truck size={12} /> {ship.vehicle}</span>
                      <span className="flex items-center gap-1"><Package size={12} /> {ship.itemsCount || ship.items} kiện · {ship.weight || '--'}</span>
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
      {!isLoading && activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {drivers.map((driver) => {
            const dStatus = DRIVER_STATUS[driver.status] || DRIVER_STATUS.available;
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

        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`Vận đơn ${selectedShipment?.code}`}
          description={selectedShipment?.customerName || selectedShipment?.customer}
          size="lg"
          footer={<Button variant="ghost" onClick={() => setSelectedShipment(null)}>Đóng</Button>}
        >
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Trạng thái', value: (SHIP_STATUS[selectedShipment.status] || SHIP_STATUS.pending).label },
                  { label: 'Đơn hàng', value: selectedShipment.orderCode },
                  { label: 'Tài xế', value: selectedShipment.driverName || selectedShipment.driver },
                  { label: 'SĐT', value: selectedShipment.driverPhone },
                  { label: 'Biển số', value: selectedShipment.vehicle },
                  { label: 'Trọng lượng', value: selectedShipment.weight || '--' },
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
