import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Builds passive DIAGNOSTICS for the isolated runtime implementation plan. Pure, metadata-only.
 * Aggregates verification + compatibility findings into a human-readable, side-effect-free
 * report. It logs nothing, throws nothing, and never performs I/O.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object} diagnostics report
 */
export function createIsolatedRuntimeImplementationPlanDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const v = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const c = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  const warnings = Array.isArray(c.warnings) ? c.warnings : [];

  const core = {
    kind: 'isolated-runtime-implementation-plan-diagnostics',
    passive: true,
    ok: blockers.length === 0,
    headlessConfirmed: v.headless === true && v.contractOnly === true,
    runtimeImplemented: v.runtimeImplemented === true,
    compatible: c.compatibleWithRuntimeShellContract !== false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    notes: blockers.length === 0
      ? ['isolated_runtime_implementation_plan_headless_ok']
      : ['isolated_runtime_implementation_plan_has_blockers'],
    logged: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: planDigest(core) });
}

export default createIsolatedRuntimeImplementationPlanDiagnostics;
