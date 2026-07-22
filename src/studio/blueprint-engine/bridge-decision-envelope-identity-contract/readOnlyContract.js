import { deepFreeze } from './deepFreeze.js';
export const READ_ONLY_CONTRACT = deepFreeze({
  kind: 'envelope-read-only-contract',
  sourceDecisionMutationAllowed: false, targetDescriptorMutationAllowed: false, sourceOwnershipTransferred: false,
  targetOwnershipTransferred: false, sourceReferenceRetentionAllowed: false, targetReferenceRetentionAllowed: false,
  cloneRequired: true, deepFreezeRequired: true, sharedMutableStateAllowed: false,
});
export default READ_ONLY_CONTRACT;
