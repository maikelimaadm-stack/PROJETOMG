import { deepFreeze } from './deepFreeze.js';
export const SSOT_BOUNDARY_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-ssot-boundary-contract',
  bridgeDescriptorIsCanonical: false, sandboxDescriptorIsCanonical: false, certifiedBlueprintRemainsSsot: true,
  consumerMayCertify: false, consumerMayPublish: false, consumerMayRegister: false, consumerMayGenerateModule: false,
  consumerMayWriteCertifiedBlueprint: false, consumerMayBypassCertification: false,
});
export default SSOT_BOUNDARY_CONTRACT;
