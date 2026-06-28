/**
 * Metadata declarativa da Formula Configuration Engine.
 */
import { MAK_FORMULA_FUNCTION_NAMES } from "./makFormulaBuiltinFunctions.js";

export const MAK_FORMULA_METADATA_KEYS = Object.freeze([
  "formula",
  "expression",
  "dependsOn",
  "watch",
  "compute",
  "calculate",
  "aggregate",
  "concat",
  "if",
  "case",
  "switch",
  "sum",
  "avg",
  "min",
  "max",
  "count",
  "round",
  "ceil",
  "floor",
  "abs",
  "today",
  "now",
  "dateDiff",
  "dateAdd",
  "replace",
  "substring",
  "uppercase",
  "lowercase",
  "trim",
  "coalesce",
  "nullIf",
  "cast",
  "persist",
  "readOnly",
]);

export function buildMakFormulaConfigMetadata({
  moduleId,
  fieldDefinitions = [],
} = {}) {
  if (!moduleId) {
    throw new Error("buildMakFormulaConfigMetadata: moduleId é obrigatório.");
  }

  const formulaFields = fieldDefinitions.filter(
    (field) =>
      field?.formula ||
      field?.expression ||
      field?.compute ||
      field?.calculate ||
      field?.type === "calculado"
  );

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    supportedFunctions: MAK_FORMULA_FUNCTION_NAMES,
    supportedMetadataKeys: MAK_FORMULA_METADATA_KEYS,
    fieldCount: fieldDefinitions.length,
    formulaFieldCount: formulaFields.length,
    fieldDefinitions: formulaFields.map((field) => ({
      id: field.id ?? field.name,
      name: field.name ?? field.id,
      type: field.type ?? "text",
      formula: field.formula ?? field.expression ?? field.compute ?? null,
      dependsOn: field.dependsOn ?? field.formula?.dependsOn ?? null,
      readOnly: field.readOnly ?? field.type === "calculado",
      persist: field.formula?.persist ?? field.persist ?? false,
    })),
  });
}

export default buildMakFormulaConfigMetadata;
