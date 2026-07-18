import { TARGET_SANDBOX_KIND, PREVIEW_SANDBOX_CONTRACT_VERSION, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * TARGET DESCRIPTOR CONSTRUCTION PLAN — plans (does not build) the synthetic Module Preview Sandbox
 * target descriptor. Synthetic-only, metadata-only: no real payload, no mount, no route/menu, no product
 * exposure, no module generation, no persistence. Metadata only. @returns {Object}
 */
export function createTargetDescriptorConstructionPlan() {
  const core = {
    kind: 'bridge-target-descriptor-construction-plan',
    targetDescriptorConstructionPlanned: true,
    targetDescriptorBuilderImplemented: false,
    targetKind: TARGET_SANDBOX_KIND,
    targetContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    syntheticOnly: true,
    metadataOnly: true,
    targetPayloadCreated: false,
    previewMounted: false,
    routeCreated: false,
    menuCreated: false,
    productExposed: false,
    realDataAttached: false,
    moduleGenerated: false,
    persistenceAllowed: false,
  };
  return safeCloneGenericModel({ ...core, targetDescriptorConstructionPlanDigest: bridgePlanDigest(core) });
}

export default createTargetDescriptorConstructionPlan;
