'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Plus, MapPin, Phone, CheckCircle, Clock, AlertTriangle, Search, Filter, History, Navigation, User, LayoutDashboard, Database, MoreHorizontal, Boxes, Edit, Trash2, Save } from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'shipments' | 'drivers';

export default function TMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('shipments');
  const [shipments, setShipments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [editingShipment, setEditingShipment] = useState<any | null>(null);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
  });

  // Forms
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', vehicle: 'Xe tải 5 tấn', licensePlate: '', status: 'available' });
  const [shipmentForm, setShipmentForm] = useState({ customerName: '', address: '', driverId: '', salesOrderId: '', status: 'pending', estimatedArrival: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/drivers')
      ]);
      const sJson = await sRes.json();
      const dJson = await dRes.json();
      if (sJson.success) setShipments(sJson.data);
      if (dJson.success) setDrivers(dJson.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handlers
  const handleSaveDriver = async () => {
    if (editingDriver) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật tài xế',
        message: `Xác nhận lưu thay đổi cho tài xế ${editingDriver.name}?`,
        type: 'success',
        onConfirm: executeSaveDriver
      });
    } else {
      executeSaveDriver();
    }
  };

  const executeSaveDriver = async () => {
    try {
      const url = editingDriver ? `/api/drivers/${editingDriver.id}` : '/api/drivers';
      const method = editingDriver ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverForm)
      });
      if (res.ok) { 
        setIsDriverModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveShipment = async () => {
    if (editingShipment) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật lệnh giao',
        message: `Xác nhận lưu thay đổi cho lệnh giao ${editingShipment.code}?`,
        type: 'success',
        onConfirm: executeSaveShipment
      });
    } else {
      executeSaveShipment();
    }
  };

  const executeSaveShipment = async () => {
    try {
      const url = editingShipment ? `/api/shipments/${editingShipment.id}` : '/api/shipments';
      const method = editingShipment ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentForm)
      });
      if (res.ok) { 
        setIsShipmentModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteDriver = (d: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa tài xế',
      message: `Bạn có chắc chắn muốn xóa tài xế ${d.name}?`,
      type: 'danger',
      onConfirm: () => executeDeleteDriver(d.id)
    });
  };

  const executeDeleteDriver = async (id: string) => {
    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteShipment = (s: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy lệnh giao hàng',
      message: `Xác nhận hủy lệnh giao hàng ${s.code}? Dữ liệu sẽ được ẩn khỏi hệ thống.`,
      type: 'danger',
      onConfirm: () => executeDeleteShipment(s.id)
    });
  };

  const executeDeleteShipment = async (id: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEditDriver = (d: any) => {
    setEditingDriver(d);
    setDriverForm({
      name: d.name,
      phone: d.phone || '',
      vehicle: d.vehicle || 'Xe tải 5 tấn',
      licensePlate: d.licensePlate || '',
      status: d.status || 'available'
    });
    setIsDriverModalOpen(true);
  };

  const openEditShipment = (s: any) => {
    setEditingShipment(s);
    setShipmentForm({
      customerName: s.customerName,
      address: s.address,
      driverId: s.driverId || '',
      salesOrderId: s.salesOrderId || '',
      status: s.status || 'pending',
      estimatedArrival: s.estimatedDelivery ? new Date(s.estimatedDelivery).toISOString().split('T')[0] : ''
    });
    setIsShipmentModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'shipments') return (
      <Button icon={Plus} onClick={() => {
        setEditingShipment(null);
        setShipmentForm({ customerName: '', address: '', driverId: '', salesOrderId: '', status: 'pending', estimatedArrival: '' });
        setIsShipmentModalOpen(true);
      }}>
        Tạo lệnh giao
      </Button>
    );
    if (activeTab === 'drivers') return (
      <Button icon={Plus} onClick={() => {
        setEditingDriver(null);
        setDriverForm({ name: '', phone: '', vehicle: 'Xe tải 5 tấn', licensePlate: '', status: 'available' });
        setIsDriverModalOpen(true);
      }}>
        Thêm tài xế
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(210, 80%, 45%, 0.12)' }}>
            <Navigation size={22} style={{ color: 'hsl(210, 80%, 45%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TMS — Quản lý Vận tải</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Điều phối, giao vận & đội xe</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'shipments', label: 'Lệnh giao hàng', icon: Truck },
          { key: 'drivers', label: 'Tài xế & Đội xe', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'shipments' && (
        <div className="space-y-4 animate-fade-in stagger-children">
           {shipments.map(s => (
             <Card key={s.id} hover className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-transform group-hover:scale-105">
                   <Navigation size={20}/>
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-blue-700 uppercase tracking-tight">{s.code}</h4>
                      <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)" size="sm">{s.orderCode}</Badge>
                   </div>
                   <p className="text-xs text-slate-600 font-bold mt-0.5">{s.customerName}</p>
                   <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium"><MapPin size={10}/> {s.address}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditShipment(s)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => confirmDeleteShipment(s)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                   <div>
                      <p className="text-xs font-bold mb-1 text-slate-700">{s.driverName}</p>
                      <Badge variant={s.status === 'delivered' ? 'success' : s.status === 'in_transit' ? 'info' : 'warning'}>{s.status}</Badge>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
           {drivers.map(d => (
             <Card key={d.id} hover padding="md" className="group">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-500 shadow-inner border-2 border-white">
                         {d.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-bold text-sm text-slate-800">{d.name}</h3>
                         <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{d.vehicle} · {d.licensePlate}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditDriver(d)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => confirmDeleteDriver(d)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 border-t">
                   <Badge variant={d.status === 'available' ? 'success' : d.status === 'on_route' ? 'info' : 'warning'}>{d.status}</Badge>
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Phone size={12}/> {d.phone}
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} title={editingDriver ? "Cập nhật tài xế" : "Thêm tài xế mới"}
        footer={<><Button variant="ghost" onClick={() => setIsDriverModalOpen(false)}>Hủy</Button><Button onClick={handleSaveDriver} icon={editingDriver ? Save : Plus}>{editingDriver ? 'Cập nhật' : 'Lưu tài xế'}</Button></>}>
        <div className="space-y-4">
           <Input label="Họ tên tài xế" value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} placeholder="Nguyễn Văn A..." />
           <Input label="Số điện thoại" value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} placeholder="090..." />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Loại xe" value={driverForm.vehicle} onChange={e => setDriverForm({...driverForm, vehicle: e.target.value})} options={[{value:'Xe tải 5 tấn', label:'5 Tấn'}, {value:'Xe tải 10 tấn', label:'10 Tấn'}, {value:'Container', label:'Container'}, {value:'Xe máy', label:'Xe máy'}]} />
              <Input label="Biển số xe" value={driverForm.licensePlate} onChange={e => setDriverForm({...driverForm, licensePlate: e.target.value})} placeholder="51C-12345" />
           </div>
           <Select label="Trạng thái" value={driverForm.status} onChange={e => setDriverForm({...driverForm, status: e.target.value})} options={[{value:'available', label:'Sẵn sàng'}, {value:'on_route', label:'Đang đi giao'}, {value:'off_duty', label:'Nghỉ phép'}]} />
        </div>
      </Modal>

      <Modal isOpen={isShipmentModalOpen} onClose={() => setIsShipmentModalOpen(false)} title={editingShipment ? "Cập nhật lệnh giao" : "Tạo lệnh giao hàng mới"}
        footer={<><Button variant="ghost" onClick={() => setIsShipmentModalOpen(false)}>Hủy</Button><Button onClick={handleSaveShipment} icon={editingShipment ? Save : Plus}>{editingShipment ? 'Cập nhật' : 'Lưu lệnh giao'}</Button></ warm-indigo-50>}>
        <div className="space-y-4">
           <Input label="Khách hàng" value={shipmentForm.customerName} onChange={e => setShipmentForm({...shipmentForm, customerName: e.target.value})} placeholder="Công ty A..." />
           <Input label="Địa chỉ giao" value={shipmentForm.address} onChange={e => setShipmentForm({...shipmentForm, address: e.target.value})} placeholder="123...) " />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Tài xế điều phối" value={shipmentForm.driverId} onChange={e => setShipmentForm({...shipmentForm, driverId: e.target.value})} 
                options={drivers.map(d => ({ value: d.id, label: d.name }))} />
              <Select label="Trạng thái" value={shipmentForm.status} onChange={e => setShipmentForm({...shipmentForm, status: e.target.value})} options={[{value:'pending', label:'Chờ lấy hàng'}, {value:'picked_up', label:'Đã lấy hàng'}, {value:'in_transit', label:'Đang giao'}, {value:'delivered', label:'Thành công'}, {value:'failed', label:'Thất bại'}]} />
           </div>
           <Input label="Dự kiến giao hàng" type="date" value={shipmentForm.estimatedArrival} onChange={e => setShipmentForm({...shipmentForm, estimatedArrival: e.target.value})} />
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
}
