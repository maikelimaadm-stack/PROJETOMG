import { deepFreeze } from './deepFreeze.js';
/** Read-only consumption policy for the future consumer. */
export const READ_ONLY_POLICY_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-read-only-policy-contract',
  sourceMutationAllowed: false, sourceConsumptionMode: 'read_only', sourceOwnershipTransferred: false,
  sourceReferenceRetentionAllowed: false, sourceCloneRequired: true, sourceDeepFreezeRequired: true,
  consumerSharedMutableStateAllowed: false,
  consumerMayValidate: true, consumerMayMap: true, consumerMayCreateMetadataOnlyCandidate: true,
  consumerMayMount: false, consumerMayUseReact: false, consumerMayPersist: false, consumerMayReadRealData: false,
  consumerMayCreateRouteMenu: false, consumerMayGenerateModule: false, consumerMayCertify: false,
  consumerMayPublish: false, consumerMayExposeProduct: false,
});
export default READ_ONLY_POLICY_CONTRACT;
