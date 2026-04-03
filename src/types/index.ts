// AIO.MS - Core Type Definitions
// Shared across all 16 modules

// ============================================
// Authentication & Authorization
// ============================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  departmentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

// ============================================
// Organization Structure (HMS Foundation)
// ============================================

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. 'HR', 'IT', 'SALE'
  parentId?: string;
  managerId?: string;
  description?: string;
  employeeCount: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  userId?: string;
  employeeCode: string; // e.g. 'NV-001'
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  departmentId: string;
  departmentName?: string;
  position: string;
  level?: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director';
  hireDate: Date;
  status: 'active' | 'probation' | 'on_leave' | 'resigned';
  salary?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Module System
// ============================================

export interface ModuleInfo {
  id: string;
  code: string; // e.g. 'HMS', 'IMS', 'SMS'...
  name: string;
  nameVi: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // HSL color
  href: string;
  group: 'foundation' | 'operations' | 'market' | 'finance';
  isEnabled: boolean;
  order: number;
}

// ============================================
// API Response Standard
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Common UI Types
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: number; // percentage
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'accent' | 'emerald' | 'amber' | 'rose' | 'sky';
}

// ============================================
// Audit & IMS Foundation
// ============================================

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';
  module: string;
  target: string;
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}
