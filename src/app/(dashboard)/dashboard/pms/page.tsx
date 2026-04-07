'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Search, Filter, Eye, Edit, Trash2,
  Package, Truck, CheckCircle, Clock, AlertTriangle,
  FileText, DollarSign, Building2, Calendar, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, User, Phone, Tag, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'orders' | 'suppliers';

export default function PMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

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
  const [orderForm, setOrderForm] = useState({ supplierId: '', amount: '0', status: 'pending', expectedDate: '', note: '', items: [] });
  const [supplierForm, setSupplierForm] = useState({ name: '', code: '', contact: '', email: '', phone: '', category: 'Nguyên vật liệu', status: 'active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        fetch('/api/purchase-orders'),
        fetch('/api/suppliers')
      ]);
      const oJson = await oRes.json();
      const sJson = await sRes.json();
      if (oJson.success) setOrders(oJson.data);
      if (sJson.success) setSuppliers(sJson.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handlers
  const handleSaveOrder = async () => {
    if (editingOrder) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật đơn mua',
        message: `Xác nhận lưu thay đổi cho đơn mua ${editingOrder.code}?`,
        type: 'success',
        onConfirm: executeSaveOrder
      });
    } else {
      executeSaveOrder();
    }
  };

  const executeSaveOrder = async () => {
    try {
      const url = editingOrder ? `/api/purchase-orders/${editingOrder.id}` : '/api/purchase-orders';
      const method = editingOrder ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderForm)
      });
      if (res.ok) { 
        setIsOrderModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveSupplier = async () => {
    if (editingSupplier) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật nhà cung cấp',
        message: `Xác nhận cập nhật thông tin cho nhà cung cấp ${editingSupplier.name}?`,
        type: 'success',
        onConfirm: executeSaveSupplier
      });
    } else {
      executeSaveSupplier();
    }
  };

  const executeSaveSupplier = async () => {
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      if (res.ok) { 
        setIsSupplierModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteOrder = (order: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy đơn mua',
      message: `Bạn có chắc chắn muốn hủy đơn mua ${order.code}? Bản ghi sẽ được chuyển vào lịch sử (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDeleteOrder(order.id)
    });
  };

  const executeDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteSupplier = (supplier: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa nhà cung cấp',
      message: `Xác nhận xóa nhà cung cấp ${supplier.name}? Dữ liệu sẽ được ẩn khỏi hệ thống.`,
      type: 'danger',
      onConfirm: () => executeDeleteSupplier(supplier.id)
    });
  };

  const executeDeleteSupplier = async (id: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEditOrder = (order: any) => {
    setEditingOrder(order);
    setOrderForm({
      supplierId: order.supplierId,
      amount: order.totalAmount.toString(),
      status: order.status,
      expectedDate: order.expectedDate || '',
      note: order.note || '',
      items: order.items || []
    });
    setIsOrderModalOpen(true);
  };

  const openEditSupplier = (s: any) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      code: s.code,
      contact: s.contact || '',
      email: s.email || '',
      phone: s.phone || '',
      category: s.category || 'Nguyên vật liệu',
      status: s.status || 'active'
    });
    setIsSupplierModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'orders') return (
      <Button icon={Plus} onClick={() => {
        setEditingOrder(null);
        setOrderForm({ supplierId: '', amount: '0', status: 'pending', expectedDate: '', note: '', items: [] });
        setIsOrderModalOpen(true);
      }}>
        Tạo đơn mua
      </Button>
    );
    if (activeTab === 'suppliers') return (
      <Button icon={Plus} onClick={() => {
        setEditingSupplier(null);
        setSupplierForm({ name: '', code: '', contact: '', email: '', phone: '', category: 'Nguyên vật liệu', status: 'active' });
        setIsSupplierModalOpen(true);
      }}>
        Thêm nhà cung cấp
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215, 80%, 50%, 0.12)' }}>
            <ShoppingCart size={22} style={{ color: 'hsl(215, 80%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PMS — Quản lý Mua hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cung ứng, đơn mua & quản lý nhà cung cấp</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'orders', label: 'Đơn mua hàng', icon: FileText },
          { key: 'suppliers', label: 'Nhà cung cấp', icon: Building2 },
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

      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in stagger-children">
           {orders.map(order => (
             <Card key={order.id} hover className="flex items-center gap-4 group">
                <div className="p-3 rounded-lg bg-[var(--primary-50)] text-[var(--primary-600)]"><FileText size={20}/></div>
                <div className="flex-1">
                   <h4 className="font-bold text-sm text-[var(--primary-600)]">{order.code}</h4>
                   <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{order.supplierName}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                   <div>
                     <p className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                     <Badge variant={order.status === 'received' ? 'success' : 'warning'}>{order.status}</Badge>
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-slate-100">
                      <button onClick={() => openEditOrder(order)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => confirmDeleteOrder(order)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
           {suppliers.map(s => (
             <Card key={s.id} hover padding="lg">
                <div className="flex items-start justify-between">
                   <div>
                      <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)">{s.code}</Badge>
                      <h3 className="font-bold text-base mt-2">{s.name}</h3>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <Badge variant={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditSupplier(s)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => confirmDeleteSupplier(s)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                   </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
                   <div className="flex items-center gap-2 font-medium"><User size={12}/> {s.contact || 'N/A'}</div>
                   <div className="flex items-center gap-2"><Phone size={12}/> {s.phone || 'N/A'}</div>
                   <div className="flex items-center gap-2"><Tag size={12}/> {s.category || 'N/A'}</div>
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title={editingOrder ? "Cập nhật đơn mua" : "Tạo đơn mua hàng mới"}
        footer={<><Button variant="ghost" onClick={() => setIsOrderModalOpen(false)}>Hủy</Button><Button onClick={handleSaveOrder} icon={editingOrder ? Save : Plus}>{editingOrder ? 'Cập nhật' : 'Lưu đơn mua'}</Button></>}>
        <div className="space-y-4">
           <Select label="Nhà cung cấp" value={orderForm.supplierId} onChange={e => setOrderForm({...orderForm, supplierId: e.target.value})} 
             options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
           <Input label="Giá trị đơn mua (VNĐ)" type="number" value={orderForm.amount} onChange={e => setOrderForm({...orderForm, amount: e.target.value})} />
           <Input label="Ngày dự kiến nhận" type="date" value={orderForm.expectedDate} onChange={e => setOrderForm({...orderForm, expectedDate: e.target.value})} />
           <Select label="Trạng thái" value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})} 
              options={[{value:'pending', label:'Chờ duyệt'}, {value:'confirmed', label:'Đã xác nhận'}, {value:'received', label:'Đã nhận hàng'}, {value:'cancelled', label:'Đã hủy'}]} />
           <Input label="Ghi chú" value={orderForm.note} onChange={e => setOrderForm({...orderForm, note: e.target.value})} />
        </div>
      </Modal>

      <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title={editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
        footer={<><Button variant="ghost" onClick={() => setIsSupplierModalOpen(false)}>Hủy</Button><Button onClick={handleSaveSupplier} icon={editingSupplier ? Save : Plus}>{editingSupplier ? 'Cập nhật' : 'Lưu nhà cung cấp'}</Button></>}>
        <div className="space-y-4">
           <Input label="Tên nhà cung cấp" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} placeholder="Công ty A..." />
           <Input label="Mã NCC" value={supplierForm.code} onChange={e => setSupplierForm({...supplierForm, code: e.target.value})} placeholder="NCC-001" disabled={!!editingSupplier} />
           <Input label="Email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} />
           <Input label="Số điện thoại" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} />
           <Select label="Phân loại" value={supplierForm.category} onChange={e => setSupplierForm({...supplierForm, category: e.target.value})} 
              options={[{value:'Nguyên vật liệu', label:'Nguyên vật liệu'}, {value:'Dịch vụ', label:'Dịch vụ'}, {value:'Thiết bị', label:'Thiết bị'}]} />
           <Select label="Trạng thái" value={supplierForm.status} onChange={e => setSupplierForm({...supplierForm, status: e.target.value})} 
              options={[{value:'active', label:'Hoạt động'}, {value:'inactive', label:'Ngừng hợp tác'}]} />
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
