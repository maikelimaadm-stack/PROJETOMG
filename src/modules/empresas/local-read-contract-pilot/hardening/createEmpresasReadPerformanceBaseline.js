import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { createEmpresasRuntimeReadProjection } from '../createEmpresasRuntimeReadProjection.js';
import { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';
import { createEmpresasParityDigest } from './createEmpresasParityDigest.js';
import { EMPRESAS_DATASET_PROFILES } from './empresasLocalReadHardeningConfig.js';

function nowMs(clock) {
  if (typeof clock === 'function') return clock();
  if (typeof globalThis !== 'undefined' && globalThis.performance && typeof globalThis.performance.now === 'function') return globalThis.performance.now();
  return Date.now();
}

function measure(fn, iterations, clock) {
  const times = [];
  for (let i = 0; i < iterations; i += 1) {
    const t0 = nowMs(clock);
    fn();
    const t1 = nowMs(clock);
    times.push(Math.max(0, t1 - t0));
  }
  times.sort((a, b) => a - b);
  const sum = times.reduce((s, x) => s + x, 0);
  const at = (p) => times[Math.min(times.length - 1, Math.floor((p / 100) * times.length))];
  return {
    iterations,
    minMs: times[0] ?? 0,
    maxMs: times[times.length - 1] ?? 0,
    avgMs: times.length ? sum / times.length : 0,
    p50Ms: at(50) ?? 0,
    p95Ms: at(95) ?? 0,
  };
}

/**
 * Local performance baseline (NOT a production SLA). Measures pure in-memory read
 * operations across dataset profiles. No network/backend/Prisma. Deterministic
 * `iterations`; validates completeness + expected complexity, not hard wall times.
 *
 * @param {Object} [options]
 * @param {number} [options.iterations] default 3 (keeps it fast/non-flaky)
 * @param {('tiny'|'small'|'medium'|'large')[]} [options.profiles]
 * @param {() => number} [options.clock] injectable clock
 * @returns {Object} baseline result
 */
export function createEmpresasReadPerformanceBaseline(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const iterations = Number.isInteger(o.iterations) && o.iterations > 0 ? o.iterations : 3;
  const profiles = Array.isArray(o.profiles) ? o.profiles : Object.keys(EMPRESAS_DATASET_PROFILES);
  const clock = o.clock;

  const measurements = [];
  for (const profile of profiles) {
    const dataset = createEmpresasScaledSyntheticDataset({ profile });
    const repository = createEmpresasReadOnlyRepository({ dataset });
    const context = contextForScaledTenant(dataset.tenants[0]);
    const ops = {
      'list-no-filter': () => repository.list({ pageSize: 100 }, context),
      'list-search': () => repository.list({ search: 'EMP' }, context),
      'list-filter': () => repository.list({ filters: { status: 'Ativa' } }, context),
      'list-sort': () => repository.list({ sort: 'razao_social', direction: 'desc' }, context),
      'list-page': () => repository.list({ page: 2, pageSize: 25 }, context),
      'query-composite': () => repository.list({ search: 'EMP', filters: { status: 'Ativa' }, sort: 'codempresa', page: 1, pageSize: 10 }, context),
      'runtime-projection': () => { const r = repository.list({}, context); createEmpresasRuntimeReadProjection({ listResult: r, query: r.query, tenantScope: context.tenantId }); },
      'parity-digest': () => { const r = repository.list({}, context); createEmpresasParityDigest({ result: r, query: r.query, context }); },
    };
    for (const [operation, fn] of Object.entries(ops)) {
      measurements.push({
        datasetSize: dataset.total,
        datasetProfile: profile,
        operation,
        ...measure(fn, iterations, clock),
        complexityNote: operation === 'parity-digest' || operation === 'runtime-projection' ? 'O(n)' : 'O(n log n) or O(n)',
        network: false,
        backend: false,
        prisma: false,
        mutation: false,
      });
    }
  }

  // Sanity: every measurement completed with finite times (no explosion/hang).
  const anomalies = measurements.filter((m) => !Number.isFinite(m.avgMs) || !Number.isFinite(m.maxMs));

  return safeCloneGenericModel({
    kind: 'empresas-read-performance-baseline',
    iterations,
    profiles,
    measurements,
    anomalies: anomalies.map((m) => `${m.datasetProfile}:${m.operation}`),
    hasAnomaly: anomalies.length > 0,
    isSla: false,
    localOnly: true,
    network: false,
    backend: false,
    prisma: false,
  });
}

export default createEmpresasReadPerformanceBaseline;
