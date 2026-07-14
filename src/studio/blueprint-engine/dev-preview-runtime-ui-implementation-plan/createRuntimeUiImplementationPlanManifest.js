import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
  uiPlanDigest,
} from './runtimeUiImplementationPlanConfig.js';
import { createRuntimeUiImplementationPlanSession } from './createRuntimeUiImplementationPlanSession.js';
import { createRuntimeUiImplementationPhases } from './createRuntimeUiImplementationPhases.js';
import { createRuntimeUiBoundaryPlan } from './createRuntimeUiBoundaryPlan.js';
import { createRuntimeUiDevOnlyExecutionPolicy } from './createRuntimeUiDevOnlyExecutionPolicy.js';
import { createVirtualFrameToUiPipelinePlan } from './createVirtualFrameToUiPipelinePlan.js';
import { createRuntimeUiRendererAdapterPlan } from './createRuntimeUiRendererAdapterPlan.js';
import { createRuntimeUiComponentAdapterPlan } from './createRuntimeUiComponentAdapterPlan.js';
import { createRuntimeUiInteractionAdapterPlan } from './createRuntimeUiInteractionAdapterPlan.js';
import { createRuntimeUiStateAdapterPlan } from './createRuntimeUiStateAdapterPlan.js';
import { createRuntimeUiThemeAdapterPlan } from './createRuntimeUiThemeAdapterPlan.js';
import { createRuntimeUiAccessibilityAdapterPlan } from './createRuntimeUiAccessibilityAdapterPlan.js';
import { createRuntimeUiBlockedActionEnforcementPlan } from './createRuntimeUiBlockedActionEnforcementPlan.js';
import { createRuntimeUiTestHarnessPlan } from './createRuntimeUiTestHarnessPlan.js';
import { createRuntimeUiManualEnablementGatePlan } from './createRuntimeUiManualEnablementGatePlan.js';
import { createRuntimeUiRolloutRollbackPlan } from './createRuntimeUiRolloutRollbackPlan.js';
import { createRuntimeUiObservabilityDiagnosticsPlan } from './createRuntimeUiObservabilityDiagnosticsPlan.js';
import { createRuntimeUiSafetyPlan } from './createRuntimeUiSafetyPlan.js';

/**
 * Builds the plan manifest with deterministic digests for every plan part. Pure — can build
 * standalone (parts recomputed) or from provided parts. Metadata only.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createRuntimeUiImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createRuntimeUiImplementationPlanSession({ runtimeUiContract: c });
  const phases = p.phases ?? createRuntimeUiImplementationPhases();
  const boundaryPlan = p.boundaryPlan ?? createRuntimeUiBoundaryPlan();
  const devOnlyPolicy = p.devOnlyPolicy ?? createRuntimeUiDevOnlyExecutionPolicy();
  const pipelinePlan = p.pipelinePlan ?? createVirtualFrameToUiPipelinePlan();
  const rendererAdapterPlan = p.rendererAdapterPlan ?? createRuntimeUiRendererAdapterPlan();
  const componentAdapterPlan = p.componentAdapterPlan ?? createRuntimeUiComponentAdapterPlan();
  const interactionAdapterPlan = p.interactionAdapterPlan ?? createRuntimeUiInteractionAdapterPlan();
  const stateAdapterPlan = p.stateAdapterPlan ?? createRuntimeUiStateAdapterPlan();
  const themeAdapterPlan = p.themeAdapterPlan ?? createRuntimeUiThemeAdapterPlan();
  const accessibilityAdapterPlan = p.accessibilityAdapterPlan ?? createRuntimeUiAccessibilityAdapterPlan();
  const blockedActionPlan = p.blockedActionPlan ?? createRuntimeUiBlockedActionEnforcementPlan();
  const testHarnessPlan = p.testHarnessPlan ?? createRuntimeUiTestHarnessPlan();
  const manualGatePlan = p.manualGatePlan ?? createRuntimeUiManualEnablementGatePlan();
  const rolloutRollbackPlan = p.rolloutRollbackPlan ?? createRuntimeUiRolloutRollbackPlan();
  const observabilityPlan = p.observabilityPlan ?? createRuntimeUiObservabilityDiagnosticsPlan();
  const safetyPlan = p.safetyPlan ?? createRuntimeUiSafetyPlan();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    phases: phases.phasesDigest,
    boundaryPlan: boundaryPlan.boundaryPlanDigest,
    devOnlyPolicy: devOnlyPolicy.devOnlyPolicyDigest,
    pipelinePlan: pipelinePlan.pipelinePlanDigest,
    rendererAdapterPlan: rendererAdapterPlan.rendererAdapterPlanDigest,
    componentAdapterPlan: componentAdapterPlan.componentAdapterPlanDigest,
    interactionAdapterPlan: interactionAdapterPlan.interactionAdapterPlanDigest,
    stateAdapterPlan: stateAdapterPlan.stateAdapterPlanDigest,
    themeAdapterPlan: themeAdapterPlan.themeAdapterPlanDigest,
    accessibilityAdapterPlan: accessibilityAdapterPlan.accessibilityAdapterPlanDigest,
    blockedActionPlan: blockedActionPlan.blockedActionPlanDigest,
    testHarnessPlan: testHarnessPlan.testHarnessPlanDigest,
    manualGatePlan: manualGatePlan.manualGatePlanDigest,
    rolloutRollbackPlan: rolloutRollbackPlan.rolloutRollbackPlanDigest,
    observabilityPlan: observabilityPlan.observabilityPlanDigest,
    safetyPlan: safetyPlan.safetyPlanDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'runtime-ui-implementation-plan-manifest',
    runtimeUiImplementationPlanName: RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
    runtimeUiImplementationPlanVersion: RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
    upstream: {
      runtimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
      isolatedRuntime: ISOLATED_RUNTIME_VERSION,
    },
    parts,
    capabilities: { ...RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: uiPlanDigest(core) });
}

export default createRuntimeUiImplementationPlanManifest;
