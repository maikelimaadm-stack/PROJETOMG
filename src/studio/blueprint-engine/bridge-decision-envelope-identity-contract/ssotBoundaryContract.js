import { deepFreeze } from './deepFreeze.js';
export const SSOT_BOUNDARY_CONTRACT = deepFreeze({
  kind: 'envelope-ssot-boundary-contract',
  bridgeDecisionIsCanonical: false, targetDescriptorIsCanonical: false, envelopeIsCanonical: false,
  certifiedBlueprintRemainsSsot: true, envelopeMayCertify: false, envelopeMayPublish: false, envelopeMayRegister: false,
  envelopeMayGenerateModule: false, envelopeMayExposeProduct: false,
});
export default SSOT_BOUNDARY_CONTRACT;
