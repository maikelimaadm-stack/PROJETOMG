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

  const timeoutMs = Number(process.env.MIGRATION_CONNECT_TIMEOUT_MS || 15_000);
  const sep = url.includes("?") ? "&" : "?";
  const urlWithTimeout = `${url}${sep}connect_timeout=${Math.ceil(timeoutMs / 1000)}`;

  return new PrismaClient({
    datasources: { db: { url: urlWithTimeout } },
  });
};

export const isRestructureApplied = async (prisma) => {
  try {
    const { getMissingSchemaItems } = await import("./ensureSchema.js");
    const missing = await getMissingSchemaItems(prisma);
    return missing.length === 0;
  } catch {
    return false;
  }
};
