-- Reestruturação arquitetural definitiva — ERP Mak Gestão
-- Fase 1: ID Global em Cliente.next_id_global (elimina ClienteIdGlobalSequencia)
-- Fase 2: EntidadeCodigoSequencia unificada
-- Fase 3: Remove tenant_id
-- Fase 4-6: Expande Cliente/Usuario, cria ClienteModulo
-- Fase 8: CadastroRegistro.codigo

-- ── Fase 1: Cliente.next_id_global ──────────────────────────────────────────
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "next_id_global" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ClienteIdGlobalSequencia'
  ) THEN
    UPDATE "Cliente" c
    SET "next_id_global" = GREATEST(c."next_id_global", s."next_id_global")
    FROM "ClienteIdGlobalSequencia" s
    WHERE s."cliente_id" = c."id";
  END IF;
END $$;

DROP TABLE IF EXISTS "ClienteIdGlobalSequencia";

-- Garantir colunas id_global (caso migration anterior não tenha rodado)
ALTER TABLE "Empresa" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "CadCpsCampo" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "CadastroRegistro" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "RegistroAnexo" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;

CREATE TABLE IF NOT EXISTS "registro_global" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "id_global" INTEGER NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL,
    "registro_id" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "registro_global_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "registro_global_cliente_id_id_global_key"
  ON "registro_global"("cliente_id", "id_global");
CREATE INDEX IF NOT EXISTS "registro_global_cliente_id_entity_name_idx"
  ON "registro_global"("cliente_id", "entity_name");
CREATE INDEX IF NOT EXISTS "registro_global_cliente_id_registro_id_idx"
  ON "registro_global"("cliente_id", "registro_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'registro_global_cliente_id_fkey'
  ) THEN
    ALTER TABLE "registro_global"
      ADD CONSTRAINT "registro_global_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Fase 2: EntidadeCodigoSequencia ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "EntidadeCodigoSequencia" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL,
    "next_codigo" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EntidadeCodigoSequencia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EntidadeCodigoSequencia_cliente_id_entity_name_key"
  ON "EntidadeCodigoSequencia"("cliente_id", "entity_name");
CREATE INDEX IF NOT EXISTS "EntidadeCodigoSequencia_cliente_id_idx"
  ON "EntidadeCodigoSequencia"("cliente_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EntidadeCodigoSequencia_cliente_id_fkey'
  ) THEN
    ALTER TABLE "EntidadeCodigoSequencia"
      ADD CONSTRAINT "EntidadeCodigoSequencia_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Fase 3: Remover tenant_id ───────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Empresa' AND column_name = 'tenant_id'
  ) THEN
    UPDATE "Empresa" SET "cliente_id" = "tenant_id" WHERE "cliente_id" IS NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'RegistroAnexo' AND column_name = 'tenant_id'
  ) THEN
    UPDATE "RegistroAnexo" SET "cliente_id" = "tenant_id" WHERE "cliente_id" IS NULL;
  END IF;
END $$;

ALTER TABLE "Empresa" DROP COLUMN IF EXISTS "tenant_id";
ALTER TABLE "RegistroAnexo" DROP COLUMN IF EXISTS "tenant_id";

-- ── Fase 4: Expandir Cliente ────────────────────────────────────────────────
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "cpf_cnpj" VARCHAR(32);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "telefone" VARCHAR(32);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "status" VARCHAR(32) NOT NULL DEFAULT 'Ativo';
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "plano" VARCHAR(64);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "limite_usuarios" INTEGER;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "limite_empresas" INTEGER;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "data_vencimento" TIMESTAMP(3);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "observacoes" TEXT;

-- ── Fase 5: Expandir Usuario ────────────────────────────────────────────────
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "nome" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telefone" VARCHAR(32);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "ultimo_acesso" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Usuario_cliente_id_codigo_idx" ON "Usuario"("cliente_id", "codigo");

-- ── Fase 6: ClienteModulo ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ClienteModulo" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "modulo" VARCHAR(64) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClienteModulo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClienteModulo_cliente_id_modulo_key"
  ON "ClienteModulo"("cliente_id", "modulo");
CREATE INDEX IF NOT EXISTS "ClienteModulo_cliente_id_ativo_idx"
  ON "ClienteModulo"("cliente_id", "ativo");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClienteModulo_cliente_id_fkey'
  ) THEN
    ALTER TABLE "ClienteModulo"
      ADD CONSTRAINT "ClienteModulo_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Fase 8: CadastroRegistro.codigo ─────────────────────────────────────────
ALTER TABLE "CadastroRegistro" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;

-- Índices únicos id_global
CREATE UNIQUE INDEX IF NOT EXISTS "Empresa_cliente_id_id_global_key"
  ON "Empresa"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_id_global_key"
  ON "CadCpsCampo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_id_global_key"
  ON "CadastroRegistro"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_id_global_key"
  ON "RegistroAnexo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_entity_name_codigo_key"
  ON "CadastroRegistro"("cliente_id", "entity_name", "codigo") WHERE "codigo" IS NOT NULL;

-- ── Fase 10: Remover tabelas legadas ──────────────────────────────────────────
DROP TABLE IF EXISTS "EmpresaCodigoSequencia";
DROP TABLE IF EXISTS "CadCpsCodigoSequencia";
DROP TABLE IF EXISTS "CampoPersonalizado";
