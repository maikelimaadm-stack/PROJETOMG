/** Impact Analyzer — change impact with AI-ready metadata (Program 2.3.3) */

export function createImpactAnalyzer(resolver) {
  return Object.freeze({
    analyzeImpact(graph, nodeId, changeType = "modify") {
      const deps = resolver.resolveDependencies(graph, nodeId);
      const node = graph.getNode(nodeId);
      const directDependents = graph.getIncoming(nodeId).map((e) => e.from);
      const directDependencies = graph.getOutgoing(nodeId).map((e) => e.to);

      const explanation =
        changeType === "delete"
          ? `Removing '${node?.label ?? nodeId}' affects ${deps.downstream.length} downstream node(s).`
          : `Changing '${node?.label ?? nodeId}' may impact ${deps.downstream.length} dependent node(s).`;

      return Object.freeze({
        nodeId,
        changeType,
        affectedCount: deps.downstream.length + (changeType === "delete" ? directDependents.length : 0),
        directDependents: Object.freeze(directDependents),
        directDependencies: Object.freeze(directDependencies),
        downstream: Object.freeze(deps.downstream),
        upstream: Object.freeze(deps.upstream),
        metadata: Object.freeze({
          dependencyExplanation: explanation,
          impactHint: deps.downstream.length > 0 ? "Review dependents before applying change." : "Low impact change.",
          aiHints: Object.freeze([
            deps.downstream.length > 3 ? "High fan-out — consider staged rollout." : "Localized impact expected.",
            changeType === "delete" ? "Verify no computed or workflow nodes reference this artifact." : null,
          ].filter(Boolean)),
          lineage: Object.freeze([...deps.upstream, nodeId, ...deps.downstream]),
        }),
      });
    },
  });
}

export default createImpactAnalyzer;
