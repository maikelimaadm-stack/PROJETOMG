import {
  BRIDGE_NAME, BRIDGE_VERSION, BRIDGE_MODE, BRIDGE_CAPABILITIES, DEFAULT_EXPECTED_VERSIONS,
  DEFAULT_BRIDGE_RESOURCE_LIMITS, SOURCE_CHECKPOINT, SOURCE_DECISION, REQUIRED_FUTURE_CHECKPOINT,
} from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { normalizeBridgeInput, isPlainObject } from './normalizeBridgeInput.js';
import { resolveBridgeLimits } from './enforceBridgeResourceLimits.js';
import { STRICT_DRAFT_IDENTITY_POLICY } from './validateStrictDraftIdentity.js';
import { createBridgeDecision } from './createBridgeDecision.js';
import { createBridgeReplayContract } from './createBridgeReplayContract.js';
import { createBridgeFailureContainment } from './createBridgeFailureContainment.js';
import { createBridgeSsotBoundary } from './createBridgeSsotBoundary.js';
import { createBridgePermissionTenancyBoundary } from './createBridgePermissionTenancyBoundary.js';
import { createBridgeSecuritySafety } from './createBridgeSecuritySafety.js';
import { createBridgePrototypeRelinkProhibition } from './createBridgePrototypeRelinkProhibition.js';
import { createBridgeManualEnablementGate } from './createBridgeManualEnablementGate.js';
import { createBridgeReadinessDecision } from './createBridgeReadinessDecision.js';
import { createBridgeManifest } from './createBridgeManifest.js';
import { verifyAuthoringRuntimeToPreviewBridge } from './verifyAuthoringRuntimeToPreviewBridge.js';
import { checkAuthoringRuntimeToPreviewBridgeCompatibility } from './checkAuthoringRuntimeToPreviewBridgeCompatibility.js';
import { createBridgeDiagnostics } from './createBridgeDiagnostics.js';
import { createAuthoringRuntimeToPreviewBridgeFallback } from './createAuthoringRuntimeToPreviewBridgeFallback.js';

const DIGEST_SEMANTICS = deepFreeze({
  sourceDigestField: 'handoffDigest',
  digestValidationMode: 'recompute_and_compare',
  sourceDigestAlgorithm: 'fnv1a-32',
  sourceDigestPurpose: 'deterministic_internal_identity',
  alternativeSerializerAllowed: false,
  cryptographicIntegrityProvided: false,
  authenticityProvided: false,
  tamperProofProvided: false,
  digestMayAuthorizeCertification: false,
  digestMayAuthorizeModuleGeneration: false,
  digestMayAuthorizeProduction: false,
  cryptographicDigestRequiredBeforeCertification: true,
  cryptographicDigestRequiredBeforeProduction: true,
});
const VERSION_POLICY = deepFreeze({
  exactVersionMatchRequired: true,
  aggregatedUpstreamVersionsFieldRequired: false,
  unknownVersionFailsClosed: true,
  versionDowngradeAllowed: false,
  versionUpgradeAssumedCompatible: false,
  bidirectionalCompatibilityCheckRequired: true,
});

/**
 * Constructs a STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE instance. Headless, deterministic, immutable,
 * fail-closed, side-effect-free. Config is validated + deep-frozen; there is NO global singleton and NO
 * shared mutable state. `execute({ sourceHandoff, expectedDraftId })` returns a deep-frozen decision built
 * atomically from a clone of its inputs (the source is never mutated). Replaying the same config + source +
 * expectedDraftId yields a byte-equivalent decision. On invalid options it returns a safe fallback whose
 * `execute` always rejects. @param {Object} [options] @returns {Object}
 */
export function createStudioAuthoringRuntimeToPreviewBridge(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const expectedVersions = deepFreeze({ ...DEFAULT_EXPECTED_VERSIONS, ...(isPlainObject(o.expectedVersions) ? normalizeBridgeInput(o.expectedVersions) : {}) });
  const { limits: resolvedLimits, issues: limitIssues } = resolveBridgeLimits(o.limits);
  const limits = deepFreeze({ ...DEFAULT_BRIDGE_RESOURCE_LIMITS, ...resolvedLimits });
  const extensionSchemas = deepFreeze(isPlainObject(o.extensionSchemas) ? normalizeBridgeInput(o.extensionSchemas) : {});

  if (limitIssues.length > 0) {
    return createAuthoringRuntimeToPreviewBridgeFallback({ reason: 'invalid_bridge_limits' });
  }

  const replayContract = createBridgeReplayContract();
  const failureContainment = createBridgeFailureContainment();
  const ssotBoundary = createBridgeSsotBoundary();
  const permissionTenancyBoundary = createBridgePermissionTenancyBoundary();
  const securitySafety = createBridgeSecuritySafety();
  const prototypeRelinkProhibition = createBridgePrototypeRelinkProhibition();
  const manualGate = createBridgeManualEnablementGate();
  const compatibility = checkAuthoringRuntimeToPreviewBridgeCompatibility();
  const resourceLimitsPolicy = deepFreeze({
    unknownResourceDimensionRejected: true,
    silentTruncationAllowed: false,
    limitExceededFailsClosed: true,
    bridgeLimitsMayRejectRuntimeValidHandoff: true,
    stricterBridgeLimitsAreIntentional: true,
    sourceAcceptanceDoesNotGuaranteeBridgeAcceptance: true,
    limitMismatchIsNotSilent: true,
    partialTargetDescriptorAllowed: false,
  });

  const blockers = [];
  if (ssotBoundary.certifiedBlueprintRemainsSsot !== true) blockers.push('bridge_ssot_not_preserved');
  if (securitySafety.anyForbiddenSideEffect === true) blockers.push('bridge_security_real_allowed');
  if (manualGate.manualGateRequired !== true) blockers.push('bridge_manual_gate_missing');
  if (STRICT_DRAFT_IDENTITY_POLICY.singleDraftFallbackAllowed === true) blockers.push('bridge_single_draft_fallback');

  const readiness = createBridgeReadinessDecision({ blockers });

  const config = deepFreeze({
    kind: 'bridge-config',
    bridgeName: BRIDGE_NAME,
    bridgeVersion: BRIDGE_VERSION,
    mode: BRIDGE_MODE,
    expectedVersions,
    limits,
    extensionSchemas,
    frozen: true,
  });

  const parts = {
    config, draftIdentityPolicy: STRICT_DRAFT_IDENTITY_POLICY, digestSemantics: DIGEST_SEMANTICS,
    versionPolicy: VERSION_POLICY, resourceLimitsPolicy, replayContract, failureContainment, ssotBoundary,
    permissionTenancyBoundary, securitySafety, prototypeRelinkProhibition, manualGate, readiness,
  };
  const manifest = createBridgeManifest({ parts });

  const base = {
    kind: 'studio-authoring-runtime-to-preview-bridge',
    bridgeName: BRIDGE_NAME,
    bridgeVersion: BRIDGE_VERSION,
    mode: BRIDGE_MODE,
    fallback: false,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceDecision: SOURCE_DECISION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    config,
    draftIdentityPolicy: STRICT_DRAFT_IDENTITY_POLICY,
    digestSemantics: DIGEST_SEMANTICS,
    versionPolicy: VERSION_POLICY,
    resourceLimitsPolicy,
    replayContract,
    failureContainment,
    ssotBoundary,
    permissionTenancyBoundary,
    securitySafety,
    prototypeRelinkProhibition,
    manualGate,
    compatibility,
    readiness: readiness.readiness,
    readinessDecision: readiness,
    manifest,
    readyForHeadlessBridge: readiness.readyForHeadlessBridge === true,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers,
    blockerCount: blockers.length,
    capabilities: { ...BRIDGE_CAPABILITIES },
    metadataOnly: false,
  };
  const verification = verifyAuthoringRuntimeToPreviewBridge({ bridge: base });
  const diagnostics = createBridgeDiagnostics({ verification });

  const bridge = {
    ...base,
    verification,
    diagnostics,
    /**
     * Executes the bridge over a real handoff + explicit expectedDraftId. Returns a deep-frozen decision.
     * @param {Object} input @returns {Object}
     */
    execute(input) {
      const i = isPlainObject(input) ? input : {};
      const sourceHandoff = normalizeBridgeInput(i.sourceHandoff);
      const expectedDraftId = typeof i.expectedDraftId === 'string' ? i.expectedDraftId : i.expectedDraftId;
      return createBridgeDecision({
        sourceHandoff: isPlainObject(sourceHandoff) ? sourceHandoff : {},
        expectedDraftId,
        expectedVersions,
        limits,
        extensions: Array.isArray(i.extensions) ? normalizeBridgeInput(i.extensions) : [],
        extensionSchemas,
      });
    },
  };
  return Object.freeze(bridge);
}

export default createStudioAuthoringRuntimeToPreviewBridge;
