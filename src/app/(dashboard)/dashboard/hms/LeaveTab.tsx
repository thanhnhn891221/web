'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, CalendarX, CalendarPlus, Plus,
  Search, CheckCircle2, XCircle, Clock, Eye,
  ChevronDown, Palmtree, Heart, Baby, Ban
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard } from '@/components/ui';

interface LeaveData {
  id: string;
  code: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
}

interface EmployeeOption {
  id: string;
  code: string;
  name: string;
}

const TYPE_MAP: Record<string, { label: string; icon: any; color: string }> = {
  annual: { label: 'Phép năm', icon: Palmtree, color: 'text-emerald-500' },
  sick: { label: 'Ốm đau', icon: Heart, color: 'text-rose-500' },
  maternity: { label: 'Thai sản', icon: Baby, color: 'text-pink-500' },
  unpaid: { label: 'Không lương', icon: Ban, color: 'text-gray-500' },
  compassionate: { label: 'Hiếu / Hỉ', icon: Heart, color: 'text-purple-500' },
  other: { label: 'Khác', icon: CalendarX, color: 'text-gray-400' },
};

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
  cancelled: { label: 'Đã hủy', variant: 'info' },
};

export default function LeaveTab({ employees }: { employees: EmployeeOption[] }) {
  const [data, setData] = useState<LeaveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    type: 'annual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  useEffect(() => { fetchData(); }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/leave-requests?${params.toString()}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) {
      console.error('Failed to load leave data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) return;
    try {
      const res = await fetch('/api/leave-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchData();
        resetForm();
      } else {
        alert(json.error || 'Lỗi tạo đơn nghỉ phép');
      }
    } catch (error) {
      console.error('Create leave error', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/leave-requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
      if ((await res.json()).success) fetchData();
    } catch {}
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Lý do từ chối:');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/leave-requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', rejectReason: reason }) });
      if ((await res.json()).success) fetchData();
    } catch {}
  };

  const resetForm = () => setForm({ employeeId: '', type: 'annual', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' });

  // Stats
  const totalPending = data.filter(d => d.status === 'pending').length;
  const totalApproved = data.filter(d => d.status === 'approved').length;
  const totalRejected = data.filter(d => d.status === 'rejected').length;
  const totalDaysUsed = data.filter(d => d.status === 'approved').reduce((s, d) => s + d.totalDays, 0);

  const filteredData = data.filter(d =>
    searchQuery === '' || d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Chờ duyệt" value={totalPending} icon={Clock} color="amber" />
        <StatCard title="Đã duyệt" value={totalApproved} icon={CalendarCheck} color="emerald" />
        <StatCard title="Từ chối" value={totalRejected} icon={CalendarX} color="rose" />
        <StatCard title="Tổng ngày phép" value={`${totalDaysUsed} ngày`} icon={CalendarPlus} color="blue" />
      </div>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-1">
            <Input placeholder="Tìm đơn nghỉ phép..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              icon={Search} />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tất cả' }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))]} className="w-40" />
          <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Tạo đơn
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Palmtree size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có đơn nghỉ phép</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                  <th className="text-left p-3 font-medium">Mã đơn</th>
                  <th className="text-left p-3 font-medium">Nhân viên</th>
                  <th className="text-left p-3 font-medium">Loại</th>
                  <th className="text-center p-3 font-medium">Từ ngày</th>
                  <th className="text-center p-3 font-medium">Đến ngày</th>
                  <th className="text-center p-3 font-medium">Số ngày</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                  <th className="text-center p-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => {
                  const st = STATUS_MAP[item.status] || { label: item.status, variant: 'info' as const };
                  const tp = TYPE_MAP[item.type] || TYPE_MAP.other;
                  return (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-xs font-semibold text-emerald-600">{item.code}</td>
                      <td className="p-3">
                        <div className="font-medium">{item.employeeName}</div>
                        <div className="text-xs text-gray-500">{item.department}</div>
                      </td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1.5 ${tp.color}`}>
                          <tp.icon size={14} /> {tp.label}
                        </span>
                      </td>
                      <td className="p-3 text-center text-xs">{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-center text-xs">{new Date(item.endDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-center font-semibold">{item.totalDays}</td>
                      <td className="p-3 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="p-3 text-center">
                        {item.status === 'pending' && (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleApprove(item.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Duyệt">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => handleReject(item.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Từ chối">
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo đơn nghỉ phép" size="lg">
        <div className="space-y-4">
          <Select label="Nhân viên *" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
            options={[{ value: '', label: '-- Chọn --' }, ...employees.map(e => ({ value: e.id, label: `${e.code} - ${e.name}` }))]} />
          <Select label="Loại nghỉ phép *" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Từ ngày *" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" label="Đến ngày *" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Input label="Lý do" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.employeeId}>
              <CalendarPlus size={16} /> Gửi đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
