import { getPrismaClient } from "../../database/prismaClient.js";

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

const loadAllowedEmpresaIdsFromDb = async (userId) => {
  const prisma = getPrismaClient();
  const rows = await prisma.permissaoEmpresa.findMany({
    where: { usuario_id: userId },
    select: { empresa_id: true },
  });
  return rows.map((row) => row.empresa_id);
};

const loadFreshUserState = async (userId) => {
  const prisma = getPrismaClient();
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      cliente_id: true,
      codigo: true,
      nome: true,
      login: true,
      email: true,
      telefone: true,
      perfil: true,
      acesso_global: true,
      ativo: true,
      ultimo_acesso: true,
    },
  });
  if (!user || user.ativo === false) {
    throw withStatus("Usuário sem acesso.", 401);
  }
  return user;
};

/**
 * Constrói escopo usando estado atual do banco (evita claims JWT obsoletas).
 */
export const loadAccessScope = async (request) => {
  if (request.accessScope) return request.accessScope;

  const authUserId = getAuthUserId(request);
  if (!authUserId || !request.user) {
    throw withStatus("Sessão inválida.", 401);
  }

  const freshUser = await loadFreshUserState(authUserId);
  const acessoGlobal = Boolean(freshUser.acesso_global);
  let allowedEmpresaIds = [];
  if (!acessoGlobal) {
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
    clienteId: String(freshUser.cliente_id),
    perfil: freshUser.perfil,
    acessoGlobal,
    allowedEmpresaIds,
    requestedEmpresaId,
    selectedEmpresaId,
    allowAllEmpresas: acessoGlobal && !selectedEmpresaId,
    user: freshUser,
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
