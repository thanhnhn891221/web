'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock, CalendarDays, UserCheck, AlertTriangle,
  Search, Plus, Download, Filter, CheckCircle2,
  XCircle, Timer, Coffee
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard } from '@/components/ui';

interface AttendanceData {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  shiftName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInMethod: string;
  workingHours: number;
  overtimeHours: number;
  status: string;
  note: string | null;
}

interface ShiftData {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  color: string;
}

interface EmployeeOption {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  present: { label: 'Có mặt', variant: 'success' },
  absent: { label: 'Vắng', variant: 'danger' },
  late: { label: 'Đi muộn', variant: 'warning' },
  early_leave: { label: 'Về sớm', variant: 'warning' },
  on_leave: { label: 'Nghỉ phép', variant: 'info' },
  holiday: { label: 'Nghỉ lễ', variant: 'info' },
};

export default function AttendanceTab({ employees }: { employees: EmployeeOption[] }) {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    shiftId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    note: '',
  });

  useEffect(() => {
    fetchData();
    fetchShifts();
  }, [dateFilter, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) { params.set('dateFrom', dateFilter); params.set('dateTo', dateFilter); }
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/attendances?${params.toString()}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) {
      console.error('Failed to load attendance data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts');
      const json = await res.json();
      if (json.success) setShifts(json.data);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.date) return;
    try {
      const body = {
        ...form,
        checkIn: form.checkIn ? new Date(`${form.date}T${form.checkIn}:00`).toISOString() : null,
        checkOut: form.checkOut ? new Date(`${form.date}T${form.checkOut}:00`).toISOString() : null,
        workingHours: form.checkIn && form.checkOut ? calculateHours(form.checkIn, form.checkOut) : 0,
      };
      const res = await fetch('/api/attendances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchData();
        resetForm();
      } else {
        alert(json.error || 'Lỗi tạo chấm công');
      }
    } catch (error) {
      console.error('Create attendance error', error);
    }
  };

  const calculateHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60 - 1); // minus 1h break
  };

  const resetForm = () => setForm({ employeeId: '', shiftId: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present', note: '' });

  // Stats
  const totalPresent = data.filter(d => d.status === 'present').length;
  const totalLate = data.filter(d => d.status === 'late').length;
  const totalAbsent = data.filter(d => d.status === 'absent').length;
  const avgHours = data.length > 0 ? (data.reduce((s, d) => s + (d.workingHours || 0), 0) / data.length).toFixed(1) : '0';

  const filteredData = data.filter(d =>
    (searchQuery === '' || d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || d.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Có mặt" value={totalPresent} icon={UserCheck} color="emerald" />
        <StatCard title="Đi muộn" value={totalLate} icon={Clock} color="amber" />
        <StatCard title="Vắng mặt" value={totalAbsent} icon={XCircle} color="rose" />
        <StatCard title="Giờ TB" value={`${avgHours}h`} icon={Timer} color="blue" />
      </div>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-1">
            <Input placeholder="Tìm nhân viên..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              icon={Search} />
          </div>
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44" />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tất cả' }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))]} className="w-40" />
          <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Chấm công
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
            <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có dữ liệu chấm công</p>
            <p className="text-sm mt-1">Chọn ngày khác hoặc chấm công mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                  <th className="text-left p-3 font-medium">Nhân viên</th>
                  <th className="text-left p-3 font-medium">Phòng ban</th>
                  <th className="text-left p-3 font-medium">Ca</th>
                  <th className="text-center p-3 font-medium">Vào</th>
                  <th className="text-center p-3 font-medium">Ra</th>
                  <th className="text-center p-3 font-medium">Số giờ</th>
                  <th className="text-center p-3 font-medium">OT</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const st = STATUS_MAP[item.status] || { label: item.status, variant: 'info' as const };
                  return (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{item.employeeName}</div>
                        <div className="text-xs text-gray-500">{item.employeeCode}</div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.department}</td>
                      <td className="p-3">{item.shiftName}</td>
                      <td className="p-3 text-center font-mono text-xs">
                        {item.checkIn ? new Date(item.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3 text-center font-mono text-xs">
                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3 text-center font-semibold">{item.workingHours?.toFixed(1) || '0'}h</td>
                      <td className="p-3 text-center text-emerald-600 font-medium">{item.overtimeHours ? `+${item.overtimeHours}h` : '-'}</td>
                      <td className="p-3 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Chấm công mới" size="lg">
        <div className="space-y-4">
          <Select label="Nhân viên *" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
            options={[{ value: '', label: '-- Chọn nhân viên --' }, ...employees.map(e => ({ value: e.id, label: `${e.code} - ${e.name}` }))]} />
          <Select label="Ca làm" value={form.shiftId} onChange={e => setForm({ ...form, shiftId: e.target.value })}
            options={[{ value: '', label: '-- Không chọn --' }, ...shifts.map(s => ({ value: s.id, label: `${s.code} - ${s.name} (${s.startTime}-${s.endTime})` }))]} />
          <Input type="date" label="Ngày" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="time" label="Giờ vào" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            <Input type="time" label="Giờ ra" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
          </div>
          <Select label="Trạng thái" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input label="Ghi chú" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.employeeId}>
              <CheckCircle2 size={16} /> Lưu chấm công
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
