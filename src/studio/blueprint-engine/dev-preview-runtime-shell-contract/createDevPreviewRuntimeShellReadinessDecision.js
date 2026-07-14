import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Computes the readiness decision for the dev preview runtime shell contract. Pure,
 * metadata-only. Aggregates blockers/warnings and emits deterministic readiness flags. It
 * NEVER reports readiness for the runtime IMPLEMENTATION, real module generation, or
 * production.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object} readiness decision
 */
export function createDevPreviewRuntimeShellReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers.filter((x) => typeof x === 'string') : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings.filter((x) => typeof x === 'string') : [];
  const ok = blockers.length === 0;

  const core = {
    kind: 'dev-preview-runtime-shell-readiness-decision',
    moduleId: String(o.visualContract?.moduleId ?? o.moduleId ?? 'plannedModule'),
    readiness: ok ? 'studio_dev_preview_runtime_shell_contract_ready' : 'blocked',
    readyForDevPreviewRuntimeShellContract: ok,
    readyForDevPreviewRuntimeImplementation: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, readinessDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellReadinessDecision;
