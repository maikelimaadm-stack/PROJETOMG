import { BRIDGE_VERSION, BRIDGE_MODE } from './bridgeRuntimeConfig.js';
import { createBridgeValidationPipeline } from './createBridgeValidationPipeline.js';
import { createBridgeDecisionDigest } from './createBridgeDecisionDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Produces the atomic, deep-frozen bridge decision from a validated pipeline run. On success: bridge_ready +
 * frozen target descriptor. On failure: bridge_rejected + null target + deterministic sorted issues. No
 * partial state; no side effects; the source is never mutated. Pure. @param {Object} options @returns {Object}
 */
export function createBridgeDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const result = createBridgeValidationPipeline(o);
  const ok = result.blocked === false && result.targetDescriptorCreated === true;
  const status = ok ? 'bridge_ready' : 'bridge_rejected';

  const core = {
    kind: 'bridge-decision',
    bridgeVersion: BRIDGE_VERSION,
    mode: BRIDGE_MODE,
    ok,
    status,
    targetDescriptorCreated: ok,
    targetDescriptor: ok ? result.targetDescriptor : null,
    issues: result.issues,
    issueCount: result.issueCount,
    blockerCount: result.issues.filter((i) => i.severity === 'blocker').length,
    errorCount: result.issues.filter((i) => i.severity === 'error').length,
    warningCount: result.issues.filter((i) => i.severity === 'warning').length,
    stages: result.stages,
    stageCount: result.stageCount,
    // Failure containment invariants.
    sourceMutated: false,
    sideEffects: 0,
    externalCleanupRequired: false,
    databaseRollbackRequired: false,
    filesystemCleanupRequired: false,
    rollbackByNonConsumption: true,
    partialTargetDescriptor: false,
    // Boundaries.
    previewMounted: false,
    appTouched: false,
    routeCreated: false,
    menuCreated: false,
    persisted: false,
    productExposed: false,
    moduleGenerated: false,
    certificationPerformed: false,
    realDataRead: false,
    idempotent: true,
    replaySideEffectsAllowed: false,
  };
  const decision = { ...core, bridgeDecisionDigest: createBridgeDecisionDigest(core) };
  return deepFreeze(decision);
}

export default createBridgeDecision;
