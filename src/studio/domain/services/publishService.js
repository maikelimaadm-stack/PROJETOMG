import { definePublishService } from "../contracts/serviceContracts.js";

export function createStubPublishService(overrides = {}) {
  return definePublishService({
    getStatus: () => "draft",
    validate: async () => ({ ok: true, errors: [] }),
    publish: async () => ({ ok: false }),
    pinEnvironment: async () => ({ ok: false }),
    ...overrides,
  });
}

export default createStubPublishService;
