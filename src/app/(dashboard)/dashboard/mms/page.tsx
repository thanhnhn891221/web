'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Search, Filter, Eye, Edit, Trash2,
  TrendingUp, Users, DollarSign, Target, BarChart3,
  Calendar, Layers, MoreHorizontal, MousePointer2,
  CheckCircle2, AlertCircle, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function MMSPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

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
  const [formData, setFormData] = useState({ name: '', channel: 'Facebook', budget: '0', spent: '0', status: 'planned', period: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const json = await res.json();
      if (json.success) setCampaigns(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingCampaign) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật chiến dịch',
        message: `Xác nhận lưu thay đổi cho chiến dịch ${editingCampaign.name}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingCampaign ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';
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
  const confirmDelete = (campaign: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa chiến dịch',
      message: `Bạn có chắc chắn muốn xóa chiến dịch ${campaign.name}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(campaign.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      channel: campaign.channel || 'Facebook',
      budget: campaign.budget.toString(),
      spent: campaign.spent.toString(),
      status: campaign.status,
      period: campaign.period || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(330, 80%, 60%, 0.12)' }}>
            <Megaphone size={22} style={{ color: 'hsl(330, 80%, 60%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MMS — Marketing Management</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chiến dịch, ngân sách & hiệu quả Lead Funnel</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => {
          setEditingCampaign(null);
          setFormData({ name: '', channel: 'Facebook', budget: '0', spent: '0', status: 'planned', period: '' });
          setIsModalOpen(true);
        }}>
          Tạo chiến dịch
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Chiến dịch" value={campaigns.length} icon={Target} color="var(--primary-500)" />
        <StatCard title="Leads Hôm nay" value="156" icon={Users} color="var(--accent-500)" />
        <StatCard title="Ngân sách còn" value="450M" icon={DollarSign} color="var(--emerald)" />
        <StatCard title="ROAS" value="4.2x" icon={TrendingUp} color="var(--rose)" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm chiến dịch..." className="w-full pl-10 pr-4 py-2 border rounded-lg bg-[var(--primary-950)] border-[var(--primary-800)] text-white focus:ring-2 focus:ring-[var(--primary-500)] outline-none transition-all placeholder:text-white/40" />
        </div>
        <div className="sm:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-[var(--primary-950)] border-[var(--primary-800)] text-white focus:ring-2 focus:ring-[var(--primary-500)] outline-none transition-all">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang chạy</option>
            <option value="planned">Lên kế hoạch</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map(c => (
           <Card key={c.id} hover padding="lg" className="cursor-pointer" onClick={() => openEdit(c)}>
              <div className="flex items-start justify-between">
                <div>
                   <h3 className="font-bold text-base">{c.name}</h3>
                   <p className="text-xs text-[var(--text-muted)] mt-1">{c.channel} · {c.period || 'Mọi lúc'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant={c.status === 'active' ? 'success' : 'info'}>{c.status}</Badge>
                   <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); confirmDelete(c); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Ngân sách</p>
                    <p className="text-sm font-bold">{(c.budget / 1e6).toFixed(1)}M</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Chi phí</p>
                    <p className="text-sm font-bold text-[var(--rose)]">{(c.spent / 1e6).toFixed(1)}M</p>
                 </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t">
                 <div className="flex items-center gap-1.5"><Users size={12} className="text-[var(--primary-500)]"/><span className="text-xs font-semibold">{c.leads || 0} Leads</span></div>
                 <div className="flex items-center gap-1.5"><MousePointer2 size={12} className="text-[var(--emerald)]"/><span className="text-xs font-semibold">{c.conversions || 0} Sales</span></div>
              </div>
           </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch Marketing mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingCampaign ? Save : Plus}>{editingCampaign ? 'Cập nhật' : 'Lưu chiến dịch'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên chiến dịch" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Chiến dịch Tết 2026..." />
          <Select label="Kênh quảng cáo" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})} 
            options={[{value:'Facebook', label:'Facebook'}, {value:'Google', label:'Google Ads'}, {value:'TikTok', label:'TikTok'}, {value:'Offline', label:'Offline'}]} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Ngân sách (VNĐ)" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
             <Input label="Đã chi (VNĐ)" type="number" value={formData.spent} onChange={e => setFormData({...formData, spent: e.target.value})} />
          </div>
          <Select label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} 
            options={[{value:'planned', label:'Lên kế hoạch'}, {value:'active', label:'Đang chạy'}, {value:'completed', label:'Hoàn thành'}]} />
          <Input label="Giai đoạn (Từ - Đến)" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} placeholder="01/01 - 31/01/2026" />
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
