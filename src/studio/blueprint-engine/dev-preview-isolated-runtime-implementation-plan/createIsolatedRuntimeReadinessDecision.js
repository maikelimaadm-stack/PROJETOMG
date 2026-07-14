import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Computes the readiness decision for the isolated runtime implementation plan. Pure,
 * metadata-only. Aggregates blockers/warnings and emits deterministic readiness flags. It NEVER
 * reports readiness for the implementation SLICE, real module generation, or production.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object} readiness decision
 */
export function createIsolatedRuntimeReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers.filter((x) => typeof x === 'string') : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings.filter((x) => typeof x === 'string') : [];
  const ok = blockers.length === 0;

  const core = {
    kind: 'isolated-runtime-readiness-decision',
    moduleId: String(o.runtimeShellContract?.moduleId ?? o.moduleId ?? 'plannedModule'),
    readiness: ok ? 'studio_dev_preview_isolated_runtime_implementation_plan_ready' : 'blocked',
    readyForIsolatedRuntimeImplementationPlan: ok,
    readyForIsolatedRuntimeImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, readinessDigest: planDigest(core) });
}

export default createIsolatedRuntimeReadinessDecision;
