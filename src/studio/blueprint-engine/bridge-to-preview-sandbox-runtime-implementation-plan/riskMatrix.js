import { deepFreeze } from './deepFreeze.js';

/**
 * RISK MATRIX — the enterprise risks for the future runtime implementation. Declaration only. Each risk carries
 * likelihood, impact, severity, mitigation, verification, blocking flag and owning phase.
 */
const R = (riskId, description, likelihood, impact, severity, mitigation, verification, blocking, ownerPhase) => deepFreeze({
  riskId, description, likelihood, impact, severity, mitigation, verification, blocking, ownerPhase,
});

export const RISK_MATRIX = deepFreeze([
  R('B-RECOMPUTE-INPUT', 'Envelope lacks 29 of 32 decision-preimage fields, so the runtime cannot recompute the digest', 'high', 'high', 'blocker',
    'Option A: amend future envelope to carry the missing preimage fields; block runtime until amended', 'digest recomputation input plan gap analysis (32 required, 3 available)', true, 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
  R('R-IDENTITY-MISMATCH', 'digest/descriptor provenance mismatch', 'medium', 'high', 'high',
    'recompute-and-compare; atomic pair', 'same-decision provenance tamper battery', true, 'PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION'),
  R('R-CROSS-DECISION-MIX', 'digest A paired with descriptor B', 'medium', 'high', 'high',
    'atomic pair required; recompute over descriptor', 'cross-decision mix test', true, 'PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION'),
  R('R-DIGEST-AMBIGUITY', 'digest could be synthesized or aliased', 'low', 'high', 'high',
    'no synthesis/alias/fallback; FNV internal-identity only', 'verifier synthesis checks', true, 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
  R('R-VERSION-DRIFT', 'source/target versions drift from contract', 'medium', 'medium', 'medium',
    'exact version match; unknown fails closed', 'version tuple test', true, 'PHASE_06_VERSION_TUPLE_VALIDATION'),
  R('R-MAPPING-DRIFT', 'local mapping list diverges from the real 12', 'low', 'medium', 'medium',
    'consume real FIELD_MAPPING_CONTRACT; no local list', 'mapping count == 12 gate', true, 'PHASE_10_MAPPING_CONTRACT_VALIDATION'),
  R('R-PARTIAL-DESCRIPTOR', 'partial sandbox descriptor emitted on blocker', 'low', 'high', 'high',
    'atomic decision; null on blocker', 'failure containment test', true, 'PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION'),
  R('R-RESOURCE-EXHAUSTION', 'oversized input exhausts resources', 'medium', 'medium', 'medium',
    'resource limit enforcement; no truncation', 'boundary tests', true, 'PHASE_08_RESOURCE_LIMIT_ENFORCEMENT'),
  R('R-PROTOTYPE-POLLUTION', '__proto__/constructor/prototype pollution', 'low', 'high', 'high',
    'drop forbidden keys; reject non-plain objects', 'safe normalization test', true, 'PHASE_02_SAFE_INPUT_NORMALIZATION'),
  R('R-UNEXPECTED-EXCEPTION-LEAK', 'stack/message/secret leak on exception', 'low', 'high', 'high',
    'public try/catch; sanitized emergency rejection', 'emergency rejection test', true, 'PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION'),
  R('R-SSOT-INVERSION', 'descriptor/decision treated as SSOT', 'low', 'high', 'high',
    'certified blueprint remains SSOT', 'SSOT boundary test', true, 'PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION'),
  R('R-PERMISSION-BYPASS', 'product exposed without permission/tenancy', 'low', 'high', 'high',
    'product exposure blocked by permission/tenancy foundation', 'permission boundary test', true, 'PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION'),
  R('R-PREMATURE-MOUNT', 'preview mounted / product exposed prematurely', 'low', 'high', 'high',
    'manual checkpoints; readiness flags false', 'readiness/verifier checks', true, 'PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION'),
  R('R-GATE-BRANCH-RELATIVE-DEBT', 'prior slice gates fail branch-relative on working branch', 'high', 'low', 'low',
    'KNOWN_PRIOR_GATE_SCOPE_LIMITATION; vanishes on main', 'post-merge revalidation', false, 'PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION'),
]);

export const RISK_IDS = deepFreeze(RISK_MATRIX.map((r) => r.riskId));
export default RISK_MATRIX;
