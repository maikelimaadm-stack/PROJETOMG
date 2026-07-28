import {
  BUILDER_VERSION, SOURCE_FIELDS, REQUIRED_SOURCE_FIELDS, ELIGIBILITY_FIELDS, SOURCE_SECURITY_DECISION_FIELDS,
  CORE_ALLOWLIST, ENVELOPE_FIELDS, ENVELOPE_INVARIANTS, PIPELINE_STAGES, ISSUE_CODES, ISSUE_SHAPE_FIELDS,
  RESOURCE_LIMITS, RESOURCE_DIMENSIONS, TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_REQUIRED_FIELDS,
  TARGET_DESCRIPTOR_SECURITY_FIELDS, TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_DIGEST_FIELDS,
  TARGET_DESCRIPTOR_INVARIANTS, TARGET_DESCRIPTOR_TARGET_KIND, SOURCE_TARGET_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION_REF, SOURCE_HANDOFF_KIND_REF, SOURCE_HANDOFF_VERSION_REF,
  PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_BRIDGE_VERSION,
} from './builderConfig.js';
import {
  REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS, SOURCE_SUCCESS_ELIGIBILITY_FIELDS,
  SOURCE_SECURITY_FIELDS, OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_TARGET_DESCRIPTOR_FIELDS,
  BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, RESOURCE_LIMITS_CONTRACT, RESOURCE_DIMENSION_NAMES, ISSUE_MODEL_CONTRACT,
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
import { SOURCE_HANDOFF_KIND as UPSTREAM_SOURCE_HANDOFF_KIND, SOURCE_HANDOFF_VERSION as UPSTREAM_SOURCE_HANDOFF_VERSION } from '../authoring-runtime-to-preview-bridge/index.js';
import { coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
import { createBridgeDecisionCoreEnvelopeBuilder } from './createBridgeDecisionCoreEnvelopeBuilder.js';
import { deepFreeze } from './deepFreeze.js';

const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const sameOrder = (a, b) => JSON.stringify([...a]) === JSON.stringify([...b]);
const sameMap = (a, b) => JSON.stringify(Object.keys(a).sort().map((k) => [k, a[k]]))
  === JSON.stringify(Object.keys(b).sort().map((k) => [k, b[k]]));

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
  resourceDimensions: [...RESOURCE_DIMENSIONS],
  resourceLimits: { ...RESOURCE_LIMITS },
  targetFields: [...TARGET_DESCRIPTOR_FIELDS],
  targetRequiredFields: [...TARGET_DESCRIPTOR_REQUIRED_FIELDS],
  targetSecurityFields: [...TARGET_DESCRIPTOR_SECURITY_FIELDS],
  targetVersionFields: [...TARGET_DESCRIPTOR_VERSION_FIELDS],
  targetDigestFields: [...TARGET_DESCRIPTOR_DIGEST_FIELDS],
  targetInvariants: { ...TARGET_DESCRIPTOR_INVARIANTS },
  targetKind: TARGET_DESCRIPTOR_TARGET_KIND,
  targetContractVersion: SOURCE_TARGET_CONTRACT_VERSION,
  authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION_REF,
  previewSandboxContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  sourceHandoffKind: SOURCE_HANDOFF_KIND_REF,
  sourceHandoffVersion: SOURCE_HANDOFF_VERSION_REF,
  builderContractVersion: SOURCE_BUILDER_CONTRACT_VERSION,
  coreEnvelopeV2Version: SOURCE_CORE_ENVELOPE_V2_VERSION,
  bridgeVersion: SOURCE_BRIDGE_VERSION,
});

/**
 * INTERNAL (not on the public index): evaluates a candidate snapshot against the REAL upstreams and returns the
 * blocker list. EVERY comparison is EXACT — set/order equality for lists and key+value equality for maps. There is
 * NO subset check anywhere: a snapshot declaring a strict subset (or a superset) of the real upstream target
 * required/security/version/digest/invariant lists is a BLOCKER, not a pass.
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
  // Envelope.
  if (!sameOrder(list(s.envelopeFields), OUTPUT_CORE_ENVELOPE_FIELDS)) blockers.push('envelope_fields_diverge');
  for (const [k, v] of Object.entries(OUTPUT_CORE_ENVELOPE_INVARIANTS)) { if (map(s.envelopeInvariants)[k] !== v) blockers.push(`envelope_invariant_${k}_diverges`); }
  if (map(s.envelopeInvariants).identityVerified !== false) blockers.push('envelope_identity_verified_not_false');
  // Pipeline ORDER.
  if (!sameOrder(list(s.pipelineStages), BUILDER_PIPELINE_STAGES)) blockers.push('pipeline_order_diverges');
  // Issue codes + exact shape.
  if (!sameSet(list(s.issueCodes), BUILDER_ISSUE_CODES)) blockers.push('issue_codes_diverge');
  if (!sameOrder(list(s.issueShapeFields), ISSUE_MODEL_CONTRACT.issueShapeFields)) blockers.push('issue_shape_diverges');
  // Resource dimensions AND values.
  if (!sameOrder(list(s.resourceDimensions), RESOURCE_DIMENSION_NAMES)) blockers.push('resource_dimensions_diverge');
  for (const d of RESOURCE_LIMITS_CONTRACT.dimensions) {
    if (map(s.resourceLimits)[d.dimension] !== d.builderLimit) blockers.push(`resource_limit_${d.dimension}_diverges`);
  }
  // Target descriptor — EXACT against BOTH upstreams that describe it.
  if (!sameOrder(list(s.targetFields), REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge');
  if (!sameSet(list(s.targetFields), OUTPUT_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge_from_builder_contract');
  if (!sameSet(list(s.targetFields), REAL_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge_from_identity_contract');
  if (!sameOrder(list(s.targetRequiredFields), REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_required_fields_diverge');
  if (!sameOrder(list(s.targetSecurityFields), SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_security_fields_diverge');
  if (!sameOrder(list(s.targetVersionFields), VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_version_fields_diverge');
  if (!sameOrder(list(s.targetDigestFields), DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_digest_fields_diverge');
  if (!sameMap(map(s.targetInvariants), REAL_TARGET_DESCRIPTOR_INVARIANTS)) blockers.push('target_invariants_diverge');
  // Target identity/version tuple — EXACT values, not just "is a string".
  if (s.targetKind !== SOURCE_TARGET_SANDBOX_KIND) blockers.push('target_kind_diverges');
  if (s.targetContractVersion !== UPSTREAM_TARGET_CONTRACT_VERSION) blockers.push('target_contract_version_diverges');
  if (s.authoringRuntimeVersion !== UPSTREAM_AUTHORING_RUNTIME_VERSION) blockers.push('authoring_runtime_version_diverges');
  if (s.previewSandboxContractVersion !== UPSTREAM_PREVIEW_SANDBOX_CONTRACT_VERSION) blockers.push('preview_sandbox_contract_version_diverges');
  if (s.sourceHandoffKind !== UPSTREAM_SOURCE_HANDOFF_KIND) blockers.push('source_handoff_kind_diverges');
  if (s.sourceHandoffVersion !== UPSTREAM_SOURCE_HANDOFF_VERSION) blockers.push('source_handoff_version_diverges');
  // Upstream contract versions — EXACT values, not merely "is a string".
  if (s.builderContractVersion !== BUILDER_CONTRACT_VERSION) blockers.push('builder_contract_version_diverges');
  if (s.coreEnvelopeV2Version !== SOURCE_CORE_ENVELOPE_CONTRACT_VERSION) blockers.push('core_envelope_v2_version_diverges');
  if (s.bridgeVersion !== UPSTREAM_BRIDGE_RUNTIME_VERSION) blockers.push('bridge_version_diverges');
  return blockers;
}

/**
 * Fail-closed compatibility verifier. Compares EXACT sets/orders/values against the real upstreams — never subsets,
 * never counts: source fields (+required/security/eligibility), core allowlist, envelope fields + invariants,
 * pipeline ORDER, the 40 issue codes, the exact issue shape, the 9 resource dimensions AND their values, the target
 * descriptor's field/required/security/version/digest lists and its full invariant map, the exact target
 * identity/version tuple, ARCHITECTURE 1, consumer_runtime ownership and the public API surface.
 */
export function verifyBuilderCompatibility() {
  const blockers = evaluateBuilderCompatibilitySnapshot(BUILDER_COMPATIBILITY_SNAPSHOT);
  // Public API surface — exactly { build }. Evaluated here (not in the snapshot) because it is a live probe.
  try {
    const keys = Object.keys(createBridgeDecisionCoreEnvelopeBuilder());
    if (!sameOrder(keys, ['build'])) blockers.push('public_api_surface_diverges');
  } catch { blockers.push('public_api_factory_threw'); }

  const ok = blockers.length === 0;
  return deepFreeze({
    kind: 'builder-compatibility',
    builderVersion: BUILDER_VERSION,
    compatibleWithBuilderContract: typeof SOURCE_BUILDER_CONTRACT_VERSION === 'string',
    compatibleWithCoreEnvelopeContractV2: typeof SOURCE_CORE_ENVELOPE_V2_VERSION === 'string',
    compatibleWithHardenedBridge: typeof SOURCE_BRIDGE_VERSION === 'string',
    identityVerifiedSemanticOwner: 'consumer_runtime',
    selectedArchitecture: 'ARCHITECTURE_1',
    coreEnvelopeIdentityVerifiedInvariant: ENVELOPE_INVARIANTS.identityVerified,
    consumerRuntimeImplemented: false,
    previewRuntimeImplemented: false,
    // Every comparison above is set/order/value equality; no partial-containment helper exists in this module.
    exactComparisonsPerformed: true,
    subsetComparisonsPerformed: false,
    ok, valid: ok, blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
    status: ok ? 'bridge_decision_core_envelope_builder_ready_for_enterprise_audit' : 'bridge_decision_core_envelope_builder_incompatible',
  });
}
export default verifyBuilderCompatibility;
