/**
 * Extracts dependency edges from CRB MMM object envelopes.
 */
export class DependencyAnalyzer {
  /**
   * @param {unknown} object
   * @returns {string[]}
   */
  static extractDependencies(object) {
    const envelope = /** @type {{dependencies?: Record<string, unknown>}} */ (object);
    const deps = envelope.dependencies ?? {};
    const refs = [
      ...(Array.isArray(deps.possess) ? deps.possess : []),
      ...(Array.isArray(deps.use) ? deps.use : []),
      ...(Array.isArray(deps.reference) ? deps.reference : []),
      ...(Array.isArray(deps.depend) ? deps.depend : []),
      ...(Array.isArray(deps.inherit)
        ? deps.inherit.map((item) => (typeof item === 'string' ? item : item?.objectId))
        : []),
    ];
    return refs.filter((ref) => typeof ref === 'string' && ref.length > 0);
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @returns {{ nodes: import('../../types/dependency.js').DependencyNode[], adjacency: Map<string, string[]> }}
   */
  static buildFromCrb(crb) {
    /** @type {import('../../types/dependency.js').DependencyNode[]} */
    const nodes = (crb.objects ?? []).map((obj) => {
      const record = /** @type {{objectId: string, objectType?: string, scope?: {moduleId?: string}}} */ (obj);
      return {
        objectId: record.objectId,
        objectType: record.objectType ?? 'unknown',
        moduleId: record.scope?.moduleId ?? crb.moduleId,
      };
    });

    const nodeIds = new Set(nodes.map((node) => node.objectId));
    /** @type {Map<string, string[]>} */
    const adjacency = new Map();

    for (const node of nodes) {
      adjacency.set(node.objectId, []);
    }

    for (const obj of crb.objects ?? []) {
      const record = /** @type {{objectId: string}} */ (obj);
      const deps = DependencyAnalyzer.extractDependencies(obj);
      for (const depId of deps) {
        adjacency.get(record.objectId)?.push(depId);
      }
    }

    return { nodes, adjacency };
  }
}
