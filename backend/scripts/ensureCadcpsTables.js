import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260603010000_cadcps_module/migration.sql"
);

const prisma = new PrismaClient();

const IGNORED_ERROR_CODES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (constraint, etc.)
  "42P16", // invalid_table_definition (constraint already exists in some PG versions)
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

const run = async () => {
  const sql = fs.readFileSync(migrationPath, "utf8");
  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await runStatement(`${statement};`);
  }
  console.log(`Tabelas CADCPS garantidas (${statements.length} comando(s)).`);
};

run()
  .catch((error) => {
    console.error("Falha ao garantir tabelas CADCPS:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
