import { deepFreeze } from './deepFreeze.js';
/** Risk matrix (>=16 risks) for the future builder implementation. Metadata only. */
const risk = (id, o) => deepFreeze({
  riskId: id, likelihood: o.l, impact: o.i, severity: o.s, blocking: o.b === true,
  ownerPhase: o.phase, mitigation: o.m, verification: o.v, residualRisk: o.r || 'low',
});
export const RISK_MATRIX = deepFreeze([
  risk('R01_SOURCE_FIELD_DRIFT', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_04_SOURCE_SHAPE_VALIDATION', m: 'derive shape from real upstream; reject invented/missing', v: 'shape validation tests', r: 'low' }),
  risk('R02_ALLOWLIST_DRIFT', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_09_CORE_ALLOWLIST_RESOLUTION', m: 'allowlist == DECISION_DIGEST_PREIMAGE_FIELDS; no local list', v: 'allowlist equivalence gate', r: 'low' }),
  risk('R03_DIGEST_DRIFT', { l: 'low', i: 'critical', s: 'critical', b: true, phase: 'PHASE_12_DIGEST_RECOMPUTE_AND_COMPARE', m: 'real helper; exact compare; no synthesis', v: 'LIVE digest equivalence', r: 'low' }),
  risk('R04_WRONG_PREIMAGE', { l: 'low', i: 'critical', s: 'critical', b: true, phase: 'PHASE_10_CORE_EXTRACTION', m: 'preimage=core=decision minus digest', v: 'serialize(core)==serialize(decision-digest)', r: 'low' }),
  risk('R05_CROSS_DECISION_MIX', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_13_SAME_DECISION_ATOMICITY', m: 'atomic pair; reject mixing', v: 'digest A + core B mismatch tests', r: 'low' }),
  risk('R06_IDENTITY_CONFLATION', { l: 'medium', i: 'high', s: 'high', b: true, phase: 'PHASE_16_IDENTITY_LIFECYCLE_RECORDING', m: 'builder verified outside envelope; consumer owns envelope flag', v: 'identity lifecycle tests', r: 'low' }),
  risk('R07_ENVELOPE_IDENTITY_TRUE', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_14_CORE_ENVELOPE_CONSTRUCTION', m: 'envelope.identityVerified always false', v: 'envelope invariant gate', r: 'low' }),
  risk('R08_ENVELOPE_MUTATION', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_14_CORE_ENVELOPE_CONSTRUCTION', m: 'clone + deep-freeze; consumer does not mutate', v: 'immutability tests', r: 'low' }),
  risk('R09_PARTIAL_OUTPUT', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_18_FAILURE_AND_EMERGENCY_REJECTION', m: 'atomic; rollback by non-emission', v: 'failure containment tests', r: 'low' }),
  risk('R10_LEAK', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_18_FAILURE_AND_EMERGENCY_REJECTION', m: 'sanitized rejection; no stack/secret/message leak', v: 'no-leak tests', r: 'low' }),
  risk('R11_PROTOTYPE_POLLUTION', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_19_RESOURCE_LIMITS_AND_EXTENSIONS', m: 'reject __proto__/constructor/prototype', v: 'pollution key tests', r: 'low' }),
  risk('R12_RESOURCE_EXHAUSTION', { l: 'medium', i: 'medium', s: 'medium', b: false, phase: 'PHASE_19_RESOURCE_LIMITS_AND_EXTENSIONS', m: 'enforce real limits; no silent truncation', v: 'boundary limit tests', r: 'low' }),
  risk('R13_NONDETERMINISM', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_20_REPLAY_IDEMPOTENCY_AND_MANIFEST', m: 'no clock/random/locale/timezone', v: 'cross-instance determinism tests', r: 'low' }),
  risk('R14_VERSION_MISMATCH', { l: 'low', i: 'high', s: 'high', b: true, phase: 'PHASE_06_SOURCE_VERSION_VALIDATION', m: 'exact version match; drift fail-closed', v: 'version drift tests', r: 'low' }),
  risk('R15_CONSUMER_TRUST_WITHOUT_REVERIFICATION', { l: 'medium', i: 'high', s: 'high', b: true, phase: 'PHASE_16_IDENTITY_LIFECYCLE_RECORDING', m: 'doubleVerificationRequired; consumer re-verifies independently', v: 'lifecycle + consumer-decision plan tests', r: 'low' }),
  risk('R16_SCOPE_LEAK_TO_UI_OR_PRODUCTION', { l: 'low', i: 'critical', s: 'critical', b: true, phase: 'PHASE_21_TEST_GATE_AND_BUNDLE_EVIDENCE', m: 'headless/dev-only; bundle absence; scope gate', v: 'dist scan 0 hits + scope gate', r: 'low' }),
  risk('R17_SILENT_CORE_SYNTHESIS', { l: 'low', i: 'critical', s: 'critical', b: true, phase: 'PHASE_10_CORE_EXTRACTION', m: 'no alias/default/coercion/synthesis', v: 'extraction adversarial tests', r: 'low' }),
]);
export default RISK_MATRIX;
