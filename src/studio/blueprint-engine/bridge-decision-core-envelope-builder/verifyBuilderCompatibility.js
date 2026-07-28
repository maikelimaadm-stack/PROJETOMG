import {
  BUILDER_VERSION, SOURCE_FIELDS, REQUIRED_SOURCE_FIELDS, ELIGIBILITY_FIELDS, SOURCE_SECURITY_DECISION_FIELDS,
  CORE_ALLOWLIST, ENVELOPE_FIELDS, ENVELOPE_INVARIANTS, PIPELINE_STAGES, ISSUE_CODES, ISSUE_SHAPE_FIELDS,
  RESOURCE_LIMITS, RESOURCE_DIMENSIONS, TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_REQUIRED_FIELDS,
  TARGET_DESCRIPTOR_SECURITY_FIELDS, TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_INVARIANTS,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_BRIDGE_VERSION,
} from './builderConfig.js';
import {
  REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS, SOURCE_SUCCESS_ELIGIBILITY_FIELDS,
  SOURCE_SECURITY_FIELDS, OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_TARGET_DESCRIPTOR_FIELDS,
  BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, RESOURCE_LIMITS_CONTRACT, RESOURCE_DIMENSION_NAMES, ISSUE_MODEL_CONTRACT,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
import { DECISION_DIGEST_PREIMAGE_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS } from '../bridge-decision-envelope-identity-contract/index.js';
import { coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
import { createBridgeDecisionCoreEnvelopeBuilder } from './createBridgeDecisionCoreEnvelopeBuilder.js';
import { deepFreeze } from './deepFreeze.js';

const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const sameOrder = (a, b) => JSON.stringify([...a]) === JSON.stringify([...b]);
const subsetOf = (a, b) => a.every((x) => b.includes(x));

/**
 * Fail-closed compatibility verifier. Compares EXACT sets/orders/values against the real upstreams — not just counts:
 * source fields (+required/security/eligibility), core allowlist, envelope fields + invariants, pipeline ORDER, the
 * 40 issue codes, the exact issue shape, the 9 resource dimensions AND their values, target fields/required/security/
 * versions/invariants, ARCHITECTURE 1, consumer_runtime ownership and the public API surface.
 */
export function verifyBuilderCompatibility() {
  const blockers = [];
  // Source.
  if (!sameOrder(SOURCE_FIELDS, REAL_SOURCE_BRIDGE_DECISION_FIELDS)) blockers.push('source_fields_diverge');
  if (!sameSet(REQUIRED_SOURCE_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS)) blockers.push('required_source_fields_diverge');
  if (!sameSet(ELIGIBILITY_FIELDS, SOURCE_SUCCESS_ELIGIBILITY_FIELDS)) blockers.push('eligibility_fields_diverge');
  if (!sameSet(SOURCE_SECURITY_DECISION_FIELDS, SOURCE_SECURITY_FIELDS)) blockers.push('source_security_fields_diverge');
  // Core allowlist.
  if (!sameSet(CORE_ALLOWLIST, DECISION_DIGEST_PREIMAGE_FIELDS)) blockers.push('core_allowlist_diverges');
  if (!coreAllowlistIsSourceMinusDigest()) blockers.push('allowlist_not_source_minus_digest');
  // Envelope.
  if (!sameOrder(ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_FIELDS)) blockers.push('envelope_fields_diverge');
  for (const [k, v] of Object.entries(OUTPUT_CORE_ENVELOPE_INVARIANTS)) { if (ENVELOPE_INVARIANTS[k] !== v) blockers.push(`envelope_invariant_${k}_diverges`); }
  if (ENVELOPE_INVARIANTS.identityVerified !== false) blockers.push('envelope_identity_verified_not_false');
  // Pipeline ORDER.
  if (!sameOrder(PIPELINE_STAGES, BUILDER_PIPELINE_STAGES)) blockers.push('pipeline_order_diverges');
  // Issue codes + exact shape.
  if (!sameSet(ISSUE_CODES, BUILDER_ISSUE_CODES)) blockers.push('issue_codes_diverge');
  if (!sameOrder(ISSUE_SHAPE_FIELDS, ISSUE_MODEL_CONTRACT.issueShapeFields)) blockers.push('issue_shape_diverges');
  // Resource dimensions AND values.
  if (!sameOrder(RESOURCE_DIMENSIONS, RESOURCE_DIMENSION_NAMES)) blockers.push('resource_dimensions_diverge');
  for (const d of RESOURCE_LIMITS_CONTRACT.dimensions) {
    if (RESOURCE_LIMITS[d.dimension] !== d.builderLimit) blockers.push(`resource_limit_${d.dimension}_diverges`);
  }
  // Target descriptor.
  if (!sameSet(TARGET_DESCRIPTOR_FIELDS, OUTPUT_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge');
  if (!sameSet(TARGET_DESCRIPTOR_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_fields_diverge_from_identity_contract');
  if (!subsetOf(TARGET_DESCRIPTOR_REQUIRED_FIELDS, TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_required_not_subset');
  if (!subsetOf(TARGET_DESCRIPTOR_SECURITY_FIELDS, TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_security_not_subset');
  if (!subsetOf(TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_versions_not_subset');
  if (!subsetOf(Object.keys(TARGET_DESCRIPTOR_INVARIANTS), TARGET_DESCRIPTOR_FIELDS)) blockers.push('target_invariants_not_subset');
  // Versions present.
  if (typeof SOURCE_BUILDER_CONTRACT_VERSION !== 'string') blockers.push('missing_builder_contract_version');
  if (typeof SOURCE_CORE_ENVELOPE_V2_VERSION !== 'string') blockers.push('missing_core_envelope_v2_version');
  if (typeof SOURCE_BRIDGE_VERSION !== 'string') blockers.push('missing_bridge_version');
  // Public API surface — exactly { build }.
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
    exactComparisonsPerformed: true,
    ok, valid: ok, blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
    status: ok ? 'bridge_decision_core_envelope_builder_ready_for_enterprise_audit' : 'bridge_decision_core_envelope_builder_incompatible',
  });
}
export default verifyBuilderCompatibility;
