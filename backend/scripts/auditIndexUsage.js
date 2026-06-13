/**
 * Auditoria física de índices — pg_indexes + pg_stat_user_indexes.
 * Uso: cd backend && node scripts/auditIndexUsage.js
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PERFORMANCE_INDEX_NAMES } from "./ensurePerformanceIndexes.js";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL ausente");
    process.exit(1);
  }

  const indexes = await prisma.$queryRaw`
    SELECT
      i.indexrelname AS index_name,
      t.relname AS table_name,
      pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
      COALESCE(s.idx_scan, 0)::bigint AS scans,
      COALESCE(s.idx_tup_read, 0)::bigint AS tuples_read,
      COALESCE(s.idx_tup_fetch, 0)::bigint AS tuples_fetched
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = ix.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname IN ('Empresa', 'CadCpsCampo', 'PermissaoEmpresa', 'RegistroAnexo')
    ORDER BY t.relname, s.idx_scan DESC NULLS LAST, i.relname
  `;

  const expected = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = ANY(${PERFORMANCE_INDEX_NAMES})
  `;
  const found = new Set(expected.map((r) => r.indexname));
  const missing = PERFORMANCE_INDEX_NAMES.filter((name) => !found.has(name));
  const unused = indexes.filter((r) => Number(r.scans ?? 0) === 0);

  console.log(JSON.stringify({ indexes, missing, unusedCount: unused.length, unused }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
