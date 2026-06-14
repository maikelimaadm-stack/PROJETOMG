import "dotenv/config";
import { defineConfig } from "prisma/config";

const buildTimeFallbackUrl = "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
const databaseUrl = process.env.DATABASE_URL || buildTimeFallbackUrl;
const directUrl = process.env.DIRECT_URL || databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/seedBootstrap.js",
  },
  datasource: {
    // Railway build pode não expor DATABASE_URL durante `prisma generate`.
    // Em runtime/boot de produção, DATABASE_URL real continua obrigatória.
    url: databaseUrl,
    directUrl,
  },
});
