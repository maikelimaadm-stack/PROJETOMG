import { createCycleDetection } from "../cycle/cycleDetection.js";
import { createImpactAnalyzer } from "../impact/impactAnalyzer.js";
import { createDependencyResolver } from "../resolver/dependencyResolver.js";

/** Safe Delete Engine — dependency-aware delete (Program 2.3.3) */

export function createSafeDeleteEngine(deps = {}) {
  const cycleDetection = deps.cycleDetection ?? createCycleDetection();
  const resolver = deps.resolver ?? createDependencyResolver(cycleDetection);
  const impactAnalyzer = deps.impactAnalyzer ?? createImpactAnalyzer(resolver);

  return Object.freeze({
    canDelete(graph, nodeId) {
      const dependents = graph.getIncoming(nodeId);
      if (dependents.length > 0) {
        return Object.freeze({
          safe: false,
          reason: `Node has ${dependents.length} dependent(s).`,
          blockers: Object.freeze(dependents.map((e) => e.from)),
        });
      }
      const impact = impactAnalyzer.analyzeImpact(graph, nodeId, "delete");
      return Object.freeze({ safe: true, impact });
    },
    applyDelete(graph, nodeId) {
      const check = this.canDelete(graph, nodeId);
      if (!check.safe) throw new Error(check.reason);
      graph.removeNode(nodeId);
      return check.impact;
    },
  });
}

export default createSafeDeleteEngine;
