import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES, bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Verifies a produced dev preview bridge contract for headless safety invariants. Pure,
 * metadata-only. Returns a verification report — it never throws, never mutates, never
 * performs I/O. Any violated invariant produces a blocker.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] the produced bridge contract (from the composer)
 * @returns {Object} verification report
 */
export function verifyDevPreviewBridgeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : {};
  const caps = isGenericModelPlainObject(bridge.capabilities) ? bridge.capabilities : DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'uiCreated', 'routeCreated',
    'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed',
    'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (bridge.metadataOnly === false) blockers.push('bridge_must_be_metadata_only');

  const ok = blockers.length === 0;
  const core = {
    kind: 'dev-preview-bridge-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: bridgeDigest(core) });
}

export default verifyDevPreviewBridgeContract;
