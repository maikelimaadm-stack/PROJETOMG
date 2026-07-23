import { SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Success-eligibility requirements checked BEFORE extraction. Only real decision fields. */
export const SOURCE_ELIGIBILITY_CONTRACT = deepFreeze({
  kind: 'builder-source-eligibility-contract',
  sourceDecisionRequired: true,
  sourceDecisionKindExactMatchRequired: true,
  requiredDecisionKind: SOURCE_DECISION_KIND,
  sourceDecisionOkRequired: true,
  sourceDecisionStatusRequired: SOURCE_DECISION_SUCCESS_STATUS,
  targetDescriptorCreatedRequired: true,
  targetDescriptorRequired: true,
  bridgeDecisionDigestRequired: true,
  // Every security flag on the source decision must be false.
  mustBeFalse: deepFreeze({
    sourceMutated: true, sideEffects: true, previewMounted: true, appTouched: true, routeCreated: true,
    menuCreated: true, persisted: true, productExposed: true, moduleGenerated: true, certificationPerformed: true,
    realDataRead: true,
  }),
  eligibilityImplemented: false,
});
export default SOURCE_ELIGIBILITY_CONTRACT;
