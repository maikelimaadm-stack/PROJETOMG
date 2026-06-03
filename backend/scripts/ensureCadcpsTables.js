import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260603010000_cadcps_module/migration.sql"
);

const prisma = new PrismaClient();

const run = async () => {
  const sql = fs.readFileSync(migrationPath, "utf8");
  await prisma.$executeRawUnsafe(sql);
  console.log("Tabelas CADCPS garantidas.");
};

run()
  .catch((error) => {
    console.error("Falha ao garantir tabelas CADCPS:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
