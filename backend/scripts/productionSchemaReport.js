/**
 * Relatório de drift schema/migrations — Etapa 1 estabilização.
 * Uso local: cd backend && node scripts/productionSchemaReport.js
 * Produção: inferido via /api/health quando DATABASE_URL indisponível.
 */
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PERFORMANCE_INDEX_NAMES } from "./ensurePerformanceIndexes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../prisma/migrations");
const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";

const EXPECTED_CLIENTE_COLUMNS = [
  "total_empresas",
  "total_cadcps_campos",
  "next_id_global",
];

async function fetchProductionHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function listMigrationFolders() {
  const { readdirSync } = await import("node:fs");
  return readdirSync(migrationsDir)
    .filter((name) => !name.startsWith("."))
    .sort();
}

async function auditDatabase(prisma) {
  const applied = await prisma.$queryRaw`
    SELECT migration_name, finished_at
    FROM "_prisma_migrations"
    ORDER BY finished_at ASC
  `;

  const clienteColumns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Cliente'
    ORDER BY ordinal_position
  `;

  const indexRows = await prisma.$queryRaw`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ANY(${PERFORMANCE_INDEX_NAMES})
  `;

  const columnNames = new Set(clienteColumns.map((c) => c.column_name));
  const foundIndexes = new Set(indexRows.map((r) => r.indexname));

  return {
    appliedMigrations: applied,
    clienteColumns,
    missingClienteColumns: EXPECTED_CLIENTE_COLUMNS.filter((c) => !columnNames.has(c)),
    performanceIndexes: {
      expected: PERFORMANCE_INDEX_NAMES.length,
      found: foundIndexes.size,
      missing: PERFORMANCE_INDEX_NAMES.filter((n) => !foundIndexes.has(n)),
    },
  };
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    migrationFolders: await listMigrationFolders(),
    productionHealth: await fetchProductionHealth(),
    database: null,
  };

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      report.database = await auditDatabase(prisma);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    report.database = {
      note: "DATABASE_URL ausente — auditoria DB local indisponível. Use health de produção.",
    };
  }

  const health = report.productionHealth;
  report.summary = {
    loginBlocked: false,
    counterColumnsInDb: report.database?.missingClienteColumns
      ? !report.database.missingClienteColumns.includes("total_empresas")
      : "unknown",
    indexesApplied: health?.performanceIndexes?.applied === true,
    pendingMigrations:
      report.database?.appliedMigrations?.length != null
        ? Math.max(0, report.migrationFolders.length - report.database.appliedMigrations.length)
        : "unknown",
    missingClienteColumns:
      report.database?.missingClienteColumns ?? ["total_empresas", "total_cadcps_campos"],
    missingIndexes: health?.performanceIndexes?.missing ?? report.database?.performanceIndexes?.missing ?? [],
  };

  try {
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente: "maike", usuario: "maike", senha: "123" }),
    });
    const loginBody = await loginRes.json();
    report.summary.loginBlocked = !loginBody.token;
    report.summary.loginError = loginBody.message || null;
  } catch (error) {
    report.summary.loginBlocked = true;
    report.summary.loginError = error.message;
  }

  const outPath = path.resolve(__dirname, "../../docs/auditoria/PRODUCTION_STABILIZATION_REPORT.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nRelatório completo: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
