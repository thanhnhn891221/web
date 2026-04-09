'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Shield, Globe, Database,
  Lock, Key, Mail, Cpu, HardDrive, RefreshCw,
  Clock, Activity, Plus, Trash2, Users, Network,
  FileText, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function KMSPage() {
  const [activeTab, setActiveTab] = useState<'rbac' | 'logs' | 'settings'>('rbac');
  
  // Settings State
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // RBAC State
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, any>>({});
  const [isLoadingRBAC, setIsLoadingRBAC] = useState(true);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ code: '', name: '' });
  const [isAddingRole, setIsAddingRole] = useState(false);

  // Audit Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);

  // General State
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ key: '', value: '', group: 'general', type: 'string' });
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; type: 'danger' | 'success' | 'warning' | 'info';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => {} });

  useEffect(() => {
    fetchSettings();
    fetchRBAC();
    fetchLogs(1);
  }, []);

  // ─── Fetch Functions ─────────────────────────────────────
  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/core/settings');
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoadingSettings(false); }
  };

  const fetchRBAC = async () => {
    setIsLoadingRBAC(true);
    
    // Check cache first
    const cachedData = sessionStorage.getItem('aio_kms_rbac_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setRolesData(parsed.roles);
        setAllModules(parsed.allModules);
        if (parsed.roles.length > 0 && !selectedRoleId) {
           handleSelectRole(parsed.roles[0], parsed.allModules);
        }
        setIsLoadingRBAC(false); // UI can render immediately
      } catch (e) {
        // Cache invalid
      }
    }

    try {
      const res = await fetch('/api/core/roles');
      const json = await res.json();
      if (json.success) {
        // Update state and cache
        setRolesData(json.data.roles);
        setAllModules(json.data.allModules);
        sessionStorage.setItem('aio_kms_rbac_cache', JSON.stringify(json.data));
        
        if (json.data.roles.length > 0 && !selectedRoleId) {
           handleSelectRole(json.data.roles[0], json.data.allModules);
        } else if (selectedRoleId) {
           const reselected = json.data.roles.find((r:any) => r.id === selectedRoleId);
           if (reselected) handleSelectRole(reselected, json.data.allModules);
        }
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingRBAC(false); }
  };

  const fetchLogs = async (page: number) => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/core/logs?page=${page}&limit=30`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setLogsTotal(json.total);
        setLogsPage(page);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingLogs(false); }
  };

  // ─── RBAC Handlers ───────────────────────────────────────
  const handleSelectRole = (role: any, modulesList: any[] = allModules) => {
    setSelectedRoleId(role.id);
    const map: Record<string, any> = {};
    modulesList.forEach(m => {
       const existingPerm = role.permissions?.find((p:any) => p.moduleId === m.id);
       map[m.id] = existingPerm ? { ...existingPerm } : { moduleId: m.id, canView: false, canCreate: false, canEdit: false, canDelete: false };
    });
    setPermissionsMap(map);
  };

  const togglePermission = (moduleId: string, field: 'canView'|'canCreate'|'canEdit'|'canDelete') => {
    setPermissionsMap(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [field]: !prev[moduleId][field] }
    }));
  };

  const saveRBAC = async () => {
     if (!selectedRoleId) return;
     setIsSaving(true);
     try {
       const permsArray = Object.values(permissionsMap);
       const res = await fetch('/api/core/roles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId: selectedRoleId, permissions: permsArray })
       });
       if (res.ok) {
          alert('Đã lưu thành công phân quyền!');
          sessionStorage.removeItem('aio_kms_rbac_cache');
          fetchRBAC();
       } else {
          alert('Lỗi lưu phân quyền. Vui lòng thử lại.');
       }
     } catch (err) { console.error(err); }
     finally { setIsSaving(false); }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingRole(true);
    try {
       const res = await fetch('/api/core/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoleForm)
       });
       if (res.ok) {
          setIsAddRoleModalOpen(false);
          setNewRoleForm({ code: '', name: '' });
          sessionStorage.removeItem('aio_kms_rbac_cache');
          fetchRBAC();
       } else {
          const js = await res.json();
          alert(js.error || 'Lỗi tạo vai trò');
       }
    } catch { alert('Lỗi mạng, thử lại sau'); }
    finally { setIsAddingRole(false); }
  };

  // ─── Settings Handlers ───────────────────────────────────
  const executeUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/core/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value })
      });
      if (res.ok) { setConfirmConfig(prev => ({ ...prev, isOpen: false })); fetchSettings(); }
    } catch (err) { console.error(err); }
  };

  const handleAddSetting = async () => {
    try {
      const res = await fetch('/api/core/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addForm)
      });
      if (res.ok) { setIsAddModalOpen(false); fetchSettings(); }
    } catch (err) { console.error(err); }
  };

  const groups = ['general', 'security', 'mail', 'system'];
  const totalLogPages = Math.ceil(logsTotal / 30);

  // ─── Action Label Helper ─────────────────────────────────
  const actionColor = (action: string) => {
    if (action === 'login') return 'bg-emerald-100 text-emerald-700';
    if (action === 'logout') return 'bg-slate-100 text-slate-600';
    if (action === 'create') return 'bg-blue-100 text-blue-700';
    if (action === 'update') return 'bg-amber-100 text-amber-700';
    if (action === 'delete') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-100/50">
             <Shield size={22} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">KMS — Kernel Management System</h1>
            <p className="text-sm text-slate-500">Phân quyền RBAC, Nhật ký Hệ thống & Cấu hình</p>
          </div>
        </div>
        {/* Tab Buttons */}
        <div className="flex gap-1.5 p-1 bg-[var(--primary-900)] rounded-xl">
           <button onClick={() => setActiveTab('rbac')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'rbac' ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-600)]/10 hover:text-[var(--text-primary)]'}`}>
             <Users size={14} /> Phân Quyền
           </button>
           <button onClick={() => { setActiveTab('logs'); if (logs.length === 0) fetchLogs(1); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-600)]/10 hover:text-[var(--text-primary)]'}`}>
             <FileText size={14} /> Nhật ký (Log)
           </button>
           <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-600)]/10 hover:text-[var(--text-primary)]'}`}>
             <Settings size={14} /> Cấu Hình
           </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Tổng Roles" value={rolesData.length} icon={Users} color="var(--primary-500)" />
        <StatCard title="Tổng Modules" value={allModules.length} icon={Network} color="var(--emerald)" />
        <StatCard title="Log hôm nay" value={logsTotal} icon={FileText} color="var(--accent-500)" />
        <StatCard title="Uptime" value="14d 2h" icon={Clock} color="var(--slate-500)" />
      </div>

      {/* ═══════════════ TAB: RBAC ═══════════════ */}
      {activeTab === 'rbac' && (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
            {/* Roles Sidebar */}
            <div className="xl:col-span-1 space-y-3">
               <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-slate-500 uppercase tracking-widest">Danh sách Vai trò</p>
                  <Button size="sm" icon={Plus} onClick={() => setIsAddRoleModalOpen(true)}>Tạo mới</Button>
               </div>
               <div className="flex flex-col gap-2">
                  {isLoadingRBAC ? <div className="animate-pulse space-y-2"><div className="h-12 bg-slate-100 rounded-lg"></div><div className="h-12 bg-slate-100 rounded-lg"></div></div> : 
                    rolesData.map(r => (
                       <div key={r.id} onClick={() => handleSelectRole(r)} 
                         className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedRoleId === r.id ? 'bg-primary-50 border-primary-400 text-primary-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 font-medium hover:border-primary-300'}`}>
                          <span className="text-sm">{r.name}</span>
                          <div className="text-[10px] font-normal opacity-60 font-mono mt-0.5">CODE: {r.code}</div>
                       </div>
                    ))
                  }
               </div>
            </div>

            {/* Permission Matrix */}
            <div className="xl:col-span-3">
               <Card padding="none" className="overflow-hidden shadow-premium">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h3 className="font-bold text-sm flex items-center gap-2"><Shield size={16} className="text-primary-500" /> Ma trận Phân quyền Module</h3>
                     <Button size="sm" icon={Save} onClick={saveRBAC} disabled={isSaving || !selectedRoleId}>
                        {isSaving ? 'Đang lưu...' : 'Lưu Phân Quyền'}
                     </Button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                           <tr>
                              <th className="px-5 py-3">Phân Hệ</th>
                              <th className="px-4 py-3 text-center">Xem</th>
                              <th className="px-4 py-3 text-center">Tạo</th>
                              <th className="px-4 py-3 text-center">Sửa</th>
                              <th className="px-4 py-3 text-center">Xóa</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {allModules.map(mod => {
                               const p = permissionsMap[mod.id] || {};
                               return (
                                 <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                       <span className="font-semibold text-slate-700 text-sm">{mod.name}</span>
                                       <span className="text-[10px] text-slate-400 font-mono ml-2">[{mod.code}]</span>
                                    </td>
                                    <td className="px-4 py-3 text-center"><ToggleSwitch checked={p.canView} onChange={() => togglePermission(mod.id, 'canView')} color="bg-emerald-500" /></td>
                                    <td className="px-4 py-3 text-center"><ToggleSwitch checked={p.canCreate} onChange={() => togglePermission(mod.id, 'canCreate')} color="bg-blue-500" /></td>
                                    <td className="px-4 py-3 text-center"><ToggleSwitch checked={p.canEdit} onChange={() => togglePermission(mod.id, 'canEdit')} color="bg-amber-500" /></td>
                                    <td className="px-4 py-3 text-center"><ToggleSwitch checked={p.canDelete} onChange={() => togglePermission(mod.id, 'canDelete')} color="bg-rose-500" /></td>
                                 </tr>
                               )
                           })}
                        </tbody>
                     </table>
                  </div>
               </Card>
            </div>
         </div>
      )}

      {/* ═══════════════ TAB: AUDIT LOGS ═══════════════ */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <Card padding="none" className="overflow-hidden shadow-premium">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm flex items-center gap-2"><Activity size={16} className="text-primary-500" /> Nhật ký Hoạt động Hệ thống</h3>
              <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => fetchLogs(logsPage)}>Làm mới</Button>
            </div>
            {isLoadingLogs ? (
              <div className="p-10 flex flex-col items-center gap-3">
                <RefreshCw className="animate-spin text-slate-300" size={28} />
                <p className="text-xs text-slate-400 font-medium">Đang tải nhật ký...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">Thời gian</th>
                        <th className="px-5 py-3 text-left">Người dùng</th>
                        <th className="px-5 py-3 text-left">Module</th>
                        <th className="px-5 py-3 text-left">Hành động</th>
                        <th className="px-5 py-3 text-left">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[10px]">
                                {log.user?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700">{log.user?.name || 'Hệ thống'}</p>
                                <p className="text-[10px] text-slate-400">{log.user?.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{log.module}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${actionColor(log.action)}`}>{log.action}</span>
                          </td>
                          <td className="px-5 py-3 max-w-[300px]">
                            <p className="text-xs text-slate-600 truncate" title={log.details}>{log.details || log.target || '—'}</p>
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                            <FileText size={32} className="mx-auto mb-3 text-slate-200" />
                            <p className="text-sm font-medium">Chưa có nhật ký hoạt động nào.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalLogPages > 1 && (
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Trang {logsPage} / {totalLogPages} — Tổng {logsTotal} bản ghi</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" icon={ChevronLeft} disabled={logsPage <= 1} onClick={() => fetchLogs(logsPage - 1)} />
                      <Button size="sm" variant="ghost" icon={ChevronRight} disabled={logsPage >= totalLogPages} onClick={() => fetchLogs(logsPage + 1)} />
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* ═══════════════ TAB: SETTINGS ═══════════════ */}
      {activeTab === 'settings' && (
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
            <div className="xl:col-span-2 space-y-6">
               <div className="flex justify-end">
                 <Button icon={Plus} variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>Thêm khóa cấu hình</Button>
               </div>
               {groups.map(group => (
                  <Card key={group} padding="md" className="shadow-premium">
                     <h3 className="font-bold text-sm capitalize mb-4 flex items-center gap-2 text-slate-700">
                        {group === 'security' ? <Shield size={16} className="text-blue-500" /> : group === 'mail' ? <Mail size={16} className="text-amber-500" /> : <Settings size={16} className="text-slate-400" />}
                        {group} settings
                     </h3>
                     <div className="space-y-1">
                        {settings.filter(s => s.group === group).map(s => (
                           <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-none group/item">
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
                                 <Button size="sm" variant="ghost" icon={Save} onClick={() => {
                                      setConfirmConfig({ isOpen: true, title: 'Cập nhật', message: `Lưu ${s.key}?`, type: 'warning', onConfirm: () => executeUpdateSetting(s.key, s.value) })
                                 }} />
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
                 </div>
              </Card>
              <Card padding="lg" className="bg-primary-600 text-white border-none shadow-lg">
                 <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Database size={16}/> Hệ quản trị CSDL</h3>
                 <p className="text-[11px] opacity-80 mb-4 font-medium leading-relaxed">Backup tự động hàng đêm lúc 02:00 AM. Dữ liệu luôn an toàn.</p>
                 <Button className="w-full bg-white/20 hover:bg-white/30 border-none text-white text-xs" icon={RefreshCw}>Force Backup</Button>
              </Card>
            </div>
         </div>
      )}

      {/* Create Role Modal */}
      <Modal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} title="Tạo Vai trò mới" size="sm">
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
             <label className="text-xs font-bold text-slate-500">Mã Vai Trò (Code)</label>
             <Input value={newRoleForm.code} onChange={e => setNewRoleForm({...newRoleForm, code: e.target.value.toUpperCase()})} placeholder="Vd: MANAGER_HR" required />
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500">Tên Hiển Thị (Name)</label>
             <Input value={newRoleForm.name} onChange={e => setNewRoleForm({...newRoleForm, name: e.target.value})} placeholder="Vd: Quản lý Nhân sự" required />
          </div>
          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={isAddingRole}>{isAddingRole ? 'Đang tạo...' : 'Lưu Vai trò'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Setting Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm cấu hình hệ thống mới"
        footer={<><Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</Button><Button onClick={handleAddSetting}>Lưu khóa mới</Button></>}>
        <div className="space-y-4">
           <Input label="Khóa cấu hình (KEY)" value={addForm.key} onChange={e => setAddForm({...addForm, key: e.target.value})} placeholder="SYSTEM_NAME..." />
           <Input label="Giá trị mặc định" value={addForm.value} onChange={e => setAddForm({...addForm, value: e.target.value})} />
           <div className="grid grid-cols-2 gap-4">
              <Select label="Nhóm" value={addForm.group} onChange={e => setAddForm({...addForm, group: e.target.value})} 
                options={[{value:'general', label:'Chung'}, {value:'security', label:'Bảo mật'}, {value:'mail', label:'Email'}, {value:'system', label:'Hệ thống'}]} />
              <Select label="Kiểu" value={addForm.type} onChange={e => setAddForm({...addForm, type: e.target.value})} 
                options={[{value:'string', label:'Chuỗi'}, {value:'number', label:'Số'}, {value:'boolean', label:'Luận lý'}]} />
           </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type} />
    </div>
  );
}

// ─── Toggle Component ──────────────────────────────────────
function ToggleSwitch({ checked, onChange, color }: { checked: boolean, onChange: () => void, color: string }) {
   return (
      <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? color : 'bg-slate-200'}`}>
         <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></span>
      </button>
   );
}
