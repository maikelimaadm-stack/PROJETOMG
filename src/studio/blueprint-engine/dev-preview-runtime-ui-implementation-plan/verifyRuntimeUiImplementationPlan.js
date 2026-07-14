import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Verifies a produced runtime UI implementation plan for headless / plan-only safety invariants.
 * Pure — returns a report; never throws, never mutates, never performs I/O. Any violated
 * invariant produces a blocker.
 *
 * Detects: runtimeUiImplemented true, React/JSX/TSX/DOM/CSS-runtime attempts, route/placement
 * attempts, backend/Prisma attempts, mutation/persistence attempts, production/staging attempts,
 * real data read/write attempts, unsafe `realRenderAllowed:true`, unsafe
 * `componentAdapterImplemented:true`, unsafe `handlersCreated:true`, a missing manual gate, and
 * forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan]
 * @returns {Object}
 */
export function verifyRuntimeUiImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'runtimeUiImplemented', 'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated',
    'cssRuntimeCreated', 'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'planOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (plan.metadataOnly === false) blockers.push('plan_must_be_metadata_only');

  // Pipeline: realRenderAllowed must never be true.
  const pp = isGenericModelPlainObject(plan.pipelinePlan) ? plan.pipelinePlan : {};
  if (pp.realRenderAllowed === true) blockers.push('unsafe_real_render_allowed_true');
  if (pp.pipelineImplemented === true) blockers.push('unsafe_pipeline_implemented');

  // Component adapter: componentAdapterImplemented must never be true.
  const ca = isGenericModelPlainObject(plan.componentAdapterPlan) ? plan.componentAdapterPlan : {};
  if (ca.componentAdapterImplemented === true) blockers.push('unsafe_component_adapter_implemented');
  if (ca.realComponentImports === true || ca.realComponentPath) blockers.push('unsafe_real_component_path');

  // Interaction adapter: handlersCreated must never be true.
  const ia = isGenericModelPlainObject(plan.interactionAdapterPlan) ? plan.interactionAdapterPlan : {};
  if (ia.handlersCreated === true) blockers.push('unsafe_handlers_created');
  if (ia.mutationAllowed === true) blockers.push('unsafe_interaction_mutation');

  // Renderer adapter: rendererImplemented must never be true.
  const ra = isGenericModelPlainObject(plan.rendererAdapterPlan) ? plan.rendererAdapterPlan : {};
  if (ra.rendererImplemented === true) blockers.push('unsafe_renderer_implemented');

  // Manual gate must be present and require the checkpoint.
  const mg = isGenericModelPlainObject(plan.manualGatePlan) ? plan.manualGatePlan : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesRealUi === true) blockers.push('unsafe_manual_gate_authorizes_real_ui');

  const ok = blockers.length === 0;
  const core = {
    kind: 'runtime-ui-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    planOnly: caps.planOnly === true,
    runtimeUiImplemented: caps.runtimeUiImplemented === true,
    visualRuntimeImplemented: caps.visualRuntimeImplemented === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: uiPlanDigest(core) });
}

export default verifyRuntimeUiImplementationPlan;
