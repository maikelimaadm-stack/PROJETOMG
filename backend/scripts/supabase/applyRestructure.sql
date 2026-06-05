-- =============================================================================
-- APLICAR REESTRUTURAÇÃO NO SUPABASE — execute no SQL Editor do painel
-- Projeto: https://supabase.com/dashboard/project/vjvayvvusubfwfofhnqy
-- Menu: SQL Editor → New query → cole este arquivo inteiro → Run
-- =============================================================================

-- ── 1) Sequência corporativa (criar antes de migrar legado) ─────────────────
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

-- Migrar sequências legadas → EntidadeCodigoSequencia
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'EmpresaCodigoSequencia') THEN
    INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
    SELECT
      'mig_emp_' || s."cliente_id",
      s."cliente_id",
      'Empresa',
      s."next_codigo",
      COALESCE(s."createdAt", NOW()),
      NOW()
    FROM "EmpresaCodigoSequencia" s
    ON CONFLICT ("cliente_id", "entity_name") DO UPDATE
      SET "next_codigo" = GREATEST("EntidadeCodigoSequencia"."next_codigo", EXCLUDED."next_codigo"),
          "updatedAt" = NOW();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CadCpsCodigoSequencia') THEN
    INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
    SELECT
      'mig_cps_' || s."cliente_id",
      s."cliente_id",
      'CadCpsCampo',
      s."next_codigo",
      COALESCE(s."createdAt", NOW()),
      NOW()
    FROM "CadCpsCodigoSequencia" s
    ON CONFLICT ("cliente_id", "entity_name") DO UPDATE
      SET "next_codigo" = GREATEST("EntidadeCodigoSequencia"."next_codigo", EXCLUDED."next_codigo"),
          "updatedAt" = NOW();
  END IF;
END $$;

-- ── 2) ID Global em Cliente.next_id_global ──────────────────────────────────
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "next_id_global" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClienteIdGlobalSequencia') THEN
    UPDATE "Cliente" c
    SET "next_id_global" = GREATEST(c."next_id_global", s."next_id_global")
    FROM "ClienteIdGlobalSequencia" s
    WHERE s."cliente_id" = c."id";
  END IF;
END $$;

DROP TABLE IF EXISTS "ClienteIdGlobalSequencia" CASCADE;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registro_global_cliente_id_fkey') THEN
    ALTER TABLE "registro_global"
      ADD CONSTRAINT "registro_global_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ── 3) Remover tenant_id ────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Empresa' AND column_name = 'tenant_id') THEN
    UPDATE "Empresa" SET "cliente_id" = "tenant_id" WHERE "cliente_id" IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'RegistroAnexo' AND column_name = 'tenant_id') THEN
    UPDATE "RegistroAnexo" SET "cliente_id" = "tenant_id" WHERE "cliente_id" IS NULL;
  END IF;
END $$;

ALTER TABLE "Empresa" DROP COLUMN IF EXISTS "tenant_id";
ALTER TABLE "RegistroAnexo" DROP COLUMN IF EXISTS "tenant_id";

-- ── 4) Expandir Cliente ─────────────────────────────────────────────────────
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

-- ── 5) Expandir Usuario ─────────────────────────────────────────────────────
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "nome" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telefone" VARCHAR(32);
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "ultimo_acesso" TIMESTAMP(3);

-- ── 6) ClienteModulo ──────────────────────────────────────────────────────────
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

-- ── 7) CadastroRegistro.codigo ────────────────────────────────────────────────
ALTER TABLE "CadastroRegistro" ADD COLUMN IF NOT EXISTS "codigo" INTEGER;

-- ── 8) Backfill ID Global (dados existentes) ────────────────────────────────
DO $$
DECLARE
  cid TEXT;
  rec RECORD;
  n INT;
BEGIN
  FOR cid IN SELECT id FROM "Cliente" LOOP
    DELETE FROM "registro_global" WHERE "cliente_id" = cid;
    n := 1;

    FOR rec IN
      SELECT src, rid, ename, created_at FROM (
        SELECT 'empresa'::text AS src, e.id AS rid, 'Empresa'::text AS ename, e."createdAt" AS created_at
        FROM "Empresa" e WHERE e."cliente_id" = cid
        UNION ALL
        SELECT 'cadcps', c.id, 'CadCpsCampo', c."createdAt"
        FROM "CadCpsCampo" c WHERE c."cliente_id" = cid
        UNION ALL
        SELECT 'cadastro', r.id, r."entity_name", r."createdAt"
        FROM "CadastroRegistro" r WHERE r."cliente_id" = cid
        UNION ALL
        SELECT 'anexo', a.id, 'RegistroAnexo', a."createdAt"
        FROM "RegistroAnexo" a WHERE a."cliente_id" = cid
      ) t
      ORDER BY created_at, rid
    LOOP
      IF rec.src = 'empresa' THEN
        UPDATE "Empresa" SET "id_global" = n WHERE id = rec.rid;
      ELSIF rec.src = 'cadcps' THEN
        UPDATE "CadCpsCampo" SET "id_global" = n WHERE id = rec.rid;
      ELSIF rec.src = 'cadastro' THEN
        UPDATE "CadastroRegistro" SET "id_global" = n WHERE id = rec.rid;
      ELSIF rec.src = 'anexo' THEN
        UPDATE "RegistroAnexo" SET "id_global" = n WHERE id = rec.rid;
      END IF;

      INSERT INTO "registro_global" ("id", "cliente_id", "id_global", "entity_name", "registro_id", "createdAt")
      VALUES (replace(gen_random_uuid()::text, '-', ''), cid, n, rec.ename, rec.rid, NOW())
      ON CONFLICT DO NOTHING;

      n := n + 1;
    END LOOP;

    UPDATE "Cliente" SET "next_id_global" = n WHERE id = cid;
  END LOOP;
END $$;

-- ── 9) Backfill CadastroRegistro.codigo ─────────────────────────────────────
DO $$
DECLARE
  cid TEXT;
  ename TEXT;
  rec RECORD;
  n INT;
BEGIN
  FOR cid IN SELECT id FROM "Cliente" LOOP
    FOR ename IN SELECT DISTINCT "entity_name" FROM "CadastroRegistro" WHERE "cliente_id" = cid LOOP
      SELECT COALESCE(MAX("codigo"), 0) + 1 INTO n
      FROM "CadastroRegistro"
      WHERE "cliente_id" = cid AND "entity_name" = ename;

      FOR rec IN
        SELECT id FROM "CadastroRegistro"
        WHERE "cliente_id" = cid AND "entity_name" = ename AND "codigo" IS NULL
        ORDER BY "createdAt" ASC
      LOOP
        UPDATE "CadastroRegistro" SET "codigo" = n WHERE id = rec.id;
        n := n + 1;
      END LOOP;

      INSERT INTO "EntidadeCodigoSequencia" ("id", "cliente_id", "entity_name", "next_codigo", "createdAt", "updatedAt")
      VALUES ('mig_reg_' || cid || '_' || ename, cid, ename, n, NOW(), NOW())
      ON CONFLICT ("cliente_id", "entity_name") DO UPDATE
        SET "next_codigo" = GREATEST("EntidadeCodigoSequencia"."next_codigo", EXCLUDED."next_codigo"),
            "updatedAt" = NOW();
    END LOOP;
  END LOOP;
END $$;

-- ── 10) Seed módulos padrão ─────────────────────────────────────────────────
INSERT INTO "ClienteModulo" ("id", "cliente_id", "modulo", "ativo", "createdAt", "updatedAt")
SELECT
  'mod_' || c.id || '_' || m.modulo,
  c.id,
  m.modulo,
  (m.modulo = 'EMPRESAS'),
  NOW(),
  NOW()
FROM "Cliente" c
CROSS JOIN (
  VALUES ('EMPRESAS'), ('PRODUTOS'), ('PECUARIA'), ('FINANCEIRO'), ('ESTOQUE'), ('COMPRAS'), ('VENDAS')
) AS m(modulo)
ON CONFLICT ("cliente_id", "modulo") DO NOTHING;

-- ── 11) Índices e limpeza final ─────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "Empresa_cliente_id_id_global_key"
  ON "Empresa"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_id_global_key"
  ON "CadCpsCampo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_id_global_key"
  ON "CadastroRegistro"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_id_global_key"
  ON "RegistroAnexo"("cliente_id", "id_global") WHERE "id_global" IS NOT NULL;

DROP TABLE IF EXISTS "EmpresaCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "CadCpsCodigoSequencia" CASCADE;
DROP TABLE IF EXISTS "CampoPersonalizado" CASCADE;

-- ── Verificação rápida ──────────────────────────────────────────────────────
SELECT 'Cliente.next_id_global' AS check_item,
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Cliente' AND column_name = 'next_id_global') AS ok
UNION ALL
SELECT 'EntidadeCodigoSequencia',
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'EntidadeCodigoSequencia')
UNION ALL
SELECT 'ClienteModulo',
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClienteModulo')
UNION ALL
SELECT 'registro_global',
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registro_global')
UNION ALL
SELECT 'sem ClienteIdGlobalSequencia',
       NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClienteIdGlobalSequencia');
