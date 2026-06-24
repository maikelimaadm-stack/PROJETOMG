/**
 * Boot bloqueante — migrations e DDL ANTES do servidor aceitar tráfego.
 * Falha crítica = process.exit(1) — servidor NÃO inicia.
 */
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const prismaMigrationsPath = path.join(backendRoot, "prisma", "migrations");

const logMessage = (logger, level, message) => {
  const direct =
    logger && typeof logger[level] === "function"
      ? logger[level].bind(logger)
      : null;

  const fallback =
    logger && typeof logger.info === "function"
      ? logger.info.bind(logger)
      : logger && typeof logger.log === "function"
        ? logger.log.bind(logger)
        : console.log.bind(console);

  (direct || fallback)(message);
};

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

const shouldAutoBaseline = () => {
  const raw = String(process.env.BOOT_PRISMA_AUTO_BASELINE || "true").trim().toLowerCase();
  return !["false", "0", "no", "off"].includes(raw);
};

const listMigrationNames = async () => {
  const entries = await readdir(prismaMigrationsPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && /^\d{8,}_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
};

const inspectMigrationState = async () => {
  const { createMigrationPrisma } = await import("./migrationPrisma.js");
  const prisma = createMigrationPrisma();
  try {
    const migrationTableRows = await prisma.$queryRaw`
      SELECT to_regclass('_prisma_migrations') IS NOT NULL AS "tableExists"
    `;
    const tableExists = Boolean(migrationTableRows?.[0]?.tableExists);
    let appliedCount = 0;
    if (tableExists) {
      const countRows = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS "count" FROM "_prisma_migrations"
      `;
      appliedCount = Number(countRows?.[0]?.count) || 0;
    }

    const tableRows = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name <> '_prisma_migrations'
      ) AS "hasUserTables"
    `;

    return {
      tableExists,
      appliedCount,
      hasUserTables: Boolean(tableRows?.[0]?.hasUserTables),
    };
  } finally {
    await prisma.$disconnect();
  }
};

const runAutoBaselineIfNeeded = async (log) => {
  if (!shouldAutoBaseline()) {
    return { attempted: false, appliedCount: 0, reason: "disabled_by_env" };
  }

  try {
    const migrationState = await inspectMigrationState();
    if (!migrationState.hasUserTables) {
      return { attempted: false, appliedCount: 0, reason: "empty_schema" };
    }
    if (migrationState.appliedCount > 0) {
      return {
        attempted: false,
        appliedCount: 0,
        reason: "already_baselined",
        details: migrationState,
      };
    }

    const migrationNames = await listMigrationNames();
    if (migrationNames.length === 0) {
      return { attempted: false, appliedCount: 0, reason: "no_migrations_found" };
    }

    logMessage(
      log,
      "warn",
      `[boot-blocking] Baseline Prisma automático iniciado para banco legado (${migrationNames.length} migration(s)).`
    );

    for (const migrationName of migrationNames) {
      await runCommand(`Prisma migrate resolve --applied ${migrationName}`, "npx", [
        "prisma",
        "migrate",
        "resolve",
        "--applied",
        migrationName,
      ]);
    }

    logMessage(log, "info", "[boot-blocking] Baseline Prisma automático concluído.");
    return {
      attempted: true,
      appliedCount: migrationNames.length,
      reason: "applied",
    };
  } catch (error) {
    logMessage(log, "warn", `[boot-blocking] Baseline automático falhou: ${error.message}`);
    return {
      attempted: false,
      appliedCount: 0,
      reason: "error",
      error: error.message,
    };
  }
};

const verifyUserPreferencesSchemaReady = async () => {
  const { createMigrationPrisma } = await import("./migrationPrisma.js");
  const prisma = createMigrationPrisma();
  try {
    const tableRows = await prisma.$queryRaw`
      SELECT to_regclass('"UsuarioPreferencia"') IS NOT NULL AS "tableExists"
    `;
    const tableExists = Boolean(tableRows?.[0]?.tableExists);
    if (!tableExists) {
      return { ready: false, reason: "table_missing" };
    }

    const requiredColumns = ["modulo", "tela", "versao_schema", "preferencias_json"];
    const columnRows = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'UsuarioPreferencia'
        AND column_name IN ('modulo', 'tela', 'versao_schema', 'preferencias_json')
    `;
    const foundColumns = new Set((columnRows || []).map((row) => row.column_name));
    const missingColumns = requiredColumns.filter((column) => !foundColumns.has(column));
    if (missingColumns.length > 0) {
      return { ready: false, reason: "columns_missing", missingColumns };
    }

    const indexRows = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'UsuarioPreferencia'
        AND indexname = 'UsuarioPreferencia_cliente_usuario_modulo_tela_key'
    `;
    const hasScopedUniqueIndex = Array.isArray(indexRows) && indexRows.length > 0;
    if (!hasScopedUniqueIndex) {
      return { ready: false, reason: "scoped_unique_index_missing" };
    }

    return { ready: true };
  } finally {
    await prisma.$disconnect();
  }
};

export const runBlockingDatabaseBoot = async (log = console) => {
  if (String(process.env.BOOT_SKIP_MIGRATIONS || "").toLowerCase() === "true") {
    logMessage(log, "warn", "[boot-blocking] BOOT_SKIP_MIGRATIONS=true — pulando migrations.");
    return { skipped: true };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente — impossível iniciar produção com banco.");
  }

  const report = { steps: [] };

  const migrateOk = await runCommand("Prisma migrate deploy", "npx", ["prisma", "migrate", "deploy"], { allowFailure: true });
  report.steps.push({ step: "migrate_deploy", ok: migrateOk });
  if (!migrateOk) {
    logMessage(
      log,
      "warn",
      "[boot-blocking] prisma migrate deploy falhou (histórico inconsistente ou P3005). Continuando boot com ensure* e verificação de schema real..."
    );

    const baselineResult = await runAutoBaselineIfNeeded(log);
    report.steps.push({ step: "prisma_auto_baseline", ok: baselineResult.attempted, baselineResult });
    if (baselineResult.attempted) {
      const retryMigrateOk = await runCommand(
        "Prisma migrate deploy (pós-baseline)",
        "npx",
        ["prisma", "migrate", "deploy"],
        { allowFailure: true }
      );
      report.steps.push({ step: "migrate_deploy_after_baseline", ok: retryMigrateOk });
      if (!retryMigrateOk) {
        logMessage(
          log,
          "warn",
          "[boot-blocking] migrate deploy pós-baseline falhou. Prosseguindo — schema real será verificado abaixo."
        );
      }
    }
  }

  const { ensureCounterColumns } = await import("../scripts/ensureCounterColumns.js");
  const counterResult = await ensureCounterColumns();
  report.steps.push({ step: "ensure_counter_columns", ok: true, result: counterResult });

  const { ensurePerformanceIndexes } = await import("../scripts/ensurePerformanceIndexes.js");
  const indexResult = await ensurePerformanceIndexes();
  report.steps.push({ step: "ensure_performance_indexes", ok: true, result: indexResult });

  try {
    const { ensureUsuarioPreferenciaTable } = await import("./ensureUsuarioPreferenciaTable.js");
    await ensureUsuarioPreferenciaTable();
    report.steps.push({ step: "ensure_usuario_preferencia_table", ok: true });
  } catch (error) {
    logMessage(
      log,
      "warn",
      `[boot-blocking] ensureUsuarioPreferenciaTable falhou (modo compatibilidade): ${error.message}`
    );
    report.steps.push({
      step: "ensure_usuario_preferencia_table",
      ok: false,
      error: error.message,
    });
  }

  const preferencesSchema = await verifyUserPreferencesSchemaReady();
  report.steps.push({
    step: "verify_usuario_preferencia_schema",
    ok: Boolean(preferencesSchema.ready),
    result: preferencesSchema,
  });
  report.preferencesSchema = preferencesSchema;
  report.migrateDeployOk = migrateOk;

  if (!preferencesSchema.ready) {
    logMessage(
      log,
      "error",
      `[boot-blocking] Schema de preferências incompleto (${preferencesSchema.reason}). migrate deploy ok=${migrateOk}.`
    );
    throw new Error(
      `Schema de preferências incompleto (${preferencesSchema.reason}). Execute a migration 20260624140500_user_screen_preferences ou scripts/ensureUsuarioPreferenciaTable.js antes de iniciar a aplicação.`
    );
  }

  if (!migrateOk) {
    logMessage(
      log,
      "warn",
      "[boot-blocking] Servidor iniciará apesar de migrate deploy falhar — schema de preferências verificado como completo. Corrija o histórico Prisma com `prisma migrate resolve` quando possível."
    );
  }

  if (!indexResult.applied) {
    logMessage(
      log,
      "warn",
      `[boot-blocking] Índices incompletos: ${indexResult.missing?.length ?? "?"} faltando`
    );
  }

  const { getPrismaClient } = await import("../src/database/prismaClient.js");
  const { probeSchemaCompatibility, resetSchemaCompatibilityCache } = await import(
    "../src/database/schemaCompatibility.js"
  );
  resetSchemaCompatibilityCache();
  const compatibility = await probeSchemaCompatibility(getPrismaClient());
  report.compatibility = compatibility;

  if (!compatibility.counterColumnsReady) {
    logMessage(log, "warn", "[boot-blocking] Colunas de contador ausentes — modo compatibilidade ativo.");
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
