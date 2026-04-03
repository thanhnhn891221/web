'use client';

import React from 'react';
import { Lightbulb, FlaskConical, FileText, Users, Clock, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { Button, Badge, Card, StatCard } from '@/components/ui';

const PROJECTS = [
  { id: '1', code: 'RD-001', name: 'Công thức Bánh quy Socola Đen', phase: 'testing', lead: 'Nguyễn Hữu Trí', team: 3, progress: 75, deadline: '2026-04-15', budget: 25000000 },
  { id: '2', code: 'RD-002', name: 'Dòng Nước ép Cold-Pressed', phase: 'research', lead: 'Trần Thị Ngọc', team: 2, progress: 30, deadline: '2026-05-30', budget: 45000000 },
  { id: '3', code: 'RD-003', name: 'Bao bì Eco-Friendly 100% phân hủy', phase: 'prototype', lead: 'Lê Đức Anh', team: 4, progress: 55, deadline: '2026-06-01', budget: 60000000 },
  { id: '4', code: 'RD-004', name: 'Kẹo dẻo Vitamin C cho trẻ em', phase: 'completed', lead: 'Phạm Thị Hà', team: 3, progress: 100, deadline: '2026-03-20', budget: 18000000 },
  { id: '5', code: 'RD-005', name: 'Dòng Snack Protein Bar', phase: 'concept', lead: 'Nguyễn Hữu Trí', team: 1, progress: 10, deadline: '2026-07-01', budget: 35000000 },
];

const PHASE_MAP: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success'; icon: React.ElementType }> = {
  concept: { label: 'Ý tưởng', variant: 'default', icon: Lightbulb },
  research: { label: 'Nghiên cứu', variant: 'info', icon: FlaskConical },
  prototype: { label: 'Tạo mẫu', variant: 'warning', icon: Target },
  testing: { label: 'Thử nghiệm', variant: 'warning', icon: AlertTriangle },
  completed: { label: 'Hoàn thành', variant: 'success', icon: CheckCircle },
};

export default function RMSPage() {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const active = PROJECTS.filter(p => p.phase !== 'completed').length;
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(45, 90%, 50%, 0.12)' }}>
            <Lightbulb size={22} style={{ color: 'hsl(45, 90%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RMS — Nghiên cứu & Phát triển</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Đổi mới sáng tạo, tạo mẫu, quản lý dự án R&D</p>
          </div>
        </div>
        <Button icon={Lightbulb}>Tạo dự án R&D</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Dự án đang chạy" value={active} icon={FlaskConical} color="hsl(45, 90%, 50%)" />
        <StatCard title="Hoàn thành" value={PROJECTS.filter(p => p.phase === 'completed').length} icon={CheckCircle} color="var(--emerald)" />
        <StatCard title="Tổng ngân sách" value={fmt(totalBudget)} icon={FileText} color="var(--primary-500)" />
        <StatCard title="Nhân sự R&D" value={PROJECTS.reduce((s, p) => s + p.team, 0)} icon={Users} color="var(--accent-500)" />
      </div>

      <div className="space-y-4 animate-fade-in stagger-children">
        {PROJECTS.map(proj => {
          const phase = PHASE_MAP[proj.phase];
          const PhaseIcon = phase.icon;
          return (
            <Card key={proj.id} hover padding="lg" className="group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--primary-500)' }}>{proj.code}</span>
                    <Badge variant={phase.variant} icon={PhaseIcon}>{phase.label}</Badge>
                  </div>
                  <h3 className="text-base font-semibold mt-1.5">{proj.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Users size={12} /> {proj.lead} + {proj.team - 1} người</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Hạn: {new Date(proj.deadline).toLocaleDateString('vi-VN')}</span>
                    <span>Ngân sách: {fmt(proj.budget)}</span>
                  </div>
                </div>
                <span className="text-2xl font-bold" style={{ color: proj.progress === 100 ? 'var(--emerald)' : 'var(--primary-500)' }}>{proj.progress}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--slate-100)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${proj.progress}%`, background: proj.progress === 100 ? 'var(--emerald)' : `linear-gradient(90deg, var(--primary-500), var(--accent-500))` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
