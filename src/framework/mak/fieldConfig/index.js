/** Field Configuration Engine — promovida integralmente do Cadastro de Empresas. */
export {
  buildMakFieldConfigMetadata,
  normalizeMakFieldMetadata,
  MAK_FIELD_METADATA_KEYS,
} from "./buildMakFieldConfigMetadata.js";
export {
  buildMakDynamicFieldsFromMetadata,
  resolveMakFieldType,
} from "./buildMakDynamicFieldsFromMetadata.js";
export {
  buildMakDynamicFieldsWithCustomFields,
} from "./buildMakDynamicFieldsWithCustomFields.js";
export { appendMakCustomDynamicFields } from "./appendMakCustomDynamicFields.js";
export { createMakFieldConfigEngine } from "./createMakFieldConfigEngine.js";
export {
  registerMakFieldConfigEngine,
  getMakFieldConfigEngine,
  listMakFieldConfigEngines,
  hasMakFieldConfigEngine,
} from "./makFieldConfigRegistry.js";
export {
  MAK_FIELD_CERTIFICATION_CATALOG,
  MAK_FIELD_CERTIFICATION_LAYOUT,
} from "./fieldCertificationCatalog.js";
export {
  MAK_FIELD_ENGINE_INVENTORY,
  listMakFieldEngineTypes,
} from "./makFieldEngineInventory.js";

export { FieldEngine } from "@/framework/cadastro-engine/field/FieldEngine.js";
export {
  getFieldTypeDefinition,
  listFieldTypes,
  registerFieldType,
  inferRegisteredLayoutBehavior,
} from "@/framework/cadastro-engine/field/FieldRegistry.js";
export {
  registerBuiltinFieldTypes,
  ensureBuiltinFieldTypes,
} from "@/framework/cadastro-engine/field/registerBuiltinFieldTypes.js";
export { CustomFieldEngine } from "@/framework/cadastro-engine/custom-field/CustomFieldEngine.js";
export { useCustomFieldRenderer } from "@/framework/cadastro-engine/custom-field/CustomFieldRenderer.jsx";
export { RenderEngine } from "@/framework/cadastro-engine/render/RenderEngine.jsx";
export { buildMakStandardDynamicFields } from "@/framework/mak/metadata/buildMakStandardDynamicFields.jsx";
