/**
 * @typedef {Object} ModuleAvailability
 * @property {string} id Module id, e.g. "M09".
 * @property {string} name
 * @property {'available'|'missing'} status
 */

/**
 * @typedef {Object} ServiceAvailability
 * @property {string} name
 * @property {boolean} available
 */

/**
 * @typedef {Object} GateManifestEntry
 * @property {string} id
 * @property {string} scriptPath
 */

/**
 * @typedef {Object} GateAvailability
 * @property {string} id
 * @property {string} scriptPath
 * @property {boolean} exists
 */

/**
 * @typedef {Object} FoundationCReport
 * @property {ModuleAvailability[]} modules
 * @property {number} availableCount
 * @property {number} missingCount
 * @property {number} generatedAt
 */

export {};
