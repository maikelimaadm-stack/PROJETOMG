import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
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
import { createRuntimeUiImplementationReadinessDecision } from './createRuntimeUiImplementationReadinessDecision.js';
import { createRuntimeUiImplementationPlanManifest } from './createRuntimeUiImplementationPlanManifest.js';
import { verifyRuntimeUiImplementationPlan } from './verifyRuntimeUiImplementationPlan.js';
import { checkRuntimeUiImplementationPlanCompatibility } from './checkRuntimeUiImplementationPlanCompatibility.js';
import { createRuntimeUiImplementationPlanDiagnostics } from './createRuntimeUiImplementationPlanDiagnostics.js';
import { createRuntimeUiImplementationPlanFallback } from './createRuntimeUiImplementationPlanFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW RUNTIME UI IMPLEMENTATION PLAN from a Dev Preview Runtime
 * UI Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY and PLAN-ONLY. Given the same runtime
 * UI contract it always returns the same object graph and digest.
 *
 * It plans a future UI runtime implementation as pure metadata. It IMPLEMENTS NO UI. It creates
 * NO React component / `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / placement,
 * generates NO module, and never touches backend / Prisma / migration / network / production /
 * staging, never mutates, never persists, never reads/writes real data, never rewrites Empresas.
 * On an invalid/missing/fallback runtime UI contract it returns a safe fallback and never throws.
 * It authorizes NO UI runtime implementation and NO route/placement integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract] a dev preview runtime UI contract
 * @returns {Object} the runtime UI implementation plan
 */
export function createStudioDevPreviewRuntimeUiImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtimeUiContract = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : null;

  if (!runtimeUiContract
    || runtimeUiContract.kind !== 'studio-dev-preview-runtime-ui-contract'
    || runtimeUiContract.fallback === true) {
    return createRuntimeUiImplementationPlanFallback({
      reason: runtimeUiContract ? 'invalid_or_fallback_runtime_ui_contract' : 'invalid_or_missing_runtime_ui_contract',
    });
  }

  const session = createRuntimeUiImplementationPlanSession({ runtimeUiContract });
  const phases = createRuntimeUiImplementationPhases();
  const boundaryPlan = createRuntimeUiBoundaryPlan();
  const devOnlyPolicy = createRuntimeUiDevOnlyExecutionPolicy();
  const pipelinePlan = createVirtualFrameToUiPipelinePlan();
  const rendererAdapterPlan = createRuntimeUiRendererAdapterPlan();
  const componentAdapterPlan = createRuntimeUiComponentAdapterPlan();
  const interactionAdapterPlan = createRuntimeUiInteractionAdapterPlan();
  const stateAdapterPlan = createRuntimeUiStateAdapterPlan();
  const themeAdapterPlan = createRuntimeUiThemeAdapterPlan();
  const accessibilityAdapterPlan = createRuntimeUiAccessibilityAdapterPlan();
  const blockedActionPlan = createRuntimeUiBlockedActionEnforcementPlan();
  const testHarnessPlan = createRuntimeUiTestHarnessPlan();
  const manualGatePlan = createRuntimeUiManualEnablementGatePlan();
  const rolloutRollbackPlan = createRuntimeUiRolloutRollbackPlan();
  const observabilityPlan = createRuntimeUiObservabilityDiagnosticsPlan();
  const safetyPlan = createRuntimeUiSafetyPlan();

  const compatibility = checkRuntimeUiImplementationPlanCompatibility({ runtimeUiContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (pipelinePlan.realRenderAllowed === true) blockers.push('runtime_ui_plan_real_render_allowed_unsafe');
  if (componentAdapterPlan.componentAdapterImplemented === true) blockers.push('runtime_ui_plan_component_adapter_implemented_unsafe');
  if (interactionAdapterPlan.handlersCreated === true) blockers.push('runtime_ui_plan_handlers_created_unsafe');
  if (blockedActionPlan.anyAllowed === true) blockers.push('runtime_ui_plan_blocked_action_unsafe');
  if (safetyPlan.anyForbiddenSideEffect === true) blockers.push('runtime_ui_plan_safety_unsafe');
  if (manualGatePlan.manualGateRequired !== true) blockers.push('runtime_ui_plan_manual_gate_missing');

  const readiness = createRuntimeUiImplementationReadinessDecision({ blockers, warnings });

  const parts = {
    session, phases, boundaryPlan, devOnlyPolicy, pipelinePlan, rendererAdapterPlan,
    componentAdapterPlan, interactionAdapterPlan, stateAdapterPlan, themeAdapterPlan,
    accessibilityAdapterPlan, blockedActionPlan, testHarnessPlan, manualGatePlan,
    rolloutRollbackPlan, observabilityPlan, safetyPlan, readiness,
  };
  const manifest = createRuntimeUiImplementationPlanManifest({ runtimeUiContract, parts });

  const core = {
    kind: 'studio-dev-preview-runtime-ui-implementation-plan',
    runtimeUiImplementationPlanName: RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
    runtimeUiImplementationPlanVersion: RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
    moduleId: String(runtimeUiContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    phases,
    boundaryPlan,
    devOnlyPolicy,
    pipelinePlan,
    rendererAdapterPlan,
    componentAdapterPlan,
    interactionAdapterPlan,
    stateAdapterPlan,
    themeAdapterPlan,
    accessibilityAdapterPlan,
    blockedActionPlan,
    testHarnessPlan,
    manualGatePlan,
    rolloutRollbackPlan,
    observabilityPlan,
    safetyPlan,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForRuntimeUiImplementationPlan: readiness.readyForRuntimeUiImplementationPlan === true,
    readyForRuntimeUiImplementationSlice: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: uiPlanDigest(core) });

  const verification = verifyRuntimeUiImplementationPlan({ plan });
  const diagnostics = createRuntimeUiImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    runtimeUiImplementationPlanDigest: uiPlanDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRuntimeUiImplementationPlan;
