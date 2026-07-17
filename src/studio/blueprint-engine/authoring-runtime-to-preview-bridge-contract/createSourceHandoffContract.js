import { AUTHORING_RUNTIME_VERSION, SOURCE_HANDOFF_KIND, CRITICAL_SOURCE_FIELDS, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the SOURCE HANDOFF contract — the shape and strict rules a valid Authoring Runtime
 * `synthetic_preview_candidate` must satisfy. Metadata only. Strict draft identity is required; the
 * single-draft fallback is forbidden; missing/unknown draft ids fail closed. @returns {Object}
 */
export function createSourceHandoffContract() {
  const core = {
    kind: 'bridge-source-handoff-contract',
    handoffKind: SOURCE_HANDOFF_KIND,
    sourceRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    requiredFields: [...CRITICAL_SOURCE_FIELDS],
    expected: {
      synthetic: true, immutable: true, validated: true, previewPayloadCreated: true,
      previewMounted: false, realDataAttached: false, routeCreated: false, menuCreated: false,
      productExposed: false,
    },
    draftIdRequired: true,
    draftRevisionMustBeNonNegativeInteger: true,
    draftDigestRequired: true,
    runtimeVersionRequired: true,
    upstreamVersionsRequired: true,
    digestRequired: true,
    strictDraftIdentityRequired: true,
    singleDraftFallbackAllowed: false,
    missingDraftIdFailsClosed: true,
    unknownDraftIdFailsClosed: true,
    sourceConsumedReadOnly: true,
  };
  return safeCloneGenericModel({ ...core, sourceHandoffContractDigest: bridgeDigest(core) });
}

export default createSourceHandoffContract;
