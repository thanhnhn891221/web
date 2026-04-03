'use client';

import React, { useState } from 'react';
import { Megaphone, Target, TrendingUp, Users, Eye, Calendar, DollarSign, BarChart3, Zap } from 'lucide-react';
import { Button, Badge, Card, StatCard } from '@/components/ui';

const CAMPAIGNS = [
  { id: '1', name: 'Flash Sale Tết Nguyên Đán', channel: 'Facebook + TikTok', budget: 50000000, spent: 42000000, leads: 1250, conversions: 312, status: 'completed', period: '01/01 — 15/02/2026' },
  { id: '2', name: 'Ra mắt Bánh mì Sandwich mới', channel: 'Google Ads + Instagram', budget: 30000000, spent: 18500000, leads: 680, conversions: 145, status: 'active', period: '15/03 — 30/04/2026' },
  { id: '3', name: 'Chương trình Khách hàng Thân thiết', channel: 'Email + SMS', budget: 15000000, spent: 8200000, leads: 420, conversions: 210, status: 'active', period: '01/03 — 31/05/2026' },
  { id: '4', name: 'Quảng bá Nước ép trái cây Mùa hè', channel: 'TikTok + KOL', budget: 80000000, spent: 0, leads: 0, conversions: 0, status: 'planned', period: '01/05 — 30/06/2026' },
  { id: '5', name: 'SEO Website + Content Marketing', channel: 'SEO + Blog', budget: 20000000, spent: 12000000, leads: 890, conversions: 67, status: 'active', period: '01/01 — 31/12/2026' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'default' }> = {
  completed: { label: 'Hoàn thành', variant: 'success' }, active: { label: 'Đang chạy', variant: 'info' }, planned: { label: 'Lên kế hoạch', variant: 'default' },
};

export default function MMSPage() {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const totalBudget = CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
  const totalLeads = CAMPAIGNS.reduce((s, c) => s + c.leads, 0);
  const totalConv = CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(320, 75%, 55%, 0.12)' }}>
            <Megaphone size={22} style={{ color: 'hsl(320, 75%, 55%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MMS — Quản lý Marketing</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chiến dịch, phễu marketing, đa nền tảng</p>
          </div>
        </div>
        <Button icon={Megaphone}>Tạo chiến dịch</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Chiến dịch" value={CAMPAIGNS.filter(c => c.status === 'active').length} icon={Megaphone} color="hsl(320, 75%, 55%)" changeLabel="Đang chạy" />
        <StatCard title="Ngân sách tổng" value={fmt(totalBudget)} icon={DollarSign} color="var(--primary-500)" />
        <StatCard title="Tổng Leads" value={totalLeads.toLocaleString()} icon={Users} color="var(--accent-500)" />
        <StatCard title="Conversions" value={totalConv} icon={Target} color="var(--emerald)" />
      </div>

      <div className="space-y-4 animate-fade-in stagger-children">
        {CAMPAIGNS.map(camp => {
          const st = STATUS_MAP[camp.status];
          const spentPct = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
          const convRate = camp.leads > 0 ? ((camp.conversions / camp.leads) * 100).toFixed(1) : '0';
          return (
            <Card key={camp.id} hover padding="lg" className="group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{camp.name}</h3>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Zap size={12} /> {camp.channel}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {camp.period}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tỷ lệ chuyển đổi</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--emerald)' }}>{convRate}%</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ngân sách</p><p className="text-sm font-bold">{fmt(camp.budget)}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đã chi ({spentPct}%)</p><p className="text-sm font-bold">{fmt(camp.spent)}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Leads</p><p className="text-sm font-bold">{camp.leads.toLocaleString()}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Conversions</p><p className="text-sm font-bold">{camp.conversions}</p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                <div className="h-full rounded-full" style={{ width: `${spentPct}%`, background: spentPct > 90 ? 'var(--rose)' : 'var(--primary-500)' }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
