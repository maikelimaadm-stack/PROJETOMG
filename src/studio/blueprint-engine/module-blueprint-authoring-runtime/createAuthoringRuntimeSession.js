import {
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
} from './authoringRuntimeConfig.js';
import { isPlainObject, safeString } from './normalizeAuthoringInput.js';
import { createAuthoringResourceLimits } from './createAuthoringResourceLimits.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Creates a deterministic, in-memory, isolated authoring runtime SESSION. NOT a global singleton —
 * each call returns a fresh, frozen, per-instance session derived ONLY from an explicit seed/config
 * (never a clock or random). Pure. @param {Object} [config] @returns {Object}
 */
export function createAuthoringRuntimeSession(config = {}) {
  const c = isPlainObject(config) ? config : {};
  const seed = safeString(c.seed, 'default-authoring-session', 400);
  const limits = createAuthoringResourceLimits(isPlainObject(c.limits) ? c.limits : {});

  const core = {
    kind: 'authoring-runtime-session',
    sessionId: `authoring-runtime:${seed}`,
    sessionVersion: AUTHORING_RUNTIME_VERSION,
    seed,
    sourceVersions: {
      authoringRuntime: AUTHORING_RUNTIME_VERSION,
      authoringFoundationContract: AUTHORING_FOUNDATION_CONTRACT_VERSION,
      authoringImplementationPlan: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
      blueprintEngine: BLUEPRINT_ENGINE_VERSION,
    },
    synthetic: true,
    ephemeral: true,
    persistent: false,
    canonical: false,
    sideEffectFree: true,
    createdFromExplicitSeed: true,
    usesGlobalSingleton: false,
    drafts: [],
    draftCount: 0,
    operationCount: 0,
    revisionCountTotal: 0,
    limits,
    status: 'active',
  };
  return Object.freeze({ ...core, sessionDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeSession;
