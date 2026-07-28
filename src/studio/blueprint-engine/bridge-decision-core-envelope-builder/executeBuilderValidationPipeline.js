import { PIPELINE_STAGES, DIGEST_FIELD, RESOURCE_LIMITS } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { makeIssue } from './normalizeIssues.js';
import { normalizeSourceDecision } from './normalizeSourceDecision.js';
import { validateSourceDecisionShape } from './validateSourceDecisionShape.js';
import { validateSourceEligibility } from './validateSourceEligibility.js';
import { validateSourceVersions } from './validateSourceVersions.js';
import { validateSourceSecurityBoundary } from './validateSourceSecurityBoundary.js';
import { validateTargetDescriptor } from './validateTargetDescriptor.js';
import { validateNoForbiddenExtensions } from './extensionValidator.js';
import { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
import {
  enforceSourceResourceLimits, enforceSourceFieldCountLimit, enforceTargetDescriptorLimits,
  enforceCoreResourceLimits, enforceEnvelopeResourceLimits, enforceStructureDepth,
} from './resourceLimitEnforcer.js';
import { resolveCoreFieldAllowlist, coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
import { extractBridgeDecisionCore } from './extractBridgeDecisionCore.js';
import { validateExtractedCore } from './validateExtractedCore.js';
import { recomputeBridgeDecisionDigest } from './recomputeBridgeDecisionDigest.js';
import { validateSameDecisionAtomicity } from './validateSameDecisionAtomicity.js';
import { constructCoreEnvelope } from './constructCoreEnvelope.js';
import { validateCoreEnvelopeShape, validateCoreEnvelopeVersion, validateIdentityVerificationState } from './validateCoreEnvelopeShape.js';

const S = PIPELINE_STAGES; // canonical order, from the real contract

/**
 * INTERNAL executable 23-stage pipeline (NOT exported by the public index). It walks BUILDER_PIPELINE_STAGES in the
 * exact canonical order and executes EACH stage explicitly — including the boundary stages 17-23, which are real
 * checks, not implicit coverage. It is STAGE-ATOMIC: the first stage producing a blocker/error stops the walk; no
 * later stage runs, no later-stage issue is produced, and the envelope is only created at its own stage after every
 * preceding stage passed. Returns a deep-frozen result with a sanitized `executedStages` trace (stage names only —
 * never raw source/target/secrets).
 * @returns {{ok:boolean, issues:Array, core:Object|null, envelope:Object|null, executedStages:string[], stoppedAtStage:string|null}}
 */
export function executeBuilderValidationPipeline(bridgeDecision, builderConfig) {
  const executed = [];
  let source = null; let allowlist = null; let core = null; let envelope = null; let digest = null;

  // Each entry runs ONLY its own responsibility and returns that stage's issues.
  const runners = {
    // 01
    [S[0]]: () => {
      const norm = normalizeSourceDecision(bridgeDecision, builderConfig.maxStructureDepth);
      if (!norm.ok) return [makeIssue(norm.code, S[0])];
      source = norm.source;
      return [...enforceStructureDepth(source), ...enforceSourceResourceLimits(source)];
    },
    // 02
    [S[1]]: () => [...validateSourceDecisionShape(source), ...validateNoForbiddenExtensions(source), ...enforceSourceFieldCountLimit(source)],
    // 03
    [S[2]]: () => validateSourceEligibility(source),
    // 04
    [S[3]]: () => validateSourceVersions(source),
    // 05
    [S[4]]: () => validateSourceSecurityBoundary(source),
    // 06
    [S[5]]: () => [...validateTargetDescriptor(source), ...enforceTargetDescriptorLimits(source.targetDescriptor)],
    // 07
    [S[6]]: () => {
      allowlist = resolveCoreFieldAllowlist();
      return coreAllowlistIsSourceMinusDigest() ? [] : [makeIssue('BUILDER_CORE_FIELD_MISSING', S[6])];
    },
    // 08
    [S[7]]: () => {
      const r = extractBridgeDecisionCore(source, allowlist);
      core = r.core;
      return r.missing.length ? r.missing.map(() => makeIssue('BUILDER_CORE_FIELD_MISSING', S[7])) : [];
    },
    // 09
    [S[8]]: () => [...validateExtractedCore(core, []), ...enforceCoreResourceLimits(core)],
    // 10
    [S[9]]: () => Object.keys(core).filter((k) => !allowlist.includes(k)).map(() => makeIssue('BUILDER_CORE_FIELD_EXTRA', S[9])),
    // 11
    [S[10]]: () => {
      digest = source[DIGEST_FIELD];
      if (typeof digest !== 'string' || digest.length === 0) return [makeIssue('BUILDER_DIGEST_REQUIRED', S[10])];
      if (Object.prototype.hasOwnProperty.call(core, DIGEST_FIELD)) return [makeIssue('BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN', S[10])];
      return [];
    },
    // 12
    [S[11]]: () => recomputeBridgeDecisionDigest(core, digest).issues.map((i) => makeIssue(i.issueCode, S[11])),
    // 13
    [S[12]]: () => validateSameDecisionAtomicity(source, core).map((i) => makeIssue(i.issueCode, S[12])),
    // 14 — envelope version validation happens on the constructed envelope's declared version tuple.
    [S[13]]: () => { envelope = constructCoreEnvelope(core, digest); return validateCoreEnvelopeVersion(envelope).map((i) => makeIssue(i.issueCode, S[13])); },
    // 15
    [S[14]]: () => [...validateCoreEnvelopeShape(envelope).map((i) => makeIssue(i.issueCode, S[14])), ...enforceEnvelopeResourceLimits(envelope).map((i) => makeIssue(i.issueCode, S[14]))],
    // 16
    [S[15]]: () => validateIdentityVerificationState(envelope).map((i) => makeIssue(i.issueCode, S[15])),
    // 17 — SSOT boundary: the envelope/core must never be declared canonical over the certified blueprint.
    [S[16]]: () => (envelope.metadataOnly === true && envelope.synthetic === true ? [] : [makeIssue('BUILDER_SSOT_INVERSION_FORBIDDEN', S[16])]),
    // 18 — preview mount boundary.
    [S[17]]: () => (envelope.previewMounted === false && source.previewMounted !== true ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[17])]),
    // 19 — real data boundary.
    [S[18]]: () => (source.realDataRead !== true && source.targetDescriptor.realDataAttached !== true ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[18])]),
    // 20 — module generation boundary.
    [S[19]]: () => (source.moduleGenerated !== true && source.targetDescriptor.moduleGenerated !== true ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[19])]),
    // 21 — certification boundary.
    [S[20]]: () => (source.certificationPerformed !== true ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[20])]),
    // 22 — product exposure boundary.
    [S[21]]: () => (envelope.productExposed === false && source.productExposed !== true && source.targetDescriptor.productExposed !== true ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[21])]),
    // 23 — prototype reference validation (envelope + core must carry no pollution key).
    [S[22]]: () => (hasPrototypePollutionKey(envelope, RESOURCE_LIMITS.maxStructureDepth) ? [makeIssue('BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', S[22])] : []),
  };

  for (const stage of S) {
    executed.push(stage);
    const issues = runners[stage]();
    const blocking = issues.filter((i) => i.blocksBuilder === true);
    if (blocking.length > 0) {
      // STAGE-ATOMIC: stop immediately; no later stage runs; no envelope escapes.
      return deepFreeze({
        ok: false, issues: deepFreeze([...issues]), core: null, envelope: null,
        executedStages: deepFreeze([...executed]), stoppedAtStage: stage,
      });
    }
  }
  return deepFreeze({
    ok: true, issues: deepFreeze([]), core, envelope,
    executedStages: deepFreeze([...executed]), stoppedAtStage: null,
  });
}
export default executeBuilderValidationPipeline;
