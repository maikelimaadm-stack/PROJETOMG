/**
 * Field Studio — Studio Type System consumer (Program 2.3.4)
 * First designer consumer; no local type registry or inference.
 */
import { createTypeSystem } from "@/studio/typeSystem/index.js";
import { BUSINESS_FIELD_TYPES } from "../businessTypes/businessTypeCatalog.js";

let fieldTypeSystem = null;

export function getFieldTypeSystem() {
  if (!fieldTypeSystem) {
    fieldTypeSystem = createTypeSystem();
    BUSINESS_FIELD_TYPES.forEach((bt) => {
      fieldTypeSystem.registry.business.register({
        businessTypeId: bt.businessTypeId,
        label: bt.label,
        targetEntityHint: bt.targetEntityHint,
        baseType: "reference",
        aiHints: bt.aiReady ? [`AI-ready business type: ${bt.businessTypeId}.`] : [],
      });
    });
  }
  return fieldTypeSystem;
}

/** Resolve MDP field type to official Studio type id. */
export function resolveFieldStudioType(field) {
  const typeSystem = getFieldTypeSystem();
  return typeSystem.resolveFieldType(field.fieldType, field.businessTypeId ?? null);
}

/** Validate field semantic type (default value, compatibility). */
export function validateFieldSemanticType(field) {
  return getFieldTypeSystem().validation.validateField(field);
}

/** Build expression context variable types via official Type System. */
export function mapFieldTypeForExpression(fieldType, businessTypeId = null) {
  const typeSystem = getFieldTypeSystem();
  const resolved = typeSystem.resolveFieldType(fieldType, businessTypeId);
  if (resolved === "reference" || resolved === "enum") return "unknown";
  if (resolved === "text") return "string";
  return resolved;
}

export default getFieldTypeSystem;
