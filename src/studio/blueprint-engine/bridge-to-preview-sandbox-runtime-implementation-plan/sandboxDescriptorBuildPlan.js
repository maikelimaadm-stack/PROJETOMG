import { deepFreeze } from './deepFreeze.js';

/**
 * SANDBOX DESCRIPTOR BUILD PLAN — the FUTURE metadata-only sandbox descriptor shape and invariants, reflecting
 * the real bridge-to-sandbox contract. Declaration only; NO descriptor is built.
 */
export const SANDBOX_DESCRIPTOR_BUILD_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-sandbox-descriptor-build-plan',
  descriptorKind: 'module_preview_sandbox_candidate_descriptor',
  invariants: deepFreeze({
    metadataOnly: true, synthetic: true, immutable: true, validated: true,
    previewMounted: false, routeCreated: false, menuCreated: false, productExposed: false,
    realDataAttached: false, moduleGenerated: false, persistenceAllowed: false,
  }),
  builtOnlyAfterPipelineGreen: true,
  noPartialDescriptorOnBlocker: true,
  sandboxDescriptorBuilderImplemented: false,
  sandboxDescriptorCreated: false,
});

export default SANDBOX_DESCRIPTOR_BUILD_PLAN;
