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
  RESOURCE_DIMENSIONS, STATUS_READY, STATUS_REJECTED, DEFAULT_BUILDER_CONFIG, FORBIDDEN_CONFIG_OVERRIDE_KEYS,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_ENVELOPE_V1_VERSION, SOURCE_BRIDGE_VERSION,
  MAK_STUDIO_CORE_ENVELOPE_BUILDER_FLAG, isProductionEnv, isStudioCoreEnvelopeBuilderEnabled,
} from './builderConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { safeCloneAndNormalize, BuilderNormalizationError } from './safeCloneAndNormalize.js';
export { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
export { makeIssue, normalizeIssues } from './normalizeIssues.js';
export { normalizeBuilderConfig } from './normalizeBuilderConfig.js';
export { normalizeSourceDecision } from './normalizeSourceDecision.js';
export { validateSourceDecisionShape } from './validateSourceDecisionShape.js';
export { validateSourceEligibility } from './validateSourceEligibility.js';
export { validateSourceVersions } from './validateSourceVersions.js';
export { validateSourceSecurityBoundary } from './validateSourceSecurityBoundary.js';
export { validateTargetDescriptor } from './validateTargetDescriptor.js';
export { validateNoForbiddenExtensions } from './extensionValidator.js';
export { enforceSourceResourceLimits, enforceCoreResourceLimits } from './resourceLimitEnforcer.js';
export { resolveCoreFieldAllowlist, coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
export { extractBridgeDecisionCore } from './extractBridgeDecisionCore.js';
export { validateExtractedCore } from './validateExtractedCore.js';
export { recomputeBridgeDecisionDigest } from './recomputeBridgeDecisionDigest.js';
export { validateSameDecisionAtomicity } from './validateSameDecisionAtomicity.js';
export { constructCoreEnvelope } from './constructCoreEnvelope.js';
export { validateCoreEnvelopeShape } from './validateCoreEnvelopeShape.js';
export { createBuilderDecision } from './createBuilderDecision.js';
export { createBuilderRejection } from './createBuilderRejection.js';
export { createEmergencyBuilderRejection } from './createEmergencyBuilderRejection.js';
export { REPLAY_IDEMPOTENCY } from './replayIdempotency.js';
export { createBuilderDiagnostics } from './builderDiagnostics.js';
export { createBuilderManifest } from './builderManifest.js';
export { verifyBuilderCompatibility } from './verifyBuilderCompatibility.js';
export { createBuilderReadiness, BUILDER_MANUAL_GATE } from './builderReadiness.js';
export { createBridgeDecisionCoreEnvelopeBuilder } from './createBridgeDecisionCoreEnvelopeBuilder.js';

export { default } from './createBridgeDecisionCoreEnvelopeBuilder.js';
