import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { REPLACEMENT_SOURCE_ENVELOPE_KIND } from './amendmentConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Aligns the future runtime input to the real Core Envelope v2 shape. Declaration only. */
export const SOURCE_ENVELOPE_ALIGNMENT = deepFreeze({
  kind: 'source-envelope-alignment',
  futureInputName: 'BridgeDecisionCoreEnvelope',
  futureInputKind: REPLACEMENT_SOURCE_ENVELOPE_KIND,
  envelopeFields: [...CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreEnvelopeFields],
  requirements: deepFreeze({
    explicitCoreEnvelopeRequired: true,
    bridgeDecisionDigestRequired: true,
    bridgeDecisionCoreRequired: true,
    fullPreimageRequired: true,
    sameDecisionPairRequired: true,
    v1RuntimeInputAllowed: false,
    implicitV1ToV2UpgradeAllowed: false,
    identitySynthesisAllowed: false,
    coreSynthesisAllowed: false,
    identityAliasAllowed: false,
    identityFallbackAllowed: false,
  }),
});
export default SOURCE_ENVELOPE_ALIGNMENT;
