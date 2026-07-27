import { FUTURE_BUILDER_RUNTIME_DIR } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * PLANNED future builder runtime subtree + single-responsibility file map. NOTHING here is created in this slice —
 * `subtreeCreated:false`. Each future file has one responsibility. The map is descriptive metadata only.
 */
export const FUTURE_RUNTIME_FILE_MAP = deepFreeze([
  { file: 'builderConfig.js', responsibility: 'validate + freeze the builder config (dev-only flags, limits refs)' },
  { file: 'safeCloneAndNormalize.js', responsibility: 'cycle/depth/type-safe structural clone (no upstream code copy)' },
  { file: 'normalizeBuilderConfig.js', responsibility: 'normalize + fail-closed the config' },
  { file: 'normalizeSourceDecision.js', responsibility: 'safe-normalize the incoming bridgeDecision (read-only)' },
  { file: 'validateSourceDecisionShape.js', responsibility: 'reject invented/missing source fields vs real shape' },
  { file: 'validateSourceEligibility.js', responsibility: 'kind/ok/status/target/digest eligibility, fail-closed' },
  { file: 'validateSourceVersions.js', responsibility: 'exact upstream version match, drift fail-closed' },
  { file: 'validateSourceSecurityBoundary.js', responsibility: 'reject forbidden security/exposure flags on source' },
  { file: 'validateTargetDescriptor.js', responsibility: 'validate the target descriptor inside the source' },
  { file: 'resolveCoreFieldAllowlist.js', responsibility: 'resolve the real DECISION_DIGEST_PREIMAGE_FIELDS allowlist' },
  { file: 'extractBridgeDecisionCore.js', responsibility: 'exact_allowlist_pick extraction of bridgeDecisionCore' },
  { file: 'validateExtractedCore.js', responsibility: 'completeness + drift validation of the extracted core' },
  { file: 'recomputeBridgeDecisionDigest.js', responsibility: 'recompute digest over the core (real helper)' },
  { file: 'validateSameDecisionAtomicity.js', responsibility: 'digest+core from the same decision; reject mixing' },
  { file: 'constructCoreEnvelope.js', responsibility: 'build the Core Envelope v2 (identityVerified stays false)' },
  { file: 'validateCoreEnvelopeShape.js', responsibility: 'exact envelope field/invariant validation' },
  { file: 'createBuilderDecision.js', responsibility: 'success builder decision (identityVerified=true outside envelope)' },
  { file: 'createBuilderRejection.js', responsibility: 'deterministic rejection (coreEnvelope null, stable issues)' },
  { file: 'createEmergencyBuilderRejection.js', responsibility: 'sanitized fail-closed rejection on unexpected error' },
  { file: 'normalizeIssues.js', responsibility: 'deterministic ordering + shape of issues, no leaks' },
  { file: 'resourceLimitEnforcer.js', responsibility: 'enforce real resource limits, no silent truncation' },
  { file: 'extensionValidator.js', responsibility: 'reject core/digest/version override + prototype pollution' },
  { file: 'prototypePollutionGuard.js', responsibility: 'reject __proto__/constructor/prototype keys' },
  { file: 'replayIdempotency.js', responsibility: 'cross-instance determinism (no clock/random/locale)' },
  { file: 'builderDiagnostics.js', responsibility: 'deterministic diagnostics from a build result' },
  { file: 'builderManifest.js', responsibility: 'deterministic manifest (FNV internal identity)' },
  { file: 'verifyBuilderCompatibility.js', responsibility: 'live compatibility with real upstreams' },
  { file: 'createBridgeDecisionCoreEnvelopeBuilder.js', responsibility: 'public factory → { build(bridgeDecision) }' },
  { file: 'index.js', responsibility: 'public surface (only .js)' },
]);

export const FUTURE_RUNTIME_SUBTREE = deepFreeze({
  kind: 'builder-implementation-plan-future-runtime-subtree',
  plannedDir: FUTURE_BUILDER_RUNTIME_DIR,
  subtreeCreated: false,
  onlyJs: true,
  singleResponsibilityPerFile: true,
  fileCount: FUTURE_RUNTIME_FILE_MAP.length,
  files: FUTURE_RUNTIME_FILE_MAP,
});
export default FUTURE_RUNTIME_SUBTREE;
