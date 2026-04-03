'use client';

import React, { useState } from 'react';
import {
  Users, Building2, UserPlus, Search,
  MoreHorizontal, Download, Eye, Edit, BadgeCheck,
  Trash2, Phone, Mail, Calendar, X
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, EmptyState } from '@/components/ui';

// ─── HMS Mock Data ──────────────────────────────────
const DEPARTMENTS = [
  { id: '1', name: 'Ban Giám đốc', code: 'BGD', employeeCount: 5, color: '#3B82F6' },
  { id: '2', name: 'Phòng IT', code: 'IT', employeeCount: 18, color: '#8B5CF6' },
  { id: '3', name: 'Phòng Nhân sự', code: 'HR', employeeCount: 8, color: '#14B8A6' },
  { id: '4', name: 'Phòng Kinh doanh', code: 'SALES', employeeCount: 42, color: '#F97316' },
  { id: '5', name: 'Phòng Marketing', code: 'MKT', employeeCount: 15, color: '#EC4899' },
  { id: '6', name: 'Phòng Kế toán', code: 'ACCT', employeeCount: 12, color: '#EAB308' },
  { id: '7', name: 'Phòng Sản xuất', code: 'PROD', employeeCount: 85, color: '#EF4444' },
  { id: '8', name: 'Phòng R&D', code: 'RND', employeeCount: 22, color: '#06B6D4' },
  { id: '9', name: 'Phòng QA/QC', code: 'QC', employeeCount: 16, color: '#22C55E' },
  { id: '10', name: 'Phòng Logistics', code: 'LOG', employeeCount: 25, color: '#A855F7' },
];

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
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' }> = {
  active: { label: 'Đang làm việc', variant: 'success' },
  probation: { label: 'Thử việc', variant: 'warning' },
  on_leave: { label: 'Nghỉ phép', variant: 'info' },
  resigned: { label: 'Đã nghỉ', variant: 'danger' },
};

const LEVEL_MAP: Record<string, string> = {
  intern: 'Thực tập sinh', junior: 'Nhân viên', mid: 'Nhân viên',
  senior: 'Chuyên viên', lead: 'Trưởng nhóm', manager: 'Trưởng phòng', director: 'Giám đốc',
};

type Tab = 'overview' | 'employees' | 'departments';

export default function HMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: '', position: '', level: 'mid', status: 'active', hireDate: '',
  });

  // Fetch employees from API directly
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const json = await res.json();
        if (json.success) {
          setEmployees(json.data);
        }
      } catch (error) {
        console.error('Failed to load employees', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const totalEmployees = DEPARTMENTS.reduce((sum, d) => sum + d.employeeCount, 0);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === 'all' || emp.department === DEPARTMENTS.find(d => d.id === selectedDept)?.name;
    return matchSearch && matchDept;
  });

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', phone: '', department: DEPARTMENTS[0].name, position: '', level: 'mid', status: 'active', hireDate: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: EmployeeData) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name, email: emp.email, phone: emp.phone,
      department: emp.department, position: emp.position,
      level: emp.level, status: emp.status, hireDate: emp.hireDate,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e =>
        e.id === editingEmployee.id
          ? { ...e, ...formData }
          : e
      ));
    } else {
      const newId = String(Date.now());
      const newCode = `NV-${String(employees.length + 1).padStart(3, '0')}`;
      setEmployees(prev => [...prev, { id: newId, code: newCode, ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setIsDeleteConfirm(null);
    setSelectedEmployee(null);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Tổng quan', icon: Eye },
    { key: 'employees', label: 'Nhân viên', icon: Users },
    { key: 'departments', label: 'Phòng ban', icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(174, 65%, 40%, 0.12)' }}>
            <Users size={22} style={{ color: 'hsl(174, 65%, 40%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HMS — Quản lý Nhân sự</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Quản trị năng suất, tổ chức và quỹ lương</p>
          </div>
        </div>
        <Button icon={UserPlus} onClick={openAddModal}>Thêm nhân viên</Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <StatCard title="Tổng nhân sự" value={totalEmployees} change={5.2} icon={Users} color="var(--primary-500)" />
            <StatCard title="Phòng ban" value={DEPARTMENTS.length} icon={Building2} color="var(--accent-500)" changeLabel="Đang hoạt động" />
            <StatCard title="Thử việc" value={3} icon={Calendar} color="var(--amber)" changeLabel="Đang đánh giá" />
            <StatCard title="Tỷ lệ nghỉ việc" value="2.1%" icon={BadgeCheck} color="var(--emerald)" changeLabel="Rất tốt" />
          </div>
          <Card padding="lg">
            <h2 className="font-semibold text-lg mb-4">Phân bổ Nhân sự theo Phòng ban</h2>
            <div className="space-y-3">
              {DEPARTMENTS.map((dept) => {
                const pct = Math.round((dept.employeeCount / totalEmployees) * 100);
                return (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: dept.color }} />
                        <span className="text-sm font-medium">{dept.name}</span>
                        <Badge>{dept.code}</Badge>
                      </div>
                      <span className="text-sm font-semibold">{dept.employeeCount} người ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${dept.color}, ${dept.color}cc)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ─── Employees Tab ─── */}
      {activeTab === 'employees' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Tìm theo tên, mã NV, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm outline-none">
                <option value="all">Tất cả phòng ban</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Button variant="outline" icon={Download} size="sm">Xuất Excel</Button>
            </div>
          </div>

          <Card padding="none">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
                <p className="text-sm text-[var(--text-muted)]">Đang tải danh sách nhân sự...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Users size={40} className="mb-4 text-[var(--text-muted)] opacity-50" />
                <p className="text-[var(--text-secondary)] font-medium">Không tìm thấy nhân viên nào</p>
              </div>
            ) : (
              <>
                {/* ─── Desktop Table View ─── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--slate-50)' }}>
                        {['Nhân viên', 'Phòng ban', 'Chức vụ', 'Trạng thái', 'Ngày vào', ''].map((h, i) => (
                          <th key={i} className={`${i === 5 ? 'text-right' : 'text-left'} text-xs font-semibold uppercase tracking-wider px-5 py-3`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                      {filteredEmployees.map((emp) => {
                        const status = STATUS_MAP[emp.status] || STATUS_MAP.active;
                        const initials = emp.name.split(' ').slice(-2).map(n => n[0]).join('');
                        const deptColor = DEPARTMENTS.find(d => d.name === emp.department)?.color || 'var(--primary-500)';

                        return (
                          <tr key={emp.id} className="group hover:bg-[var(--slate-25)] transition-colors duration-150">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}cc)` }}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold hover:underline">{emp.name}</p>
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.code} • {emp.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm">{emp.department}</td>
                            <td className="px-5 py-3.5">
                              <p className="text-sm">{emp.position}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{LEVEL_MAP[emp.level] || emp.level}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge variant={status.variant} icon={BadgeCheck}>{status.label}</Badge>
                            </td>
                            <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(emp.hireDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => openEditModal(emp)} className="p-1.5 rounded-lg hover:bg-[var(--slate-100)] transition-colors" title="Chỉnh sửa">
                                  <Edit size={14} style={{ color: 'var(--primary-500)' }} />
                                </button>
                                <button onClick={() => setIsDeleteConfirm(emp.id)} className="p-1.5 rounded-lg hover:bg-[var(--rose-light)] transition-colors" title="Xóa">
                                  <Trash2 size={14} style={{ color: 'var(--rose)' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ─── Mobile Card View ─── */}
                <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
                  {filteredEmployees.map((emp) => {
                    const status = STATUS_MAP[emp.status] || STATUS_MAP.active;
                    const initials = emp.name.split(' ').slice(-2).map(n => n[0]).join('');
                    const deptColor = DEPARTMENTS.find(d => d.name === emp.department)?.color || 'var(--primary-500)';

                    return (
                      <div key={emp.id} className="p-4 flex flex-col gap-3 active:bg-[var(--slate-50)] transition-colors" onClick={() => setSelectedEmployee(emp)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}cc)` }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{emp.name}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{emp.position}</p>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(emp); }} className="p-1.5 bg-[var(--slate-50)] rounded-lg">
                            <Edit size={14} className="text-[var(--text-muted)]" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <BadgeCheck size={12} />
                            <span>{emp.code}</span>
                            <span className="opacity-50">•</span>
                            <span>{emp.department}</span>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hiển thị {filteredEmployees.length} / {employees.length} nhân viên</p>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Departments Tab ─── */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {DEPARTMENTS.map((dept) => (
            <Card key={dept.id} hover padding="lg" className="group">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" style={{ background: `${dept.color}18` }}>
                  <Building2 size={24} style={{ color: dept.color }} />
                </div>
                <Badge variant="custom" color={dept.color} bg={`${dept.color}15`}>{dept.code}</Badge>
              </div>
              <h3 className="text-base font-semibold mt-4">{dept.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Users size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dept.employeeCount} nhân viên</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((dept.employeeCount / totalEmployees) * 100)}%`, background: dept.color }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Employee Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
        description={editingEmployee ? `Cập nhật thông tin cho ${editingEmployee.name}` : 'Điền thông tin nhân viên mới vào hệ thống HMS'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editingEmployee ? 'Cập nhật' : 'Thêm nhân viên'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Họ và tên" placeholder="Nguyễn Văn A" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" placeholder="email@company.vn" icon={Mail} value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
          <Input label="Số điện thoại" placeholder="0901-234-567" icon={Phone} value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
          <Select label="Phòng ban" value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
            options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))} />
          <Input label="Chức vụ" placeholder="Senior Developer" value={formData.position} onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))} />
          <Select label="Cấp bậc" value={formData.level} onChange={(e) => setFormData(p => ({ ...p, level: e.target.value }))}
            options={Object.entries(LEVEL_MAP).map(([k, v]) => ({ value: k, label: v }))} />
          <Select label="Trạng thái" value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input label="Ngày vào làm" type="date" icon={Calendar} value={formData.hireDate} onChange={(e) => setFormData(p => ({ ...p, hireDate: e.target.value }))} />
        </div>
      </Modal>

      {/* ─── Employee Detail Modal ─── */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Chi tiết Nhân viên"
        description={selectedEmployee?.code}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedEmployee(null)}>Đóng</Button>
            <Button variant="outline" icon={Edit} onClick={() => { if (selectedEmployee) { openEditModal(selectedEmployee); setSelectedEmployee(null); } }}>Chỉnh sửa</Button>
          </>
        }
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                style={{ background: `linear-gradient(135deg, ${DEPARTMENTS.find(d => d.name === selectedEmployee.department)?.color || 'var(--primary-500)'}, ${DEPARTMENTS.find(d => d.name === selectedEmployee.department)?.color || 'var(--primary-500)'}99)` }}>
                {selectedEmployee.name.split(' ').slice(-2).map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedEmployee.position}</p>
                <Badge variant={STATUS_MAP[selectedEmployee.status]?.variant || 'default'} className="mt-1">
                  {STATUS_MAP[selectedEmployee.status]?.label || selectedEmployee.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Email', value: selectedEmployee.email, icon: Mail },
                { label: 'Điện thoại', value: selectedEmployee.phone, icon: Phone },
                { label: 'Phòng ban', value: selectedEmployee.department, icon: Building2 },
                { label: 'Cấp bậc', value: LEVEL_MAP[selectedEmployee.level] || selectedEmployee.level, icon: Users },
                { label: 'Ngày vào làm', value: new Date(selectedEmployee.hireDate).toLocaleDateString('vi-VN'), icon: Calendar },
                { label: 'Mã nhân viên', value: selectedEmployee.code, icon: BadgeCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                    <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                      <p className="text-sm font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal
        isOpen={!!isDeleteConfirm}
        onClose={() => setIsDeleteConfirm(null)}
        title="Xác nhận Xóa"
        description="Hành động này không thể hoàn tác."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteConfirm(null)}>Hủy</Button>
            <Button variant="danger" icon={Trash2} onClick={() => isDeleteConfirm && handleDelete(isDeleteConfirm)}>Xóa nhân viên</Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Bạn có chắc chắn muốn xóa nhân viên <strong>{employees.find(e => e.id === isDeleteConfirm)?.name}</strong> khỏi hệ thống?
        </p>
      </Modal>
    </div>
  );
}
