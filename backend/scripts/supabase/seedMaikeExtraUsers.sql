-- =============================================================================
-- SEED — 5 usuários extras para o cliente maike (senha: 123)
-- Logins: mak1, mak2, mak3, mak4, mak5
--
-- Cole no SQL Editor do Supabase e clique em Run.
-- Idempotente: pode executar mais de uma vez (atualiza senha/nome se já existir).
-- =============================================================================

WITH cliente AS (
  SELECT id
  FROM "Cliente"
  WHERE LOWER(codigo) = 'maike'
  LIMIT 1
),
base_codigo AS (
  SELECT COALESCE(MAX(u.codigo), 0) AS max_codigo
  FROM "Usuario" u
  INNER JOIN cliente c ON c.id = u.cliente_id
),
rows AS (
  SELECT *
  FROM (
    VALUES
      ('mak1', 'MAK1', 1),
      ('mak2', 'MAK2', 2),
      ('mak3', 'MAK3', 3),
      ('mak4', 'MAK4', 4),
      ('mak5', 'MAK5', 5)
  ) AS t(login, nome, ordem)
)
INSERT INTO "Usuario" (
  "id",
  "cliente_id",
  "codigo",
  "nome",
  "login",
  "email",
  "senha_hash",
  "perfil",
  "acesso_global",
  "ativo",
  "createdAt",
  "updatedAt"
)
SELECT
  'usr_maike_' || r.login,
  c.id,
  b.max_codigo + r.ordem,
  r.nome,
  r.login,
  r.login || '@local.dev',
  '$2b$10$LN9C39pV0rHXi388CzvEDedslQ1F4lVo.kbGU7Kk2qkJE5rcX4eY.',
  'OPERADOR',
  true,
  true,
  NOW(),
  NOW()
FROM rows r
CROSS JOIN cliente c
CROSS JOIN base_codigo b
ON CONFLICT ("cliente_id", "login") DO UPDATE SET
  "nome" = EXCLUDED."nome",
  "senha_hash" = EXCLUDED."senha_hash",
  "perfil" = EXCLUDED."perfil",
  "acesso_global" = EXCLUDED."acesso_global",
  "ativo" = true,
  "updatedAt" = NOW();
