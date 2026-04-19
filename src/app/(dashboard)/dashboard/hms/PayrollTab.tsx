'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign,
  Search, Plus, CheckCircle2, Download, Filter,
  Calculator, Coins, CreditCard, FileText
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard } from '@/components/ui';

interface PayrollData {
  id: string;
  code: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  position: string;
  department: string;
  period: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  bonus: number;
  deductions: number;
  socialInsurance: number;
  healthInsurance: number;
  personalTax: number;
  netSalary: number;
  workingDays: number;
  status: string;
}

interface EmployeeOption {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: 'Nháp', variant: 'info' },
  calculated: { label: 'Đã tính', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  paid: { label: 'Đã chi', variant: 'success' },
};

const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function PayrollTab({ employees }: { employees: EmployeeOption[] }) {
  const [data, setData] = useState<PayrollData[]>([]);
  const [summary, setSummary] = useState({ totalNet: 0, totalBase: 0, totalBonus: 0, totalDeductions: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    period: periodFilter,
    baseSalary: 0,
    allowances: 0,
    overtime: 0,
    bonus: 0,
    deductions: 0,
    socialInsurance: 0,
    healthInsurance: 0,
    personalTax: 0,
    workingDays: 22,
    note: '',
  });

  useEffect(() => { fetchData(); }, [periodFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (periodFilter) params.set('period', periodFilter);
      const res = await fetch(`/api/payroll?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setSummary(json.summary);
      }
    } catch (error) {
      console.error('Failed to load payroll data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.period) return;
    try {
      const res = await fetch('/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchData();
        resetForm();
      } else {
        alert(json.error || 'Lỗi tạo bảng lương');
      }
    } catch (error) {
      console.error('Create payroll error', error);
    }
  };

  const netCalc = () => {
    const income = form.baseSalary + form.allowances + form.overtime + form.bonus;
    const deduct = form.deductions + form.socialInsurance + form.healthInsurance + form.personalTax;
    return income - deduct;
  };

  const resetForm = () => setForm({
    employeeId: '', period: periodFilter, baseSalary: 0, allowances: 0, overtime: 0, bonus: 0,
    deductions: 0, socialInsurance: 0, healthInsurance: 0, personalTax: 0, workingDays: 22, note: ''
  });

  const filteredData = data.filter(d =>
    searchQuery === '' || d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Tổng quỹ lương" value={formatMoney(summary.totalNet)} icon={Wallet} color="emerald" />
        <StatCard title="Lương cơ bản" value={formatMoney(summary.totalBase)} icon={DollarSign} color="blue" />
        <StatCard title="Tổng thưởng" value={formatMoney(summary.totalBonus)} icon={TrendingUp} color="amber" />
        <StatCard title="Tổng khấu trừ" value={formatMoney(summary.totalDeductions)} icon={TrendingDown} color="rose" />
      </div>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-1">
            <Input placeholder="Tìm nhân viên..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              icon={Search} />
          </div>
          <Input type="month" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="w-44" />
          <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Tạo bảng lương
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
            <Wallet size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có bảng lương cho kỳ này</p>
            <p className="text-sm mt-1">Chọn kỳ khác hoặc tạo bảng lương mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                  <th className="text-left p-3 font-medium">Mã</th>
                  <th className="text-left p-3 font-medium">Nhân viên</th>
                  <th className="text-right p-3 font-medium">Lương CB</th>
                  <th className="text-right p-3 font-medium">Phụ cấp</th>
                  <th className="text-right p-3 font-medium">Thưởng</th>
                  <th className="text-right p-3 font-medium">Khấu trừ</th>
                  <th className="text-right p-3 font-medium text-emerald-600">Thực nhận</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => {
                  const st = STATUS_MAP[item.status] || { label: item.status, variant: 'info' as const };
                  const totalDeduct = item.deductions + item.socialInsurance + item.healthInsurance + item.personalTax;
                  return (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-xs font-semibold text-emerald-600">{item.code}</td>
                      <td className="p-3">
                        <div className="font-medium">{item.employeeName}</div>
                        <div className="text-xs text-gray-500">{item.department} • {item.position}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-xs">{formatMoney(item.baseSalary)}</td>
                      <td className="p-3 text-right font-mono text-xs text-blue-600">{formatMoney(item.allowances)}</td>
                      <td className="p-3 text-right font-mono text-xs text-amber-600">{formatMoney(item.bonus)}</td>
                      <td className="p-3 text-right font-mono text-xs text-rose-600">-{formatMoney(totalDeduct)}</td>
                      <td className="p-3 text-right font-mono text-sm font-bold text-emerald-600">{formatMoney(item.netSalary)}</td>
                      <td className="p-3 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 font-semibold">
                  <td className="p-3" colSpan={2}>Tổng cộng ({summary.count} NV)</td>
                  <td className="p-3 text-right font-mono text-xs">{formatMoney(summary.totalBase)}</td>
                  <td className="p-3" colSpan={2}></td>
                  <td className="p-3 text-right font-mono text-xs text-rose-600">-{formatMoney(summary.totalDeductions)}</td>
                  <td className="p-3 text-right font-mono text-sm text-emerald-600">{formatMoney(summary.totalNet)}</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo bảng lương" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Nhân viên *" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
              options={[{ value: '', label: '-- Chọn --' }, ...employees.map(e => ({ value: e.id, label: `${e.code} - ${e.name}` }))]} />
            <Input type="month" label="Kỳ lương *" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">💰 Thu nhập</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input type="number" label="Lương CB" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: +e.target.value })} />
              <Input type="number" label="Phụ cấp" value={form.allowances} onChange={e => setForm({ ...form, allowances: +e.target.value })} />
              <Input type="number" label="Tăng ca" value={form.overtime} onChange={e => setForm({ ...form, overtime: +e.target.value })} />
              <Input type="number" label="Thưởng" value={form.bonus} onChange={e => setForm({ ...form, bonus: +e.target.value })} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-2">📉 Khấu trừ</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input type="number" label="Khấu trừ khác" value={form.deductions} onChange={e => setForm({ ...form, deductions: +e.target.value })} />
              <Input type="number" label="BHXH" value={form.socialInsurance} onChange={e => setForm({ ...form, socialInsurance: +e.target.value })} />
              <Input type="number" label="BHYT" value={form.healthInsurance} onChange={e => setForm({ ...form, healthInsurance: +e.target.value })} />
              <Input type="number" label="Thuế TNCN" value={form.personalTax} onChange={e => setForm({ ...form, personalTax: +e.target.value })} />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5">
            <span className="font-medium">Thực nhận:</span>
            <span className="text-xl font-bold text-emerald-600">{formatMoney(netCalc())}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Ngày công" value={form.workingDays} onChange={e => setForm({ ...form, workingDays: +e.target.value })} />
            <Input label="Ghi chú" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.employeeId}>
              <Calculator size={16} /> Tạo bảng lương
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
