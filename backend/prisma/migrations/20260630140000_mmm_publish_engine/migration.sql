-- CreateEnum
CREATE TYPE "MmmDefinitionVersionStatus" AS ENUM ('draft', 'published', 'deprecated', 'archived', 'rolled_back');

-- CreateEnum
CREATE TYPE "MmmEnvironment" AS ENUM ('staging', 'production');

-- CreateEnum
CREATE TYPE "MmmPublishAction" AS ENUM ('publish', 'rollback', 'pin', 'compile');

-- CreateEnum
CREATE TYPE "MmmPublishSnapshotType" AS ENUM ('environment', 'backup', 'deployment');

-- CreateTable
CREATE TABLE "mmm_definition_version" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(128) NOT NULL,
    "application_id" VARCHAR(128),
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "semver" VARCHAR(32) NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "pipeline_version" VARCHAR(32) NOT NULL DEFAULT 'mmm-publish-v1',
    "status" "MmmDefinitionVersionStatus" NOT NULL DEFAULT 'published',
    "content_hash" VARCHAR(64) NOT NULL,
    "integrity_hash" VARCHAR(64) NOT NULL,
    "signature_ref" VARCHAR(256),
    "parent_version_id" VARCHAR(64),
    "scope" JSONB NOT NULL,
    "object_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "published_by" VARCHAR(64),
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mmm_definition_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_compiled_bundle" (
    "id" TEXT NOT NULL,
    "bundle_id" VARCHAR(128) NOT NULL,
    "definition_version_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(128) NOT NULL,
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "crb_version" VARCHAR(32) NOT NULL DEFAULT 'mmm-crb-v1',
    "content_hash" VARCHAR(64) NOT NULL,
    "integrity_hash" VARCHAR(64) NOT NULL,
    "signature_ref" VARCHAR(256),
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mmm_compiled_bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_publish_snapshot" (
    "id" TEXT NOT NULL,
    "snapshot_id" VARCHAR(128) NOT NULL,
    "definition_version_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(128) NOT NULL,
    "snapshot_type" "MmmPublishSnapshotType" NOT NULL DEFAULT 'backup',
    "integrity_hash" VARCHAR(64) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),

    CONSTRAINT "mmm_publish_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_environment_pin" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(128) NOT NULL,
    "application_id" VARCHAR(128),
    "environment" "MmmEnvironment" NOT NULL,
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "definition_version_id" VARCHAR(64) NOT NULL,
    "bundle_id" VARCHAR(128) NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned_by" VARCHAR(64),

    CONSTRAINT "mmm_environment_pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mmm_publish_log" (
    "id" TEXT NOT NULL,
    "definition_version_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(128) NOT NULL,
    "action" "MmmPublishAction" NOT NULL,
    "from_version_id" VARCHAR(64),
    "to_version_id" VARCHAR(64),
    "environment" "MmmEnvironment",
    "metadata" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mmm_publish_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mmm_definition_version_cliente_id_tenant_id_module_id_status_idx" ON "mmm_definition_version"("cliente_id", "tenant_id", "module_id", "status");

-- CreateIndex
CREATE INDEX "mmm_definition_version_module_id_revision_idx" ON "mmm_definition_version"("module_id", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_compiled_bundle_bundle_id_key" ON "mmm_compiled_bundle"("bundle_id");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_compiled_bundle_definition_version_id_module_id_base_template_id_key" ON "mmm_compiled_bundle"("definition_version_id", "module_id", "base_template_id");

-- CreateIndex
CREATE INDEX "mmm_compiled_bundle_tenant_id_module_id_idx" ON "mmm_compiled_bundle"("tenant_id", "module_id");

-- CreateIndex
CREATE INDEX "mmm_compiled_bundle_content_hash_idx" ON "mmm_compiled_bundle"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_publish_snapshot_snapshot_id_key" ON "mmm_publish_snapshot"("snapshot_id");

-- CreateIndex
CREATE INDEX "mmm_publish_snapshot_definition_version_id_snapshot_type_idx" ON "mmm_publish_snapshot"("definition_version_id", "snapshot_type");

-- CreateIndex
CREATE INDEX "mmm_publish_snapshot_module_id_created_at_idx" ON "mmm_publish_snapshot"("module_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mmm_environment_pin_cliente_id_tenant_id_module_id_environment_base_template_id_key" ON "mmm_environment_pin"("cliente_id", "tenant_id", "module_id", "environment", "base_template_id");

-- CreateIndex
CREATE INDEX "mmm_environment_pin_module_id_environment_idx" ON "mmm_environment_pin"("module_id", "environment");

-- CreateIndex
CREATE INDEX "mmm_publish_log_definition_version_id_created_at_idx" ON "mmm_publish_log"("definition_version_id", "created_at");

-- CreateIndex
CREATE INDEX "mmm_publish_log_cliente_id_module_id_created_at_idx" ON "mmm_publish_log"("cliente_id", "module_id", "created_at");

-- AddForeignKey
ALTER TABLE "mmm_definition_version" ADD CONSTRAINT "mmm_definition_version_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "mmm_definition_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_definition_version" ADD CONSTRAINT "mmm_definition_version_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_compiled_bundle" ADD CONSTRAINT "mmm_compiled_bundle_definition_version_id_fkey" FOREIGN KEY ("definition_version_id") REFERENCES "mmm_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_publish_snapshot" ADD CONSTRAINT "mmm_publish_snapshot_definition_version_id_fkey" FOREIGN KEY ("definition_version_id") REFERENCES "mmm_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_environment_pin" ADD CONSTRAINT "mmm_environment_pin_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_environment_pin" ADD CONSTRAINT "mmm_environment_pin_definition_version_id_fkey" FOREIGN KEY ("definition_version_id") REFERENCES "mmm_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_publish_log" ADD CONSTRAINT "mmm_publish_log_definition_version_id_fkey" FOREIGN KEY ("definition_version_id") REFERENCES "mmm_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mmm_publish_log" ADD CONSTRAINT "mmm_publish_log_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
