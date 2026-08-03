/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER — public surface.
 *
 * Headless, dev-only, in-memory, ephemeral, deterministic, immutable, fail-closed, side-effect-free builder that
 * receives a real complete `bridgeDecision`, safely normalizes it, validates shape/eligibility/versions/security/
 * target against the real merged upstreams, extracts the exact `bridgeDecisionCore` by the real allowlist, recomputes
 * and exactly compares `bridgeDecisionDigest`, preserves same-decision atomicity, constructs an immutable Core
 * Envelope v2 (identityVerified stays false), records `builderDecision.identityVerified=true` OUTSIDE the envelope on
 * success (ARCHITECTURE 1, final), and returns a deep-frozen success or atomic sanitized rejection. No consumer
 * runtime, no preview, no UI/App/route/menu, no persistence/backend/Prisma/network, no module/certification/product,
 * no Core Envelope Verification State Amendment. Exposes only `.js`.
 */
export {
  BUILDER_NAME, BUILDER_SEMVER, BUILDER_VERSION, BUILDER_MODE, FUTURE_BUILDER_FACTORY, SOURCE_FIELDS,
  REQUIRED_SOURCE_FIELDS, ELIGIBILITY_FIELDS, DECISION_KIND, DECISION_SUCCESS_STATUS, DIGEST_FIELD, CORE_ALLOWLIST,
  CORE_FIELD_COUNT, ENVELOPE_FIELDS, ENVELOPE_INVARIANTS, ENVELOPE_KIND, ENVELOPE_VERSION_TAG, PIPELINE_STAGES,
  ISSUE_CODES, ISSUE_SEVERITIES, DECISION_STATUSES, MAX_STRUCTURE_DEPTH, PROTOTYPE_POLLUTION_KEYS, RESOURCE_LIMITS,
  RESOURCE_DIMENSIONS, STATUS_READY, STATUS_REJECTED, DEFAULT_BUILDER_CONFIG, BUILDER_CONFIG_ALLOWED_KEYS,
  BUILDER_ALWAYS_STRICT, FORBIDDEN_CONFIG_OVERRIDE_KEYS,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_ENVELOPE_V1_VERSION, SOURCE_BRIDGE_VERSION,
  MAK_STUDIO_CORE_ENVELOPE_BUILDER_FLAG, isProductionEnv, isStudioCoreEnvelopeBuilderEnabled,
} from './builderConfig.js';

// ---- Read-only helpers/metadata only. NO partial-execution bypass is exported: extraction, digest recompute,
// envelope construction, decision/rejection creation, normalizers, validators and enforcers are INTERNAL. The only
// way to execute the builder is the factory below. (Unit tests import internal modules directly by path.)
export { coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
export { REPLAY_IDEMPOTENCY } from './replayIdempotency.js';
export { createBuilderDiagnostics } from './builderDiagnostics.js';
export { createBuilderManifest } from './builderManifest.js';
export { verifyBuilderCompatibility } from './verifyBuilderCompatibility.js';
export { createBuilderReadiness } from './builderReadiness.js';
export { BUILDER_MANUAL_GATE } from './builderManualGate.js';
export { createBridgeDecisionCoreEnvelopeBuilder } from './createBridgeDecisionCoreEnvelopeBuilder.js';

export { default } from './createBridgeDecisionCoreEnvelopeBuilder.js';
