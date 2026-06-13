/**
 * Rotas de diagnóstico de latência — habilitar com DEBUG_LATENCY=true.
 * GET /api/debug/latency-breakdown?endpoint=empresas
 * GET /api/debug/scope-only — isola loadAccessScope
 */
import { performance } from "node:perf_hooks";
import { getPrismaClient } from "../../database/prismaClient.js";
import { loadAccessScope } from "../auth/accessScope.js";
import { empresaRepository } from "../empresas/repositories/empresaRepository.js";
import { svcCps } from "../cadcps/svcCps.js";

const ms = (start) => Number((performance.now() - start).toFixed(2));

export const registerLatencyDebugRoutes = async (app) => {
  if (String(process.env.DEBUG_LATENCY || "").toLowerCase() !== "true") return;

  app.get("/api/debug/scope-only", { preHandler: app.authenticate }, async (request) => {
    const totalStart = performance.now();
    const scopeStart = performance.now();
    const scope = await loadAccessScope(request);
    return {
      loadAccessScopeMs: ms(scopeStart),
      totalHandlerMs: ms(totalStart),
      scope: { clienteId: scope.clienteId, acessoGlobal: scope.acessoGlobal },
    };
  });

  app.get("/api/debug/latency-breakdown", { preHandler: app.authenticate }, async (request) => {
    const endpoint = String(request.query?.endpoint || "empresas").toLowerCase();
    const timings = {};
    const totalStart = performance.now();

    const scopeStart = performance.now();
    const scope = await loadAccessScope(request);
    timings.loadAccessScopeMs = ms(scopeStart);

    const prisma = getPrismaClient();

    if (endpoint === "health") {
      const dbStart = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      timings.postgresPingMs = ms(dbStart);
    } else if (endpoint === "empresas") {
      const whereStart = performance.now();
      const where = await empresaRepository.buildListWhere(prisma, scope, { search: "", filters: {} });
      timings.buildListWhereMs = ms(whereStart);

      const findStart = performance.now();
      const items = await prisma.empresa.findMany({
        where,
        select: empresaRepository.LIST_SELECT,
        orderBy: empresaRepository.resolveOrderBy("codempresa", "asc"),
        skip: 0,
        take: 50,
      });
      timings.prismaFindManyMs = ms(findStart);

      const countStart = performance.now();
      const total = await prisma.empresa.count({ where });
      timings.prismaCountMs = ms(countStart);

      const explainStart = performance.now();
      const plan = await prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
         SELECT id FROM "Empresa" WHERE cliente_id = $1 ORDER BY codempresa ASC LIMIT 50`,
        scope.clienteId
      );
      timings.explainAnalyzeMs = ms(explainStart);
      timings.explainPlan = plan?.[0]?.["QUERY PLAN"]?.[0] ?? plan;

      const jsonStart = performance.now();
      const payload = JSON.stringify({ items, total, page: 1, pageSize: 50 });
      timings.jsonSerializeMs = ms(jsonStart);
      timings.payloadBytes = Buffer.byteLength(payload, "utf8");
    } else if (endpoint === "cadcps") {
      const listStart = performance.now();
      const result = await svcCps.list(scope, {
        page: 1,
        pageSize: 50,
        search: "",
        sortBy: "codigo",
        sortDir: "asc",
      });
      timings.svcCpsListMs = ms(listStart);

      const jsonStart = performance.now();
      const payload = JSON.stringify(result);
      timings.jsonSerializeMs = ms(jsonStart);
      timings.payloadBytes = Buffer.byteLength(payload, "utf8");
    }

    timings.totalHandlerMs = ms(totalStart);
    return {
      endpoint,
      timings,
      scope: { clienteId: scope.clienteId, acessoGlobal: scope.acessoGlobal },
    };
  });

  app.get("/api/debug/pg-indexes", { preHandler: app.authenticate }, async () => {
    const prisma = getPrismaClient();
    const rows = await prisma.$queryRaw`
      SELECT
        i.indexrelname AS index_name,
        t.relname AS table_name,
        pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
        COALESCE(s.idx_scan, 0)::bigint AS scans
      FROM pg_index ix
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = ix.indexrelid
      WHERE n.nspname = 'public' AND t.relname = 'Empresa'
      ORDER BY s.idx_scan DESC NULLS LAST, i.relname
    `;
    return { indexes: rows };
  });
};
