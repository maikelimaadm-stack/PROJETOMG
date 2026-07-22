import {
  ENVELOPE_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION_REF,
  SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION_REF, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION,
  SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF,
} from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const VERSION_CONTRACT = deepFreeze({
  kind: 'envelope-version-contract',
  expectedVersions: {
    envelopeVersion: ENVELOPE_CONTRACT_VERSION,
    bridgeRuntimeVersion: SOURCE_BRIDGE_RUNTIME_VERSION,
    bridgeContractVersion: SOURCE_BRIDGE_CONTRACT_VERSION_REF,
    bridgeImplementationPlanVersion: SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION_REF,
    targetSandboxContractVersion: SOURCE_TARGET_SANDBOX_CONTRACT_VERSION,
    bridgeToSandboxConsumerContractVersion: SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION,
    blueprintContractVersion: SOURCE_BLUEPRINT_CONTRACT_VERSION_REF,
  },
  presentInBridgeDecision: ['bridgeRuntimeVersion'],
  presentInTargetDescriptor: ['bridgeRuntimeVersion', 'targetSandboxContractVersion'],
  configOrContractOnly: ['envelopeVersion', 'bridgeContractVersion', 'bridgeImplementationPlanVersion', 'bridgeToSandboxConsumerContractVersion', 'blueprintContractVersion'],
  policy: {
    exactVersionMatchRequired: true, unknownVersionFailsClosed: true, versionDowngradeAllowed: false,
    versionUpgradeAssumedCompatible: false, aggregatedVersionObjectAsSourceAliasAllowed: false, silentVersionCoercionAllowed: false,
  },
});
export default VERSION_CONTRACT;
