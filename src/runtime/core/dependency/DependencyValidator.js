import { DependencyError } from './errors.js';

export class DependencyValidator {
  /**
   * @param {import('../../types/dependency.js').DependencyNode[]} nodes
   * @param {Map<string, string[]>} adjacency
   * @param {string[]} [requiredModules]
   */
  static validateReferences(nodes, adjacency, requiredModules = []) {
    const nodeIds = new Set(nodes.map((node) => node.objectId));
    const missing = [];

    for (const [objectId, deps] of adjacency.entries()) {
      for (const depId of deps) {
        if (!nodeIds.has(depId)) {
          missing.push({ objectId, depId });
        }
      }
    }

    if (missing.length > 0) {
      const detail = missing.map((item) => `${item.objectId}→${item.depId}`).join(', ');
      throw new DependencyError('MAK-L3-DEP-002', `Unresolved dependency references: ${detail}`);
    }

    if (requiredModules.length > 0) {
      const moduleIds = new Set(nodes.map((node) => node.moduleId).filter(Boolean));
      for (const moduleId of requiredModules) {
        if (!moduleIds.has(moduleId)) {
          throw new DependencyError('MAK-L3-DEP-003', `Required module missing from graph: ${moduleId}`);
        }
      }
    }
  }
}
