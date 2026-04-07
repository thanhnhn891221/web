'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Search, Filter, Eye, Edit, Trash2,
  Calendar, User, Target, BarChart3, Clock,
  ArrowUpRight, Download, MoreHorizontal, FlaskConical,
  CheckCircle2, AlertCircle, Activity, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function RMSPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

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
  const [formData, setFormData] = useState({ name: '', lead: '', phase: 'concept', teamSize: '1', budget: '0', deadline: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingProject) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật dự án',
        message: `Xác nhận lưu thay đổi cho dự án ${editingProject.name}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
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
  const confirmDelete = (p: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa dự án',
      message: `Bạn có chắc chắn muốn xóa dự án ${p.name}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(p.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (p: any) => {
    setEditingProject(p);
    setFormData({
      name: p.name,
      lead: p.lead || '',
      phase: p.phase || 'concept',
      teamSize: (p.teamSize || 1).toString(),
      budget: (p.budget || 0).toString(),
      deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215, 80%, 50%, 0.12)' }}>
            <FlaskConical size={22} style={{ color: 'hsl(215, 80%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RMS — Quản lý R&D</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nghiên cứu dự án, cải tiến sản phẩm & sáng tạo</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => {
          setEditingProject(null);
          setFormData({ name: '', lead: '', phase: 'concept', teamSize: '1', budget: '0', deadline: '' });
          setIsModalOpen(true);
        }}>
          Tạo dự án
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Dự án R&D" value={projects.length} icon={FlaskConical} color="var(--primary-500)" />
        <StatCard title="Đang nghiên cứu" value={projects.filter(p => p.phase === 'research').length} icon={Activity} color="var(--accent-500)" />
        <StatCard title="Ngân sách R&D" value="2.4B" icon={BarChart3} color="var(--emerald)" />
        <StatCard title="Deadline sắp tới" value="3" icon={Clock} color="var(--rose)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
           <Card key={p.id} hover padding="lg" className="group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[var(--primary-500)] uppercase">{p.code}</p>
                  <h3 className="font-bold text-sm mt-1 line-clamp-1">{p.name}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant="info">{p.phase}</Badge>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => confirmDelete(p)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><User size={12}/> Chủ trì: {p.lead}</div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><Calendar size={12}/> {p.deadline ? new Date(p.deadline).toLocaleDateString('vi-VN') : 'Không hạn'}</div>
              </div>
              <div className="mt-4">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5"><span>Tiến độ</span><span>{p.progress || 0}%</span></div>
                 <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${p.progress || 0}%` }} />
                 </div>
              </div>
           </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? "Chỉnh sửa dự án" : "Tạo dự án R&D mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingProject ? Save : Plus}>{editingProject ? 'Cập nhật' : 'Lưu dự án'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên dự án" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cải tiến công thức sợi..." />
          <Input label="Người phụ trách" value={formData.lead} onChange={e => setFormData({...formData, lead: e.target.value})} placeholder="Nguyễn Văn A" />
          <div className="grid grid-cols-2 gap-4">
             <Select label="Giai đoạn" value={formData.phase} onChange={e => setFormData({...formData, phase: e.target.value})} 
               options={[{value:'concept', label:'Ý tưởng'}, {value:'research', label:'Nghiên cứu'}, {value:'prototype', label:'Mẫu thử'}, {value:'testing', label:'Thử nghiệm'}, {value:'completed', label:'Hoàn tất'}]} />
             <Input label="Team size" type="number" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} />
          </div>
          <Input label="Ngân sách (VNĐ)" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
          <Input label="Hạn định" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
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
