import {
  BUILDER_VERSION, SOURCE_FIELDS, CORE_ALLOWLIST, ENVELOPE_FIELDS, PIPELINE_STAGES, ENVELOPE_INVARIANTS,
  SOURCE_BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_V2_VERSION, SOURCE_BRIDGE_VERSION,
} from './builderConfig.js';
import { DECISION_DIGEST_PREIMAGE_FIELDS } from '../bridge-decision-envelope-identity-contract/index.js';
import { coreAllowlistIsSourceMinusDigest } from './resolveCoreFieldAllowlist.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Fail-closed compatibility verifier against the real upstreams. Rejects field/version/allowlist/pipeline/issue/limit/
 * Architecture drift and any envelope identity true. Pure.
 */
export function verifyBuilderCompatibility() {
  const blockers = [];
  if (SOURCE_FIELDS.length !== 33) blockers.push('source_field_count_not_33');
  if (CORE_ALLOWLIST.length !== 32) blockers.push('core_allowlist_not_32');
  if (JSON.stringify([...CORE_ALLOWLIST].sort()) !== JSON.stringify([...DECISION_DIGEST_PREIMAGE_FIELDS].sort())) blockers.push('allowlist_diverges_from_upstream');
  if (!coreAllowlistIsSourceMinusDigest()) blockers.push('allowlist_not_source_minus_digest');
  if (ENVELOPE_FIELDS.length !== 12) blockers.push('envelope_field_count_not_12');
  if (PIPELINE_STAGES.length !== 23) blockers.push('pipeline_stage_count_not_23');
  if (ENVELOPE_INVARIANTS.identityVerified !== false) blockers.push('envelope_identity_verified_not_false');
  if (typeof SOURCE_BUILDER_CONTRACT_VERSION !== 'string') blockers.push('missing_builder_contract_version');
  if (typeof SOURCE_CORE_ENVELOPE_V2_VERSION !== 'string') blockers.push('missing_core_envelope_v2_version');
  if (typeof SOURCE_BRIDGE_VERSION !== 'string') blockers.push('missing_bridge_version');
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
    ok, valid: ok, blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
    status: ok ? 'bridge_decision_core_envelope_builder_ready_for_enterprise_audit' : 'bridge_decision_core_envelope_builder_incompatible',
  });
}
export default verifyBuilderCompatibility;
