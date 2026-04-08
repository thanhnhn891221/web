'use client';

import React, { useState, useEffect } from 'react';
import { Network, MapPin, Users, TrendingUp, DollarSign, Plus, Search, Phone, Star, MoreHorizontal, LayoutDashboard, Route, Edit, Trash2, Save } from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'distributors' | 'routes';

export default function DMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('distributors');
  const [distributors, setDistributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<any | null>(null);

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

  // Form state
  const [formData, setFormData] = useState({ name: '', region: '', type: 'Cấp 1', contact: '', phone: '', code: '', status: 'active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/distributors');
      const json = await res.json();
      if (json.success) setDistributors(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingDistributor) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật đại lý',
        message: `Xác nhận lưu thay đổi cho đại lý ${editingDistributor.name}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingDistributor ? `/api/distributors/${editingDistributor.id}` : '/api/distributors';
      const method = editingDistributor ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { 
        setIsModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handler
  const confirmDelete = (d: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa đại lý',
      message: `Bạn có chắc chắn muốn xóa đại lý ${d.name}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(d.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/distributors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (d: any) => {
    setEditingDistributor(d);
    setFormData({
      name: d.name,
      region: d.region || '',
      type: d.type || 'Cấp 1',
      contact: d.contact || '',
      phone: d.phone || '',
      code: d.code || '',
      status: d.status || 'active'
    });
    setIsModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'distributors') return (
      <Button icon={Plus} onClick={() => {
        setEditingDistributor(null);
        setFormData({ name: '', region: '', type: 'Cấp 1', contact: '', phone: '', code: '', status: 'active' });
        setIsModalOpen(true);
      }}>
        Thêm đại lý
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(260, 55%, 52%, 0.12)' }}>
            <Network size={22} style={{ color: 'hsl(260, 55%, 52%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DMS — Quản lý Phân phối</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Đại lý, tuyến đường & hiệu quả đo lường</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'distributors', label: 'Hệ thống đại lý', icon: Network },
          { key: 'routes', label: 'Tuyến đường', icon: Route },
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

      {activeTab === 'distributors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
           {distributors.map(d => (
              <Card key={d.id} hover padding="md" className="flex flex-col justify-between group cursor-pointer" onClick={() => openEdit(d)}>
                <div>
                   <div className="flex items-start justify-between">
                      <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)">{d.code}</Badge>
                      <div className="flex flex-col items-end gap-2">
                         <Badge variant={d.status === 'active' ? 'success' : 'default'}>{d.status}</Badge>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(d); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); confirmDelete(d); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                   <h3 className="font-bold text-sm mt-3 line-clamp-1 text-slate-800">{d.name}</h3>
                   <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
                      <MapPin size={10} /> {d.region} · {d.type}
                   </div>
                </div>
                <div className="mt-6 pt-3 border-t">
                   <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Đại diện liên hệ</p>
                   <p className="text-xs font-bold text-slate-700">{d.contact}</p>
                   <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{d.phone}</p>
                </div>
              </Card>
           ))}
        </div>
      )}

      {activeTab === 'routes' && (
         <Card padding="lg" className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 border-dashed border-2">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
               <Route size={32} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-lg text-slate-700">Quản lý tuyến đường đang được thiết lập</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-2">Tính năng bản đồ nhiệt và tối ưu hóa tuyến đường giao hàng thông minh đang được phát triển.</p>
            <Button variant="outline" className="mt-6" disabled>Yêu cầu cấu hình</Button>
         </Card>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDistributor ? "Cập nhật đại lý" : "Thêm đại lý mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingDistributor ? Save : Plus}>{editingDistributor ? 'Cập nhật' : 'Lưu đại lý'}</Button></>}>
        <div className="space-y-4">
           <Input label="Tên đại lý" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Đại lý A..." />
           <Input label="Khu vực" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} placeholder="TP.HCM / Hà Nội / Đồng Nai..." />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Cấp đại lý" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} options={[{value:'Cấp 1', label:'Đại lý cấp 1'}, {value:'Cấp 2', label:'Nhà phân phối'}]} />
              <Input label="Mã đại lý" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="DL-00X" disabled={!!editingDistributor} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input label="Người liên hệ" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              <Input label="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
           </div>
           <Select label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={[{value:'active', label:'Đang hoạt động'}, {value:'inactive', label:'Ngừng hợp tác'}]} />
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
