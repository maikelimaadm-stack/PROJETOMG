import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { runSqlFile } from "./sqlRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaSqlPath = path.resolve(__dirname, "supabase/ensureSchema.sql");

export const REQUIRED_SCHEMA_CHECKS = [
  { table: "Cliente", column: "cpf_cnpj" },
  { table: "Cliente", column: "next_id_global" },
  { table: "Cliente", column: "status" },
  { table: "Usuario", column: "ultimo_acesso" },
  { table: "Usuario", column: "codigo" },
];

export const getMissingSchemaItems = async (prisma) => {
  const missing = [];
  for (const { table, column } of REQUIRED_SCHEMA_CHECKS) {
    const rows = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${table}
          AND column_name = ${column}
      ) AS ok
    `;
    if (!rows[0]?.ok) missing.push(`${table}.${column}`);
  }

  for (const table of ["EntidadeCodigoSequencia", "ClienteModulo", "registro_global"]) {
    const rows = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${table}
      ) AS ok
    `;
    if (!rows[0]?.ok) missing.push(`table:${table}`);
  }

  return missing;
};

export const ensureSchema = async ({ exitOnError = false } = {}) => {
  const prisma = createMigrationPrisma();
  try {
    const missingBefore = await getMissingSchemaItems(prisma);
    if (missingBefore.length > 0) {
      console.log(`[schema] Colunas/tabelas faltando: ${missingBefore.join(", ")}`);
    }

    const count = await runSqlFile(prisma, schemaSqlPath, fs);
    console.log(`[schema] DDL aplicado (${count} comando(s)).`);

    const missingAfter = await getMissingSchemaItems(prisma);
    if (missingAfter.length > 0) {
      throw new Error(`Schema incompleto após sync: ${missingAfter.join(", ")}`);
    }

    console.log("[schema] Schema ERP verificado com sucesso.");
    return true;
  } catch (error) {
    console.error(`[schema] Falha: ${error.message}`);
    if (exitOnError) process.exit(1);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  ensureSchema({ exitOnError: true });
}
