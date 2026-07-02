import { DependencyError } from './errors.js';

export class DependencySorter {
  /**
   * Kahn topological sort — dependency before dependent.
   * @param {string[]} nodeIds
   * @param {Map<string, string[]>} adjacency depId -> must init before objectId? 
   *   adjacency stores: objectId -> [depIds that object depends on]
   */
  static topologicalSort(nodeIds, adjacency) {
    const inDegree = new Map(nodeIds.map((id) => [id, 0]));
    /** @type {Map<string, string[]>} */
    const dependents = new Map(nodeIds.map((id) => [id, []]));

    for (const [objectId, deps] of adjacency.entries()) {
      inDegree.set(objectId, deps.length);
      for (const depId of deps) {
        dependents.get(depId)?.push(objectId);
      }
    }

    const queue = nodeIds.filter((id) => (inDegree.get(id) ?? 0) === 0);
    /** @type {string[]} */
    const order = [];

    while (queue.length > 0) {
      const current = queue.shift();
      order.push(current);
      for (const dependent of dependents.get(current) ?? []) {
        const next = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, next);
        if (next === 0) queue.push(dependent);
      }
    }

    if (order.length !== nodeIds.length) {
      const cycle = DependencySorter.findCycle(nodeIds, adjacency);
      throw new DependencyError(
        'MAK-L3-DEP-001',
        `Dependency cycle detected: ${cycle.join(' → ')}`,
      );
    }

    return order;
  }

  /**
   * @param {string[]} nodeIds
   * @param {Map<string, string[]>} adjacency
   */
  static findCycle(nodeIds, adjacency) {
    /** @type {Set<string>} */
    const visiting = new Set();
    /** @type {Set<string>} */
    const visited = new Set();
    /** @type {string[]} */
    const path = [];

    const dfs = (node) => {
      if (visiting.has(node)) {
        const cycleStart = path.indexOf(node);
        return [...path.slice(cycleStart), node];
      }
      if (visited.has(node)) return null;

      visiting.add(node);
      path.push(node);

      for (const depId of adjacency.get(node) ?? []) {
        const cycle = dfs(depId);
        if (cycle) return cycle;
      }

      path.pop();
      visiting.delete(node);
      visited.add(node);
      return null;
    };

    for (const nodeId of nodeIds) {
      const cycle = dfs(nodeId);
      if (cycle) return cycle;
    }

    return ['unknown-cycle'];
  }

  /**
   * @param {string[]} initOrder
   * @param {Map<string, string[]>} adjacency
   */
  static maxDepth(initOrder, adjacency) {
    /** @type {Map<string, number>} */
    const depth = new Map();
    let max = 0;

    for (const nodeId of initOrder) {
      const deps = adjacency.get(nodeId) ?? [];
      const nodeDepth = deps.length === 0 ? 0 : Math.max(...deps.map((dep) => (depth.get(dep) ?? 0) + 1));
      depth.set(nodeId, nodeDepth);
      max = Math.max(max, nodeDepth);
    }

    return max;
  }
}
