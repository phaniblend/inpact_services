-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inpact_products";

-- CreateEnum
CREATE TYPE "inpact_products"."SpEventType" AS ENUM ('SALE', 'POST_VOID', 'LINE_VOID', 'RETURN', 'MANUAL_DISCOUNT', 'PRICE_OVERRIDE', 'DRAWER_KICK_NO_SALE');

-- CreateEnum
CREATE TYPE "inpact_products"."SpSeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "inpact_products"."SpIncidentStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_DISMISSED', 'RESOLVED_CONFIRMED_LOSS');

-- CreateTable
CREATE TABLE "inpact_products"."SpTenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inpact_products"."SpStoreLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpStoreLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inpact_products"."SpCashier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeLocationId" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpCashier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inpact_products"."SpPosEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeLocationId" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "terminalEventId" TEXT NOT NULL,
    "idempotencyHash" TEXT NOT NULL,
    "eventType" "inpact_products"."SpEventType" NOT NULL,
    "ticketNumber" TEXT,
    "amount" DECIMAL(12,4) NOT NULL DEFAULT 0.00,
    "rawPayload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentId" TEXT,

    CONSTRAINT "SpPosEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inpact_products"."SpIncident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "incidentCode" TEXT NOT NULL,
    "storeLocationId" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "severity" "inpact_products"."SpSeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "inpact_products"."SpIncidentStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "flaggedAmount" DECIMAL(12,4) NOT NULL DEFAULT 0.00,
    "zScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "evidenceVaultUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,

    CONSTRAINT "SpIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpTenant_slug_key" ON "inpact_products"."SpTenant"("slug");

-- CreateIndex
CREATE INDEX "SpStoreLocation_tenantId_idx" ON "inpact_products"."SpStoreLocation"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SpStoreLocation_tenantId_code_key" ON "inpact_products"."SpStoreLocation"("tenantId", "code");

-- CreateIndex
CREATE INDEX "SpCashier_tenantId_storeLocationId_idx" ON "inpact_products"."SpCashier"("tenantId", "storeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "SpCashier_storeLocationId_employeeNumber_key" ON "inpact_products"."SpCashier"("storeLocationId", "employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SpPosEvent_idempotencyHash_key" ON "inpact_products"."SpPosEvent"("idempotencyHash");

-- CreateIndex
CREATE INDEX "SpPosEvent_tenantId_storeLocationId_occurredAt_idx" ON "inpact_products"."SpPosEvent"("tenantId", "storeLocationId", "occurredAt");

-- CreateIndex
CREATE INDEX "SpPosEvent_cashierId_eventType_occurredAt_idx" ON "inpact_products"."SpPosEvent"("cashierId", "eventType", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpIncident_incidentCode_key" ON "inpact_products"."SpIncident"("incidentCode");

-- CreateIndex
CREATE INDEX "SpIncident_tenantId_status_severity_idx" ON "inpact_products"."SpIncident"("tenantId", "status", "severity");

-- AddForeignKey
ALTER TABLE "inpact_products"."SpStoreLocation" ADD CONSTRAINT "SpStoreLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "inpact_products"."SpTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpCashier" ADD CONSTRAINT "SpCashier_storeLocationId_fkey" FOREIGN KEY ("storeLocationId") REFERENCES "inpact_products"."SpStoreLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpPosEvent" ADD CONSTRAINT "SpPosEvent_storeLocationId_fkey" FOREIGN KEY ("storeLocationId") REFERENCES "inpact_products"."SpStoreLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpPosEvent" ADD CONSTRAINT "SpPosEvent_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "inpact_products"."SpCashier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpPosEvent" ADD CONSTRAINT "SpPosEvent_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "inpact_products"."SpIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpIncident" ADD CONSTRAINT "SpIncident_storeLocationId_fkey" FOREIGN KEY ("storeLocationId") REFERENCES "inpact_products"."SpStoreLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpact_products"."SpIncident" ADD CONSTRAINT "SpIncident_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "inpact_products"."SpCashier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
