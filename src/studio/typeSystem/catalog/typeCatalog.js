import { TYPE_REGISTRY_VERSION } from "../contracts/typeSystemContracts.js";
import { createPrimitiveTypes } from "../primitives/primitiveTypes.js";
import { createBusinessTypeDescriptors } from "../business/businessTypeDescriptors.js";
import { createReferenceTypes } from "../reference/referenceTypes.js";
import { createCollectionTypes } from "../collection/collectionTypes.js";
import { createEnumTypes } from "../enum/enumTypes.js";

/** Official Type Registry — single registry for all Studios (Program 2.3.4) */

const FIELD_TYPE_ALIASES = Object.freeze({
  string: "string",
  number: "decimal",
  boolean: "boolean",
  date: "date",
  datetime: "datetime",
  text: "text",
  select: "enum",
  reference: "reference",
  decimal: "decimal",
  integer: "integer",
});

export function createTypeRegistry() {
  const primitives = createPrimitiveTypes();
  const business = createBusinessTypeDescriptors();
  const references = createReferenceTypes();
  const collections = createCollectionTypes();
  const enums = createEnumTypes();
  const custom = new Map();

  const resolve = (typeId) => {
    if (!typeId) return null;
    return (
      primitives.get(typeId) ??
      business.get(typeId) ??
      references.get(typeId) ??
      collections.get(typeId) ??
      enums.get(typeId) ??
      custom.get(typeId) ??
      null
    );
  };

  return Object.freeze({
    version: TYPE_REGISTRY_VERSION,
    primitives,
    business,
    references,
    collections,
    enums,
    registerCustom(typeId, descriptor) {
      if (!typeId) throw new Error("Custom type requires typeId.");
      const entry = Object.freeze({ ...descriptor, typeId, kind: descriptor.kind ?? "custom" });
      custom.set(typeId, entry);
      return entry;
    },
    get: resolve,
    has(typeId) {
      return Boolean(resolve(typeId)) || collections.isCollectionType(typeId);
    },
    resolveFieldType(fieldType, businessTypeId = null) {
      if (businessTypeId) {
        const bt = business.getByBusinessId(businessTypeId);
        if (bt) return bt.baseType ?? "reference";
      }
      return FIELD_TYPE_ALIASES[fieldType] ?? fieldType ?? "unknown";
    },
    mapFieldType(fieldType, businessTypeId = null) {
      return this.resolveFieldType(fieldType, businessTypeId);
    },
    listAll() {
      const all = [
        ...primitives.list(),
        ...business.list(),
        ...references.list(),
        ...collections.list(),
        ...enums.list(),
        ...custom.values(),
      ];
      return Object.freeze(all);
    },
    snapshot() {
      return Object.freeze({
        version: TYPE_REGISTRY_VERSION,
        types: this.listAll(),
        count: this.listAll().length,
      });
    },
  });
}

export default createTypeRegistry;
