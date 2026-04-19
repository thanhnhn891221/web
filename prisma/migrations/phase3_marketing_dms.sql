-- ============================================================
-- PHASE 3: Marketing & Phân phối (MMS + DMS mở rộng)
-- Chạy trên Supabase SQL Editor
-- ============================================================

-- ─── 1. Contacts (Liên hệ tiềm năng) ────────────────────
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "company" TEXT,
    "position" TEXT,
    "source" TEXT DEFAULT 'manual',       -- manual, facebook, shopee, tiktok, zalo, referral, website
    "sourceId" TEXT,                       -- ID bài post, ad campaign...
    "tags" TEXT,                           -- Comma-separated tags
    "status" TEXT NOT NULL DEFAULT 'new',  -- new, contacted, qualified, converted, lost
    "assignedTo" TEXT,                     -- Employee ID
    "lastContactedAt" TIMESTAMP,
    "note" TEXT,
    "customFields" JSONB,                 -- Trường tùy chỉnh
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "contacts_source_idx" ON "contacts"("source");
CREATE INDEX IF NOT EXISTS "contacts_status_idx" ON "contacts"("status");
CREATE INDEX IF NOT EXISTS "contacts_assignedTo_idx" ON "contacts"("assignedTo");

-- ─── 2. Nguồn dữ liệu (Data Sources) ────────────────────
CREATE TABLE IF NOT EXISTS "data_sources" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',  -- manual, api, import, webhook
    "platform" TEXT,                         -- facebook, google, shopee, tiktok
    "totalContacts" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" FLOAT DEFAULT 0,
    "lastSyncAt" TIMESTAMP,
    "config" JSONB,                          -- API keys, endpoints...
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- ─── 3. Kết nối mạng xã hội (Social Connections) ─────────
CREATE TABLE IF NOT EXISTS "social_connections" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "platform" TEXT NOT NULL,              -- facebook, shopee, tiktok, zalo, lazada
    "accountName" TEXT NOT NULL,
    "accountId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP,
    "shopId" TEXT,                          -- Shop ID trên sàn TMĐT
    "webhookUrl" TEXT,
    "syncOrders" BOOLEAN DEFAULT false,
    "syncMessages" BOOLEAN DEFAULT false,
    "lastSyncAt" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'disconnected',  -- connected, disconnected, error
    "errorLog" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "social_connections_platform_idx" ON "social_connections"("platform");

-- ─── 4. Chiến dịch tin nhắn (Message Campaigns) ──────────
CREATE TABLE IF NOT EXISTS "message_campaigns" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',   -- sms, zalo_oa, zalo_zns, email
    "templateId" TEXT,
    "content" TEXT,
    "targetAudience" TEXT,                    -- all, group:vip, tier:gold, custom
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',  -- draft, scheduled, sending, completed, cancelled
    "cost" FLOAT DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "message_campaigns_pkey" PRIMARY KEY ("id")
);

-- ─── 5. Khuyến mãi (Promotions) ──────────────────────────
CREATE TABLE IF NOT EXISTS "promotions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'percent',  -- percent, fixed, buy_x_get_y, combo
    "value" FLOAT NOT NULL DEFAULT 0,        -- % hoặc số tiền
    "minOrderAmount" FLOAT DEFAULT 0,
    "maxDiscount" FLOAT,                     -- Giảm tối đa
    "applicableProducts" TEXT,               -- all, category:xxx, sku:xxx
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "usageLimit" INTEGER,                    -- Tổng số lần sử dụng
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perCustomerLimit" INTEGER DEFAULT 1,
    "isStackable" BOOLEAN DEFAULT false,     -- Có chồng KM khác không
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "promotions_code_key" UNIQUE ("code")
);

-- ─── 6. Voucher (Mã giảm giá) ────────────────────────────
CREATE TABLE IF NOT EXISTS "vouchers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "promotionId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'percent',
    "value" FLOAT NOT NULL DEFAULT 0,
    "minOrderAmount" FLOAT DEFAULT 0,
    "maxDiscount" FLOAT,
    "expiresAt" TIMESTAMP,
    "usageLimit" INTEGER DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,                      -- Customer ID hoặc null (public)
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vouchers_code_key" UNIQUE ("code"),
    CONSTRAINT "vouchers_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL
);

-- ─── 7. Hoa hồng cộng tác viên (Affiliate Commissions) ───
CREATE TABLE IF NOT EXISTS "affiliate_commissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "affiliateId" TEXT NOT NULL,           -- Employee hoặc external partner ID
    "affiliateName" TEXT NOT NULL,
    "affiliateType" TEXT DEFAULT 'employee',  -- employee, partner, influencer
    "orderId" TEXT,
    "orderCode" TEXT,
    "orderAmount" FLOAT NOT NULL DEFAULT 0,
    "commissionRate" FLOAT NOT NULL DEFAULT 0,  -- %
    "commissionAmount" FLOAT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',   -- pending, approved, paid, cancelled
    "paidAt" TIMESTAMP,
    "period" TEXT,                               -- "2026-04"
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "affiliate_commissions_affiliateId_idx" ON "affiliate_commissions"("affiliateId");
CREATE INDEX IF NOT EXISTS "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

-- ─── 8. Tuyến bán hàng thị trường (Field Sales Routes) ───
CREATE TABLE IF NOT EXISTS "field_sales_routes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employeeId" TEXT,                     -- Sales thị trường phụ trách
    "region" TEXT,
    "district" TEXT,
    "visitFrequency" TEXT DEFAULT 'weekly',  -- daily, weekly, biweekly, monthly
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "routeMap" JSONB,                       -- [{lat, lng, customerName}] 
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "field_sales_routes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "field_sales_routes_code_key" UNIQUE ("code"),
    CONSTRAINT "field_sales_routes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL
);

-- ─── 9. Chính sách đại lý (Dealer Policies) ──────────────
CREATE TABLE IF NOT EXISTS "dealer_policies" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discount',  -- discount, rebate, target_bonus
    "tierLevel" TEXT,                         -- Cấp 1, Cấp 2, Cấp 3
    "discountPercent" FLOAT DEFAULT 0,
    "targetAmount" FLOAT DEFAULT 0,          -- Chỉ tiêu doanh số
    "bonusPercent" FLOAT DEFAULT 0,          -- Thưởng khi đạt target
    "conditions" TEXT,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "dealer_policies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dealer_policies_code_key" UNIQUE ("code")
);

-- ─── 10. Đơn hàng đại lý (Dealer Orders) ─────────────────
CREATE TABLE IF NOT EXISTS "dealer_orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "policyId" TEXT,
    "items" JSONB,
    "subtotal" FLOAT NOT NULL DEFAULT 0,
    "discount" FLOAT NOT NULL DEFAULT 0,
    "total" FLOAT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expectedDelivery" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "dealer_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dealer_orders_code_key" UNIQUE ("code"),
    CONSTRAINT "dealer_orders_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors"("id") ON DELETE CASCADE,
    CONSTRAINT "dealer_orders_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "dealer_policies"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "dealer_orders_distributorId_idx" ON "dealer_orders"("distributorId");

-- ─── 11. Web Store config ─────────────────────────────────
CREATE TABLE IF NOT EXISTS "web_stores" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "theme" JSONB,                          -- {primaryColor, font, layout}
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,                         -- Payment methods, shipping, SEO...
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "web_stores_pkey" PRIMARY KEY ("id")
);

-- ─── 12. Route Maps (Bản đồ tuyến đường) ─────────────────
CREATE TABLE IF NOT EXISTS "route_maps" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "fieldSalesRouteId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "address" TEXT,
    "latitude" FLOAT,
    "longitude" FLOAT,
    "visitOrder" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" TIMESTAMP,
    "visitNote" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "route_maps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "route_maps_fieldSalesRouteId_fkey" FOREIGN KEY ("fieldSalesRouteId") REFERENCES "field_sales_routes"("id") ON DELETE CASCADE
);

-- ============================================================
-- ✅ Phase 3 hoàn tất — 12 bảng mới
-- ============================================================
