import { DependencyGraph } from './DependencyGraph.js';
import { DependencyAnalyzer } from './DependencyAnalyzer.js';
import { DependencyValidator } from './DependencyValidator.js';
import { DependencySorter } from './DependencySorter.js';
import { DependencyLifecycle } from './DependencyLifecycle.js';
import { DependencyError } from './errors.js';

/**
 * Dependency Resolver (M07) — DAG build, cycle detection, topological order.
 */
export class DependencyResolver {
  constructor() {
    /** @type {import('./DependencyLifecycle.js').DependencyState} */
    this._state = DependencyLifecycle.PENDING;
    /** @type {DependencyGraph | null} */
    this._graph = null;
    /** @type {Map<string, string[]>} */
    this._modules = new Map();
  }

  /**
   * @param {string} name
   * @param {string[]} deps
   */
  registerModule(name, deps) {
    this._modules.set(name, [...deps]);
  }

  /** @returns {import('../../types/dependency.js').CycleReport | null} */
  detectCycles() {
    if (!this._graph) return null;
    try {
      DependencySorter.topologicalSort(
        this._graph.nodes.map((node) => node.objectId),
        this._buildAdjacencyFromGraph(),
      );
      return null;
    } catch (err) {
      if (err instanceof DependencyError && err.code === 'MAK-L3-DEP-001') {
        const cycle = err.message.replace('Dependency cycle detected: ', '').split(' → ');
        return { cycle, message: err.message };
      }
      throw err;
    }
  }

  /** @returns {string[]} */
  resolveOrder() {
    if (!this._graph) return [];
    return [...this._graph.initOrder];
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {string[]} [requiredModules]
   * @returns {DependencyGraph}
   */
  resolveFromCrb(crb, requiredModules) {
    this._state = DependencyLifecycle.BUILDING;
    const started = performance.now();

    try {
      const { nodes, adjacency } = DependencyAnalyzer.buildFromCrb(crb);
      const modules = requiredModules ?? (crb.moduleId ? [crb.moduleId] : []);
      DependencyValidator.validateReferences(nodes, adjacency, modules);

      const nodeIds = nodes.map((node) => node.objectId);
      const initOrder = DependencySorter.topologicalSort(nodeIds, adjacency);
      const maxDepth = DependencySorter.maxDepth(initOrder, adjacency);

      this._graph = new DependencyGraph({ nodes, adjacency, initOrder, maxDepth });
      this._state = DependencyLifecycle.RESOLVED;

      this._lastResolveMs = performance.now() - started;
      this._lastDagBuildMs = this._lastResolveMs;
      return this._graph;
    } catch (err) {
      this._state = DependencyLifecycle.FAILED;
      throw err;
    }
  }

  /** @returns {DependencyGraph | null} */
  getGraph() {
    return this._graph;
  }

  get state() {
    return this._state;
  }

  get lastResolveMs() {
    return this._lastResolveMs ?? 0;
  }

  get lastDagBuildMs() {
    return this._lastDagBuildMs ?? 0;
  }

  _buildAdjacencyFromGraph() {
    /** @type {Map<string, string[]>} */
    const adjacency = new Map();
    if (!this._graph) return adjacency;
    for (const node of this._graph.nodes) {
      adjacency.set(node.objectId, [...this._graph.dependenciesOf(node.objectId)]);
    }
    return adjacency;
  }
}

/** @returns {DependencyResolver} */
export function createDependencyResolver() {
  return new DependencyResolver();
}

export { DependencyError };
