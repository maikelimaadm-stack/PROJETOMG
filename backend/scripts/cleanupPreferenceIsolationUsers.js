/**
 * Cleanup — remove dados de seed PR #223 (staging only).
 *
 * Uso:
 *   NODE_ENV=staging DATABASE_URL=postgresql://... \
 *   node backend/scripts/cleanupPreferenceIsolationUsers.js --allow-staging-cleanup
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";
import {
  assertStagingSeedAllowed,
  maskId,
  PREF_ISOLATION_SEED_MARKER,
  PREF_ISOLATION_TENANTS,
  PREF_ISOLATION_USERS,
} from "./stagingSeedGuard.js";

dotenv.config();

export const cleanupPreferenceIsolationUsers = async (prisma = new PrismaClient()) => {
  assertStagingSeedAllowed({
    allowFlag: process.argv.includes("--allow-staging-cleanup"),
    scriptLabel: "cleanupPreferenceIsolationUsers",
  });

  const report = {
    preferenciasRemoved: 0,
    empresasRemoved: 0,
    usuariosRemoved: 0,
    tenantsRemoved: 0,
  };

  const tenants = await prisma.cliente.findMany({
    where: { codigo: { in: PREF_ISOLATION_TENANTS.map((t) => t.codigo) } },
    select: { id: true, codigo: true },
  });

  for (const tenant of tenants) {
    const users = await prisma.usuario.findMany({
      where: {
        cliente_id: tenant.id,
        login: { in: PREF_ISOLATION_USERS.filter((u) => u.tenantCodigo === tenant.codigo).map((u) => u.login) },
      },
      select: { id: true, login: true },
    });

    for (const user of users) {
      const prefResult = await prisma.usuarioPreferencia.deleteMany({
        where: { usuario_id: user.id, cliente_id: tenant.id },
      });
      report.preferenciasRemoved += prefResult.count;
    }

    if (users.length > 0) {
      const userResult = await prisma.usuario.deleteMany({
        where: { id: { in: users.map((u) => u.id) } },
      });
      report.usuariosRemoved += userResult.count;
    }

    const empresaResult = await prisma.empresa.deleteMany({
      where: {
        cliente_id: tenant.id,
        observacoes: { startsWith: PREF_ISOLATION_SEED_MARKER },
      },
    });
    report.empresasRemoved += empresaResult.count;

    const remainingUsers = await prisma.usuario.count({ where: { cliente_id: tenant.id } });
    const remainingEmpresas = await prisma.empresa.count({ where: { cliente_id: tenant.id } });
    if (remainingUsers === 0 && remainingEmpresas === 0) {
      await prisma.clienteModulo.deleteMany({ where: { cliente_id: tenant.id } });
      await prisma.cliente.delete({ where: { id: tenant.id } });
      report.tenantsRemoved += 1;
    }
  }

  report.tenants = tenants.map((t) => ({ codigo: t.codigo, id: maskId(t.id) }));
  return report;
};

const run = async () => {
  const prisma = new PrismaClient();
  try {
    const report = await cleanupPreferenceIsolationUsers(prisma);
    console.log("[cleanup-pref-isolation] OK");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await prisma.$disconnect();
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run().catch((error) => {
    console.error("[cleanup-pref-isolation] FATAL:", error.message);
    process.exit(1);
  });
}
