/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER IMPLEMENTATION PLAN — configuration.
 *
 * PLAN ONLY. Declares the headless, deterministic, immutable, fail-closed, dev-only enterprise implementation PLAN
 * for the FUTURE Bridge Decision Core Envelope Builder. It consumes the audited Builder Contract READ-ONLY and
 * implements NO builder — every implementation flag is false; planOnly:true. identityVerified is consumer-owned
 * (ARCHITECTURE 1, final); no Core Envelope Verification State Amendment is required.
 */
export const PLAN_NAME = 'studio-bridge-decision-core-envelope-builder-implementation-plan';
export const PLAN_SEMVER = '1.0.0';
export const PLAN_VERSION = `${PLAN_NAME}@${PLAN_SEMVER}`;
export const PLAN_KIND = 'studio-bridge-decision-core-envelope-builder-implementation-plan';
export const PLAN_MODE = 'headless_bridge_decision_core_envelope_builder_implementation_plan';

export const SELECTED_ARCHITECTURE = 'ARCHITECTURE_1';
export const IDENTITY_VERIFIED_SEMANTIC_OWNER = 'consumer_runtime';

// ---- Future builder runtime subtree (PLANNED; NOT created in this slice). ----
export const FUTURE_BUILDER_RUNTIME_DIR = 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder';
export const FUTURE_BUILDER_FACTORY = 'createBridgeDecisionCoreEnvelopeBuilder';
export const FUTURE_BUILDER_DECISION_STATUSES = Object.freeze(['core_envelope_ready', 'core_envelope_rejected']);

// ---- Provenance (source checkpoint that authorized this plan). ----
export const SOURCE_CHECKPOINT = 'pr_493_post_merge_deep_enterprise_verification_state_correction_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_VERIFICATION_STATE_CORRECTION_ENTERPRISE_PASS';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_DECISION_CORE_ENVELOPE_BUILDER_IMPLEMENTATION_PLAN';
export const CURRENT_SLICE_AUTHORIZATION = 'builder_implementation_plan_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_builder_implementation_plan_enterprise_audit';

export const PLAN_READINESS_STATES = Object.freeze([
  'studio_bridge_decision_core_envelope_builder_implementation_plan_ready_for_enterprise_audit',
  'needs_plan_fix', 'blocked', 'invalid',
]);

// ---- Minimums the FUTURE artifacts must meet (declared; enforced by the future implementation's own gate/test). ----
export const FUTURE_IMPLEMENTATION_MIN_TEST_SCENARIOS = 1050;
export const FUTURE_IMPLEMENTATION_MIN_GATE_CHECKS = 330;

export const PLAN_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, planOnly: true,
  upstreamsConsumedReadOnly: true, ssotPreserved: true, architectureOneFinal: true,
  // Every builder / runtime capability MUST remain false in the plan slice.
  builderFactoryImplemented: false, buildImplemented: false, coreExtractionImplemented: false,
  digestRecomputeImplemented: false, identityVerificationImplemented: false, envelopeConstructionImplemented: false,
  consumerRuntimeImplemented: false, futureRuntimeSubtreeCreated: false, coreEnvelopeVerificationStateAmendmentCreated: false,
  validationExecuted: false, builderExecuted: false, previewMounted: false, appTouched: false, routeCreated: false,
  menuCreated: false, persistenceImplemented: false, backendAccessed: false, prismaAccessed: false, networkUsed: false,
  realDataRead: false, moduleGenerated: false, certificationPerformed: false, productExposed: false,
  productionAccessed: false, permissionModelIntegrated: false, tenantModelIntegrated: false,
});

export const MAK_STUDIO_CORE_ENVELOPE_BUILDER_PLAN_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_BUILDER_PLAN';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeBuilderPlanEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_BUILDER_PLAN_FLAG] === '1'; } catch { return false; }
}
