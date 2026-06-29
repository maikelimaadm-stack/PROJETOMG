/** Type documentation generator (Program 2.3.4) */

export function buildTypeDocumentation(registry) {
  const types = registry?.listAll?.() ?? [];
  return Object.freeze({
    version: "mak-studio-type-docs-v1",
    generatedAt: new Date().toISOString(),
    typeCount: types.length,
    sections: Object.freeze({
      primitives: Object.freeze(types.filter((t) => t.kind === "primitive").map((t) => t.typeId)),
      business: Object.freeze(types.filter((t) => t.kind === "business").map((t) => t.typeId)),
      reference: Object.freeze(types.filter((t) => t.kind === "reference").map((t) => t.typeId)),
      collection: Object.freeze(types.filter((t) => t.kind === "collection").map((t) => t.typeId)),
      enum: Object.freeze(types.filter((t) => t.kind === "enum").map((t) => t.typeId)),
    }),
    entries: Object.freeze(
      types.map((t) =>
        Object.freeze({
          typeId: t.typeId,
          kind: t.kind,
          label: t.label,
          documentation: t.metadata?.documentation ?? null,
          aiHints: t.metadata?.aiHints ?? [],
          examples: t.metadata?.examples ?? [],
        })
      )
    ),
  });
}

export default buildTypeDocumentation;
