import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_MODE,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  authoringPlanDigest,
} from './authoringImplementationPlanConfig.js';

/**
 * Builds the deterministic PLAN session from an authoring foundation contract. Pure — no storage, no
 * fetch, no persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.authoringFoundationContract]
 * @returns {Object}
 */
export function createAuthoringImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.authoringFoundationContract) ? o.authoringFoundationContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'authoring-implementation-plan-session',
    sessionId: `${moduleId}#module-blueprint-authoring-implementation-plan`,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    sourceAuthoringFoundationContract: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    sourceBlueprintContract: BLUEPRINT_CONTRACT_VERSION,
    sourceBlueprintEngine: BLUEPRINT_ENGINE_VERSION,
    mode: AUTHORING_IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'studio-module-blueprint-authoring-foundation-contract',
    seed: `authoring-implementation-plan:${moduleId}`,
    consumesUpstreamReadOnly: true,
    planOnly: true,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationPlanSession;
