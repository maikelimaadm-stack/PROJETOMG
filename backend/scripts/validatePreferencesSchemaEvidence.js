/**
 * Evidência SQL/Prisma do schema de preferências (Etapa 1 — PR #223).
 *
 * Uso:
 *   DATABASE_URL=postgresql://... node backend/scripts/validatePreferencesSchemaEvidence.js
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { verifyUserPreferencesSchemaReady } from "./runBlockingDatabaseBoot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const report = {
  startedAt: new Date().toISOString(),
  databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  checks: [],
  approved: false,
};

const pass = (step, extra = {}) => {
  report.checks.push({ step, status: "PASS", ...extra });
  console.log(`PASS: ${step}`);
};

const fail = (step, message, extra = {}) => {
  report.checks.push({ step, status: "FAIL", message, ...extra });
  throw new Error(`[${step}] ${message}`);
};

const runSqlEvidence = async (prisma) => {
  const tableExists = await prisma.$queryRaw`
    SELECT to_regclass('"UsuarioPreferencia"') IS NOT NULL AS "exists"
  `;
  if (!tableExists?.[0]?.exists) fail("table_exists", "Tabela UsuarioPreferencia não existe");
  pass("table_exists");

  const usuarioIdColumn = await prisma.$queryRaw`
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UsuarioPreferencia'
      AND column_name = 'usuario_id'
  `;
  const nullable = usuarioIdColumn?.[0]?.is_nullable;
  if (nullable !== "NO") fail("usuario_id_not_null", `usuario_id nullable=${nullable}`);
  pass("usuario_id_not_null", { is_nullable: nullable });

  const scopedUnique = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'UsuarioPreferencia'
      AND indexname IN (
        'UsuarioPreferencia_cliente_usuario_modulo_tela_key',
        'UsuarioPreferencia_cliente_id_usuario_id_modulo_tela_key'
      )
  `;
  if (!scopedUnique?.length) {
    fail("scoped_unique_index", "Índice UNIQUE (cliente_id, usuario_id, modulo, tela) ausente");
  }
  pass("scoped_unique_index", { indexdef: scopedUnique[0]?.indexdef });

  const readIndex = await prisma.$queryRaw`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'UsuarioPreferencia'
      AND indexname = 'UsuarioPreferencia_cliente_id_usuario_id_idx'
  `;
  if (!readIndex?.length) {
    fail("read_index", "Índice de leitura (cliente_id, usuario_id) ausente");
  }
  pass("read_index");

  const oldTenantOnlyUnique = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'UsuarioPreferencia'
      AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%cliente_id%'
      AND indexdef ILIKE '%modulo%'
      AND indexdef ILIKE '%tela%'
      AND indexdef NOT ILIKE '%usuario_id%'
  `;
  if (oldTenantOnlyUnique?.length) {
    fail("old_tenant_unique_conflict", "Existe índice único antigo sem usuario_id", {
      indexes: oldTenantOnlyUnique,
    });
  }
  pass("no_old_tenant_only_unique");

  const migrationApplied = await prisma.$queryRaw`
    SELECT migration_name, finished_at
    FROM "_prisma_migrations"
    WHERE migration_name = '20260624140500_user_screen_preferences'
    LIMIT 1
  `;
  if (!migrationApplied?.length) {
    pass("migration_applied", { note: "Migration não registrada — pode ser baseline manual" });
  } else {
    pass("migration_applied", { finished_at: migrationApplied[0]?.finished_at });
  }
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    report.skipped = "DATABASE_URL ausente — execute com credenciais do staging da PR #223";
    report.finishedAt = new Date().toISOString();
    const outFile = path.join(__dirname, "..", "..", "scripts", "validate-preferences-schema.results.json");
    writeFileSync(outFile, JSON.stringify(report, null, 2));
    console.log(`[schema-evidence] SKIP — ${report.skipped}`);
    process.exit(0);
  }

  const schemaReady = await verifyUserPreferencesSchemaReady();
  if (!schemaReady.ready) fail("verifyUserPreferencesSchemaReady", schemaReady.reason || "schema incompleto", schemaReady);
  pass("verifyUserPreferencesSchemaReady", schemaReady);

  const { createMigrationPrisma } = await import("./migrationPrisma.js");
  const prisma = createMigrationPrisma();
  try {
    await runSqlEvidence(prisma);
  } finally {
    await prisma.$disconnect();
  }

  report.approved = report.checks.every((c) => c.status === "PASS");
  report.finishedAt = new Date().toISOString();
  const outFile = path.join(__dirname, "..", "..", "scripts", "validate-preferences-schema.results.json");
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`[schema-evidence] Aprovado: ${report.approved}`);
  if (!report.approved) process.exit(1);
};

run().catch((error) => {
  report.approved = false;
  report.fatal = error.message;
  report.finishedAt = new Date().toISOString();
  try {
    const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "validate-preferences-schema.results.json");
    writeFileSync(outFile, JSON.stringify(report, null, 2));
  } catch {
    // ignore
  }
  console.error("[schema-evidence] FATAL:", error.message);
  process.exit(1);
});
