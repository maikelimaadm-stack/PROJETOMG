import { buildTypeMetadata } from "../metadata/typeMetadata.js";

/** Reference type descriptors (Program 2.3.4) */

export function createReferenceTypes() {
  const types = new Map();

  const register = (partial) => {
    if (!partial.entityId) throw new Error("Reference type requires entityId.");
    const typeId = partial.typeId ?? `ref:${partial.entityId}`;
    const entry = Object.freeze({
      typeId,
      kind: "reference",
      entityId: partial.entityId,
      label: partial.label ?? partial.entityId,
      cardinality: partial.cardinality ?? "one",
      metadata: buildTypeMetadata({
        documentation: `Reference to entity '${partial.entityId}'.`,
        aiHints: Object.freeze(["Use for foreign-key style field bindings."]),
      }),
    });
    types.set(typeId, entry);
    return entry;
  };

  return Object.freeze({
    register,
    get(typeId) {
      return types.get(typeId) ?? null;
    },
    list() {
      return Object.freeze([...types.values()]);
    },
  });
}

export default createReferenceTypes;
