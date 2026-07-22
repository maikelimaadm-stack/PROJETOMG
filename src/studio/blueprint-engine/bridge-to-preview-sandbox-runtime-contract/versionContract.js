import {
  SOURCE_TARGET_CONTRACT_VERSION, SOURCE_BRIDGE_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION,
  SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION, SOURCE_AUTHORING_RUNTIME_VERSION,
  SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION, CONTRACT_VERSION,
} from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Explicit version tuple built from REAL upstream values; fail-closed, no aggregate alias, no coercion. */
export const VERSION_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-version-contract',
  expectedVersions: {
    bridgeTargetDescriptorVersion: SOURCE_TARGET_CONTRACT_VERSION,
    bridgeRuntimeVersion: SOURCE_BRIDGE_VERSION,
    bridgeContractVersion: SOURCE_BRIDGE_CONTRACT_VERSION,
    bridgeImplementationPlanVersion: SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION,
    authoringRuntimeVersion: SOURCE_AUTHORING_RUNTIME_VERSION,
    previewSandboxContractVersion: SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    blueprintContractVersion: SOURCE_BLUEPRINT_CONTRACT_VERSION,
    consumerContractVersion: CONTRACT_VERSION,
  },
  policy: {
    exactVersionMatchRequired: true, unknownVersionFailsClosed: true, versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false, aggregatedVersionObjectAsSourceAliasAllowed: false,
    silentVersionCoercionAllowed: false,
  },
});
export default VERSION_CONTRACT;
