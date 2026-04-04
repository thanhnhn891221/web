'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Badge, Card, StatCard } from '@/components/ui';

type Tab = 'journal' | 'receivables';

export default function AMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txnRes, invRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/invoices')
        ]);
        const txnData = await txnRes.json();
        const invData = await invRes.json();
        if (txnData.success) setTransactions(txnData.data);
        if (invData.success) {
          // Filter invoices for receivables (unpaid/overdue)
          const rec = invData.data.filter((i: any) => i.status !== 'paid');
          setReceivables(rec);
        }
      } catch (err) {
        console.error('Failed to fetch AMS data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '—';
  const totalDebit = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);
  const totalReceivable = receivables.reduce((s, r) => s + r.amount, 0);

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
        <StatCard title="Quá hạn" value={receivables.filter(r => r.status === 'overdue').length} icon={AlertTriangle} color="var(--rose)" changeLabel="Cần thu hồi" />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {([{ key: 'journal' as Tab, label: 'Sổ Nhật ký', icon: FileText }, { key: 'receivables' as Tab, label: 'Công nợ', icon: DollarSign }]).map(tab => {
          const Icon = tab.icon;
          return (<button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
            <Icon size={16} />{tab.label}</button>);
        })}
      </div>

      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Đang kết nối khối Tài chính...</p>
        </div>
      ) : activeTab === 'journal' ? (
        <Card padding="none" className="animate-fade-in group w-full overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
            {transactions.map(t => (
              <div key={t.id} className="p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[var(--primary-500)] mr-2">{t.code}</span>
                    <span className="text-xs text-[var(--text-muted)]">{new Date(t.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <Badge>{t.account}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug">{t.description}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-color)]">
                  <div className="bg-[var(--slate-50)] p-2 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-[var(--text-muted)] font-semibold mb-1">Nợ (Debit)</p>
                    <p className={`text-sm font-bold ${t.debit > 0 ? 'text-[var(--emerald)]' : 'text-[var(--text-muted)]'}`}>{fmt(t.debit)}</p>
                  </div>
                  <div className="bg-[var(--slate-50)] p-2 rounded-lg text-center">
                    <p className="text-[10px] uppercase text-[var(--text-muted)] font-semibold mb-1">Có (Credit)</p>
                    <p className={`text-sm font-bold ${t.credit > 0 ? 'text-[var(--rose)]' : 'text-[var(--text-muted)]'}`}>{fmt(t.credit)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ background: 'var(--slate-50)' }}>
                {['Mã', 'Ngày', 'Diễn giải', 'Tài khoản', 'Nợ', 'Có'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {transactions.map(t => (
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
      ) : (
        <div className="space-y-3 animate-fade-in">
          {receivables.map((r, i) => (
            <Card key={r.id || i} hover padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--accent-500)]">{r.code}</span>
                    <h3 className="text-sm font-semibold">{r.customerName}</h3>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hạn thanh toán: {new Date(r.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="sm:text-right flex items-center justify-between sm:block">
                  <p className="text-lg font-bold">{fmt(r.amount)}</p>
                  <Badge variant={r.status === 'overdue' ? 'danger' : r.status === 'paid' ? 'success' : 'warning'}>
                    {r.status === 'overdue' ? 'Quá hạn' : r.status === 'paid' ? 'Đã thu' : 'Chưa thu'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
