import { deepFreeze } from './deepFreeze.js';
/** SSOT boundary (declared). Certified blueprint remains SSOT; decision/core/envelope are NOT canonical. */
export const SSOT_BOUNDARY_CONTRACT = deepFreeze({
  kind: 'core-envelope-ssot-boundary-contract',
  certifiedBlueprintRemainsSsot: true,
  bridgeDecisionIsCanonical: false, coreIsCanonical: false, envelopeIsCanonical: false,
  envelopeMayCertify: false, envelopeMayGenerateModule: false, envelopeMayExposeProduct: false,
});
export default SSOT_BOUNDARY_CONTRACT;
