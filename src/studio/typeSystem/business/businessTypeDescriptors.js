import { buildTypeMetadata } from "../metadata/typeMetadata.js";

/** Business type descriptors — structural registration (Program 2.3.4) */

export function createBusinessTypeDescriptors() {
  const types = new Map();

  const register = (partial) => {
    if (!partial.businessTypeId) throw new Error("Business type requires businessTypeId.");
    const entry = Object.freeze({
      typeId: `business:${partial.businessTypeId}`,
      kind: "business",
      businessTypeId: partial.businessTypeId,
      label: partial.label ?? partial.businessTypeId,
      targetEntityHint: partial.targetEntityHint ?? null,
      baseType: partial.baseType ?? "reference",
      metadata: buildTypeMetadata({
        documentation: partial.documentation ?? `Business type: ${partial.label ?? partial.businessTypeId}`,
        aiHints: Object.freeze(partial.aiHints ?? [`Entity reference type for ${partial.businessTypeId}.`]),
        examples: Object.freeze(partial.examples ?? [partial.businessTypeId]),
        marketplaceHint: partial.marketplaceHint ?? null,
      }),
    });
    types.set(entry.typeId, entry);
    return entry;
  };

  return Object.freeze({
    register,
    get(typeId) {
      return types.get(typeId) ?? null;
    },
    getByBusinessId(businessTypeId) {
      return types.get(`business:${businessTypeId}`) ?? null;
    },
    list() {
      return Object.freeze([...types.values()]);
    },
  });
}

export default createBusinessTypeDescriptors;
