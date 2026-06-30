import { COMPUTATION_GRAPH_VERSION } from "../contracts/computationContracts.js";
import { extractVariableRefsFromAst } from "../../expression/dependency/expressionVariableRefs.js";
import { walkComputationAst } from "../ast/computationAst.js";

/** Computation Graph — authoring-time dependency view (Program 3.1) */

export function createComputationGraph() {
  const nodes = new Map();
  const edges = [];

  return Object.freeze({
    version: COMPUTATION_GRAPH_VERSION,
    addNode(node) {
      if (!node?.id) throw new Error("Computation graph node requires id.");
      nodes.set(node.id, Object.freeze({ ...node, kind: node.kind ?? "computation" }));
      return node.id;
    },
    addEdge(edge) {
      if (!edge?.from || !edge?.to) throw new Error("Computation graph edge requires from and to.");
      edges.push(Object.freeze({ kind: edge.kind ?? "reads", ...edge }));
      return edge;
    },
    getNode(id) {
      return nodes.get(id) ?? null;
    },
    getNodes() {
      return [...nodes.values()];
    },
    getEdges() {
      return [...edges];
    },
    getOutgoing(fromId) {
      return edges.filter((e) => e.from === fromId);
    },
    getIncoming(toId) {
      return edges.filter((e) => e.to === toId);
    },
    clear() {
      nodes.clear();
      edges.length = 0;
    },
    snapshot() {
      return Object.freeze({
        version: COMPUTATION_GRAPH_VERSION,
        nodes: this.getNodes(),
        edges: this.getEdges(),
      });
    },
  });
}

export function buildComputationGraphFromDocuments(documents, dependencyEngine) {
  const graph = createComputationGraph();
  const { graph: depGraph } = dependencyEngine;

  documents.forEach((doc) => {
    graph.addNode({
      id: doc.id,
      kind: "computation",
      label: doc.id,
      ownerType: doc.ownerType,
      fieldKind: doc.fieldKind,
      moduleId: doc.moduleId,
      entityId: doc.entityId,
    });

    depGraph.addNode({ id: doc.id, kind: "computation", label: doc.id });

    const exprAst = doc.ast?.expression ? { expression: doc.ast.expression, astVersion: doc.ast.astVersion } : doc.ast;
    const varRefs = extractVariableRefsFromAst(exprAst);
    varRefs.forEach((ref) => {
      graph.addNode({ id: ref, kind: "reference", label: ref });
      graph.addEdge({ from: doc.id, to: ref, kind: "reads" });
      depGraph.addNode({ id: ref, kind: "reference", label: ref });
      depGraph.addEdge({ from: doc.id, to: ref, kind: "expression-ref" });
    });

    walkComputationAst(doc.ast?.expression, (node) => {
      if (node.kind === "FieldRef" && node.fieldId) {
        graph.addNode({ id: node.fieldId, kind: "field", label: node.fieldId });
        graph.addEdge({ from: doc.id, to: node.fieldId, kind: "reads" });
        depGraph.addNode({ id: node.fieldId, kind: "field", label: node.fieldId });
        depGraph.addEdge({ from: doc.id, to: node.fieldId, kind: "field-ref" });
      }
      if (node.kind === "CrossEntityRef" && node.fieldId) {
        const crossId = `cross:${node.relationId}:${node.fieldId}`;
        graph.addNode({ id: crossId, kind: "cross-entity", label: crossId });
        graph.addEdge({ from: doc.id, to: crossId, kind: "cross-entity" });
        depGraph.addNode({ id: crossId, kind: "reference", label: crossId });
        depGraph.addEdge({ from: doc.id, to: crossId, kind: "cross-entity-ref" });
      }
    });

    (doc.dependencies ?? []).forEach((dep) => {
      const depId = dep.id ?? dep;
      graph.addEdge({ from: doc.id, to: depId, kind: dep.kind ?? "reads" });
    });
  });

  return graph;
}

export default createComputationGraph;
