-- ============================================================
-- PHASE 2: Sales & CRM & POS
-- Chạy trên Supabase SQL Editor
-- ============================================================
-- Bao gồm: Đơn hàng online, POS, Khách hàng mở rộng,
--           Loyalty, Đặt cọc, Cảnh báo tồn kho
-- ============================================================

-- Mở rộng bảng customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "taxCode" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'direct';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "loyaltyTierId" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "totalSpent" FLOAT NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "note" TEXT;

-- ─── 1. Nhóm khách hàng (Customer Groups) ────────────────
CREATE TABLE IF NOT EXISTS "customer_groups" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,           -- VIP, Đại lý, Khách lẻ, Doanh nghiệp
    "description" TEXT,
    "discountPercent" FLOAT DEFAULT 0,
    "color" TEXT DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_groups_code_key" UNIQUE ("code")
);

-- ─── 2. Hạng khách hàng — Loyalty Tiers ──────────────────
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,           -- Đồng, Bạc, Vàng, Kim cương
    "minPoints" INTEGER NOT NULL DEFAULT 0,
    "maxPoints" INTEGER,
    "discountPercent" FLOAT DEFAULT 0,
    "pointMultiplier" FLOAT DEFAULT 1,  -- x1, x1.5, x2
    "benefits" TEXT,                -- Mô tả quyền lợi
    "color" TEXT DEFAULT '#CD7F32',
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loyalty_tiers_code_key" UNIQUE ("code")
);

-- ─── 3. Giao dịch tích điểm (Loyalty Points) ─────────────
CREATE TABLE IF NOT EXISTS "loyalty_points" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'earn',  -- earn, spend, adjust, expire
    "points" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,  -- Số dư sau giao dịch
    "description" TEXT,
    "refType" TEXT,             -- order, return, manual, campaign
    "refId" TEXT,               -- ID đơn hàng hoặc campaign
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "loyalty_points_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loyalty_points_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "loyalty_points_customerId_idx" ON "loyalty_points"("customerId");

-- ─── 4. Chiến dịch Loyalty tự động ───────────────────────
CREATE TABLE IF NOT EXISTS "loyalty_campaigns" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'points_multiplier',  -- points_multiplier, bonus_points, birthday, reactivation
    "triggerCondition" TEXT,    -- JSON: {"event": "purchase", "minAmount": 500000}
    "rewardType" TEXT NOT NULL DEFAULT 'points',  -- points, voucher, discount
    "rewardValue" FLOAT NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "targetTierIds" TEXT,      -- Comma-separated tier IDs hoặc "all"
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "loyalty_campaigns_pkey" PRIMARY KEY ("id")
);

-- ─── 5. Phản hồi khách hàng ──────────────────────────────
CREATE TABLE IF NOT EXISTS "customer_feedbacks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'feedback',  -- feedback, complaint, suggestion, praise
    "channel" TEXT DEFAULT 'app',             -- app, phone, email, social, in_store
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "rating" INTEGER,                         -- 1-5 stars
    "refType" TEXT,                            -- order, product, service
    "refId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',    -- open, in_progress, resolved, closed
    "assignedTo" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "customer_feedbacks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_feedbacks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "customer_feedbacks_customerId_idx" ON "customer_feedbacks"("customerId");
CREATE INDEX IF NOT EXISTS "customer_feedbacks_status_idx" ON "customer_feedbacks"("status");

-- ─── 6. Đơn hàng Online (từ kênh thương mại điện tử) ─────
CREATE TABLE IF NOT EXISTS "online_orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'website',  -- shopee, tiktok, lazada, website
    "platformOrderId" TEXT,                       -- ID đơn trên sàn
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT,
    "items" JSONB,                                -- [{name, sku, qty, price}]
    "subtotal" FLOAT NOT NULL DEFAULT 0,
    "discount" FLOAT NOT NULL DEFAULT 0,
    "shippingFee" FLOAT NOT NULL DEFAULT 0,
    "total" FLOAT NOT NULL DEFAULT 0,
    "paymentMethod" TEXT DEFAULT 'cod',           -- cod, transfer, card, ewallet
    "paymentStatus" TEXT DEFAULT 'unpaid',        -- unpaid, paid, refunded
    "status" TEXT NOT NULL DEFAULT 'pending',     -- pending, confirmed, processing, shipped, delivered, cancelled, returned
    "syncedAt" TIMESTAMP,                         -- Thời điểm đồng bộ từ sàn
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "online_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "online_orders_code_key" UNIQUE ("code"),
    CONSTRAINT "online_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "online_orders_platform_idx" ON "online_orders"("platform");
CREATE INDEX IF NOT EXISTS "online_orders_status_idx" ON "online_orders"("status");

-- ─── 7. Phân chia Sales (Sales Assignments) ──────────────
CREATE TABLE IF NOT EXISTS "sales_assignments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "region" TEXT,
    "assignedDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "quota" FLOAT DEFAULT 0,              -- Chỉ tiêu doanh số
    "achieved" FLOAT DEFAULT 0,           -- Đã đạt
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "sales_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sales_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE,
    CONSTRAINT "sales_assignments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "sales_assignments_employeeId_idx" ON "sales_assignments"("employeeId");

-- ─── 8. Log cuộc gọi (Call Logs) ─────────────────────────
CREATE TABLE IF NOT EXISTS "call_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employeeId" TEXT,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'outbound',  -- inbound, outbound
    "duration" INTEGER DEFAULT 0,                   -- Giây
    "status" TEXT NOT NULL DEFAULT 'completed',    -- completed, missed, busy, no_answer
    "callType" TEXT DEFAULT 'ip',                  -- ip, sim
    "recordingUrl" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "call_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "call_logs_employeeId_idx" ON "call_logs"("employeeId");

-- ─── 9. POS Sessions (Phiên bán hàng) ────────────────────
CREATE TABLE IF NOT EXISTS "pos_sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,           -- Thu ngân
    "storeId" TEXT,                        -- Cửa hàng
    "openedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "closedAt" TIMESTAMP,
    "openingBalance" FLOAT NOT NULL DEFAULT 0,
    "closingBalance" FLOAT,
    "totalSales" FLOAT NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',  -- open, closed
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "pos_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pos_sessions_code_key" UNIQUE ("code"),
    CONSTRAINT "pos_sessions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE
);

-- ─── 10. POS Transactions (Giao dịch POS) ────────────────
CREATE TABLE IF NOT EXISTS "pos_transactions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "items" JSONB,
    "subtotal" FLOAT NOT NULL DEFAULT 0,
    "discount" FLOAT NOT NULL DEFAULT 0,
    "tax" FLOAT NOT NULL DEFAULT 0,
    "total" FLOAT NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
    "amountPaid" FLOAT NOT NULL DEFAULT 0,
    "change" FLOAT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',  -- completed, voided, refunded
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "pos_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pos_transactions_code_key" UNIQUE ("code"),
    CONSTRAINT "pos_transactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pos_sessions"("id") ON DELETE CASCADE,
    CONSTRAINT "pos_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "pos_transactions_sessionId_idx" ON "pos_transactions"("sessionId");

-- ─── 11. Lịch hẹn (Appointments) ─────────────────────────
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "employeeId" TEXT,                     -- NV phụ trách
    "storeId" TEXT,
    "scheduledAt" TIMESTAMP NOT NULL,
    "duration" INTEGER DEFAULT 60,         -- Phút
    "service" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',  -- scheduled, confirmed, in_progress, completed, cancelled, no_show
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "appointments_code_key" UNIQUE ("code"),
    CONSTRAINT "appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL,
    CONSTRAINT "appointments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "appointments_scheduledAt_idx" ON "appointments"("scheduledAt");

-- ─── 12. Đặt cọc (Deposits) ──────────────────────────────
CREATE TABLE IF NOT EXISTS "deposits" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "salesOrderId" TEXT,
    "amount" FLOAT NOT NULL,
    "method" TEXT DEFAULT 'transfer',     -- cash, transfer, card
    "status" TEXT NOT NULL DEFAULT 'active',  -- active, applied, refunded, expired
    "appliedAt" TIMESTAMP,
    "refundedAt" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "deposits_code_key" UNIQUE ("code"),
    CONSTRAINT "deposits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL,
    CONSTRAINT "deposits_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL
);

-- ─── 13. Cảnh báo tồn kho (Stock Alerts) ─────────────────
CREATE TABLE IF NOT EXISTS "stock_alerts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "sku" TEXT,
    "warehouseId" TEXT,
    "currentQty" FLOAT NOT NULL DEFAULT 0,
    "minQty" FLOAT NOT NULL DEFAULT 0,
    "alertType" TEXT NOT NULL DEFAULT 'low_stock',  -- low_stock, out_of_stock, overstock
    "severity" TEXT NOT NULL DEFAULT 'warning',      -- info, warning, critical
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP,
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_alerts_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE,
    CONSTRAINT "stock_alerts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "stock_alerts_alertType_idx" ON "stock_alerts"("alertType");
CREATE INDEX IF NOT EXISTS "stock_alerts_isResolved_idx" ON "stock_alerts"("isResolved");

-- ============================================================
-- ✅ Phase 2 hoàn tất — 13 bảng mới + 1 bảng mở rộng
-- ============================================================
