'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Activity, PieChart, LineChart, Users, Package, ShoppingCart } from 'lucide-react';
import { Card, StatCard, Badge, Button } from '@/components/ui';

// Mock data for UI presentation
const METRICS = [
  { title: "Tổng Doanh Thu Năm", value: "₫24.5B", change: 15.2, icon: DollarSign, color: "var(--emerald)" },
  { title: "Tăng trưởng KH mới", value: "1,245", change: 8.4, icon: Users, color: "var(--primary-500)" },
  { title: "Tỷ lệ chuyển đổi", value: "4.8%", change: -1.2, icon: TrendingUp, color: "var(--amber)" },
  { title: "Lợi nhuận gộp", value: "₫8.2B", change: 12.5, icon: Activity, color: "var(--accent-500)" }
];

const TOP_PRODUCTS = [
  { name: 'Bánh quy vị bơ 200g', revenue: '₫2.4B', growth: '+15%', status: 'trending_up' },
  { name: 'Bánh mì sandwich 400g', revenue: '₫1.8B', growth: '+8%', status: 'stable' },
  { name: 'Nước ép cam tươi 500ml', revenue: '₫1.2B', growth: '+25%', status: 'trending_up' },
  { name: 'Kẹo dẻo trái cây 150g', revenue: '₫850M', growth: '-5%', status: 'trending_down' },
];

export default function BMSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(220, 75%, 55%, 0.12)' }}>
          <BarChart3 size={22} style={{ color: 'hsl(220, 75%, 55%)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BMS — Business Intelligence</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Phân tích dữ liệu đa chiều, báo cáo quản trị chuyên sâu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {METRICS.map((metric, idx) => (
          <StatCard
            key={idx}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-children">
        {/* Placeholder for complex charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg" className="h-80 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><LineChart size={18}/> Xu hướng Doanh thu & Lợi nhuận</h2>
              <select className="text-sm border-none bg-transparent outline-none cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <option>Năm 2026</option>
                <option>Năm 2025</option>
              </select>
            </div>
            <div className="flex-1 flex items-center justify-center opacity-50 bg-[var(--slate-50)] rounded-xl border border-dashed border-[var(--border-color)]">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Khu vực biểu đồ phân tích xu hướng (Line Chart)</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg" className="h-64 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base flex items-center gap-2"><PieChart size={18}/> Cơ cấu Chi phí</h2>
              </div>
              <div className="flex-1 flex items-center justify-center opacity-50 bg-[var(--slate-50)] rounded-xl border border-dashed border-[var(--border-color)]">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Biểu đồ tròn (Pie Chart)</p>
              </div>
            </Card>

            <Card padding="lg" className="h-64 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base flex items-center gap-2"><BarChart3 size={18}/> Phân bổ Kênh bán</h2>
              </div>
              <div className="flex-1 flex items-center justify-center opacity-50 bg-[var(--slate-50)] rounded-xl border border-dashed border-[var(--border-color)]">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Biểu đồ cột (Bar Chart)</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-semibold text-lg flex items-center gap-2"><Package size={18}/> Top Sản phẩm Doanh thu</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {TOP_PRODUCTS.map((prod, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[var(--slate-25)] transition-colors">
                  <div>
                    <h3 className="text-sm font-medium">{prod.name}</h3>
                    <p className="text-xs mt-1 font-semibold">{prod.revenue}</p>
                  </div>
                  <Badge variant={prod.status === 'trending_up' ? 'success' : prod.status === 'trending_down' ? 'danger' : 'default'}>
                    {prod.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg" className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white">
            <h3 className="font-semibold text-lg max-w-[200px]">AI Insight & Báo cáo Tự động</h3>
            <p className="text-sm mt-3 text-white/80 line-clamp-3">
              Mô hình học máy dự báo nhu cầu sản phẩm "Nước ép cam tươi" sẽ tăng vọt vào 2 tháng tới. Ước tính cần dự trữ thêm 30% nguyên liệu.
            </p>
            <Button variant="outline" className="mt-4 bg-white/20 border-white/30 hover:bg-white/30 border-transparent text-white w-full">Xem chi tiết báo cáo AI</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
