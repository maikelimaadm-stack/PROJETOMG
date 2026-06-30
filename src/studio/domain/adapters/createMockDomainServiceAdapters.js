import {
  defineStudioDomainServices,
  createStubPreviewService,
  createStubPublishService,
  createStubCompileService,
  createStubValidationService,
  createStubAssetService,
  createStubSearchService,
} from "../services/index.js";

/**
 * Creates stub service adapters for prototype / extension points.
 * Production missions swap implementations via this registry.
 * @param {Partial<import("../contracts/serviceContracts.js").StudioDomainServices>} overrides
 */
export function createMockDomainServiceAdapters(overrides = {}) {
  return defineStudioDomainServices({
    previewService: createStubPreviewService(overrides.previewService),
    publishService: createStubPublishService(overrides.publishService),
    compileService: createStubCompileService(overrides.compileService),
    validationService: createStubValidationService(overrides.validationService),
    assetService: createStubAssetService(overrides.assetService),
    searchService: createStubSearchService(overrides.searchService),
  });
}

export default createMockDomainServiceAdapters;
