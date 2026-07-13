import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioBlueprintInvalidCaseMatrix } from './createStudioBlueprintInvalidCaseMatrix.js';
import { createStudioDangerousBlueprintMatrix } from './createStudioDangerousBlueprintMatrix.js';
import { createStudioFieldHardeningMatrix } from './createStudioFieldHardeningMatrix.js';
import { createStudioPermissionHardeningMatrix } from './createStudioPermissionHardeningMatrix.js';
import { createStudioPersistenceTransitionMatrix } from './createStudioPersistenceTransitionMatrix.js';
import { createStudioCompatibilityBreakingMatrix } from './createStudioCompatibilityBreakingMatrix.js';
import { createStudioDigestHardeningSuite } from './createStudioDigestHardeningSuite.js';
import { createStudioSafetyInvariantRunner } from './createStudioSafetyInvariantRunner.js';

/** Local, non-SLA iteration profiles. Kept small so the baseline never explodes. */
const PROFILES = { tiny: 1, small: 3, medium: 8, large: 20 };

const OPERATIONS = {
  invalidCaseMatrix: createStudioBlueprintInvalidCaseMatrix,
  dangerousMatrix: createStudioDangerousBlueprintMatrix,
  fieldMatrix: createStudioFieldHardeningMatrix,
  permissionMatrix: createStudioPermissionHardeningMatrix,
  persistenceTransitions: createStudioPersistenceTransitionMatrix,
  compatibilityMatrix: createStudioCompatibilityBreakingMatrix,
  digestSuite: createStudioDigestHardeningSuite,
  safetyRunner: createStudioSafetyInvariantRunner,
};

/** Monotonic-ish clock: prefers performance.now(), falls back to Date.now(). */
function now() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.performance && typeof globalThis.performance.now === 'function') {
      return globalThis.performance.now();
    }
  } catch { /* ignore */ }
  return Date.now();
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[idx];
}

/**
 * Measures the local, non-SLA cost of running each hardening matrix/suite. Pure of
 * external effects: no network, backend, Prisma, mutation, or I/O. Validates only
 * completion and the absence of abnormal explosion.
 *
 * @param {Object} [options]
 * @param {'tiny'|'small'|'medium'|'large'} [options.profile]
 * @returns {Object} performance baseline
 */
export function createStudioContractPerformanceBaseline(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const profile = (typeof o.profile === 'string' && Object.prototype.hasOwnProperty.call(PROFILES, o.profile)) ? o.profile : 'small';
  const iterations = PROFILES[profile] ?? PROFILES.small;

  let totalScenarios = 0;
  const measures = Object.entries(OPERATIONS).map(([operation, fn]) => {
    const samples = [];
    let scenarioCount = 0;
    for (let i = 0; i < iterations; i += 1) {
      const t0 = now();
      const result = fn();
      const t1 = now();
      samples.push(Math.max(0, t1 - t0));
      scenarioCount = typeof result.scenarioCount === 'number' ? result.scenarioCount : (Array.isArray(result.scenarios) ? result.scenarios.length : (result.checkCount || 0));
    }
    totalScenarios += scenarioCount;
    const sorted = [...samples].sort((a, b) => a - b);
    const sum = samples.reduce((acc, v) => acc + v, 0);
    return {
      operation,
      iterations,
      scenarioCount,
      minMs: Number(sorted[0].toFixed(4)),
      maxMs: Number(sorted[sorted.length - 1].toFixed(4)),
      avgMs: Number((sum / samples.length).toFixed(4)),
      p50Ms: Number(percentile(sorted, 50).toFixed(4)),
      p95Ms: Number(percentile(sorted, 95).toFixed(4)),
      complexityNote: 'linear in scenario count; deterministic, no I/O',
    };
  });

  const worstMax = Math.max(...measures.map((m) => m.maxMs), 0);
  // Non-SLA sanity: a single matrix run should not take pathologically long locally.
  const performanceStatus = worstMax < 2000 ? 'ok' : 'anomaly';

  return safeCloneGenericModel({
    kind: 'studio-contract-performance-baseline',
    profile,
    profiles: Object.keys(PROFILES),
    iterations,
    totalScenarios,
    operations: measures,
    worstMaxMs: Number(worstMax.toFixed(4)),
    usesNetwork: false,
    usesBackend: false,
    usesPrisma: false,
    executesMutation: false,
    usesHardHardwareLimit: false,
    performanceStatus,
    readiness: performanceStatus === 'ok' ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioContractPerformanceBaseline;
