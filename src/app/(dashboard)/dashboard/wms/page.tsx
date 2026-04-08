'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, Filter, Eye, Edit, Trash2,
  Warehouse, MapPin, Truck, History, AlertTriangle,
  MoveHorizontal, LayoutDashboard, Database, HardDrive,
  CheckCircle2, ArrowRightLeft, User, Boxes, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'inventory' | 'warehouses' | 'movements';

export default function WMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);

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
  const [itemForm, setItemForm] = useState({ name: '', sku: '', category: 'Vật tư', warehouseId: '', quantity: '0', unit: 'Kg', zone: '', minStock: '10', status: 'in_stock' });
  const [warehouseForm, setWarehouseForm] = useState({ name: '', code: '', address: '', capacity: '1000', status: 'active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [iRes, wRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/warehouses')
      ]);
      const iJson = await iRes.json();
      const wJson = await wRes.json();
      if (iJson.success) setInventory(iJson.data);
      if (wJson.success) setWarehouses(wJson.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handlers
  const handleSaveItem = async () => {
    if (editingItem) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật vật tư',
        message: `Xác nhận lưu thay đổi cho vật tư ${editingItem.sku}?`,
        type: 'success',
        onConfirm: executeSaveItem
      });
    } else {
      executeSaveItem();
    }
  };

  const executeSaveItem = async () => {
    try {
      const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm)
      });
      if (res.ok) { 
        setIsItemModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveWarehouse = async () => {
    if (editingWarehouse) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật kho bãi',
        message: `Xác nhận cập nhật thông tin cho kho ${editingWarehouse.name}?`,
        type: 'success',
        onConfirm: executeSaveWarehouse
      });
    } else {
      executeSaveWarehouse();
    }
  };

  const executeSaveWarehouse = async () => {
    try {
      const url = editingWarehouse ? `/api/warehouses/${editingWarehouse.id}` : '/api/warehouses';
      const method = editingWarehouse ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseForm)
      });
      if (res.ok) { 
        setIsWarehouseModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteItem = (item: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa vật tư',
      message: `Bạn có chắc chắn muốn xóa vật tư ${item.sku}? Dữ liệu sẽ được ẩn khỏi danh sách tồn kho.`,
      type: 'danger',
      onConfirm: () => executeDeleteItem(item.id)
    });
  };

  const executeDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteWarehouse = (w: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa kho bãi',
      message: `Xác nhận xóa kho ${w.name}? Cảnh báo: Việc xóa kho có thể ảnh hưởng đến các bản ghi tồn kho liên quan.`,
      type: 'danger',
      onConfirm: () => executeDeleteWarehouse(w.id)
    });
  };

  const executeDeleteWarehouse = async (id: string) => {
    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category || 'Vật tư',
      warehouseId: item.warehouseId || '',
      quantity: item.quantity.toString(),
      unit: item.unit || 'Kg',
      zone: item.zone || '',
      minStock: (item.minStock || 10).toString(),
      status: item.status || 'in_stock'
    });
    setIsItemModalOpen(true);
  };

  const openEditWarehouse = (w: any) => {
    setEditingWarehouse(w);
    setWarehouseForm({
      name: w.name,
      code: w.code,
      address: w.address || '',
      capacity: w.capacity?.toString() || '1000',
      status: w.status || 'active'
    });
    setIsWarehouseModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'inventory') return (
      <Button icon={Plus} onClick={() => {
        setEditingItem(null);
        setItemForm({ name: '', sku: '', category: 'Vật tư', warehouseId: '', quantity: '0', unit: 'Kg', zone: '', minStock: '10', status: 'in_stock' });
        setIsItemModalOpen(true);
      }}>
        Thêm vật tư
      </Button>
    );
    if (activeTab === 'warehouses') return (
      <Button icon={Plus} onClick={() => {
        setEditingWarehouse(null);
        setWarehouseForm({ name: '', code: '', address: '', capacity: '1000', status: 'active' });
        setIsWarehouseModalOpen(true);
      }}>
        Thêm kho
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 65%, 42%, 0.12)' }}>
            <Warehouse size={22} style={{ color: 'hsl(142, 65%, 42%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WMS — Quản lý Kho</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Vật tư, kho bãi & vận hành nhập xuất</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'inventory', label: 'Tồn kho', icon: Boxes },
          { key: 'warehouses', label: 'Kho bãi', icon: Warehouse },
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

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
           {inventory.map(item => (
              <Card key={item.id} hover padding="md" className="group cursor-pointer" onClick={() => openEditItem(item)}>
                 <div className="flex items-start justify-between">
                    <div>
                       <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)">{item.sku}</Badge>
                       <h3 className="font-bold text-sm mt-1 line-clamp-1">{item.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Badge variant={item.quantity > item.minStock ? 'success' : 'warning'}>{item.status}</Badge>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEditItem(item); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); confirmDeleteItem(item); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="mt-4 flex items-center justify-between pt-3 border-t">
                    <div>
                       <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Số lượng</p>
                       <p className="text-lg font-bold text-slate-800">{item.quantity} <span className="text-xs font-normal text-slate-400 uppercase">{item.unit}</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Vị trí</p>
                       <p className="text-sm font-semibold text-blue-600">{item.warehouseName || 'Chưa gán'}</p>
                       <p className="text-[10px] text-slate-400">Khu vực: {item.zone || '-'}</p>
                    </div>
                 </div>
              </Card>
           ))}
        </div>
      )}

      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in stagger-children">
           {warehouses.map(w => (
              <Card key={w.id} hover padding="lg" className="group cursor-pointer" onClick={() => openEditWarehouse(w)}>
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[var(--primary-50)] text-[var(--primary-600)] flex items-center justify-center">
                          <Warehouse size={24}/>
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-slate-800">{w.name}</h3>
                          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5"><MapPin size={14}/> {w.address || 'Chưa cập nhật địa chỉ'}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       <Badge variant="custom" bg="var(--slate-100)" color="var(--text-secondary)">{w.code}</Badge>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEditWarehouse(w); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); confirmDeleteWarehouse(w); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="mt-8">
                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase text-slate-400">
                       <span>Sức chứa</span>
                       <span className="text-slate-600">{w.itemCount || 0} / {w.capacity} kiện</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min(100, ((w.itemCount || 0) / (w.capacity || 1000)) * 100)}%` }} />
                    </div>
                 </div>
              </Card>
           ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? "Cập nhật vật tư" : "Thêm vật tư mới"}
        footer={<><Button variant="ghost" onClick={() => setIsItemModalOpen(false)}>Hủy</Button><Button onClick={handleSaveItem} icon={editingItem ? Save : Plus}>{editingItem ? 'Cập nhật' : 'Lưu vật tư'}</Button></>}>
        <div className="space-y-4">
           <Input label="Tên vật tư" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="Vải lót..." />
           <div className="grid grid-cols-2 gap-4">
              <Input label="SKU" value={itemForm.sku} onChange={e => setItemForm({...itemForm, sku: e.target.value})} placeholder="SKU-XXX" disabled={!!editingItem} />
              <Select label="Danh mục" value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} options={[{value:'Vật tư', label:'Vật tư'}, {value:'Bán thành phẩm', label:'Bán thành phẩm'}, {value:'Thành phẩm', label:'Thành phẩm'}]} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Select label="Kho lưu trữ" value={itemForm.warehouseId} onChange={e => setItemForm({...itemForm, warehouseId: e.target.value})} options={warehouses.map(w => ({ value: w.id, label: w.name }))} />
              <Input label="Khu vực (Zone)" value={itemForm.zone} onChange={e => setItemForm({...itemForm, zone: e.target.value})} placeholder="Khu A1" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input label="Số lượng" type="number" value={itemForm.quantity} onChange={e => setItemForm({...itemForm, quantity: e.target.value})} />
              <Input label="Định mức tồn tối thiểu" type="number" value={itemForm.minStock} onChange={e => setItemForm({...itemForm, minStock: e.target.value})} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Select label="Đơn vị" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} options={[{value:'Kg', label:'Kg'}, {value:'Cuộn', label:'Cuộn'}, {value:'Mét', label:'Mét'}, {value:'Cái', label:'Cái'}]} />
              <Select label="Trạng thái" value={itemForm.status} onChange={e => setItemForm({...itemForm, status: e.target.value})} options={[{value:'in_stock', label:'Sẵn sàng'}, {value:'low_stock', label:'Sắp hết'}, {value:'out_of_stock', label:'Hết hàng'}]} />
           </div>
        </div>
      </Modal>

      <Modal isOpen={isWarehouseModalOpen} onClose={() => setIsWarehouseModalOpen(false)} title={editingWarehouse ? "Cập nhật kho bãi" : "Thêm kho bãi mới"}
        footer={<><Button variant="ghost" onClick={() => setIsWarehouseModalOpen(false)}>Hủy</Button><Button onClick={handleSaveWarehouse} icon={editingWarehouse ? Save : Plus}>{editingWarehouse ? 'Cập nhật' : 'Lưu kho'}</Button></>}>
        <div className="space-y-4">
           <Input label="Tên kho" value={warehouseForm.name} onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} placeholder="Kho A..." />
           <Input label="Mã kho" value={warehouseForm.code} onChange={e => setWarehouseForm({...warehouseForm, code: e.target.value})} placeholder="WH-01" disabled={!!editingWarehouse} />
           <Input label="Địa chỉ" value={warehouseForm.address} onChange={e => setWarehouseForm({...warehouseForm, address: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Input label="Sức chứa tối đa (kiện)" type="number" value={warehouseForm.capacity} onChange={e => setWarehouseForm({...warehouseForm, capacity: e.target.value})} />
              <Select label="Trạng thái" value={warehouseForm.status} onChange={e => setWarehouseForm({...warehouseForm, status: e.target.value})} options={[{value:'active', label:'Hoạt động'}, {value:'maintenance', label:'Bảo trì'}, {value:'full', label:'Đã đầy'}]} />
           </div>
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
