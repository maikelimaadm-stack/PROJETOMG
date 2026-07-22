import { deepFreeze } from './deepFreeze.js';
export const PROVENANCE_CONTRACT = deepFreeze({
  kind: 'envelope-provenance-contract',
  sourceDecisionOrigin: 'hardened_authoring_runtime_to_preview_bridge',
  sourceDecisionRequired: true, sourceTargetDescriptorRequired: true, sourceDecisionDigestRequired: true,
  sourceDecisionAndDescriptorAtomicPairRequired: true, crossDecisionDescriptorMixingAllowed: false,
  descriptorReplacementAllowed: false, digestReplacementAllowed: false,
  issueCodes: ['ENVELOPE_SOURCE_DECISION_MISSING', 'ENVELOPE_BRIDGE_DECISION_DIGEST_MISSING', 'ENVELOPE_TARGET_DESCRIPTOR_MISSING',
    'ENVELOPE_DECISION_DESCRIPTOR_PAIR_MISMATCH', 'ENVELOPE_BRIDGE_DECISION_DIGEST_TAMPERED', 'ENVELOPE_CROSS_DECISION_DESCRIPTOR_MIX_FORBIDDEN'],
});
export default PROVENANCE_CONTRACT;
