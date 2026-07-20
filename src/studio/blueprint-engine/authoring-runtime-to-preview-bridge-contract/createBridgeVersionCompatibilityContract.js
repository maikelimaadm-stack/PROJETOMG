import {
  AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, BRIDGE_CONTRACT_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION, SOURCE_HANDOFF_VERSION_FIELDS, bridgeDigest,
} from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** The real handoff version field for the authoring-preview-handoff itself. */
const HANDOFF_VERSION = 'authoring-preview-handoff@1.0.0';

/**
 * Declares the VERSION COMPATIBILITY contract with an EXPLICIT version tuple aligned to the real handoff
 * (`handoffVersion`/`runtimeVersion`/`targetSandboxVersion`) plus the bridge/blueprint versions. There is
 * NO aggregated `upstreamVersions` field. Exact versions required; unknown versions fail closed;
 * downgrades forbidden; upgrades NOT assumed compatible; bidirectional check required. Metadata only.
 * @returns {Object}
 */
export function createBridgeVersionCompatibilityContract() {
  const core = {
    kind: 'bridge-version-compatibility-contract',
    explicitVersionTupleRequired: true,
    aggregatedUpstreamVersionsFieldRequired: false,
    exactVersionMatchRequired: true,
    exactSourceRuntimeVersionRequired: true,
    exactTargetSandboxVersionRequired: true,
    majorVersionCompatibilityOnly: false,
    unknownVersionFailsClosed: true,
    versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false,
    bidirectionalCompatibilityCheckRequired: true,
    versionTupleFields: [...SOURCE_HANDOFF_VERSION_FIELDS, 'bridgeContractVersion', 'blueprintContractVersion'],
    tuple: {
      handoffVersion: HANDOFF_VERSION,
      runtimeVersion: AUTHORING_RUNTIME_VERSION,
      targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
      bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
      blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    },
    matrix: {
      handoff: SOURCE_HANDOFF_KIND,
      handoffVersion: HANDOFF_VERSION,
      runtime: AUTHORING_RUNTIME_VERSION,
      bridge: BRIDGE_CONTRACT_VERSION,
      sandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
    },
  };
  return safeCloneGenericModel({ ...core, versionCompatibilityContractDigest: bridgeDigest(core) });
}

export default createBridgeVersionCompatibilityContract;
