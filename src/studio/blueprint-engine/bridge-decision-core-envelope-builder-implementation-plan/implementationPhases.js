import { deepFreeze } from './deepFreeze.js';
/**
 * Exactly 22 implementation phases for the FUTURE builder. Each phase is metadata only (implementationStatus:planned,
 * sideEffectsAllowed:false). Deterministic order; each phase declares objective, inputs, outputs, dependencies,
 * pre/postconditions, future files, contract references, issues, limits, security, failure/rollback, determinism,
 * tests, gates and acceptance criteria.
 */
const phase = (id, order, o) => deepFreeze({
  phaseId: id, order,
  objective: o.objective,
  inputs: deepFreeze([...(o.inputs || [])]),
  outputs: deepFreeze([...(o.outputs || [])]),
  dependencies: deepFreeze([...(o.dependencies || [])]),
  preconditions: deepFreeze([...(o.pre || [])]),
  postconditions: deepFreeze([...(o.post || [])]),
  futureFiles: deepFreeze([...(o.files || [])]),
  contractReferences: deepFreeze([...(o.refs || [])]),
  issues: deepFreeze([...(o.issues || [])]),
  limits: deepFreeze([...(o.limits || [])]),
  security: deepFreeze([...(o.security || [])]),
  failureRollback: o.failure || 'rollback by non-emission; sanitized fail-closed rejection',
  determinism: o.determinism || 'no clock/random/locale/timezone; cross-instance deterministic',
  tests: deepFreeze([...(o.tests || [])]),
  gates: deepFreeze([...(o.gates || [])]),
  acceptanceCriteria: deepFreeze([...(o.acceptance || [])]),
  sideEffectsAllowed: false,
  implementationStatus: 'planned',
});

export const IMPLEMENTATION_PHASES = deepFreeze([
  phase('PHASE_01_CONFIG_AND_FACTORY_BOUNDARY', 1, {
    objective: 'Establish createBridgeDecisionCoreEnvelopeBuilder(config) boundary and validate/freeze config.',
    inputs: ['config'], outputs: ['frozen builder instance { build }'], dependencies: [],
    pre: ['dev-only env'], post: ['no build executed yet'], files: ['builderConfig.js', 'createBridgeDecisionCoreEnvelopeBuilder.js'],
    refs: ['MANUAL_ENABLEMENT_GATE'], issues: ['BUILDER_CONFIG_INVALID'], limits: [], security: ['no network/fs/backend'],
    tests: ['config validation', 'factory returns build fn'], gates: ['factory boundary present'], acceptance: ['config frozen; build is a function'],
  }),
  phase('PHASE_02_SAFE_CONFIG_NORMALIZATION', 2, {
    objective: 'Safe-normalize the config fail-closed (no code copied from upstream hardening).',
    inputs: ['config'], outputs: ['normalized config'], dependencies: ['PHASE_01_CONFIG_AND_FACTORY_BOUNDARY'],
    files: ['normalizeBuilderConfig.js', 'safeCloneAndNormalize.js'], refs: ['SAFE_NORMALIZATION_CONTRACT'],
    security: ['prototype pollution rejected'], tests: ['adversarial config'], gates: ['config normalization fail-closed'], acceptance: ['unsafe config rejected deterministically'],
  }),
  phase('PHASE_03_SAFE_SOURCE_NORMALIZATION', 3, {
    objective: 'Safe-normalize the incoming bridgeDecision (cycles/depth/types) read-only.',
    inputs: ['bridgeDecision'], outputs: ['normalized source snapshot'], dependencies: ['PHASE_02_SAFE_CONFIG_NORMALIZATION'],
    files: ['normalizeSourceDecision.js', 'safeCloneAndNormalize.js'], refs: ['SAFE_NORMALIZATION_CONTRACT'],
    issues: ['BUILDER_SOURCE_STRUCTURE_CYCLE', 'BUILDER_SOURCE_STRUCTURE_TOO_DEEP', 'BUILDER_SOURCE_UNSUPPORTED_VALUE'],
    security: ['source never mutated'], tests: ['cycle/depth/sparse/accessor'], gates: ['source normalization fail-closed'], acceptance: ['source read-only; adversarial input rejected'],
  }),
  phase('PHASE_04_SOURCE_SHAPE_VALIDATION', 4, {
    objective: 'Validate the source shape against the real 33-field bridgeDecision; reject invented/missing.',
    inputs: ['normalized source'], outputs: ['shape-valid source'], dependencies: ['PHASE_03_SAFE_SOURCE_NORMALIZATION'],
    files: ['validateSourceDecisionShape.js'], refs: ['REAL_SOURCE_BRIDGE_DECISION_FIELDS'],
    issues: ['BUILDER_SOURCE_INVENTED_FIELD', 'BUILDER_SOURCE_NON_PLAIN_OBJECT'], tests: ['invented field', 'missing field'], gates: ['shape == real 33 fields'], acceptance: ['only real fields accepted'],
  }),
  phase('PHASE_05_SOURCE_ELIGIBILITY_VALIDATION', 5, {
    objective: 'Enforce success eligibility: kind=bridge-decision, ok=true, status=bridge_ready, target+digest present.',
    inputs: ['shape-valid source'], outputs: ['eligible source'], dependencies: ['PHASE_04_SOURCE_SHAPE_VALIDATION'],
    files: ['validateSourceEligibility.js'], refs: ['SOURCE_ELIGIBILITY_CONTRACT'],
    issues: ['BUILDER_SOURCE_KIND_MISMATCH', 'BUILDER_SOURCE_NOT_READY', 'BUILDER_TARGET_DESCRIPTOR_REQUIRED', 'BUILDER_DIGEST_REQUIRED'],
    tests: ['ineligible kind/status'], gates: ['eligibility fail-closed'], acceptance: ['only bridge_ready decisions proceed'],
  }),
  phase('PHASE_06_SOURCE_VERSION_VALIDATION', 6, {
    objective: 'Exact upstream version match; version drift fails closed.',
    inputs: ['eligible source'], outputs: ['version-valid source'], dependencies: ['PHASE_05_SOURCE_ELIGIBILITY_VALIDATION'],
    files: ['validateSourceVersions.js'], refs: ['VERSION_CONTRACT'], issues: ['BUILDER_SOURCE_VERSION_MISMATCH', 'BUILDER_ENVELOPE_VERSION_UNSUPPORTED'],
    tests: ['version drift'], gates: ['exact version match'], acceptance: ['drift rejected'],
  }),
  phase('PHASE_07_SOURCE_SECURITY_BOUNDARY', 7, {
    objective: 'Reject forbidden security/exposure flags asserted on the source.',
    inputs: ['version-valid source'], outputs: ['security-valid source'], dependencies: ['PHASE_06_SOURCE_VERSION_VALIDATION'],
    files: ['validateSourceSecurityBoundary.js'], refs: ['SSOT_SECURITY_PERMISSION_CONTRACT'], issues: ['BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN'],
    security: ['no permission/tenant integration'], tests: ['forbidden flag set'], gates: ['security boundary'], acceptance: ['forbidden exposure flags rejected'],
  }),
  phase('PHASE_08_TARGET_DESCRIPTOR_VALIDATION', 8, {
    objective: 'Validate the target descriptor inside the source decision.',
    inputs: ['security-valid source'], outputs: ['target-valid source'], dependencies: ['PHASE_07_SOURCE_SECURITY_BOUNDARY'],
    files: ['validateTargetDescriptor.js'], refs: ['OUTPUT_TARGET_DESCRIPTOR_FIELDS'], issues: ['BUILDER_TARGET_DESCRIPTOR_REQUIRED'],
    tests: ['missing/invalid target'], gates: ['target descriptor valid'], acceptance: ['target descriptor validated'],
  }),
  phase('PHASE_09_CORE_ALLOWLIST_RESOLUTION', 9, {
    objective: 'Resolve the real DECISION_DIGEST_PREIMAGE_FIELDS allowlist (32) — no local divergent list.',
    inputs: ['target-valid source'], outputs: ['resolved allowlist'], dependencies: ['PHASE_08_TARGET_DESCRIPTOR_VALIDATION'],
    files: ['resolveCoreFieldAllowlist.js'], refs: ['DIGEST_PREIMAGE_ALLOWLIST'], tests: ['allowlist == real preimage'], gates: ['allowlist derived from upstream'], acceptance: ['allowlist == DECISION_DIGEST_PREIMAGE_FIELDS'],
  }),
  phase('PHASE_10_CORE_EXTRACTION', 10, {
    objective: 'exact_allowlist_pick extraction of bridgeDecisionCore (32 fields; digest excluded).',
    inputs: ['resolved allowlist', 'source'], outputs: ['bridgeDecisionCore'], dependencies: ['PHASE_09_CORE_ALLOWLIST_RESOLUTION'],
    files: ['extractBridgeDecisionCore.js'], refs: ['CORE_EXTRACTION_CONTRACT'],
    issues: ['BUILDER_CORE_ALIAS_FORBIDDEN', 'BUILDER_CORE_DEFAULT_FORBIDDEN', 'BUILDER_CORE_COERCION_FORBIDDEN', 'BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN'],
    tests: ['exact pick', 'no alias/default/coercion'], gates: ['core == decision minus digest'], acceptance: ['core has exactly 32 fields; digest excluded; target inside core'],
  }),
  phase('PHASE_11_CORE_COMPLETENESS_AND_DRIFT_VALIDATION', 11, {
    objective: 'Validate core completeness; unknown source field ⇒ fail-closed drift.',
    inputs: ['bridgeDecisionCore'], outputs: ['validated core'], dependencies: ['PHASE_10_CORE_EXTRACTION'],
    files: ['validateExtractedCore.js'], refs: ['CORE_EXTRACTION_CONTRACT'], issues: ['BUILDER_CORE_FIELD_MISSING', 'BUILDER_CORE_FIELD_EXTRA'],
    tests: ['missing/extra field'], gates: ['no missing/extra'], acceptance: ['drift fails closed'],
  }),
  phase('PHASE_12_DIGEST_RECOMPUTE_AND_COMPARE', 12, {
    objective: 'Recompute createDeterministicDigest(core) and compare exactly with source.bridgeDecisionDigest.',
    inputs: ['validated core', 'source.bridgeDecisionDigest'], outputs: ['digest match | rejection'], dependencies: ['PHASE_11_CORE_COMPLETENESS_AND_DRIFT_VALIDATION'],
    files: ['recomputeBridgeDecisionDigest.js'], refs: ['DIGEST_RECOMPUTE_CONTRACT'], issues: ['BUILDER_DIGEST_MISMATCH'],
    tests: ['multi-seed equivalence', 'all-field tamper breaks digest'], gates: ['LIVE digest(core)==realDigest'], acceptance: ['exact compare; mismatch rejects atomically; no synthesis/fallback'],
  }),
  phase('PHASE_13_SAME_DECISION_ATOMICITY', 13, {
    objective: 'Ensure digest and core come from the SAME decision; reject cross-decision mixing.',
    inputs: ['core', 'digest'], outputs: ['atomic pair'], dependencies: ['PHASE_12_DIGEST_RECOMPUTE_AND_COMPARE'],
    files: ['validateSameDecisionAtomicity.js'], refs: ['SAME_DECISION_ATOMICITY_CONTRACT'], issues: ['BUILDER_CROSS_DECISION_MIX_FORBIDDEN'],
    tests: ['digest A + core B mismatch'], gates: ['cross-decision rejected'], acceptance: ['no core/digest replacement; no partial core'],
  }),
  phase('PHASE_14_CORE_ENVELOPE_CONSTRUCTION', 14, {
    objective: 'Construct Core Envelope v2 (12 fields); identityVerified stays false; clone + deep-freeze.',
    inputs: ['core', 'digest'], outputs: ['Core Envelope v2'], dependencies: ['PHASE_13_SAME_DECISION_ATOMICITY'],
    files: ['constructCoreEnvelope.js'], refs: ['OUTPUT_ENVELOPE_CONTRACT'], issues: ['BUILDER_ENVELOPE_INVENTED_FIELD'],
    tests: ['exact envelope fields'], gates: ['envelope invariants'], acceptance: ['identityVerified=false; synthetic/immutable/metadataOnly=true; deep-frozen'],
  }),
  phase('PHASE_15_CORE_ENVELOPE_SHAPE_VALIDATION', 15, {
    objective: 'Validate exact envelope shape/invariants; digest once, core once, target only inside core.',
    inputs: ['Core Envelope v2'], outputs: ['validated envelope'], dependencies: ['PHASE_14_CORE_ENVELOPE_CONSTRUCTION'],
    files: ['validateCoreEnvelopeShape.js'], refs: ['OUTPUT_CORE_ENVELOPE_FIELDS'], issues: ['BUILDER_PARTIAL_ENVELOPE_FORBIDDEN'],
    tests: ['duplication/partial'], gates: ['envelope shape exact'], acceptance: ['no duplication; no partial envelope'],
  }),
  phase('PHASE_16_IDENTITY_LIFECYCLE_RECORDING', 16, {
    objective: 'Record identity lifecycle per ARCHITECTURE 1: builder-side verified outside the envelope only.',
    inputs: ['validated envelope', 'digest match'], outputs: ['identity lifecycle state'], dependencies: ['PHASE_15_CORE_ENVELOPE_SHAPE_VALIDATION'],
    files: ['createBuilderDecision.js'], refs: ['IDENTITY_VERIFICATION_STATE_CONTRACT'], issues: ['BUILDER_IDENTITY_VERIFICATION_STATE_INVALID'],
    security: ['envelope.identityVerified stays false'], tests: ['builder verified outside envelope'], gates: ['identity lifecycle correct'], acceptance: ['builderDecision.identityVerified=true; envelope stays false'],
  }),
  phase('PHASE_17_BUILDER_DECISION_CONSTRUCTION', 17, {
    objective: 'Construct the deterministic builder decision (success) carrying the envelope + producer verification.',
    inputs: ['identity lifecycle state', 'envelope'], outputs: ['builder decision (core_envelope_ready)'], dependencies: ['PHASE_16_IDENTITY_LIFECYCLE_RECORDING'],
    files: ['createBuilderDecision.js'], refs: ['FUTURE_BUILDER_PUBLIC_API_CONTRACT'], tests: ['success decision shape'], gates: ['builder decision fields'], acceptance: ['status core_envelope_ready; builderDecisionDigest deterministic'],
  }),
  phase('PHASE_18_FAILURE_AND_EMERGENCY_REJECTION', 18, {
    objective: 'Deterministic rejection + sanitized emergency rejection on unexpected errors; no leaks.',
    inputs: ['any failure'], outputs: ['builder decision (core_envelope_rejected)'], dependencies: ['PHASE_17_BUILDER_DECISION_CONSTRUCTION'],
    files: ['createBuilderRejection.js', 'createEmergencyBuilderRejection.js', 'normalizeIssues.js'], refs: ['FAILURE_CONTAINMENT_CONTRACT'],
    issues: ['BUILDER_UNEXPECTED_EXECUTION_FAILURE'], security: ['no stack/secret/internal-message leak'], tests: ['exception path', 'no leak'], gates: ['fail-closed containment'], acceptance: ['coreEnvelope null on error; rollback by non-emission'],
  }),
  phase('PHASE_19_RESOURCE_LIMITS_AND_EXTENSIONS', 19, {
    objective: 'Enforce real resource limits + reject core/digest/version overrides and prototype pollution.',
    inputs: ['source/core/envelope'], outputs: ['limit-enforced result'], dependencies: ['PHASE_18_FAILURE_AND_EMERGENCY_REJECTION'],
    files: ['resourceLimitEnforcer.js', 'extensionValidator.js', 'prototypePollutionGuard.js'], refs: ['RESOURCE_LIMITS_CONTRACT', 'EXTENSIBILITY_CONTRACT'],
    issues: ['BUILDER_LIMIT_EXCEEDED', 'BUILDER_UNKNOWN_RESOURCE_DIMENSION', 'BUILDER_EXTENSION_CORE_OVERRIDE_FORBIDDEN', 'BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN'],
    limits: ['limit-1 accepted', 'limit accepted', 'limit+1 rejected'], tests: ['boundary limit-1/limit/limit+1', 'pollution key'], gates: ['limits fail-closed'], acceptance: ['no silent truncation; overrides rejected'],
  }),
  phase('PHASE_20_REPLAY_IDEMPOTENCY_AND_MANIFEST', 20, {
    objective: 'Cross-instance determinism + deterministic manifest of the build result.',
    inputs: ['same source'], outputs: ['same core/digest/envelope/manifest'], dependencies: ['PHASE_19_RESOURCE_LIMITS_AND_EXTENSIONS'],
    files: ['replayIdempotency.js', 'builderManifest.js'], refs: ['REPLAY_IDEMPOTENCY_CONTRACT'],
    tests: ['same source ⇒ same result', 'manifest stable'], gates: ['determinism cross-instance'], acceptance: ['no clock/random/locale/timezone'],
  }),
  phase('PHASE_21_TEST_GATE_AND_BUNDLE_EVIDENCE', 21, {
    objective: 'Author the future implementation test (>=1050) + gate (>=330) + bundle-absence evidence.',
    inputs: ['implemented builder'], outputs: ['green test + gate + evidence'], dependencies: ['PHASE_20_REPLAY_IDEMPOTENCY_AND_MANIFEST'],
    files: ['builderDiagnostics.js', 'verifyBuilderCompatibility.js'], refs: ['PLAN_TEST_STRATEGY', 'PLAN_GATE_STRATEGY'],
    tests: ['>=1050 useful scenarios'], gates: ['>=330 live checks + dist 0 hits'], acceptance: ['test/gate minimums met; bundle clean'],
  }),
  phase('PHASE_22_READINESS_AND_MANUAL_CHECKPOINT', 22, {
    objective: 'Declare readiness for the pre-implementation authorization checkpoint (still gated externally).',
    inputs: ['green artifacts'], outputs: ['readiness decision'], dependencies: ['PHASE_21_TEST_GATE_AND_BUNDLE_EVIDENCE'],
    files: ['index.js'], refs: ['MANUAL_CHECKPOINTS', 'PLAN_READINESS'], tests: ['readiness invariants'], gates: ['readiness + manual gate'], acceptance: ['ready for enterprise audit; execution not self-authorized'],
  }),
]);

export const IMPLEMENTATION_PHASE_IDS = deepFreeze(IMPLEMENTATION_PHASES.map((p) => p.phaseId));
export default IMPLEMENTATION_PHASES;
