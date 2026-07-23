import {
  PLAN_VERSION, B_RECOMPUTE_INPUT, SOURCE_ENVELOPE_PLAN, PHASE_IDS, FUTURE_FILE_NAMES,
  createStudioBridgeToPreviewSandboxRuntimeImplementationPlan,
} from '../bridge-to-preview-sandbox-runtime-implementation-plan/index.js';
import { createAmendmentDigest } from './createAmendmentDigest.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Captures the REAL merged Implementation Plan (#489) READ-ONLY — its version, the historical Option A recompute
 * assumption, the 32/3/29 gap, the v1 envelope kind, phases, file map and its manifest digest. No value invented.
 */
const PLAN = createStudioBridgeToPreviewSandboxRuntimeImplementationPlan();
export const SOURCE_PLAN_TRACEABILITY = deepFreeze({
  kind: 'source-plan-traceability',
  originalPlanVersion: PLAN_VERSION,
  originalPlanReadiness: PLAN.readiness,
  originalSelectedRecomputeOption: B_RECOMPUTE_INPUT.selectedOption, // 'A'
  originalBRecomputeResolvedByPlan: B_RECOMPUTE_INPUT.resolvedByPlan, // false
  originalRequiredPreimageFieldCount: B_RECOMPUTE_INPUT.requiredPreimageFieldCount, // 32
  originalAvailablePreimageFieldCount: B_RECOMPUTE_INPUT.availablePreimageFieldCount, // 3
  originalMissingPreimageFieldCount: B_RECOMPUTE_INPUT.missingPreimageFieldCount, // 29
  originalSourceEnvelopeKind: SOURCE_ENVELOPE_PLAN.inputName, // BridgeDecisionIdentityEnvelope
  originalPhaseCount: PHASE_IDS.length, // 18
  originalPhaseIds: [...PHASE_IDS],
  originalFutureFileCount: FUTURE_FILE_NAMES.length, // 27
  originalReadyForRuntimeImplementation: PLAN.readyForRuntimeImplementation, // false
  sourcePlanOverallDigest: PLAN.manifest.overallDigest,
  sourcePlanOverallDigestRecomputed: createAmendmentDigest({ v: PLAN.manifest.overallDigest }) !== null,
});
export default SOURCE_PLAN_TRACEABILITY;
