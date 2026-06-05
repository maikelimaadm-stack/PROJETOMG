-- =============================================================================
-- RESET COMPLETO + SEED CLIENTE/USUÁRIO MAIKE
--
-- ATENÇÃO: apaga TODOS os registros das tabelas listadas abaixo.
-- Copie TODO este conteúdo no SQL Editor do Supabase e clique em Run.
--
-- Login após execução:
--   Cliente: maike
--   Usuário: maike
--   Senha:   123
-- =============================================================================

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
  ('cm_produtos', 'cl_maike_seed_001', 'PRODUTOS', false, NOW(), NOW()),
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

SELECT
  c.codigo AS cliente,
  u.login AS usuario,
  u.perfil,
  u.acesso_global
FROM "Cliente" c
JOIN "Usuario" u ON u.cliente_id = c.id
WHERE c.codigo = 'maike';
