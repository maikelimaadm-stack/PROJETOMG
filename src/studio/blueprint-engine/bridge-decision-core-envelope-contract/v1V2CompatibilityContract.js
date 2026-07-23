import { V1_ENVELOPE_IDENTITY_CONTRACT_VERSION, CORE_ENVELOPE_CONTRACT_VERSION } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** v1/v2 compatibility: v1 stays intact & valid but insufficient for runtime recompute; v2 required; no implicit upgrade. */
export const V1_V2_COMPATIBILITY_CONTRACT = deepFreeze({
  kind: 'core-envelope-v1-v2-compatibility-contract',
  v1ContractVersion: V1_ENVELOPE_IDENTITY_CONTRACT_VERSION,
  v2ContractVersion: CORE_ENVELOPE_CONTRACT_VERSION,
  v1EnvelopeContractStillValid: true,
  v1SufficientForRuntimeRecompute: false,
  v2RequiredForRuntimeRecompute: true,
  implicitV1ToV2UpgradeAllowed: false,
  automaticCoreSynthesisFromV1Allowed: false,
  v1RuntimeAcceptanceAllowed: false,
  v2RuntimeAcceptancePlanned: true,
  contractRegistryCompatibility: 'additive',
  runtimeInputCompatibility: 'breaking_by_version',
  explicitVersionNegotiationRequired: true,
  unknownEnvelopeVersionFailsClosed: true,
});
export default V1_V2_COMPATIBILITY_CONTRACT;
