import { spawn } from "node:child_process";

const runStep = (label, command, args) =>
  new Promise((resolve, reject) => {
    console.log(`[boot] ${label}...`);
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
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

const run = async () => {
  await runOptionalStep("Garantir tabelas CADCPS", "node", ["scripts/ensureCadcpsTables.js"]);
  await runStep("Garantir reestruturação ERP", "node", ["scripts/ensureErpRestructure.js"]);
  await runOptionalStep("Popular telas CADCPS", "node", ["scripts/seedCadcpsTelas.js"]);

  if (String(process.env.SEED_SKIP || "").toLowerCase() !== "true") {
    await runOptionalStep("Seed bootstrap", "node", ["scripts/seedBootstrap.js"]);
  } else {
    console.log("[boot] Seed bootstrap ignorado (SEED_SKIP=true).");
  }

  await runOptionalStep("Tabela preferências", "node", ["scripts/ensureUsuarioPreferenciaTable.js"]);

  if (!String(process.env.JWT_SECRET || "").trim()) {
    console.warn(
      "[boot] AVISO: JWT_SECRET não definido no Railway — defina a variável ou o login da API falhará."
    );
  }

  console.log("[boot] Iniciando servidor...");
  const server = spawn("node", ["src/server.js"], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
  server.on("close", (code) => process.exit(code ?? 0));
};

run().catch((error) => {
  console.error("[boot] ERRO:", error.message);
  process.exit(1);
});
