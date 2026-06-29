export {
  STUDIO_TYPE_SYSTEM_VERSION,
  TYPE_REGISTRY_VERSION,
  OFFICIAL_TYPE_ENGINES,
  PRIMITIVE_TYPE_IDS,
  TYPE_KINDS,
} from "./contracts/typeSystemContracts.js";

export { createTypeRegistry } from "./catalog/typeCatalog.js";
export { createPrimitiveTypes } from "./primitives/primitiveTypes.js";
export { createBusinessTypeDescriptors } from "./business/businessTypeDescriptors.js";
export { createReferenceTypes } from "./reference/referenceTypes.js";
export { createCollectionTypes } from "./collection/collectionTypes.js";
export { createEnumTypes } from "./enum/enumTypes.js";
export { createTypeCompatibilityEngine } from "./compatibility/typeCompatibilityEngine.js";
export { createTypeInferenceEngine } from "./inference/typeInferenceEngine.js";
export { createTypeCoercionEngine } from "./coercion/typeCoercionEngine.js";
export { createTypeValidationEngine } from "./validation/typeValidationEngine.js";
export { buildTypeMetadata, enrichTypeDescriptor } from "./metadata/typeMetadata.js";
export { buildTypeDocumentation } from "./documentation/typeDocumentation.js";
export { createTypeSystem } from "./createTypeSystem.js";
