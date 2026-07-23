import {
  AMENDMENT_VERSION, SUPERSEDED_ARCHITECTURE, REPLACEMENT_ARCHITECTURE, SUPERSEDED_SOURCE_ENVELOPE_KIND,
  REPLACEMENT_SOURCE_ENVELOPE_KIND,
} from './amendmentConfig.js';
import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { deepFreeze } from './deepFreeze.js';
/** Explicit, ADDITIVE supersession record. The historical plan stays immutable; nothing upstream is modified. */
export const SUPERSESSION_CONTRACT = deepFreeze({
  kind: 'implementation-plan-supersession-contract',
  amendmentKind: 'implementation_plan_alignment_amendment',
  amendmentVersion: AMENDMENT_VERSION,
  sourcePlanVersion: SOURCE_PLAN_TRACEABILITY.originalPlanVersion,
  sourcePlanOverallDigest: SOURCE_PLAN_TRACEABILITY.sourcePlanOverallDigest,
  sourceCoreEnvelopeContractVersion: CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreEnvelopeContractVersion,
  sourceCoreEnvelopeOverallDigest: CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreEnvelopeOverallDigest,
  supersedesSelectedArchitecture: SUPERSEDED_ARCHITECTURE,
  replacementArchitecture: REPLACEMENT_ARCHITECTURE,
  supersedesSourceEnvelopeKind: SUPERSEDED_SOURCE_ENVELOPE_KIND,
  replacementSourceEnvelopeKind: REPLACEMENT_SOURCE_ENVELOPE_KIND,
  historicalPlanRemainsImmutable: true,
  sourcePlanFilesModified: false,
  coreEnvelopeContractFilesModified: false,
  additive: true,
});
export default SUPERSESSION_CONTRACT;
