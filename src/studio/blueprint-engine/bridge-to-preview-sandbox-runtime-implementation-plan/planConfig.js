/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME IMPLEMENTATION PLAN — configuration.
 *
 * PLAN ONLY. This module declares the headless, deterministic, immutable, fail-closed, dev-only PLAN for the
 * FUTURE Preview Sandbox consumer runtime that will receive the real `{ bridgeDecisionDigest, targetDescriptor }`
 * identity envelope. It reflects the REAL merged upstream contract shapes READ-ONLY (no invented field, digest,
 * version or mapping) and implements NO consumer runtime — every implementation flag is false. Nothing here
 * executes a pipeline, builds an envelope, verifies identity, maps fields, builds a sandbox descriptor or
 * creates a consumer decision. It is metadata for a future, separately-authorized slice.
 */
import {
  REAL_BRIDGE_DECISION_FIELDS, REAL_BRIDGE_DECISION_REQUIRED_FIELDS, DECISION_DIGEST_PREIMAGE_FIELDS,
  REAL_TARGET_DESCRIPTOR_FIELDS, ENVELOPE_FIELDS, ENVELOPE_REQUIRED_FIELDS, ENVELOPE_INVARIANTS,
  ENVELOPE_VALIDATION_STAGES, SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION_REF,
  SOURCE_TARGET_SANDBOX_CONTRACT_VERSION, SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION,
  SOURCE_BLUEPRINT_CONTRACT_VERSION_REF, ENVELOPE_CONTRACT_VERSION,
} from '../bridge-decision-envelope-identity-contract/index.js';
import {
  FIELD_MAPPING_CONTRACT, RESOURCE_LIMIT_CONTRACT, CONTRACT_VERSION as BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION,
} from '../bridge-to-preview-sandbox-runtime-contract/index.js';
import { deepFreeze } from './deepFreeze.js';

export const PLAN_NAME = 'studio-bridge-to-preview-sandbox-runtime-implementation-plan';
export const PLAN_SEMVER = '1.0.0';
export const PLAN_VERSION = `${PLAN_NAME}@${PLAN_SEMVER}`;
export const PLAN_MODE = 'headless_bridge_to_preview_sandbox_runtime_implementation_plan';
export const PLAN_KIND = 'bridge_to_preview_sandbox_runtime_implementation_plan';

// The FUTURE runtime subtree this plan describes. It MUST NOT be created in this slice.
export const FUTURE_RUNTIME_SUBTREE = 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime/';
export const FUTURE_RUNTIME_FACTORY = 'createBridgeToPreviewSandboxRuntime';

// ---- Real upstream contract versions (read-only, reflected — never invented). ----
export const SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION = ENVELOPE_CONTRACT_VERSION;
export const SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION = BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION;
export const SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF = SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION;
export const SOURCE_BRIDGE_RUNTIME_VERSION_REF = SOURCE_BRIDGE_RUNTIME_VERSION;
export const SOURCE_BRIDGE_CONTRACT_VERSION_REF2 = SOURCE_BRIDGE_CONTRACT_VERSION_REF;
export const SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF = SOURCE_TARGET_SANDBOX_CONTRACT_VERSION;
export const SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2 = SOURCE_BLUEPRINT_CONTRACT_VERSION_REF;

// ---- Real upstream shapes reflected read-only (proofs consumed by test + gate). ----
export const REAL_DECISION_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_FIELDS]);
export const REAL_DECISION_REQUIRED_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_REQUIRED_FIELDS]);
export const REAL_DECISION_DIGEST_PREIMAGE_FIELDS = Object.freeze([...DECISION_DIGEST_PREIMAGE_FIELDS]);
export const REAL_TARGET_DESCRIPTOR_FIELDS_REF = Object.freeze([...REAL_TARGET_DESCRIPTOR_FIELDS]);
export const REAL_ENVELOPE_FIELDS = Object.freeze([...ENVELOPE_FIELDS]);
export const REAL_ENVELOPE_REQUIRED_FIELDS = Object.freeze([...ENVELOPE_REQUIRED_FIELDS]);
export const REAL_ENVELOPE_INVARIANTS = deepFreeze({ ...ENVELOPE_INVARIANTS });
export const REAL_ENVELOPE_VALIDATION_STAGES = Object.freeze([...ENVELOPE_VALIDATION_STAGES]);
export const REAL_FIELD_MAPPING_CONTRACT = FIELD_MAPPING_CONTRACT;
export const REAL_MAPPING_COUNT = FIELD_MAPPING_CONTRACT.length;
export const REAL_RESOURCE_LIMIT_CONTRACT = RESOURCE_LIMIT_CONTRACT;

// ---- Consumer decision statuses (future; declared, NOT produced here). ----
export const CONSUMER_DECISION_STATUSES = Object.freeze(['sandbox_candidate_accepted', 'sandbox_candidate_rejected']);

// ---- Transform allowlist reflected from the real mapping contract (no local divergent list). ----
export const TRANSFORM_KINDS = Object.freeze(
  Array.from(new Set(FIELD_MAPPING_CONTRACT.map((m) => m.transformKind))).sort(),
);

export const PLAN_READINESS_STATES = Object.freeze([
  'studio_bridge_to_preview_sandbox_runtime_implementation_plan_ready_for_enterprise_audit',
  'needs_plan_fix', 'blocked', 'invalid',
]);

// ---- Plan capabilities. Every PLAN capability is true; every RUNTIME/consumer capability is false. ----
export const PLAN_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, planOnly: true,
  reflectsRealUpstreamShapes: true, upstreamsConsumedReadOnly: true, bIdentityClosedByContract: true,
  // Everything below is a FUTURE runtime capability and MUST remain false in this plan slice.
  runtimeImplemented: false, runtimeFactoryImplemented: false, executeImplemented: false,
  envelopeBuilderImplemented: false, identityVerificationImplemented: false, pipelineImplemented: false,
  mappingExecutorImplemented: false, sandboxDescriptorBuilderImplemented: false, consumerDecisionImplemented: false,
  validationExecuted: false, sourceDecisionConsumed: false, targetDescriptorConsumed: false, previewPayloadCreated: false,
  previewMounted: false, appTouched: false, routeCreated: false, menuCreated: false, sidebarCreated: false,
  persistenceImplemented: false, filesystemWritesUsed: false, backendAccessed: false, prismaAccessed: false,
  fetchUsed: false, networkUsed: false, realDataRead: false, realDataWrite: false, moduleGenerated: false,
  moduleRegistered: false, certificationPerformed: false, productExposed: false, productionAccessed: false,
  stagingAccessed: false, prototypeRelinked: false, permissionModelIntegrated: false, tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
});

export const SOURCE_CHECKPOINT = 'pr_488_post_merge_deep_enterprise_identity_contract_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_IDENTITY_CONTRACT_ENTERPRISE_PASS';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_TO_PREVIEW_SANDBOX_RUNTIME_IMPLEMENTATION_PLAN';
export const CURRENT_SLICE_AUTHORIZATION = 'bridge_to_preview_sandbox_runtime_implementation_plan_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_bridge_to_preview_sandbox_runtime_implementation_plan_enterprise_audit';

export const MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_FLAG = 'MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN';
export const MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_VERIFY_FLAG = 'MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioBridgeSandboxRuntimePlanEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioBridgeSandboxRuntimePlanVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_VERIFY_FLAG] === '1'; } catch { return false; }
}
