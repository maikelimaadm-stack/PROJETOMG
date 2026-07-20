import {
  AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, SOURCE_HANDOFF_REQUIRED_FIELDS,
  SOURCE_HANDOFF_SECURITY_FIELDS, SOURCE_HANDOFF_VERSION_FIELDS, SOURCE_HANDOFF_DIGEST_FIELDS,
  REAL_HANDOFF_FIELDS, FORBIDDEN_LEGACY_SOURCE_FIELDS, bridgeDigest,
} from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the SOURCE HANDOFF contract — the shape and strict rules a valid Authoring Runtime
 * `synthetic_preview_candidate` must satisfy, aligned to the REAL handoff shape emitted by
 * `createSyntheticPreviewHandoff`. Metadata only. Uses real field names only: explicit version fields
 * (`handoffVersion`/`runtimeVersion`/`targetSandboxVersion`) and `handoffDigest` — NO aggregated
 * `upstreamVersions`, NO generic `digest`. Strict draft identity is required; the single-draft fallback is
 * forbidden; missing/unknown draft ids fail closed. @returns {Object}
 */
export function createSourceHandoffContract() {
  const requiredAllReal = SOURCE_HANDOFF_REQUIRED_FIELDS.every((f) => REAL_HANDOFF_FIELDS.includes(f));
  const core = {
    kind: 'bridge-source-handoff-contract',
    handoffKind: SOURCE_HANDOFF_KIND,
    sourceRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    realHandoffFields: [...REAL_HANDOFF_FIELDS],
    requiredFields: [...SOURCE_HANDOFF_REQUIRED_FIELDS],
    securityFields: [...SOURCE_HANDOFF_SECURITY_FIELDS],
    versionFields: [...SOURCE_HANDOFF_VERSION_FIELDS],
    digestFields: [...SOURCE_HANDOFF_DIGEST_FIELDS],
    forbiddenLegacySourceFields: [...FORBIDDEN_LEGACY_SOURCE_FIELDS],
    expected: {
      synthetic: true, immutable: true, validated: true, previewPayloadCreated: true,
      previewMounted: false, realDataAttached: false, routeCreated: false, menuCreated: false,
      productExposed: false, ok: true,
    },
    draftIdRequired: true,
    draftRevisionMustBeNonNegativeInteger: true,
    draftDigestRequired: true,
    runtimeVersionRequired: true,
    handoffVersionRequired: true,
    targetSandboxVersionRequired: true,
    handoffDigestRequired: true,
    // Alignment guarantees — real source field names only, no invented aliases.
    realSourceFieldNamesRequired: true,
    legacyInventedSourceFieldAliasesAllowed: false,
    upstreamVersionsSourceFieldAllowed: false,
    genericDigestSourceFieldAllowed: false,
    everyRequiredFieldExistsInRealHandoff: requiredAllReal,
    strictDraftIdentityRequired: true,
    explicitDraftIdRequired: true,
    singleDraftFallbackAllowed: false,
    missingDraftIdFailsClosed: true,
    unknownDraftIdFailsClosed: true,
    ambiguousDraftSelectionAllowed: false,
    bridgeMustValidateDraftIdBeforeAnyRuntimeHelperCall: true,
    bridgeMayInvokeSingleDraftFallback: false,
    bridgeImplementationMustNeverCallFindDraftWithoutExplicitId: true,
    sourceConsumedReadOnly: true,
  };
  return safeCloneGenericModel({ ...core, sourceHandoffContractDigest: bridgeDigest(core) });
}

export default createSourceHandoffContract;
