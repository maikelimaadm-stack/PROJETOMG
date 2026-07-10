/**
 * @typedef {Object} HubModuleEntry
 * @property {string} moduleId
 * @property {string} moduleName
 * @property {string} source
 * @property {boolean} ok
 * @property {{name: string, message: string}} [error]
 * @property {import('./preview.js').PreviewModel} [previewModel]
 * @property {{ columnCount: number, visibleColumns: string[], columns: Array<{id: string, label: string, sortable: boolean, filterable: boolean, visible: boolean}> }} table
 * @property {{ fieldCount: number, visibleFields: string[], fields: Array<{id: string, label: string, type: string, required: boolean, permission: string, denied: boolean}> }} form
 * @property {import('./preview.js').PreviewDiagnostics} diagnostics
 * @property {Array<{path: string}>} differences
 * @property {Array<{id: string, kind: string, ref: string, label: string}>} actions Text metadata only.
 * @property {Array<{id: string, ref: string, label: string}>} workflows Text metadata only.
 * @property {Record<string, unknown>} metadata
 */

/**
 * @typedef {Object} RuntimeV2DevPreviewHubModel
 * @property {'runtime-v2-dev-preview-hub'} kind
 * @property {{ enabled: boolean, devOnly: boolean, moduleCount: number, mocked: boolean }} status
 * @property {'production'|'development'} environment
 * @property {{ hubFlag: string, hubEnabled: boolean }} flags
 * @property {HubModuleEntry[]} modules
 * @property {{ warnings: string[], totalModules: number, availableModules: number }} diagnostics
 * @property {string[]} warnings
 * @property {string[]} limitations
 */

export {};
