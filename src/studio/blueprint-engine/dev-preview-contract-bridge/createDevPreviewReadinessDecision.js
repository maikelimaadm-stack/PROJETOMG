import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Computes the readiness decision for the dev preview contract bridge. Pure, metadata-only.
 * Aggregates blockers/warnings from the schemas and emits deterministic readiness flags. It
 * NEVER reports readiness for real module generation or production.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object} readiness decision
 */
export function createDevPreviewReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers.filter((x) => typeof x === 'string') : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings.filter((x) => typeof x === 'string') : [];
  const ok = blockers.length === 0;

  const core = {
    kind: 'dev-preview-readiness-decision',
    moduleId: String(o.sandbox?.moduleId ?? o.moduleId ?? 'plannedModule'),
    readiness: ok ? 'studio_dev_preview_contract_bridge_ready' : 'blocked',
    readyForDevPreviewBridge: ok,
    readyForDevPreviewVisualSlice: ok,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, readinessDigest: bridgeDigest(core) });
}

export default createDevPreviewReadinessDecision;
