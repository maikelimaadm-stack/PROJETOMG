import bcrypt from "bcryptjs";
import { getPrismaClient } from "../../database/prismaClient.js";

const DEMO_CLIENTE_CODIGO = "demo";
const DEMO_CLIENTE_NOME = "Cliente Demo";
const DEMO_LOGIN = "demo";
const DEMO_PASSWORD = "123";

const sanitizeUser = (user) => ({
  id: user.id,
  cliente_id: user.cliente_id,
  login: user.login,
  perfil: user.perfil,
  acesso_global: user.acesso_global,
});

const sanitizeEmpresa = (empresa) => ({
  id: empresa.id,
  codigo_empresa: empresa.codigo_empresa,
  nome_empresa: empresa.razao_social,
});

const normalizeCredentials = ({ cliente, usuario }) => ({
  clienteCodigo: String(cliente || "").trim().toLowerCase(),
  login: String(usuario || "").trim().toLowerCase(),
});

export const ensureDemoIdentity = async () => {
  const prisma = getPrismaClient();
  const cliente = await prisma.cliente.upsert({
    where: { codigo: DEMO_CLIENTE_CODIGO },
    create: {
      id: DEMO_CLIENTE_CODIGO,
      codigo: DEMO_CLIENTE_CODIGO,
      nome: DEMO_CLIENTE_NOME,
      ativo: true,
    },
    update: {
      nome: DEMO_CLIENTE_NOME,
      ativo: true,
    },
  });

  const senhaHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usuario = await prisma.usuario.upsert({
    where: {
      cliente_id_login: {
        cliente_id: cliente.id,
        login: DEMO_LOGIN,
      },
    },
    create: {
      cliente_id: cliente.id,
      login: DEMO_LOGIN,
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
    update: {
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
  });

  const existingEmpresa = await prisma.empresa.findFirst({
    where: { cliente_id: cliente.id },
    orderBy: { codigo_empresa: "asc" },
    select: { id: true },
  });

  if (!existingEmpresa) {
    await prisma.empresa.create({
      data: {
        cliente_id: cliente.id,
        tenant_id: cliente.id,
        codigo_empresa: 1,
        razao_social: "EMPRESA DEMO",
        nome_fantasia: "EMPRESA DEMO",
        status: "Ativa",
      },
    });
  }

  return {
    cliente,
    usuario: sanitizeUser(usuario),
  };
};

const fetchEmpresasPermitidas = async (usuario) => {
  const prisma = getPrismaClient();
  if (usuario.acesso_global) {
    const empresas = await prisma.empresa.findMany({
      where: { cliente_id: usuario.cliente_id },
      orderBy: [{ codigo_empresa: "asc" }],
      select: {
        id: true,
        codigo_empresa: true,
        razao_social: true,
      },
    });
    return empresas.map(sanitizeEmpresa);
  }

  const permissoes = await prisma.permissaoEmpresa.findMany({
    where: { usuario_id: usuario.id },
    include: {
      empresa: {
        select: {
          id: true,
          codigo_empresa: true,
          razao_social: true,
        },
      },
    },
  });
  return permissoes
    .map((item) => item.empresa)
    .filter(Boolean)
    .map(sanitizeEmpresa);
};

export const loginWithCredentials = async ({ cliente, usuario, senha }) => {
  const prisma = getPrismaClient();
  await ensureDemoIdentity();

  const { clienteCodigo, login } = normalizeCredentials({ cliente, usuario });

  const clienteData = await prisma.cliente.findFirst({
    where: {
      codigo: {
        equals: clienteCodigo,
        mode: "insensitive",
      },
      ativo: true,
    },
    select: { id: true, codigo: true, nome: true },
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

  const empresas = await fetchEmpresasPermitidas(usuarioData);
  const selectedEmpresaId = usuarioData.acesso_global
    ? "all"
    : empresas.length === 1
      ? empresas[0].id
      : null;

  return {
    cliente: clienteData,
    user: sanitizeUser(usuarioData),
    empresas,
    selectedEmpresaId,
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
  return fetchEmpresasPermitidas(usuario);
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

