/** Type metadata — AI / Marketplace / Runtime ready (Program 2.3.4) */

export function buildTypeMetadata(partial = {}) {
  return Object.freeze({
    documentation: partial.documentation ?? null,
    aiHints: Object.freeze(partial.aiHints ?? []),
    examples: Object.freeze(partial.examples ?? []),
    compatibilityHint: partial.compatibilityHint ?? null,
    coercionHint: partial.coercionHint ?? null,
    runtimeHint: partial.runtimeHint ?? null,
    marketplaceHint: partial.marketplaceHint ?? null,
  });
}

export function enrichTypeDescriptor(descriptor) {
  if (!descriptor) return null;
  return Object.freeze({
    ...descriptor,
    metadata: buildTypeMetadata(descriptor.metadata ?? {}),
  });
}

export default buildTypeMetadata;
