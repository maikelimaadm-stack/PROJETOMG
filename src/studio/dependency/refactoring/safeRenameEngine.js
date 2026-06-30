import { createCycleDetection } from "../cycle/cycleDetection.js";
import { createImpactAnalyzer } from "../impact/impactAnalyzer.js";
import { createDependencyResolver } from "../resolver/dependencyResolver.js";

/** Safe Rename Engine — dependency-aware rename (Program 2.3.3) */

export function createSafeRenameEngine(deps = {}) {
  const cycleDetection = deps.cycleDetection ?? createCycleDetection();
  const resolver = deps.resolver ?? createDependencyResolver(cycleDetection);
  const impactAnalyzer = deps.impactAnalyzer ?? createImpactAnalyzer(resolver);

  return Object.freeze({
    canRename(graph, nodeId, newId) {
      if (graph.hasNode(newId) && newId !== nodeId) {
        return Object.freeze({ safe: false, reason: `Node '${newId}' already exists.` });
      }
      const impact = impactAnalyzer.analyzeImpact(graph, nodeId, "rename");
      return Object.freeze({
        safe: true,
        impact,
        metadata: Object.freeze({
          dependencyExplanation: `Rename '${nodeId}' → '${newId}' propagates to ${impact.downstream.length} node(s).`,
          aiHints: Object.freeze(["Update expression references after rename."]),
        }),
      });
    },
    applyRename(graph, nodeId, newId) {
      const check = this.canRename(graph, nodeId, newId);
      if (!check.safe) throw new Error(check.reason);
      graph.renameNode(nodeId, newId);
      return check.impact;
    },
  });
}

export default createSafeRenameEngine;
