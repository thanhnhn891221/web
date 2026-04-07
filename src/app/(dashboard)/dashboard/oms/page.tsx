'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Plus, Search, Filter, Eye, Edit, Trash2,
  Users, Truck, CheckCircle2, Clock, Package,
  DollarSign, MapPin, MoreHorizontal, FileText,
  ArrowUpRight, ArrowDownRight, User, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'orders' | 'customers';

export default function OMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

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
  const [orderForm, setOrderForm] = useState({ customerId: '', totalAmount: '0', status: 'pending', channel: '', note: '', expectedDelivery: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', code: '', email: '', phone: '', type: 'B2B', tier: 'standard' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [oRes, cRes] = await Promise.all([
        fetch('/api/sales-orders'),
        fetch('/api/customers')
      ]);
      const oJson = await oRes.json();
      const cJson = await cRes.json();
      if (oJson.success) setOrders(oJson.data);
      if (cJson.success) setCustomers(cJson.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handlers
  const handleSaveOrder = async () => {
    if (editingOrder) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật đơn hàng',
        message: `Xác nhận lưu thay đổi cho đơn hàng ${editingOrder.code}?`,
        type: 'success',
        onConfirm: executeSaveOrder
      });
    } else {
      executeSaveOrder();
    }
  };

  const executeSaveOrder = async () => {
    try {
      const url = editingOrder ? `/api/sales-orders/${editingOrder.id}` : '/api/sales-orders';
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

  const handleSaveCustomer = async () => {
    if (editingCustomer) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật khách hàng',
        message: `Xác nhận cập nhật thông tin cho khách hàng ${editingCustomer.name}?`,
        type: 'success',
        onConfirm: executeSaveCustomer
      });
    } else {
      executeSaveCustomer();
    }
  };

  const executeSaveCustomer = async () => {
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      if (res.ok) { 
        setIsCustomerModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteOrder = (order: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy đơn hàng',
      message: `Bạn có chắc chắn muốn hủy đơn hàng ${order.code}? Bản ghi sẽ được chuyển vào lịch sử (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDeleteOrder(order.id)
    });
  };

  const executeDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/sales-orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteCustomer = (customer: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa khách hàng',
      message: `Xác nhận xóa khách hàng ${customer.name}? Dữ liệu sẽ được ẩn khỏi hệ thống.`,
      type: 'danger',
      onConfirm: () => executeDeleteCustomer(customer.id)
    });
  };

  const executeDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
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
      customerId: order.customerId,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      channel: order.channel || '',
      note: order.note || '',
      expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : ''
    });
    setIsOrderModalOpen(true);
  };

  const openEditCustomer = (c: any) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      code: c.code,
      email: c.email || '',
      phone: c.phone || '',
      type: c.type || 'B2B',
      tier: c.tier || 'standard'
    });
    setIsCustomerModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'orders') return (
      <Button icon={Plus} onClick={() => {
        setEditingOrder(null);
        setOrderForm({ customerId: '', totalAmount: '0', status: 'pending', channel: '', note: '', expectedDelivery: '' });
        setIsOrderModalOpen(true);
      }}>
        Tạo đơn hàng
      </Button>
    );
    if (activeTab === 'customers') return (
      <Button icon={Plus} onClick={() => {
        setEditingCustomer(null);
        setCustomerForm({ name: '', code: '', email: '', phone: '', type: 'B2B', tier: 'standard' });
        setIsCustomerModalOpen(true);
      }}>
        Thêm khách hàng
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215, 85%, 52%, 0.12)' }}>
            <ShoppingBag size={22} style={{ color: 'hsl(215, 85%, 52%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OMS — Quản lý Đơn hàng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tiếp nhận, xử lý & theo dõi trạng thái đơn</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'orders', label: 'Đơn bán hàng', icon: FileText },
          { key: 'customers', label: 'Khách hàng', icon: Users },
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
        <div className="space-y-4 animate-fade-in">
           {orders.map(order => (
              <Card key={order.id} hover className="flex items-center gap-4 group">
                 <div className="p-3 rounded-lg bg-[var(--primary-50)] text-[var(--primary-600)]"><FileText size={20}/></div>
                 <div className="flex-1">
                    <h4 className="font-bold text-sm text-[var(--primary-600)]">{order.code}</h4>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{order.customerName}</p>
                 </div>
                 <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                      <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</Badge>
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

      {activeTab === 'customers' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {customers.map(c => (
               <Card key={c.id} hover padding="lg">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--slate-100)] flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                        <div>
                           <h3 className="font-semibold text-sm">{c.name}</h3>
                           <p className="text-[10px] text-[var(--text-muted)]">{c.code} · {c.type}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditCustomer(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => confirmDeleteCustomer(c)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>
                  </div>
                  <div className="mt-4 space-y-2">
                     <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><User size={12}/> {c.phone || 'N/A'}</div>
                     <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Mail size={12}/> {c.email || 'N/A'}</div>
                  </div>
               </Card>
            ))}
         </div>
      )}

      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title={editingOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
        footer={<><Button variant="ghost" onClick={() => setIsOrderModalOpen(false)}>Hủy</Button><Button onClick={handleSaveOrder} icon={editingOrder ? Save : Plus}>{editingOrder ? 'Cập nhật' : 'Lưu đơn hàng'}</Button></>}>
        <div className="space-y-4">
           <Select label="Khách hàng" value={orderForm.customerId} onChange={e => setOrderForm({...orderForm, customerId: e.target.value})} 
             options={customers.map(c => ({ value: c.id, label: c.name }))} />
           <Input label="Giá trị đơn hàng" type="number" value={orderForm.totalAmount} onChange={e => setOrderForm({...orderForm, totalAmount: e.target.value})} />
           <Select label="Kênh bán" value={orderForm.channel} onChange={e => setOrderForm({...orderForm, channel: e.target.value})} 
             options={[{value:'direct', label:'Trực tiếp'}, {value:'online', label:'Online'}, {value:'distributor', label:'Đại lý'}]} />
           <Select label="Trạng thái" value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})} 
             options={[{value:'pending', label:'Chờ duyệt'}, {value:'confirmed', label:'Đã xác nhận'}, {value:'shipping', label:'Đang giao'}, {value:'completed', label:'Hoàn tất'}]} />
           <Input label="Ghi chú" value={orderForm.note} onChange={e => setOrderForm({...orderForm, note: e.target.value})} placeholder="..." />
        </div>
      </Modal>

      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title={editingCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
        footer={<><Button variant="ghost" onClick={() => setIsCustomerModalOpen(false)}>Hủy</Button><Button onClick={handleSaveCustomer} icon={editingCustomer ? Save : Plus}>{editingCustomer ? 'Cập nhật' : 'Lưu khách hàng'}</Button></>}>
        <div className="space-y-4">
           <Input label="Tên khách hàng" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} placeholder="Công ty A..." />
           <Input label="Mã KH" value={customerForm.code} onChange={e => setCustomerForm({...customerForm, code: e.target.value})} placeholder="KH-001" disabled={!!editingCustomer} />
           <Input label="Số điện thoại" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="090..." />
           <Input label="Email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} placeholder="example@mail.com" />
           <Select label="Phân loại" value={customerForm.type} onChange={e => setCustomerForm({...customerForm, type: e.target.value})} 
             options={[{value:'B2B', label:'Doanh nghiệp (B2B)'}, {value:'B2C', label:'Cá nhân (B2C)'}]} />
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
