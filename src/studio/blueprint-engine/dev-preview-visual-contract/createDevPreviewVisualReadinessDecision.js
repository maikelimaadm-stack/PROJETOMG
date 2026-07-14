import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Computes the readiness decision for the dev preview visual contract. Pure, metadata-only.
 * Aggregates blockers/warnings and emits deterministic readiness flags. It NEVER reports
 * readiness for the visual RUNTIME, real module generation, or production.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object} readiness decision
 */
export function createDevPreviewVisualReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers.filter((x) => typeof x === 'string') : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings.filter((x) => typeof x === 'string') : [];
  const ok = blockers.length === 0;

  const core = {
    kind: 'dev-preview-visual-readiness-decision',
    moduleId: String(o.bridge?.moduleId ?? o.moduleId ?? 'plannedModule'),
    readiness: ok ? 'studio_dev_preview_visual_contract_ready' : 'blocked',
    readyForDevPreviewVisualContract: ok,
    readyForDevPreviewVisualRuntime: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, readinessDigest: visualDigest(core) });
}

export default createDevPreviewVisualReadinessDecision;
