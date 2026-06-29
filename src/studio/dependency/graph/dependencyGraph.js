import { DEPENDENCY_GRAPH_VERSION } from "../contracts/dependencyContracts.js";
import { createDependencyNode } from "./dependencyNode.js";
import { createDependencyEdge } from "./dependencyEdge.js";

/** Official Dependency Graph — single graph for all Studios (Program 2.3.3) */

export function createDependencyGraph() {
  /** @type {Map<string, ReturnType<typeof createDependencyNode>>} */
  const nodes = new Map();
  /** @type {Array<ReturnType<typeof createDependencyEdge>>} */
  const edges = [];

  const ensureNode = (partial) => {
    if (nodes.has(partial.id)) return nodes.get(partial.id);
    const node = createDependencyNode(partial);
    nodes.set(node.id, node);
    return node;
  };

  return Object.freeze({
    version: DEPENDENCY_GRAPH_VERSION,
    clear() {
      nodes.clear();
      edges.length = 0;
    },
    addNode(partial) {
      return ensureNode(partial);
    },
    addEdge(partial) {
      ensureNode({ id: partial.from, kind: "reference" });
      ensureNode({ id: partial.to, kind: "reference" });
      const edge = createDependencyEdge(partial);
      edges.push(edge);
      return edge;
    },
    hasNode(id) {
      return nodes.has(id);
    },
    getNode(id) {
      return nodes.get(id) ?? null;
    },
    getEdges() {
      return Object.freeze([...edges]);
    },
    getOutgoing(nodeId) {
      return edges.filter((e) => e.from === nodeId);
    },
    getIncoming(nodeId) {
      return edges.filter((e) => e.to === nodeId);
    },
    removeNode(nodeId) {
      nodes.delete(nodeId);
      for (let i = edges.length - 1; i >= 0; i -= 1) {
        if (edges[i].from === nodeId || edges[i].to === nodeId) edges.splice(i, 1);
      }
    },
    renameNode(fromId, toId) {
      const node = nodes.get(fromId);
      if (!node) return false;
      nodes.delete(fromId);
      nodes.set(toId, createDependencyNode({ ...node, id: toId }));
      edges.forEach((e, i) => {
        edges[i] = createDependencyEdge({
          ...e,
          from: e.from === fromId ? toId : e.from,
          to: e.to === fromId ? toId : e.to,
        });
      });
      return true;
    },
    snapshot() {
      return Object.freeze({
        version: DEPENDENCY_GRAPH_VERSION,
        nodes: Object.freeze([...nodes.values()]),
        edges: Object.freeze([...edges]),
      });
    },
  });
}

export default createDependencyGraph;
