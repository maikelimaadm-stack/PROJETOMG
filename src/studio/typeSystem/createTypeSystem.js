/**
 * Studio Type System — official facade (Program 2.3.4)
 */
import {
  STUDIO_TYPE_SYSTEM_VERSION,
  OFFICIAL_TYPE_ENGINES,
} from "./contracts/typeSystemContracts.js";
import { createTypeRegistry } from "./catalog/typeCatalog.js";
import { createTypeCompatibilityEngine } from "./compatibility/typeCompatibilityEngine.js";
import { createTypeInferenceEngine } from "./inference/typeInferenceEngine.js";
import { createTypeCoercionEngine } from "./coercion/typeCoercionEngine.js";
import { createTypeValidationEngine } from "./validation/typeValidationEngine.js";
import { buildTypeDocumentation } from "./documentation/typeDocumentation.js";

export function createTypeSystem(options = {}) {
  const registry = createTypeRegistry();
  const compatibility = createTypeCompatibilityEngine(registry);
  const inference = createTypeInferenceEngine(registry, options);
  const coercion = createTypeCoercionEngine(registry, compatibility);
  const validation = createTypeValidationEngine(registry, compatibility);

  return Object.freeze({
    version: STUDIO_TYPE_SYSTEM_VERSION,
    engines: OFFICIAL_TYPE_ENGINES,
    registry,
    compatibility,
    inference,
    coercion,
    validation,
    documentation() {
      return buildTypeDocumentation(registry);
    },
    resolveFieldType(fieldType, businessTypeId) {
      return registry.resolveFieldType(fieldType, businessTypeId);
    },
    inferExpression(node, context) {
      return inference.inferExpression(node, context);
    },
    areCompatible(left, right) {
      return compatibility.areCompatible(left, right);
    },
    validateValue(value, typeId) {
      return validation.validateValue(value, typeId);
    },
    coerce(value, fromType, toType) {
      return coercion.coerce(value, fromType, toType);
    },
    snapshot() {
      return Object.freeze({
        version: STUDIO_TYPE_SYSTEM_VERSION,
        registry: registry.snapshot(),
        documentation: buildTypeDocumentation(registry),
      });
    },
  });
}

export default createTypeSystem;
