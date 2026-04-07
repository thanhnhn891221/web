-- RMS, MMS & QMS Models

-- RMS: Research Projects
CREATE TABLE "research_projects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'concept',
    "lead" TEXT NOT NULL,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_projects_pkey" PRIMARY KEY ("id")
);

-- MMS: Marketing Campaigns
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- QMS: Quality Checks
CREATE TABLE "quality_checks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'incoming',
    "inspector" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'pending',
    "defectRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_checks_pkey" PRIMARY KEY ("id")
);

-- QMS: Quality Criteria (Items)
CREATE TABLE "quality_criteria" (
    "id" TEXT NOT NULL,
    "qualityCheckId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "actual" TEXT NOT NULL,
    "pass" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quality_criteria_pkey" PRIMARY KEY ("id")
);

-- Indices
CREATE UNIQUE INDEX "research_projects_code_key" ON "research_projects"("code");
CREATE UNIQUE INDEX "quality_checks_code_key" ON "quality_checks"("code");
CREATE INDEX "quality_criteria_qualityCheckId_idx" ON "quality_criteria"("qualityCheckId");

-- Foreign Keys
ALTER TABLE "quality_criteria" ADD CONSTRAINT "quality_criteria_qualityCheckId_fkey" FOREIGN KEY ("qualityCheckId") REFERENCES "quality_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
