import { BRIDGE_VERSION, BRIDGE_MODE } from './bridgeRuntimeConfig.js';
import { createBridgeValidationPipeline } from './createBridgeValidationPipeline.js';
import { createBridgeDecisionDigest } from './createBridgeDecisionDigest.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { sortBridgeIssues } from './sortBridgeIssues.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject, safeNormalizeSourceStructure } from './normalizeBridgeInput.js';

/**
 * Assembles the atomic, deep-frozen decision core from a resolved (ok, target, issues, stages) shape. Shared
 * by the success path, the structural-rejection path and the sanitized emergency rejection so every decision
 * has an identical shape, identical failure-containment invariants, and — on success — a byte-identical
 * `bridgeDecisionDigest` to the pre-hardening bridge (the digested `core` is unchanged). Pure.
 * @param {Object} p @returns {Object}
 */
function buildDecision(p) {
  const ok = p.ok === true;
  const issues = Array.isArray(p.issues) ? p.issues : [];
  const stages = Array.isArray(p.stages) ? p.stages : [];
  const core = {
    kind: 'bridge-decision',
    bridgeVersion: BRIDGE_VERSION,
    mode: BRIDGE_MODE,
    ok,
    status: ok ? 'bridge_ready' : 'bridge_rejected',
    targetDescriptorCreated: ok,
    targetDescriptor: ok ? p.targetDescriptor : null,
    issues,
    issueCount: issues.length,
    blockerCount: issues.filter((i) => i.severity === 'blocker').length,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    stages,
    stageCount: stages.length,
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

/**
 * Produces the atomic, deep-frozen bridge decision. Before running the pipeline it structurally validates the
 * source (cycle guard, deterministic depth cap, JSON-safe type policy, sparse-array/accessor/non-plain-object
 * rejection) via `safeNormalizeSourceStructure`; a structural blocker yields a deterministic `bridge_rejected`
 * decision with no target and the pipeline never sees hostile input. On success: `bridge_ready` + frozen
 * target descriptor (byte-identical decision to the pre-hardening bridge for real handoffs). Pure — the
 * source is never mutated. @param {Object} options @returns {Object}
 */
export function createBridgeDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const structural = safeNormalizeSourceStructure(o.sourceHandoff);
  if (!structural.ok) {
    return buildDecision({ ok: false, issues: sortBridgeIssues(structural.issues), stages: [] });
  }
  // The pipeline only ever sees a bounded, cycle-free, JSON-safe clone of the source.
  const result = createBridgeValidationPipeline({ ...o, sourceHandoff: structural.value });
  const ok = result.blocked === false && result.targetDescriptorCreated === true;
  return buildDecision({ ok, targetDescriptor: result.targetDescriptor, issues: result.issues, stages: result.stages });
}

/**
 * Deterministic, sanitized emergency rejection. Independent of the (possibly hostile) input: it never reads,
 * serializes or reflects the input, never invokes accessors, and cannot itself throw. Carries NO internal
 * message, stack, cause, path, config, payload or secret — only the fixed `BRIDGE_UNEXPECTED_EXECUTION_FAILURE`
 * code and the generic message "Bridge execution failed closed." @returns {Object}
 */
export function createEmergencyBridgeRejection() {
  const issue = createBridgeIssue({
    issueCode: 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE',
    severity: 'blocker',
    stage: 'source_shape_validation',
    path: 'source',
    message: 'Bridge execution failed closed.',
  });
  return buildDecision({ ok: false, issues: [issue], stages: [] });
}

export default createBridgeDecision;
