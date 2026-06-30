/** Dependency Graph Engine — cross-artifact dependencies (Program 2.2.5) */

export const DEPENDENCY_GRAPH_VERSION = "mak-dependency-graph-v1";

export const DEPENDENCY_KINDS = Object.freeze([
  "layout",
  "field",
  "workflow",
  "dashboard",
  "report",
  "automation",
  "binding",
  "reference",
]);

export function createDependencyGraphEngine() {
  /** @type {Map<string, { id: string, type: string, label?: string }>} */
  const nodes = new Map();
  /** @type {Array<{ from: string, to: string, kind: string }>} */
  const edges = [];

  const addNode = ({ id, type, label }) => {
    if (!id || !type) throw new Error("Dependency node requires id and type.");
    nodes.set(id, Object.freeze({ id, type, label: label ?? id }));
    return nodes.get(id);
  };

  const addEdge = ({ from, to, kind = "reference" }) => {
    if (!nodes.has(from) || !nodes.has(to)) {
      throw new Error(`Dependency edge requires existing nodes: ${from} -> ${to}`);
    }
    const edge = Object.freeze({ from, to, kind });
    edges.push(edge);
    return edge;
  };

  const getDependencies = (nodeId) =>
    edges.filter((e) => e.to === nodeId).map((e) => ({ ...e, node: nodes.get(e.from) }));

  const getDependents = (nodeId) =>
    edges.filter((e) => e.from === nodeId).map((e) => ({ ...e, node: nodes.get(e.to) }));

  const removeNode = (nodeId) => {
    nodes.delete(nodeId);
    for (let i = edges.length - 1; i >= 0; i -= 1) {
      if (edges[i].from === nodeId || edges[i].to === nodeId) edges.splice(i, 1);
    }
  };

  const snapshot = () =>
    Object.freeze({
      version: DEPENDENCY_GRAPH_VERSION,
      nodes: Object.freeze([...nodes.values()]),
      edges: Object.freeze([...edges]),
    });

  return Object.freeze({
    version: DEPENDENCY_GRAPH_VERSION,
    addNode,
    addEdge,
    getDependencies,
    getDependents,
    removeNode,
    snapshot,
  });
}

export default createDependencyGraphEngine;
