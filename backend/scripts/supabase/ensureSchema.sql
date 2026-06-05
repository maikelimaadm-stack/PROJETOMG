-- =============================================================================
-- GARANTIR SCHEMA ERP (idempotente — pode rodar quantas vezes precisar)
-- Corrige colunas faltantes como Cliente.cpf_cnpj, Usuario.ultimo_acesso, etc.
-- Cole TODO este conteúdo no SQL Editor do Supabase e clique em Run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "EntidadeCodigoSequencia" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL,
    "next_codigo" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntidadeCodigoSequencia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EntidadeCodigoSequencia_cliente_id_entity_name_key"
  ON "EntidadeCodigoSequencia"("cliente_id", "entity_name");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EntidadeCodigoSequencia_cliente_id_fkey') THEN
    ALTER TABLE "EntidadeCodigoSequencia"
      ADD CONSTRAINT "EntidadeCodigoSequencia_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "next_id_global" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "cpf_cnpj" VARCHAR(32);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "telefone" VARCHAR(32);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "status" VARCHAR(32) DEFAULT 'Ativo';
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "plano" VARCHAR(64);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "limite_usuarios" INTEGER;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "limite_empresas" INTEGER;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "data_vencimento" TIMESTAMP(3);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
UPDATE "Cliente" SET "status" = 'Ativo' WHERE "status" IS NULL;

ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "nome" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telefone" VARCHAR(32);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "ultimo_acesso" TIMESTAMP(3);

ALTER TABLE "Empresa" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "CadCpsCampo" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "CadastroRegistro" ADD COLUMN IF NOT EXISTS "id_global" INTEGER;
ALTER TABLE "CadastroRegistro" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registro_global_cliente_id_fkey') THEN
    ALTER TABLE "registro_global"
      ADD CONSTRAINT "registro_global_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ClienteModulo" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "modulo" VARCHAR(64) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClienteModulo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClienteModulo_cliente_id_modulo_key"
  ON "ClienteModulo"("cliente_id", "modulo");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClienteModulo_cliente_id_fkey') THEN
    ALTER TABLE "ClienteModulo"
      ADD CONSTRAINT "ClienteModulo_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Empresa" DROP COLUMN IF EXISTS "tenant_id";
ALTER TABLE "RegistroAnexo" DROP COLUMN IF EXISTS "tenant_id";

CREATE UNIQUE INDEX IF NOT EXISTS "Empresa_cliente_id_id_global_key"
  ON "Empresa"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_id_global_key"
  ON "CadCpsCampo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_id_global_key"
  ON "CadastroRegistro"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_id_global_key"
  ON "RegistroAnexo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;

DROP TABLE IF EXISTS "ClienteIdGlobalSequencia" CASCADE;
DROP TABLE IF EXISTS "EmpresaCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "CadCpsCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "CampoPersonalizado" CASCADE;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Cliente'
  AND column_name IN ('cpf_cnpj', 'next_id_global', 'status', 'plano')
ORDER BY column_name;
