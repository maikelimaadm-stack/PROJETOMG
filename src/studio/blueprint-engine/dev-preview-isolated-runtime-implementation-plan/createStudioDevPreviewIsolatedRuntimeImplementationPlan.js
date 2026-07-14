import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  IMPLEMENTATION_PLAN_NAME,
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_MODE,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  planDigest,
} from './isolatedRuntimeImplementationPlanConfig.js';
import { createIsolatedRuntimeImplementationPlanSession } from './createIsolatedRuntimeImplementationPlanSession.js';
import { createIsolatedRuntimeImplementationPhases } from './createIsolatedRuntimeImplementationPhases.js';
import { createIsolatedRuntimeBoundaryPlan } from './createIsolatedRuntimeBoundaryPlan.js';
import { createIsolatedRuntimeDevOnlyExecutionPolicy } from './createIsolatedRuntimeDevOnlyExecutionPolicy.js';
import { createIsolatedRuntimeAdapterPlan } from './createIsolatedRuntimeAdapterPlan.js';
import { createIsolatedRuntimeRenderPipelinePlan } from './createIsolatedRuntimeRenderPipelinePlan.js';
import { createIsolatedRuntimeLifecycleExecutionPlan } from './createIsolatedRuntimeLifecycleExecutionPlan.js';
import { createIsolatedRuntimeEventHandlingPlan } from './createIsolatedRuntimeEventHandlingPlan.js';
import { createIsolatedRuntimeDataAccessBlockedPlan } from './createIsolatedRuntimeDataAccessBlockedPlan.js';
import { createIsolatedRuntimePermissionEnforcementPlan } from './createIsolatedRuntimePermissionEnforcementPlan.js';
import { createIsolatedRuntimeTestHarnessPlan } from './createIsolatedRuntimeTestHarnessPlan.js';
import { createIsolatedRuntimeRolloutRollbackPlan } from './createIsolatedRuntimeRolloutRollbackPlan.js';
import { createIsolatedRuntimeObservabilityDiagnosticsPlan } from './createIsolatedRuntimeObservabilityDiagnosticsPlan.js';
import { createIsolatedRuntimeRouteBlockedPlan } from './createIsolatedRuntimeRouteBlockedPlan.js';
import { createIsolatedRuntimePlacementBlockedPlan } from './createIsolatedRuntimePlacementBlockedPlan.js';
import { createIsolatedRuntimeSafetyPlan } from './createIsolatedRuntimeSafetyPlan.js';
import { createIsolatedRuntimeReadinessDecision } from './createIsolatedRuntimeReadinessDecision.js';
import { createIsolatedRuntimeImplementationPlanManifest } from './createIsolatedRuntimeImplementationPlanManifest.js';
import { verifyIsolatedRuntimeImplementationPlan } from './verifyIsolatedRuntimeImplementationPlan.js';
import { checkIsolatedRuntimeImplementationPlanCompatibility } from './checkIsolatedRuntimeImplementationPlanCompatibility.js';
import { createIsolatedRuntimeImplementationPlanDiagnostics } from './createIsolatedRuntimeImplementationPlanDiagnostics.js';
import { createIsolatedRuntimeImplementationPlanFallback } from './createIsolatedRuntimeImplementationPlanFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW ISOLATED RUNTIME IMPLEMENTATION PLAN from a Dev Preview
 * Runtime Shell Contract. Pure, deterministic, HEADLESS and CONTRACT-ONLY. Given the same shell
 * contract it always returns the same object graph and digest.
 *
 * Despite the name, it implements NO runtime. It renders NO UI, creates NO React component /
 * `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / menu, generates NO module,
 * writes NO file under `src/modules`, and never touches backend / Prisma / migration / network /
 * production / staging, never mutates, never persists, never rewrites Empresas. On an
 * invalid/missing shell contract it returns a safe fallback and never throws. It authorizes NO
 * runtime implementation — only a future, separately-approved slice may.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeShellContract] a dev preview runtime shell contract
 * @returns {Object} the isolated runtime implementation plan
 */
export function createStudioDevPreviewIsolatedRuntimeImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtimeShellContract = isGenericModelPlainObject(o.runtimeShellContract) ? o.runtimeShellContract : null;

  if (!runtimeShellContract || runtimeShellContract.kind !== 'studio-dev-preview-runtime-shell-contract' || runtimeShellContract.fallback === true) {
    return createIsolatedRuntimeImplementationPlanFallback({
      reason: runtimeShellContract ? 'invalid_or_fallback_runtime_shell_contract' : 'invalid_or_missing_runtime_shell_contract',
    });
  }

  const arg = { runtimeShellContract };

  const session = createIsolatedRuntimeImplementationPlanSession(arg);
  const phases = createIsolatedRuntimeImplementationPhases(arg);
  const boundaryPlan = createIsolatedRuntimeBoundaryPlan(arg);
  const executionPolicy = createIsolatedRuntimeDevOnlyExecutionPolicy(arg);
  const adapterPlan = createIsolatedRuntimeAdapterPlan(arg);
  const renderPipeline = createIsolatedRuntimeRenderPipelinePlan(arg);
  const lifecycleExecution = createIsolatedRuntimeLifecycleExecutionPlan(arg);
  const eventHandling = createIsolatedRuntimeEventHandlingPlan(arg);
  const dataAccessBlocked = createIsolatedRuntimeDataAccessBlockedPlan(arg);
  const permissionEnforcement = createIsolatedRuntimePermissionEnforcementPlan(arg);
  const testHarness = createIsolatedRuntimeTestHarnessPlan(arg);
  const rolloutRollback = createIsolatedRuntimeRolloutRollbackPlan(arg);
  const observabilityDiagnostics = createIsolatedRuntimeObservabilityDiagnosticsPlan(arg);
  const routeBlocked = createIsolatedRuntimeRouteBlockedPlan(arg);
  const placementBlocked = createIsolatedRuntimePlacementBlockedPlan(arg);
  const safetyPlan = createIsolatedRuntimeSafetyPlan(arg);

  const parts = {
    session, phases, boundaryPlan, executionPolicy, adapterPlan, renderPipeline,
    lifecycleExecution, eventHandling, dataAccessBlocked, permissionEnforcement, testHarness,
    rolloutRollback, observabilityDiagnostics, routeBlocked, placementBlocked, safetyPlan,
  };

  const compatibility = checkIsolatedRuntimeImplementationPlanCompatibility(arg);

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (phases.anyImplemented === true) blockers.push('implementation_plan_phase_implemented');
  if (renderPipeline.renderAllowed === true) blockers.push('implementation_plan_render_allowed_unsafe');
  if (rolloutRollback.rolloutAllowed === true) blockers.push('implementation_plan_rollout_allowed_unsafe');
  if (rolloutRollback.manualEnablementRequired === false) blockers.push('implementation_plan_missing_manual_gate');
  if (boundaryPlan.allInvariantsHold === false) blockers.push('implementation_plan_isolation_unsafe');
  if (dataAccessBlocked.realDataRead === true || dataAccessBlocked.realDataWrite === true) blockers.push('implementation_plan_data_access_unsafe');
  if (safetyPlan.anySideEffect === true) blockers.push('implementation_plan_safety_unsafe');

  const readiness = createIsolatedRuntimeReadinessDecision({ runtimeShellContract, blockers, warnings });
  const manifest = createIsolatedRuntimeImplementationPlanManifest({ runtimeShellContract, parts: { ...parts, readiness } });

  const core = {
    kind: 'studio-dev-preview-isolated-runtime-implementation-plan',
    implementationPlanName: IMPLEMENTATION_PLAN_NAME,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: IMPLEMENTATION_PLAN_MODE,
    moduleId: String(runtimeShellContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    phases,
    boundaryPlan,
    executionPolicy,
    adapterPlan,
    renderPipeline,
    lifecycleExecution,
    eventHandling,
    dataAccessBlocked,
    permissionEnforcement,
    testHarness,
    rolloutRollback,
    observabilityDiagnostics,
    routeBlocked,
    placementBlocked,
    safetyPlan,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForIsolatedRuntimeImplementationPlan: readiness.readyForIsolatedRuntimeImplementationPlan === true,
    readyForIsolatedRuntimeImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: planDigest(core) });

  const verification = verifyIsolatedRuntimeImplementationPlan({ plan });
  const diagnostics = createIsolatedRuntimeImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    implementationPlanDigest: planDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewIsolatedRuntimeImplementationPlan;
