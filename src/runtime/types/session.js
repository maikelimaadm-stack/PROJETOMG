/**
 * @typedef {Object} AuthCredentials
 * @property {string} username
 * @property {string} password
 * @property {string} tenantId
 * @property {string} [locale]
 */

/**
 * @typedef {Object} ISessionManager
 * @property {(credentials: AuthCredentials) => Promise<import('./uec.js').AccessScope>} authenticate
 * @property {() => Promise<import('./uec.js').AccessScope>} refresh
 * @property {() => Promise<void>} logout
 * @property {() => import('./uec.js').AccessScope | null} getAccessScope
 */

export {};
