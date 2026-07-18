import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  BRIDGE_IMPLEMENTATION_PLAN_VERSION, BRIDGE_IMPLEMENTATION_PLAN_MODE, BRIDGE_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';

/**
 * Builds the deterministic bridge-implementation-plan session from a bridge contract. Pure — no storage,
 * no fetch, no persistence, no side-effects. Same input -> same session + digest.
 * @param {Object} [options] @returns {Object}
 */
export function createBridgeImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bc = isGenericModelPlainObject(o.bridgeContract) ? o.bridgeContract : {};
  const contractVersion = typeof bc.bridgeContractVersion === 'string' ? bc.bridgeContractVersion : BRIDGE_CONTRACT_VERSION;
  const core = {
    kind: 'bridge-implementation-plan-session',
    sessionId: `${contractVersion}#authoring-runtime-to-preview-bridge-implementation-plan`,
    bridgeImplementationPlanVersion: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
    bridgeContractVersion: contractVersion,
    sourceRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    targetSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    mode: BRIDGE_IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'authoring-runtime-to-preview-bridge-contract',
    seed: `bridge-plan:${contractVersion}`,
    planOnly: true,
    bridgeContractConsumedReadOnly: true,
    authoringRuntimeConsumedReadOnly: true,
    previewSandboxContractConsumedReadOnly: true,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: bridgePlanDigest(core) });
}

export default createBridgeImplementationPlanSession;
