-- MDP-3 — Relationship Dictionary (D-023)

CREATE TYPE "MdpRelationshipKind" AS ENUM ('physical', 'logical', 'computed');
CREATE TYPE "MdpRelationshipType" AS ENUM ('one_to_one', 'one_to_many', 'many_to_many');
CREATE TYPE "MdpRelationshipSemantics" AS ENUM ('association', 'composition', 'aggregation', 'inheritance', 'dependency');
CREATE TYPE "MdpRelationshipDependency" AS ENUM ('restrict', 'cascade', 'set_null', 'optional');
CREATE TYPE "MdpRelationshipDependencyClass" AS ENUM ('data', 'workflow', 'automation', 'dashboard', 'pivot', 'report', 'permission', 'layout', 'ai_context', 'integration');

CREATE TABLE "mdp_relationship" (
    "id" TEXT NOT NULL,
    "relationship_id" VARCHAR(128) NOT NULL,
    "from_entity_row_id" VARCHAR(64) NOT NULL,
    "to_entity_row_id" VARCHAR(64) NOT NULL,
    "scope" "MdpScope" NOT NULL DEFAULT 'platform',
    "cliente_id" VARCHAR(64),
    "kind" "MdpRelationshipKind" NOT NULL DEFAULT 'physical',
    "relationship_type" "MdpRelationshipType" NOT NULL,
    "semantics" "MdpRelationshipSemantics" NOT NULL DEFAULT 'association',
    "dependency" "MdpRelationshipDependency" NOT NULL DEFAULT 'restrict',
    "dependency_class" "MdpRelationshipDependencyClass" NOT NULL DEFAULT 'data',
    "cardinality" JSONB NOT NULL,
    "fk_mapping" JSONB,
    "inheritance_parent_entity_id" VARCHAR(128),
    "empresa_scoped" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "base_template_id" VARCHAR(64) NOT NULL DEFAULT 'modelobase1',
    "lifecycle" "MdpEntityLifecycle" NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "version_id" VARCHAR(64) NOT NULL,
    "presentation" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),

    CONSTRAINT "mdp_relationship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_relationship_label" (
    "id" TEXT NOT NULL,
    "relationship_row_id" VARCHAR(64) NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "help_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_relationship_label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_relationship_field_binding" (
    "id" TEXT NOT NULL,
    "relationship_row_id" VARCHAR(64) NOT NULL,
    "field_row_id" VARCHAR(64),
    "from_field_name" VARCHAR(128),
    "to_field_name" VARCHAR(128),
    "binding_role" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdp_relationship_field_binding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mdp_relationship_audit" (
    "id" TEXT NOT NULL,
    "relationship_row_id" VARCHAR(64) NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "usuario_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdp_relationship_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mdp_relationship_scope_relationship_id_cliente_id_key" ON "mdp_relationship"("scope", "relationship_id", "cliente_id");
CREATE INDEX "mdp_relationship_from_entity_row_id_lifecycle_idx" ON "mdp_relationship"("from_entity_row_id", "lifecycle");
CREATE INDEX "mdp_relationship_to_entity_row_id_lifecycle_idx" ON "mdp_relationship"("to_entity_row_id", "lifecycle");
CREATE INDEX "mdp_relationship_cliente_id_kind_idx" ON "mdp_relationship"("cliente_id", "kind");
CREATE INDEX "mdp_relationship_cliente_id_dependency_class_idx" ON "mdp_relationship"("cliente_id", "dependency_class");

CREATE UNIQUE INDEX "mdp_relationship_label_relationship_row_id_locale_key" ON "mdp_relationship_label"("relationship_row_id", "locale");
CREATE INDEX "mdp_relationship_label_locale_idx" ON "mdp_relationship_label"("locale");

CREATE INDEX "mdp_relationship_field_binding_relationship_row_id_idx" ON "mdp_relationship_field_binding"("relationship_row_id");
CREATE INDEX "mdp_relationship_field_binding_field_row_id_idx" ON "mdp_relationship_field_binding"("field_row_id");

CREATE INDEX "mdp_relationship_audit_relationship_row_id_created_at_idx" ON "mdp_relationship_audit"("relationship_row_id", "created_at");
CREATE INDEX "mdp_relationship_audit_cliente_id_created_at_idx" ON "mdp_relationship_audit"("cliente_id", "created_at");

ALTER TABLE "mdp_relationship" ADD CONSTRAINT "mdp_relationship_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "mdp_definition_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship" ADD CONSTRAINT "mdp_relationship_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship" ADD CONSTRAINT "mdp_relationship_from_entity_row_id_fkey" FOREIGN KEY ("from_entity_row_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship" ADD CONSTRAINT "mdp_relationship_to_entity_row_id_fkey" FOREIGN KEY ("to_entity_row_id") REFERENCES "mdp_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_relationship_label" ADD CONSTRAINT "mdp_relationship_label_relationship_row_id_fkey" FOREIGN KEY ("relationship_row_id") REFERENCES "mdp_relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mdp_relationship_field_binding" ADD CONSTRAINT "mdp_relationship_field_binding_relationship_row_id_fkey" FOREIGN KEY ("relationship_row_id") REFERENCES "mdp_relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship_field_binding" ADD CONSTRAINT "mdp_relationship_field_binding_field_row_id_fkey" FOREIGN KEY ("field_row_id") REFERENCES "mdp_field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mdp_relationship_audit" ADD CONSTRAINT "mdp_relationship_audit_relationship_row_id_fkey" FOREIGN KEY ("relationship_row_id") REFERENCES "mdp_relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship_audit" ADD CONSTRAINT "mdp_relationship_audit_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdp_relationship_audit" ADD CONSTRAINT "mdp_relationship_audit_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
