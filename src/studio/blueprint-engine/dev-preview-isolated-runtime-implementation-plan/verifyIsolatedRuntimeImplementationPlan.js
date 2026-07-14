import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Verifies a produced isolated runtime implementation plan for headless safety invariants.
 * Pure, metadata-only. Returns a verification report — it never throws, never mutates, never
 * performs I/O. Any violated invariant produces a blocker.
 *
 * Detects: `runtimeImplemented:true`, React/JSX/TSX/DOM/CSS-runtime attempts, route/menu
 * attempts, backend/Prisma attempts, mutation/persistence attempts, production/staging attempts,
 * real data read/write attempts, unsafe `renderAllowed:true`, unsafe `rolloutAllowed:true`, a
 * missing manual gate, and forbidden flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] the produced implementation plan (from the composer)
 * @returns {Object} verification report
 */
export function verifyIsolatedRuntimeImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'runtimeImplemented', 'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated',
    'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated',
    'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed',
    'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated',
    'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'planOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (plan.metadataOnly === false) blockers.push('plan_must_be_metadata_only');

  // Render pipeline: renderAllowed must never be true.
  const rp = isGenericModelPlainObject(plan.renderPipeline) ? plan.renderPipeline : {};
  if (rp.renderAllowed === true) blockers.push('unsafe_render_allowed_true');
  if (rp.renderImplemented === true) blockers.push('unsafe_render_implemented');

  // Rollout: rolloutAllowed must never be true; manual enablement required.
  const rr = isGenericModelPlainObject(plan.rolloutRollback) ? plan.rolloutRollback : {};
  if (rr.rolloutAllowed === true) blockers.push('unsafe_rollout_allowed_true');
  if (rr.manualEnablementRequired === false) blockers.push('missing_manual_gate');

  // Data access: no real data read/write.
  const da = isGenericModelPlainObject(plan.dataAccessBlocked) ? plan.dataAccessBlocked : {};
  if (da.realDataRead === true) blockers.push('unsafe_real_data_read');
  if (da.realDataWrite === true) blockers.push('unsafe_real_data_write');

  // Phases: none implemented.
  const ph = isGenericModelPlainObject(plan.phases) ? plan.phases : {};
  if (ph.anyImplemented === true) blockers.push('unsafe_phase_implemented');

  // Adapter: not implemented.
  const ad = isGenericModelPlainObject(plan.adapterPlan) ? plan.adapterPlan : {};
  if (ad.adapterImplemented === true) blockers.push('unsafe_adapter_implemented');

  const ok = blockers.length === 0;
  const core = {
    kind: 'isolated-runtime-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    runtimeImplemented: caps.runtimeImplemented === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: planDigest(core) });
}

export default verifyIsolatedRuntimeImplementationPlan;
