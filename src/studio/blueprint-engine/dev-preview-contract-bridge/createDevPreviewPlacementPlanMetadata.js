import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Emits navigation PLAN metadata describing where a module WOULD appear in navigation —
 * entirely as a blocked plan. Pure, metadata-only. It adds NO menu entry, wires NO
 * navigation, and is explicitly marked blocked/not-wired. Consuming this changes nothing in
 * the running app.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} menu plan metadata (blocked)
 */
export function createDevPreviewMenuPlanMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.sandbox?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-menu-plan-metadata',
    moduleId,
    plannedGroup: 'Studio (preview)',
    plannedLabel: moduleId,
    wired: false,
    menuCreated: false,
    navMounted: false,
    exposedInApp: false,
    blocked: true,
    blockedReason: 'dev_preview_contract_bridge_is_headless',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, menuPlanDigest: bridgeDigest(core) });
}

export default createDevPreviewMenuPlanMetadata;
