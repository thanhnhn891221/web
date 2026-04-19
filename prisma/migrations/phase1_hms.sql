-- ============================================================
-- PHASE 1: HMS — Nhân sự mở rộng
-- Chạy trên Supabase SQL Editor
-- ============================================================
-- Bao gồm: Ca làm, Chấm công, Nghỉ phép, Lương thưởng,
--           Lộ trình thăng tiến, Thành tích/KPI
-- ============================================================

-- Mở rộng bảng departments (thêm cột nếu chưa có)
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Mở rộng bảng employees (thêm các trường HR cần thiết)
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "gender" TEXT DEFAULT 'other';
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "idNumber" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "bankAccount" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "taxCode" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "insuranceCode" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "contractType" TEXT DEFAULT 'permanent';
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "contractEndDate" TIMESTAMP;

-- ─── 1. Ca làm (Work Shifts) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "work_shifts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,         -- "08:00"
    "endTime" TEXT NOT NULL,           -- "17:00"
    "breakMinutes" INTEGER NOT NULL DEFAULT 60,
    "workingHours" FLOAT NOT NULL DEFAULT 8,
    "color" TEXT DEFAULT '#3B82F6',
    "isOvernight" BOOLEAN NOT NULL DEFAULT false,  -- Ca đêm qua ngày
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_shifts_code_key" UNIQUE ("code")
);
CREATE INDEX IF NOT EXISTS "work_shifts_code_idx" ON "work_shifts"("code");

-- ─── 2. Chấm công (Attendances) ──────────────────────────
CREATE TABLE IF NOT EXISTS "attendances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP,
    "checkOut" TIMESTAMP,
    "checkInMethod" TEXT DEFAULT 'manual',  -- manual, fingerprint, face, gps
    "checkInLocation" TEXT,                 -- GPS coordinates or location name
    "workingHours" FLOAT DEFAULT 0,
    "overtimeHours" FLOAT DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'present',  -- present, absent, late, early_leave, on_leave, holiday
    "note" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE,
    CONSTRAINT "attendances_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "work_shifts"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "attendances_employeeId_idx" ON "attendances"("employeeId");
CREATE INDEX IF NOT EXISTS "attendances_date_idx" ON "attendances"("date");
CREATE INDEX IF NOT EXISTS "attendances_status_idx" ON "attendances"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "attendances_employee_date_uniq" ON "attendances"("employeeId", "date");

-- ─── 3. Quản lý nghỉ phép (Leave Requests) ───────────────
CREATE TABLE IF NOT EXISTS "leave_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'annual',  -- annual, sick, maternity, unpaid, compassionate, other
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" FLOAT NOT NULL DEFAULT 1,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, cancelled
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leave_requests_code_key" UNIQUE ("code"),
    CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "leave_requests_employeeId_idx" ON "leave_requests"("employeeId");
CREATE INDEX IF NOT EXISTS "leave_requests_status_idx" ON "leave_requests"("status");

-- Bảng phụ: Số ngày phép theo năm của từng NV
CREATE TABLE IF NOT EXISTS "leave_balances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'annual',
    "totalDays" FLOAT NOT NULL DEFAULT 12,
    "usedDays" FLOAT NOT NULL DEFAULT 0,
    "remainingDays" FLOAT NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "leave_balances_emp_year_type_uniq" ON "leave_balances"("employeeId", "year", "type");

-- ─── 4. Lương thưởng (Payroll Records) ───────────────────
CREATE TABLE IF NOT EXISTS "payroll_records" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,               -- "2026-04", "2026-03"
    "baseSalary" FLOAT NOT NULL DEFAULT 0,
    "allowances" FLOAT NOT NULL DEFAULT 0,     -- Phụ cấp
    "overtime" FLOAT NOT NULL DEFAULT 0,       -- Tiền tăng ca
    "bonus" FLOAT NOT NULL DEFAULT 0,          -- Thưởng
    "deductions" FLOAT NOT NULL DEFAULT 0,     -- Khấu trừ (BHXH, BHYT, thuế...)
    "socialInsurance" FLOAT NOT NULL DEFAULT 0,
    "healthInsurance" FLOAT NOT NULL DEFAULT 0,
    "personalTax" FLOAT NOT NULL DEFAULT 0,
    "netSalary" FLOAT NOT NULL DEFAULT 0,      -- Thực nhận
    "workingDays" FLOAT NOT NULL DEFAULT 0,
    "paidLeave" FLOAT NOT NULL DEFAULT 0,
    "unpaidLeave" FLOAT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',   -- draft, calculated, approved, paid
    "paidAt" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payroll_records_code_key" UNIQUE ("code"),
    CONSTRAINT "payroll_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "payroll_records_employeeId_idx" ON "payroll_records"("employeeId");
CREATE INDEX IF NOT EXISTS "payroll_records_period_idx" ON "payroll_records"("period");
CREATE INDEX IF NOT EXISTS "payroll_records_status_idx" ON "payroll_records"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_records_emp_period_uniq" ON "payroll_records"("employeeId", "period");

-- ─── 5. Lộ trình thăng tiến (Career Paths) ───────────────
CREATE TABLE IF NOT EXISTS "career_paths" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL,
    "currentPosition" TEXT NOT NULL,
    "currentLevel" TEXT,
    "targetPosition" TEXT NOT NULL,
    "targetLevel" TEXT,
    "targetDate" TIMESTAMP,
    "requirements" TEXT,           -- Yêu cầu để đạt được
    "progress" INTEGER NOT NULL DEFAULT 0,  -- 0-100%
    "status" TEXT NOT NULL DEFAULT 'active',  -- active, completed, paused
    "mentorId" TEXT,               -- Người hướng dẫn
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "career_paths_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "career_paths_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "career_paths_employeeId_idx" ON "career_paths"("employeeId");

-- ─── 6. Quản lý thành tích (Achievements / KPI) ──────────
CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'kpi',  -- kpi, award, certificate, disciplinary
    "category" TEXT,                     -- sales, quality, innovation, attendance...
    "period" TEXT,                       -- "Q1/2026", "2026"
    "targetValue" FLOAT,
    "actualValue" FLOAT,
    "score" FLOAT,                       -- Điểm đánh giá (0-100 hoặc 1-5)
    "rating" TEXT,                       -- A, B, C, D hoặc Xuất sắc, Giỏi, Khá, TB
    "awardAmount" FLOAT DEFAULT 0,       -- Tiền thưởng kèm theo
    "description" TEXT,
    "evidenceUrl" TEXT,                  -- Link minh chứng
    "evaluatedBy" TEXT,
    "evaluatedAt" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "achievements_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "achievements_employeeId_idx" ON "achievements"("employeeId");
CREATE INDEX IF NOT EXISTS "achievements_type_idx" ON "achievements"("type");

-- ============================================================
-- ✅ Phase 1 hoàn tất — 7 bảng mới + 2 bảng mở rộng
-- ============================================================
