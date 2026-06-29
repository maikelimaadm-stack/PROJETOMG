/** Studio Type System — official contracts (Program 2.3.4) */

export const STUDIO_TYPE_SYSTEM_VERSION = "mak-studio-type-system-v1";

export const TYPE_REGISTRY_VERSION = "mak-studio-type-registry-v1";

export const OFFICIAL_TYPE_ENGINES = Object.freeze([
  "registry",
  "compatibility",
  "inference",
  "coercion",
  "validation",
]);

/** Official primitive and structural type identifiers */
export const PRIMITIVE_TYPE_IDS = Object.freeze([
  "string",
  "text",
  "integer",
  "decimal",
  "boolean",
  "date",
  "datetime",
  "time",
  "duration",
  "currency",
  "percentage",
  "object",
  "reference",
  "collection",
  "enum",
  "expression",
  "formula",
  "dataset",
  "unknown",
  "any",
  "null",
]);

export const TYPE_KINDS = Object.freeze([
  "primitive",
  "business",
  "reference",
  "collection",
  "enum",
  "expression",
  "formula",
  "dataset",
  "custom",
]);

export default STUDIO_TYPE_SYSTEM_VERSION;
