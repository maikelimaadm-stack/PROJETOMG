/**
 * @typedef {Object} DevPreviewStatus
 * @property {boolean} enabled
 * @property {boolean} devOnly
 * @property {boolean} skipped
 */

/**
 * @typedef {Object} DevPreviewColumn
 * @property {string} id
 * @property {string} label
 * @property {boolean} sortable
 * @property {boolean} filterable
 * @property {boolean} visible
 */

/**
 * @typedef {Object} DevPreviewTable
 * @property {DevPreviewColumn[]} columns
 * @property {Array<{kind: string, cells: string[]}>} rows Structural header row only — never real data.
 */

/**
 * @typedef {Object} DevPreviewField
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {boolean} required
 * @property {string} permission
 * @property {boolean} denied
 * @property {string[]} validationRules
 */

/**
 * @typedef {Object} DevPreviewForm
 * @property {DevPreviewField[]} fields
 */

/**
 * @typedef {Object} DevPreviewDiagnostics
 * @property {string[]} warnings
 * @property {Array<{path: string}>} differences
 * @property {string[]} deniedFields
 * @property {string[]} missingLabels
 * @property {string[]} invalidMetadata
 * @property {string[]} unsupportedFeatures
 */

/**
 * Deterministic, plain, render-ready dev view model — consumed by the
 * dev-only React components. Never a DOM node, never executes anything.
 * @typedef {Object} EmpresasDevViewModel
 * @property {string} header
 * @property {boolean} valid
 * @property {DevPreviewStatus} status
 * @property {DevPreviewTable} table
 * @property {DevPreviewForm} form
 * @property {DevPreviewDiagnostics} diagnostics
 * @property {Array<{path: string}>} differences
 * @property {Array<{id: string, kind: string, ref: string, label: string}>} actions Text metadata only.
 * @property {Array<{id: string, ref: string, label: string}>} workflows Text metadata only.
 * @property {Record<string, unknown>} metadata
 */

export {};
