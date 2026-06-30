/**
 * Expression dependency bridge — delegates to Studio Dependency Engine (Program 2.3.3)
 * No parallel graph; variable extraction only.
 */
import { createDependencyEngine } from "../../dependency/index.js";
import { extractVariableRefsFromAst } from "./expressionVariableRefs.js";

export function createExpressionDependencyGraph() {
  const engine = createDependencyEngine({ domainId: "expression", cacheKey: "expression" });
  const { graph } = engine;

  return Object.freeze({
    engine,
    clear() {
      graph.clear();
    },
    extractFromAst(ast, ownerId = "expression") {
      const refs = extractVariableRefsFromAst(ast);
      graph.addNode({ id: ownerId, kind: "expression", label: ownerId });
      refs.forEach((ref) => {
        graph.addNode({ id: ref, kind: "reference", label: ref });
        graph.addEdge({ from: ownerId, to: ref, kind: "expression-ref" });
      });
      return [...refs];
    },
    getDependencies(ownerId) {
      return graph.getOutgoing(ownerId).map((e) => e.to);
    },
    snapshot() {
      return engine.snapshot();
    },
  });
}

export default createExpressionDependencyGraph;
