import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

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

const runScript = (label, scriptPath, logger = console) =>
  new Promise((resolve) => {
    logMessage(logger, "info", `[boot] ${label}...`);
    const child = spawn("node", [scriptPath], {
      stdio: "inherit",
      cwd: backendRoot,
      env: process.env,
    });
    child.on("error", (error) => {
      const msg = `[boot] ${label} falhou: ${error.message}`;
      logMessage(logger, "warn", msg);
      resolve(false);
    });
    child.on("close", (code) => {
      if (code === 0) {
        logMessage(logger, "info", `[boot] ${label}: OK`);
        resolve(true);
      } else {
        const msg = `[boot] ${label}: exit ${code}`;
        logMessage(logger, "warn", msg);
        resolve(false);
      }
    });
  });

const runErpRestructure = async (logger = console) => {
  try {
    const { runErpRestructure: run } = await import("./ensureErpRestructure.js");
    await run({ exitOnError: false });
    logMessage(logger, "info", "[boot] Reestruturação ERP: OK");
    return true;
  } catch (error) {
    const msg = `[boot] Reestruturação ERP falhou: ${error.message}`;
    logMessage(logger, "error", msg);
    return false;
  }
};

/**
 * Tarefas de inicialização em produção — executadas em background após o listen.
 * Não bloqueiam o healthcheck do Railway.
 */
export const runProductionBootTasks = async (logger = console) => {
  if (String(process.env.BOOT_SKIP_MIGRATIONS || "").toLowerCase() === "true") {
    logMessage(logger, "info", "[boot] BOOT_SKIP_MIGRATIONS=true — tarefas de banco ignoradas.");
    return;
  }

  if (String(process.env.BOOT_RESET_MAIKE || "").toLowerCase() === "true") {
    logMessage(logger, "warn", "[boot] BOOT_RESET_MAIKE=true — apagando todos os dados e recriando maike!");
    await runScript("Reset banco + seed maike", "scripts/resetAllDataAndSeed.js", logger);
    logMessage(logger, "warn", "[boot] Remova BOOT_RESET_MAIKE das variáveis após este deploy.");
    return;
  }

  try {
    const { ensureSchema } = await import("./ensureSchema.js");
    await ensureSchema({ exitOnError: false });
    logMessage(logger, "info", "[boot] Schema ERP: OK");
  } catch (error) {
    const msg = `[boot] Schema ERP falhou: ${error.message}`;
    logMessage(logger, "error", msg);
  }

  try {
    const { syncAllCodigoSequencias } = await import("../src/modules/sequencias/entidadeCodigoService.js");
    const { syncAllIdGlobalSequencias } = await import("../src/modules/idGlobal/idGlobalService.js");
    const { createMigrationPrisma } = await import("./migrationPrisma.js");
    const prisma = createMigrationPrisma();
    try {
      const [codigos, idGlobals] = await Promise.all([
        syncAllCodigoSequencias(prisma),
        syncAllIdGlobalSequencias(prisma),
      ]);
      logMessage(
        logger,
        "info",
        `[boot] Sequências sincronizadas — código: ${codigos}, id_global: ${idGlobals} cliente(s).`
      );
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const msg = `[boot] Sync sequências falhou: ${error.message}`;
    logMessage(logger, "warn", msg);
  }

  await runScript("Garantir tabelas CADCPS", "scripts/ensureCadcpsTables.js", logger);

  if (String(process.env.SEED_SKIP || "").toLowerCase() !== "true") {
    await runScript("Seed bootstrap", "scripts/seedBootstrap.js", logger);
  }

  await runScript("Popular telas CADCPS", "scripts/seedCadcpsTelas.js", logger);
  await runScript("Tabela preferências", "scripts/ensureUsuarioPreferenciaTable.js", logger);
  await runScript("Índices de performance", "scripts/ensurePerformanceIndexes.js", logger);
  await runScript("Contadores materializados", "scripts/ensureCounterColumns.js", logger);
  await runErpRestructure(logger);
};
