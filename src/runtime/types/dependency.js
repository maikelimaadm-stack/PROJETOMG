/**
 * @typedef {Object} DependencyNode
 * @property {string} objectId
 * @property {string} objectType
 * @property {string} [moduleId]
 */

/**
 * @typedef {Object} CycleReport
 * @property {string[]} cycle
 * @property {string} message
 */

/**
 * @typedef {Object} ResolvedDependencyGraph
 * @property {DependencyNode[]} nodes
 * @property {string[]} initOrder
 * @property {number} dependencyCount
 * @property {number} maxDepth
 * @property {boolean} valid
 */

export {};
