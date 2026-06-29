/** Type Compatibility Engine — official single implementation (Program 2.3.4) */

const NUMERIC = new Set(["integer", "decimal", "currency", "percentage"]);
const TEXTUAL = new Set(["string", "text"]);
const TEMPORAL = new Set(["date", "datetime", "time", "duration"]);

export function createTypeCompatibilityEngine(registry) {
  const widen = (typeId) => {
    if (NUMERIC.has(typeId)) return "decimal";
    if (TEXTUAL.has(typeId)) return "string";
    if (TEMPORAL.has(typeId)) return "datetime";
    return typeId;
  };

  const areCompatible = (sourceType, targetType) => {
    if (!sourceType || !targetType) return false;
    if (sourceType === targetType) return true;
    if (sourceType === "any" || targetType === "any") return true;
    if (sourceType === "unknown" || targetType === "unknown") return true;
    if (sourceType === "null" && targetType !== "null") return true;

    if (NUMERIC.has(sourceType) && NUMERIC.has(targetType)) return true;
    if (TEXTUAL.has(sourceType) && TEXTUAL.has(targetType)) return true;
    if (TEMPORAL.has(sourceType) && TEMPORAL.has(targetType)) return true;

    const sourceDef = registry?.get?.(sourceType);
    const targetDef = registry?.get?.(targetType);
    if (sourceDef?.coercibleFrom?.includes?.(targetType)) return true;
    if (targetDef?.coercibleFrom?.includes?.(sourceType)) return true;

    if (registry?.collections?.isCollectionType?.(sourceType) && targetType === "collection") return true;
    if (sourceType === "expression" && targetType === "formula") return true;
    if (sourceType === "formula" && targetType === "expression") return true;

    return widen(sourceType) === widen(targetType);
  };

  return Object.freeze({
    areCompatible,
    canAssign(sourceType, targetType) {
      return areCompatible(sourceType, targetType);
    },
    commonSuperType(left, right) {
      if (areCompatible(left, right)) return widen(left) === left ? left : widen(right);
      return "unknown";
    },
    describeCompatibility(sourceType, targetType) {
      const ok = areCompatible(sourceType, targetType);
      return Object.freeze({
        sourceType,
        targetType,
        compatible: ok,
        metadata: Object.freeze({
          compatibilityHint: ok
            ? `'${sourceType}' is assignable to '${targetType}'.`
            : `'${sourceType}' is not directly assignable to '${targetType}'.`,
          aiHints: Object.freeze(ok ? ["Safe assignment expected."] : ["Consider explicit coercion."]),
        }),
      });
    },
  });
}

export default createTypeCompatibilityEngine;
