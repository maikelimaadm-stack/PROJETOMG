import dotenv from "dotenv";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLACEHOLDER_MARKERS = ["PROJECT_REF", "DB_PASSWORD", "sb_publishable_xxx", "sb_secret_xxx"];

const hasRealCredentials = () => {
  const url = String(process.env.DATABASE_URL || "");
  const direct = String(process.env.DIRECT_URL || "");
  if (!url.trim() || !direct.trim()) return false;
  return !PLACEHOLDER_MARKERS.some((marker) => url.includes(marker) || direct.includes(marker));
};

const printManualSteps = () => {
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  CREDENCIAIS DO SUPABASE NÃO CONFIGURADAS NESTE AMBIENTE");
  console.log("══════════════════════════════════════════════════════════════\n");
  console.log("O código foi atualizado, mas o BANCO só muda quando você aplicar a migration.");
  console.log("\nOPÇÃO A — SQL Editor do Supabase (mais rápido):");
  console.log("  1. Abra https://supabase.com/dashboard/project/vjvayvvusubfwfofhnqy/sql/new");
  console.log("  2. Cole o conteúdo de: backend/scripts/supabase/applyRestructure.sql");
  console.log("  3. Clique em Run");
  console.log("\nOPÇÃO B — Pelo terminal com credenciais reais:");
  console.log("  1. Edite backend/.env com DATABASE_URL e DIRECT_URL reais");
  console.log("  2. cd backend && npm run apply:supabase");
  console.log("\nOPÇÃO C — Pelo Railway (backend em produção):");
  console.log("  1. Confirme DATABASE_URL/DIRECT_URL nas variáveis do Railway");
  console.log("  2. Redeploy do backend (boot executa ensure:erp-restructure)");
  console.log("  3. Veja nos logs: [erp-restructure] DDL aplicado");
  console.log("\n══════════════════════════════════════════════════════════════\n");
};

const runEnsure = async () => {
  const { ensureSchema } = await import("./ensureSchema.js");
  await ensureSchema({ exitOnError: true });
  const { runErpRestructure } = await import("./ensureErpRestructure.js");
  await runErpRestructure({ exitOnError: true });
};

const verify = async () => {
  const prisma = createMigrationPrisma();
  try {
    const checks = await prisma.$queryRaw`
      SELECT 'Cliente.next_id_global' AS item,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Cliente' AND column_name = 'next_id_global'
        ) AS ok
      UNION ALL
      SELECT 'EntidadeCodigoSequencia',
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'EntidadeCodigoSequencia')
      UNION ALL
      SELECT 'ClienteModulo',
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClienteModulo')
    `;
    console.log("\n[verify] Estado do banco:");
    for (const row of checks) {
      console.log(`  ${row.ok ? "✅" : "❌"} ${row.item}`);
    }
  } finally {
    await prisma.$disconnect();
  }
};

const run = async () => {
  if (!hasRealCredentials()) {
    printManualSteps();
    process.exit(1);
  }

  console.log("[apply] Conectando ao Supabase e aplicando reestruturação...");
  await runEnsure();
  await verify();
  console.log("\n[apply] Concluído. Reinicie o backend se estiver em execução.");
};

run().catch((error) => {
  console.error("[apply] Falha:", error.message);
  printManualSteps();
  process.exit(1);
});
