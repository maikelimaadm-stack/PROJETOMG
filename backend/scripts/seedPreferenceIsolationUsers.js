/**
 * Seed idempotente — Usuários A/B/C para validação PR #223 (staging only).
 *
 * Uso:
 *   NODE_ENV=staging DATABASE_URL=postgresql://... \
 *   PREF_ISOLATION_SEED_PASSWORD='sua-senha-teste' \
 *   node backend/scripts/seedPreferenceIsolationUsers.js --allow-staging-seed
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";
import {
  assertStagingSeedAllowed,
  maskId,
  PREF_ISOLATION_SEED_MARKER,
  PREF_ISOLATION_TENANTS,
  PREF_ISOLATION_USERS,
} from "./stagingSeedGuard.js";

dotenv.config();

const SEED_PASSWORD = String(process.env.PREF_ISOLATION_SEED_PASSWORD || "").trim();

const assertPasswordConfigured = () => {
  if (!SEED_PASSWORD || SEED_PASSWORD.length < 6) {
    throw new Error(
      "Defina PREF_ISOLATION_SEED_PASSWORD (mín. 6 caracteres) antes de executar o seed."
    );
  }
};

const ensureTenant = async (prisma, { codigo, nome }) => {
  const existing = await prisma.cliente.findFirst({
    where: { codigo: { equals: codigo, mode: "insensitive" } },
  });
  if (existing) {
    return { cliente: existing, created: false };
  }
  const cliente = await prisma.cliente.create({
    data: {
      codigo,
      nome,
      status: "Ativo",
      plano: "STAGING-PR223",
      ativo: true,
      next_id_global: 1,
    },
  });
  return { cliente, created: true };
};

const ensureUser = async (prisma, { clienteId, login, nome, codigo, senhaHash }) => {
  const existing = await prisma.usuario.findFirst({
    where: { cliente_id: clienteId, login: { equals: login, mode: "insensitive" } },
  });
  if (existing) {
    return { usuario: existing, created: false };
  }
  const usuario = await prisma.usuario.create({
    data: {
      cliente_id: clienteId,
      codigo,
      nome,
      login,
      email: `${login}@pr223-staging.local`,
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
  });
  return { usuario, created: true };
};

const ensureEmpresas = async (prisma, clienteId, tenantLabel) => {
  const marker = `${PREF_ISOLATION_SEED_MARKER}:${tenantLabel}`;
  const existingCount = await prisma.empresa.count({
    where: { cliente_id: clienteId, observacoes: marker },
  });
  if (existingCount >= 2) {
    return { created: 0, total: existingCount };
  }

  const templates = [
    {
      codempresa: 1,
      id_global: 1,
      razao_social: `${tenantLabel} Empresa Alpha PR223`,
      nome_fantasia: "Alpha PR223",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 1111-1111",
      email: `alpha-${tenantLabel}@pr223.local`,
      status: "Ativa",
    },
    {
      codempresa: 2,
      id_global: 2,
      razao_social: `${tenantLabel} Empresa Beta PR223`,
      nome_fantasia: "Beta PR223",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      telefone: "(21) 2222-2222",
      email: `beta-${tenantLabel}@pr223.local`,
      status: "Ativa",
    },
  ];

  let created = 0;
  for (const template of templates) {
    const found = await prisma.empresa.findFirst({
      where: { cliente_id: clienteId, codempresa: template.codempresa },
    });
    if (found) continue;
    await prisma.empresa.create({
      data: {
        ...template,
        cliente_id: clienteId,
        observacoes: marker,
        campos_personalizados: {},
      },
    });
    created += 1;
  }

  const total = await prisma.empresa.count({ where: { cliente_id: clienteId } });
  return { created, total };
};

export const seedPreferenceIsolationUsers = async (prisma = new PrismaClient()) => {
  assertStagingSeedAllowed({ scriptLabel: "seedPreferenceIsolationUsers" });
  assertPasswordConfigured();

  const senhaHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const report = { tenants: [], users: [], empresas: [] };

  for (const tenantDef of PREF_ISOLATION_TENANTS) {
    const { cliente, created } = await ensureTenant(prisma, tenantDef);
    report.tenants.push({
      codigo: cliente.codigo,
      id: maskId(cliente.id),
      created,
    });
  }

  await seedClienteModulos(prisma);

  const tenantByCodigo = Object.fromEntries(
    (
      await prisma.cliente.findMany({
        where: {
          codigo: { in: PREF_ISOLATION_TENANTS.map((t) => t.codigo) },
        },
      })
    ).map((row) => [row.codigo.toLowerCase(), row])
  );

  for (const userDef of PREF_ISOLATION_USERS) {
    const tenant = tenantByCodigo[userDef.tenantCodigo.toLowerCase()];
    if (!tenant) {
      throw new Error(`Tenant ${userDef.tenantCodigo} não encontrado após seed.`);
    }
    const { usuario, created } = await ensureUser(prisma, {
      clienteId: tenant.id,
      login: userDef.login,
      nome: userDef.nome,
      codigo: userDef.codigo,
      senhaHash,
    });
    report.users.push({
      login: usuario.login,
      tenant: userDef.tenantCodigo,
      id: maskId(usuario.id),
      created,
    });
  }

  for (const tenantDef of PREF_ISOLATION_TENANTS) {
    const tenant = tenantByCodigo[tenantDef.codigo.toLowerCase()];
    const empresas = await ensureEmpresas(prisma, tenant.id, tenantDef.codigo);
    report.empresas.push({ tenant: tenantDef.codigo, ...empresas });
  }

  return report;
};

const run = async () => {
  const prisma = new PrismaClient();
  try {
    const report = await seedPreferenceIsolationUsers(prisma);
    console.log("[seed-pref-isolation] OK");
    console.log(JSON.stringify(report, null, 2));
    console.log(
      "[seed-pref-isolation] Senha configurada via PREF_ISOLATION_SEED_PASSWORD (valor não exibido)."
    );
    console.log("[seed-pref-isolation] Logins: usera/userb @ tenant1, userc @ tenant2");
  } finally {
    await prisma.$disconnect();
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run().catch((error) => {
    console.error("[seed-pref-isolation] FATAL:", error.message);
    process.exit(1);
  });
}
