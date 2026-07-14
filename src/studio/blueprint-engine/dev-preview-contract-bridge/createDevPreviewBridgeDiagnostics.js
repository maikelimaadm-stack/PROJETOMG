import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Builds passive DIAGNOSTICS for the dev preview bridge. Pure, metadata-only. Aggregates
 * verification + compatibility findings into a human-readable, side-effect-free report. It
 * logs nothing, throws nothing, and never performs I/O.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object} diagnostics report
 */
export function createDevPreviewBridgeDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const v = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const c = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  const warnings = Array.isArray(c.warnings) ? c.warnings : [];

  const core = {
    kind: 'dev-preview-bridge-diagnostics',
    passive: true,
    ok: blockers.length === 0,
    headlessConfirmed: v.headless === true && v.contractOnly === true,
    compatible: c.compatible !== false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    notes: blockers.length === 0
      ? ['dev_preview_contract_bridge_headless_ok']
      : ['dev_preview_contract_bridge_has_blockers'],
    logged: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: bridgeDigest(core) });
}

export default createDevPreviewBridgeDiagnostics;
