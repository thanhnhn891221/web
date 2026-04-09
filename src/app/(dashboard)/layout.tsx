'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { initTheme } from '@/lib/theme';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize custom theme colors from localStorage
    initTheme();

    // Check saved preference or system preference
    const saved = localStorage.getItem('aio-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('aio-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <Header
        sidebarCollapsed={sidebarCollapsed}
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 relative ${
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
        }`}
      >
        {/* Ambient Gradient — Uses CSS variables for dynamic theming */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, var(--primary-500, hsla(348,75%,46%,1)) 0%, transparent 35%)',
          opacity: 0.06,
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.04] blur-3xl" style={{
          background: 'radial-gradient(circle, var(--accent-500, hsl(38,90%,50%)), transparent 70%)',
        }} />

        <div className="p-6 animate-fade-in relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
