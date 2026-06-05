import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

console.log("[boot] Iniciando servidor (tarefas de banco rodam em background via server.js)...");
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

if (!String(process.env.JWT_SECRET || "").trim()) {
  console.warn("[boot] AVISO: JWT_SECRET não definido.");
}
