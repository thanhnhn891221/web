'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Plus, Search, Filter, Eye, Edit, Trash2,
  AlertTriangle, CheckCircle2, Info, Clock, Lock,
  FileText, Scale, MoreHorizontal, Activity, BarChart3, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function CMSPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any | null>(null);

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
  const [formData, setFormData] = useState({ title: '', description: '', category: 'operational', impact: 'medium', likelihood: 'medium', status: 'identified', owner: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/risks');
      const json = await res.json();
      if (json.success) setRisks(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingRisk) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật rủi ro',
        message: `Xác nhận lưu thay đổi cho rủi ro ${editingRisk.code}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingRisk ? `/api/risks/${editingRisk.id}` : '/api/risks';
      const method = editingRisk ? 'PUT' : 'POST';
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
  const confirmDelete = (r: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa rủi ro',
      message: `Báo cáo rủi ro ${r.code} sẽ được ẩn khỏi hệ thống (Soft Delete). Xác nhận xóa?`,
      type: 'danger',
      onConfirm: () => executeDelete(r.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/risks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (r: any) => {
    setEditingRisk(r);
    setFormData({
      title: r.title,
      description: r.description || '',
      category: r.category || 'operational',
      impact: r.impact || 'medium',
      likelihood: r.likelihood || 'medium',
      status: r.status || 'identified',
      owner: r.owner || ''
    });
    setIsModalOpen(true);
  };

  const getImpactColor = (impact: string) => {
     if (impact === 'high' || impact === 'extreme') return 'var(--rose)';
     if (impact === 'medium') return 'var(--amber)';
     return 'var(--emerald)';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(14, 90%, 55%, 0.12)' }}>
            <Scale size={22} style={{ color: 'hsl(14, 90%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CMS — Quản trị Rủi ro & Tuân thủ</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Đánh giá rủi ro, chính sách & kiểm soát nội bộ</p>
          </div>
        </div>
        <Button icon={ShieldAlert} onClick={() => {
           setEditingRisk(null);
           setFormData({ title: '', description: '', category: 'operational', impact: 'medium', likelihood: 'medium', status: 'identified', owner: '' });
           setIsModalOpen(true);
        }}>Báo cáo rủi ro</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Tổng rủi ro" value={risks.length} icon={AlertTriangle} color="var(--rose)" />
        <StatCard title="Tỉ lệ tuân thủ" value="98.5%" icon={ShieldCheck} color="var(--emerald)" />
        <StatCard title="Đang xử lý" value={risks.filter(r => r.status === 'monitoring').length} icon={Activity} color="var(--amber)" />
        <StatCard title="Báo cáo" value="12" icon={FileText} color="var(--primary-500)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
         {risks.map(risk => (
           <Card key={risk.id} hover padding="md" className="group">
              <div className="flex items-start justify-between">
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <Badge variant="custom" bg="var(--slate-100)" color="var(--text-muted)" size="sm">{risk.code}</Badge>
                       <Badge variant="custom" bg={`${getImpactColor(risk.impact)}15`} color={getImpactColor(risk.impact)} size="sm">Impact: {risk.impact}</Badge>
                    </div>
                    <h3 className="font-bold text-sm mt-3 line-clamp-1">{risk.title}</h3>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <Badge variant={risk.status === 'identified' ? 'info' : 'success'}>{risk.status}</Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => openEdit(risk)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                         <Edit size={14} />
                       </button>
                       <button onClick={() => confirmDelete(risk)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                         <Trash2 size={14} />
                       </button>
                    </div>
                 </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 leading-relaxed">{risk.description || 'Chưa có mô tả chi tiết cho bản ghi rủi ro này...'}</p>
              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                 <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{risk.category}</div>
                 <div className="text-[11px] text-slate-400 font-medium">{risk.owner || 'Chưa phân quyền'}</div>
              </div>
           </Card>
         ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRisk ? "Cập nhật rủi ro" : "Báo cáo rủi ro / Sự cố mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingRisk ? Save : ShieldAlert}>{editingRisk ? 'Cập nhật' : 'Gửi báo cáo'}</Button></ warm-rose-50>}>
        <div className="space-y-4">
           <Input label="Tiêu đề rủi ro" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Phát hiện sai sót trong..." />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Danh mục" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} 
                options={[{value:'operational', label:'Vận hành'}, {value:'financial', label:'Tài chính'}, {value:'strategic', label:'Chiến lược'}, {value:'compliance', label:'Tuân thủ'}]} />
              <Select label="Mức độ (Impact)" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} 
                options={[{value:'low', label:'Thấp'}, {value:'medium', label:'Trung bình'}, {value:'high', label:'Cao'}, {value:'extreme', label:'Nghiêm trọng'}]} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Select label="Xác suất (Likelihood)" value={formData.likelihood} onChange={e => setFormData({...formData, likelihood: e.target.value})} 
                options={[{value:'rare', label:'Hiếm khi'}, {value:'possible', label:'Có thể'}, {value:'likely', label:'Thường xuyên'}]} />
              <Select label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} 
                options={[{value:'identified', label:'Mới ghi nhận'}, {value:'monitoring', label:'Đang theo dõi'}, {value:'mitigated', label:'Đã giảm thiểu'}, {value:'closed', label:'Đã xử lý'}]} />
           </div>
           <Input label="Người chịu trách nhiệm" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} />
           <Input label="Mô tả chi tiết" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
