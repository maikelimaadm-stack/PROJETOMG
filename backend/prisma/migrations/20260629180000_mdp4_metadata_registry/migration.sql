-- MDP-4 — Metadata Registry (D-024)

CREATE TYPE "MdpRegistryEntryType" AS ENUM (
  'layout', 'view', 'form', 'section', 'panel', 'tab', 'group', 'field', 'field_config',
  'action', 'event', 'formula', 'validation', 'workflow', 'dashboard', 'pivot_table',
  'report', 'permission', 'automation', 'base_template', 'template', 'integration',
  'ai_definition', 'studio_definition', 'theme'
);
CREATE TYPE "MdpRegistryEntryStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "MdpRegistryOwnerKind" AS ENUM ('platform', 'tenant', 'marketplace', 'system');
CREATE TYPE "MdpRegistryBindingKind" AS ENUM ('entity', 'field', 'relationship', 'module', 'entry');

CREATE TABLE "mdp_registry_entry" (
    "id" TEXT NOT NULL,
    "entry_id" VARCHAR(128) NOT NULL,
    "entry_type" "MdpRegistryEntryType" NOT NULL,
    "scope" "MdpScope" NOT NULL DEFAULT 'platform',
    "cliente_id" VARCHAR(64),
    "module_id" VARCHAR(64),
    "entity_row_id" VARCHAR(64),
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "schema_version" VARCHAR(32) NOT NULL,
    "payload" JSONB NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "status" "MdpRegistryEntryStatus" NOT NULL DEFAULT 'draft',
    "owner_kind" "MdpRegistryOwnerKind" NOT NULL DEFAULT 'platform',
    "owner_ref" VARCHAR(128),
    "empresa_scope" "MdpEmpresaScope" NOT NULL DEFAULT 'none',
    "lifecycle" "MdpEntityLifecycle" NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version_id" VARCHAR(64) NOT NULL,
    "presentation" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),

    CONSTRAINT "mdp_registry_entry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_registry_entry_label" (
    "id" TEXT NOT NULL,
    "entry_row_id" VARCHAR(64) NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "help_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_registry_entry_label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_registry_binding" (
    "id" TEXT NOT NULL,
    "entry_row_id" VARCHAR(64) NOT NULL,
    "binding_kind" "MdpRegistryBindingKind" NOT NULL,
    "target_id" VARCHAR(128) NOT NULL,
    "target_row_id" VARCHAR(64),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_registry_binding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_registry_schema" (
    "id" TEXT NOT NULL,
    "entry_type" "MdpRegistryEntryType" NOT NULL,
    "schema_version" VARCHAR(32) NOT NULL,
    "json_schema" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_registry_schema_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_registry_audit" (
    "id" TEXT NOT NULL,
    "entry_row_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_registry_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mdp_registry_entry_scope_entry_id_cliente_id_key" ON "mdp_registry_entry"("scope", "entry_id", "cliente_id");
CREATE INDEX "mdp_registry_entry_cliente_id_entry_type_status_idx" ON "mdp_registry_entry"("cliente_id", "entry_type", "status");
CREATE INDEX "mdp_registry_entry_module_id_entry_type_lifecycle_idx" ON "mdp_registry_entry"("module_id", "entry_type", "lifecycle");
CREATE INDEX "mdp_registry_entry_entity_row_id_entry_type_idx" ON "mdp_registry_entry"("entity_row_id", "entry_type");
CREATE INDEX "mdp_registry_entry_content_hash_idx" ON "mdp_registry_entry"("content_hash");

CREATE UNIQUE INDEX "mdp_registry_entry_label_entry_row_id_locale_key" ON "mdp_registry_entry_label"("entry_row_id", "locale");
CREATE INDEX "mdp_registry_entry_label_locale_idx" ON "mdp_registry_entry_label"("locale");

CREATE INDEX "mdp_registry_binding_entry_row_id_sort_order_idx" ON "mdp_registry_binding"("entry_row_id", "sort_order");
CREATE INDEX "mdp_registry_binding_binding_kind_target_id_idx" ON "mdp_registry_binding"("binding_kind", "target_id");

CREATE UNIQUE INDEX "mdp_registry_schema_entry_type_schema_version_key" ON "mdp_registry_schema"("entry_type", "schema_version");

CREATE INDEX "mdp_registry_audit_entry_row_id_created_at_idx" ON "mdp_registry_audit"("entry_row_id", "created_at");
CREATE INDEX "mdp_registry_audit_cliente_id_created_at_idx" ON "mdp_registry_audit"("cliente_id", "created_at");

ALTER TABLE "mdp_registry_entry" ADD CONSTRAINT "mdp_registry_entry_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mdp_registry_entry" ADD CONSTRAINT "mdp_registry_entry_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_registry_entry" ADD CONSTRAINT "mdp_registry_entry_entity_row_id_fkey" FOREIGN KEY ("entity_row_id") REFERENCES "mdp_entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mdp_registry_entry_label" ADD CONSTRAINT "mdp_registry_entry_label_entry_row_id_fkey" FOREIGN KEY ("entry_row_id") REFERENCES "mdp_registry_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_registry_binding" ADD CONSTRAINT "mdp_registry_binding_entry_row_id_fkey" FOREIGN KEY ("entry_row_id") REFERENCES "mdp_registry_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_registry_audit" ADD CONSTRAINT "mdp_registry_audit_entry_row_id_fkey" FOREIGN KEY ("entry_row_id") REFERENCES "mdp_registry_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_registry_audit" ADD CONSTRAINT "mdp_registry_audit_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_registry_audit" ADD CONSTRAINT "mdp_registry_audit_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
