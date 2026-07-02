/**
 * UEC-aligned shared types (mak-uec-v1).
 * @see docs/platform-protocol/02-UNIVERSAL-CONTEXT.md
 */

/**
 * @typedef {Object} CompanyRef
 * @property {string} companyId
 * @property {string} [companyCode]
 */

/**
 * @typedef {Object} AccessScope
 * @property {string} tenantId
 * @property {string} userId
 * @property {CompanyRef[]} companies
 * @property {string[]} permissions
 * @property {string} locale
 */

/**
 * @typedef {Object} AuthCredentials
 * @property {string} username
 * @property {string} password
 * @property {string} tenantId
 * @property {string} [locale]
 */

/**
 * @typedef {Object} ContextScope
 * @property {string} [tenantId]
 * @property {string} [userId]
 * @property {string} [traceId]
 * @property {string} [locale]
 * @property {string} [selectedCompanyId]
 * @property {AccessScope} [accessScope]
 */

export {};
