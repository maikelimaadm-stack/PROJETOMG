import { deepFreeze } from './deepFreeze.js';
/** Same-decision atomicity: the whole decision is the atomic input; digest and core cannot be split/mixed. */
export const SAME_DECISION_ATOMICITY_CONTRACT = deepFreeze({
  kind: 'builder-same-decision-atomicity-contract',
  sourceDecisionIsAtomicInput: true,
  digestAndCoreMustComeFromSameDecision: true,
  crossDecisionMixingAllowed: false,
  coreReplacementAllowed: false,
  digestReplacementAllowed: false,
  sourceDecisionSplitAllowed: false,
  provenTransitions: deepFreeze([
    'decision A -> digest A + core A', 'digest A + core B -> mismatch', 'digest B + core A -> mismatch',
    'tampered core -> mismatch', 'tampered digest -> mismatch',
  ]),
});
export default SAME_DECISION_ATOMICITY_CONTRACT;
