'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Shield, Zap, BarChart3, Users, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Đăng nhập thất bại');
        setIsLoading(false);
        return;
      }

      // Store session info for UI display (JWT cookie is set by API automatically)
      localStorage.setItem('aio-session', JSON.stringify({
        user: data.data.user,
        roles: data.data.roles,
        permissions: data.data.permissions,
      }));

      router.push('/dashboard');
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, title: '16 Phân hệ', desc: 'Hệ sinh thái toàn diện' },
    { icon: Zap, title: 'Real-time', desc: 'Đồng bộ dữ liệu tức thì' },
    { icon: BarChart3, title: 'BI Analytics', desc: 'Báo cáo thông minh' },
    { icon: Users, title: 'RBAC', desc: 'Phân quyền chi tiết' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, var(--primary-950) 0%, var(--primary-800) 50%, hsl(348, 60%, 18%) 100%)',
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-400), transparent)' }}
        />
        <div
          className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, var(--primary-400), transparent)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
                boxShadow: '0 0 24px rgba(200, 40, 60, 0.4)',
              }}
            >
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">AIO.MS</h1>
              <p className="text-white/40 text-xs tracking-[0.2em] uppercase">Enterprise Suite</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Hệ Thống Quản Trị<br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--accent-300), var(--primary-300))',
              }}
            >
              Toàn Diện Doanh Nghiệp
            </span>
          </h2>
          <p className="text-white/50 mt-4 text-base leading-relaxed">
            Kiến tạo lại cấu trúc ADN của doanh nghiệp — minh bạch, linh hoạt
            và sẵn sàng cho quy mô vô hạn. Một chuỗi phản ứng dây chuyền khi
            một sản phẩm ra đời.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
                             hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-white/70" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-white/40 text-xs">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/25 text-xs">
          © 2026 AIO.MS — All-in-One Management System. Khơi Nguồn Thịnh Vượng.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--bg-body)' }}
      >
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))' }}
            >
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-xl font-bold">AIO.MS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Chào mừng trở lại! Nhập thông tin tài khoản để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aio.ms"
                className="
                  w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200
                  border bg-transparent
                  focus:ring-2 focus:border-transparent
                "
                style={{
                  borderColor: 'var(--border-color)',
                  '--tw-ring-color': 'var(--primary-400)',
                } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Mật khẩu
                </label>
                <button type="button" className="text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--primary-500)' }}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
                    w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200
                    border bg-transparent
                    focus:ring-2 focus:border-transparent
                  "
                  style={{
                    borderColor: 'var(--border-color)',
                    '--tw-ring-color': 'var(--primary-400)',
                  } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 accent-[var(--primary-500)]"
                defaultChecked
              />
              <label htmlFor="remember" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Ghi nhớ phiên đăng nhập
              </label>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm animate-scale-in"
                style={{ background: 'var(--rose-light)', color: 'var(--rose)' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                text-white text-sm font-semibold
                transition-all duration-200
                hover:shadow-lg active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              style={{
                background: isLoading
                  ? 'var(--primary-400)'
                  : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                boxShadow: '0 4px 14px rgba(200, 40, 60, 0.3)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Demo Account Hint */}
          <div
            className="mt-6 p-4 rounded-xl border-dashed border text-center"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Demo: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>admin@aio.ms</span> / <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>admin123</span>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary-500)' }}>Điều khoản sử dụng</span>
            {' '}và{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary-500)' }}>Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  );
}
