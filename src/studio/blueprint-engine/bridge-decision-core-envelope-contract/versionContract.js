import {
  CORE_ENVELOPE_CONTRACT_VERSION, V1_ENVELOPE_IDENTITY_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION_REF,
  SOURCE_BRIDGE_CONTRACT_VERSION_REF2, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
  SOURCE_IMPLEMENTATION_PLAN_VERSION_REF,
} from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Version tuple (real, read-only). Exact match required; no aggregate alias/coercion/downgrade/implicit upgrade. */
export const VERSION_CONTRACT = deepFreeze({
  kind: 'core-envelope-version-contract',
  tuple: deepFreeze({
    coreEnvelopeContract: CORE_ENVELOPE_CONTRACT_VERSION,
    v1EnvelopeIdentityContract: V1_ENVELOPE_IDENTITY_CONTRACT_VERSION,
    bridgeRuntime: SOURCE_BRIDGE_RUNTIME_VERSION_REF,
    bridgeContract: SOURCE_BRIDGE_CONTRACT_VERSION_REF2,
    previewSandboxContract: SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
    bridgeToSandboxConsumerContract: SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF,
    blueprintContract: SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
    implementationPlan: SOURCE_IMPLEMENTATION_PLAN_VERSION_REF,
  }),
  policy: deepFreeze({
    exactVersionMatchRequired: true, unknownVersionFailsClosed: true,
    aggregatedVersionObjectAsSourceAliasAllowed: false, silentVersionCoercionAllowed: false,
    downgradeAllowed: false, implicitUpgradeAllowed: false,
  }),
});
export default VERSION_CONTRACT;
