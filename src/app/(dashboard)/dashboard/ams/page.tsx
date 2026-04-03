'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Badge, Card, StatCard } from '@/components/ui';

const TRANSACTIONS = [
  { id: '1', code: 'GL-001', date: '2026-03-31', description: 'Doanh thu bán hàng — OMS-1256', debit: 32000000, credit: 0, account: '511 - Doanh thu', type: 'revenue' },
  { id: '2', code: 'GL-002', date: '2026-03-31', description: 'Chi phí NVL — PO-2026-001', debit: 0, credit: 15600000, account: '621 - Chi phí NVL', type: 'expense' },
  { id: '3', code: 'GL-003', date: '2026-03-31', description: 'Lương tháng 3/2026', debit: 0, credit: 248000000, account: '334 - Phải trả CNV', type: 'expense' },
  { id: '4', code: 'GL-004', date: '2026-03-30', description: 'Thu tiền KH — CoopMart', debit: 18500000, credit: 0, account: '131 - Phải thu KH', type: 'receivable' },
  { id: '5', code: 'GL-005', date: '2026-03-30', description: 'Thanh toán NCC — Bao bì ĐN', debit: 0, credit: 11000000, account: '331 - Phải trả NCC', type: 'payable' },
  { id: '6', code: 'GL-006', date: '2026-03-29', description: 'Khấu hao TSCĐ tháng 3', debit: 0, credit: 12500000, account: '214 - Hao mòn TSCĐ', type: 'depreciation' },
];

const RECEIVABLES = [
  { customer: 'Siêu thị CoopMart', amount: 45000000, dueDate: '2026-04-05', status: 'current' },
  { customer: 'Bách Hóa Xanh', amount: 32000000, dueDate: '2026-04-10', status: 'current' },
  { customer: 'Vinmart', amount: 18500000, dueDate: '2026-03-25', status: 'overdue' },
  { customer: 'Đại lý Phương Nam', amount: 7200000, dueDate: '2026-04-01', status: 'current' },
];

type Tab = 'journal' | 'receivables';

export default function AMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';
  const totalDebit = TRANSACTIONS.reduce((s, t) => s + t.debit, 0);
  const totalCredit = TRANSACTIONS.reduce((s, t) => s + t.credit, 0);
  const totalReceivable = RECEIVABLES.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(38, 90%, 50%, 0.12)' }}>
            <Calculator size={22} style={{ color: 'hsl(38, 90%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AMS — Quản lý Kế toán</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hạch toán, công nợ, hóa đơn & sổ cái</p>
          </div>
        </div>
        <Button icon={FileText}>Tạo bút toán</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng Nợ (Debit)" value={fmt(totalDebit)} icon={ArrowUpRight} color="var(--primary-500)" />
        <StatCard title="Tổng Có (Credit)" value={fmt(totalCredit)} icon={ArrowDownRight} color="var(--accent-500)" />
        <StatCard title="Công nợ phải thu" value={fmt(totalReceivable)} icon={DollarSign} color="var(--amber)" />
        <StatCard title="Quá hạn" value={RECEIVABLES.filter(r => r.status === 'overdue').length} icon={AlertTriangle} color="var(--rose)" changeLabel="Cần thu hồi" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([{ key: 'journal' as Tab, label: 'Sổ Nhật ký', icon: FileText }, { key: 'receivables' as Tab, label: 'Công nợ', icon: DollarSign }]).map(tab => {
          const Icon = tab.icon;
          return (<button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
            <Icon size={16} />{tab.label}</button>);
        })}
      </div>

      {activeTab === 'journal' && (
        <Card padding="none" className="animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ background: 'var(--slate-50)' }}>
                {['Mã', 'Ngày', 'Diễn giải', 'Tài khoản', 'Nợ', 'Có'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {TRANSACTIONS.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--slate-25)] transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>{t.code}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-3 text-sm">{t.description}</td>
                    <td className="px-5 py-3"><Badge>{t.account}</Badge></td>
                    <td className="px-5 py-3 text-sm font-semibold text-right" style={{ color: t.debit > 0 ? 'var(--emerald)' : 'var(--text-muted)' }}>{fmt(t.debit)}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-right" style={{ color: t.credit > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>{fmt(t.credit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'receivables' && (
        <div className="space-y-3 animate-fade-in">
          {RECEIVABLES.map((r, i) => (
            <Card key={i} hover padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{r.customer}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hạn thanh toán: {new Date(r.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{fmt(r.amount)}</p>
                  <Badge variant={r.status === 'overdue' ? 'danger' : 'success'}>{r.status === 'overdue' ? 'Quá hạn' : 'Trong hạn'}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
