import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Records UPSTREAM RUNTIME HARDENING NOTES — observations about the Authoring Runtime that the future
 * bridge must account for (strict draft id, reject unknown resource dimensions, FNV internal-only). It
 * does NOT alter the runtime. Metadata only. @returns {Object}
 */
export function createBridgeUpstreamHardeningNotes() {
  const core = {
    kind: 'bridge-upstream-hardening-notes',
    runtimeSingleDraftFallbackObserved: true,
    bridgeRequiresExplicitDraftId: true,
    runtimeUnknownResourceDimensionLeniencyObserved: true,
    bridgeRejectsUnknownResourceDimensions: true,
    fnv1aInternalOnly: true,
    hardeningRequiredBeforeBridgeContract: false,
    hardeningRequiredBeforeBridgeImplementation: false,
    hardeningRequiredBeforeCertificationOrProduction: true,
    runtimeAlteredByThisSlice: false,
  };
  return safeCloneGenericModel({ ...core, upstreamHardeningNotesDigest: bridgeDigest(core) });
}

export default createBridgeUpstreamHardeningNotes;
