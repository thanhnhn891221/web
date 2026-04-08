'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Building2, UserPlus, Search,
  Download, Eye, Edit, BadgeCheck, Trash2,
  Plus, Calendar, User, Mail, Phone, Hash,
  AlertTriangle, Save, Shield
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeData | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);

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
    name: '', email: '', phone: '', department: '', position: '', level: 'junior', status: 'active', hireDate: new Date().toISOString().split('T')[0], sysRole: ''
  });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', color: '#3B82F6' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments')
      ]);
      const empJson = await empRes.json();
      const deptJson = await deptRes.json();
      if (empJson.success) setEmployees(empJson.data);
      if (deptJson.success) setDepartments(deptJson.data);
    } catch (error) {
      console.error('Failed to load HMS data', error);
    } finally {
      setIsLoading(false);
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
        fetchData();
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
        fetchData();
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
        {renderHeaderButton()}
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
          <StatCard title="Tổng nhân sự" value={totalEmp} icon={Users} color="var(--primary-500)" />
          <StatCard title="Phòng ban" value={departments.length} icon={Building2} color="var(--accent-500)" />
          <StatCard title="Thử việc" value={employees.filter(e => e.status === 'probation').length} icon={Calendar} color="var(--amber)" />
          <StatCard title="Hoạt động" value={employees.filter(e => e.status === 'active').length} icon={BadgeCheck} color="var(--emerald)" />
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <Card key={emp.id} hover padding="lg" className="cursor-pointer" onClick={() => openEditEmployee(emp)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-50)] text-[var(--primary-600)] flex items-center justify-center font-bold text-lg">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{emp.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{emp.code} · {emp.position}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={STATUS_MAP[emp.status]?.variant || 'default'}>{STATUS_MAP[emp.status]?.label}</Badge>
                    <div className="flex items-center gap-1">
                       <button onClick={(e) => { e.stopPropagation(); openEditEmployee(emp); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit size={14} />
                       </button>
                       <button onClick={(e) => { e.stopPropagation(); confirmDeleteEmployee(emp); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Building2 size={12}/> {emp.department}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Mail size={12}/> {emp.email}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Shield size={12} className="text-amber-500" /> Vai trò: {emp.sysRole || 'Chưa phân quyền'}</div>
                </div>
              </Card>
            ))}
          </div>
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
          <Input label="Vai trò (Ghi chú phân quyền)" value={empForm.sysRole} onChange={e => setEmpForm({...empForm, sysRole: e.target.value})} placeholder="Vd: Administrator, Manager..." icon={Shield} />
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
