'use client';

import React, { useState, useEffect } from 'react';
import {
  Factory, Play, Pause, Settings, AlertTriangle,
  ClipboardList, Plus, Search, CheckCircle, Clock,
  Package, TrendingUp, Cpu, Gauge, MoreHorizontal,
  ChevronRight, Activity, Calendar, Edit, Trash2, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'lines' | 'orders' | 'maintenance';

export default function FMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('lines');
  const [lines, setLines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingLine, setEditingLine] = useState<any | null>(null);

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
  const [orderForm, setOrderForm] = useState({ productName: '', quantity: '1000', unit: 'Kg', startDate: '', status: 'queued', note: '' });
  const [lineForm, setLineForm] = useState({ name: '', code: '', status: 'idle', capacity: '100', manager: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lRes, oRes] = await Promise.all([
        fetch('/api/production/lines'),
        fetch('/api/production/orders')
      ]);
      const lJson = await lRes.json();
      const oJson = await oRes.json();
      if (lJson.success) setLines(lJson.data);
      if (oJson.success) setOrders(oJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLine = async (lineId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'idle' : 'running';
    try {
      const res = await fetch(`/api/production/lines/${lineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  // SAVE Handlers
  const handleSaveOrder = async () => {
    if (editingOrder) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật lệnh sản xuất',
        message: `Xác nhận lưu thay đổi cho lệnh sản xuất ${editingOrder.code}?`,
        type: 'success',
        onConfirm: executeSaveOrder
      });
    } else {
      executeSaveOrder();
    }
  };

  const executeSaveOrder = async () => {
    try {
      const url = editingOrder ? `/api/production/orders/${editingOrder.id}` : '/api/production/orders';
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

  const handleSaveLine = async () => {
    if (editingLine) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật dây chuyền',
        message: `Xác nhận cập nhật thông tin cho dây chuyền ${editingLine.name}?`,
        type: 'success',
        onConfirm: executeSaveLine
      });
    } else {
      executeSaveLine();
    }
  };

  const executeSaveLine = async () => {
    try {
      const url = editingLine ? `/api/production/lines/${editingLine.id}` : '/api/production/lines';
      const method = editingLine ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lineForm)
      });
      if (res.ok) { 
        setIsLineModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteOrder = (order: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa lệnh sản xuất',
      message: `Bạn có chắc chắn muốn xóa lệnh sản xuất ${order.code}? Bản ghi sẽ được chuyển vào lịch sử (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDeleteOrder(order.id)
    });
  };

  const executeDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/production/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteLine = (line: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa dây chuyền',
      message: `Xác nhận xóa dây chuyền ${line.name}? Dữ liệu sẽ được ẩn khỏi hệ thống.`,
      type: 'danger',
      onConfirm: () => executeDeleteLine(line.id)
    });
  };

  const executeDeleteLine = async (id: string) => {
    try {
      const res = await fetch(`/api/production/lines/${id}`, { method: 'DELETE' });
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
      productName: order.productName,
      quantity: order.quantity.toString(),
      unit: order.unit,
      startDate: order.startDate ? new Date(order.startDate).toISOString().split('T')[0] : '',
      status: order.status,
      note: order.note || ''
    });
    setIsOrderModalOpen(true);
  };

  const openEditLine = (line: any) => {
    setEditingLine(line);
    setLineForm({
      name: line.name,
      code: line.code,
      status: line.status,
      capacity: line.capacity?.toString() || '100',
      manager: line.manager || ''
    });
    setIsLineModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'orders') return (
      <Button icon={Plus} onClick={() => {
        setEditingOrder(null);
        setOrderForm({ productName: '', quantity: '1000', unit: 'Kg', startDate: new Date().toISOString().split('T')[0], status: 'queued', note: '' });
        setIsOrderModalOpen(true);
      }}>
        Tạo lệnh SX
      </Button>
    );
    if (activeTab === 'lines') return (
      <Button icon={Plus} onClick={() => {
        setEditingLine(null);
        setLineForm({ name: '', code: '', status: 'idle', capacity: '100', manager: '' });
        setIsLineModalOpen(true);
      }}>
        Thêm dây chuyền
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(10, 80%, 55%, 0.12)' }}>
            <Factory size={22} style={{ color: 'hsl(10, 80%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FMS — Quản lý Nhà máy</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sản xuất, dây chuyền & OEE</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'lines', label: 'Dây chuyền', icon: Activity },
          { key: 'orders', label: 'Lệnh sản xuất', icon: ClipboardList },
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

      {activeTab === 'lines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {lines.map(line => (
            <Card key={line.id} hover padding="lg" className="cursor-pointer" onClick={() => openEditLine(line)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: line.status === 'running' ? 'rgba(16, 185, 129, 0.1)' : 'var(--slate-100)' }}>
                    <Cpu size={20} style={{ color: line.status === 'running' ? 'rgb(16, 185, 129)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{line.name}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">CODE: {line.code} · OEE: {line.oee || 0}%</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={line.status === 'running' ? 'success' : 'warning'}>{line.status === 'running' ? 'Đang chạy' : 'Dừng'}</Badge>
                   <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditLine(line); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); confirmDeleteLine(line); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 pt-3 border-t">
                <Button size="sm" variant={line.status === 'running' ? 'outline' : 'primary'} icon={line.status === 'running' ? Pause : Play} onClick={() => toggleLine(line.id, line.status)} className="flex-1">
                  {line.status === 'running' ? 'Dừng' : 'Chạy'}
                </Button>
                <Button size="sm" variant="ghost" icon={Settings} className="px-2"><span className="hidden sm:inline">Cài đặt</span></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in stagger-children">
          {orders.map(order => (
            <Card key={order.id} hover className="flex items-center gap-4 group cursor-pointer" onClick={() => openEditOrder(order)}>
              <div className="p-3 rounded-lg bg-[var(--primary-50)] text-[var(--primary-600)] pl-4">
                <ClipboardList size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800">{order.productName}</h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Số lượng: {order.quantity} {order.unit} · Mã: {order.code}</p>
              </div>
              <div className="flex items-center gap-4 pr-2">
                 <div className="text-right">
                    <Badge variant={order.status === 'active' || order.status === 'running' ? 'success' : 'info'}>{order.status}</Badge>
                    <p className="text-[10px] text-slate-400 mt-1">{order.startDate ? new Date(order.startDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                 </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); openEditOrder(order); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDeleteOrder(order); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title={editingOrder ? "Cập nhật lệnh SX" : "Tạo lệnh sản xuất mới"}
        footer={<><Button variant="ghost" onClick={() => setIsOrderModalOpen(false)}>Hủy</Button><Button onClick={handleSaveOrder} icon={editingOrder ? Save : Plus}>{editingOrder ? 'Cập nhật' : 'Lưu lệnh SX'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên sản phẩm" value={orderForm.productName} onChange={e => setOrderForm({...orderForm, productName: e.target.value})} placeholder="Sợi Cotton 100%" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Số lượng" type="number" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
            <Select label="Đơn vị" value={orderForm.unit} onChange={e => setOrderForm({...orderForm, unit: e.target.value})} options={[{value:'Kg', label:'Kg'}, {value:'Mét', label:'Mét'}, {value:'Tấn', label:'Tấn'}]} />
          </div>
          <Input label="Ngày dự kiến bắt đầu" type="date" value={orderForm.startDate} onChange={e => setOrderForm({...orderForm, startDate: e.target.value})} />
          <Select label="Trạng thái" value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})} 
            options={[{value:'queued', label:'Chờ sản xuất'}, {value:'running', label:'Đang chạy'}, {value:'completed', label:'Hoàn tất'}, {value:'cancelled', label:'Đã hủy'}]} />
        </div>
      </Modal>

      <Modal isOpen={isLineModalOpen} onClose={() => setIsLineModalOpen(false)} title={editingLine ? "Cập nhật dây chuyền" : "Thêm dây chuyền mới"}
        footer={<><Button variant="ghost" onClick={() => setIsLineModalOpen(false)}>Hủy</Button><Button onClick={handleSaveLine} icon={editingLine ? Save : Plus}>{editingLine ? 'Cập nhật' : 'Lưu dây chuyền'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên dây chuyền" value={lineForm.name} onChange={e => setLineForm({...lineForm, name: e.target.value})} placeholder="Dây chuyền 01..." />
          <Input label="Mã dây chuyền" value={lineForm.code} onChange={e => setLineForm({...lineForm, code: e.target.value})} placeholder="DC-001" disabled={!!editingLine} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Công suất (sp/h)" type="number" value={lineForm.capacity} onChange={e => setLineForm({...lineForm, capacity: e.target.value})} />
             <Select label="Trạng thái" value={lineForm.status} onChange={e => setLineForm({...lineForm, status: e.target.value})} 
               options={[{value:'idle', label:'Đang dừng'}, {value:'running', label:'Đang chạy'}, {value:'maintenance', label:'Bảo trì'}]} />
          </div>
          <Input label="Quản lý" value={lineForm.manager} onChange={e => setLineForm({...lineForm, manager: e.target.value})} placeholder="Nguyễn Văn A..." />
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
