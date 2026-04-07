'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Plus, Search, Filter, Eye, Edit, Trash2,
  Users, Target, BarChart3, Phone, Mail, Clock,
  Calendar, Award, MoreHorizontal, User, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function SMSPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);

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
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: 'Website', status: 'new', potential: 'medium', note: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success) setLeads(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingLead) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật Lead',
        message: `Xác nhận lưu thay đổi cho lead ${editingLead.name}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads';
      const method = editingLead ? 'PUT' : 'POST';
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
  const confirmDelete = (lead: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Lead',
      message: `Bạn có chắc chắn muốn xóa lead ${lead.name}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(lead.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Website',
      status: lead.status,
      potential: lead.potential || lead.priority || 'medium',
      note: lead.note || lead.notes || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(14, 90%, 55%, 0.12)' }}>
            <TrendingUp size={22} style={{ color: 'hsl(14, 90%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SMS — Quản lý Sale thị trường</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Đội ngũ sale, khách hàng tiềm năng & hiệu suất doanh số</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => {
          setEditingLead(null);
          setFormData({ name: '', email: '', phone: '', source: 'Website', status: 'new', potential: 'medium', note: '' });
          setIsModalOpen(true);
        }}>
          Tạo Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Đội ngũ Sale" value="12" icon={Users} color="var(--primary-500)" />
        <StatCard title="Lead thị trường" value={leads.length} icon={Award} color="var(--amber)" />
        <StatCard title="Tỉ lệ chốt" value="34%" icon={Target} color="var(--emerald)" />
        <StatCard title="KPI tháng" value="85%" icon={BarChart3} color="var(--rose)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map(lead => (
           <Card key={lead.id} hover padding="md">
              <div className="flex items-start justify-between">
                <div>
                   <h3 className="font-bold text-sm">{lead.name}</h3>
                   <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{lead.code} · {lead.source}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'contacted' ? 'warning' : 'success'}>{lead.status}</Badge>
                   <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(lead)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => confirmDelete(lead)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                 <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Mail size={12}/> {lead.email || 'N/A'}</div>
                 <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Phone size={12}/> {lead.phone || 'N/A'}</div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t">
                 <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)">{lead.potential || lead.priority}</Badge>
                 <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Created {new Date(lead.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
           </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLead ? "Chỉnh sửa Lead" : "Tạo Lead tiềm năng mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingLead ? Save : Plus}>{editingLead ? 'Cập nhật' : 'Lưu Lead'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên khách hàng tiềm năng" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nguyễn Văn A..." />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             <Input label="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Nguồn Lead" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} 
              options={[{value:'Website', label:'Website'}, {value:'Ads', label:'Quảng cáo'}, {value:'Offline', label:'Trực tiếp'}]} />
            <Select label="Mức độ tiềm năng" value={formData.potential} onChange={e => setFormData({...formData, potential: e.target.value})}
              options={[{value:'low', label:'Thấp'}, {value:'medium', label:'Trung bình'}, {value:'high', label:'Cao'}]} />
          </div>
          <Select label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} 
              options={[{value:'new', label:'Mới'}, {value:'contacted', label:'Đã liên hệ'}, {value:'qualified', label:'Đủ điều kiện'}, {value:'lost', label:'Thất bại'}]} />
          <Input label="Ghi chú" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
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
