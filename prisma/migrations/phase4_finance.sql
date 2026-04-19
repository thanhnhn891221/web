-- ============================================================
-- PHASE 4: Tài chính & Kế toán (AMS + BMS mở rộng)
-- Chạy trên Supabase SQL Editor
-- ============================================================

-- ─── 1. Bút toán kế toán (Accounting Entries) ────────────
CREATE TABLE IF NOT EXISTS "accounting_entries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "type" TEXT NOT NULL DEFAULT 'general',  -- general, revenue, expense, payable, receivable
    "accountDebit" TEXT NOT NULL,             -- Tài khoản Nợ (e.g. "111", "131")
    "accountCredit" TEXT NOT NULL,            -- Tài khoản Có
    "amount" FLOAT NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "refType" TEXT,                           -- invoice, purchase_order, payroll, manual
    "refId" TEXT,                             -- ID chứng từ gốc
    "refCode" TEXT,                           -- Mã chứng từ gốc
    "currency" TEXT DEFAULT 'VND',
    "exchangeRate" FLOAT DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',  -- draft, posted, voided
    "postedBy" TEXT,
    "postedAt" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "accounting_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "accounting_entries_code_key" UNIQUE ("code")
);
CREATE INDEX IF NOT EXISTS "accounting_entries_type_idx" ON "accounting_entries"("type");
CREATE INDEX IF NOT EXISTS "accounting_entries_date_idx" ON "accounting_entries"("date");
CREATE INDEX IF NOT EXISTS "accounting_entries_status_idx" ON "accounting_entries"("status");

-- ─── 2. Phiếu thu / Phiếu chi (Cash Flows) ──────────────
CREATE TABLE IF NOT EXISTS "cash_flows" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,                    -- receipt (thu), payment (chi)
    "category" TEXT,                         -- sales, purchase, salary, utility, other
    "amount" FLOAT NOT NULL DEFAULT 0,
    "paymentMethod" TEXT DEFAULT 'cash',    -- cash, transfer, card
    "bankAccount" TEXT,
    "counterpartyName" TEXT,                -- Tên KH/NCC/NV
    "counterpartyId" TEXT,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "accountingEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, completed, cancelled
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP,
    "note" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "cash_flows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cash_flows_code_key" UNIQUE ("code"),
    CONSTRAINT "cash_flows_accountingEntryId_fkey" FOREIGN KEY ("accountingEntryId") REFERENCES "accounting_entries"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "cash_flows_type_idx" ON "cash_flows"("type");
CREATE INDEX IF NOT EXISTS "cash_flows_date_idx" ON "cash_flows"("date");

-- ─── 3. Phân bổ chi phí (Cost Allocations) ───────────────
CREATE TABLE IF NOT EXISTS "cost_allocations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'prepaid',  -- prepaid (trả trước), accrued (dồn tích)
    "totalAmount" FLOAT NOT NULL DEFAULT 0,
    "allocatedAmount" FLOAT NOT NULL DEFAULT 0,
    "remainingAmount" FLOAT NOT NULL DEFAULT 0,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "periods" INTEGER NOT NULL DEFAULT 12,   -- Số kỳ phân bổ
    "amountPerPeriod" FLOAT NOT NULL DEFAULT 0,
    "departmentId" TEXT,
    "accountDebit" TEXT,
    "accountCredit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',  -- active, completed, cancelled
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "cost_allocations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cost_allocations_code_key" UNIQUE ("code"),
    CONSTRAINT "cost_allocations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL
);

-- ─── 4. Khấu hao tài sản (Depreciations) ─────────────────
CREATE TABLE IF NOT EXISTS "depreciations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "assetId" TEXT,                          -- IT Asset hoặc tài sản cố định
    "assetName" TEXT NOT NULL,
    "assetCode" TEXT,
    "category" TEXT DEFAULT 'equipment',    -- equipment, vehicle, building, software, other
    "originalCost" FLOAT NOT NULL DEFAULT 0,
    "residualValue" FLOAT NOT NULL DEFAULT 0,
    "usefulLife" INTEGER NOT NULL DEFAULT 60,  -- Tháng
    "method" TEXT NOT NULL DEFAULT 'straight_line',  -- straight_line, declining_balance
    "monthlyDepreciation" FLOAT NOT NULL DEFAULT 0,
    "accumulatedDepreciation" FLOAT NOT NULL DEFAULT 0,
    "bookValue" FLOAT NOT NULL DEFAULT 0,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "departmentId" TEXT,
    "accountDebit" TEXT,                     -- TK Chi phí KH
    "accountCredit" TEXT,                    -- TK Hao mòn TSCĐ
    "status" TEXT NOT NULL DEFAULT 'active',  -- active, fully_depreciated, disposed
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "depreciations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "depreciations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "depreciations_status_idx" ON "depreciations"("status");

-- ─── 5. Hóa đơn điện tử (E-Invoices) ────────────────────
CREATE TABLE IF NOT EXISTS "e_invoices" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "invoiceId" TEXT,                        -- Local invoice ID
    "provider" TEXT NOT NULL DEFAULT 'viettel',  -- viettel, meinvoice
    "invoiceNumber" TEXT,                    -- Số HĐ trên hệ thống HĐĐT
    "invoiceSeries" TEXT,                    -- Ký hiệu HĐ
    "issueDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "buyerName" TEXT NOT NULL,
    "buyerTaxCode" TEXT,
    "buyerAddress" TEXT,
    "buyerEmail" TEXT,
    "items" JSONB,                           -- [{name, unit, qty, price, amount, vat}]
    "subtotal" FLOAT NOT NULL DEFAULT 0,
    "vatAmount" FLOAT NOT NULL DEFAULT 0,
    "totalAmount" FLOAT NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'VND',
    "status" TEXT NOT NULL DEFAULT 'draft',  -- draft, issued, signed, sent, cancelled, replaced
    "signedAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "pdfUrl" TEXT,
    "xmlData" TEXT,
    "errorLog" TEXT,
    "externalId" TEXT,                       -- ID trên hệ thống nhà cung cấp
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "e_invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "e_invoices_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "e_invoices_provider_idx" ON "e_invoices"("provider");
CREATE INDEX IF NOT EXISTS "e_invoices_status_idx" ON "e_invoices"("status");

-- ─── 6. Bút toán tổng hợp (Journal Entries) ──────────────
CREATE TABLE IF NOT EXISTS "journal_entries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',  -- general, adjusting, closing, reversing
    "totalDebit" FLOAT NOT NULL DEFAULT 0,
    "totalCredit" FLOAT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "postedBy" TEXT,
    "postedAt" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journal_entries_code_key" UNIQUE ("code")
);

-- Chi tiết bút toán
CREATE TABLE IF NOT EXISTS "journal_entry_lines" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "journalEntryId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT,
    "debit" FLOAT NOT NULL DEFAULT 0,
    "credit" FLOAT NOT NULL DEFAULT 0,
    "description" TEXT,
    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journal_entry_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "journal_entry_lines_journalEntryId_idx" ON "journal_entry_lines"("journalEntryId");

-- ============================================================
-- ✅ Phase 4 hoàn tất — 7 bảng mới
-- ============================================================
