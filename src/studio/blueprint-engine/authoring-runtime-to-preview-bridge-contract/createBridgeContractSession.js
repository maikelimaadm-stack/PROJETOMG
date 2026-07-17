import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  BRIDGE_CONTRACT_VERSION, BRIDGE_CONTRACT_MODE, AUTHORING_RUNTIME_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, bridgeDigest,
} from './bridgeContractConfig.js';

/**
 * Builds the deterministic bridge-contract session from a source handoff. Pure — no storage, no fetch,
 * no persistence, no side-effects. Same input -> same session + digest. @param {Object} [options]
 * @returns {Object}
 */
export function createBridgeContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sourceHandoff) ? o.sourceHandoff : {};
  const draftId = String(s.draftId ?? 'plannedDraft');
  const core = {
    kind: 'bridge-contract-session',
    sessionId: `${draftId}#authoring-runtime-to-preview-bridge-contract`,
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    sourceRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    targetSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    mode: BRIDGE_CONTRACT_MODE,
    createdFrom: 'authoring-runtime-synthetic-preview-candidate',
    seed: `bridge-contract:${draftId}`,
    sourceConsumedReadOnly: true,
    targetContractConsumedReadOnly: true,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: bridgeDigest(core) });
}

export default createBridgeContractSession;
