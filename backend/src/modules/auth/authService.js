import bcrypt from "bcryptjs";
import { getPrismaClient } from "../../database/prismaClient.js";

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

const fetchEmpresasPermitidas = async (usuario, { limit = 50 } = {}) => {
  const prisma = getPrismaClient();
  const select = {
    id: true,
    codempresa: true,
    razao_social: true,
  };
  const orderBy = [{ codempresa: "asc" }];

  if (usuario.acesso_global) {
    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where: { cliente_id: usuario.cliente_id },
        orderBy,
        select,
        take: limit,
      }),
      prisma.empresa.count({ where: { cliente_id: usuario.cliente_id } }),
    ]);
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

  await prisma.usuario.update({
    where: { id: usuarioData.id },
    data: { ultimo_acesso: new Date() },
  });
  usuarioData.ultimo_acesso = new Date();

  const empresasResult = await fetchEmpresasPermitidas(usuarioData);
  const empresas = empresasResult.items || [];
  const selectedEmpresaId = usuarioData.acesso_global
    ? "all"
    : empresas.length === 1
      ? empresas[0].id
      : null;
  const allowAllEmpresas = Boolean(usuarioData.acesso_global);

  return {
    cliente: sanitizeCliente(clienteData),
    user: sanitizeUser(usuarioData),
    empresas,
    empresasTotal: empresasResult.total || empresas.length,
    empresasHasMore: Boolean(empresasResult.hasMore),
    selectedEmpresaId,
    allowAllEmpresas,
  };
};

export const listEmpresasFromSession = async (sessionUser) => {
  const prisma = getPrismaClient();
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessionUser.id },
  });
  if (!usuario || !usuario.ativo) {
    throw new Error("Sessão inválida.");
  }
  return fetchEmpresasPermitidas(usuario).then((result) => result.items || []);
};

export const createSessionTokenPayload = (session) => ({
  sub: session.user.id,
  id: session.user.id,
  cliente_id: session.user.cliente_id,
  login: session.user.login,
  perfil: session.user.perfil,
  acesso_global: session.user.acesso_global,
});

export const sanitizeSessionUser = sanitizeUser;
