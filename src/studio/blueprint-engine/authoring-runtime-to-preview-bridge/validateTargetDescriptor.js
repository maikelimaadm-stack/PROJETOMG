import { stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { TARGET_SANDBOX_KIND, PREVIEW_SANDBOX_CONTRACT_VERSION } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Validates a built target descriptor: correct kind + version, metadata-only, not mounted, no route/menu, no
 * product exposure, no module, no persistence, serializable (no functions/symbols/cycles). Pure — never
 * mutates. @param {Object} descriptor @returns {Object}
 */
export function validateTargetDescriptor(descriptor) {
  const issues = [];
  if (!isPlainObject(descriptor)) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_WRONG_KIND', severity: 'blocker', stage: 'target_shape_validation', path: 'target', message: 'Target descriptor must be a plain object.' }));
    return { ok: false, issues };
  }
  if (descriptor.targetKind !== TARGET_SANDBOX_KIND) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_WRONG_KIND', severity: 'blocker', stage: 'target_shape_validation', path: 'target.targetKind', message: `targetKind must be "${TARGET_SANDBOX_KIND}".` }));
  }
  if (descriptor.targetContractVersion !== PREVIEW_SANDBOX_CONTRACT_VERSION) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_WRONG_VERSION', severity: 'blocker', stage: 'target_version_validation', path: 'target.targetContractVersion', message: `targetContractVersion must be "${PREVIEW_SANDBOX_CONTRACT_VERSION}".` }));
  }
  if (descriptor.metadataOnly !== true) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_NOT_METADATA_ONLY', severity: 'blocker', stage: 'target_shape_validation', path: 'target.metadataOnly', message: 'Target descriptor must be metadata-only.' }));
  }
  if (descriptor.previewMounted !== false) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_MOUNTED_FORBIDDEN', severity: 'blocker', stage: 'target_shape_validation', path: 'target.previewMounted', message: 'Target descriptor must not be mounted.' }));
  }
  if (descriptor.routeCreated !== false || descriptor.menuCreated !== false) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_ROUTE_MENU_FORBIDDEN', severity: 'blocker', stage: 'target_shape_validation', path: 'target.routeCreated', message: 'Target descriptor must not create a route/menu.' }));
  }
  if (descriptor.productExposed !== false) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_PRODUCT_EXPOSED_FORBIDDEN', severity: 'blocker', stage: 'product_exposure_validation', path: 'target.productExposed', message: 'Target descriptor must not be product-exposed.' }));
  }
  if (descriptor.moduleGenerated !== false) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_MODULE_GENERATED_FORBIDDEN', severity: 'blocker', stage: 'module_generation_validation', path: 'target.moduleGenerated', message: 'Target descriptor must not generate a module.' }));
  }
  if (descriptor.persistenceAllowed !== false) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_PERSISTENCE_FORBIDDEN', severity: 'blocker', stage: 'target_shape_validation', path: 'target.persistenceAllowed', message: 'Target descriptor must not allow persistence.' }));
  }
  // Serializability (no functions/symbols/cycles; JSON round-trip equals stable serialization length).
  let serializable = true;
  try {
    const json = JSON.stringify(descriptor);
    serializable = typeof json === 'string' && json.length > 0 && stableSerialize(descriptor).length > 0;
  } catch {
    serializable = false;
  }
  if (!serializable) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_TARGET_NOT_SERIALIZABLE', severity: 'blocker', stage: 'target_shape_validation', path: 'target', message: 'Target descriptor must be serializable (no functions/symbols/cycles).' }));
  }
  return { ok: !issues.some((i) => i.blocksBridge), issues, frozen: Object.isFrozen(descriptor), serializable };
}

export default validateTargetDescriptor;
