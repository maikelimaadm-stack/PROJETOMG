import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

/**
 * Migrations DDL devem usar DIRECT_URL (porta 5432).
 * DATABASE_URL com pgbouncer (6543) falha em vários comandos SQL no Supabase.
 */
export const createMigrationPrisma = () => {
  const directUrl = String(process.env.DIRECT_URL || "").trim();
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();

  if (!directUrl && !databaseUrl) {
    throw new Error("DATABASE_URL ou DIRECT_URL deve estar configurada.");
  }

  const url = directUrl || databaseUrl;
  if (databaseUrl.includes("pgbouncer=true") && !directUrl) {
    console.warn(
      "[migration] AVISO: usando DATABASE_URL com pgbouncer. Configure DIRECT_URL para migrations confiáveis."
    );
  }

  return new PrismaClient({
    datasources: { db: { url } },
  });
};

export const isRestructureApplied = async (prisma) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Cliente'
          AND column_name = 'next_id_global'
      ) AS ok
    `;
    return Boolean(rows[0]?.ok);
  } catch {
    return false;
  }
};
