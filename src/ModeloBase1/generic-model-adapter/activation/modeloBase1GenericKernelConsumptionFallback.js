import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createModeloBase1GenericFallbackBridge } from '../createModeloBase1GenericFallbackBridge.js';

/**
 * Builds the LEGACY-FALLBACK result for a generic kernel consumption attempt.
 * It returns the ORIGINAL ModeloBase1 read state untouched, plus a generic
 * fallback + rollback plan and the reason. Pure and passive — it never executes
 * a rollback and never touches a backend/Prisma/runtime bridge. Guarantees the
 * current ModeloBase1 flow is preserved verbatim on any failure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] The ORIGINAL applied ModeloBase1 read state (returned as-is).
 * @param {string} [options.reason] Why consumption fell back.
 * @param {string[]} [options.errors]
 * @param {string[]} [options.warnings]
 * @returns {{ ok: boolean, consumptionApplied: boolean, legacyFallback: boolean, readState: Object|null, reason: string, fallback: Object, rollbackPlan: Object, errors: string[], warnings: string[] }}
 */
export function createModeloBase1GenericKernelConsumptionFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const reason = typeof o.reason === 'string' ? o.reason : 'consumption-fallback';
  const originalReadState = isGenericModelPlainObject(o.readState) ? o.readState : null;

  const { fallback, rollbackPlan } = createModeloBase1GenericFallbackBridge({
    moduleId,
    operation: 'generic-kernel-consumption',
    reason: mapReasonToBridge(reason),
  });

  // Return the ORIGINAL read state verbatim (a safe clone so callers can't
  // mutate through the reference). When there is no original state, callers keep
  // whatever legacy state they already hold.
  const readState = originalReadState ? safeCloneGenericModel(originalReadState) : null;

  return {
    ok: false,
    consumptionApplied: false,
    legacyFallback: true,
    readState,
    reason,
    fallback,
    rollbackPlan,
    errors: Array.isArray(o.errors) ? o.errors : [],
    warnings: Array.isArray(o.warnings) ? o.warnings : [],
  };
}

/**
 * Maps a consumption-layer reason to the generic fallback bridge's reason enum.
 * @param {string} reason
 * @returns {'runtime-read-model-absent'|'invalid-read-model'|'adapter-failure'}
 */
function mapReasonToBridge(reason) {
  if (reason === 'beta-read-model-off' || reason === 'runtime-read-model-absent') return 'runtime-read-model-absent';
  if (reason === 'generic-validation-failed' || reason === 'invalid-read-model') return 'invalid-read-model';
  return 'adapter-failure';
}

export default createModeloBase1GenericKernelConsumptionFallback;
