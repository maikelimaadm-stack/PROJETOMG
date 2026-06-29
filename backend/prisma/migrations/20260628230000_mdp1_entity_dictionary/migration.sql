-- MDP-1 — Entity Dictionary (D-021)

CREATE TYPE "MdpScope" AS ENUM ('platform', 'tenant');
CREATE TYPE "MdpEntityKind" AS ENUM ('business', 'meta', 'system', 'certification');
CREATE TYPE "MdpEntityLifecycle" AS ENUM ('draft', 'active', 'deprecated', 'archived');
CREATE TYPE "MdpOriginKind" AS ENUM ('platform', 'tenant', 'marketplace');
CREATE TYPE "MdpEmpresaScope" AS ENUM ('none', 'optional', 'required');
CREATE TYPE "MdpDefinitionVersionStatus" AS ENUM ('draft', 'published', 'archived', 'rolled_back');
CREATE TYPE "MdpClientTarget" AS ENUM ('web', 'mobile', 'desktop', 'all');

CREATE TABLE "mdp_definition_version" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64),
    "module_id" VARCHAR(64),
    "semver" VARCHAR(32) NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "status" "MdpDefinitionVersionStatus" NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMP(3),
    "published_by" VARCHAR(64),
    "parent_version_id" VARCHAR(64),
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_definition_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_entity" (
    "id" TEXT NOT NULL,
    "entity_id" VARCHAR(128) NOT NULL,
    "module_id" VARCHAR(64) NOT NULL,
    "codigo" VARCHAR(64) NOT NULL,
    "scope" "MdpScope" NOT NULL DEFAULT 'platform',
    "cliente_id" VARCHAR(64),
    "entity_kind" "MdpEntityKind" NOT NULL DEFAULT 'business',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "icon_key" VARCHAR(64),
    "extends_entity_id" VARCHAR(128),
    "origin_kind" "MdpOriginKind" NOT NULL DEFAULT 'platform',
    "origin_ref" VARCHAR(128),
    "is_runtime_module" BOOLEAN NOT NULL DEFAULT true,
    "legacy_entity_name" VARCHAR(128),
    "permission_resource_key" VARCHAR(128),
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "empresa_scope" "MdpEmpresaScope" NOT NULL DEFAULT 'none',
    "lifecycle" "MdpEntityLifecycle" NOT NULL DEFAULT 'active',
    "version_id" TEXT NOT NULL,
    "persistence" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),

    CONSTRAINT "mdp_entity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_entity_label" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "singular" VARCHAR(255) NOT NULL,
    "plural" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_entity_label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_entity_capability" (
    "entity_id" TEXT NOT NULL,
    "layout" BOOLEAN NOT NULL DEFAULT true,
    "field" BOOLEAN NOT NULL DEFAULT true,
    "validation" BOOLEAN NOT NULL DEFAULT true,
    "formula" BOOLEAN NOT NULL DEFAULT true,
    "events" BOOLEAN NOT NULL DEFAULT true,
    "actions" BOOLEAN NOT NULL DEFAULT true,
    "workflow" BOOLEAN NOT NULL DEFAULT true,
    "custom_fields" BOOLEAN NOT NULL DEFAULT true,
    "attachments" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mdp_entity_capability_pkey" PRIMARY KEY ("entity_id")
);

CREATE TABLE "mdp_entity_route" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "route_path" VARCHAR(255) NOT NULL,
    "page_code" VARCHAR(64),
    "client_target" "MdpClientTarget" NOT NULL DEFAULT 'all',
    "menu_section" VARCHAR(128),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "target_entity_id" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_entity_route_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_entity_audit" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_entity_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mdp_entity_scope_entity_id_cliente_id_key" ON "mdp_entity"("scope", "entity_id", "cliente_id");
CREATE INDEX "mdp_entity_cliente_id_module_id_lifecycle_idx" ON "mdp_entity"("cliente_id", "module_id", "lifecycle");
CREATE INDEX "mdp_entity_module_id_lifecycle_idx" ON "mdp_entity"("module_id", "lifecycle");
CREATE INDEX "mdp_definition_version_cliente_id_module_id_status_idx" ON "mdp_definition_version"("cliente_id", "module_id", "status");
CREATE UNIQUE INDEX "mdp_entity_label_entity_id_locale_key" ON "mdp_entity_label"("entity_id", "locale");
CREATE INDEX "mdp_entity_label_locale_idx" ON "mdp_entity_label"("locale");
CREATE INDEX "mdp_entity_route_entity_id_sort_order_idx" ON "mdp_entity_route"("entity_id", "sort_order");
CREATE INDEX "mdp_entity_audit_entity_id_created_at_idx" ON "mdp_entity_audit"("entity_id", "created_at");

ALTER TABLE "mdp_entity" ADD CONSTRAINT "mdp_entity_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mdp_entity" ADD CONSTRAINT "mdp_entity_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_entity_label" ADD CONSTRAINT "mdp_entity_label_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_entity_capability" ADD CONSTRAINT "mdp_entity_capability_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_entity_route" ADD CONSTRAINT "mdp_entity_route_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_entity_audit" ADD CONSTRAINT "mdp_entity_audit_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
