import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Recommends the next safe decision after an engine run. Pure. It never authorizes a
 * side effect; it only names the next CONTRACT-ONLY slice. When a blueprint is blocked,
 * the decision is to fix the blueprint; when ready, the next foundation slice is the
 * blueprint→module reference planner (still headless). Never a side effect.
 *
 * @param {Object} [options]
 * @returns {Object} next-decision descriptor
 */
export function createStudioBlueprintEngineNextDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const readiness = isGenericModelPlainObject(o.readiness) ? o.readiness : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const blockers = Array.isArray(readiness.blockers) ? readiness.blockers : [];
  const breaking = compatibility.classification === 'breaking';

  let decision;
  let recommendedNextSlice;
  if (blockers.length > 0) {
    decision = 'fix_blueprint';
    recommendedNextSlice = 'resolve blockers before proceeding';
  } else if (breaking) {
    decision = 'bump_major_version';
    recommendedNextSlice = 'STUDIO BLUEPRINT ENGINE — VERSIONING SLICE (contract-only)';
  } else {
    decision = 'proceed_to_reference_planner';
    recommendedNextSlice = 'STUDIO BLUEPRINT → MODULE REFERENCE PLANNER (contract-only, headless)';
  }

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-next-decision',
    decision,
    recommendedNextSlice,
    // No decision here ever authorizes generation, UI, backend, or persistence.
    authorizesGeneration: false,
    authorizesUi: false,
    authorizesBackend: false,
    authorizesPersistence: false,
    authorizesRewriteEmpresas: false,
    blockers,
  });
}

export default createStudioBlueprintEngineNextDecision;
