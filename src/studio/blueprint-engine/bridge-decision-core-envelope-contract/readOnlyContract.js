import { deepFreeze } from './deepFreeze.js';
/** Read-only / immutability policy over the source decision, the core and the target descriptor. */
export const READ_ONLY_CONTRACT = deepFreeze({
  kind: 'core-envelope-read-only-contract',
  sourceDecisionMutationAllowed: false,
  coreMutationAllowed: false,
  targetDescriptorMutationAllowed: false,
  ownershipTransferred: false,
  referenceRetentionAllowed: false,
  cloneRequired: true,
  deepFreezeRequired: true,
  sharedMutableStateAllowed: false,
});
export default READ_ONLY_CONTRACT;
