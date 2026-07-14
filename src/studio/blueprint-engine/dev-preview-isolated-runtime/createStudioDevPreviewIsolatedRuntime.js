import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ISOLATED_RUNTIME_NAME,
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_MODE,
  ISOLATED_RUNTIME_CAPABILITIES,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  runtimeDigest,
} from './isolatedRuntimeConfig.js';
import { createIsolatedRuntimeSession } from './createIsolatedRuntimeSession.js';
import { createIsolatedRuntimePreflight } from './createIsolatedRuntimePreflight.js';
import { createIsolatedRuntimeContractLoader } from './createIsolatedRuntimeContractLoader.js';
import { createIsolatedRuntimeSyntheticDataProvider } from './createIsolatedRuntimeSyntheticDataProvider.js';
import { createIsolatedRuntimePlaceholderResolver } from './createIsolatedRuntimePlaceholderResolver.js';
import { createIsolatedRuntimeVirtualFrame } from './createIsolatedRuntimeVirtualFrame.js';
import { createIsolatedRuntimeLifecycleExecutor } from './createIsolatedRuntimeLifecycleExecutor.js';
import { createIsolatedRuntimeEventDispatcher } from './createIsolatedRuntimeEventDispatcher.js';
import { createIsolatedRuntimeRenderRequestExecutor } from './createIsolatedRuntimeRenderRequestExecutor.js';
import { createIsolatedRuntimeStateContainer } from './createIsolatedRuntimeStateContainer.js';
import { createIsolatedRuntimePermissionEnforcer } from './createIsolatedRuntimePermissionEnforcer.js';
import { createIsolatedRuntimeDataBoundary } from './createIsolatedRuntimeDataBoundary.js';
import { createIsolatedRuntimeIsolationBoundary } from './createIsolatedRuntimeIsolationBoundary.js';
import { createIsolatedRuntimeManualGate } from './createIsolatedRuntimeManualGate.js';
import { createIsolatedRuntimeSafetyPolicy } from './createIsolatedRuntimeSafetyPolicy.js';
import { createIsolatedRuntimeManifest } from './createIsolatedRuntimeManifest.js';
import { verifyIsolatedRuntime } from './verifyIsolatedRuntime.js';
import { checkIsolatedRuntimeCompatibility } from './checkIsolatedRuntimeCompatibility.js';
import { createIsolatedRuntimeDiagnostics } from './createIsolatedRuntimeDiagnostics.js';
import { createIsolatedRuntimeFallback } from './createIsolatedRuntimeFallback.js';

/**
 * Composes and RUNS the STUDIO DEV PREVIEW ISOLATED RUNTIME from an Isolated Runtime
 * Implementation Plan. Pure, deterministic, DEV-ONLY, HEADLESS, ISOLATED. Given the same plan it
 * always returns the same object graph and digest.
 *
 * It implements the dev-only isolated runtime (`isolatedRuntimeImplemented: true`) but renders NO
 * UI: it produces a deterministic virtual preview frame from synthetic data. It creates NO React
 * component / `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / menu, generates NO
 * module, and never touches backend / Prisma / migration / network / production / staging, never
 * mutates, never persists, never reads/writes real data, never rewrites Empresas. On an
 * invalid/missing plan or a failed preflight it returns a safe fallback and never throws. It
 * authorizes NO UI runtime and NO route/menu integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan] an isolated runtime implementation plan
 * @returns {Object} the isolated runtime result
 */
export function createStudioDevPreviewIsolatedRuntime(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const implementationPlan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : null;

  if (!implementationPlan || implementationPlan.kind !== 'studio-dev-preview-isolated-runtime-implementation-plan' || implementationPlan.fallback === true) {
    return createIsolatedRuntimeFallback({
      reason: implementationPlan ? 'invalid_or_fallback_implementation_plan' : 'invalid_or_missing_implementation_plan',
    });
  }

  const arg = { implementationPlan };

  const preflight = createIsolatedRuntimePreflight(arg);
  if (preflight.ok !== true) {
    return createIsolatedRuntimeFallback({ reason: 'preflight_failed' });
  }

  const session = createIsolatedRuntimeSession(arg);
  const contractLoader = createIsolatedRuntimeContractLoader(arg);
  const syntheticData = createIsolatedRuntimeSyntheticDataProvider(arg);
  const placeholderResolver = createIsolatedRuntimePlaceholderResolver(arg);
  const virtualFrame = createIsolatedRuntimeVirtualFrame({ implementationPlan, syntheticData, placeholders: placeholderResolver });
  const lifecycle = createIsolatedRuntimeLifecycleExecutor(arg);
  const eventDispatcher = createIsolatedRuntimeEventDispatcher(arg);
  const renderRequest = createIsolatedRuntimeRenderRequestExecutor({ implementationPlan, virtualFrame });
  const stateContainer = createIsolatedRuntimeStateContainer({ implementationPlan, virtualFrame, step: 'framePrepared' });
  const permissionEnforcer = createIsolatedRuntimePermissionEnforcer(arg);
  const dataBoundary = createIsolatedRuntimeDataBoundary(arg);
  const isolationBoundary = createIsolatedRuntimeIsolationBoundary(arg);
  const manualGate = createIsolatedRuntimeManualGate(arg);
  const safetyPolicy = createIsolatedRuntimeSafetyPolicy(arg);

  const parts = {
    session, preflight, contractLoader, syntheticData, virtualFrame, placeholderResolver,
    lifecycle, eventDispatcher, renderRequest, stateContainer, permissionEnforcer, dataBoundary,
    isolationBoundary, manualGate, safetyPolicy,
  };

  const compatibility = checkIsolatedRuntimeCompatibility(arg);

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (renderRequest.renderAllowed === true) blockers.push('isolated_runtime_render_allowed_unsafe');
  if (dataBoundary.realDataRead === true || dataBoundary.realDataWrite === true) blockers.push('isolated_runtime_data_boundary_unsafe');
  if (isolationBoundary.allInvariantsHold === false) blockers.push('isolated_runtime_isolation_unsafe');
  if (manualGate.approvedForDevOnlyIsolatedRuntime !== true) blockers.push('isolated_runtime_manual_gate_missing');
  if (safetyPolicy.anyForbiddenSideEffect === true) blockers.push('isolated_runtime_safety_unsafe');
  if (placeholderResolver.anyRealComponent === true) blockers.push('isolated_runtime_placeholder_unsafe');

  const ok = blockers.length === 0;

  const core = {
    kind: 'studio-dev-preview-isolated-runtime',
    isolatedRuntimeName: ISOLATED_RUNTIME_NAME,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: ISOLATED_RUNTIME_MODE,
    moduleId: String(implementationPlan.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    preflight,
    contractLoader,
    syntheticData,
    virtualFrame,
    placeholderResolver,
    lifecycle,
    eventDispatcher,
    renderRequest,
    stateContainer,
    permissionEnforcer,
    dataBoundary,
    isolationBoundary,
    manualGate,
    safetyPolicy,
    compatibility,
    readiness: ok ? 'studio_dev_preview_isolated_runtime_ready' : 'blocked',
    readyForIsolatedRuntime: ok,
    readyForDevPreviewRuntimeUI: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...ISOLATED_RUNTIME_CAPABILITIES },
    metadataOnly: true,
  };

  const runtime = safeCloneGenericModel({ ...core, overallDigest: runtimeDigest(core) });

  const manifest = createIsolatedRuntimeManifest({ implementationPlan, parts });
  const verification = verifyIsolatedRuntime({ runtime });
  const diagnostics = createIsolatedRuntimeDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...runtime,
    manifest,
    verification,
    diagnostics,
    isolatedRuntimeDigest: runtimeDigest({ overallDigest: runtime.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewIsolatedRuntime;
