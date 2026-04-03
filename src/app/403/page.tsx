'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { Suspense } from 'react';

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleCode = searchParams.get('module') || 'Unknown';

  const moduleNames: Record<string, string> = {
    CORE: 'Quản trị Hệ thống',
    IMS: 'Quản lý CNTT',
    HMS: 'Quản lý Nhân sự',
    PMS: 'Quản lý Mua hàng',
    WMS: 'Quản lý Kho bãi',
    TMS: 'Quản lý Giao hàng',
    FMS: 'Quản lý Nhà máy',
    QMS: 'Quản lý Chất lượng',
    RMS: 'Nghiên cứu & Phát triển',
    MMS: 'Quản lý Marketing',
    SMS: 'Quản lý Bán hàng',
    OMS: 'Quản lý Đơn hàng',
    DMS: 'Quản lý Phân phối',
    AMS: 'Quản lý Kế toán',
    CMS: 'Quản trị & Kiểm soát',
    BMS: 'BI & Báo cáo',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-main)' }}
    >
      <div
        className="card max-w-md w-full text-center p-8 animate-scale-in"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'hsl(0, 70%, 55%, 0.1)' }}
        >
          <ShieldOff size={40} style={{ color: 'hsl(0, 70%, 55%)' }} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Bạn không có quyền truy cập phân hệ{' '}
          <span className="font-semibold" style={{ color: 'var(--primary-400)' }}>
            {moduleCode} — {moduleNames[moduleCode] || moduleCode}
          </span>
        </p>

        {/* Info */}
        <div
          className="rounded-xl p-4 mb-6 text-left text-sm"
          style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}
        >
          <p className="mb-2">💡 <strong>Cần truy cập?</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <li>Liên hệ quản trị viên (Admin) để được cấp quyền</li>
            <li>Hoặc yêu cầu trưởng phòng gửi đề xuất phân quyền</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md"
            style={{
              background: 'var(--slate-100)',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            }}
          >
            <Home size={16} />
            Trang chính
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="w-8 h-8 border-3 border-t-[var(--primary-500)] border-[var(--border-color)] rounded-full animate-spin" />
      </div>
    }>
      <ForbiddenContent />
    </Suspense>
  );
}
