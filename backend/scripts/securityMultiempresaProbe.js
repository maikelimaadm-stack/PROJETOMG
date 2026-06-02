import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SMOKE_CLIENTE, SMOKE_SENHA, smokeLoginBody } from "./smokeCredentials.js";

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

const login = async (overrides = {}) => {
  const result = await requestJson("/api/auth/login", {
    method: "POST",
    body: smokeLoginBody(overrides),
  });
  if (!result.ok || !result.payload?.token) {
    throw new Error(`Falha ao autenticar para probe de segurança: ${result.payload?.message || result.status}`);
  }
  return result.payload;
};

const ensureConsultaUser = async (empresaId) => {
  const cliente = await prisma.cliente.findFirst({
    where: { codigo: { equals: SMOKE_CLIENTE, mode: "insensitive" } },
    select: { id: true },
  });
  assert(cliente?.id, `Cliente "${SMOKE_CLIENTE}" não encontrado. Execute npm run seed.`);

  const consultaLogin = "consulta_probe";
  const senhaHash = await bcrypt.hash(SMOKE_SENHA, 10);
  const consultaUser = await prisma.usuario.upsert({
    where: {
      cliente_id_login: {
        cliente_id: cliente.id,
        login: consultaLogin,
      },
    },
    create: {
      cliente_id: cliente.id,
      login: consultaLogin,
      senha_hash: senhaHash,
      perfil: "CONSULTA",
      acesso_global: false,
      ativo: true,
    },
    update: {
      senha_hash: senhaHash,
      perfil: "CONSULTA",
      acesso_global: false,
      ativo: true,
    },
  });

  await prisma.permissaoEmpresa.deleteMany({ where: { usuario_id: consultaUser.id } });
  await prisma.permissaoEmpresa.create({
    data: { usuario_id: consultaUser.id, empresa_id: empresaId },
  });

  return consultaLogin;
};

const run = async () => {
  const admin = await login();
  const adminEmpresaId = admin.empresas?.[0]?.id;

  const createEmpresaPermitida = adminEmpresaId
    ? { id: adminEmpresaId }
    : (
        await requestJson("/api/empresas", {
          method: "POST",
          token: admin.token,
          empresaId: "all",
          body: {
            razao_social: `EMPRESA PROBE PERMITIDA ${Date.now()}`,
            status: "Ativa",
          },
        })
      ).payload?.item;

  assert(createEmpresaPermitida?.id, "Não foi possível obter empresa permitida para probe.");

  const consultaLogin = await ensureConsultaUser(createEmpresaPermitida.id);
  const consulta = await login({ usuario: consultaLogin, senha: SMOKE_SENHA });

  const empresaPermitidaConsulta = consulta.empresas?.[0]?.id;
  assert(empresaPermitidaConsulta, "Usuário consulta sem empresa permitida.");

  const createEmpresaExtra = await requestJson("/api/empresas", {
    method: "POST",
    token: admin.token,
    empresaId: "all",
    body: {
      razao_social: `EMPRESA PROBE ${Date.now()}`,
      nome_fantasia: "EMPRESA PROBE",
      status: "Ativa",
    },
  });
  assert(createEmpresaExtra.ok, "Não foi possível criar empresa para probe.");
  const empresaNaoPermitida = createEmpresaExtra.payload.item.id;

  const forgedHeader = await requestJson("/api/empresas", {
    token: consulta.token,
    empresaId: empresaNaoPermitida,
  });
  assert(
    forgedHeader.status === 403,
    `Bypass de empresa detectado: consulta acessou empresa não autorizada (${forgedHeader.status}).`
  );

  const allScopeProbe = await requestJson("/api/empresas", {
    token: consulta.token,
    empresaId: "all",
  });
  assert(
    allScopeProbe.status === 403,
    `Bypass de escopo global detectado para usuário sem acesso global (${allScopeProbe.status}).`
  );

  const malformedTokenProbe = await requestJson("/api/empresas", {
    token: `${consulta.token}tampered`,
    empresaId: empresaPermitidaConsulta,
  });
  assert(
    malformedTokenProbe.status === 401,
    `Token inválido aceito indevidamente (${malformedTokenProbe.status}).`
  );

  const noTokenProbe = await requestJson("/api/empresas", {
    empresaId: empresaPermitidaConsulta,
  });
  assert(noTokenProbe.status === 401, `Rota protegida aceitou request sem token (${noTokenProbe.status}).`);

  if (!adminEmpresaId) {
    await requestJson(`/api/empresas/${createEmpresaPermitida.id}`, {
      method: "DELETE",
      token: admin.token,
      empresaId: createEmpresaPermitida.id,
    });
  }

  await requestJson(`/api/empresas/${empresaNaoPermitida}`, {
    method: "DELETE",
    token: admin.token,
    empresaId: empresaNaoPermitida,
  });

  const consultaUser = await prisma.usuario.findFirst({
    where: { login: "consulta_probe" },
    select: { id: true },
  });
  if (consultaUser?.id) {
    await prisma.permissaoEmpresa.deleteMany({ where: { usuario_id: consultaUser.id } });
    await prisma.usuario.delete({ where: { id: consultaUser.id } });
  }

  console.log("Probe de intrusão multiempresa concluído com sucesso.");
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(`Probe de intrusão falhou: ${error.message}`);
    process.exit(1);
  });
