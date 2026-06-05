import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const runBackground = (label, command, args) => {
  console.log(`[boot] ${label} (background)...`);
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    cwd: backendRoot,
    env: process.env,
  });
  child.on("error", (error) => {
    console.warn(`[boot] ${label} falhou: ${error.message}`);
  });
  child.on("close", (code) => {
    if (code === 0) console.log(`[boot] ${label}: OK`);
    else console.warn(`[boot] ${label}: exit ${code}`);
  });
};

const runMigrationsInBackground = () => {
  if (String(process.env.BOOT_SKIP_MIGRATIONS || "").toLowerCase() === "true") {
    console.log("[boot] Migrações ignoradas (BOOT_SKIP_MIGRATIONS=true).");
    return;
  }
  import("./ensureErpRestructure.js")
    .then(({ runErpRestructure }) => runErpRestructure({ exitOnError: false }))
    .then(() => console.log("[boot] Migrações: concluídas."))
    .catch((error) => console.error(`[boot] Migrações falharam: ${error.message}`));
};

// Servidor sobe IMEDIATAMENTE — healthcheck do Railway não espera scripts de banco
console.log("[boot] Iniciando servidor...");
const server = spawn("node", ["src/server.js"], {
  stdio: "inherit",
  cwd: backendRoot,
  env: { ...process.env, NODE_ENV: "production" },
});

server.on("error", (error) => {
  console.error("[boot] Falha ao iniciar servidor:", error.message);
  process.exit(1);
});

server.on("close", (code) => process.exit(code ?? 0));

// Manutenção em background após o listen
setTimeout(() => {
  runBackground("Garantir tabelas CADCPS", "node", ["scripts/ensureCadcpsTables.js"]);
  if (String(process.env.SEED_SKIP || "").toLowerCase() !== "true") {
    runBackground("Seed bootstrap", "node", ["scripts/seedBootstrap.js"]);
  }
  runBackground("Popular telas CADCPS", "node", ["scripts/seedCadcpsTelas.js"]);
  runBackground("Tabela preferências", "node", ["scripts/ensureUsuarioPreferenciaTable.js"]);
  runMigrationsInBackground();
}, 3000);

if (!String(process.env.JWT_SECRET || "").trim()) {
  console.warn("[boot] AVISO: JWT_SECRET não definido.");
}
