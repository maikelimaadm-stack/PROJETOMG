import { deepFreeze } from './deepFreeze.js';
/** Aligns the risk matrix: B-RECOMPUTE-INPUT resolved_at_plan_level; adds v2 alignment risks. Declaration only. */
const R = (riskId, description, likelihood, impact, severity, mitigation, verification, blocking, ownerPhase) => deepFreeze({
  riskId, description, likelihood, impact, severity, mitigation, verification, blocking, ownerPhase,
});
export const RISK_MATRIX_ALIGNMENT = deepFreeze({
  kind: 'risk-matrix-alignment',
  bRecomputeInput: deepFreeze({
    riskId: 'B-RECOMPUTE-INPUT', state: 'resolved_at_plan_level',
    blockingForPlanAlignment: false,
    blockingForRuntime: true,
    blockingForRuntimeReason: 'runtime blocked until Core Envelope Builder Contract + CHECKPOINT_02',
  }),
  risks: deepFreeze([
    R('R-CORE-SCHEMA-DRIFT', 'core shape drifts from real preimage', 'low', 'high', 'high', 'derive core from real DECISION_DIGEST_PREIMAGE_FIELDS; verifier checks missing/extra', 'live 32/32/0 proof', true, 'PHASE_03_ENVELOPE_SHAPE_VALIDATION'),
    R('R-V1-ACCIDENTAL-ACCEPTANCE', 'runtime accidentally accepts v1 envelope', 'low', 'high', 'high', 'v1RuntimeInputAllowed=false; unknown version fail-closed', 'v1 rejection test', true, 'PHASE_03_ENVELOPE_SHAPE_VALIDATION'),
    R('R-IMPLICIT-UPGRADE', 'implicit v1->v2 upgrade', 'low', 'high', 'high', 'implicitV1ToV2UpgradeAllowed=false', 'compatibility test', true, 'PHASE_06_VERSION_TUPLE_VALIDATION'),
    R('R-CORE-DUPLICATION', 'core duplicated across envelope', 'low', 'medium', 'medium', 'core only field; no metadata mapping', 'shape test', true, 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
    R('R-TARGET-DUPLICATION', 'targetDescriptor duplicated at envelope top', 'low', 'medium', 'medium', 'targetDescriptor only inside core', 'shape test', true, 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
    R('R-DIGEST-DUPLICATION', 'digest duplicated inside core', 'low', 'high', 'high', 'digest only in envelope, never in core', 'shape test', true, 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
    R('B-CORE-ENVELOPE-BUILDER', 'no builder contract yet to produce the v2 envelope', 'high', 'high', 'blocker', 'declare B-CORE-ENVELOPE-BUILDER; block runtime until builder contract merged+audited', 'builder requirement present', true, 'PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION'),
  ]),
});
export const RISK_IDS = deepFreeze(RISK_MATRIX_ALIGNMENT.risks.map((r) => r.riskId));
export default RISK_MATRIX_ALIGNMENT;
