import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Computes the readiness decision for the runtime UI contract. Pure, metadata-only. Aggregates
 * blockers/warnings and emits deterministic readiness flags. It NEVER reports readiness for the
 * UI implementation, route/menu integration, real module generation, or production.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object} readiness decision
 */
export function createRuntimeUiReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers.filter((x) => typeof x === 'string') : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings.filter((x) => typeof x === 'string') : [];
  const ok = blockers.length === 0;

  const core = {
    kind: 'runtime-ui-readiness-decision',
    moduleId: String(o.frameMapping?.moduleId ?? o.moduleId ?? 'plannedModule'),
    readiness: ok ? 'studio_dev_preview_runtime_ui_contract_ready' : 'blocked',
    readyForRuntimeUiContract: ok,
    readyForRuntimeUiImplementation: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, readinessDigest: uiContractDigest(core) });
}

export default createRuntimeUiReadinessDecision;
