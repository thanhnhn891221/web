-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GMS — Gateway Management System (Supabase SQL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.gateway_integrations (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT,
    "endpoint" TEXT,
    "webhookUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "lastSyncAt" TIMESTAMP(3),
    "errorLog" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gateway_integrations_pkey" PRIMARY KEY ("id")
);

-- Tạo Index để phục vụ việc truy vấn nhanh theo nhóm và trạng thái
CREATE INDEX IF NOT EXISTS "gateway_integrations_provider_idx" ON public.gateway_integrations("provider");
CREATE INDEX IF NOT EXISTS "gateway_integrations_category_idx" ON public.gateway_integrations("category");
CREATE INDEX IF NOT EXISTS "gateway_integrations_status_idx" ON public.gateway_integrations("status");

-- Thêm trigger để tự động cập nhật trường updatedAt mỗi khi có thay đổi bản ghi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_gateway_integrations_updated_at ON public.gateway_integrations;

CREATE TRIGGER update_gateway_integrations_updated_at
BEFORE UPDATE ON public.gateway_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
