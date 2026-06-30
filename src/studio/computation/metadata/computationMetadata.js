/** Computation metadata — IA / Marketplace / diagnostics hints (Program 3.1) */

export function enrichComputationMetadata(graphSnapshot, partial = {}) {
  const nodeCount = graphSnapshot?.nodes?.length ?? 0;
  const edgeCount = graphSnapshot?.edges?.length ?? 0;
  return Object.freeze({
    domainId: partial.domainId ?? "computation",
    nodeCount,
    edgeCount,
    computationExplanation: `Computation graph with ${nodeCount} nodes and ${edgeCount} edges.`,
    lineage: Object.freeze({
      source: "computation-engine",
      version: graphSnapshot?.version ?? null,
    }),
    graphDocumentation: Object.freeze({
      authoringGraph: true,
      executionGraphSeparate: true,
    }),
    aiHints: Object.freeze([
      "All computations must route through the official Computation Engine.",
      "Mutual recursion between computed fields is forbidden in v1.",
    ]),
    optimizationHints: Object.freeze(["Use lazy evaluation for preview.", "Batch cross-entity aggregates."]),
    marketplaceOrigin: partial.marketplaceOrigin ?? null,
  });
}

export default enrichComputationMetadata;
