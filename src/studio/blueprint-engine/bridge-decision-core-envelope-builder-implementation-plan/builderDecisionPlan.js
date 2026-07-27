import { FUTURE_BUILDER_DECISION_STATUSES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Builder decision plan — deterministic success/rejection; coreEnvelope null on error; no leaks. */
export const BUILDER_DECISION_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-builder-decision',
  statuses: deepFreeze([...FUTURE_BUILDER_DECISION_STATUSES]),
  successStatus: 'core_envelope_ready',
  rejectionStatus: 'core_envelope_rejected',
  coreEnvelopeNullOnError: true,
  issuesDeterministicallyOrdered: true,
  rollbackByNonEmission: true,
  sourceMutatedAlwaysFalse: true,
  sideEffectsAlwaysFalse: true,
  stackLeakForbidden: true, secretLeakForbidden: true, internalErrorMessageLeakForbidden: true,
  builderDecisionDigestDeterministic: true,
  builderDecisionImplemented: false,
});
export default BUILDER_DECISION_PLAN;
