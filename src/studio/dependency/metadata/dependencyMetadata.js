/** Dependency metadata helpers — AI / Marketplace / Runtime ready (Program 2.3.3) */

export function buildDependencyMetadata(partial = {}) {
  return Object.freeze({
    dependencyExplanation: partial.dependencyExplanation ?? null,
    impactHint: partial.impactHint ?? null,
    lineage: Object.freeze(partial.lineage ?? []),
    graphDocumentation: partial.graphDocumentation ?? null,
    aiHints: Object.freeze(partial.aiHints ?? []),
    examples: Object.freeze(partial.examples ?? []),
    runtimeHint: partial.runtimeHint ?? null,
    marketplaceHint: partial.marketplaceHint ?? null,
  });
}

export function enrichSnapshotWithMetadata(snapshot) {
  return Object.freeze({
    ...snapshot,
    metadata: buildDependencyMetadata({
      graphDocumentation: `Studio Dependency Graph · ${snapshot.nodes.length} nodes · ${snapshot.edges.length} edges`,
      aiHints: ["Use impact analyzer before delete or rename.", "Check cycles before scheduling runtime evaluation."],
      runtimeHint: "Topological order available via dependency resolver.",
    }),
  });
}

export default buildDependencyMetadata;
