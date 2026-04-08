'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, Globe, Server, Shield, Plug, AlertTriangle, 
  CheckCircle2, Plus, Edit, Trash2, Save, RefreshCw 
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, ConfirmModal, StatCard } from '@/components/ui';

export default function GMSPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Confirm State
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

  // Form State
  const [formData, setFormData] = useState({
    provider: 'MISA',
    category: 'e-invoice',
    name: '',
    apiKey: '',
    endpoint: '',
    webhookUrl: '',
    status: 'inactive'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gateway');
      const json = await res.json();
      if (json.success) setIntegrations(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `/api/gateway/${editingItem.id}` : '/api/gateway';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { 
        setIsModalOpen(false); 
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gateway/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDelete = (item: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa kết nối API',
      message: `Bạn có chắc muốn xóa cổng kết nối ${item.name}? Mọi liên lạc đến hệ thống này sẽ bị ngắt lập tức.`,
      type: 'danger',
      onConfirm: () => executeDelete(item.id)
    });
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      provider: item.provider,
      category: item.category,
      name: item.name,
      apiKey: item.apiKey || '',
      endpoint: item.endpoint || '',
      webhookUrl: item.webhookUrl || '',
      status: item.status
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--primary-600)' }}>
            <Network size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">GMS — Máy chủ kết nối cổng</h1>
            <p className="text-sm font-medium text-slate-500">Tích hợp Hệ Thống Bên Thứ 3 & API Keys</p>
          </div>
        </div>
        <Button icon={Plus} style={{ background: 'var(--primary-600)' }} onClick={() => {
          setEditingItem(null);
          setFormData({ provider: 'MISA', category: 'e-invoice', name: '', apiKey: '', endpoint: '', webhookUrl: '', status: 'inactive' });
          setIsModalOpen(true);
        }}>
          Thêm Endpoint
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Tổng số cổng" value={integrations.length} icon={Globe} color="var(--primary-500)" />
        <StatCard title="Đang hoạt động" value={integrations.filter(c => c.status === 'active').length} icon={CheckCircle2} color="var(--emerald)" />
        <StatCard title="Đã ngắt / Vô hiệu" value={integrations.filter(c => c.status === 'inactive').length} icon={Plug} color="var(--slate-500)" />
        <StatCard title="Cảnh báo lỗi" value={integrations.filter(c => c.status === 'error').length} icon={AlertTriangle} color="var(--rose)" />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4 pt-10 flex flex-col items-center">
           <RefreshCw className="animate-spin text-slate-300" size={32} />
           <p className="text-slate-400 font-medium">Đang tải cấu hình kết nối...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in stagger-children pt-2">
          {integrations.map((item) => (
            <Card key={item.id} hover className="relative group overflow-hidden border-t-[6px]" style={{ borderTopColor: item.status === 'active' ? 'var(--emerald)' : item.status === 'error' ? 'var(--rose)' : 'var(--slate-300)' }}>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-1.5 bg-slate-100 hover:bg-white rounded-md text-slate-500 hover:text-primary-600 transition-colors shadow-sm"><Edit size={14} /></button>
                <button onClick={() => confirmDelete(item)} className="p-1.5 bg-slate-100 hover:bg-rose-50 rounded-md text-slate-500 hover:text-rose-600 transition-colors shadow-sm"><Trash2 size={14} /></button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 shadow-inner">
                   <Server size={18} className="text-slate-600" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800 tracking-tight">{item.name}</h3>
                   <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)" size="sm">{item.category}</Badge>
                </div>
              </div>
              
              <div className="space-y-3 mt-5">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nhà cung cấp (Provider)</p>
                    <p className="text-sm font-semibold text-slate-700">{item.provider}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">API Endpoint</p>
                    <p className="text-xs font-mono bg-slate-50 px-2 py-1.5 rounded border text-slate-600 truncate" title={item.endpoint}>{item.endpoint || 'Chưa cấu hình'}</p>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Shield size={14} className={item.status === 'active' ? 'text-emerald-500' : 'text-slate-400'} /> 
                      {item.status === 'active' ? 'Secured' : 'Offline'}
                    </span>
                    <Badge variant={item.status === 'active' ? 'success' : item.status === 'error' ? 'danger' : 'default'}>{item.status}</Badge>
                 </div>
              </div>
            </Card>
          ))}
          {integrations.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <Network size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Chưa có kết nối Gateway nào.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Sửa Cấu hình Endpoint" : "Thêm Endpoint Mới"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingItem ? Save : Plus}>{editingItem ? 'Cập nhật' : 'Thêm kết nối'}</Button></>}
      >
        <div className="space-y-5">
           <Input label="Tên gợi nhớ" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Vd: MISA meInvoice Chi nhánh HN" />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Phân loại / Giao thức" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} options={[{value:'e-invoice', label:'Hóa đơn điện tử'}, {value:'erp', label:'ERP Core (SAP/Oracle)'}, {value:'timekeeping', label:'Máy chấm công (AI/FaceID)'}, {value:'message', label:'OTP & Tin nhắn Zalo/SMS'}]} />
              <Input label="Tên nhà cung cấp (Mã nội bộ)" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value.toUpperCase()})} placeholder="MISA, SAP, HANET, ZALO" />
           </div>
           
           <div className="p-4 bg-slate-50 rounded-xl border space-y-4">
             <Input label="Endpoint gốc (Base URL)" value={formData.endpoint} onChange={e => setFormData({...formData, endpoint: e.target.value})} placeholder="https://api.misa.vn/..." />
             <Input label="Khóa xác thực (API Key / Bearer Token)" type="password" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} placeholder="•••••••••••••••••••••••••" />
             <Input label="Webhook URL (Nhận Callback)" value={formData.webhookUrl} onChange={e => setFormData({...formData, webhookUrl: e.target.value})} placeholder="https://aio.ms/api/webhook/..." />
           </div>
           
           <Select label="Trạng thái kích hoạt" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={[{value:'inactive', label:'Ngắt kết nối (Inactive)'}, {value:'active', label:'Kích hoạt kết nối (Active)'}, {value:'error', label:'Theo dõi lỗi (Error)'}]} />
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
