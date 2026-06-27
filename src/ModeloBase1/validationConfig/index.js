/** Validation Configuration Engine — re-export foundation. */
export {
  createMakValidationConfigEngine,
  createMakValidationConfigEngine as createMakValidationEngine,
} from "@/framework/mak/validation/createMakValidationConfigEngine.js";
export { buildMakValidationConfigMetadata } from "@/framework/mak/validation/buildMakValidationConfigMetadata.js";
export { runMakFormValidation } from "@/framework/mak/validation/runMakFormValidation.js";
export {
  registerMakValidationConfigEngine,
  getMakValidationConfigEngine,
  listMakValidationConfigEngines,
  hasMakValidationConfigEngine,
} from "@/framework/mak/validation/makValidationConfigRegistry.js";
