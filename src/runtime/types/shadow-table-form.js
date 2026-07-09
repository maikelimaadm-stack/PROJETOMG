/**
 * @typedef {Object} TableFormFieldDescriptor
 * @property {string} id
 * @property {string} [label]
 * @property {string} type
 * @property {boolean} [required]
 * @property {string} [permission]
 * @property {{ rules?: string[] }} [validation]
 */

/**
 * @typedef {Object} TableColumnDescriptor
 * @property {string} id
 * @property {string} [label]
 * @property {boolean} [sortable]
 * @property {boolean} [filterable]
 * @property {boolean} [visible]
 */

/**
 * @typedef {Object} ActionMetadata
 * @property {string} id
 * @property {'action'|'workflow'} kind
 * @property {string} ref
 */

/**
 * @typedef {Object} TableFormDescriptor
 * @property {string} moduleId
 * @property {string} entityName
 * @property {TableFormFieldDescriptor[]} fields
 * @property {{ columns?: TableColumnDescriptor[], actions?: ActionMetadata[] }} [table]
 * @property {{ actions?: ActionMetadata[], workflows?: Array<{id: string, ref: string}> }} [form]
 * @property {string[]} [requiredFields]
 * @property {Record<string, unknown>} [meta]
 */

/**
 * @typedef {Object} TableProjection
 * @property {Array<{id: string, label: string, sortable: boolean, filterable: boolean, visible: boolean}>} columns
 * @property {string[]} visibleColumns
 * @property {ActionMetadata[]} actions Metadata only — never dispatched.
 */

/**
 * @typedef {Object} FormFieldProjection
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {boolean} required
 * @property {string} [permission]
 * @property {{ rules: string[], source: string }} validation
 * @property {boolean} permitted
 * @property {boolean} denied
 */

/**
 * @typedef {Object} FormProjection
 * @property {FormFieldProjection[]} fields
 * @property {string[]} visibleFields
 * @property {boolean} permissionsApplied
 * @property {ActionMetadata[]} actions Metadata only.
 * @property {Array<{id: string, ref: string}>} workflows Metadata only — never started.
 */

/**
 * @typedef {Object} ShadowRenderNode
 * @property {string} type
 * @property {string} component
 * @property {boolean} [intermediate]
 * @property {ShadowRenderNode[]|Object[]} [children]
 */

/**
 * @typedef {Object} TableFormProjectionResult
 * @property {string} moduleId
 * @property {string} entityName
 * @property {'legacy'|'v2'} runtime
 * @property {boolean} renderEngineWired
 * @property {TableProjection} table
 * @property {FormProjection} form
 * @property {ShadowRenderNode} renderTree
 * @property {Record<string, unknown>} meta
 */

/**
 * @typedef {Object} EmpresasTableFormShadowReport
 * @property {boolean} skipped
 * @property {string} moduleId
 * @property {boolean} [ok]
 * @property {boolean} [equivalent]
 * @property {import('./shadow.js').ShadowComparison} [comparison]
 * @property {{name: string, message: string}} [error]
 * @property {number} timestamp
 * @property {string} [reason]
 */

export {};
