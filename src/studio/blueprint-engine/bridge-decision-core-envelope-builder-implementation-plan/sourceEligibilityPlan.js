import { SOURCE_ELIGIBILITY_CONTRACT, SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS } from '../bridge-decision-core-envelope-builder-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/** Source eligibility plan — consumes the real Builder Contract eligibility requirements READ-ONLY. */
export const SOURCE_ELIGIBILITY_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-source-eligibility',
  requiredDecisionKind: SOURCE_DECISION_KIND,
  requiredStatus: SOURCE_DECISION_SUCCESS_STATUS,
  requiresOkTrue: SOURCE_ELIGIBILITY_CONTRACT.sourceDecisionOkRequired === true,
  requiresTargetDescriptor: SOURCE_ELIGIBILITY_CONTRACT.targetDescriptorRequired === true,
  requiresDigest: SOURCE_ELIGIBILITY_CONTRACT.bridgeDecisionDigestRequired === true,
  allSideEffectAndExposureFlagsMustBeFalse: true,
  failClosed: true,
  eligibilityImplemented: false,
});
export default SOURCE_ELIGIBILITY_PLAN;
