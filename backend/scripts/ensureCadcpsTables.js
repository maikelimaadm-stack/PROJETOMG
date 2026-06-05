import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { runSqlFile } from "./sqlRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260603010000_cadcps_module/migration.sql"
);

const prisma = createMigrationPrisma();

const run = async () => {
  const count = await runSqlFile(prisma, migrationPath, fs);
  console.log(`Tabelas CADCPS garantidas (${count} comando(s)).`);
};

run()
  .catch((error) => {
    console.error("Falha ao garantir tabelas CADCPS:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
