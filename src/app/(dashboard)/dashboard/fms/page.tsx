'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, DollarSign, Activity, PieChart, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, StatCard, Badge, Button } from '@/components/ui';

export default function FMSPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await fetch('/api/budgets');
        const data = await res.json();
        if (data.success) setBudgets(data.data);
      } catch (err) {
        console.error('Failed to fetch budgets', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  
  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spentPct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(280, 65%, 55%, 0.12)' }}>
            <Briefcase size={22} style={{ color: 'hsl(280, 65%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FMS — Quản trị Tài chính</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ngân sách, Dòng tiền & Kế hoạch tài chính</p>
          </div>
        </div>
        <Button icon={TrendingUp}>Cấp ngân sách mới</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng Ngân Sách" value={fmt(totalAllocated)} icon={DollarSign} color="var(--primary-500)" />
        <StatCard title="Đã giải ngân" value={fmt(totalSpent)} icon={Activity} color="var(--amber)" />
        <StatCard title="Còn lại" value={fmt(totalRemaining)} icon={PieChart} color="var(--emerald)" />
        <StatCard title="Tỷ lệ tiệu thụ" value={`${spentPct.toFixed(1)}%`} icon={TrendingUp} color="var(--accent-500)" changeLabel="tiến độ" />
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--primary-400)] animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Đang tải biểu đồ ngân sách...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {budgets.map(b => {
                const pct = (b.spent / Math.max(b.allocated, 1)) * 100;
                return (
                  <div key={b.id} className="p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)] block">{b.departmentName}</span>
                        <Badge>{b.period}</Badge>
                      </div>
                      <Badge variant={b.status === 'active' ? 'success' : 'default'}>
                        {b.status === 'active' ? 'Đang tiêu' : 'Đã đóng'}
                      </Badge>
                    </div>
                    
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span style={{ color: 'var(--text-muted)' }}>Đã chi: {fmt(b.spent)}</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                        <div className="h-full rounded-full transition-all duration-500" 
                             style={{ 
                               width: `${Math.min(pct, 100)}%`, 
                               background: pct >= 90 ? 'var(--rose)' : pct >= 70 ? 'var(--amber)' : 'var(--emerald)' 
                             }} 
                        />
                      </div>
                      <p className="text-xs mt-1.5 text-right font-semibold" style={{ color: 'var(--primary-500)' }}>
                        Tổng cấp: {fmt(b.allocated)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ background: 'var(--slate-50)' }}>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Phòng ban</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Kỳ ngân sách</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Tiến độ giải ngân</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Tổng Cấp</th>
                  <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3" style={{ color: 'var(--text-muted)' }}>Trạng thái</th>
                </tr></thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {budgets.map(b => {
                    const pct = (b.spent / Math.max(b.allocated, 1)) * 100;
                    return (
                      <tr key={b.id} className="hover:bg-[var(--slate-25)] transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold">{b.departmentName}</td>
                        <td className="px-5 py-4 text-sm"><Badge>{b.period}</Badge></td>
                        <td className="px-5 py-4">
                          <div className="w-48">
                            <div className="flex justify-between text-xs mb-1.5 font-medium">
                              <span style={{ color: 'var(--text-muted)' }}>{fmt(b.spent)}</span>
                              <span>{pct.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                              <div className="h-full rounded-full transition-all duration-500" 
                                   style={{ 
                                     width: `${Math.min(pct, 100)}%`, 
                                     background: pct >= 90 ? 'var(--rose)' : pct >= 70 ? 'var(--amber)' : 'var(--emerald)' 
                                   }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-right" style={{ color: 'var(--primary-500)' }}>{fmt(b.allocated)}</td>
                        <td className="px-5 py-4 text-center">
                          <Badge variant={b.status === 'active' ? 'success' : 'default'}>
                            {b.status === 'active' ? 'Đang tiêu' : 'Đã đóng'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
