import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds passive DIAGNOSTICS for the runtime UI contract. Pure — aggregates verification +
 * compatibility findings into a human-readable, side-effect-free report. Logs nothing, throws
 * nothing, never performs I/O.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object} diagnostics report
 */
export function createRuntimeUiDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const v = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const c = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  const warnings = Array.isArray(c.warnings) ? c.warnings : [];

  const core = {
    kind: 'runtime-ui-diagnostics',
    passive: true,
    ok: blockers.length === 0,
    headlessConfirmed: v.headless === true && v.contractOnly === true,
    visualRuntimeImplemented: false,
    compatible: c.compatibleWithIsolatedRuntime !== false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    notes: blockers.length === 0 ? ['runtime_ui_contract_headless_ok'] : ['runtime_ui_contract_has_blockers'],
    logged: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: uiContractDigest(core) });
}

export default createRuntimeUiDiagnostics;
