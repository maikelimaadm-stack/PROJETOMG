import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getPrismaClient } from "../../database/prismaClient.js";
import { setSessionEmpresas, getSessionEmpresas } from "./sessionCache.js";

const sanitizeUser = (user) => ({
  id: user.id,
  cliente_id: user.cliente_id,
  codigo: user.codigo ?? null,
  nome: user.nome ?? null,
  login: user.login,
  email: user.email ?? null,
  telefone: user.telefone ?? null,
  perfil: user.perfil,
  acesso_global: user.acesso_global,
  ativo: user.ativo !== false,
  ultimo_acesso: user.ultimo_acesso ?? null,
});

const sanitizeCliente = (cliente) => ({
  id: cliente.id,
  codigo: cliente.codigo,
  nome: cliente.nome,
  cpf_cnpj: cliente.cpf_cnpj ?? null,
  telefone: cliente.telefone ?? null,
  email: cliente.email ?? null,
  status: cliente.status ?? "Ativo",
  plano: cliente.plano ?? null,
  limite_usuarios: cliente.limite_usuarios ?? null,
  limite_empresas: cliente.limite_empresas ?? null,
  data_vencimento: cliente.data_vencimento ?? null,
});

const sanitizeEmpresa = (empresa) => ({
  id: empresa.id,
  codempresa: empresa.codempresa,
  nome_empresa: empresa.razao_social,
});

const normalizeCredentials = ({ cliente, usuario }) => ({
  clienteCodigo: String(cliente || "").trim().toLowerCase(),
  login: String(usuario || "").trim().toLowerCase(),
});

const fetchEmpresasPermitidas = async (usuario, { limit = 50, totalEmpresas = null } = {}) => {
  const prisma = getPrismaClient();
  const select = {
    id: true,
    codempresa: true,
    razao_social: true,
  };
  const orderBy = [{ codempresa: "asc" }];

  if (usuario.acesso_global) {
    const empresas = await prisma.empresa.findMany({
      where: { cliente_id: usuario.cliente_id },
      orderBy,
      select,
      take: limit,
    });
    const total = totalEmpresas ?? empresas.length;
    return {
      items: empresas.map(sanitizeEmpresa),
      total,
      hasMore: total > empresas.length,
    };
  }

  const permissoes = await prisma.permissaoEmpresa.findMany({
    where: { usuario_id: usuario.id },
    include: { empresa: { select } },
  });
  const all = permissoes.map((item) => item.empresa).filter(Boolean).map(sanitizeEmpresa);
  return {
    items: all.slice(0, limit),
    total: all.length,
    hasMore: all.length > limit,
  };
};

const loadAllowedEmpresaIds = async (prisma, usuario) => {
  if (usuario.acesso_global) return [];
  const rows = await prisma.permissaoEmpresa.findMany({
    where: { usuario_id: usuario.id },
    select: { empresa_id: true },
  });
  return rows.map((row) => row.empresa_id);
};

export const loginWithCredentials = async ({ cliente, usuario, senha }) => {
  const prisma = getPrismaClient();
  const { clienteCodigo, login } = normalizeCredentials({ cliente, usuario });

  const clienteData = await prisma.cliente.findFirst({
    where: {
      codigo: {
        equals: clienteCodigo,
        mode: "insensitive",
      },
      ativo: true,
    },
    select: {
      id: true,
      codigo: true,
      nome: true,
      cpf_cnpj: true,
      telefone: true,
      email: true,
      status: true,
      plano: true,
      limite_usuarios: true,
      limite_empresas: true,
      data_vencimento: true,
    },
  });
  if (!clienteData) {
    throw new Error("Cliente inválido.");
  }

  const usuarioData = await prisma.usuario.findFirst({
    where: {
      cliente_id: clienteData.id,
      login: {
        equals: login,
        mode: "insensitive",
      },
      ativo: true,
    },
  });

  if (!usuarioData) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const isPasswordValid = await bcrypt.compare(String(senha || ""), usuarioData.senha_hash);
  if (!isPasswordValid) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const [allowedEmpresaIds] = await Promise.all([
    loadAllowedEmpresaIds(prisma, usuarioData),
    prisma.usuario.update({
      where: { id: usuarioData.id },
      data: { ultimo_acesso: new Date() },
    }),
  ]);
  usuarioData.ultimo_acesso = new Date();

  const empresasResult = await fetchEmpresasPermitidas(usuarioData);
  const empresas = empresasResult.items || [];
  let empresasTotal = empresasResult.total || empresas.length;
  if (usuarioData.acesso_global && empresasTotal <= empresas.length) {
    try {
      const { getEmpresaCount } = await import("../metrics/counterService.js");
      empresasTotal = await getEmpresaCount({
        userId: usuarioData.id,
        clienteId: clienteData.id,
        acessoGlobal: true,
        allowedEmpresaIds: [],
        allowAllEmpresas: true,
      });
    } catch {
      empresasTotal = empresas.length;
    }
  }
  const selectedEmpresaId = usuarioData.acesso_global
    ? "all"
    : empresas.length === 1
      ? empresas[0].id
      : null;
  const allowAllEmpresas = Boolean(usuarioData.acesso_global);

  setSessionEmpresas(usuarioData.id, { ...empresasResult, total: empresasTotal });

  return {
    cliente: sanitizeCliente(clienteData),
    user: sanitizeUser(usuarioData),
    empresas,
    empresasTotal,
    empresasHasMore: Boolean(empresasResult.hasMore),
    selectedEmpresaId,
    allowAllEmpresas,
    allowedEmpresaIds,
  };
};

export const listEmpresasFromSession = async (sessionUser) => {
  const cached = getSessionEmpresas(sessionUser.id);
  if (cached?.items) return cached.items;
  return [];
};

export const createSessionTokenPayload = (session) => ({
  jti: randomUUID(),
  sub: session.user.id,
  id: session.user.id,
  cliente_id: session.user.cliente_id,
  login: session.user.login,
  perfil: session.user.perfil,
  acesso_global: session.user.acesso_global,
  ativo: session.user.ativo !== false,
  allowed_empresa_ids: session.allowedEmpresaIds || [],
  empresas_total: session.empresasTotal ?? session.empresas?.length ?? 0,
});

export const sanitizeSessionUser = sanitizeUser;

export const buildSessionUserFromToken = (tokenUser) =>
  sanitizeUser({
    id: tokenUser.id || tokenUser.sub,
    cliente_id: tokenUser.cliente_id,
    codigo: tokenUser.codigo ?? null,
    nome: tokenUser.nome ?? null,
    login: tokenUser.login,
    email: tokenUser.email ?? null,
    telefone: tokenUser.telefone ?? null,
    perfil: tokenUser.perfil,
    acesso_global: tokenUser.acesso_global,
    ativo: tokenUser.ativo !== false,
    ultimo_acesso: tokenUser.ultimo_acesso ?? null,
  });
