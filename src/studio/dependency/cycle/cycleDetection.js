/** Cycle Detection — official single implementation (Program 2.3.3) */

export function createCycleDetection() {
  return Object.freeze({
    detect(graph) {
      const snapshot = graph.snapshot();
      const adj = new Map();
      snapshot.nodes.forEach((n) => adj.set(n.id, []));
      snapshot.edges.forEach((e) => {
        if (adj.has(e.from)) adj.get(e.from).push(e.to);
      });

      const visited = new Set();
      const stack = new Set();
      const cycles = [];

      const dfs = (nodeId, path) => {
        if (stack.has(nodeId)) {
          const cycleStart = path.indexOf(nodeId);
          cycles.push(path.slice(cycleStart).concat(nodeId));
          return;
        }
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        stack.add(nodeId);
        (adj.get(nodeId) ?? []).forEach((next) => dfs(next, [...path, nodeId]));
        stack.delete(nodeId);
      };

      snapshot.nodes.forEach((n) => {
        if (!visited.has(n.id)) dfs(n.id, []);
      });

      return Object.freeze({
        hasCycle: cycles.length > 0,
        cycles: Object.freeze(cycles.map((c) => Object.freeze(c))),
      });
    },
  });
}

export default createCycleDetection;
