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
        className="pt-16 min-h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
        }}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
