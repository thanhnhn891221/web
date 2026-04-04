'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, StatCard, Badge, Button } from '@/components/ui';

export default function BMSPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        if (data.success) setInvoices(data.data);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const unpaidAmount = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(220, 75%, 55%, 0.12)' }}>
            <FileText size={22} style={{ color: 'hsl(220, 75%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BMS — Quản lý Hóa đơn</h1>
            <p className="text-sm border-none bg-transparent outline-none" style={{ color: 'var(--text-secondary)' }}>Billing, xuất hóa đơn & theo dõi thanh toán</p>
          </div>
        </div>
        <Button icon={FileText}>Tạo hóa đơn</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng Hóa đơn" value={fmt(totalAmount)} icon={DollarSign} color="var(--primary-500)" />
        <StatCard title="Đã thu" value={fmt(paidAmount)} icon={CheckCircle} color="var(--emerald)" />
        <StatCard title="Chưa thu" value={fmt(unpaidAmount)} icon={Clock} color="var(--amber)" />
        <StatCard title="Quá hạn" value={overdueCount} icon={AlertTriangle} color="var(--rose)" />
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu Hóa đơn...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[var(--primary-500)] block">{inv.code}</span>
                      <span className="text-xs text-[var(--text-muted)] mt-0.5 block flex items-center gap-1">Hạn: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                      {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'overdue' ? 'Quá hạn' : 'Chưa thu'}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-semibold">{inv.customerName}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">Đơn hàng: <span className="font-medium text-[var(--text-primary)]">{inv.salesOrderId ? 'OMS-1254' : 'N/A'}</span></p>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">TỔNG TIỀN</span>
                    <span className="text-lg font-bold text-[var(--accent-500)]">{fmt(inv.amount)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--slate-50)' }}>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Mã HĐ</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Khách hàng</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Mã Đơn hàng</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Tổng Tiền</th>
                    <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Hạn TT</th>
                    <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-[var(--slate-25)] transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--primary-500)' }}>{inv.code}</td>
                      <td className="px-5 py-4 text-sm font-medium">{inv.customerName}</td>
                      <td className="px-5 py-4 text-sm text-[var(--text-muted)]">{inv.salesOrderId ? 'OMS-1254' : 'N/A'}</td>
                      <td className="px-5 py-4 text-sm font-bold text-right text-[var(--accent-500)]">{fmt(inv.amount)}</td>
                      <td className="px-5 py-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                          {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'overdue' ? 'Quá hạn' : 'Chưa thu'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
