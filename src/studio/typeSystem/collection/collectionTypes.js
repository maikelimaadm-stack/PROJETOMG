import { buildTypeMetadata } from "../metadata/typeMetadata.js";

/** Collection type descriptors (Program 2.3.4) */

export function createCollectionTypes() {
  const types = new Map();

  const register = (partial) => {
    if (!partial.elementType) throw new Error("Collection type requires elementType.");
    const typeId = partial.typeId ?? `collection<${partial.elementType}>`;
    const entry = Object.freeze({
      typeId,
      kind: "collection",
      elementType: partial.elementType,
      label: partial.label ?? typeId,
      metadata: buildTypeMetadata({
        documentation: `Collection of ${partial.elementType}.`,
        aiHints: Object.freeze(["Homogeneous list type."]),
      }),
    });
    types.set(typeId, entry);
    return entry;
  };

  const parseCollectionTypeId = (typeId) => {
    const match = /^collection<(.+)>$/.exec(typeId ?? "");
    return match ? match[1] : null;
  };

  return Object.freeze({
    register,
    get(typeId) {
      return types.get(typeId) ?? null;
    },
    parseElementType(typeId) {
      return parseCollectionTypeId(typeId);
    },
    isCollectionType(typeId) {
      return Boolean(parseCollectionTypeId(typeId)) || types.has(typeId);
    },
    list() {
      return Object.freeze([...types.values()]);
    },
  });
}

export default createCollectionTypes;
