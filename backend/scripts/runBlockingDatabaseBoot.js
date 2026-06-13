/**
 * Boot bloqueante — migrations e DDL ANTES do servidor aceitar tráfego.
 * Falha crítica = process.exit(1) — servidor NÃO inicia.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const runCommand = (label, command, args, { allowFailure = false } = {}) =>
  new Promise((resolve, reject) => {
    console.log(`[boot-blocking] ${label}...`);
    const child = spawn(command, args, {
      cwd: backendRoot,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`[boot-blocking] ${label}: OK`);
        resolve(true);
      } else if (allowFailure) {
        console.warn(`[boot-blocking] ${label}: exit ${code} (continuando)`);
        resolve(false);
      } else {
        reject(new Error(`${label} falhou com exit ${code}`));
      }
    });
  });

export const runBlockingDatabaseBoot = async (log = console) => {
  if (String(process.env.BOOT_SKIP_MIGRATIONS || "").toLowerCase() === "true") {
    log.warn?.("[boot-blocking] BOOT_SKIP_MIGRATIONS=true — pulando migrations.") ??
      log.warn("[boot-blocking] BOOT_SKIP_MIGRATIONS=true — pulando migrations.");
    return { skipped: true };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente — impossível iniciar produção com banco.");
  }

  const report = { steps: [] };

  await runCommand("Prisma migrate deploy", "npx", ["prisma", "migrate", "deploy"]);
  report.steps.push({ step: "migrate_deploy", ok: true });

  const { ensureCounterColumns } = await import("../scripts/ensureCounterColumns.js");
  const counterResult = await ensureCounterColumns();
  report.steps.push({ step: "ensure_counter_columns", ok: true, result: counterResult });

  const { ensurePerformanceIndexes } = await import("../scripts/ensurePerformanceIndexes.js");
  const indexResult = await ensurePerformanceIndexes();
  report.steps.push({ step: "ensure_performance_indexes", ok: true, result: indexResult });

  if (!indexResult.applied) {
    log.warn?.(`[boot-blocking] Índices incompletos: ${indexResult.missing?.length ?? "?"} faltando`) ??
      log.warn(`[boot-blocking] Índices incompletos: ${indexResult.missing?.length ?? "?"} faltando`);
  }

  const { getPrismaClient } = await import("../src/database/prismaClient.js");
  const { probeSchemaCompatibility, resetSchemaCompatibilityCache } = await import(
    "../src/database/schemaCompatibility.js"
  );
  resetSchemaCompatibilityCache();
  const compatibility = await probeSchemaCompatibility(getPrismaClient());
  report.compatibility = compatibility;

  if (!compatibility.counterColumnsReady) {
    log.warn?.("[boot-blocking] Colunas de contador ausentes — modo compatibilidade ativo.") ??
      log.warn("[boot-blocking] Colunas de contador ausentes — modo compatibilidade ativo.");
  }

  return report;
};

const isDirectRun = process.argv[1]?.includes("runBlockingDatabaseBoot");

if (isDirectRun) {
  runBlockingDatabaseBoot()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((error) => {
      console.error("[boot-blocking] FATAL:", error.message);
      process.exit(1);
    });
}
