-- MDP-5 — Versioning, Publication & Snapshot Engine (D-026)

ALTER TYPE "MdpDefinitionVersionStatus" ADD VALUE IF NOT EXISTS 'deprecated';

ALTER TABLE "mdp_definition_version" ADD COLUMN IF NOT EXISTS "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1';
ALTER TABLE "mdp_definition_version" ADD COLUMN IF NOT EXISTS "integrity_hash" VARCHAR(64);
ALTER TABLE "mdp_definition_version" ADD COLUMN IF NOT EXISTS "signature_ref" VARCHAR(128);

CREATE TYPE "MdpEnvironment" AS ENUM ('development', 'qa', 'production');
CREATE TYPE "MdpSnapshotType" AS ENUM ('offline', 'marketplace', 'backup', 'environment', 'deployment');
CREATE TYPE "MdpPublishAction" AS ENUM ('publish', 'rollback', 'partial_rollback', 'compile', 'deploy', 'archive', 'deprecate');

CREATE TABLE "mdp_compiled_bundle" (
    "id" TEXT NOT NULL,
    "bundle_id" VARCHAR(128) NOT NULL,
    "version_id" VARCHAR(64) NOT NULL,
    "module_id" VARCHAR(64) NOT NULL,
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "crb_version" VARCHAR(32) NOT NULL DEFAULT 'mdp-crb-v1',
    "content_hash" VARCHAR(64) NOT NULL,
    "integrity_hash" VARCHAR(64) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_compiled_bundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_snapshot" (
    "id" TEXT NOT NULL,
    "snapshot_id" VARCHAR(128) NOT NULL,
    "version_id" VARCHAR(64) NOT NULL,
    "module_id" VARCHAR(64) NOT NULL,
    "snapshot_type" "MdpSnapshotType" NOT NULL,
    "integrity_hash" VARCHAR(64) NOT NULL,
    "signature_ref" VARCHAR(128),
    "payload" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),

    CONSTRAINT "mdp_snapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_publish_log" (
    "id" TEXT NOT NULL,
    "version_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64),
    "module_id" VARCHAR(64) NOT NULL,
    "action" "MdpPublishAction" NOT NULL,
    "from_version_id" VARCHAR(64),
    "to_version_id" VARCHAR(64),
    "scope" JSONB,
    "metadata" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_publish_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_environment_pin" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64),
    "module_id" VARCHAR(64) NOT NULL,
    "environment" "MdpEnvironment" NOT NULL,
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "version_id" VARCHAR(64) NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned_by" VARCHAR(64),

    CONSTRAINT "mdp_environment_pin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mdp_compiled_bundle_version_id_module_id_base_template_id_key"
  ON "mdp_compiled_bundle"("version_id", "module_id", "base_template_id");
CREATE INDEX "mdp_compiled_bundle_content_hash_idx" ON "mdp_compiled_bundle"("content_hash");
CREATE INDEX "mdp_compiled_bundle_integrity_hash_idx" ON "mdp_compiled_bundle"("integrity_hash");
CREATE INDEX "mdp_compiled_bundle_module_id_base_template_id_idx" ON "mdp_compiled_bundle"("module_id", "base_template_id");

CREATE INDEX "mdp_snapshot_version_id_snapshot_type_idx" ON "mdp_snapshot"("version_id", "snapshot_type");
CREATE INDEX "mdp_snapshot_module_id_created_at_idx" ON "mdp_snapshot"("module_id", "created_at");

CREATE INDEX "mdp_publish_log_version_id_created_at_idx" ON "mdp_publish_log"("version_id", "created_at");
CREATE INDEX "mdp_publish_log_cliente_id_module_id_created_at_idx" ON "mdp_publish_log"("cliente_id", "module_id", "created_at");

CREATE UNIQUE INDEX "mdp_environment_pin_cliente_id_module_id_environment_base_template_id_key"
  ON "mdp_environment_pin"("cliente_id", "module_id", "environment", "base_template_id");
CREATE INDEX "mdp_environment_pin_module_id_environment_idx" ON "mdp_environment_pin"("module_id", "environment");

CREATE INDEX "mdp_definition_version_module_id_base_template_id_status_idx"
  ON "mdp_definition_version"("module_id", "base_template_id", "status");

ALTER TABLE "mdp_compiled_bundle" ADD CONSTRAINT "mdp_compiled_bundle_version_id_fkey"
  FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_snapshot" ADD CONSTRAINT "mdp_snapshot_version_id_fkey"
  FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_publish_log" ADD CONSTRAINT "mdp_publish_log_version_id_fkey"
  FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_publish_log" ADD CONSTRAINT "mdp_publish_log_cliente_id_fkey"
  FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_environment_pin" ADD CONSTRAINT "mdp_environment_pin_version_id_fkey"
  FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mdp_environment_pin" ADD CONSTRAINT "mdp_environment_pin_cliente_id_fkey"
  FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_definition_version" ADD CONSTRAINT "mdp_definition_version_parent_version_id_fkey"
  FOREIGN KEY ("parent_version_id") REFERENCES "mdp_definition_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;
