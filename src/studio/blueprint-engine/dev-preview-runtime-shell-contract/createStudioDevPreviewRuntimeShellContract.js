import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_SHELL_CONTRACT_NAME,
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_CONTRACT_MODE,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  shellDigest,
} from './devPreviewRuntimeShellContractConfig.js';
import { createDevPreviewRuntimeShellSession } from './createDevPreviewRuntimeShellSession.js';
import { createDevPreviewRuntimeShellLifecycleContract } from './createDevPreviewRuntimeShellLifecycleContract.js';
import { createDevPreviewRuntimeShellMountBoundary } from './createDevPreviewRuntimeShellMountBoundary.js';
import { createDevPreviewRuntimeShellEventContract } from './createDevPreviewRuntimeShellEventContract.js';
import { createDevPreviewRuntimeShellRenderRequestContract } from './createDevPreviewRuntimeShellRenderRequestContract.js';
import { createDevPreviewRuntimeShellStateBoundary } from './createDevPreviewRuntimeShellStateBoundary.js';
import { createDevPreviewRuntimeShellErrorBoundary } from './createDevPreviewRuntimeShellErrorBoundary.js';
import { createDevPreviewRuntimeShellPermissionBoundary } from './createDevPreviewRuntimeShellPermissionBoundary.js';
import { createDevPreviewRuntimeShellDataBoundary } from './createDevPreviewRuntimeShellDataBoundary.js';
import { createDevPreviewRuntimeShellIsolationContract } from './createDevPreviewRuntimeShellIsolationContract.js';
import { createDevPreviewRuntimeShellPolicyContract } from './createDevPreviewRuntimeShellPolicyContract.js';
import { createDevPreviewRuntimeShellRouteBlockedMetadata } from './createDevPreviewRuntimeShellRouteBlockedMetadata.js';
import { createDevPreviewRuntimeShellPlacementBlockedMetadata } from './createDevPreviewRuntimeShellPlacementBlockedMetadata.js';
import { createDevPreviewRuntimeShellSafetyMetadata } from './createDevPreviewRuntimeShellSafetyMetadata.js';
import { createDevPreviewRuntimeShellReadinessDecision } from './createDevPreviewRuntimeShellReadinessDecision.js';
import { createDevPreviewRuntimeShellManifest } from './createDevPreviewRuntimeShellManifest.js';
import { verifyDevPreviewRuntimeShellContract } from './verifyDevPreviewRuntimeShellContract.js';
import { checkDevPreviewRuntimeShellCompatibility } from './checkDevPreviewRuntimeShellCompatibility.js';
import { createDevPreviewRuntimeShellDiagnostics } from './createDevPreviewRuntimeShellDiagnostics.js';
import { createDevPreviewRuntimeShellFallback } from './createDevPreviewRuntimeShellFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW RUNTIME SHELL CONTRACT from a Dev Preview Visual
 * Contract. Pure, deterministic, HEADLESS and CONTRACT-ONLY. Given the same visual contract it
 * always returns the same object graph and digest.
 *
 * It renders NO UI, creates NO React component / `.jsx` / `.tsx` / DOM / runtime CSS, mounts
 * NOTHING, wires NO route / menu, generates NO module, writes NO file under `src/modules`, and
 * never touches backend / Prisma / migration / network / production / staging, never mutates,
 * never persists, never rewrites Empresas. On an invalid/missing visual contract it returns a
 * safe fallback and never throws. It authorizes NO runtime implementation — only a future,
 * separately-approved slice may.
 *
 * @param {Object} [options]
 * @param {Object} [options.visualContract] a dev preview visual contract
 * @returns {Object} the dev preview runtime shell contract
 */
export function createStudioDevPreviewRuntimeShellContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const visualContract = isGenericModelPlainObject(o.visualContract) ? o.visualContract : null;

  if (!visualContract || visualContract.kind !== 'studio-dev-preview-visual-contract' || visualContract.fallback === true) {
    return createDevPreviewRuntimeShellFallback({
      reason: visualContract ? 'invalid_or_fallback_visual_contract' : 'invalid_or_missing_visual_contract',
    });
  }

  const arg = { visualContract };

  const session = createDevPreviewRuntimeShellSession(arg);
  const lifecycle = createDevPreviewRuntimeShellLifecycleContract(arg);
  const mountBoundary = createDevPreviewRuntimeShellMountBoundary(arg);
  const eventContract = createDevPreviewRuntimeShellEventContract(arg);
  const renderRequest = createDevPreviewRuntimeShellRenderRequestContract(arg);
  const stateBoundary = createDevPreviewRuntimeShellStateBoundary(arg);
  const errorBoundary = createDevPreviewRuntimeShellErrorBoundary(arg);
  const permissionBoundary = createDevPreviewRuntimeShellPermissionBoundary(arg);
  const dataBoundary = createDevPreviewRuntimeShellDataBoundary(arg);
  const isolation = createDevPreviewRuntimeShellIsolationContract(arg);
  const policy = createDevPreviewRuntimeShellPolicyContract(arg);
  const routeBlocked = createDevPreviewRuntimeShellRouteBlockedMetadata(arg);
  const placementBlocked = createDevPreviewRuntimeShellPlacementBlockedMetadata(arg);
  const safety = createDevPreviewRuntimeShellSafetyMetadata(arg);

  const parts = {
    session, lifecycle, mountBoundary, eventContract, renderRequest, stateBoundary,
    errorBoundary, permissionBoundary, dataBoundary, isolation, policy, routeBlocked,
    placementBlocked, safety,
  };

  const compatibility = checkDevPreviewRuntimeShellCompatibility(arg);

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (renderRequest.renderAllowed === true) blockers.push('runtime_shell_render_allowed_unsafe');
  if (eventContract.anyRealHandler === true) blockers.push('runtime_shell_event_unsafe');
  if (dataBoundary.realDataRead === true || dataBoundary.realDataWrite === true) blockers.push('runtime_shell_data_boundary_unsafe');
  if (isolation.allInvariantsHold === false) blockers.push('runtime_shell_isolation_unsafe');
  if (safety.anySideEffect === true) blockers.push('runtime_shell_runtime_safety_unsafe');

  const readiness = createDevPreviewRuntimeShellReadinessDecision({ visualContract, blockers, warnings });
  const manifest = createDevPreviewRuntimeShellManifest({ visualContract, parts: { ...parts, readiness } });

  const core = {
    kind: 'studio-dev-preview-runtime-shell-contract',
    runtimeShellContractName: RUNTIME_SHELL_CONTRACT_NAME,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: RUNTIME_SHELL_CONTRACT_MODE,
    moduleId: String(visualContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    lifecycle,
    mountBoundary,
    eventContract,
    renderRequest,
    stateBoundary,
    errorBoundary,
    permissionBoundary,
    dataBoundary,
    isolation,
    policy,
    routeBlocked,
    placementBlocked,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForDevPreviewRuntimeShellContract: readiness.readyForDevPreviewRuntimeShellContract === true,
    readyForDevPreviewRuntimeImplementation: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...RUNTIME_SHELL_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: shellDigest(core) });

  const verification = verifyDevPreviewRuntimeShellContract({ contract });
  const diagnostics = createDevPreviewRuntimeShellDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    runtimeShellContractDigest: shellDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRuntimeShellContract;
