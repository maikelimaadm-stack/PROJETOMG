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

export const loadAccessScope = async (request) => {
  if (request.accessScope) return request.accessScope;

  const prisma = getPrismaClient();
  const authUserId = getAuthUserId(request);
  if (!authUserId) {
    throw withStatus("Sessão inválida.", 401);
  }

  const user = await prisma.usuario.findUnique({
    where: { id: authUserId },
    include: {
      permissoes: {
        select: { empresa_id: true },
      },
    },
  });
  if (!user || !user.ativo) {
    throw withStatus("Usuário sem acesso.", 401);
  }

  const requestedEmpresaId = normalizeEmpresaHeader(request.headers["x-empresa-id"]);
  const allowedEmpresaIds = user.permissoes.map((item) => item.empresa_id);

  if (!user.acesso_global && allowedEmpresaIds.length === 0) {
    throw withStatus("Usuário sem permissão em empresas.", 403);
  }

  if (!user.acesso_global && requestedEmpresaId === "all") {
    throw withStatus("Usuário sem permissão para visualizar todas as empresas.", 403);
  }

  if (
    !user.acesso_global &&
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
    userId: user.id,
    clienteId: user.cliente_id,
    perfil: user.perfil,
    acessoGlobal: user.acesso_global,
    allowedEmpresaIds,
    requestedEmpresaId,
    selectedEmpresaId,
    allowAllEmpresas: user.acesso_global && !selectedEmpresaId,
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

