-- Contadores materializados + índice de permissões por usuário
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "total_empresas" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "total_cadcps_campos" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "PermissaoEmpresa_usuario_id_idx" ON "PermissaoEmpresa"("usuario_id");

UPDATE "Cliente" c
SET "total_empresas" = COALESCE(sub.total, 0)
FROM (
  SELECT "cliente_id", COUNT(*)::int AS total
  FROM "Empresa"
  GROUP BY "cliente_id"
) sub
WHERE c.id = sub.cliente_id;

UPDATE "Cliente" c
SET "total_cadcps_campos" = COALESCE(sub.total, 0)
FROM (
  SELECT "cliente_id", COUNT(*)::int AS total
  FROM "CadCpsCampo"
  GROUP BY "cliente_id"
) sub
WHERE c.id = sub.cliente_id;
