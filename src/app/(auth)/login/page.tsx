'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Shield, Network, Database, Layers } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Brand Panel — Shown on Left for Desktop, Top for Mobile */}
      <div
        className="w-full lg:w-[55%] relative overflow-hidden flex flex-col justify-between p-6 lg:p-12 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%)',
          minHeight: 'min(400px, 45vh)'
        }}
      >
        {/* Background Decoratives */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 bg-accent-500 blur-3xl" />
        
        {/* Mobile: Dynamic "Connected Nodes" Graphic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 lg:opacity-50 pointer-events-none">
          <div className="relative w-full h-full max-w-md max-h-md flex items-center justify-center">
             {/* Center Node */}
             <div className="absolute w-24 h-24 rounded-full border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                   <div className="w-8 h-8 rounded-full bg-accent-500 shadow-[0_0_20px_var(--accent-500)]" />
                </div>
             </div>
             {/* Orbiting Nodes (CSS Simulation) */}
             {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div key={i} className="absolute w-full h-[1px] bg-white/10 transform origin-center" style={{ rotate: `${deg}deg` }}>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80 shadow-[0_0_10px_white]" />
                </div>
             ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-center lg:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white shadow-xl">
              <span className="font-black text-xl lg:text-2xl" style={{ color: 'var(--primary-600)' }}>A</span>
            </div>
            <div>
              <h1 className="text-white text-2xl lg:text-3xl font-bold tracking-tight leading-none">AIO.MS</h1>
              <p className="text-white/60 text-[10px] lg:text-xs tracking-[0.2em] uppercase mt-1">Enterprise Suite</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="mt-8 mb-4 lg:mt-auto lg:mb-auto max-w-xl">
            <h2 className="text-2xl lg:text-5xl font-bold text-white leading-tight">
              Hệ Sinh Thái<br className="hidden lg:block"/> Mạng Lưới
            </h2>
            <p className="text-white/80 mt-2 lg:mt-4 text-xs lg:text-base leading-relaxed">
              Trạm điều khiển trung tâm kết nối <strong style={{ color: 'var(--accent-400)' }}>17 phân hệ</strong> độc lập. Quản trị toàn diện từ một điểm duy nhất.
            </p>

            {/* Module Groups - Hidden on very small screens to save space, but visible on md/lg */}
            <div className="hidden sm:grid mt-8 grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { name: 'HỆ THỐNG', desc: 'Core & Gateway', icon: Shield },
                 { name: 'VẬN HÀNH', desc: 'Sản xuất & Kho', icon: Database },
                 { name: 'THỊ TRƯỜNG', desc: 'Bán hàng & MKT', icon: Network },
                 { name: 'HỖ TRỢ', desc: 'Nhân sự & Kế toán', icon: Layers },
               ].map((mod, idx) => (
                 <div key={idx} className="flex flex-col items-center bg-black/20 backdrop-blur-md p-3 lg:p-4 rounded-xl border border-white/10">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--accent-500)', color: 'var(--primary-900)' }}>
                       <mod.icon size={16} />
                    </div>
                    <p className="text-white font-bold text-[10px] lg:text-xs text-center">{mod.name}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Footer - Hidden on mobile */}
          <div className="hidden lg:block relative z-10 text-white/40 text-xs">
            <p>© 2026 AIO.MS. Phát triển cho quy mô vô hạn.</p>
          </div>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/50 backdrop-blur-3xl -mt-6 lg:mt-0 lg:rounded-none rounded-t-3xl relative z-20">
        <div className="w-full max-w-sm animate-slide-left">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--slate-900)' }}>Đăng nhập</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Truy cập vào hệ sinh thái.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--slate-700)' }}>Email doanh nghiệp</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aio.ms"
                className="w-full px-4 py-3 rounded-xl text-base md:text-sm outline-none transition-all duration-200 border bg-slate-50 focus:ring-2 focus:border-transparent focus:bg-white"
                style={{ borderColor: 'var(--border-color)', '--tw-ring-color': 'var(--primary-400)' } as React.CSSProperties}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: 'var(--slate-700)' }}>Mật khẩu</label>
                <button type="button" className="text-[11px] font-semibold hover:underline" style={{ color: 'var(--primary-500)' }}>Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-base md:text-sm outline-none transition-all duration-200 border bg-slate-50 focus:ring-2 focus:border-transparent focus:bg-white"
                  style={{ borderColor: 'var(--border-color)', '--tw-ring-color': 'var(--primary-400)' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300" style={{ accentColor: 'var(--primary-500)' }} defaultChecked />
              <label htmlFor="remember" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Duy trì đăng nhập</label>
            </div>

            {error && (
              <div className="px-4 py-2.5 rounded-xl text-xs animate-scale-in text-center font-medium" style={{ background: 'var(--rose-light)', color: 'var(--rose)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: isLoading ? 'var(--primary-400)' : 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
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
                  Nhập Cổng Hệ Thống
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-slate-400 lg:hidden">© 2026 AIO.MS — Enterprise System</p>
        </div>
      </div>
    </div>
  );
}
