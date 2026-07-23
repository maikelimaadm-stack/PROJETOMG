import { CORE_ENVELOPE_ISSUE_CODES, CORE_ENVELOPE_ISSUE_SEVERITIES } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Issue model (declared). Ordered, deterministic, blocker-first. */
export const ISSUE_MODEL_CONTRACT = deepFreeze({
  kind: 'core-envelope-issue-model-contract',
  issueCodes: [...CORE_ENVELOPE_ISSUE_CODES],
  severities: [...CORE_ENVELOPE_ISSUE_SEVERITIES],
  deterministicOrdering: true, blockerFirst: true, issueModelImplemented: false,
});
export default ISSUE_MODEL_CONTRACT;
