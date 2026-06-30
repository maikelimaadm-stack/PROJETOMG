import { defineAssetService } from "../contracts/serviceContracts.js";

export function createStubAssetService(overrides = {}) {
  return defineAssetService({
    listAssets: async () => [],
    getAsset: async () => null,
    ...overrides,
  });
}

export default createStubAssetService;
