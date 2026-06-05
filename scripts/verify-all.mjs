#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const run = (label, command, args, cwd = root) => {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`\n✗ Falhou: ${label}`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label}`);
};

console.log("══════════════════════════════════════════");
console.log("  Verificação completa — Frontend + Backend");
console.log("══════════════════════════════════════════");

run("Frontend lint", "npm", ["run", "lint"]);
run("Frontend build", "npm", ["run", "build"]);
run("Prisma validate", "npm", ["run", "prisma:validate"], path.join(root, "backend"));
run("Prisma generate", "npm", ["run", "prisma:generate"], path.join(root, "backend"));

console.log("\n══════════════════════════════════════════");
console.log("  ✅ Verificação local concluída com sucesso");
console.log("══════════════════════════════════════════");
console.log("\nPróximos passos para deploy:");
console.log("  1. Railway: Redeploy backend (branch main, root backend/)");
console.log("     Variáveis: DATABASE_URL, DIRECT_URL, JWT_SECRET, FRONTEND_ORIGINS");
console.log("  2. Supabase: aplicar applyRestructure.sql (SQL Editor ou npm run apply:supabase)");
console.log("  3. Vercel: Redeploy frontend com VITE_API_URL apontando para o Railway");
console.log("  4. Confirmar: GET /api/health → migration.restructureApplied: true\n");
