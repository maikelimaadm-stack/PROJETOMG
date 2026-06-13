import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

console.log("[boot] Executando migrations bloqueantes...");
import("./runBlockingDatabaseBoot.js")
  .then(({ runBlockingDatabaseBoot }) => runBlockingDatabaseBoot(console))
  .then(() => {
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
  })
  .catch((error) => {
    console.error("[boot] FATAL:", error.message);
    process.exit(1);
  });

if (!String(process.env.JWT_SECRET || "").trim()) {
  console.warn("[boot] AVISO: JWT_SECRET não definido.");
}
