/**
 * Garante schema MDP (MDP-1 → MDP-5) quando migrate deploy falha ou fica incompleto.
 * Idempotente — usa SQL oficial das migrations Prisma.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { runSqlFile } from "./sqlRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const migrationsRoot = path.join(backendRoot, "prisma", "migrations");

/** Ordem oficial MDP — alinhada ao histórico Prisma. */
export const MDP_MIGRATION_DIRS = [
  "20260628230000_mdp1_entity_dictionary",
  "20260629010000_mdp2_data_dictionary",
  "20260629120000_mdp3_relationship_dictionary",
  "20260629180000_mdp4_metadata_registry",
  "20260629190000_mdp5_versioning_publication",
];

export const REQUIRED_MDP_TABLES = [
  "mdp_definition_version",
  "mdp_entity",
  "mdp_field",
  "mdp_relationship",
  "mdp_registry_entry",
  "mdp_compiled_bundle",
];

export const verifyMdpSchemaReady = async (prisma = null) => {
  const client = prisma || createMigrationPrisma();
  const ownsClient = !prisma;

  try {
    const missingTables = [];
    for (const tableName of REQUIRED_MDP_TABLES) {
      const rows = await client.$queryRaw`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = ${tableName}
        ) AS ok
      `;
      if (!rows[0]?.ok) missingTables.push(tableName);
    }

    const entityCountRows = missingTables.length
      ? [{ count: 0 }]
      : await client.$queryRaw`SELECT COUNT(*)::int AS count FROM "mdp_entity"`;
    const entityCount = Number(entityCountRows?.[0]?.count) || 0;

    return {
      ready: missingTables.length === 0,
      missingTables,
      entityCount,
      reason:
        missingTables.length > 0
          ? "tables_missing"
          : entityCount === 0
            ? "platform_seed_missing"
            : "ok",
    };
  } finally {
    if (ownsClient) await client.$disconnect();
  }
};

const listAppliedMigrationNames = async (prisma) => {
  const tableRows = await prisma.$queryRaw`
    SELECT to_regclass('_prisma_migrations') IS NOT NULL AS "tableExists"
  `;
  if (!tableRows?.[0]?.tableExists) return new Set();

  const rows = await prisma.$queryRaw`
    SELECT migration_name
    FROM "_prisma_migrations"
    WHERE finished_at IS NOT NULL
      AND rolled_back_at IS NULL
  `;
  return new Set((rows || []).map((row) => String(row.migration_name)));
};

const resolveMigrationApplied = async (migrationName) => {
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    const child = spawn("npx", ["prisma", "migrate", "resolve", "--applied", migrationName], {
      cwd: backendRoot,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
};

export const ensureMdpSchema = async ({ log = console } = {}) => {
  const prisma = createMigrationPrisma();
  const report = {
    appliedMigrations: [],
    resolvedMigrations: [],
    seeded: false,
    before: null,
    after: null,
  };

  try {
    report.before = await verifyMdpSchemaReady(prisma);
    if (report.before.ready && report.before.entityCount > 0) {
      log.info?.("[ensure-mdp] Schema MDP já completo — nada a fazer.");
      report.after = report.before;
      return report;
    }

    const appliedNames = await listAppliedMigrationNames(prisma);

    if (!report.before.ready) {
      for (const migrationDir of MDP_MIGRATION_DIRS) {
        const sqlPath = path.join(migrationsRoot, migrationDir, "migration.sql");
        if (!fs.existsSync(sqlPath)) {
          throw new Error(`Migration SQL ausente: ${migrationDir}`);
        }

        log.info?.(`[ensure-mdp] Aplicando SQL ${migrationDir}...`);
        const count = await runSqlFile(prisma, sqlPath, fs);
        report.appliedMigrations.push({ migrationDir, statements: count });

        if (!appliedNames.has(migrationDir)) {
          const resolved = await resolveMigrationApplied(migrationDir);
          if (resolved) {
            report.resolvedMigrations.push(migrationDir);
            appliedNames.add(migrationDir);
          } else {
            log.warn?.(`[ensure-mdp] migrate resolve falhou para ${migrationDir} — continuando.`);
          }
        }
      }
    }

    report.after = await verifyMdpSchemaReady(prisma);
    if (!report.after.ready) {
      throw new Error(
        `Schema MDP incompleto após ensure: ${report.after.missingTables.join(", ")}`
      );
    }

    if (report.after.entityCount === 0) {
      log.info?.("[ensure-mdp] Seed platform MDP (entities/fields/registry)...");
      const { seedMdpPublishEngine } = await import("./seedMdpPublishEngine.js");
      await seedMdpPublishEngine(prisma);
      report.seeded = true;
      report.after = await verifyMdpSchemaReady(prisma);
    }

    log.info?.(
      `[ensure-mdp] OK — entities=${report.after.entityCount}, migrations=${report.appliedMigrations.length}`
    );
    return report;
  } finally {
    await prisma.$disconnect();
  }
};

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  ensureMdpSchema()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((error) => {
      console.error("[ensure-mdp] FATAL:", error.message);
      process.exit(1);
    });
}
