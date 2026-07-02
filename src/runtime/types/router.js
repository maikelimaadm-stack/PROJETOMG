/**
 * @typedef {Object} RouteEntry
 * @property {string} path
 * @property {string} objectId
 * @property {string} [screenId]
 * @property {string} [layoutId]
 * @property {string} [moduleId]
 * @property {string} [applicationId]
 */

/**
 * @typedef {Object} RouteMatch
 * @property {string} path
 * @property {string} screenId
 * @property {string} [layoutId]
 * @property {Record<string, string>} params
 * @property {string} [moduleId]
 */

/**
 * @typedef {Object} RouteTarget
 * @property {string} path
 * @property {Record<string, string>} [params]
 */

/**
 * @typedef {Object} NavigationTable
 * @property {RouteEntry[]} routes
 * @property {string} applicationId
 * @property {number} routeCount
 */

export {};
