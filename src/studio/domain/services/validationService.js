import { defineValidationService } from "../contracts/serviceContracts.js";

export function createStubValidationService(overrides = {}) {
  return defineValidationService({
    validate: async () => ({ ok: true, errors: [] }),
    getErrorCount: () => 0,
    ...overrides,
  });
}

export default createStubValidationService;
