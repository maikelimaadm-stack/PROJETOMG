/**
 * RBAC padrão para módulos de cadastro — alinhado com useMakPermissions (frontend).
 */
export const CADASTRO_ROLE_RANK = {
  CONSULTA: 1,
  OPERADOR: 2,
  ADMIN: 3,
};

export const normalizeCadastroRole = (perfil) =>
  String(perfil || "OPERADOR").trim().toUpperCase();

export const cadastroRoleRank = (perfil) =>
  CADASTRO_ROLE_RANK[normalizeCadastroRole(perfil)] ?? CADASTRO_ROLE_RANK.OPERADOR;

export const assertCadastroMinimumRole = (scope, minimumRole = "CONSULTA") => {
  const current = cadastroRoleRank(scope?.perfil);
  const required = cadastroRoleRank(minimumRole);
  if (current < required) {
    const error = new Error("Perfil sem permissão para esta operação.");
    error.statusCode = 403;
    throw error;
  }
};

/** Leitura — CONSULTA+ */
export const assertCadastroReadRole = (scope) => assertCadastroMinimumRole(scope, "CONSULTA");

/** Criação/edição — OPERADOR+ */
export const assertCadastroMutationRole = (scope) => assertCadastroMinimumRole(scope, "OPERADOR");

/** Exclusão/export/config — ADMIN */
export const assertCadastroAdminRole = (scope) => assertCadastroMinimumRole(scope, "ADMIN");
