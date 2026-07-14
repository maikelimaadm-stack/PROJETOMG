import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  VISUAL_CONTRACT_NAME,
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_MODE,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  visualDigest,
} from './devPreviewVisualContractConfig.js';

/**
 * Builds the dev preview visual contract MANIFEST — a self-describing, deterministic summary
 * of the produced parts plus the headless capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} visual contract manifest
 */
export function createDevPreviewVisualContractManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'dev-preview-visual-contract-manifest',
    visualContractName: VISUAL_CONTRACT_NAME,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    mode: VISUAL_CONTRACT_MODE,
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    upstream: {
      bridgeContract: DEV_PREVIEW_BRIDGE_VERSION,
      sandboxContract: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
      engineContract: STUDIO_BLUEPRINT_ENGINE_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      visualTree: digestOf(parts.visualTree, 'visualTreeDigest'),
      visualScreen: digestOf(parts.visualScreen, 'visualScreenDigest'),
      visualSection: digestOf(parts.visualSection, 'visualSectionDigest'),
      placeholderRegistry: digestOf(parts.placeholderRegistry, 'placeholderRegistryDigest'),
      visualState: digestOf(parts.visualState, 'visualStateDigest'),
      visualInteraction: digestOf(parts.visualInteraction, 'visualInteractionDigest'),
      visualThemeToken: digestOf(parts.visualThemeToken, 'visualThemeTokenDigest'),
      visualValidation: digestOf(parts.visualValidation, 'visualValidationDigest'),
      visualAccessibility: digestOf(parts.visualAccessibility, 'visualAccessibilityDigest'),
      routePlan: digestOf(parts.routePlan, 'routePlanDigest'),
      placementPlan: digestOf(parts.placementPlan, 'placementPlanDigest'),
      runtimeSafety: digestOf(parts.runtimeSafety, 'runtimeSafetyDigest'),
      readiness: digestOf(parts.readiness, 'readinessDigest'),
    },
    capabilities: { ...VISUAL_CONTRACT_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: visualDigest(core) });
}

export default createDevPreviewVisualContractManifest;
