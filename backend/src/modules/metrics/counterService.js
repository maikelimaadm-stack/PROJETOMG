import { getPrismaClient } from "../../database/prismaClient.js";
import { tieredCache } from "../../cache/tieredCache.js";
import { probeSchemaCompatibility } from "../../database/schemaCompatibility.js";

const CLIENT_STATS_TTL_MS = Number(process.env.COUNTER_CACHE_TTL_MS || 120_000);
const statsKey = (clienteId) => `stats:${clienteId}`;

const readScopedEmpresaCount = (scope) => {
  if (!scope.acessoGlobal && scope.allowedEmpresaIds?.length) {
    return scope.allowedEmpresaIds.length;
  }
  if (scope.selectedEmpresaId) return 1;
  return null;
};

export const invalidateClienteStats = async (clienteId) => {
  await tieredCache.delete(statsKey(clienteId));
};

const loadClienteStatsFallback = async (prisma, clienteId) => {
  const row = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { next_id_global: true },
  });
  const [totalEmpresas, totalCadcpsCampos] = await Promise.all([
    prisma.empresa.count({ where: { cliente_id: clienteId } }),
    prisma.cadCpsCampo.count({ where: { cliente_id: clienteId } }),
  ]);
  return {
    totalEmpresas: Number(totalEmpresas),
    totalCadcpsCampos: Number(totalCadcpsCampos),
    nextIdGlobal: Number(row?.next_id_global ?? 1),
  };
};

const loadClienteStatsFromMaterialized = async (prisma, clienteId) => {
  const rows = await prisma.$queryRaw`
    SELECT
      next_id_global,
      total_empresas,
      total_cadcps_campos
    FROM "Cliente"
    WHERE id = ${clienteId}
    LIMIT 1
  `;
  const row = rows[0];
  return {
    totalEmpresas: Number(row?.total_empresas ?? 0),
    totalCadcpsCampos: Number(row?.total_cadcps_campos ?? 0),
    nextIdGlobal: Number(row?.next_id_global ?? 1),
  };
};

const loadClienteStats = async (clienteId) => {
  const key = statsKey(clienteId);
  const cached = await tieredCache.get(key);
  if (cached) return cached;

  const prisma = getPrismaClient();
  const compatibility = await probeSchemaCompatibility(prisma);
  const stats = compatibility.counterColumnsReady
    ? await loadClienteStatsFromMaterialized(prisma, clienteId)
    : await loadClienteStatsFallback(prisma, clienteId);

  await tieredCache.set(key, stats, CLIENT_STATS_TTL_MS);
  return stats;
};

export const getEmpresaCount = async (scope) => {
  const scoped = readScopedEmpresaCount(scope);
  if (scoped != null) return scoped;
  const stats = await loadClienteStats(scope.clienteId);
  return stats.totalEmpresas;
};

export const getCadcpsCampoCount = async (scope, { filtered = false } = {}) => {
  if (filtered) return null;
  const stats = await loadClienteStats(scope.clienteId);
  return stats.totalCadcpsCampos;
};

export const getRegistrosGlobais = async (clienteId) => {
  const stats = await loadClienteStats(clienteId);
  return Math.max(0, stats.nextIdGlobal - 1);
};

export const getContadoresFromCache = async (scope) => {
  const scoped = readScopedEmpresaCount(scope);
  if (scoped != null) {
    const registrosGlobais = await getRegistrosGlobais(scope.clienteId);
    return { empresas: scoped, registrosGlobais };
  }
  const stats = await loadClienteStats(scope.clienteId);
  return {
    empresas: stats.totalEmpresas,
    registrosGlobais: Math.max(0, stats.nextIdGlobal - 1),
  };
};

const statsToContadores = (stats, scope) => {
  const scoped = readScopedEmpresaCount(scope);
  if (scoped != null) {
    return {
      empresas: scoped,
      registrosGlobais: Math.max(0, stats.nextIdGlobal - 1),
    };
  }
  return {
    empresas: stats.totalEmpresas,
    registrosGlobais: Math.max(0, stats.nextIdGlobal - 1),
  };
};

const patchCachedStats = async (clienteId, patchFn) => {
  const key = statsKey(clienteId);
  let stats = await tieredCache.get(key);
  if (!stats) {
    stats = await loadClienteStats(clienteId);
  }
  patchFn(stats);
  await tieredCache.set(key, stats, CLIENT_STATS_TTL_MS);
  return stats;
};

/** Atualiza contador materializado e mantém cache quente (sem invalidar/reload). */
export const incrementClienteCounter = async (clienteId, field, delta = 1, scope = null) => {
  const prisma = getPrismaClient();
  const compatibility = await probeSchemaCompatibility(prisma);
  if (!compatibility.counterColumnsReady) {
    await invalidateClienteStats(clienteId);
    return scope ? getContadoresFromCache(scope) : null;
  }
  const column = field === "empresas" ? "total_empresas" : "total_cadcps_campos";
  await prisma.$executeRawUnsafe(
    `UPDATE "Cliente" SET "${column}" = GREATEST(0, "${column}" + $1) WHERE id = $2`,
    delta,
    clienteId
  );
  const stats = await patchCachedStats(clienteId, (current) => {
    if (field === "empresas") {
      current.totalEmpresas = Math.max(0, current.totalEmpresas + delta);
    } else {
      current.totalCadcpsCampos = Math.max(0, current.totalCadcpsCampos + delta);
    }
  });
  return scope ? statsToContadores(stats, scope) : stats;
};

/** Sincroniza next_id_global reservado na transação com o cache de contadores. */
export const bumpNextIdGlobalInCache = async (clienteId, delta = 1, scope = null) => {
  const stats = await patchCachedStats(clienteId, (current) => {
    current.nextIdGlobal = Math.max(1, current.nextIdGlobal + delta);
  });
  return scope ? statsToContadores(stats, scope) : stats;
};
