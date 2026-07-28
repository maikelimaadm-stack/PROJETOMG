import { DIGEST_FIELD } from './builderConfig.js';
import { normalizeBuilderConfig } from './normalizeBuilderConfig.js';
import { normalizeSourceDecision } from './normalizeSourceDecision.js';
import { validateSourceDecisionShape } from './validateSourceDecisionShape.js';
import { validateSourceEligibility } from './validateSourceEligibility.js';
import { validateSourceVersions } from './validateSourceVersions.js';
import { validateSourceSecurityBoundary } from './validateSourceSecurityBoundary.js';
import { validateTargetDescriptor } from './validateTargetDescriptor.js';
import { validateNoForbiddenExtensions } from './extensionValidator.js';
import { enforceSourceResourceLimits, enforceCoreResourceLimits, enforceTargetDescriptorLimits, enforceEnvelopeResourceLimits } from './resourceLimitEnforcer.js';
import { resolveCoreFieldAllowlist } from './resolveCoreFieldAllowlist.js';
import { extractBridgeDecisionCore } from './extractBridgeDecisionCore.js';
import { validateExtractedCore } from './validateExtractedCore.js';
import { recomputeBridgeDecisionDigest } from './recomputeBridgeDecisionDigest.js';
import { validateSameDecisionAtomicity } from './validateSameDecisionAtomicity.js';
import { constructCoreEnvelope } from './constructCoreEnvelope.js';
import { validateCoreEnvelopeShape } from './validateCoreEnvelopeShape.js';
import { createBuilderDecision } from './createBuilderDecision.js';
import { createBuilderRejection } from './createBuilderRejection.js';
import { createEmergencyBuilderRejection } from './createEmergencyBuilderRejection.js';
import { makeIssue } from './normalizeIssues.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Creates a headless, deterministic, side-effect-free builder: `{ build(bridgeDecision) }`. The build runs the real
 * 23-stage pipeline in order, stops at the first blocker (atomic — no envelope on any failure), recomputes and
 * exactly compares the digest, enforces same-decision atomicity, and constructs an immutable Core Envelope v2 with
 * identityVerified=false. On success the builder decision records identityVerified=true OUTSIDE the envelope
 * (ARCHITECTURE 1). Any unexpected exception at the boundary becomes a sanitized emergency rejection. Synchronous;
 * no Promise/I/O/clock/random/global state. Each instance is isolated.
 * @param {Object} [config] @returns {{build:(bridgeDecision:*)=>Object}}
 */
export function createBridgeDecisionCoreEnvelopeBuilder(config) {
  // The factory NEVER throws: config normalization is fully contained (hostile Proxy traps included).
  let cfg;
  try { cfg = normalizeBuilderConfig(config); } catch { cfg = { ok: false, code: 'BUILDER_CONFIG_INVALID' }; }
  const configOk = cfg.ok === true;
  const configCode = cfg.code;
  const builderConfig = cfg.config || null;

  function build(bridgeDecision) {
    try {
      if (!configOk) return createBuilderRejection([makeIssue(configCode || 'BUILDER_CONFIG_INVALID', 'config_normalization')]);

      // Stage 1 — safe structural normalization (read-only).
      const norm = normalizeSourceDecision(bridgeDecision, builderConfig.maxStructureDepth);
      if (!norm.ok) return createBuilderRejection([makeIssue(norm.code, 'source_structure_normalization')]);
      const source = norm.source;

      // Stages 2-8 — source validation (shape, extensions/limits, eligibility, version, security, target).
      let issues = [];
      issues = issues.concat(validateSourceDecisionShape(source));
      issues = issues.concat(validateNoForbiddenExtensions(source));
      issues = issues.concat(enforceSourceResourceLimits(source));
      if (issues.length) return createBuilderRejection(issues);
      issues = issues.concat(validateSourceEligibility(source));
      if (issues.length) return createBuilderRejection(issues);
      issues = issues.concat(validateSourceVersions(source));
      issues = issues.concat(validateSourceSecurityBoundary(source));
      issues = issues.concat(validateTargetDescriptor(source));
      issues = issues.concat(enforceTargetDescriptorLimits(source.targetDescriptor));
      if (issues.length) return createBuilderRejection(issues);

      // Stages 9-11 — allowlist resolution + exact extraction + core validation.
      const allowlist = resolveCoreFieldAllowlist();
      const { core, missing } = extractBridgeDecisionCore(source, allowlist);
      issues = issues.concat(validateExtractedCore(core, missing));
      issues = issues.concat(enforceCoreResourceLimits(core));
      if (issues.length) return createBuilderRejection(issues);

      // Stage 12 — digest presence + recompute + exact compare.
      const sourceDigest = source[DIGEST_FIELD];
      const dg = recomputeBridgeDecisionDigest(core, sourceDigest);
      if (!dg.ok) return createBuilderRejection(dg.issues);

      // Stage 13 — same-decision atomicity.
      issues = validateSameDecisionAtomicity(source, core);
      if (issues.length) return createBuilderRejection(issues);

      // Stages 14-16 — envelope construction + shape/identity validation + byte ceiling BEFORE emission.
      const envelope = constructCoreEnvelope(core, sourceDigest);
      issues = validateCoreEnvelopeShape(envelope);
      issues = issues.concat(enforceEnvelopeResourceLimits(envelope));
      if (issues.length) return createBuilderRejection(issues);

      // Success — builder decision carries verification OUTSIDE the (still-false) envelope.
      return createBuilderDecision(envelope);
    } catch {
      return createEmergencyBuilderRejection();
    }
  }

  return deepFreeze({ build });
}
export default createBridgeDecisionCoreEnvelopeBuilder;
