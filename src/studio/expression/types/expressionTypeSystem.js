/**
 * Expression Type System bridge — delegates to Studio Type System (Program 2.3.4)
 * No parallel inference or compatibility logic.
 */
import { createTypeSystem } from "../../typeSystem/createTypeSystem.js";

export function createExpressionTypeSystem(functionCatalog) {
  const typeSystem = createTypeSystem({ functionCatalog });

  return Object.freeze({
    engine: typeSystem,
    infer(node, context) {
      return typeSystem.inferExpression(node, context);
    },
    isValidType(type) {
      return typeSystem.registry.has(type);
    },
    coerceCompatible(left, right) {
      return typeSystem.areCompatible(left, right);
    },
  });
}

export default createExpressionTypeSystem;
