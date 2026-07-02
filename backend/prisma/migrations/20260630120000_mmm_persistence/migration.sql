-- CreateEnum
CREATE TYPE "MmmObjectStatus" AS ENUM ('draft', 'review', 'approved', 'published', 'active', 'deprecated', 'archived', 'rejected', 'deleted');

-- CreateEnum
CREATE TYPE "MmmVersionReason" AS ENUM ('create', 'update', 'rollback', 'publish', 'batch');

-- CreateTable
CREATE TABLE "mmm_object" (
    "id" TEXT NOT NULL,
    "object_id" VARCHAR(64) NOT NULL,
    "object_type" VARCHAR(128) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "envelope_version" VARCHAR(32) NOT NULL DEFAULT 'mmm-envelope-v1',
    "scope" JSONB NOT NULL,
    "status" "MmmObjectStatus" NOT NULL DEFAULT 'draft',
    "payload" JSONB NOT NULL,
    "lineage" JSONB NOT NULL,
    "dependencies" JSONB,
    "labels" JSONB NOT NULL,
    "metadata" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "content_hash" VARCHAR(64) NOT NULL,
    "module_id" VARCHAR(128),
    "mdp_substrate_ref" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),

    CONSTRAINT "mmm_object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_object_version" (
    "id" TEXT NOT NULL,
    "object_row_id" VARCHAR(64) NOT NULL,
    "revision" INTEGER NOT NULL,
    "envelope" JSONB NOT NULL,
    "reason" "MmmVersionReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),

    CONSTRAINT "mmm_object_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_object_snapshot" (
    "id" TEXT NOT NULL,
    "snapshot_id" VARCHAR(128) NOT NULL,
    "object_row_id" VARCHAR(64) NOT NULL,
    "revision" INTEGER NOT NULL,
    "envelope" JSONB NOT NULL,
    "integrity_hash" VARCHAR(64) NOT NULL,
    "reason" "MmmVersionReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),

    CONSTRAINT "mmm_object_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_object_audit" (
    "id" TEXT NOT NULL,
    "object_row_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mmm_object_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mmm_object_object_id_key" ON "mmm_object"("object_id");

-- CreateIndex
CREATE INDEX "mmm_object_cliente_id_object_type_status_idx" ON "mmm_object"("cliente_id", "object_type", "status");

-- CreateIndex
CREATE INDEX "mmm_object_tenant_id_object_type_idx" ON "mmm_object"("tenant_id", "object_type");

-- CreateIndex
CREATE INDEX "mmm_object_module_id_status_idx" ON "mmm_object"("module_id", "status");

-- CreateIndex
CREATE INDEX "mmm_object_content_hash_idx" ON "mmm_object"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_object_version_object_row_id_revision_key" ON "mmm_object_version"("object_row_id", "revision");

-- CreateIndex
CREATE INDEX "mmm_object_version_object_row_id_created_at_idx" ON "mmm_object_version"("object_row_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_object_snapshot_snapshot_id_key" ON "mmm_object_snapshot"("snapshot_id");

-- CreateIndex
CREATE INDEX "mmm_object_snapshot_object_row_id_created_at_idx" ON "mmm_object_snapshot"("object_row_id", "created_at");

-- CreateIndex
CREATE INDEX "mmm_object_audit_object_row_id_created_at_idx" ON "mmm_object_audit"("object_row_id", "created_at");

-- CreateIndex
CREATE INDEX "mmm_object_audit_cliente_id_created_at_idx" ON "mmm_object_audit"("cliente_id", "created_at");

-- AddForeignKey
ALTER TABLE "mmm_object" ADD CONSTRAINT "mmm_object_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_object_version" ADD CONSTRAINT "mmm_object_version_object_row_id_fkey" FOREIGN KEY ("object_row_id") REFERENCES "mmm_object"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_object_snapshot" ADD CONSTRAINT "mmm_object_snapshot_object_row_id_fkey" FOREIGN KEY ("object_row_id") REFERENCES "mmm_object"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_object_audit" ADD CONSTRAINT "mmm_object_audit_object_row_id_fkey" FOREIGN KEY ("object_row_id") REFERENCES "mmm_object"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_object_audit" ADD CONSTRAINT "mmm_object_audit_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_object_audit" ADD CONSTRAINT "mmm_object_audit_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
