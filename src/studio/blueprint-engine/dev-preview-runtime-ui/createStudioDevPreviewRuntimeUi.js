import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_NAME,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_MODE,
  RUNTIME_UI_CAPABILITIES,
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
  runtimeUiDigest,
} from './runtimeUiConfig.js';
import { createRuntimeUiSession } from './createRuntimeUiSession.js';
import { createRuntimeUiPreflight } from './createRuntimeUiPreflight.js';
import { createRuntimeUiContractLoader } from './createRuntimeUiContractLoader.js';
import { createRuntimeUiVirtualFrameInput } from './createRuntimeUiVirtualFrameInput.js';
import { createRuntimeUiDevFlagGate } from './createRuntimeUiDevFlagGate.js';
import { createRuntimeUiIsolationBoundary } from './createRuntimeUiIsolationBoundary.js';
import { createRuntimeUiComponentRegistry } from './createRuntimeUiComponentRegistry.js';
import { createRuntimeUiInteractionRegistry } from './createRuntimeUiInteractionRegistry.js';
import { createRuntimeUiStateProjection } from './createRuntimeUiStateProjection.js';
import { createRuntimeUiAccessibilityProjection } from './createRuntimeUiAccessibilityProjection.js';
import { createRuntimeUiThemeProjection } from './createRuntimeUiThemeProjection.js';
import { createRuntimeUiBlockedActionModel } from './createRuntimeUiBlockedActionModel.js';
import { createRuntimeUiReactTree } from './createRuntimeUiReactTree.js';
import { createRuntimeUiManifest } from './createRuntimeUiManifest.js';
import { verifyRuntimeUi } from './verifyRuntimeUi.js';
import { checkRuntimeUiCompatibility } from './checkRuntimeUiCompatibility.js';
import { createRuntimeUiDiagnostics } from './createRuntimeUiDiagnostics.js';
import { createRuntimeUiFallback } from './createRuntimeUiFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW RUNTIME UI from a Dev Preview Runtime UI Contract. Deterministic
 * and DEV-ONLY / ISOLATED. It produces the metadata contract of the isolated React/JSX UI (real
 * renderable components live in the sibling `.jsx` files, referenced by name — never imported into
 * this pure graph, never mounted to a real DOM). It creates NO App / route / menu / module wiring,
 * uses NO ReactDOM / createRoot / window / document, and never touches backend / Prisma /
 * migration / network / production / staging, never mutates, never persists, never reads/writes
 * real data, never rewrites Empresas, and NEVER imports the old Studio prototype. On an
 * invalid/missing/fallback runtime UI contract, or a failed preflight, it returns a safe fallback
 * and never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract] a dev preview runtime UI contract
 * @param {Object} [options.implementationPlan] optional runtime UI implementation plan (manual gate)
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function createStudioDevPreviewRuntimeUi(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtimeUiContract = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : null;
  const implementationPlan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : null;
  const env = isGenericModelPlainObject(o.env) ? o.env : {};

  if (!runtimeUiContract
    || runtimeUiContract.kind !== 'studio-dev-preview-runtime-ui-contract'
    || runtimeUiContract.fallback === true) {
    return createRuntimeUiFallback({
      reason: runtimeUiContract ? 'invalid_or_fallback_runtime_ui_contract' : 'invalid_or_missing_runtime_ui_contract',
    });
  }

  const preflight = createRuntimeUiPreflight({ runtimeUiContract, implementationPlan, env });
  if (preflight.ok !== true) {
    return createRuntimeUiFallback({ reason: `preflight_failed:${preflight.blockers[0] ?? 'unknown'}` });
  }

  const session = createRuntimeUiSession({ runtimeUiContract });
  const contractLoader = createRuntimeUiContractLoader({ runtimeUiContract });
  const virtualFrameInput = createRuntimeUiVirtualFrameInput({ runtimeUiContract });
  const devFlagGate = createRuntimeUiDevFlagGate({ env });
  const isolationBoundary = createRuntimeUiIsolationBoundary();
  const componentRegistry = createRuntimeUiComponentRegistry();
  const interactionRegistry = createRuntimeUiInteractionRegistry();
  const stateProjection = createRuntimeUiStateProjection();
  const accessibilityProjection = createRuntimeUiAccessibilityProjection();
  const themeProjection = createRuntimeUiThemeProjection();
  const blockedActionModel = createRuntimeUiBlockedActionModel();
  const reactTree = createRuntimeUiReactTree({ runtimeUiContract });

  const compatibility = checkRuntimeUiCompatibility({ runtimeUiContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (isolationBoundary.oldPrototypeImported === true) blockers.push('runtime_ui_old_prototype_import_unsafe');
  if (isolationBoundary.appWired === true) blockers.push('runtime_ui_app_wired_unsafe');
  if (isolationBoundary.reactDomUsed === true || isolationBoundary.createRootUsed === true) blockers.push('runtime_ui_real_dom_mount_unsafe');
  if (interactionRegistry.anyRealHandler === true) blockers.push('runtime_ui_real_handler_unsafe');
  if (blockedActionModel.anyAllowed === true) blockers.push('runtime_ui_blocked_action_unsafe');
  if (reactTree.mountedToRealDom === true || reactTree.tsxCreated === true) blockers.push('runtime_ui_react_tree_unsafe');

  const parts = {
    session, preflight, contractLoader, virtualFrameInput, componentRegistry, interactionRegistry,
    stateProjection, accessibilityProjection, themeProjection, blockedActionModel, reactTree,
    isolationBoundary, devFlagGate,
  };
  const manifest = createRuntimeUiManifest({ runtimeUiContract, parts });

  const ready = blockers.length === 0;
  const core = {
    kind: 'studio-dev-preview-runtime-ui',
    runtimeUiName: RUNTIME_UI_NAME,
    runtimeUiVersion: RUNTIME_UI_VERSION,
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
    mode: RUNTIME_UI_MODE,
    moduleId: String(runtimeUiContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    preflight,
    contractLoader,
    virtualFrameInput,
    componentRegistry,
    interactionRegistry,
    stateProjection,
    accessibilityProjection,
    themeProjection,
    blockedActionModel,
    reactTree,
    isolationBoundary,
    devFlagGate,
    compatibility,
    manifest,
    readiness: ready ? 'studio_dev_preview_runtime_ui_ready' : 'blocked',
    readyForRuntimeUi: ready,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockedActionsOnly: true,
    capabilities: { ...RUNTIME_UI_CAPABILITIES },
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: runtimeUiDigest(core) });

  const verification = verifyRuntimeUi({ contract });
  const diagnostics = createRuntimeUiDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    runtimeUiDigest: runtimeUiDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRuntimeUi;
