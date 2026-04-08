'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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
        {/* Ambient Red Gradient — Corporate Identity Background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, hsla(348, 75%, 46%, 0.08) 0%, hsla(348, 75%, 46%, 0.03) 15%, transparent 35%)',
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.04] blur-3xl" style={{
          background: 'radial-gradient(circle, hsl(38, 90%, 50%), transparent 70%)',
        }} />

        <div className="p-6 animate-fade-in relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
