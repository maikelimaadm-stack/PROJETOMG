/**
 * Immutable dependency DAG snapshot.
 */
export class DependencyGraph {
  /**
   * @param {Object} params
   * @param {import('../../types/dependency.js').DependencyNode[]} params.nodes
   * @param {Map<string, string[]>} params.adjacency
   * @param {string[]} params.initOrder
   * @param {number} params.maxDepth
   */
  constructor({ nodes, adjacency, initOrder, maxDepth }) {
    this.nodes = Object.freeze([...nodes]);
    this.initOrder = Object.freeze([...initOrder]);
    this.maxDepth = maxDepth;
    this.dependencyCount = [...adjacency.values()].reduce((sum, deps) => sum + deps.length, 0);
    /** @type {Map<string, string[]>} */
    this._adjacency = adjacency;
    Object.freeze(this);
  }

  /** @param {string} objectId */
  dependenciesOf(objectId) {
    return Object.freeze([...(this._adjacency.get(objectId) ?? [])]);
  }
}
