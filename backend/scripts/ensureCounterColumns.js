/**
 * Garante colunas de contadores materializados e sincroniza totais existentes.
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const STATEMENTS = [
  `ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "total_empresas" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "total_cadcps_campos" INTEGER NOT NULL DEFAULT 0`,
  `CREATE INDEX IF NOT EXISTS "PermissaoEmpresa_usuario_id_idx" ON "PermissaoEmpresa"("usuario_id")`,
];

export const ensureCounterColumns = async () => {
  if (!process.env.DATABASE_URL) {
    return { applied: false, reason: "DATABASE_URL ausente" };
  }

  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "Cliente" c
    SET "total_empresas" = sub.total
    FROM (
      SELECT "cliente_id", COUNT(*)::int AS total
      FROM "Empresa"
      GROUP BY "cliente_id"
    ) sub
    WHERE c.id = sub.cliente_id
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "Cliente" c
    SET "total_cadcps_campos" = sub.total
    FROM (
      SELECT "cliente_id", COUNT(*)::int AS total
      FROM "CadCpsCampo"
      GROUP BY "cliente_id"
    ) sub
    WHERE c.id = sub.cliente_id
  `);

  return { applied: true };
};

const isDirectRun = process.argv[1]?.includes("ensureCounterColumns");

if (isDirectRun) {
  ensureCounterColumns()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
