const normalizeEmpresaHeader = (value) => {
  const parsed = String(value || "").trim();
  if (!parsed) return null;
  if (parsed.toLowerCase() === "all") return "all";
  return parsed;
};

const getAuthUserId = (request) => {
  const tokenUserId = request.user?.id || request.user?.sub;
  return tokenUserId ? String(tokenUserId) : null;
};

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const readAllowedEmpresaIds = (user) => {
  if (user.acesso_global) return [];
  const raw = user.allowed_empresa_ids;
  if (Array.isArray(raw)) return raw.map(String);
  return [];
};

const loadAllowedEmpresaIdsFromDb = async (userId) => {
  const { getPrismaClient } = await import("../../database/prismaClient.js");
  const prisma = getPrismaClient();
  const rows = await prisma.permissaoEmpresa.findMany({
    where: { usuario_id: userId },
    select: { empresa_id: true },
  });
  return rows.map((row) => row.empresa_id);
};

/**
 * Constrói escopo a partir do JWT (sem query ao banco na maioria dos casos).
 */
export const loadAccessScope = async (request) => {
  if (request.accessScope) return request.accessScope;

  const user = request.user;
  const authUserId = getAuthUserId(request);
  if (!authUserId || !user) {
    throw withStatus("Sessão inválida.", 401);
  }

  if (user.ativo === false) {
    throw withStatus("Usuário sem acesso.", 401);
  }

  const acessoGlobal = Boolean(user.acesso_global);
  let allowedEmpresaIds = readAllowedEmpresaIds(user);

  if (!acessoGlobal && !Array.isArray(user.allowed_empresa_ids)) {
    allowedEmpresaIds = await loadAllowedEmpresaIdsFromDb(authUserId);
  }
  const requestedEmpresaId = normalizeEmpresaHeader(request.headers["x-empresa-id"]);

  if (!acessoGlobal && allowedEmpresaIds.length === 0) {
    throw withStatus("Usuário sem permissão em empresas.", 403);
  }

  if (!acessoGlobal && requestedEmpresaId === "all") {
    throw withStatus("Usuário sem permissão para visualizar todas as empresas.", 403);
  }

  if (
    !acessoGlobal &&
    requestedEmpresaId &&
    requestedEmpresaId !== "all" &&
    !allowedEmpresaIds.includes(requestedEmpresaId)
  ) {
    throw withStatus("Empresa não permitida para este usuário.", 403);
  }

  let selectedEmpresaId = null;
  if (requestedEmpresaId && requestedEmpresaId !== "all") {
    selectedEmpresaId = requestedEmpresaId;
  }

  const scope = {
    userId: authUserId,
    clienteId: String(user.cliente_id),
    perfil: user.perfil,
    acessoGlobal,
    allowedEmpresaIds,
    requestedEmpresaId,
    selectedEmpresaId,
    allowAllEmpresas: acessoGlobal && !selectedEmpresaId,
  };

  request.accessScope = scope;
  return scope;
};

export const assertRole = (scope, roles = []) => {
  if (!roles.includes(scope.perfil)) {
    const error = new Error("Perfil sem permissão para esta operação.");
    error.statusCode = 403;
    throw error;
  }
};
