-- =============================================================================
-- FIX SCHEMA + RESET + SEED MAIKE
--
-- 1) Corrige colunas faltantes (ex: Cliente.cpf_cnpj) — causa do erro de login
-- 2) Apaga todos os dados
-- 3) Cria cliente maike / usuário maike / senha 123
--
-- Cole TODO este conteúdo no SQL Editor e clique em Run.
--
-- ATENÇÃO: links raw.githubusercontent.com NÃO funcionam em repositório privado.
-- Copie este arquivo pelo GitHub (logado) ou use o SQL completo abaixo.
-- GitHub: github.com/maikelimaadm-stack/PROJETOMG/blob/main/backend/scripts/supabase/resetAndSeedMaike.sql
-- =============================================================================

-- ── PASSO 1: Garantir schema ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "EntidadeCodigoSequencia" (
    "id" TEXT NOT NULL, "cliente_id" VARCHAR(64) NOT NULL, "entity_name" VARCHAR(128) NOT NULL,
    "next_codigo" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EntidadeCodigoSequencia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EntidadeCodigoSequencia_cliente_id_entity_name_key" ON "EntidadeCodigoSequencia"("cliente_id", "entity_name");

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

CREATE TABLE IF NOT EXISTS "registro_global" (
    "id" TEXT NOT NULL, "cliente_id" VARCHAR(64) NOT NULL, "id_global" INTEGER NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL, "registro_id" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "registro_global_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "registro_global_cliente_id_id_global_key" ON "registro_global"("cliente_id", "id_global");

CREATE TABLE IF NOT EXISTS "ClienteModulo" (
    "id" TEXT NOT NULL, "cliente_id" VARCHAR(64) NOT NULL, "modulo" VARCHAR(64) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ClienteModulo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ClienteModulo_cliente_id_modulo_key" ON "ClienteModulo"("cliente_id", "modulo");

-- ── PASSO 2: Reset dados ──────────────────────────────────────────────────────
TRUNCATE TABLE
  "UsuarioPreferencia",
  "PermissaoEmpresa",
  "RegistroAnexo",
  "registro_global",
  "CadastroRegistro",
  "CadCpsHistorico",
  "CadCpsCampoOpcao",
  "CadCpsCampoEmpresa",
  "CadCpsCampoTela",
  "CadCpsCampo",
  "EntidadeCodigoSequencia",
  "ClienteModulo",
  "AuditLog",
  "Empresa",
  "Usuario",
  "Cliente",
  "CadCpsTela"
RESTART IDENTITY CASCADE;

DROP TABLE IF EXISTS "CampoPersonalizado" CASCADE;
DROP TABLE IF EXISTS "EmpresaCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "CadCpsCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "ClienteIdGlobalSequencia" CASCADE;

INSERT INTO "Cliente" (
  "id", "codigo", "nome", "status", "plano", "next_id_global", "ativo", "createdAt", "updatedAt"
) VALUES (
  'cl_maike_seed_001',
  'maike',
  'Maike',
  'Ativo',
  'DEMO',
  1,
  true,
  NOW(),
  NOW()
);

INSERT INTO "Usuario" (
  "id", "cliente_id", "codigo", "nome", "login", "email",
  "senha_hash", "perfil", "acesso_global", "ativo", "createdAt", "updatedAt"
) VALUES (
  'usr_maike_seed_001',
  'cl_maike_seed_001',
  1,
  'Maike',
  'maike',
  'maike@local.dev',
  '$2b$10$LN9C39pV0rHXi388CzvEDedslQ1F4lVo.kbGU7Kk2qkJE5rcX4eY.',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
);

INSERT INTO "ClienteModulo" ("id", "cliente_id", "modulo", "ativo", "createdAt", "updatedAt")
VALUES
  ('cm_empresas', 'cl_maike_seed_001', 'EMPRESAS', true, NOW(), NOW()),
  ('cm_pecuaria', 'cl_maike_seed_001', 'PECUARIA', false, NOW(), NOW()),
  ('cm_financeiro', 'cl_maike_seed_001', 'FINANCEIRO', false, NOW(), NOW()),
  ('cm_estoque', 'cl_maike_seed_001', 'ESTOQUE', false, NOW(), NOW()),
  ('cm_compras', 'cl_maike_seed_001', 'COMPRAS', false, NOW(), NOW()),
  ('cm_vendas', 'cl_maike_seed_001', 'VENDAS', false, NOW(), NOW());

INSERT INTO "CadCpsTela" (
  "id", "codigo", "nome", "entity_name", "ordem", "ativo", "createdAt", "updatedAt"
) VALUES (
  'tela_empresas_001',
  'EMPRESAS',
  'Empresas',
  'EmpresaCadastro',
  10,
  true,
  NOW(),
  NOW()
);

INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
VALUES
  ('seq_emp_maike', 'cl_maike_seed_001', 'Empresa', 1, NOW(), NOW()),
  ('seq_cps_maike', 'cl_maike_seed_001', 'CadCpsCampo', 1, NOW(), NOW());

SELECT
  c.codigo AS cliente,
  u.login AS usuario,
  u.perfil,
  u.acesso_global
FROM "Cliente" c
JOIN "Usuario" u ON u.cliente_id = c.id
WHERE c.codigo = 'maike';
