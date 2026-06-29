import { buildTypeMetadata } from "../metadata/typeMetadata.js";

/** Enum type descriptors (Program 2.3.4) */

export function createEnumTypes() {
  const types = new Map();

  const register = (partial) => {
    if (!partial.enumId) throw new Error("Enum type requires enumId.");
    const values = Object.freeze([...(partial.values ?? [])]);
    const typeId = partial.typeId ?? `enum:${partial.enumId}`;
    const entry = Object.freeze({
      typeId,
      kind: "enum",
      enumId: partial.enumId,
      label: partial.label ?? partial.enumId,
      values,
      metadata: buildTypeMetadata({
        documentation: `Enum '${partial.enumId}' with ${values.length} value(s).`,
        examples: values.slice(0, 3),
        aiHints: Object.freeze(["Restricted value set — validate against enum members."]),
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

export default createEnumTypes;
