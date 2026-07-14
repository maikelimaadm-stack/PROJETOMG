import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  VISUAL_CONTRACT_NAME,
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_MODE,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  visualDigest,
} from './devPreviewVisualContractConfig.js';
import { createDevPreviewVisualContractSession } from './createDevPreviewVisualContractSession.js';
import { createDevPreviewVisualTreeContract } from './createDevPreviewVisualTreeContract.js';
import { createDevPreviewVisualScreenContract } from './createDevPreviewVisualScreenContract.js';
import { createDevPreviewVisualSectionContract } from './createDevPreviewVisualSectionContract.js';
import { createDevPreviewVisualComponentPlaceholderRegistry } from './createDevPreviewVisualComponentPlaceholderRegistry.js';
import { createDevPreviewVisualStateContract } from './createDevPreviewVisualStateContract.js';
import { createDevPreviewVisualInteractionContract } from './createDevPreviewVisualInteractionContract.js';
import { createDevPreviewVisualThemeTokenContract } from './createDevPreviewVisualThemeTokenContract.js';
import { createDevPreviewVisualValidationContract } from './createDevPreviewVisualValidationContract.js';
import { createDevPreviewVisualAccessibilityContract } from './createDevPreviewVisualAccessibilityContract.js';
import { createDevPreviewVisualRoutePlanMetadata } from './createDevPreviewVisualRoutePlanMetadata.js';
import { createDevPreviewVisualPlacementPlanMetadata } from './createDevPreviewVisualPlacementPlanMetadata.js';
import { createDevPreviewVisualRuntimeSafetyMetadata } from './createDevPreviewVisualRuntimeSafetyMetadata.js';
import { createDevPreviewVisualReadinessDecision } from './createDevPreviewVisualReadinessDecision.js';
import { createDevPreviewVisualContractManifest } from './createDevPreviewVisualContractManifest.js';
import { verifyDevPreviewVisualContract } from './verifyDevPreviewVisualContract.js';
import { checkDevPreviewVisualContractCompatibility } from './checkDevPreviewVisualContractCompatibility.js';
import { createDevPreviewVisualContractDiagnostics } from './createDevPreviewVisualContractDiagnostics.js';
import { createDevPreviewVisualContractFallback } from './createDevPreviewVisualContractFallback.js';

/**
 * Composes the full STUDIO DEV PREVIEW VISUAL CONTRACT from a Dev Preview Contract Bridge.
 * Pure, deterministic, HEADLESS and CONTRACT-ONLY. Given the same bridge it always returns the
 * same object graph and digest.
 *
 * It renders NO UI, creates NO React component / `.jsx` / `.tsx` / DOM / runtime CSS, wires NO
 * route / menu, generates NO module, writes NO file under `src/modules`, and never touches
 * backend / Prisma / migration / network / production / staging, never mutates, never persists,
 * never rewrites Empresas. On an invalid/missing bridge it returns a safe fallback and never
 * throws. It authorizes NO visual runtime — only a future, separately-approved slice may.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} the dev preview visual contract
 */
export function createStudioDevPreviewVisualContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : null;

  if (!bridge || bridge.kind !== 'studio-dev-preview-contract-bridge' || bridge.fallback === true) {
    return createDevPreviewVisualContractFallback({
      reason: bridge ? 'invalid_or_fallback_bridge' : 'invalid_or_missing_bridge',
    });
  }

  const arg = { bridge };

  const session = createDevPreviewVisualContractSession(arg);
  const visualTree = createDevPreviewVisualTreeContract(arg);
  const visualScreen = createDevPreviewVisualScreenContract(arg);
  const visualSection = createDevPreviewVisualSectionContract(arg);
  const placeholderRegistry = createDevPreviewVisualComponentPlaceholderRegistry(arg);
  const visualState = createDevPreviewVisualStateContract(arg);
  const visualInteraction = createDevPreviewVisualInteractionContract(arg);
  const visualThemeToken = createDevPreviewVisualThemeTokenContract(arg);
  const visualValidation = createDevPreviewVisualValidationContract(arg);
  const visualAccessibility = createDevPreviewVisualAccessibilityContract(arg);
  const routePlan = createDevPreviewVisualRoutePlanMetadata(arg);
  const placementPlan = createDevPreviewVisualPlacementPlanMetadata(arg);
  const runtimeSafety = createDevPreviewVisualRuntimeSafetyMetadata(arg);

  const parts = {
    session, visualTree, visualScreen, visualSection, placeholderRegistry, visualState,
    visualInteraction, visualThemeToken, visualValidation, visualAccessibility, routePlan,
    placementPlan, runtimeSafety,
  };

  const compatibility = checkDevPreviewVisualContractCompatibility(arg);

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (visualTree.allPlaceholdersAllowed === false) blockers.push('visual_contract_placeholder_unknown');
  if (visualInteraction.anyMutationEnabled === true) blockers.push('visual_contract_interaction_unsafe');
  if (runtimeSafety.anySideEffect === true) blockers.push('visual_contract_runtime_safety_unsafe');

  const readiness = createDevPreviewVisualReadinessDecision({ bridge, blockers, warnings });
  const manifest = createDevPreviewVisualContractManifest({ bridge, parts: { ...parts, readiness } });

  const core = {
    kind: 'studio-dev-preview-visual-contract',
    visualContractName: VISUAL_CONTRACT_NAME,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: VISUAL_CONTRACT_MODE,
    moduleId: String(bridge.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    visualTree,
    visualScreen,
    visualSection,
    placeholderRegistry,
    visualState,
    visualInteraction,
    visualThemeToken,
    visualValidation,
    visualAccessibility,
    routePlan,
    placementPlan,
    runtimeSafety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForDevPreviewVisualContract: readiness.readyForDevPreviewVisualContract === true,
    readyForDevPreviewVisualRuntime: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...VISUAL_CONTRACT_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };

  const contract = safeCloneGenericModel({ ...core, overallDigest: visualDigest(core) });

  const verification = verifyDevPreviewVisualContract({ contract });
  const diagnostics = createDevPreviewVisualContractDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...contract,
    verification,
    diagnostics,
    visualContractDigest: visualDigest({ overallDigest: contract.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewVisualContract;
