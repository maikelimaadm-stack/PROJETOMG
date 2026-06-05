import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const runStep = (label, command, args) =>
  new Promise((resolve, reject) => {
    console.log(`[boot] ${label}...`);
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      cwd: backendRoot,
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`[boot] ${label}: OK`);
        resolve();
        return;
      }
      reject(new Error(`${label} falhou com código ${code}`));
    });
  });

const runOptionalStep = async (label, command, args) => {
  try {
    await runStep(label, command, args);
  } catch (error) {
    console.warn(`[boot] ${label} falhou (servidor sobe mesmo assim): ${error.message}`);
  }
};

const runMigrationsInBackground = () => {
  if (String(process.env.BOOT_SKIP_MIGRATIONS || "").toLowerCase() === "true") {
    console.log("[boot] Migrações ignoradas (BOOT_SKIP_MIGRATIONS=true).");
    return;
  }

  console.log("[boot] Migrações em background (não bloqueia healthcheck)...");
  import("./ensureErpRestructure.js")
    .then(({ runErpRestructure }) => runErpRestructure({ exitOnError: false }))
    .then(() => console.log("[boot] Migrações background: concluídas."))
    .catch((error) => {
      console.error(`[boot] Migrações background falharam: ${error.message}`);
      console.error("[boot] Execute manualmente: npm run ensure:erp-restructure");
    });
};

const run = async () => {
  // Passos leves e opcionais — não bloqueiam deploy
  await runOptionalStep("Garantir tabelas CADCPS", "node", ["scripts/ensureCadcpsTables.js"]);

  if (String(process.env.SEED_SKIP || "").toLowerCase() !== "true") {
    await runOptionalStep("Seed bootstrap", "node", ["scripts/seedBootstrap.js"]);
  } else {
    console.log("[boot] Seed bootstrap ignorado (SEED_SKIP=true).");
  }

  await runOptionalStep("Popular telas CADCPS", "node", ["scripts/seedCadcpsTelas.js"]);
  await runOptionalStep("Tabela preferências", "node", ["scripts/ensureUsuarioPreferenciaTable.js"]);

  if (!String(process.env.JWT_SECRET || "").trim()) {
    console.warn(
      "[boot] AVISO: JWT_SECRET não definido — defina a variável ou o login da API falhará."
    );
  }

  // Servidor sobe IMEDIATAMENTE para passar healthcheck do Railway
  console.log("[boot] Iniciando servidor...");
  const server = spawn("node", ["src/server.js"], {
    stdio: "inherit",
    cwd: backendRoot,
    env: { ...process.env, NODE_ENV: "production" },
  });

  server.on("close", (code) => process.exit(code ?? 0));

  // Reestruturação pesada roda em paralelo após o listen
  setTimeout(runMigrationsInBackground, 2000);
};

run().catch((error) => {
  console.error("[boot] ERRO:", error.message);
  process.exit(1);
});
