/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME IMPLEMENTATION PLAN ALIGNMENT AMENDMENT — configuration.
 *
 * AMENDMENT ONLY. Aligns the merged Implementation Plan (#489) to the audited Core Envelope v2 contract (#490).
 * It reflects the REAL merged upstream data READ-ONLY, supersedes the former Option A recompute-input assumption,
 * selects OPTION_B_FULL_BRIDGE_DECISION_CORE, resolves B-RECOMPUTE-INPUT at plan level, declares the new
 * pre-runtime blocker B-CORE-ENVELOPE-BUILDER, and keeps runtime blocked. It modifies NO upstream plan/contract
 * file and implements NO runtime/builder/verifier — every implementation flag is false.
 */
import { PLAN_VERSION as ORIGINAL_PLAN_VERSION_REF } from '../bridge-to-preview-sandbox-runtime-implementation-plan/index.js';
import {
  CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_KIND, CORE_ENVELOPE_VERSION_TAG, CORE_FIELD_COUNT,
} from '../bridge-decision-core-envelope-contract/index.js';

export const AMENDMENT_NAME = 'studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment';
export const AMENDMENT_SEMVER = '1.0.0';
export const AMENDMENT_VERSION = `${AMENDMENT_NAME}@${AMENDMENT_SEMVER}`;
export const AMENDMENT_MODE = 'headless_implementation_plan_alignment_amendment';
export const AMENDMENT_KIND = 'implementation_plan_alignment_amendment';

// Real upstream versions reflected (read-only).
export const SOURCE_PLAN_VERSION = ORIGINAL_PLAN_VERSION_REF;
export const SOURCE_CORE_ENVELOPE_CONTRACT_VERSION = CORE_ENVELOPE_CONTRACT_VERSION;
export const SOURCE_CORE_ENVELOPE_KIND = CORE_ENVELOPE_KIND;
export const SOURCE_CORE_ENVELOPE_VERSION_TAG = CORE_ENVELOPE_VERSION_TAG;
export const SOURCE_CORE_FIELD_COUNT = CORE_FIELD_COUNT;

export const SUPERSEDED_ARCHITECTURE = 'OPTION_A_MINIMUM_PREIMAGE_FIELDS';
export const REPLACEMENT_ARCHITECTURE = 'OPTION_B_FULL_BRIDGE_DECISION_CORE';
export const SUPERSEDED_SOURCE_ENVELOPE_KIND = 'bridge_decision_identity_envelope';
export const REPLACEMENT_SOURCE_ENVELOPE_KIND = 'bridge_decision_core_envelope';

export const AMENDMENT_READINESS_STATES = Object.freeze([
  'studio_bridge_to_preview_sandbox_runtime_plan_alignment_ready_for_enterprise_audit',
  'needs_amendment_fix', 'blocked', 'invalid',
]);

export const AMENDMENT_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, amendmentOnly: true,
  reflectsRealUpstreamShapes: true, upstreamsConsumedReadOnly: true, historicalPlanRemainsImmutable: true,
  sourcePlanFilesModified: false, coreEnvelopeContractFilesModified: false,
  bIdentityClosedByContract: true, bRecomputeInputClosedByContract: true, bRecomputeInputResolvedByPlan: true,
  implementationPlanAlignedToCoreEnvelopeV2: true,
  // Every implementation / runtime / builder capability MUST remain false.
  runtimeImplemented: false, runtimeFactoryImplemented: false, executeImplemented: false,
  coreEnvelopeBuilderImplemented: false, coreExtractorImplemented: false, identityVerificationImplemented: false,
  digestRecomputeImplemented: false, mappingExecutorImplemented: false, sandboxDescriptorBuilderImplemented: false,
  consumerDecisionImplemented: false, validationExecuted: false, previewMounted: false, appTouched: false,
  routeCreated: false, menuCreated: false, sidebarCreated: false, persistenceImplemented: false,
  filesystemWritesUsed: false, backendAccessed: false, prismaAccessed: false, fetchUsed: false, networkUsed: false,
  realDataRead: false, realDataWrite: false, moduleGenerated: false, moduleRegistered: false,
  certificationPerformed: false, productExposed: false, productionAccessed: false, stagingAccessed: false,
  prototypeRelinked: false, permissionModelIntegrated: false, tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
});

export const SOURCE_CHECKPOINT = 'pr_490_post_merge_deep_enterprise_core_envelope_contract_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_CORE_ENVELOPE_CONTRACT_ENTERPRISE_PASS';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_TO_PREVIEW_SANDBOX_RUNTIME_IMPLEMENTATION_PLAN_ALIGNMENT_AMENDMENT';
export const SELECTED_ARCHITECTURE = REPLACEMENT_ARCHITECTURE;
export const CURRENT_SLICE_AUTHORIZATION = 'implementation_plan_alignment_amendment_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_implementation_plan_alignment_amendment_enterprise_audit';

export const MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_FLAG = 'MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT';
export const MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_VERIFY_FLAG = 'MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioPlanAlignmentAmendmentEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioPlanAlignmentAmendmentVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_VERIFY_FLAG] === '1'; } catch { return false; }
}
