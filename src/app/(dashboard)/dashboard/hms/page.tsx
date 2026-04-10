'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Building2, UserPlus, Search,
  Download, Eye, Edit, BadgeCheck, Trash2,
  Plus, Calendar, User, Mail, Phone, Hash,
  AlertTriangle, Save, Shield, LayoutGrid, LayoutList, Lock, Unlock, Key, Copy, XCircle, RefreshCw, X
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal, ViewToggle } from '@/components/ui';

interface EmployeeData {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  level: string;
  status: string;
  hireDate: string;
  sysRole: string;
}

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
  color: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' }> = {
  active: { label: 'Đang làm việc', variant: 'success' },
  probation: { label: 'Thử việc', variant: 'warning' },
  on_leave: { label: 'Nghỉ phép', variant: 'info' },
  resigned: { label: 'Đã nghỉ', variant: 'danger' },
};

const LEVEL_OPTIONS = [
  { value: 'intern', label: 'Thực tập sinh' },
  { value: 'junior', label: 'Nhân viên' },
  { value: 'senior', label: 'Chuyên viên' },
  { value: 'lead', label: 'Trưởng nhóm' },
  { value: 'manager', label: 'Trưởng phòng' },
  { value: 'director', label: 'Giám đốc' },
];

type Tab = 'overview' | 'employees' | 'departments';

export default function HMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [roles, setRoles] = useState<{code: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeData | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [accountEmp, setAccountEmp] = useState<EmployeeData | null>(null);

  // View & Filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('hms_view_mode') as 'grid' | 'list') || 'list';
    return 'list';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isDrilledDown, setIsDrilledDown] = useState(false);

  // Password Gen
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

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
  const [empForm, setEmpForm] = useState({
    name: '', email: '', phone: '', department: '', position: '', level: 'junior', status: 'active', hireDate: new Date().toISOString().split('T')[0], sysRole: '', password: ''
  });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', color: '#3B82F6' });

  // Persistence for View Mode
  useEffect(() => {
    localStorage.setItem('hms_view_mode', viewMode);
  }, [viewMode]);

  // Global Sync Listener
  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.module === 'hms') fetchData(true);
    };
    window.addEventListener('aio-sync-complete', handleSync);
    return () => window.removeEventListener('aio-sync-complete', handleSync);
  }, []);

  useEffect(() => {
    // Quick load from local cache if exists
    try {
      const cachedEmp = sessionStorage.getItem('hms_employees');
      const cachedDept = sessionStorage.getItem('hms_departments');
      const cachedRoles = sessionStorage.getItem('hms_roles');
      if (cachedEmp) setEmployees(JSON.parse(cachedEmp));
      if (cachedDept) setDepartments(JSON.parse(cachedDept));
      if (cachedRoles) setRoles(JSON.parse(cachedRoles));
    } catch { /* ignore cache errors */ }

    fetchData();
  }, []);

  const fetchData = async (isBackground = false) => {
    // Only show loading visually if we have no cached data yet AND it's not a background sync
    if (employees.length === 0 && !isBackground) setIsLoading(true);
    try {
      const [empRes, deptRes, roleRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
        fetch('/api/core/roles')
      ]);
      const empJson = await empRes.json();
      const deptJson = await deptRes.json();
      const roleJson = await roleRes.json();
      
      if (empJson.success) {
         setEmployees(empJson.data);
         sessionStorage.setItem('hms_employees', JSON.stringify(empJson.data));
      }
      if (deptJson.success) {
         setDepartments(deptJson.data);
         sessionStorage.setItem('hms_departments', JSON.stringify(deptJson.data));
      }
      if (roleJson.success) {
         setRoles(roleJson.data.roles);
         sessionStorage.setItem('hms_roles', JSON.stringify(roleJson.data.roles));
      }
    } catch (error) {
      console.error('Failed to load HMS data', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtering & Search
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const hDate = new Date(emp.hireDate);
      if (dateFrom && hDate < new Date(dateFrom)) matchesDate = false;
      if (dateTo && hDate > new Date(dateTo)) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDrillDown = (status: string) => {
    setStatusFilter(status);
    setActiveTab('employees');
    setIsDrilledDown(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setIsDrilledDown(false);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedPassword(pass);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple alert or toast could go here
  };

  const handleAccountAction = async (action: string, password?: string) => {
    if (!accountEmp) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/employees/${accountEmp.id}/account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password })
      });
      if (res.ok) {
        setIsAccountModalOpen(false);
        fetchData(true);
        // Trigger global sync request to refresh session if needed
        window.dispatchEvent(new CustomEvent('aio-sync-request', { detail: { module: 'session' } }));
      } else {
        const data = await res.json();
        alert(data.error || 'Thao tác thất bại');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // CREATE / UPDATE Handlers
  const handleSaveEmployee = async () => {
    if (editingEmp) {
      // Show confirmation for update
      setConfirmConfig({
        isOpen: true,
        title: 'Xác nhận thay đổi',
        message: `Bạn có chắc chắn muốn cập nhật thông tin cho nhân viên ${editingEmp.name}?`,
        type: 'success',
        onConfirm: executeSaveEmployee
      });
    } else {
      executeSaveEmployee();
    }
  };

  const executeSaveEmployee = async () => {
    try {
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empForm)
      });
      
      if (res.ok) {
        setIsEmployeeModalOpen(false);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveDept = async () => {
    if (editingDept) {
      setConfirmConfig({
        isOpen: true,
        title: 'Xác nhận thay đổi',
        message: `Lưu các thay đổi cho phòng ban ${editingDept.name}?`,
        type: 'success',
        onConfirm: executeSaveDept
      });
    } else {
      executeSaveDept();
    }
  };

  const executeSaveDept = async () => {
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = editingDept ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      });
      
      if (res.ok) {
        setIsDeptModalOpen(false);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(true);
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteEmployee = (emp: EmployeeData) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa tài khoản',
      message: `Bạn có chắc chắn muốn xóa nhân viên ${emp.name}? Dữ liệu sẽ được ẩn khỏi hệ thống nhưng vẫn lưu trữ trong lịch sử.`,
      type: 'danger',
      onConfirm: () => executeDeleteEmployee(emp.id)
    });
  };

  const executeDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteDept = (dept: DepartmentData) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa phòng ban',
      message: `Xác nhận xóa phòng ban ${dept.name}? Lưu ý: Không thể xóa phòng ban nếu vẫn còn nhân viên đang hoạt động.`,
      type: 'danger',
      onConfirm: () => executeDeleteDept(dept.id)
    });
  };

  const executeDeleteDept = async (id: string) => {
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      } else {
        alert(json.error || 'Không thể xóa phòng ban.');
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    } catch (err) { console.error(err); }
  };

  // Init Form for Edit
  const openEditEmployee = (emp: EmployeeData) => {
    setEditingEmp(emp);
    setEmpForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      level: emp.level,
      status: emp.status,
      hireDate: emp.hireDate,
      sysRole: emp.sysRole || ''
    });
    setIsEmployeeModalOpen(true);
  };

  const openEditDept = (dept: DepartmentData) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      color: dept.color || '#3B82F6'
    });
    setIsDeptModalOpen(true);
  };

  // Header Logic
  const renderHeaderButton = () => {
    if (activeTab === 'employees') {
      return (
        <Button icon={UserPlus} onClick={() => { 
          setEditingEmp(null); 
          setEmpForm({ name: '', email: '', phone: '', department: '', position: '', level: 'junior', status: 'active', hireDate: new Date().toISOString().split('T')[0], sysRole: '' });
          setIsEmployeeModalOpen(true); 
        }}>
          Thêm nhân viên
        </Button>
      );
    }
    if (activeTab === 'departments') {
      return (
        <Button icon={Plus} onClick={() => {
          setEditingDept(null);
          setDeptForm({ name: '', code: '', color: '#3B82F6' });
          setIsDeptModalOpen(true);
        }}>
          Thêm phòng ban
        </Button>
      );
    }
    return <Button variant="outline" icon={Download}>Xuất báo cáo</Button>;
  };

  const totalEmp = employees.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(174, 65%, 40%, 0.12)' }}>
            <Users size={22} style={{ color: 'hsl(174, 65%, 40%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HMS — Quản lý Nhân sự</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nhân sự, phòng ban & quỹ lương</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={() => fetchData(true)} className="hidden sm:flex" />
          {renderHeaderButton()}
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--primary-900)' }}>
        {[
          { key: 'overview', label: 'Tổng quan', icon: Eye },
          { key: 'employees', label: 'Nhân viên', icon: Users },
          { key: 'departments', label: 'Phòng ban', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-600)]/10 hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
          <StatCard title="Tổng nhân sự" value={totalEmp} icon={Users} color="var(--primary-500)" onClick={() => setActiveTab('employees')} />
          <StatCard title="Phòng ban" value={departments.length} icon={Building2} color="var(--accent-500)" onClick={() => setActiveTab('departments')} />
          <StatCard title="Thử việc" value={employees.filter(e => e.status === 'probation').length} icon={Calendar} color="var(--amber)" onClick={() => handleDrillDown('probation')} />
          <StatCard title="Hoạt động" value={employees.filter(e => e.status === 'active').length} icon={BadgeCheck} color="var(--emerald)" onClick={() => handleDrillDown('active')} />
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-4 animate-fade-in">
          {/* Enhanced Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" size={18} />
            <Input 
              placeholder="Tìm tên, mã hoặc email..." 
              className="pl-10 focus:ring-2 focus:ring-[var(--primary-500)]/20 focus:border-[var(--primary-500)]" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang làm việc' },
                  { value: 'probation', label: 'Thử việc' },
                  { value: 'on_leave', label: 'Nghỉ phép' },
                  { value: 'resigned', label: 'Đã nghỉ' },
                ]} 
              />
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-auto h-10" />
                <span className="text-[var(--text-muted)]">to</span>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-auto h-10" />
              </div>
              
              <ViewToggle current={viewMode} onChange={setViewMode} />

              {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo || isDrilledDown) && (
                <Button variant="ghost" onClick={clearFilters} className="text-rose-500 hover:bg-rose-50 px-2 h-10 flex items-center gap-1">
                   <XCircle size={16} /> Xóa lọc
                </Button>
              )}
            </div>
          </div>

          {viewMode === 'list' ? (
            <Card noPadding className="overflow-hidden border border-[var(--border-color)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                      <th className="px-5 py-4 font-semibold">Nhân viên</th>
                      <th className="px-4 py-4 font-semibold">Phòng ban / Vị trí</th>
                      <th className="px-4 py-4 font-semibold">Trạng thái</th>
                      <th className="px-4 py-4 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/30 text-[var(--primary-600)] flex items-center justify-center font-bold">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                               <div className="font-semibold text-sm">{emp.name}</div>
                               <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">{emp.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="text-sm font-medium">{emp.department}</div>
                           <div className="text-xs text-[var(--text-muted)]">{emp.position} · {emp.level}</div>
                        </td>
                        <td className="px-4 py-4">
                           <Badge variant={STATUS_MAP[emp.status]?.variant || 'default'}>{STATUS_MAP[emp.status]?.label}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setAccountEmp(emp); setGeneratedPassword(''); setIsAccountModalOpen(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-orange-500 transition-colors" title="Quản lý tài khoản">
                                 <Shield size={16} />
                              </button>
                              <button onClick={() => openEditEmployee(emp)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                 <Edit size={16} />
                              </button>
                              <button onClick={() => confirmDeleteEmployee(emp)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <Card key={emp.id} hover padding="lg" className="group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/30 text-[var(--primary-600)] flex items-center justify-center font-bold text-lg">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-[var(--primary-600)] transition-colors">{emp.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{emp.code} · {emp.position}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_MAP[emp.status]?.variant || 'default'}>{STATUS_MAP[emp.status]?.label}</Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div className="text-xs text-[var(--text-muted)]">
                       {emp.department} · {emp.level}
                    </div>
                    <div className="flex items-center gap-1">
                       <button onClick={() => { setAccountEmp(emp); setGeneratedPassword(''); setIsAccountModalOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-orange-500 transition-colors">
                          <Shield size={14} />
                       </button>
                       <button onClick={() => openEditEmployee(emp)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit size={14} />
                       </button>
                       <button onClick={() => confirmDeleteEmployee(emp)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Search size={24} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-medium text-[var(--text-primary)]">Không tìm thấy nhân viên</h3>
               <p className="text-sm text-[var(--text-muted)] mt-1">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
               <Button variant="ghost" className="mt-4" onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {departments.map(dept => (
            <Card key={dept.id} hover padding="lg" className="cursor-pointer" onClick={() => openEditDept(dept)}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${dept.color}15` }}>
                  <Building2 size={20} style={{ color: dept.color }} />
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={(e) => { e.stopPropagation(); openEditDept(dept); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Edit size={14} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); confirmDeleteDept(dept); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                   </button>
                   <Badge variant="custom" bg={`${dept.color}15`} color={dept.color}>{dept.code}</Badge>
                </div>
              </div>
              <h3 className="font-bold text-lg">{dept.name}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">{dept.employeeCount} nhân viên</p>
              <div className="mt-4 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--primary-900)' }}>
                <div className="h-full" style={{ width: `${Math.min(100, (dept.employeeCount / (totalEmp || 1)) * 100)}%`, background: dept.color }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title={editingEmp ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setIsEmployeeModalOpen(false)}>Hủy</Button><Button onClick={handleSaveEmployee} icon={editingEmp ? Save : Plus}>{editingEmp ? 'Cập nhật' : 'Lưu nhân viên'}</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Họ và tên" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} placeholder="Nguyễn Văn A" icon={User} />
          <Input label="Email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} placeholder="nva@example.com" icon={Mail} />
          <Input label="Số điện thoại" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} placeholder="090..." icon={Phone} />
          <Select label="Phòng ban" value={empForm.department} onChange={e => setEmpForm({...empForm, department: e.target.value})} 
            options={departments.map(d => ({ value: d.name, label: d.name }))} />
          <Input label="Chức vụ" value={empForm.position} onChange={e => setEmpForm({...empForm, position: e.target.value})} placeholder="Trưởng nhóm..." icon={BadgeCheck} />
          <Select label="Cấp bậc" value={empForm.level} onChange={e => setEmpForm({...empForm, level: e.target.value})} options={LEVEL_OPTIONS} />
          <Input label="Ngày vào làm" type="date" value={empForm.hireDate} onChange={e => setEmpForm({...empForm, hireDate: e.target.value})} icon={Calendar} />
          <Select label="Trạng thái" value={empForm.status} onChange={e => setEmpForm({...empForm, status: e.target.value})} 
            options={Object.keys(STATUS_MAP).map(k => ({ value: k, label: STATUS_MAP[k].label }))} />
          <Select label="Vai trò (Quyền hệ thống)" value={empForm.sysRole} onChange={e => setEmpForm({...empForm, sysRole: e.target.value})} 
            options={[{value: '', label: '-- Không chọn --'}, ...roles.map(r => ({ value: r.code, label: r.name }))]} />
          {!editingEmp && (
            <div className="col-span-full border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold mb-3">Thông tin tài khoản đăng nhập</h4>
              <div className="flex gap-2">
                <Input 
                  label="Mật khẩu khởi tạo" 
                  value={empForm.password} 
                  onChange={e => setEmpForm({...empForm, password: e.target.value})} 
                  placeholder="Nhập hoặc sinh ngẫu nhiên" 
                  icon={Lock} 
                  className="flex-1"
                />
                <div className="flex items-end mb-1">
                  <Button variant="outline" icon={RefreshCw} onClick={generateRandomPassword}>Ngẫu nhiên</Button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">* Bỏ trống nếu không muốn tạo tài khoản đăng nhập ngay bây giờ.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={editingDept ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"} size="sm"
        footer={<><Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Hủy</Button><Button onClick={handleSaveDept} icon={editingDept ? Save : Plus}>{editingDept ? 'Cập nhật' : 'Lưu'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tên phòng ban" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} placeholder="Phòng Phát triển Phần mềm" icon={Building2} />
          <Input label="Mã phòng ban" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} placeholder="SWE" icon={Hash} />
          <Input label="Màu thương hiệu" type="color" value={deptForm.color} onChange={e => setDeptForm({...deptForm, color: e.target.value})} />
        </div>
      </Modal>

      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} 
        title={`Quản trị tài khoản: ${accountEmp?.name}`} size="md"
        footer={<Button variant="ghost" onClick={() => setIsAccountModalOpen(false)}>Đóng</Button>}>
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]">
            <div className="w-12 h-12 rounded-full bg-[var(--primary-100)] dark:bg-[var(--primary-900)]/30 text-[var(--primary-600)] flex items-center justify-center font-bold text-xl">
              {accountEmp?.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-lg">{accountEmp?.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{accountEmp?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" icon={Unlock} className="justify-start h-12 text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={() => handleAccountAction('unlock')} isLoading={isSyncing}>Mở khóa</Button>
            <Button variant="outline" icon={Lock} className="justify-start h-12 text-rose-600 border-rose-100 hover:bg-rose-50" onClick={() => handleAccountAction('lock')} isLoading={isSyncing}>Khóa tài khoản</Button>
          </div>

          <div className="pt-6 border-t border-[var(--border-color)]">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Key size={16} className="text-amber-500" /> Đặt lại mật khẩu
            </h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Mật khẩu mới..." 
                  value={generatedPassword} 
                  onChange={e => setGeneratedPassword(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={generateRandomPassword} icon={RefreshCw}>Random</Button>
              </div>
              {generatedPassword && (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg animate-fade-in">
                  <code className="font-mono font-bold text-amber-700 dark:text-amber-400">{generatedPassword}</code>
                  <button onClick={() => copyToClipboard(generatedPassword)} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
                    <Copy size={12} /> Sao chép
                  </button>
                </div>
              )}
              <Button 
                variant="primary" 
                className="w-full mt-2" 
                disabled={!generatedPassword || isSyncing}
                onClick={() => handleAccountAction('reset-password', generatedPassword)}
                isLoading={isSyncing}
              >
                Xác nhận đổi mật khẩu
              </Button>
            </div>
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
