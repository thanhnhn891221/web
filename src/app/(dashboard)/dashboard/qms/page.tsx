'use client';

import React, { useState } from 'react';
import {
  CheckCircle, Search, AlertTriangle, FileText, ClipboardCheck,
  BarChart3, Shield, Eye, Calendar, User, Clock
} from 'lucide-react';
import { Button, Badge, Card, Modal, StatCard } from '@/components/ui';

interface QualityCheck {
  id: string;
  code: string;
  product: string;
  batch: string;
  type: 'incoming' | 'in_process' | 'final' | 'customer_return';
  inspector: string;
  result: 'passed' | 'failed' | 'pending' | 'conditional';
  defectRate: number;
  checkedAt: string;
  criteria: { name: string; standard: string; actual: string; pass: boolean }[];
  note?: string;
}

const CHECKS: QualityCheck[] = [
  { id: '1', code: 'QC-001', product: 'Bánh quy vị bơ 200g', batch: 'LSX-001-B3', type: 'in_process', inspector: 'Ngô Thị Lan Anh', result: 'passed', defectRate: 0.3, checkedAt: '2026-03-31T14:30:00', criteria: [{ name: 'Trọng lượng', standard: '200 ± 5g', actual: '201g', pass: true }, { name: 'Độ ẩm', standard: '< 4%', actual: '3.2%', pass: true }, { name: 'Màu sắc', standard: 'Vàng nhạt đồng đều', actual: 'Đạt', pass: true }] },
  { id: '2', code: 'QC-002', product: 'Đường tinh luyện', batch: 'NVL-PO2026001', type: 'incoming', inspector: 'Trần Quốc Hùng', result: 'passed', defectRate: 0, checkedAt: '2026-03-31T09:00:00', criteria: [{ name: 'Độ tinh khiết', standard: '≥ 99.5%', actual: '99.7%', pass: true }, { name: 'Màu sắc (ICUMSA)', standard: '< 45', actual: '38', pass: true }] },
  { id: '3', code: 'QC-003', product: 'Bánh mì sandwich 400g', batch: 'LSX-002-B1', type: 'final', inspector: 'Ngô Thị Lan Anh', result: 'conditional', defectRate: 2.1, checkedAt: '2026-03-31T16:00:00', criteria: [{ name: 'Trọng lượng', standard: '400 ± 10g', actual: '405g', pass: true }, { name: 'Nhãn mác', standard: 'Đầy đủ, rõ nét', actual: 'Nhòe ở 2.1% SP', pass: false }], note: 'Lô hàng chấp nhận có điều kiện — yêu cầu in lại nhãn 52 sản phẩm' },
  { id: '4', code: 'QC-004', product: 'Kẹo dẻo trái cây 150g', batch: 'LSX-003-PRE', type: 'incoming', inspector: 'Phạm Ngọc Hân', result: 'failed', defectRate: 8.5, checkedAt: '2026-03-30T11:00:00', criteria: [{ name: 'Hàm lượng gelatin', standard: '15-18%', actual: '12.3%', pass: false }, { name: 'Vi sinh', standard: 'Đạt TCVN', actual: 'E.Coli vượt ngưỡng', pass: false }], note: 'KHÔNG CHẤP NHẬN — Trả nhà cung cấp NCC-003' },
  { id: '5', code: 'QC-005', product: 'Nước ép cam 500ml', batch: 'LSX-004-F', type: 'final', inspector: 'Trần Quốc Hùng', result: 'passed', defectRate: 0.1, checkedAt: '2026-03-31T08:00:00', criteria: [{ name: 'pH', standard: '3.5-4.0', actual: '3.7', pass: true }, { name: 'Độ Brix', standard: '11-13', actual: '12.1', pass: true }, { name: 'Seal', standard: 'Kín hoàn toàn', actual: 'Đạt', pass: true }] },
];

const TYPE_MAP: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' }> = {
  incoming: { label: 'Nguyên liệu đầu vào', variant: 'info' },
  in_process: { label: 'Trong quá trình SX', variant: 'warning' },
  final: { label: 'Thành phẩm cuối', variant: 'success' },
  customer_return: { label: 'Hàng trả lại', variant: 'danger' },
};

const RESULT_MAP: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default'; icon: React.ElementType }> = {
  passed: { label: 'ĐẠT', variant: 'success', icon: CheckCircle },
  failed: { label: 'KHÔNG ĐẠT', variant: 'danger', icon: AlertTriangle },
  conditional: { label: 'CÓ ĐIỀU KIỆN', variant: 'warning', icon: Shield },
  pending: { label: 'Đang kiểm', variant: 'default', icon: Clock },
};

export default function QMSPage() {
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null);
  const passed = CHECKS.filter(c => c.result === 'passed').length;
  const failed = CHECKS.filter(c => c.result === 'failed').length;
  const avgDefect = (CHECKS.reduce((s, c) => s + c.defectRate, 0) / CHECKS.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(152, 60%, 42%, 0.12)' }}>
            <ClipboardCheck size={22} style={{ color: 'hsl(152, 60%, 42%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QMS — Quản lý Chất lượng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kiểm duyệt QA/QC, tiêu chuẩn sản phẩm</p>
          </div>
        </div>
        <Button icon={ClipboardCheck}>Tạo phiếu kiểm</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Tổng phiếu kiểm" value={CHECKS.length} icon={FileText} color="var(--primary-500)" />
        <StatCard title="Đạt chất lượng" value={passed} icon={CheckCircle} color="var(--emerald)" />
        <StatCard title="Không đạt" value={failed} icon={AlertTriangle} color="var(--rose)" />
        <StatCard title="Tỷ lệ lỗi TB" value={`${avgDefect}%`} icon={BarChart3} color="var(--amber)" />
      </div>

      <div className="space-y-3 animate-fade-in">
        {CHECKS.map(check => {
          const result = RESULT_MAP[check.result];
          const type = TYPE_MAP[check.type];
          const ResultIcon = result.icon;
          return (
            <Card key={check.id} hover padding="lg" className="group cursor-pointer" onClick={() => setSelectedCheck(check)}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}
                  style={{ background: check.result === 'passed' ? 'var(--emerald-light)' : check.result === 'failed' ? 'var(--rose-light)' : 'var(--amber-light)' }}>
                  <ResultIcon size={20} style={{ color: check.result === 'passed' ? 'var(--emerald)' : check.result === 'failed' ? 'var(--rose)' : 'var(--amber)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--primary-500)' }}>{check.code}</span>
                      <Badge variant={type.variant}>{type.label}</Badge>
                    </div>
                    <Badge variant={result.variant} icon={ResultIcon}>{result.label}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold mt-1.5">{check.product}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><FileText size={12} /> Lô: {check.batch}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {check.inspector}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(check.checkedAt).toLocaleString('vi-VN')}</span>
                    <span>Lỗi: <strong style={{ color: check.defectRate > 2 ? 'var(--rose)' : 'var(--text-primary)' }}>{check.defectRate}%</strong></span>
                  </div>
                  {check.note && (
                    <p className="mt-2 text-xs px-3 py-1.5 rounded-lg inline-block"
                      style={{ background: check.result === 'failed' ? 'var(--rose-light)' : 'var(--amber-light)', color: check.result === 'failed' ? 'var(--rose)' : 'var(--amber)' }}>
                      {check.note}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={!!selectedCheck} onClose={() => setSelectedCheck(null)}
        title={`Phiếu kiểm ${selectedCheck?.code}`} description={selectedCheck?.product} size="lg"
        footer={<Button variant="ghost" onClick={() => setSelectedCheck(null)}>Đóng</Button>}>
        {selectedCheck && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Kết quả', value: RESULT_MAP[selectedCheck.result].label },
                { label: 'Loại kiểm tra', value: TYPE_MAP[selectedCheck.type].label },
                { label: 'Tỷ lệ lỗi', value: `${selectedCheck.defectRate}%` },
                { label: 'Người kiểm', value: selectedCheck.inspector },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl" style={{ background: 'var(--slate-50)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                  <p className="text-sm font-semibold mt-1">{f.value}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Tiêu chí kiểm tra</h4>
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--slate-50)' }}>
                      {['Tiêu chí', 'Tiêu chuẩn', 'Thực tế', 'Kết quả'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold uppercase px-4 py-2" style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {selectedCheck.criteria.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-sm font-medium">{c.name}</td>
                        <td className="px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{c.standard}</td>
                        <td className="px-4 py-2.5 text-sm font-semibold">{c.actual}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={c.pass ? 'success' : 'danger'}>{c.pass ? 'Đạt' : 'Không đạt'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
