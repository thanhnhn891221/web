'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Shield, Bell, Globe, Database,
  Lock, Key, Mail, Cpu, HardDrive, RefreshCw,
  Clock, Activity, Plus, Trash2, Users, Network,
  Check, X
} from 'lucide-react';
import { Button, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function COREPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'rbac'>('rbac');
  
  // Settings State
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // RBAC State
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, any>>({});
  const [isLoadingRBAC, setIsLoadingRBAC] = useState(true);

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
  }, []);

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
    try {
      const res = await fetch('/api/core/roles');
      const json = await res.json();
      if (json.success) {
        setRolesData(json.data.roles);
        setAllModules(json.data.allModules);
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
      [moduleId]: {
         ...prev[moduleId],
         [field]: !prev[moduleId][field]
      }
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
          fetchRBAC();
       } else {
          alert('Lỗi lưu phân quyền. Vui lòng thử lại.');
       }
     } catch (err) { console.error(err); }
     finally { setIsSaving(false); }
  };

  const executeUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/core/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value })
      });
      if (res.ok) { setConfirmConfig(prev => ({ ...prev, isOpen: false })); fetchSettings(); }
    } catch (err) { console.error(err); }
  };

  const groups = ['general', 'security', 'mail', 'system'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-100/50">
             {activeTab === 'settings' ? <Settings size={22} className="text-primary-600" /> : <Shield size={22} className="text-primary-600" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CORE — Quản trị Nhập liệu & Quyền</h1>
            <p className="text-sm text-slate-500">Cấu hình hệ thống và Quản lý truy cập RBAC</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant={activeTab === 'rbac' ? 'primary' : 'outline'} icon={Users} onClick={() => setActiveTab('rbac')}>Phân Quyền (RBAC)</Button>
           <Button variant={activeTab === 'settings' ? 'primary' : 'outline'} icon={Settings} onClick={() => setActiveTab('settings')}>Cấu Hình Nền (Settings)</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Tổng số Roles" value={rolesData.length} icon={Users} color="var(--primary-500)" />
        <StatCard title="Tổng Modules" value={allModules.length} icon={Network} color="var(--emerald)" />
        <StatCard title="Uptime" value="14d 2h" icon={Clock} color="var(--sky-500)" />
        <StatCard title="Dung lượng Log" value="15%" icon={HardDrive} color="var(--slate-500)" />
      </div>

      {activeTab === 'rbac' ? (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
            {/* Roles Sidebar */}
            <div className="xl:col-span-1 space-y-4">
               <div className="font-bold text-sm text-slate-700 flex items-center justify-between">
                  Danh sách Vai trò (Roles)
                  <Button size="sm" variant="ghost" icon={Plus} className="h-7 w-7 p-0" />
               </div>
               <div className="flex flex-col gap-2">
                  {isLoadingRBAC ? <div className="animate-pulse space-y-2"><div className="h-12 bg-slate-100 rounded-lg"></div></div> : 
                    rolesData.map(r => (
                       <div key={r.id} onClick={() => handleSelectRole(r)} 
                         className={`p-3 rounded-lg border cursor-pointer hover:border-primary-500 transition-all ${selectedRoleId === r.id ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 font-medium'}`}>
                          {r.name}
                          <div className="text-[10px] font-normal opacity-70 font-mono mt-1">CODE: {r.code}</div>
                       </div>
                    ))
                  }
               </div>
            </div>

            {/* Permissions Matrix */}
            <div className="xl:col-span-3">
               <Card padding="none" className="overflow-hidden shadow-premium">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h3 className="font-bold flex items-center gap-2">Ma trận Phân quyền Mô-đun</h3>
                     <Button size="sm" icon={Save} onClick={saveRBAC} disabled={isSaving || !selectedRoleId}>
                        {isSaving ? 'Đang lưu...' : 'Lưu Quyền Chân Rết'}
                     </Button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                           <tr>
                              <th className="px-6 py-4">Tên Phân Hệ (Module)</th>
                              <th className="px-6 py-4 text-center">Truy cập (View)</th>
                              <th className="px-6 py-4 text-center">Tạo mới (Create)</th>
                              <th className="px-6 py-4 text-center">Chỉnh sửa (Edit)</th>
                              <th className="px-6 py-4 text-center">Xóa (Delete)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {allModules.map(mod => {
                               const p = permissionsMap[mod.id] || {};
                               return (
                                 <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-semibold text-slate-700 flex flex-col">
                                       <span className="flex items-center gap-2">
                                         {mod.code === 'GMS' ? <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span> : null}
                                         {mod.name} 
                                       </span>
                                       <span className="text-[10px] text-slate-400 font-mono">[{mod.code}]</span>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                       <ToggleSwitch checked={p.canView} onChange={() => togglePermission(mod.id, 'canView')} color="bg-emerald-500" />
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                       <ToggleSwitch checked={p.canCreate} onChange={() => togglePermission(mod.id, 'canCreate')} color="bg-blue-500" />
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                       <ToggleSwitch checked={p.canEdit} onChange={() => togglePermission(mod.id, 'canEdit')} color="bg-amber-500" />
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                       <ToggleSwitch checked={p.canDelete} onChange={() => togglePermission(mod.id, 'canDelete')} color="bg-rose-500" />
                                    </td>
                                 </tr>
                               )
                           })}
                        </tbody>
                     </table>
                  </div>
               </Card>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
            <div className="xl:col-span-2 space-y-6">
               {groups.map(group => (
                  <Card key={group} padding="md" className="group shadow-premium">
                     <h3 className="font-bold text-sm capitalize mb-4 flex items-center gap-2 text-slate-700">
                        {group === 'security' ? <Shield size={16} className="text-blue-500" /> : <Settings size={16} />}
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
         </div>
      )}

      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type} />
    </div>
  );
}

// Custom Toggle Component just for this matrix
function ToggleSwitch({ checked, onChange, color }: { checked: boolean, onChange: () => void, color: string }) {
   return (
      <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? color : 'bg-slate-200'}`}>
         <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'}`}></span>
      </button>
   )
}
