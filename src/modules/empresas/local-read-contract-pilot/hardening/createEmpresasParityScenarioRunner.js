import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';
import { createEmpresasReadOnlyRepository } from '../createEmpresasReadOnlyRepository.js';
import { createEmpresasReadOnlyApiAdapter } from '../createEmpresasReadOnlyApiAdapter.js';
import { createEmpresasRuntimeReadProjection } from '../createEmpresasRuntimeReadProjection.js';
import { createEmpresasScaledSyntheticDataset, contextForScaledTenant } from './createEmpresasScaledSyntheticDataset.js';
import { empresasCompositeQueryScenarios } from './createEmpresasCompositeQueryMatrix.js';

/** Injectable clock for elapsedMs (avoids flakiness). */
function nowMs(clock) {
  if (typeof clock === 'function') return clock();
  if (typeof globalThis !== 'undefined' && globalThis.performance && typeof globalThis.performance.now === 'function') return globalThis.performance.now();
  return Date.now();
}

/** Digest of a list of records by id-order (parity across the 3 read paths). */
function idsDigest(items) {
  return createGenericModelChecksum({ value: (Array.isArray(items) ? items : []).map((r) => r && r.id) });
}

/**
 * Runs each accepted composite-query scenario across repository, API adapter and
 * runtime projection and asserts EXACT parity (ids/order/total/page). Any silent
 * divergence is a blocker. Pure aside from local reads.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataset]
 * @param {Object} [options.context]
 * @param {() => number} [options.clock]
 * @returns {Object} suite result
 */
export function createEmpresasParityScenarioRunner(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const dataset = isGenericModelPlainObject(o.dataset) ? o.dataset : createEmpresasScaledSyntheticDataset({ profile: 'small' });
  const repository = createEmpresasReadOnlyRepository({ dataset });
  const apiAdapter = createEmpresasReadOnlyApiAdapter({ repository });
  const context = isGenericModelPlainObject(o.context) ? o.context : contextForScaledTenant(dataset.tenants[0]);
  const clock = o.clock;

  const accepted = empresasCompositeQueryScenarios().filter((s) => s.accept);
  /** @type {string[]} */ const allBlockers = [];

  const scenarios = accepted.map((sc) => {
    const t0 = nowMs(clock);
    const repoRes = repository.list(sc.query, context);
    const apiRes = apiAdapter.listEmpresas(sc.query, context);
    const runtimeRes = createEmpresasRuntimeReadProjection({ listResult: repoRes, query: repoRes.query, tenantScope: context.tenantId });
    const t1 = nowMs(clock);

    const repoDigest = idsDigest(repoRes.items);
    const apiDigest = idsDigest(apiRes.items);
    const runtimeDigest = idsDigest(runtimeRes.items);

    /** @type {string[]} */ const differences = [];
    if (repoDigest !== apiDigest) differences.push('repo-vs-api-ids');
    if (repoDigest !== runtimeDigest) differences.push('repo-vs-runtime-ids');
    if (repoRes.total !== apiRes.total || repoRes.total !== runtimeRes.total) differences.push('total');
    if (repoRes.page !== apiRes.page || repoRes.page !== runtimeRes.page) differences.push('page');
    if (repoRes.pageSize !== apiRes.pageSize || repoRes.pageSize !== runtimeRes.pageSize) differences.push('pageSize');

    const blockers = differences.map((d) => `parity:${sc.id}:${d}`);
    for (const b of blockers) allBlockers.push(b);
    const equal = differences.length === 0;

    return {
      scenarioId: sc.id,
      query: sc.query,
      contextSummary: { tenantId: context.tenantId, permission: repoRes.ok ? 'allowed' : repoRes.reason },
      repositoryDigest: repoDigest,
      apiDigest,
      runtimeDigest,
      equal,
      score: equal ? 1 : 0,
      differences,
      blockers,
      warnings: [],
      elapsedMs: Math.max(0, t1 - t0),
      safeToProceed: equal,
    };
  });

  const passed = scenarios.filter((s) => s.equal).length;
  const exactParity = passed === scenarios.length;
  const score = scenarios.length === 0 ? 1 : passed / scenarios.length;

  return safeCloneGenericModel({
    kind: 'empresas-parity-scenario-suite',
    total: scenarios.length,
    passed,
    failed: scenarios.length - passed,
    score,
    exactParity,
    blockers: allBlockers,
    warnings: [],
    scenarios,
    readiness: exactParity ? 'ready_for_local_certification' : 'blocked',
  });
}

export default createEmpresasParityScenarioRunner;
