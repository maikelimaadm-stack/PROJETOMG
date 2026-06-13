/**
 * Perfil de latência server-side — requer DATABASE_URL no ambiente.
 * Uso: cd backend && DATABASE_URL=... node scripts/latencyProfile.js
 */
import dotenv from "dotenv";
import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";
import { PERFORMANCE_INDEX_NAMES } from "./ensurePerformanceIndexes.js";

dotenv.config();

const prisma = new PrismaClient();

const now = () => performance.now();
const ms = (start) => Number((performance.now() - start).toFixed(2));

const SCOPE = {
  userId: "latency-probe",
  clienteId: "cl_maike_seed_001",
  perfil: "ADMIN",
  acessoGlobal: true,
  allowedEmpresaIds: [],
  selectedEmpresaId: null,
  allowAllEmpresas: true,
};

async function timed(label, fn) {
  const start = now();
  const result = await fn();
  return { label, ms: ms(start), result };
}

async function explainListQuery(clienteId, pageSize = 50, skip = 0) {
  const sql = `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT id, id_global, codempresa, razao_social, nome_fantasia, tipo_pessoa, tipo_vinculo,
           cpf_cnpj, inscricao_estadual, telefone, whatsapp, email, cep, endereco, numero,
           bairro, cidade, estado, status, campos_personalizados, "createdAt", "updatedAt"
    FROM "Empresa"
    WHERE cliente_id = $1
    ORDER BY codempresa ASC
    LIMIT $2 OFFSET $3
  `;
  const rows = await prisma.$queryRawUnsafe(sql, clienteId, pageSize, skip);
  return rows[0]?.["QUERY PLAN"]?.[0] ?? rows;
}

async function explainCountQuery(clienteId) {
  const sql = `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT COUNT(*)::bigint FROM "Empresa" WHERE cliente_id = $1
  `;
  const rows = await prisma.$queryRawUnsafe(sql, clienteId);
  return rows[0]?.["QUERY PLAN"]?.[0] ?? rows;
}

async function listIndexes() {
  return prisma.$queryRaw`
    SELECT
      i.indexrelname AS index_name,
      t.relname AS table_name,
      pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
      s.idx_scan AS scans,
      s.idx_tup_read AS tuples_read,
      s.idx_tup_fetch AS tuples_fetched
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = ix.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname IN ('Empresa', 'CadCpsCampo', 'RegistroAnexo')
    ORDER BY t.relname, i.relname
  `;
}

async function checkPerformanceIndexes() {
  const rows = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = ANY(${PERFORMANCE_INDEX_NAMES})
  `;
  const found = new Set(rows.map((r) => r.indexname));
  return PERFORMANCE_INDEX_NAMES.map((name) => ({
    name,
    exists: found.has(name),
  }));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL ausente. Configure backend/.env ou exporte a variável.");
    process.exit(1);
  }

  console.log("=== LATENCY PROFILE (server-side, PostgreSQL direto) ===\n");

  const connect = await timed("Prisma connect + SELECT 1", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  });
  console.log(`${connect.label}: ${connect.ms}ms`);

  const countPlan = await timed("EXPLAIN ANALYZE COUNT Empresa", () =>
    explainCountQuery(SCOPE.clienteId)
  );
  console.log(`\n--- COUNT plan (${countPlan.ms}ms prepare+execute) ---`);
  console.log(JSON.stringify(countPlan.result, null, 2));

  const listPlan = await timed("EXPLAIN ANALYZE LIST Empresa 50", () =>
    explainListQuery(SCOPE.clienteId, 50, 0)
  );
  console.log(`\n--- LIST plan (${listPlan.ms}ms prepare+execute) ---`);
  console.log(JSON.stringify(listPlan.result, null, 2));

  const findMany = await timed("Prisma findMany 50", () =>
    prisma.empresa.findMany({
      where: { cliente_id: SCOPE.clienteId },
      select: {
        id: true,
        codempresa: true,
        razao_social: true,
        nome_fantasia: true,
        cpf_cnpj: true,
        telefone: true,
        email: true,
        cidade: true,
        estado: true,
        status: true,
        campos_personalizados: true,
      },
      orderBy: { codempresa: "asc" },
      take: 50,
    })
  );

  const count = await timed("Prisma count", () =>
    prisma.empresa.count({ where: { cliente_id: SCOPE.clienteId } })
  );

  const parallel = await timed("Prisma findMany+count paralelo", async () => {
    const [items, total] = await Promise.all([
      prisma.empresa.findMany({
        where: { cliente_id: SCOPE.clienteId },
        select: { id: true, codempresa: true, razao_social: true, status: true },
        orderBy: { codempresa: "asc" },
        take: 50,
      }),
      prisma.empresa.count({ where: { cliente_id: SCOPE.clienteId } }),
    ]);
    return { items: items.length, total };
  });

  const jsonStart = now();
  const payload = JSON.stringify(findMany.result);
  const jsonMs = ms(jsonStart);

  console.log("\n--- Prisma timings ---");
  console.log(`findMany(50): ${findMany.ms}ms (${findMany.result.length} rows)`);
  console.log(`count: ${count.ms}ms (${count.result} total)`);
  console.log(`parallel findMany+count: ${parallel.ms}ms`);
  console.log(`JSON.stringify(${payload.length} bytes): ${jsonMs}ms`);

  const indexes = await checkPerformanceIndexes();
  const missing = indexes.filter((i) => !i.exists);
  console.log(`\n--- Performance indexes: ${indexes.length - missing.length}/${indexes.length} ---`);
  if (missing.length) console.log("Faltando:", missing.map((m) => m.name).join(", "));

  const allIndexes = await listIndexes();
  console.log(`\n--- Índices Empresa/CadCps/Anexo (${allIndexes.length}) ---`);
  for (const row of allIndexes) {
    console.log(
      `${row.table_name}.${row.index_name} | size=${row.index_size} | scans=${row.scans ?? 0}`
    );
  }

  const unused = allIndexes.filter((r) => Number(r.scans ?? 0) === 0);
  console.log(`\nÍndices nunca usados (idx_scan=0): ${unused.length}`);
  unused.slice(0, 15).forEach((r) => console.log(`  - ${r.table_name}.${r.index_name}`));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
