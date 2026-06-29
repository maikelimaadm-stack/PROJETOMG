import { defineSearchService } from "../contracts/serviceContracts.js";

export function createStubSearchService(overrides = {}) {
  return defineSearchService({
    search: async () => [],
    clearIndex: () => {},
    ...overrides,
  });
}

export default createStubSearchService;
