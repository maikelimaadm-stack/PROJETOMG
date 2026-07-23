import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { deepFreeze } from './deepFreeze.js';
/** Aligns the 18 original phases to Core Envelope v2. Metadata only; all phases stay planned, no side effects. */
const ALIGNED = {
  PHASE_02_SAFE_INPUT_NORMALIZATION: 'normalize BridgeDecisionCoreEnvelope v2 input (was v1)',
  PHASE_03_ENVELOPE_SHAPE_VALIDATION: 'validate Core Envelope v2 shape (was v1 identity envelope)',
  PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE: 'consume bridgeDecisionCore + bridgeDecisionDigest; recompute exactly (no 29-field reconstruction)',
  PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION: 'atomic digest + core provenance',
  PHASE_06_VERSION_TUPLE_VALIDATION: 'validate Core Envelope v2 version tuple',
};
export const PHASE_ALIGNMENT = deepFreeze({
  kind: 'phase-alignment',
  originalPhaseCount: SOURCE_PLAN_TRACEABILITY.originalPhaseCount, // 18
  originalPhaseIds: [...SOURCE_PLAN_TRACEABILITY.originalPhaseIds],
  alignedInput: 'BridgeDecisionCoreEnvelope',
  phase04ConsumesCore: true,
  phase04ConsumesDigest: true,
  reconstructionOf29MissingFieldsRemoved: true,
  alignedPhases: deepFreeze(Object.entries(ALIGNED).map(([phaseId, note]) => deepFreeze({
    phaseId, alignmentNote: note, implementationStatus: 'planned', sideEffectsAllowed: false,
  }))),
  allPhasesRemainPlanned: true,
  allPhasesSideEffectsFalse: true,
});
export default PHASE_ALIGNMENT;
