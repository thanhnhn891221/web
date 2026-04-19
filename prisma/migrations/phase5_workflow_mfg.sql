-- ============================================================
-- PHASE 5: Vận hành, Sản xuất & Bảo hành
-- (OMS + FMS mở rộng + Workflow + Chat)
-- Chạy trên Supabase SQL Editor
-- ============================================================

-- ─── 1. Quản lý công việc (Tasks) ────────────────────────
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,                        -- Liên kết dự án R&D nếu có
    "assigneeId" TEXT,                       -- Người thực hiện
    "reporterId" TEXT,                       -- Người giao việc
    "departmentId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',  -- low, medium, high, urgent
    "status" TEXT NOT NULL DEFAULT 'todo',      -- todo, in_progress, review, done, cancelled
    "dueDate" TIMESTAMP,
    "startDate" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "estimatedHours" FLOAT,
    "actualHours" FLOAT,
    "tags" TEXT,                              -- Comma-separated
    "parentTaskId" TEXT,                      -- Sub-task support
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasks_code_key" UNIQUE ("code"),
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "employees"("id") ON DELETE SET NULL,
    CONSTRAINT "tasks_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "employees"("id") ON DELETE SET NULL,
    CONSTRAINT "tasks_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL,
    CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "tasks_priority_idx" ON "tasks"("priority");
CREATE INDEX IF NOT EXISTS "tasks_dueDate_idx" ON "tasks"("dueDate");

-- Bảng bình luận task
CREATE TABLE IF NOT EXISTS "task_comments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
    CONSTRAINT "task_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "task_comments_taskId_idx" ON "task_comments"("taskId");

-- ─── 2. Quy trình Workflow ───────────────────────────────
CREATE TABLE IF NOT EXISTS "workflows" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,                            -- HMS, PMS, OMS... (phân hệ áp dụng)
    "triggerEvent" TEXT,                      -- on_create, on_update, on_status_change, manual
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflows_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "workflow_steps" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "workflowId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'approval',  -- approval, notification, action, condition, wait
    "assigneeRole" TEXT,                      -- Role code hoặc employee ID
    "assigneeId" TEXT,
    "action" TEXT,                             -- approve, reject, forward, auto_update
    "conditionJson" JSONB,                    -- Điều kiện rẽ nhánh
    "timeoutHours" INTEGER,                   -- Auto-escalate sau N giờ
    "nextStepOnApprove" TEXT,                 -- Step ID nếu duyệt
    "nextStepOnReject" TEXT,                  -- Step ID nếu từ chối
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "workflow_steps_workflowId_idx" ON "workflow_steps"("workflowId");

-- Instance chạy thực tế
CREATE TABLE IF NOT EXISTS "workflow_instances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "workflowId" TEXT NOT NULL,
    "refType" TEXT NOT NULL,                  -- leave_request, purchase_order, etc.
    "refId" TEXT NOT NULL,
    "currentStepId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',  -- running, completed, rejected, cancelled
    "startedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "completedAt" TIMESTAMP,
    "data" JSONB,                              -- Snapshot dữ liệu khi bắt đầu
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflow_instances_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "workflow_instances_workflowId_idx" ON "workflow_instances"("workflowId");
CREATE INDEX IF NOT EXISTS "workflow_instances_refType_refId_idx" ON "workflow_instances"("refType", "refId");

-- ─── 3. Chat nội bộ (Chathub) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "chat_rooms" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT,
    "type" TEXT NOT NULL DEFAULT 'direct',    -- direct, group, channel
    "description" TEXT,
    "avatarUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "chat_room_members" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',    -- admin, member
    "lastReadAt" TIMESTAMP,
    "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "chat_room_members_room_user_uniq" ON "chat_room_members"("roomId", "userId");

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',      -- text, image, file, system
    "attachmentUrl" TEXT,
    "replyToId" TEXT,                         -- Reply to message
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "chat_messages_roomId_idx" ON "chat_messages"("roomId");
CREATE INDEX IF NOT EXISTS "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- ─── 4. BOM — Bill of Materials ───────────────────────────
CREATE TABLE IF NOT EXISTS "bill_of_materials" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT,
    "version" TEXT DEFAULT '1.0',
    "outputQuantity" FLOAT NOT NULL DEFAULT 1,
    "outputUnit" TEXT NOT NULL DEFAULT 'pcs',
    "estimatedTime" FLOAT,                   -- Phút/đơn vị sản phẩm
    "estimatedCost" FLOAT DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "bill_of_materials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bill_of_materials_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "bom_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "bomId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "materialSku" TEXT,
    "quantity" FLOAT NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL,
    "unitCost" FLOAT DEFAULT 0,
    "totalCost" FLOAT DEFAULT 0,
    "wastagePercent" FLOAT DEFAULT 0,        -- Tỷ lệ hao hụt %
    "isOptional" BOOLEAN DEFAULT false,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bom_items_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bill_of_materials"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "bom_items_bomId_idx" ON "bom_items"("bomId");

-- ─── 5. Lệnh sản xuất (Production Commands) ──────────────
CREATE TABLE IF NOT EXISTS "production_commands" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "productionOrderId" TEXT,                -- Liên kết đơn đặt hàng SX
    "bomId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" FLOAT NOT NULL,
    "completedQty" FLOAT NOT NULL DEFAULT 0,
    "unit" TEXT DEFAULT 'pcs',
    "lineId" TEXT,                            -- Dây chuyền
    "scheduledStart" TIMESTAMP,
    "scheduledEnd" TIMESTAMP,
    "actualStart" TIMESTAMP,
    "actualEnd" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'planned',  -- planned, released, in_progress, completed, cancelled
    "priority" TEXT DEFAULT 'medium',
    "assignedTo" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "production_commands_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "production_commands_code_key" UNIQUE ("code"),
    CONSTRAINT "production_commands_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE SET NULL,
    CONSTRAINT "production_commands_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bill_of_materials"("id") ON DELETE SET NULL,
    CONSTRAINT "production_commands_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "production_lines"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "production_commands_status_idx" ON "production_commands"("status");

-- ─── 6. Điều kiện bảo hành (Warranty Policies) ───────────
CREATE TABLE IF NOT EXISTS "warranty_policies" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productCategory" TEXT,                  -- Danh mục sản phẩm áp dụng
    "durationMonths" INTEGER NOT NULL DEFAULT 12,
    "coverageType" TEXT DEFAULT 'full',     -- full, parts_only, labor_only
    "conditions" TEXT,                       -- Điều kiện bảo hành
    "exclusions" TEXT,                       -- Trường hợp KHÔNG bảo hành
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "warranty_policies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "warranty_policies_code_key" UNIQUE ("code")
);

-- ─── 7. Quy trình bảo hành (Warranty Processes) ──────────
CREATE TABLE IF NOT EXISTS "warranty_processes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policyId" TEXT,
    "steps" JSONB,                           -- [{order, name, description, sla_hours}]
    "totalSlaHours" INTEGER DEFAULT 72,      -- SLA tổng
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "warranty_processes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "warranty_processes_code_key" UNIQUE ("code"),
    CONSTRAINT "warranty_processes_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "warranty_policies"("id") ON DELETE SET NULL
);

-- ─── 8. Phiếu bảo hành (Warranty Tickets) ────────────────
CREATE TABLE IF NOT EXISTS "warranty_tickets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "productName" TEXT NOT NULL,
    "productSerial" TEXT,
    "purchaseDate" DATE,
    "policyId" TEXT,
    "processId" TEXT,
    "currentStep" INTEGER DEFAULT 1,
    "issue" TEXT NOT NULL,                    -- Mô tả lỗi
    "diagnosis" TEXT,                        -- Chẩn đoán
    "solution" TEXT,                          -- Giải pháp
    "partsCost" FLOAT DEFAULT 0,
    "laborCost" FLOAT DEFAULT 0,
    "totalCost" FLOAT DEFAULT 0,
    "isUnderWarranty" BOOLEAN DEFAULT true,
    "assignedTo" TEXT,                       -- Kỹ thuật viên
    "status" TEXT NOT NULL DEFAULT 'received',  -- received, diagnosing, repairing, waiting_parts, completed, returned, cancelled
    "receivedAt" TIMESTAMP DEFAULT now(),
    "completedAt" TIMESTAMP,
    "returnedAt" TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "warranty_tickets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "warranty_tickets_code_key" UNIQUE ("code"),
    CONSTRAINT "warranty_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL,
    CONSTRAINT "warranty_tickets_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "warranty_policies"("id") ON DELETE SET NULL,
    CONSTRAINT "warranty_tickets_processId_fkey" FOREIGN KEY ("processId") REFERENCES "warranty_processes"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "warranty_tickets_status_idx" ON "warranty_tickets"("status");
CREATE INDEX IF NOT EXISTS "warranty_tickets_customerId_idx" ON "warranty_tickets"("customerId");

-- ============================================================
-- ✅ Phase 5 hoàn tất — 14 bảng mới
-- ============================================================
