'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Shield, Bell, Globe, Database,
  Lock, Key, Mail, Cpu, HardDrive, RefreshCw,
  LayoutDashboard, CheckCircle2, AlertCircle, Clock,
  MoreHorizontal, Terminal, Activity, Plus, Trash2, Edit
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function COREPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
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

  // Add Form state
  const [addForm, setAddForm] = useState({ key: '', value: '', group: 'general', type: 'string' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/core/settings');
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler (Confirm Update)
  const handleConfirmUpdate = (key: string, value: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Cập nhật cấu hình',
      message: `Xác nhận lưu giá trị mới cho ${key}?`,
      type: 'warning',
      onConfirm: () => executeUpdate(key, value)
    });
  };

  const executeUpdate = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/core/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  // ADD Handler
  const handleAdd = async () => {
    try {
      const res = await fetch('/api/core/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handler
  const confirmDelete = (key: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa cấu hình',
      message: `Xác nhận xóa khóa cấu hình ${key}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(key)
    });
  };

  const executeDelete = async (key: string) => {
    try {
      const res = await fetch(`/api/core/settings?key=${key}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const notifyAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Phát thông báo hệ thống',
      message: 'Bạn có chắc chắn muốn gửi thông báo khẩn đến TOÀN BỘ người dùng đang trực tuyến?',
      type: 'danger',
      onConfirm: () => {
         alert('Đã phát lệnh thông báo hệ thống!');
         setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const groups = ['general', 'security', 'mail', 'system'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(215, 80%, 50%, 0.12)' }}>
            <Settings size={22} style={{ color: 'hsl(215, 80%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CORE — Quản trị Hệ thống</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cấu hình, bảo mật & trung tâm điều khiển</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button icon={Plus} variant="outline" onClick={() => setIsAddModalOpen(true)}>Thêm khóa mới</Button>
           <Button variant="danger" icon={Bell} onClick={notifyAll}>Thông báo khẩn</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Uptime" value="14d 2h" icon={Clock} color="var(--primary-500)" />
        <StatCard title="Memory" value="2.4 / 8 GB" icon={Cpu} color="var(--accent-500)" />
        <StatCard title="Disk Usage" value="15%" icon={HardDrive} color="var(--emerald)" />
        <StatCard title="API Req/s" value="45" icon={Activity} color="var(--amber)" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="xl:col-span-2 space-y-6">
            {groups.map(group => (
               <Card key={group} padding="md" className="group shadow-premium">
                  <h3 className="font-bold text-sm capitalize mb-4 flex items-center gap-2 text-slate-700">
                     {group === 'security' ? <Shield size={16} className="text-blue-500" /> : group === 'mail' ? <Mail size={16} className="text-amber-500" /> : <Globe size={16} className="text-emerald-500" />}
                     {group} settings
                  </h3>
                  <div className="space-y-1">
                     {settings.filter(s => s.group === group).map(s => (
                        <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-none group/item">
                           <div className="min-w-[140px]">
                              <p className="font-bold text-[13px] text-slate-700">{s.key}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Type: {s.type}</p>
                           </div>
                           <div className="flex items-center gap-2 flex-1 max-w-md">
                              <Input 
                                 className="h-9 text-sm"
                                 value={s.value} 
                                 onChange={e => {
                                    const newS = [...settings];
                                    const idx = newS.findIndex(item => item.id === s.id);
                                    newS[idx].value = e.target.value;
                                    setSettings(newS);
                                 }}
                                 placeholder="Nhập giá trị..."
                              />
                              <div className="flex opacity-0 group-hover/item:opacity-100 transition-opacity">
                                 <Button size="sm" variant="ghost" icon={Save} onClick={() => handleConfirmUpdate(s.key, s.value)} />
                                 <Button size="sm" variant="ghost" icon={Trash2} onClick={() => confirmDelete(s.key)} className="text-rose-400 hover:text-rose-600" />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            ))}
         </div>

         <div className="space-y-6">
            <Card padding="lg" className="bg-slate-50/50">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Lock size={16} className="text-slate-400"/> Bảo mật & Quyền hạn</h3>
               <div className="space-y-2">
                  <Button variant="outline" className="w-full text-left justify-start text-xs h-10" icon={Key}>Chính sách mật khẩu (PRM)</Button>
                  <Button variant="outline" className="w-full text-left justify-start text-xs h-10" icon={Shield}>Xác thực 2FA / MFA</Button>
                  <Button variant="outline" className="w-full text-left justify-start text-xs h-10" icon={Terminal}>Logs truy cập Terminal</Button>
               </div>
            </Card>
            <Card padding="lg" className="bg-blue-600 text-white border-none shadow-lg">
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Database size={16}/> Hệ quản trị CSDL</h3>
               <p className="text-[11px] opacity-80 mb-4 font-medium leading-relaxed">Backup tự động được thực hiện hàng đêm lúc 02:00 AM. Luôn duy trì bản cập nhật mới nhất.</p>
               <Button className="w-full bg-white/20 hover:bg-white/30 border-none text-white text-xs" icon={RefreshCw}>Force Backup Database</Button>
            </Card>
         </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm cấu hình hệ thống mới"
        footer={<><Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</Button><Button onClick={handleAdd}>Lưu khóa mới</Button></>}>
        <div className="space-y-4">
           <Input label="Khóa cấu hình (KEY)" value={addForm.key} onChange={e => setAddForm({...addForm, key: e.target.value})} placeholder="SYSTEM_NAME..." />
           <Input label="Giá trị mặc định" value={addForm.value} onChange={e => setAddForm({...addForm, value: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Nhóm cấu hình" value={addForm.group} onChange={e => setAddForm({...addForm, group: e.target.value})} 
                options={[{value:'general', label:'Chung'}, {value:'security', label:'Bảo mật'}, {value:'mail', label:'Email'}, {value:'system', label:'Hệ thống'}]} />
              <Select label="Kiểu dữ liệu" value={addForm.type} onChange={e => setAddForm({...addForm, type: e.target.value})} 
                options={[{value:'string', label:'Chuỗi'}, {value:'number', label:'Số'}, {value:'boolean', label:'Luận lý'}]} />
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
