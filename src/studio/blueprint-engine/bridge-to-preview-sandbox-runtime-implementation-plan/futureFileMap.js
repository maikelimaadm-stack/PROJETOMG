import { FUTURE_RUNTIME_SUBTREE } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Declares the FUTURE runtime subtree file map. These files MUST NOT be created in this plan slice — the map is
 * metadata only. Each entry names a future module, its responsibility, and the phase that owns it.
 */
const F = (file, responsibility, ownerPhase) => deepFreeze({
  file, path: `${FUTURE_RUNTIME_SUBTREE}${file}`, responsibility, ownerPhase, createdInThisSlice: false, implementationStatus: 'planned',
});

export const FUTURE_FILE_MAP = deepFreeze([
  F('runtimeConfig.js', 'Frozen runtime config + version tuple + capability flags', 'PHASE_01_RUNTIME_CONFIG_AND_CAPABILITIES'),
  F('runtimeCapabilities.js', 'Capability manifest (all runtime flags false until enabled)', 'PHASE_01_RUNTIME_CONFIG_AND_CAPABILITIES'),
  F('normalizeEnvelopeInput.js', 'Cycle/depth/JSON-safe safe normalization', 'PHASE_02_SAFE_INPUT_NORMALIZATION'),
  F('validateEnvelopeShape.js', 'Envelope 17-field shape + required-field validation', 'PHASE_03_ENVELOPE_SHAPE_VALIDATION'),
  F('recomputeAndValidateBridgeDecisionDigest.js', 'Recompute-and-compare decision digest', 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
  F('validateSameDecisionProvenance.js', 'Atomic digest+descriptor provenance', 'PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION'),
  F('validateVersionTuple.js', 'Exact version tuple validation', 'PHASE_06_VERSION_TUPLE_VALIDATION'),
  F('validateSyntheticBoundary.js', 'synthetic/immutable/metadataOnly assertions', 'PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION'),
  F('validateSecurityBoundary.js', 'Security-flag-must-be-false assertions', 'PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION'),
  F('enforceRuntimeResourceLimits.js', 'Resource dimension enforcement', 'PHASE_08_RESOURCE_LIMIT_ENFORCEMENT'),
  F('validateRuntimeExtensions.js', 'Namespaced/schema-bound extension validation', 'PHASE_09_EXTENSION_VALIDATION'),
  F('validateMappingContract.js', '12-mapping contract validation', 'PHASE_10_MAPPING_CONTRACT_VALIDATION'),
  F('executeFieldMappings.js', 'Ordered clone-semantics mapping execution', 'PHASE_11_FIELD_MAPPING_EXECUTION'),
  F('createSandboxDescriptor.js', 'Metadata-only sandbox descriptor build', 'PHASE_12_SANDBOX_DESCRIPTOR_BUILD'),
  F('validateSandboxDescriptor.js', 'Descriptor shape + security validation', 'PHASE_13_SANDBOX_DESCRIPTOR_VALIDATION'),
  F('createConsumerDecision.js', 'Deterministic consumer decision build', 'PHASE_14_CONSUMER_DECISION_BUILD'),
  F('createEmergencyConsumerRejection.js', 'Sanitized emergency rejection', 'PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION'),
  F('createFailureContainment.js', 'Atomic failure containment policy', 'PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION'),
  F('createReplayContract.js', 'Replay/idempotency/determinism guarantees', 'PHASE_16_REPLAY_IDEMPOTENCY_AND_DETERMINISM'),
  F('createDecisionDigest.js', 'FNV internal-identity digest helper', 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE'),
  F('createValidationPipeline.js', '17-stage pipeline orchestration', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('createRuntimeManifest.js', 'Deterministic part+overall digests', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('verifyRuntime.js', 'Fail-closed runtime verifier', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('checkRuntimeCompatibility.js', 'Compatibility with all upstream contracts', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('createRuntimeDiagnostics.js', 'Diagnostics summary', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('createRuntimeReadinessDecision.js', 'Readiness decision', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
  F('index.js', 'Public surface (.js only)', 'PHASE_17_MANIFEST_VERIFIER_READINESS'),
]);

export const FUTURE_FILE_COUNT = FUTURE_FILE_MAP.length;
export const FUTURE_FILE_NAMES = deepFreeze(FUTURE_FILE_MAP.map((f) => f.file));
export default FUTURE_FILE_MAP;
