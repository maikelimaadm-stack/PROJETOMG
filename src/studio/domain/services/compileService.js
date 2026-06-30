import { defineCompileService } from "../contracts/serviceContracts.js";

export function createStubCompileService(overrides = {}) {
  return defineCompileService({
    compileDraft: async () => ({ ok: false }),
    getLastBundle: async () => null,
    ...overrides,
  });
}

export default createStubCompileService;
