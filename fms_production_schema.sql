-- Create production_lines table
CREATE TABLE "production_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "product" TEXT NOT NULL,
    "efficiency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 0,
    "output" INTEGER NOT NULL DEFAULT 0,
    "shift" TEXT,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- Create production_orders table
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "lineId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- Create uniqueness and indexes
CREATE UNIQUE INDEX "production_orders_code_key" ON "production_orders"("code");
CREATE INDEX "production_orders_lineId_idx" ON "production_orders"("lineId");
CREATE INDEX "production_orders_status_idx" ON "production_orders"("status");

-- Add foreign key
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "production_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
