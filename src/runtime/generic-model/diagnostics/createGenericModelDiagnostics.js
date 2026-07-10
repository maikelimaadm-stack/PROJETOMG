import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { GENERIC_MODEL_NEXT_STEP } from '../contracts/genericModelContractConstants.js';

const READINESS = new Set(['ready', 'fallback', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Builds passive Generic Model DIAGNOSTICS. Pure, deterministic; never exposes
 * raw data or sensitive values — only flags, counts and readiness. Safe defaults
 * assert no IO/side effects. Returns a safe copy.
 *
 * @param {Object} [input] Accepts blocks: moduleId/modelId/modelType/phase/
 *   enabled/source/flags/safety/contract/read/write/persistence/fallback/
 *   rollback/warnings/blockers/evidence/readiness.
 * @returns {Object}
 */
export function createGenericModelDiagnostics(input = {}) {
  const o = isGenericModelPlainObject(input) ? input : {};
  const warnings = Array.isArray(o.warnings) ? o.warnings.map(String) : [];
  const blockers = Array.isArray(o.blockers) ? o.blockers.map(String) : [];

  const readiness = READINESS.has(o.readiness)
    ? o.readiness
    : (blockers.length > 0 ? 'needs_fixes' : (o.enabled ? 'ready' : 'fallback'));
  const status = blockers.length > 0 ? 'blocked' : 'ok';

  return safeCloneGenericModel({
    kind: 'generic-model-diagnostics',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    modelType: typeof o.modelType === 'string' ? o.modelType : null,
    phase: typeof o.phase === 'string' ? o.phase : 'foundation',
    enabled: Boolean(o.enabled),
    source: typeof o.source === 'string' ? o.source : null,
    status,
    readiness,
    counts: {
      warnings: warnings.length,
      blockers: blockers.length,
    },
    warnings,
    blockers,
    evidence: isGenericModelPlainObject(o.evidence) ? o.evidence : null,
    // Safe defaults — the foundation never touches these.
    localOnly: true,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    noSideEffects: true,
    nextAllowedStep: GENERIC_MODEL_NEXT_STEP,
  });
}

export default createGenericModelDiagnostics;
