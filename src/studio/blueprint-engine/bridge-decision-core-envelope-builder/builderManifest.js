import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import {
  BUILDER_NAME, BUILDER_VERSION, BUILDER_MODE, BUILDER_ALWAYS_STRICT, BUILDER_CONFIG_ALLOWED_KEYS,
  DEFAULT_BUILDER_CONFIG, FORBIDDEN_CONFIG_OVERRIDE_KEYS, MAX_STRUCTURE_DEPTH,
  SOURCE_FIELDS, REQUIRED_SOURCE_FIELDS, ELIGIBILITY_FIELDS, SOURCE_SECURITY_DECISION_FIELDS,
  TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_REQUIRED_FIELDS, TARGET_DESCRIPTOR_SECURITY_FIELDS,
  TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_DIGEST_FIELDS, TARGET_DESCRIPTOR_INVARIANTS,
  TARGET_DESCRIPTOR_KIND, TARGET_DESCRIPTOR_TARGET_KIND, SOURCE_TARGET_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION_REF, SOURCE_HANDOFF_KIND_REF, SOURCE_HANDOFF_VERSION_REF,
  PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  CORE_ALLOWLIST, ENVELOPE_FIELDS, ENVELOPE_INVARIANTS, ENVELOPE_KIND, ENVELOPE_VERSION_TAG,
  PIPELINE_STAGES, ISSUE_CODES, ISSUE_SEVERITIES, ISSUE_SHAPE_FIELDS, RESOURCE_DIMENSIONS, RESOURCE_LIMITS,
  FUTURE_BUILDER_FACTORY,
} from './builderConfig.js';
import { ISSUE_STAGE_ALLOWLIST } from './normalizeIssues.js';
import { REPLAY_IDEMPOTENCY } from './replayIdempotency.js';
import { BUILDER_MANUAL_GATE } from './builderManualGate.js';
import { IDENTITY_ARCHITECTURE } from './identityArchitecture.js';
import { deepFreeze } from './deepFreeze.js';

/** The 23 enterprise manifest parts, in canonical order. Names are the manifest's public vocabulary. */
export const MANIFEST_PART_NAMES = deepFreeze([
  'configSchema', 'publicApi', 'sourceFields', 'sourceRequiredFields', 'sourceEligibility', 'sourceSecurity',
  'targetFields', 'targetRequiredFields', 'targetSecurityFields', 'targetVersionTuple', 'targetDigestFields',
  'targetInvariants', 'coreAllowlist', 'envelopeFields', 'envelopeInvariants', 'pipelineStages', 'issueCodes',
  'issueShape', 'issueStageAllowlist', 'resourceDimensionsAndValues', 'identityArchitecture',
  'failureContainmentAndReplay', 'readinessAndManualGate',
]);

/**
 * Deterministic ENTERPRISE manifest of the builder implementation surface: exactly 23 parts, each with its own
 * digest, plus a deterministic overall digest over the ordered part digests. Every declared limit VALUE, the public
 * API surface, the identity owner/architecture and the manual gate are inside the digested payload, so tampering
 * with any of them changes that part's digest AND the overall digest.
 *
 * The digest is FNV-1a over a key-sorted canonical serialization: an internal identity/change-detection device,
 * explicitly NOT a cryptographic integrity guarantee.
 */
export function createBuilderManifest() {
  const parts = {
    configSchema: {
      alwaysStrict: BUILDER_ALWAYS_STRICT,
      allowedKeys: [...BUILDER_CONFIG_ALLOWED_KEYS],
      defaults: { ...DEFAULT_BUILDER_CONFIG },
      forbiddenOverrideKeys: [...FORBIDDEN_CONFIG_OVERRIDE_KEYS],
      maxStructureDepth: MAX_STRUCTURE_DEPTH,
    },
    publicApi: {
      factory: FUTURE_BUILDER_FACTORY,
      factoryResultKeys: ['build'],
      partialExecutionHelperExported: false,
      testSeamExported: false,
    },
    sourceFields: [...SOURCE_FIELDS],
    sourceRequiredFields: [...REQUIRED_SOURCE_FIELDS],
    sourceEligibility: [...ELIGIBILITY_FIELDS],
    sourceSecurity: [...SOURCE_SECURITY_DECISION_FIELDS],
    targetFields: [...TARGET_DESCRIPTOR_FIELDS],
    targetRequiredFields: [...TARGET_DESCRIPTOR_REQUIRED_FIELDS],
    targetSecurityFields: [...TARGET_DESCRIPTOR_SECURITY_FIELDS],
    targetVersionTuple: {
      descriptorKind: TARGET_DESCRIPTOR_KIND,
      targetKind: TARGET_DESCRIPTOR_TARGET_KIND,
      versionFields: [...TARGET_DESCRIPTOR_VERSION_FIELDS],
      targetContractVersion: SOURCE_TARGET_CONTRACT_VERSION,
      sourceRuntimeVersion: AUTHORING_RUNTIME_VERSION_REF,
      sourceHandoffKind: SOURCE_HANDOFF_KIND_REF,
      sourceHandoffVersion: SOURCE_HANDOFF_VERSION_REF,
      sourceTargetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
    },
    targetDigestFields: [...TARGET_DESCRIPTOR_DIGEST_FIELDS],
    targetInvariants: { ...TARGET_DESCRIPTOR_INVARIANTS },
    coreAllowlist: [...CORE_ALLOWLIST],
    envelopeFields: [...ENVELOPE_FIELDS],
    envelopeInvariants: { kind: ENVELOPE_KIND, versionTag: ENVELOPE_VERSION_TAG, ...ENVELOPE_INVARIANTS },
    pipelineStages: [...PIPELINE_STAGES],
    issueCodes: [...ISSUE_CODES],
    issueShape: { fields: [...ISSUE_SHAPE_FIELDS], severities: [...ISSUE_SEVERITIES], permissiveFallbackAllowed: false, silentCorrectionAllowed: false },
    issueStageAllowlist: [...ISSUE_STAGE_ALLOWLIST],
    resourceDimensionsAndValues: { dimensions: [...RESOURCE_DIMENSIONS], values: { ...RESOURCE_LIMITS } },
    identityArchitecture: { ...IDENTITY_ARCHITECTURE },
    failureContainmentAndReplay: {
      ...REPLAY_IDEMPOTENCY,
      publicBoundaryNeverThrows: true,
      emergencyIssueCode: 'BUILDER_UNEXPECTED_EXECUTION_FAILURE',
      emergencyIssueStage: 'public_boundary',
      rollbackByNonEmission: true,
    },
    readinessAndManualGate: { ...BUILDER_MANUAL_GATE },
  };

  const partDigests = {};
  for (const name of MANIFEST_PART_NAMES) partDigests[name] = createDeterministicDigest(parts[name]);
  const overallDigest = createDeterministicDigest({
    ordered: MANIFEST_PART_NAMES.map((n) => [n, partDigests[n]]),
  });
  return deepFreeze({
    kind: 'builder-manifest',
    builderName: BUILDER_NAME,
    builderVersion: BUILDER_VERSION,
    mode: BUILDER_MODE,
    partNames: deepFreeze([...MANIFEST_PART_NAMES]),
    partCount: MANIFEST_PART_NAMES.length,
    parts: deepFreeze(JSON.parse(JSON.stringify(parts))),
    partDigests: deepFreeze({ ...partDigests }),
    overallDigest,
    cryptographicIntegrityProvided: false,
  });
}

/**
 * Recomputes the digests for an ARBITRARY (possibly tampered) part payload, so a test can prove that changing any
 * part really changes that part's digest AND the overall digest. Internal — not on the public index.
 */
export function digestManifestParts(parts) {
  const partDigests = {};
  for (const name of MANIFEST_PART_NAMES) partDigests[name] = createDeterministicDigest(parts[name]);
  return deepFreeze({
    partDigests: deepFreeze({ ...partDigests }),
    overallDigest: createDeterministicDigest({ ordered: MANIFEST_PART_NAMES.map((n) => [n, partDigests[n]]) }),
  });
}
export default createBuilderManifest;
