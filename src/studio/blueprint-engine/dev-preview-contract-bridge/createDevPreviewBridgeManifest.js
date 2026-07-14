import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  DEV_PREVIEW_BRIDGE_NAME,
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_MODE,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  bridgeDigest,
} from './devPreviewBridgeConfig.js';

/**
 * Builds the dev preview contract bridge MANIFEST — a self-describing, deterministic
 * summary of the produced schemas plus the headless capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} bridge manifest
 */
export function createDevPreviewBridgeManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'dev-preview-bridge-manifest',
    bridgeName: DEV_PREVIEW_BRIDGE_NAME,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    mode: DEV_PREVIEW_BRIDGE_MODE,
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    upstream: {
      sandboxContract: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
      plannerContract: MODULE_REFERENCE_PLANNER_VERSION,
      engineContract: STUDIO_BLUEPRINT_ENGINE_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      renderSchema: digestOf(parts.renderSchema, 'renderSchemaDigest'),
      layoutSchema: digestOf(parts.layoutSchema, 'layoutSchemaDigest'),
      screenSchema: digestOf(parts.screenSchema, 'screenSchemaDigest'),
      tableBridge: digestOf(parts.tableBridge, 'tableBridgeDigest'),
      formBridge: digestOf(parts.formBridge, 'formBridgeDigest'),
      detailBridge: digestOf(parts.detailBridge, 'detailBridgeDigest'),
      fieldBridge: digestOf(parts.fieldBridge, 'fieldBridgeDigest'),
      actionBridge: digestOf(parts.actionBridge, 'actionBridgeDigest'),
      permissionBridge: digestOf(parts.permissionBridge, 'permissionBridgeDigest'),
      allowedComponent: digestOf(parts.allowedComponent, 'allowedComponentDigest'),
      visualAdapter: digestOf(parts.visualAdapter, 'visualAdapterDigest'),
      routePlan: digestOf(parts.routePlan, 'routePlanDigest'),
      menuPlan: digestOf(parts.menuPlan, 'menuPlanDigest'),
      runtimeSafety: digestOf(parts.runtimeSafety, 'runtimeSafetyDigest'),
      readiness: digestOf(parts.readiness, 'readinessDigest'),
    },
    capabilities: { ...DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: bridgeDigest(core) });
}

export default createDevPreviewBridgeManifest;
