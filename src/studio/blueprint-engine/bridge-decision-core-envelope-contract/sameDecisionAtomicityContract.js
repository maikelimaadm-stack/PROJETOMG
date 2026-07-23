import { deepFreeze } from './deepFreeze.js';
/** Same-decision atomicity: the {digest, core} pair must come from ONE decision; no mixing/replacement/partial. */
export const SAME_DECISION_ATOMICITY_CONTRACT = deepFreeze({
  kind: 'core-envelope-same-decision-atomicity-contract',
  digestAndCoreMustComeFromSameDecision: true,
  coreIsAtomicDecisionPreimage: true,
  crossDecisionMixingAllowed: false,
  coreReplacementAllowed: false,
  digestReplacementAllowed: false,
  partialCoreAllowed: false,
  provenTransitions: deepFreeze([
    'digest A + core A -> match', 'digest A + core B -> mismatch', 'digest B + core A -> mismatch',
    'core tampered -> mismatch', 'digest tampered -> mismatch',
  ]),
});
export default SAME_DECISION_ATOMICITY_CONTRACT;
