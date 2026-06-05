import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { backfillAllClientesIdGlobal } from "../src/modules/idGlobal/idGlobalService.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260604120000_id_global_corporativo/migration.sql"
);

const prisma = new PrismaClient();

const IGNORED_ERROR_CODES = new Set([
  "42P07",
  "42710",
  "42P16",
  "42701",
]);

const splitSqlStatements = (sql) =>
  sql
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const runStatement = async (statement) => {
  try {
    await prisma.$executeRawUnsafe(statement);
  } catch (error) {
    const code = error?.code || error?.meta?.code;
    if (IGNORED_ERROR_CODES.has(code)) return;
    const message = String(error?.message || "");
    if (message.includes("already exists")) return;
    throw error;
  }
};

const needsBackfill = async () => {
  const [empresas, campos, anexos, cadastros, legado] = await Promise.all([
    prisma.empresa.count({ where: { id_global: null } }),
    prisma.cadCpsCampo.count({ where: { id_global: null } }),
    prisma.registroAnexo.count({ where: { id_global: null } }),
    prisma.cadastroRegistro.count({ where: { id_global: null } }),
    prisma.campoPersonalizado.count({ where: { id_global: null } }),
  ]);
  return empresas + campos + anexos + cadastros + legado > 0;
};

const run = async () => {
  const sql = fs.readFileSync(migrationPath, "utf8");
  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await runStatement(`${statement};`);
  }
  console.log(`[id-global] Tabelas e colunas garantidas (${statements.length} comando(s)).`);

  if (await needsBackfill()) {
    const results = await backfillAllClientesIdGlobal();
    const total = results.reduce((sum, item) => sum + item.assigned, 0);
    console.log(`[id-global] Backfill concluído: ${total} registro(s) atribuído(s).`);
  } else {
    console.log("[id-global] Backfill não necessário.");
  }
};

run()
  .catch((error) => {
    console.error("[id-global] Falha ao garantir estrutura:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
