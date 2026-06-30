import { definePreviewService } from "../contracts/serviceContracts.js";

export function createStubPreviewService(overrides = {}) {
  return definePreviewService({
    getStatus: () => "idle",
    compile: async () => ({ ok: false, reason: "preview-not-implemented" }),
    refresh: () => {},
    ...overrides,
  });
}

export default createStubPreviewService;
