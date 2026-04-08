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

          {/* Center Graphic: AIO.MS Network Node */}
        <div className="relative z-10 my-auto flex items-center justify-center h-[500px]">
           {/* Center Glowing Core */}
           <div className="relative flex items-center justify-center w-32 h-32 z-20">
              <div className="absolute inset-0 rounded-2xl rotate-45 bg-[var(--primary-600)] shadow-[0_0_50px_var(--primary-600)] animate-pulse" />
              <div className="absolute inset-2 rounded-xl rotate-45 bg-gradient-to-br from-yellow-400 to-yellow-600" />
              <div className="absolute inset-2.5 rounded-xl rotate-45 bg-[var(--primary-900)] flex items-center justify-center">
                 <div className="-rotate-45 text-center px-1">
                    <p className="text-white font-black text-xl leading-none tracking-tight">AIO.MS</p>
                    <p className="text-[#FFD700] text-[8px] mt-0.5 tracking-widest">ECOSYSTEM</p>
                 </div>
              </div>
           </div>

           {/* 17 Satellite Nodes around the center */}
           {[...Array(17)].map((_, i) => {
              const totalNodes = 17;
              const angle = (i * (360 / totalNodes)) * (Math.PI / 180);
              const radius = i % 2 === 0 ? 140 : 200; // alternates distance
              
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                 <React.Fragment key={i}>
                    {/* Connecting Line */}
                    <div 
                       className="absolute h-px bg-gradient-to-r from-[var(--primary-500)] to-transparent opacity-40 origin-left"
                       style={{ 
                          width: `${radius}px`, 
                          top: '50%', left: '50%', 
                          transform: `rotate(${i * (360 / totalNodes)}deg)` 
                       }} 
                    />
                    
                    {/* Satellite Node */}
                    <div 
                       className="absolute w-8 h-8 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md border border-[var(--primary-500)] shadow-lg"
                       style={{ 
                          top: `calc(50% + ${y}px - 16px)`, 
                          left: `calc(50% + ${x}px - 16px)`,
                          animation: `pulse-slow 3s infinite ${i * 0.2}s`
                       }}
                    >
                       <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_10px_#FFD700]" />
                    </div>
                 </React.Fragment>
              );
           })}
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
