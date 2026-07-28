import { safeCloneAndNormalize, BuilderNormalizationError } from './safeCloneAndNormalize.js';

/**
 * Safe-normalize the incoming bridgeDecision READ-ONLY (never mutating the original). Returns { ok, source?, code? }.
 * Rejects a non-object source and any unsafe structure. Never throws.
 */
export function normalizeSourceDecision(bridgeDecision, maxDepth) {
  if (bridgeDecision === null || typeof bridgeDecision !== 'object' || Array.isArray(bridgeDecision)) {
    return { ok: false, code: 'BUILDER_SOURCE_REQUIRED' };
  }
  try {
    const source = safeCloneAndNormalize(bridgeDecision, { maxDepth });
    return { ok: true, source };
  } catch (e) {
    return { ok: false, code: e instanceof BuilderNormalizationError ? e.code : 'BUILDER_SOURCE_UNSUPPORTED_VALUE' };
  }
}
export default normalizeSourceDecision;
