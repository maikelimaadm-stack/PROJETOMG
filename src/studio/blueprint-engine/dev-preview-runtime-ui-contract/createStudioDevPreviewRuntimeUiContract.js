import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_CONTRACT_NAME,
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_MODE,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  uiContractDigest,
} from './runtimeUiContractConfig.js';
import { createRuntimeUiContractSession } from './createRuntimeUiContractSession.js';
import { createRuntimeUiVirtualFrameMapping } from './createRuntimeUiVirtualFrameMapping.js';
import { createRuntimeUiNodeContract } from './createRuntimeUiNodeContract.js';
import { createRuntimeUiLayoutContract } from './createRuntimeUiLayoutContract.js';
import { createRuntimeUiComponentBindingContract } from './createRuntimeUiComponentBindingContract.js';
import { createRuntimeUiInteractionBindingContract } from './createRuntimeUiInteractionBindingContract.js';
import { createRuntimeUiRenderBoundaryContract } from './createRuntimeUiRenderBoundaryContract.js';
import { createRuntimeUiStateProjectionContract } from './createRuntimeUiStateProjectionContract.js';
import { createRuntimeUiAccessibilityProjectionContract } from './createRuntimeUiAccessibilityProjectionContract.js';
import { createRuntimeUiThemeProjectionContract } from './createRuntimeUiThemeProjectionContract.js';
import { createRuntimeUiBlockedActionContract } from './createRuntimeUiBlockedActionContract.js';
import { createRuntimeUiSafetyPolicy } from './createRuntimeUiSafetyPolicy.js';
import { createRuntimeUiReadinessDecision } from './createRuntimeUiReadinessDecision.js';
import { createRuntimeUiManifest } from './createRuntimeUiManifest.js';
import { verifyRuntimeUiContract } from './verifyRuntimeUiContract.js';
import { checkRuntimeUiContractCompatibility } from './checkRuntimeUiContractCompatibility.js';
import { createRuntimeUiDiagnostics } from './createRuntimeUiDiagnostics.js';
import { createRuntimeUiFallback } from './createRuntimeUiFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW RUNTIME UI CONTRACT from a Dev Preview Isolated Runtime.
 * Pure, deterministic, HEADLESS and CONTRACT-ONLY. Given the same isolated runtime it always
 * returns the same object graph and digest.
 *
 * It maps the isolated runtime's virtual preview frame into deterministic UI metadata contracts.
 * It creates NO React component / `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route /
 * menu, generates NO module, implements NO UI runtime, and never touches backend / Prisma /
 * migration / network / production / staging, never mutates, never persists, never reads/writes
 * real data, never rewrites Empresas. On an invalid/missing isolated runtime it returns a safe
 * fallback and never throws. It authorizes NO UI runtime implementation and NO route/menu
 * integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.isolatedRuntime] a dev preview isolated runtime
 * @returns {Object} the runtime UI contract
 */
export function createStudioDevPreviewRuntimeUiContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const isolatedRuntime = isGenericModelPlainObject(o.isolatedRuntime) ? o.isolatedRuntime : null;

  if (!isolatedRuntime || isolatedRuntime.kind !== 'studio-dev-preview-isolated-runtime' || isolatedRuntime.fallback === true) {
    return createRuntimeUiFallback({
      reason: isolatedRuntime ? 'invalid_or_fallback_isolated_runtime' : 'invalid_or_missing_isolated_runtime',
    });
  }

  const session = createRuntimeUiContractSession({ isolatedRuntime });
  const frameMapping = createRuntimeUiVirtualFrameMapping({ isolatedRuntime });
  const arg = { isolatedRuntime, frameMapping };

  const nodeContract = createRuntimeUiNodeContract(arg);
  const layoutContract = createRuntimeUiLayoutContract(arg);
  const componentBinding = createRuntimeUiComponentBindingContract(arg);
  const interactionBinding = createRuntimeUiInteractionBindingContract(arg);
  const renderBoundary = createRuntimeUiRenderBoundaryContract(arg);
  const stateProjection = createRuntimeUiStateProjectionContract(arg);
  const accessibilityProjection = createRuntimeUiAccessibilityProjectionContract(arg);
  const themeProjection = createRuntimeUiThemeProjectionContract(arg);
  const blockedAction = createRuntimeUiBlockedActionContract(arg);
  const safetyPolicy = createRuntimeUiSafetyPolicy(arg);

  const compatibility = checkRuntimeUiContractCompatibility({ isolatedRuntime });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (renderBoundary.renderAllowed === true) blockers.push('runtime_ui_contract_render_allowed_unsafe');
  if (componentBinding.anyBindingAllowed === true) blockers.push('runtime_ui_contract_binding_allowed_unsafe');
  if (interactionBinding.anyHandlerCreated === true) blockers.push('runtime_ui_contract_handler_created_unsafe');
  if (blockedAction.anyAllowed === true) blockers.push('runtime_ui_contract_blocked_action_unsafe');
  if (safetyPolicy.anyForbiddenSideEffect === true) blockers.push('runtime_ui_contract_safety_unsafe');
  if (nodeContract.reactElement === true || nodeContract.domNode === true) blockers.push('runtime_ui_contract_node_unsafe');

  const readiness = createRuntimeUiReadinessDecision({ frameMapping, blockers, warnings });

  const parts = {
    session, frameMapping, nodeContract, layoutContract, componentBinding, interactionBinding,
    renderBoundary, stateProjection, accessibilityProjection, themeProjection, blockedAction,
    safetyPolicy, readiness,
  };
  const manifest = createRuntimeUiManifest({ isolatedRuntime, parts });

  const core = {
    kind: 'studio-dev-preview-runtime-ui-contract',
    runtimeUiContractName: RUNTIME_UI_CONTRACT_NAME,
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
    mode: RUNTIME_UI_CONTRACT_MODE,
    moduleId: String(isolatedRuntime.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    frameMapping,
    nodeContract,
    layoutContract,
    componentBinding,
    interactionBinding,
    renderBoundary,
    stateProjection,
    accessibilityProjection,
    themeProjection,
    blockedAction,
    safetyPolicy,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForRuntimeUiContract: readiness.readyForRuntimeUiContract === true,
    readyForRuntimeUiImplementation: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...RUNTIME_UI_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: uiContractDigest(core) });

  const verification = verifyRuntimeUiContract({ contract });
  const diagnostics = createRuntimeUiDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    runtimeUiContractDigest: uiContractDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRuntimeUiContract;
