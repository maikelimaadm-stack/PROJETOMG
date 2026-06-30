/** Type Validation Engine — semantic validation (Program 2.3.4) */

export function createTypeValidationEngine(registry, compatibility) {
  const validateValue = (value, typeId) => {
    const issues = [];
    if (!registry?.has?.(typeId) && !registry?.collections?.isCollectionType?.(typeId)) {
      issues.push({ severity: "error", code: "TYPE_UNKNOWN", message: `Unknown type '${typeId}'.` });
      return Object.freeze({ valid: false, issues });
    }

    if (value === null || value === undefined) {
      return Object.freeze({ valid: true, issues: [], nullable: true });
    }

    switch (typeId) {
      case "string":
      case "text":
        if (typeof value !== "string") issues.push({ severity: "error", code: "TYPE_STRING", message: "Expected string." });
        break;
      case "integer":
        if (!Number.isInteger(Number(value))) issues.push({ severity: "error", code: "TYPE_INTEGER", message: "Expected integer." });
        break;
      case "decimal":
      case "currency":
      case "percentage":
        if (typeof value !== "number" && Number.isNaN(Number(value))) {
          issues.push({ severity: "error", code: "TYPE_NUMBER", message: "Expected numeric value." });
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") issues.push({ severity: "error", code: "TYPE_BOOLEAN", message: "Expected boolean." });
        break;
      case "date":
      case "datetime":
      case "time":
        if (typeof value !== "string" && !(value instanceof Date)) {
          issues.push({ severity: "error", code: "TYPE_DATE", message: "Expected date string or Date." });
        }
        break;
      case "collection":
        if (!Array.isArray(value)) issues.push({ severity: "error", code: "TYPE_COLLECTION", message: "Expected array." });
        break;
      case "enum": {
        const enumDef = registry?.enums?.get?.(typeId);
        if (enumDef?.values?.length && !enumDef.values.includes(value)) {
          issues.push({ severity: "error", code: "TYPE_ENUM", message: `Value not in enum.` });
        }
        break;
      }
      default:
        break;
    }

    return Object.freeze({ valid: issues.filter((i) => i.severity === "error").length === 0, issues });
  };

  return Object.freeze({
    validateValue,
    validateAssignment(value, sourceType, targetType) {
      const valueCheck = validateValue(value, sourceType);
      if (!valueCheck.valid) return valueCheck;
      if (!compatibility.canAssign(sourceType, targetType)) {
        return Object.freeze({
          valid: false,
          issues: [
            {
              severity: "error",
              code: "TYPE_INCOMPATIBLE",
              message: `Cannot assign '${sourceType}' to '${targetType}'.`,
            },
          ],
        });
      }
      return Object.freeze({ valid: true, issues: [] });
    },
    validateField(fieldDescriptor) {
      const typeId = registry?.resolveFieldType?.(fieldDescriptor.fieldType, fieldDescriptor.businessTypeId);
      const issues = [];
      if (!typeId) {
        issues.push({ severity: "error", code: "FIELD_TYPE", message: "Field type could not be resolved." });
      }
      if (fieldDescriptor.defaultValue != null && fieldDescriptor.defaultValue !== "") {
        const check = validateValue(fieldDescriptor.defaultValue, typeId);
        issues.push(...check.issues);
      }
      return Object.freeze({
        valid: issues.filter((i) => i.severity === "error").length === 0,
        resolvedType: typeId,
        issues,
      });
    },
  });
}

export default createTypeValidationEngine;
