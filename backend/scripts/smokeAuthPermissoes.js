import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3001";
const prisma = new PrismaClient();

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (path, { method = "GET", token, empresaId, body } = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(empresaId ? { "X-Empresa-Id": empresaId } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, payload };
};

const login = async ({ cliente = "demo", usuario = "demo", senha = "123" } = {}) => {
  const { ok, payload, status } = await requestJson("/api/auth/login", {
    method: "POST",
    body: { cliente, usuario, senha },
  });
  if (!ok) {
    throw new Error(`login ${cliente}/${usuario} falhou (${status}): ${payload?.message || "sem payload"}`);
  }
  return payload;
};

const run = async () => {
  const tag = Date.now();
  const restritoLogin = `restrito_${tag}`.slice(0, 30);
  const senhaPlano = "123";

  console.log("Iniciando smoke de login/permissões/multiempresa...");

  const adminSession = await login();
  const adminToken = adminSession.token;
  assert(adminToken, "Token admin ausente.");

  const createEmpresaA = await requestJson("/api/empresas", {
    method: "POST",
    token: adminToken,
    empresaId: "all",
    body: {
      razao_social: `EMPRESA PERM A ${tag}`,
      nome_fantasia: `PERM_A_${tag}`,
      status: "Ativa",
      cidade: "Uberlandia",
    },
  });
  assert(createEmpresaA.ok, `Falha ao criar empresa A: ${createEmpresaA.payload?.message || createEmpresaA.status}`);
  const empresaA = createEmpresaA.payload.item;

  const createEmpresaB = await requestJson("/api/empresas", {
    method: "POST",
    token: adminToken,
    empresaId: "all",
    body: {
      razao_social: `EMPRESA PERM B ${tag}`,
      nome_fantasia: `PERM_B_${tag}`,
      status: "Ativa",
      cidade: "Ribeirao Preto",
    },
  });
  assert(createEmpresaB.ok, `Falha ao criar empresa B: ${createEmpresaB.payload?.message || createEmpresaB.status}`);
  const empresaB = createEmpresaB.payload.item;

  const clienteDemo = await prisma.cliente.findFirst({
    where: { codigo: { equals: "demo", mode: "insensitive" } },
    select: { id: true },
  });
  assert(clienteDemo?.id, "Cliente demo não encontrado.");

  const senhaHash = await bcrypt.hash(senhaPlano, 10);
  const restritoUser = await prisma.usuario.upsert({
    where: {
      cliente_id_login: {
        cliente_id: clienteDemo.id,
        login: restritoLogin,
      },
    },
    create: {
      cliente_id: clienteDemo.id,
      login: restritoLogin,
      senha_hash: senhaHash,
      perfil: "OPERADOR",
      acesso_global: false,
      ativo: true,
    },
    update: {
      senha_hash: senhaHash,
      perfil: "OPERADOR",
      acesso_global: false,
      ativo: true,
    },
  });

  await prisma.permissaoEmpresa.deleteMany({ where: { usuario_id: restritoUser.id } });
  await prisma.permissaoEmpresa.create({
    data: { usuario_id: restritoUser.id, empresa_id: empresaA.id },
  });

  const restritoSession = await login({
    cliente: "demo",
    usuario: restritoLogin,
    senha: senhaPlano,
  });
  const restritoToken = restritoSession.token;
  assert(restritoToken, "Token do usuário restrito ausente.");
  assert(restritoSession.allowAllEmpresas !== true, "Usuário restrito não pode ter escopo global.");

  const restritoListDefault = await requestJson("/api/empresas?page=1&pageSize=100", {
    token: restritoToken,
  });
  assert(restritoListDefault.ok, "Usuário restrito não conseguiu listar empresas permitidas.");
  const restritoIds = (restritoListDefault.payload.items || []).map((item) => item.id);
  assert(restritoIds.includes(empresaA.id), "Usuário restrito não vê empresa permitida.");
  assert(!restritoIds.includes(empresaB.id), "Usuário restrito visualizou empresa não permitida.");

  const restritoAll = await requestJson("/api/empresas?page=1&pageSize=20", {
    token: restritoToken,
    empresaId: "all",
  });
  assert(restritoAll.status === 403, "Usuário restrito não deveria acessar 'Todas as Empresas'.");

  const restritoEmpresaNaoPermitida = await requestJson("/api/empresas?page=1&pageSize=20", {
    token: restritoToken,
    empresaId: empresaB.id,
  });
  assert(
    restritoEmpresaNaoPermitida.status === 403,
    "Usuário restrito não deveria acessar empresa não permitida via cabeçalho."
  );

  const restritoDeleteNaoPermitido = await requestJson(`/api/empresas/${empresaB.id}`, {
    method: "DELETE",
    token: restritoToken,
    empresaId: empresaB.id,
  });
  assert(
    restritoDeleteNaoPermitido.status === 403 || restritoDeleteNaoPermitido.status === 404,
    "Usuário restrito não deveria excluir empresa não permitida."
  );

  const globalOperacao = await requestJson(`/api/empresas/${empresaB.id}`, {
    method: "PUT",
    token: adminToken,
    empresaId: empresaB.id,
    body: {
      razao_social: `EMPRESA PERM B ${tag} EDITADA`,
      status: "Ativa",
    },
  });
  assert(globalOperacao.ok, "Admin global não conseguiu editar empresa B.");

  const reloginAdmin = await login();
  const reloginList = await requestJson("/api/empresas?page=1&pageSize=100&search=PERM B", {
    token: reloginAdmin.token,
    empresaId: "all",
  });
  assert(reloginList.ok, "Falha ao listar empresas após novo login.");
  assert(
    (reloginList.payload.items || []).some((item) => item.id === empresaB.id),
    "Persistência falhou após novo login/reconsulta."
  );

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entity_name: "Empresa",
      entity_id: { in: [empresaA.id, empresaB.id] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  assert(auditLogs.length > 0, "Logs de auditoria não foram registrados.");

  await requestJson(`/api/empresas/${empresaA.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: "all",
  });
  await requestJson(`/api/empresas/${empresaB.id}`, {
    method: "DELETE",
    token: adminToken,
    empresaId: "all",
  });

  await prisma.permissaoEmpresa.deleteMany({ where: { usuario_id: restritoUser.id } });
  await prisma.usuario.delete({ where: { id: restritoUser.id } });

  console.log("Smoke de login/permissões/multiempresa concluído com sucesso.");
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error("Smoke de login/permissões falhou:", error.message);
    process.exit(1);
  });

