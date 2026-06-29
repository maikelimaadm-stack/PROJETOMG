import { buildTypeMetadata } from "../metadata/typeMetadata.js";
import { PRIMITIVE_TYPE_IDS } from "../contracts/typeSystemContracts.js";

/** Built-in primitive type definitions (Program 2.3.4) */

const PRIMITIVE_DEFS = Object.freeze([
  { typeId: "string", label: "String", category: "text", coercibleFrom: ["text", "integer", "decimal", "boolean", "date", "datetime"] },
  { typeId: "text", label: "Text", category: "text", coercibleFrom: ["string"] },
  { typeId: "integer", label: "Integer", category: "numeric", coercibleFrom: ["decimal", "string"] },
  { typeId: "decimal", label: "Decimal", category: "numeric", coercibleFrom: ["integer", "string", "currency", "percentage"] },
  { typeId: "boolean", label: "Boolean", category: "logical", coercibleFrom: ["string", "integer"] },
  { typeId: "date", label: "Date", category: "temporal", coercibleFrom: ["datetime", "string"] },
  { typeId: "datetime", label: "DateTime", category: "temporal", coercibleFrom: ["date", "string"] },
  { typeId: "time", label: "Time", category: "temporal", coercibleFrom: ["string", "duration"] },
  { typeId: "duration", label: "Duration", category: "temporal", coercibleFrom: ["string", "integer"] },
  { typeId: "currency", label: "Currency", category: "numeric", coercibleFrom: ["decimal", "integer", "string"] },
  { typeId: "percentage", label: "Percentage", category: "numeric", coercibleFrom: ["decimal", "integer", "string"] },
  { typeId: "object", label: "Object", category: "structural", coercibleFrom: [] },
  { typeId: "reference", label: "Reference", category: "structural", coercibleFrom: ["string", "integer"] },
  { typeId: "collection", label: "Collection", category: "structural", coercibleFrom: [] },
  { typeId: "enum", label: "Enum", category: "structural", coercibleFrom: ["string", "integer"] },
  { typeId: "expression", label: "Expression", category: "computed", coercibleFrom: ["string", "formula"] },
  { typeId: "formula", label: "Formula", category: "computed", coercibleFrom: ["string", "expression"] },
  { typeId: "dataset", label: "Dataset", category: "structural", coercibleFrom: ["collection", "object"] },
  { typeId: "unknown", label: "Unknown", category: "meta", coercibleFrom: PRIMITIVE_TYPE_IDS.filter((t) => t !== "unknown" && t !== "any") },
  { typeId: "any", label: "Any", category: "meta", coercibleFrom: PRIMITIVE_TYPE_IDS.filter((t) => t !== "any") },
  { typeId: "null", label: "Null", category: "meta", coercibleFrom: [] },
]);

export function createPrimitiveTypes() {
  const byId = new Map(
    PRIMITIVE_DEFS.map((def) => [
      def.typeId,
      Object.freeze({
        typeId: def.typeId,
        kind: "primitive",
        label: def.label,
        category: def.category,
        coercibleFrom: Object.freeze(def.coercibleFrom ?? []),
        metadata: buildTypeMetadata({
          documentation: `Primitive type: ${def.label}`,
          aiHints: [`Use ${def.typeId} for ${def.category} values.`],
          examples: Object.freeze([def.typeId]),
        }),
      }),
    ])
  );

  return Object.freeze({
    list() {
      return Object.freeze([...byId.values()]);
    },
    get(typeId) {
      return byId.get(typeId) ?? null;
    },
    has(typeId) {
      return byId.has(typeId);
    },
  });
}

export default createPrimitiveTypes;
