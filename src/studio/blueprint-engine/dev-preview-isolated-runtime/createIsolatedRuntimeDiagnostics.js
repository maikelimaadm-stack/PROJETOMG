import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Builds passive DIAGNOSTICS for the isolated runtime. Pure — aggregates verification +
 * compatibility findings into a human-readable, side-effect-free report. It logs nothing, throws
 * nothing, and never performs I/O.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object} diagnostics report
 */
export function createIsolatedRuntimeDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const v = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const c = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  const warnings = Array.isArray(c.warnings) ? c.warnings : [];

  const core = {
    kind: 'isolated-runtime-diagnostics',
    passive: true,
    ok: blockers.length === 0,
    devOnlyConfirmed: v.devOnly === true && v.isolated === true,
    isolatedRuntimeImplemented: v.isolatedRuntimeImplemented === true,
    visualRuntimeImplemented: false,
    compatible: c.compatibleWithImplementationPlan !== false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    notes: blockers.length === 0
      ? ['isolated_runtime_dev_only_ok']
      : ['isolated_runtime_has_blockers'],
    logged: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeDiagnostics;
