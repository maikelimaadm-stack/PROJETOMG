-- CADCPS: módulo global de campos personalizados

CREATE TABLE IF NOT EXISTS "CadCpsTela" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(64) NOT NULL,
    "nome" VARCHAR(128) NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CadCpsTela_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsTela_codigo_key" ON "CadCpsTela"("codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsTela_entity_name_key" ON "CadCpsTela"("entity_name");
CREATE INDEX IF NOT EXISTS "CadCpsTela_ativo_ordem_idx" ON "CadCpsTela"("ativo", "ordem");

CREATE TABLE IF NOT EXISTS "CadCpsCampo" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "codigo" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "field_name" VARCHAR(128) NOT NULL,
    "descricao" TEXT,
    "tipo" VARCHAR(64) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "read_only" BOOLEAN NOT NULL DEFAULT false,
    "visivel_form" BOOLEAN NOT NULL DEFAULT true,
    "visivel_tabela" BOOLEAN NOT NULL DEFAULT false,
    "visivel_relatorio" BOOLEAN NOT NULL DEFAULT false,
    "pesquisavel" BOOLEAN NOT NULL DEFAULT true,
    "filtravel" BOOLEAN NOT NULL DEFAULT true,
    "exportavel" BOOLEAN NOT NULL DEFAULT true,
    "auditavel" BOOLEAN NOT NULL DEFAULT true,
    "aplicacao_modo" VARCHAR(32) NOT NULL DEFAULT 'todas',
    "placeholder" VARCHAR(255),
    "formula" TEXT,
    "calculation_builder" JSONB,
    "usar_mascara" BOOLEAN NOT NULL DEFAULT false,
    "mascaras_text" TEXT,
    "usar_decimal" BOOLEAN NOT NULL DEFAULT false,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "separador_decimal" VARCHAR(8) NOT NULL DEFAULT ',',
    "separador_milhar" VARCHAR(8) NOT NULL DEFAULT '.',
    "ordem_tabela" INTEGER NOT NULL DEFAULT 999,
    "largura_coluna" INTEGER NOT NULL DEFAULT 160,
    "relation_entity" VARCHAR(128),
    "options_label_field" VARCHAR(128),
    "options_value_field" VARCHAR(128),
    "legacy_campo_id" VARCHAR(64),
    "created_by" VARCHAR(64),
    "updated_by" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CadCpsCampo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_codigo_key" ON "CadCpsCampo"("cliente_id", "codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_field_name_key" ON "CadCpsCampo"("cliente_id", "field_name");
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_ativo_idx" ON "CadCpsCampo"("cliente_id", "ativo");
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_tipo_idx" ON "CadCpsCampo"("cliente_id", "tipo");
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_aplicacao_modo_idx" ON "CadCpsCampo"("cliente_id", "aplicacao_modo");

ALTER TABLE "CadCpsCampo" ADD CONSTRAINT "CadCpsCampo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CadCpsCampoTela" (
    "campo_id" VARCHAR(64) NOT NULL,
    "tela_id" VARCHAR(64) NOT NULL,
    CONSTRAINT "CadCpsCampoTela_pkey" PRIMARY KEY ("campo_id","tela_id")
);

CREATE INDEX IF NOT EXISTS "CadCpsCampoTela_tela_id_idx" ON "CadCpsCampoTela"("tela_id");
ALTER TABLE "CadCpsCampoTela" ADD CONSTRAINT "CadCpsCampoTela_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "CadCpsCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadCpsCampoTela" ADD CONSTRAINT "CadCpsCampoTela_tela_id_fkey" FOREIGN KEY ("tela_id") REFERENCES "CadCpsTela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CadCpsCampoEmpresa" (
    "campo_id" VARCHAR(64) NOT NULL,
    "empresa_id" VARCHAR(64) NOT NULL,
    CONSTRAINT "CadCpsCampoEmpresa_pkey" PRIMARY KEY ("campo_id","empresa_id")
);

CREATE INDEX IF NOT EXISTS "CadCpsCampoEmpresa_empresa_id_idx" ON "CadCpsCampoEmpresa"("empresa_id");
ALTER TABLE "CadCpsCampoEmpresa" ADD CONSTRAINT "CadCpsCampoEmpresa_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "CadCpsCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadCpsCampoEmpresa" ADD CONSTRAINT "CadCpsCampoEmpresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CadCpsCampoOpcao" (
    "id" TEXT NOT NULL,
    "campo_id" VARCHAR(64) NOT NULL,
    "codigo" VARCHAR(64) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CadCpsCampoOpcao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampoOpcao_campo_id_codigo_key" ON "CadCpsCampoOpcao"("campo_id", "codigo");
CREATE INDEX IF NOT EXISTS "CadCpsCampoOpcao_campo_id_ordem_idx" ON "CadCpsCampoOpcao"("campo_id", "ordem");
ALTER TABLE "CadCpsCampoOpcao" ADD CONSTRAINT "CadCpsCampoOpcao_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "CadCpsCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CadCpsHistorico" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "campo_id" VARCHAR(64) NOT NULL,
    "usuario_id" VARCHAR(64),
    "acao" VARCHAR(64) NOT NULL,
    "valor_anterior" JSONB,
    "valor_novo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CadCpsHistorico_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CadCpsHistorico_cliente_id_campo_id_createdAt_idx" ON "CadCpsHistorico"("cliente_id", "campo_id", "createdAt");
CREATE INDEX IF NOT EXISTS "CadCpsHistorico_usuario_id_createdAt_idx" ON "CadCpsHistorico"("usuario_id", "createdAt");
ALTER TABLE "CadCpsHistorico" ADD CONSTRAINT "CadCpsHistorico_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "CadCpsCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CadCpsCodigoSequencia" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "next_codigo" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CadCpsCodigoSequencia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCodigoSequencia_cliente_id_key" ON "CadCpsCodigoSequencia"("cliente_id");
ALTER TABLE "CadCpsCodigoSequencia" ADD CONSTRAINT "CadCpsCodigoSequencia_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
