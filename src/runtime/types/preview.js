/**
 * @typedef {Object} PreviewColumn
 * @property {string} id
 * @property {string} label
 * @property {boolean} sortable
 * @property {boolean} filterable
 * @property {boolean} visible
 */

/**
 * @typedef {Object} PreviewTable
 * @property {PreviewColumn[]} columns
 * @property {string[]} visibleColumns
 * @property {Record<string, string>} headerLabels
 * @property {Record<string, {sortable: boolean, filterable: boolean}>} cellMetadata
 * @property {import('./shadow-table-form.js').ActionMetadata[]} rowActions Metadata only — never dispatched.
 */

/**
 * @typedef {Object} PreviewField
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {boolean} required
 * @property {string} [permission]
 * @property {boolean} permitted
 * @property {boolean} denied
 * @property {{ rules: string[], source: string }} validation
 */

/**
 * @typedef {Object} PreviewFormSection
 * @property {string} id
 * @property {string} label
 * @property {string[]} fields
 */

/**
 * @typedef {Object} PreviewForm
 * @property {PreviewField[]} fields
 * @property {string[]} visibleFields
 * @property {PreviewFormSection[]} sections
 * @property {import('./shadow-table-form.js').ActionMetadata[]} formActions Metadata only.
 * @property {Array<{id: string, ref: string}>} formWorkflows Metadata only — never started.
 */

/**
 * @typedef {Object} PreviewDiagnostics
 * @property {string[]} warnings
 * @property {Array<{path: string}>} differences
 * @property {string[]} deniedFields
 * @property {string[]} missingLabels
 * @property {string[]} invalidMetadata
 * @property {string[]} unsupportedFeatures
 */

/**
 * Isolated, plain-object preview model — NOT a DOM node, NOT a React element,
 * never rendered into the production DOM.
 * @typedef {Object} PreviewModel
 * @property {string} moduleId
 * @property {string} entityName
 * @property {'preview-model'} kind
 * @property {boolean} isPreviewModel
 * @property {PreviewTable} table
 * @property {PreviewForm} form
 * @property {PreviewDiagnostics} diagnostics
 * @property {Record<string, unknown>} meta
 */

/**
 * @typedef {Object} ControlledPreviewReport
 * @property {boolean} skipped
 * @property {string} moduleId
 * @property {boolean} [ok]
 * @property {PreviewModel} [previewModel]
 * @property {{name: string, message: string}} [error]
 * @property {number} timestamp
 * @property {string} [reason]
 */

export {};
