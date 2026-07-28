import {
  BUILDER_VERSION, SOURCE_FIELDS, REQUIRED_SOURCE_FIELDS, ELIGIBILITY_FIELDS, SOURCE_SECURITY_DECISION_FIELDS,
  CORE_ALLOWLIST, ENVELOPE_FIELDS, ENVELOPE_INVARIANTS, PIPELINE_STAGES, ISSUE_CODES, ISSUE_SHAPE_FIELDS,
  RESOURCE_LIMITS, RESOURCE_DIMENSIONS, TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_REQUIRED_FIELDS,
  TARGET_DESCRIPTOR_SECURITY_FIELDS, TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_DIGEST_FIELDS,
  TARGET_DESCRIPTOR_INVARIANTS, TARGET_DESCRIPTOR_KIND, TARGET_DESCRIPTOR_TARGET_KIND, SOURCE_TARGET_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION_REF, SOURCE_HANDOFF_KIND_REF, SOURCE_HANDOFF_VERSION_REF,
  PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_BRIDGE_VERSION,
} from './builderConfig.js';
import {
  REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS, SOURCE_SUCCESS_ELIGIBILITY_FIELDS,
  SOURCE_SECURITY_FIELDS, OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_TARGET_DESCRIPTOR_FIELDS,
  BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, RESOURCE_LIMITS_CONTRACT, RESOURCE_DIMENSION_NAMES, ISSUE_MODEL_CONTRACT,
  IDENTITY_VERIFICATION_STATE_CONTRACT,
  BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION as UPSTREAM_BRIDGE_RUNTIME_VERSION,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
import { DECISION_DIGEST_PREIMAGE_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS } from '../bridge-decision-envelope-identity-contract/index.js';
import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REAL_TARGET_DESCRIPTOR_INVARIANTS, SOURCE_TARGET_SANDBOX_KIND,
  SOURCE_TARGET_CONTRACT_VERSION as UPSTREAM_TARGET_CONTRACT_VERSION,
  SOURCE_AUTHORING_RUNTIME_VERSION as UPSTREAM_AUTHORING_RUNTIME_VERSION,
  SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION as UPSTREAM_PREVIEW_SANDBOX_CONTRACT_VERSION,
} from '../bridge-to-preview-sandbox-runtime-contract/index.js';
import {
  SOURCE_HANDOFF_KIND as UPSTREAM_SOURCE_HANDOFF_KIND, SOURCE_HANDOFF_VERSION as UPSTREAM_SOURCE_HANDOFF_VERSION,
  createTargetPreviewSandboxDescriptor,
} from '../authoring-runtime-to-preview-bridge/index.js';
import { ISSUE_STAGE_ALLOWLIST } from './normalizeIssues.js';
import { coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
import { createBridgeDecisionCoreEnvelopeBuilder } from './createBridgeDecisionCoreEnvelopeBuilder.js';
import { deepFreeze } from './deepFreeze.js';

const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const sameOrder = (a, b) => JSON.stringify([...a]) === JSON.stringify([...b]);
/** EXACT map equality: same key set (no missing, NO EXTRA) and same value for every key. */
const sameMap = (a, b) => JSON.stringify(Object.keys(a).sort().map((k) => [k, a[k]]))
  === JSON.stringify(Object.keys(b).sort().map((k) => [k, b[k]]));

/** The upstream-declared identity architecture, derived — never asserted locally. */
const UPSTREAM_IDENTITY_OWNER = IDENTITY_VERIFICATION_STATE_CONTRACT.identityVerifiedSemanticOwner;
const UPSTREAM_SELECTED_ARCHITECTURE = IDENTITY_VERIFICATION_STATE_CONTRACT.selectedArchitecture;
const UPSTREAM_ARCHITECTURE_ONE_FINAL = IDENTITY_VERIFICATION_STATE_CONTRACT.ARCHITECTURE_1_IS_FINAL;
const UPSTREAM_ENVELOPE_IDENTITY_VERIFIED = IDENTITY_VERIFICATION_STATE_CONTRACT.coreEnvelopeCurrentInvariantIdentityVerified;
/** The exact key set the factory result is allowed to expose. */
const EXPECTED_FACTORY_RESULT_KEYS = deepFreeze(['build']);
/** The upstream target descriptor kind, read from the pure factory that emits it. */
const UPSTREAM_TARGET_DESCRIPTOR_KIND = createTargetPreviewSandboxDescriptor({ mapped: {} }).kind;

/**
 * The snapshot of everything this builder claims locally. Passing it (or a deliberately tampered copy) to
 * `evaluateBuilderCompatibilitySnapshot` is the only way blockers are produced — so a test can prove the verifier
 * actually DETECTS divergence instead of merely asserting `ok:true` on the real one.
 */
export const BUILDER_COMPATIBILITY_SNAPSHOT = deepFreeze({
  sourceFields: [...SOURCE_FIELDS],
  requiredSourceFields: [...REQUIRED_SOURCE_FIELDS],
  eligibilityFields: [...ELIGIBILITY_FIELDS],
  sourceSecurityFields: [...SOURCE_SECURITY_DECISION_FIELDS],
  coreAllowlist: [...CORE_ALLOWLIST],
  envelopeFields: [...ENVELOPE_FIELDS],
  envelopeInvariants: { ...ENVELOPE_INVARIANTS },
  pipelineStages: [...PIPELINE_STAGES],
  issueCodes: [...ISSUE_CODES],
  issueShapeFields: [...ISSUE_SHAPE_FIELDS],
  issueStageAllowlist: [...ISSUE_STAGE_ALLOWLIST],
  resourceDimensions: [...RESOURCE_DIMENSIONS],
  resourceLimits: { ...RESOURCE_LIMITS },
  targetFields: [...TARGET_DESCRIPTOR_FIELDS],
  targetRequiredFields: [...TARGET_DESCRIPTOR_REQUIRED_FIELDS],
  targetSecurityFields: [...TARGET_DESCRIPTOR_SECURITY_FIELDS],
  targetVersionFields: [...TARGET_DESCRIPTOR_VERSION_FIELDS],
  targetDigestFields: [...TARGET_DESCRIPTOR_DIGEST_FIELDS],
  targetInvariants: { ...TARGET_DESCRIPTOR_INVARIANTS },
  targetDescriptorKind: TARGET_DESCRIPTOR_KIND,
  targetKind: TARGET_DESCRIPTOR_TARGET_KIND,
  targetContractVersion: SOURCE_TARGET_CONTRACT_VERSION,
  authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION_REF,
  sourceHandoffKind: SOURCE_HANDOFF_KIND_REF,
  sourceHandoffVersion: SOURCE_HANDOFF_VERSION_REF,
  previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  identityVerifiedSemanticOwner: UPSTREAM_IDENTITY_OWNER,
  selectedArchitecture: UPSTREAM_SELECTED_ARCHITECTURE,
  architectureOneFinal: UPSTREAM_ARCHITECTURE_ONE_FINAL,
  coreEnvelopeIdentityVerifiedInvariant: ENVELOPE_INVARIANTS.identityVerified,
  builderContractVersion: SOURCE_BUILDER_CONTRACT_VERSION,
  coreEnvelopeV2Version: SOURCE_CORE_ENVELOPE_V2_VERSION,
  bridgeVersion: SOURCE_BRIDGE_VERSION,
  factoryResultKeys: [...EXPECTED_FACTORY_RESULT_KEYS],
});

/** The exact key set the public index is allowed to expose. Verified by a dedicated test and gate check. */
export const PUBLIC_INDEX_EXPORT_ALLOWLIST = deepFreeze([
  'BUILDER_MANUAL_GATE', 'BUILDER_MODE', 'BUILDER_NAME', 'BUILDER_SEMVER', 'BUILDER_VERSION', 'CORE_ALLOWLIST',
  'CORE_FIELD_COUNT', 'DECISION_KIND', 'DECISION_STATUSES', 'DECISION_SUCCESS_STATUS', 'DEFAULT_BUILDER_CONFIG',
  'DIGEST_FIELD', 'ELIGIBILITY_FIELDS', 'ENVELOPE_FIELDS', 'ENVELOPE_INVARIANTS', 'ENVELOPE_KIND',
  'ENVELOPE_VERSION_TAG', 'FORBIDDEN_CONFIG_OVERRIDE_KEYS', 'FUTURE_BUILDER_FACTORY', 'ISSUE_CODES',
  'ISSUE_SEVERITIES', 'MAK_STUDIO_CORE_ENVELOPE_BUILDER_FLAG', 'MAX_STRUCTURE_DEPTH', 'PIPELINE_STAGES',
  'PROTOTYPE_POLLUTION_KEYS', 'REPLAY_IDEMPOTENCY', 'REQUIRED_SOURCE_FIELDS', 'RESOURCE_DIMENSIONS',
  'RESOURCE_LIMITS', 'SOURCE_BRIDGE_VERSION', 'SOURCE_BUILDER_CONTRACT_VERSION', 'SOURCE_CORE_ENVELOPE_V2_VERSION',
  'SOURCE_ENVELOPE_V1_VERSION', 'SOURCE_FIELDS', 'STATUS_READY', 'STATUS_REJECTED',
  'BUILDER_ALWAYS_STRICT', 'BUILDER_CONFIG_ALLOWED_KEYS',
  'coreAllowlistIsSourceMinusDigest', 'createBridgeDecisionCoreEnvelopeBuilder', 'createBuilderDiagnostics',
  'createBuilderManifest', 'createBuilderReadiness', 'default', 'isProductionEnv',
  'isStudioCoreEnvelopeBuilderEnabled', 'verifyBuilderCompatibility',
]);

/**
 * INTERNAL (not on the public index): evaluates a candidate snapshot against the REAL upstreams and returns the
 * blocker list. EVERY comparison is EXACT — set/order equality for lists and full key+value equality for maps
 * (an EXTRA key in `envelopeInvariants`, `resourceLimits` or `targetInvariants` is a blocker, not a pass). There is
 * no partial-containment comparison anywhere: subset, superset, divergent order, extra key, missing key and
 * divergent value are all blockers.
 */
export function evaluateBuilderCompatibilitySnapshot(snapshot) {
  const s = snapshot || {};
  const blockers = [];
  const list = (v) => (Array.isArray(v) ? v : []);
  const map = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

  // Source.
  if (!sameOrder(list(s.sourceFields), REAL_SOURCE_BRIDGE_DECISION_FIELDS)) blockers.push('source_fields_diverge');
  if (!sameSet(list(s.requiredSourceFields), REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS)) blockers.push('required_source_fields_diverge');
  if (!sameSet(list(s.eligibilityFields), SOURCE_SUCCESS_ELIGIBILITY_FIELDS)) blockers.push('eligibility_fields_diverge');
  if (!sameSet(list(s.sourceSecurityFields), SOURCE_SECURITY_FIELDS)) blockers.push('source_security_fields_diverge');
  // Core allowlist.
  if (!sameSet(list(s.coreAllowlist), DECISION_DIGEST_PREIMAGE_FIELDS)) blockers.push('core_allowlist_diverges');
  if (!coreAllowlistIsSourceMinusDigest()) blockers.push('allowlist_not_source_minus_digest');
  // Envelope — fields by ORDER, invariants by EXACT map (extra key included).
  if (!sameOrder(list(s.envelopeFields), OUTPUT_CORE_ENVELOPE_FIELDS)) blockers.push('envelope_fields_diverge');
  if (!sameMap(map(s.envelopeInvariants), OUTPUT_CORE_ENVELOPE_INVARIANTS)) blockers.push('envelope_invariants_diverge');
  if (map(s.envelopeInvariants).identityVerified !== false) blockers.push('envelope_identity_verified_not_false');
  // Pipeline ORDER.
  if (!sameOrder(list(s.pipelineStages), BUILDER_PIPELINE_STAGES)) blockers.push('pipeline_order_diverges');
  // Issue model.
  if (!sameSet(list(s.issueCodes), BUILDER_ISSUE_CODES)) blockers.push('issue_codes_diverge');
  if (!sameOrder(list(s.issueShapeFields), ISSUE_MODEL_CONTRACT.issueShapeFields)) blockers.push('issue_shape_diverges');
  if (!sameOrder(list(s.issueStageAllowlist), [...BUILDER_PIPELINE_STAGES, 'config_normalization', 'public_boundary'])) blockers.push('issue_stage_allowlist_diverges');
  // Resource dimensions AND values — values by EXACT map (extra key included).
  if (!sameOrder(list(s.resourceDimensions), RESOURCE_DIMENSION_NAMES)) blockers.push('resource_dimensions_diverge');
  const expectedLimits = {};
  for (const d of RESOURCE_LIMITS_CONTRACT.dimensions) expectedLimits[d.dimension] = d.builderLimit;
  if (!sameMap(map(s.resourceLimits), expectedLimits)) blockers.push('resource_limits_diverge');
  // Target descriptor — EXACT against every upstream that describes it.
  if (!sameOrder(list(s.targetFields), REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge');
  if (!sameSet(list(s.targetFields), OUTPUT_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge_from_builder_contract');
  if (!sameSet(list(s.targetFields), REAL_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge_from_identity_contract');
  if (!sameOrder(list(s.targetRequiredFields), REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_required_fields_diverge');
  if (!sameOrder(list(s.targetSecurityFields), SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_security_fields_diverge');
  if (!sameOrder(list(s.targetVersionFields), VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_version_fields_diverge');
  if (!sameOrder(list(s.targetDigestFields), DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_digest_fields_diverge');
  if (!sameMap(map(s.targetInvariants), REAL_TARGET_DESCRIPTOR_INVARIANTS)) blockers.push('target_invariants_diverge');
  // Target identity/version tuple — EXACT values.
  if (s.targetDescriptorKind !== UPSTREAM_TARGET_DESCRIPTOR_KIND) blockers.push('target_descriptor_kind_diverges');
  if (s.targetKind !== SOURCE_TARGET_SANDBOX_KIND) blockers.push('target_kind_diverges');
  if (s.targetContractVersion !== UPSTREAM_TARGET_CONTRACT_VERSION) blockers.push('target_contract_version_diverges');
  if (s.authoringRuntimeVersion !== UPSTREAM_AUTHORING_RUNTIME_VERSION) blockers.push('authoring_runtime_version_diverges');
  if (s.previewSandboxContractVersion !== UPSTREAM_PREVIEW_SANDBOX_CONTRACT_VERSION) blockers.push('preview_sandbox_contract_version_diverges');
  if (s.sourceHandoffKind !== UPSTREAM_SOURCE_HANDOFF_KIND) blockers.push('source_handoff_kind_diverges');
  if (s.sourceHandoffVersion !== UPSTREAM_SOURCE_HANDOFF_VERSION) blockers.push('source_handoff_version_diverges');
  // Identity architecture — DERIVED from the upstream contract, never asserted locally.
  if (s.identityVerifiedSemanticOwner !== UPSTREAM_IDENTITY_OWNER) blockers.push('identity_owner_diverges');
  if (s.selectedArchitecture !== UPSTREAM_SELECTED_ARCHITECTURE) blockers.push('selected_architecture_diverges');
  if (s.architectureOneFinal !== UPSTREAM_ARCHITECTURE_ONE_FINAL) blockers.push('architecture_one_final_diverges');
  if (s.coreEnvelopeIdentityVerifiedInvariant !== UPSTREAM_ENVELOPE_IDENTITY_VERIFIED) blockers.push('core_envelope_identity_verified_invariant_diverges');
  // Upstream contract versions — EXACT values, not merely "is a string".
  if (s.builderContractVersion !== BUILDER_CONTRACT_VERSION) blockers.push('builder_contract_version_diverges');
  if (s.coreEnvelopeV2Version !== SOURCE_CORE_ENVELOPE_CONTRACT_VERSION) blockers.push('core_envelope_v2_version_diverges');
  if (s.bridgeVersion !== UPSTREAM_BRIDGE_RUNTIME_VERSION) blockers.push('bridge_version_diverges');
  // Factory surface declared by the snapshot.
  if (!sameOrder(list(s.factoryResultKeys), EXPECTED_FACTORY_RESULT_KEYS)) blockers.push('factory_result_keys_diverge');
  return blockers;
}

/**
 * Fail-closed compatibility verifier. Compares EXACT sets/orders/values against the real upstreams — never subsets,
 * never counts. Three separate assertions are reported instead of one blurred claim:
 *   - `contractSnapshotExact`   — every declared list/map/value matches its upstream exactly;
 *   - `factorySurfaceExact`     — the live factory result exposes exactly `{ build }`;
 *   - `publicIndexSurfaceVerifiedByDedicatedTestAndGate` — the public index key set is asserted against
 *     `PUBLIC_INDEX_EXPORT_ALLOWLIST` by a dedicated test and gate check, NOT here (importing the index from inside
 *     the verifier would create a module cycle).
 */
export function verifyBuilderCompatibility() {
  const snapshotBlockers = evaluateBuilderCompatibilitySnapshot(BUILDER_COMPATIBILITY_SNAPSHOT);
  const blockers = [...snapshotBlockers];
  let factorySurfaceExact = false;
  try {
    const keys = Object.keys(createBridgeDecisionCoreEnvelopeBuilder());
    factorySurfaceExact = sameOrder(keys, EXPECTED_FACTORY_RESULT_KEYS);
    if (!factorySurfaceExact) blockers.push('factory_surface_diverges');
  } catch { blockers.push('factory_threw'); }

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'builder-compatibility',
    builderVersion: BUILDER_VERSION,
    compatibleWithBuilderContract: SOURCE_BUILDER_CONTRACT_VERSION === BUILDER_CONTRACT_VERSION,
    compatibleWithCoreEnvelopeContractV2: SOURCE_CORE_ENVELOPE_V2_VERSION === SOURCE_CORE_ENVELOPE_CONTRACT_VERSION,
    compatibleWithHardenedBridge: SOURCE_BRIDGE_VERSION === UPSTREAM_BRIDGE_RUNTIME_VERSION,
    identityVerifiedSemanticOwner: UPSTREAM_IDENTITY_OWNER,
    selectedArchitecture: UPSTREAM_SELECTED_ARCHITECTURE,
    architectureOneFinal: UPSTREAM_ARCHITECTURE_ONE_FINAL,
    coreEnvelopeIdentityVerifiedInvariant: ENVELOPE_INVARIANTS.identityVerified,
    consumerRuntimeImplemented: false,
    previewRuntimeImplemented: false,
    // Separate, non-overlapping claims.
    contractSnapshotExact: snapshotBlockers.length === 0,
    factorySurfaceExact,
    publicIndexSurfaceVerifiedByDedicatedTestAndGate: true,
    exactComparisonsPerformed: true,
    subsetComparisonsPerformed: false,
    ok, valid: ok, blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
    status: ok ? 'bridge_decision_core_envelope_builder_ready_for_enterprise_audit' : 'bridge_decision_core_envelope_builder_incompatible',
  });
}
export default verifyBuilderCompatibility;
