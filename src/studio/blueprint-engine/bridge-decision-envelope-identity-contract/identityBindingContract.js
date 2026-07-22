import { deepFreeze } from './deepFreeze.js';
/** Identity binding: digest and descriptor must come from the SAME real decision; recompute-and-compare. */
export const IDENTITY_BINDING_CONTRACT = deepFreeze({
  kind: 'envelope-identity-binding-contract',
  bridgeDecisionDigestRequired: true, targetDescriptorRequired: true, digestAndDescriptorMustComeFromSameDecision: true,
  descriptorReferenceRetentionAllowed: false, descriptorCloneRequired: true, descriptorDeepFreezeRequired: true,
  identityVerificationRequiredBeforeConsumption: true, identityVerificationMode: 'recompute_and_compare',
  identitySynthesisAllowed: false, identityAliasAllowed: false, identityFallbackAllowed: false,
  identityVerificationImplemented: false, envelopeBuilderImplemented: false, consumerRuntimeImplemented: false,
});
export default IDENTITY_BINDING_CONTRACT;
