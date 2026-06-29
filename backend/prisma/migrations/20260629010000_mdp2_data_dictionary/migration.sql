-- MDP-2 — Data Dictionary (D-022)

CREATE TYPE "MdpFieldSource" AS ENUM ('native', 'custom', 'computed', 'derived', 'system', 'virtual');
CREATE TYPE "MdpFieldEmpresaApplicability" AS ENUM ('all', 'selected', 'none');

CREATE TABLE "mdp_field" (
    "id" TEXT NOT NULL,
    "field_id" VARCHAR(128) NOT NULL,
    "entity_row_id" VARCHAR(64) NOT NULL,
    "field_name" VARCHAR(128) NOT NULL,
    "source" "MdpFieldSource" NOT NULL,
    "field_type" VARCHAR(64) NOT NULL,
    "scope" "MdpScope" NOT NULL DEFAULT 'platform',
    "cliente_id" VARCHAR(64),
    "codigo" INTEGER,
    "id_global" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "read_only" BOOLEAN NOT NULL DEFAULT false,
    "searchable" BOOLEAN NOT NULL DEFAULT true,
    "filterable" BOOLEAN NOT NULL DEFAULT true,
    "exportable" BOOLEAN NOT NULL DEFAULT true,
    "auditable" BOOLEAN NOT NULL DEFAULT true,
    "visible_form" BOOLEAN NOT NULL DEFAULT true,
    "visible_table" BOOLEAN NOT NULL DEFAULT false,
    "visible_report" BOOLEAN NOT NULL DEFAULT false,
    "empresa_applicability" "MdpFieldEmpresaApplicability" NOT NULL DEFAULT 'all',
    "placeholder" VARCHAR(255),
    "formula" TEXT,
    "calculation_builder" JSONB,
    "use_mask" BOOLEAN NOT NULL DEFAULT false,
    "mask_text" TEXT,
    "use_decimal" BOOLEAN NOT NULL DEFAULT false,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "decimal_separator" VARCHAR(8) NOT NULL DEFAULT ',',
    "thousand_separator" VARCHAR(8) NOT NULL DEFAULT '.',
    "table_order" INTEGER NOT NULL DEFAULT 999,
    "column_width" INTEGER NOT NULL DEFAULT 160,
    "relation_entity" VARCHAR(128),
    "options_label_field" VARCHAR(128),
    "options_value_field" VARCHAR(128),
    "validation_ref" VARCHAR(128),
    "formula_ref" VARCHAR(128),
    "relationship_ref" VARCHAR(128),
    "presentation" JSONB,
    "legacy_campo_id" VARCHAR(64),
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "lifecycle" "MdpEntityLifecycle" NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "version_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),

    CONSTRAINT "mdp_field_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_field_label" (
    "id" TEXT NOT NULL,
    "field_row_id" VARCHAR(64) NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "help_text" TEXT,
    "placeholder" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_field_label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_field_option" (
    "id" TEXT NOT NULL,
    "field_row_id" VARCHAR(64) NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_field_option_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_field_empresa_scope" (
    "field_row_id" VARCHAR(64) NOT NULL,
    "empresa_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "mdp_field_empresa_scope_pkey" PRIMARY KEY ("field_row_id","empresa_id")
);

CREATE TABLE "mdp_field_tela" (
    "field_row_id" VARCHAR(64) NOT NULL,
    "tela_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "mdp_field_tela_pkey" PRIMARY KEY ("field_row_id","tela_id")
);

CREATE TABLE "mdp_field_audit" (
    "id" TEXT NOT NULL,
    "field_row_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_field_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mdp_field_scope_field_id_cliente_id_key" ON "mdp_field"("scope", "field_id", "cliente_id");
CREATE UNIQUE INDEX "mdp_field_cliente_id_codigo_key" ON "mdp_field"("cliente_id", "codigo");
CREATE UNIQUE INDEX "mdp_field_cliente_id_field_name_entity_row_id_key" ON "mdp_field"("cliente_id", "field_name", "entity_row_id");
CREATE UNIQUE INDEX "mdp_field_cliente_id_id_global_key" ON "mdp_field"("cliente_id", "id_global");
CREATE INDEX "mdp_field_entity_row_id_lifecycle_idx" ON "mdp_field"("entity_row_id", "lifecycle");
CREATE INDEX "mdp_field_cliente_id_active_idx" ON "mdp_field"("cliente_id", "active");
CREATE INDEX "mdp_field_cliente_id_source_idx" ON "mdp_field"("cliente_id", "source");
CREATE INDEX "mdp_field_cliente_id_field_type_idx" ON "mdp_field"("cliente_id", "field_type");

CREATE UNIQUE INDEX "mdp_field_label_field_row_id_locale_key" ON "mdp_field_label"("field_row_id", "locale");
CREATE INDEX "mdp_field_label_locale_idx" ON "mdp_field_label"("locale");

CREATE UNIQUE INDEX "mdp_field_option_field_row_id_code_key" ON "mdp_field_option"("field_row_id", "code");
CREATE INDEX "mdp_field_option_field_row_id_sort_order_idx" ON "mdp_field_option"("field_row_id", "sort_order");

CREATE INDEX "mdp_field_empresa_scope_empresa_id_idx" ON "mdp_field_empresa_scope"("empresa_id");

CREATE INDEX "mdp_field_tela_tela_id_idx" ON "mdp_field_tela"("tela_id");

CREATE INDEX "mdp_field_audit_field_row_id_created_at_idx" ON "mdp_field_audit"("field_row_id", "created_at");
CREATE INDEX "mdp_field_audit_cliente_id_created_at_idx" ON "mdp_field_audit"("cliente_id", "created_at");

ALTER TABLE "mdp_field" ADD CONSTRAINT "mdp_field_entity_row_id_fkey" FOREIGN KEY ("entity_row_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_field" ADD CONSTRAINT "mdp_field_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mdp_field" ADD CONSTRAINT "mdp_field_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_field_label" ADD CONSTRAINT "mdp_field_label_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_field_option" ADD CONSTRAINT "mdp_field_option_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_field_empresa_scope" ADD CONSTRAINT "mdp_field_empresa_scope_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_field_empresa_scope" ADD CONSTRAINT "mdp_field_empresa_scope_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_field_tela" ADD CONSTRAINT "mdp_field_tela_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_field_tela" ADD CONSTRAINT "mdp_field_tela_tela_id_fkey" FOREIGN KEY ("tela_id") REFERENCES "CadCpsTela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_field_audit" ADD CONSTRAINT "mdp_field_audit_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_field_audit" ADD CONSTRAINT "mdp_field_audit_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_field_audit" ADD CONSTRAINT "mdp_field_audit_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
