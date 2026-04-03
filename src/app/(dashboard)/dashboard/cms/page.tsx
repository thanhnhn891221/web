'use client';

import React from 'react';
import { Gauge, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, ShieldAlert, Target, BarChart3 } from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/ui';

const KPIs = [
  { name: 'Doanh thu thuần', value: '₫2.4B', target: '₫2.5B', pct: 96, trend: 'up' as const, status: 'good' },
  { name: 'Giá vốn hàng bán', value: '₫1.6B', target: '₫1.5B', pct: 107, trend: 'down' as const, status: 'warning' },
  { name: 'Lợi nhuận gộp', value: '₫800M', target: '₫1B', pct: 80, trend: 'down' as const, status: 'warning' },
  { name: 'Chi phí quản lý', value: '₫350M', target: '₫400M', pct: 87, trend: 'up' as const, status: 'good' },
  { name: 'Lợi nhuận ròng', value: '₫680M', target: '₫750M', pct: 91, trend: 'up' as const, status: 'good' },
  { name: 'ROI Marketing', value: '320%', target: '250%', pct: 128, trend: 'up' as const, status: 'excellent' },
];

const RISKS = [
  { id: '1', risk: 'Giá NVL biến động tăng 15% so cùng kỳ', impact: 'high', probability: 'likely', mitigation: 'Ký HĐ dài hạn với NCC, tìm NCC thay thế', status: 'monitoring' },
  { id: '2', risk: 'Dây chuyền SX #5 hỏng, ngưng hoạt động', impact: 'high', probability: 'possible', mitigation: 'Bảo trì phòng ngừa, mua bảo hiểm thiết bị', status: 'mitigated' },
  { id: '3', risk: 'Thanh khoản thấp — tỷ lệ Quick Ratio < 1', impact: 'medium', probability: 'unlikely', mitigation: 'Giảm tồn kho, đẩy nhanh thu công nợ', status: 'accepted' },
  { id: '4', risk: 'Mất khách hàng lớn (CoopMart) do cạnh tranh giá', impact: 'high', probability: 'possible', mitigation: 'Chương trình loyalty, ưu đãi volume', status: 'monitoring' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  excellent: { label: 'Xuất sắc', variant: 'success' }, good: { label: 'Tốt', variant: 'success' },
  warning: { label: 'Cảnh báo', variant: 'warning' },
};

const RISK_IMPACT: Record<string, { label: string; variant: 'danger' | 'warning' | 'default' }> = {
  high: { label: 'Cao', variant: 'danger' }, medium: { label: 'Trung bình', variant: 'warning' }, low: { label: 'Thấp', variant: 'default' },
};

const RISK_STATUS: Record<string, { label: string; variant: 'warning' | 'success' | 'default' }> = {
  monitoring: { label: 'Theo dõi', variant: 'warning' }, mitigated: { label: 'Đã xử lý', variant: 'success' }, accepted: { label: 'Chấp nhận', variant: 'default' },
};

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(0, 70%, 55%, 0.12)' }}>
          <Gauge size={22} style={{ color: 'hsl(0, 70%, 55%)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CMS — Quản trị & Kiểm soát</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kiểm soát rủi ro, ngân sách, KPI tài chính</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Biên LN gộp" value="33.3%" icon={TrendingUp} color="var(--emerald)" />
        <StatCard title="Biên LN ròng" value="28.3%" icon={DollarSign} color="var(--primary-500)" />
        <StatCard title="Rủi ro cao" value={RISKS.filter(r => r.impact === 'high').length} icon={AlertTriangle} color="var(--rose)" />
        <StatCard title="KPIs đạt mục tiêu" value={`${KPIs.filter(k => k.status !== 'warning').length}/${KPIs.length}`} icon={Target} color="var(--accent-500)" />
      </div>

      <h2 className="text-lg font-semibold">KPI Tài chính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
        {KPIs.map(kpi => {
          const st = STATUS_MAP[kpi.status];
          return (
            <Card key={kpi.name} hover padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.name}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Mục tiêu: {kpi.target}</span>
                  <span className="font-semibold flex items-center gap-1" style={{ color: kpi.trend === 'up' ? 'var(--emerald)' : 'var(--rose)' }}>
                    {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {kpi.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(kpi.pct, 100)}%`, background: kpi.status === 'warning' ? 'var(--amber)' : 'var(--emerald)' }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mt-2">Ma trận Rủi ro</h2>
      <div className="space-y-3 animate-fade-in">
        {RISKS.map(risk => {
          const impact = RISK_IMPACT[risk.impact];
          const rStatus = RISK_STATUS[risk.status];
          return (
            <Card key={risk.id} hover padding="lg">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: risk.impact === 'high' ? 'var(--rose-light)' : 'var(--amber-light)' }}>
                  <ShieldAlert size={18} style={{ color: risk.impact === 'high' ? 'var(--rose)' : 'var(--amber)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{risk.risk}</p>
                    <Badge variant={impact.variant}>Tác động {impact.label}</Badge>
                    <Badge variant={rStatus.variant}>{rStatus.label}</Badge>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Biện pháp: {risk.mitigation}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
