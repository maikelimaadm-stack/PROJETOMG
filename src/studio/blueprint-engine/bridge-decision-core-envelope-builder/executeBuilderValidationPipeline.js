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
 * The SEVEN boundary-stage validators (stages 17-23), exported INTERNALLY so each can be exercised DIRECTLY with a
 * valid and a tampered context. They are real checks, not implicit coverage — but many of the defects they catch are
 * already blocked by an earlier stage end-to-end, so their correctness is proved here rather than by claiming each
 * can be reached as the first blocker. Every validator takes `{ source, envelope }` and returns that stage's issues.
 */
export const BOUNDARY_STAGE_VALIDATORS = deepFreeze({
  // 17 — SSOT boundary: the envelope must never be declared canonical over the certified blueprint.
  [S[16]]: ({ envelope }) => (envelope && envelope.metadataOnly === true && envelope.synthetic === true
    ? [] : [makeIssue('BUILDER_SSOT_INVERSION_FORBIDDEN', S[16], 'blocker', 'coreEnvelope')]),
  // 18 — preview mount boundary.
  [S[17]]: ({ source, envelope }) => (envelope && envelope.previewMounted === false && source && source.previewMounted !== true
    ? [] : [makeIssue('BUILDER_PREMATURE_RUNTIME_FORBIDDEN', S[17], 'blocker', 'previewMounted')]),
  // 19 — real data boundary.
  [S[18]]: ({ source }) => (source && source.realDataRead !== true && source.targetDescriptor && source.targetDescriptor.realDataAttached !== true
    ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[18], 'blocker', 'realDataRead')]),
  // 20 — module generation boundary.
  [S[19]]: ({ source }) => (source && source.moduleGenerated !== true && source.targetDescriptor && source.targetDescriptor.moduleGenerated !== true
    ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[19], 'blocker', 'moduleGenerated')]),
  // 21 — certification boundary.
  [S[20]]: ({ source }) => (source && source.certificationPerformed !== true
    ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[20], 'blocker', 'certificationPerformed')]),
  // 22 — product exposure boundary.
  [S[21]]: ({ source, envelope }) => (envelope && envelope.productExposed === false && source && source.productExposed !== true
    && source.targetDescriptor && source.targetDescriptor.productExposed !== true
    ? [] : [makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', S[21], 'blocker', 'productExposed')]),
  // 23 — prototype reference validation: neither the envelope nor its nested core may carry a pollution key.
  [S[22]]: ({ envelope }) => (envelope && !hasPrototypePollutionKey(envelope, RESOURCE_LIMITS.maxStructureDepth)
    ? [] : [makeIssue('BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', S[22], 'blocker', 'coreEnvelope')]),
});

/**
 * Stage / responsibility / precedence / proof matrix. `directValidationProof` records that the stage's own validator
 * is exercised directly (valid + tampered context); `reachableAsFirstBlocker` records honestly whether a defect can
 * realistically make that stage the FIRST blocker end-to-end, or whether an earlier stage always catches it first
 * (defense in depth).
 */
export const PIPELINE_STAGE_PROOF_MATRIX = deepFreeze([
  { index: 1, stage: S[0], responsibility: 'safe structural normalization + depth + bytes/strings', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 2, stage: S[1], responsibility: 'exact 33-field shape + forbidden extensions + field count', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 3, stage: S[2], responsibility: 'success eligibility flags', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 4, stage: S[3], responsibility: 'source version tuple', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 5, stage: S[4], responsibility: 'source security boundary flags', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 6, stage: S[5], responsibility: 'exact 23-field target descriptor + exact version tuple + limits', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 7, stage: S[6], responsibility: 'core allowlist resolution (source minus digest)', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 8, stage: S[7], responsibility: 'exact core extraction', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 9, stage: S[8], responsibility: 'core completeness + core limits', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 10, stage: S[9], responsibility: 'no extra core field', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 11, stage: S[10], responsibility: 'digest present once, never inside core', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 12, stage: S[11], responsibility: 'digest recompute + exact compare', directValidationProof: true, reachableAsFirstBlocker: true, defenseInDepth: false },
  { index: 13, stage: S[12], responsibility: 'same-decision atomicity', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 14, stage: S[13], responsibility: 'envelope declared version tuple', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 15, stage: S[14], responsibility: 'envelope exact 12-field shape + byte ceiling before emission', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 16, stage: S[15], responsibility: 'pre-consumer verification state (identityVerified false)', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 17, stage: S[16], responsibility: 'SSOT boundary — envelope never canonical over the certified blueprint', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 18, stage: S[17], responsibility: 'preview mount boundary', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 19, stage: S[18], responsibility: 'real data boundary', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 20, stage: S[19], responsibility: 'module generation boundary', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 21, stage: S[20], responsibility: 'certification boundary', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 22, stage: S[21], responsibility: 'product exposure boundary', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
  { index: 23, stage: S[22], responsibility: 'prototype reference validation on the emitted envelope', directValidationProof: true, reachableAsFirstBlocker: false, defenseInDepth: true },
]);

/**
 * INTERNAL executable 23-stage pipeline (NOT exported by the public index, and NOT a test seam). It walks
 * BUILDER_PIPELINE_STAGES in the exact canonical order and executes EACH stage explicitly — including the boundary
 * stages 17-23. It is STAGE-ATOMIC: the first stage producing a blocking issue stops the walk; no later stage runs,
 * no later-stage issue is produced, and the envelope only exists after every preceding stage passed. Returns a
 * deep-frozen result with a sanitized `executedStages` PREFIX trace (stage names only — never raw source or secrets).
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
  };
  // 17-23 — the boundary validators, executed through the SAME map so they are real stages, not implicit coverage.
  for (const stage of S.slice(16)) runners[stage] = () => BOUNDARY_STAGE_VALIDATORS[stage]({ source, envelope });

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
