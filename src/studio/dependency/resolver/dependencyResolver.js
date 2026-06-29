import { createCycleDetection } from "../cycle/cycleDetection.js";

/** Dependency Resolver — topological order and transitive deps (Program 2.3.3) */

export function createDependencyResolver(cycleDetection = createCycleDetection()) {
  const collectTransitive = (graph, startId, direction) => {
    const visited = new Set();
    const queue = [startId];
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const related =
        direction === "down"
          ? graph.getOutgoing(id).map((e) => e.to)
          : graph.getIncoming(id).map((e) => e.from);
      related.forEach((r) => queue.push(r));
    }
    visited.delete(startId);
    return [...visited];
  };

  return Object.freeze({
    resolveOrder(graph) {
      const cycle = cycleDetection.detect(graph);
      if (cycle.hasCycle) {
        throw new Error(`Dependency cycle detected: ${cycle.cycles[0]?.join(" → ")}`);
      }
      const snapshot = graph.snapshot();
      const inDegree = new Map(snapshot.nodes.map((n) => [n.id, 0]));
      snapshot.edges.forEach((e) => inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1));
      const queue = snapshot.nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
      const order = [];
      const adj = new Map();
      snapshot.edges.forEach((e) => {
        if (!adj.has(e.from)) adj.set(e.from, []);
        adj.get(e.from).push(e.to);
      });
      while (queue.length) {
        const id = queue.shift();
        order.push(id);
        (adj.get(id) ?? []).forEach((to) => {
          inDegree.set(to, inDegree.get(to) - 1);
          if (inDegree.get(to) === 0) queue.push(to);
        });
      }
      return Object.freeze(order);
    },
    resolveDependencies(graph, nodeId) {
      return Object.freeze({
        upstream: collectTransitive(graph, nodeId, "up"),
        downstream: collectTransitive(graph, nodeId, "down"),
      });
    },
  });
}

export default createDependencyResolver;
