import { AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, BRIDGE_CONTRACT_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the VERSION COMPATIBILITY contract. Exact versions required; unknown versions fail closed;
 * downgrades forbidden; upgrades NOT assumed compatible; bidirectional check required. Metadata only.
 * @returns {Object}
 */
export function createBridgeVersionCompatibilityContract() {
  const core = {
    kind: 'bridge-version-compatibility-contract',
    exactSourceRuntimeVersionRequired: true,
    exactTargetSandboxVersionRequired: true,
    majorVersionCompatibilityOnly: false,
    unknownVersionFailsClosed: true,
    versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false,
    bidirectionalCompatibilityCheckRequired: true,
    matrix: {
      runtime: AUTHORING_RUNTIME_VERSION,
      handoff: SOURCE_HANDOFF_KIND,
      bridge: BRIDGE_CONTRACT_VERSION,
      sandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
  };
  return safeCloneGenericModel({ ...core, versionCompatibilityContractDigest: bridgeDigest(core) });
}

export default createBridgeVersionCompatibilityContract;
