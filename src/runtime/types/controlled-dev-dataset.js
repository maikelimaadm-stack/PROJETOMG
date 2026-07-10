/**
 * @typedef {Object} ControlledRecordSpec
 * @property {string} id
 * @property {string[]} [deniedFields]
 * @property {Record<string, unknown>} values
 */

/**
 * @typedef {Object} ControlledModuleSpec
 * @property {string} moduleId
 * @property {string[]} columns
 * @property {string[]} requiredFields
 * @property {ControlledRecordSpec[]} records
 * @property {Record<string, unknown>} [metadata]
 */

/**
 * @typedef {Object} ControlledRecord
 * @property {string} id
 * @property {boolean} valid
 * @property {string[]} deniedFields
 * @property {string[]} missingRequired
 * @property {Record<string, unknown>} values Masked; denied fields blanked.
 */

/**
 * @typedef {Object} ControlledDatasetModuleDiagnostics
 * @property {string[]} warnings
 * @property {number} recordCount
 * @property {number} validCount
 * @property {number} invalidCount
 * @property {number} deniedFieldCount
 */

/**
 * @typedef {Object} ControlledModuleDataset
 * @property {string} moduleId
 * @property {'controlled-dev-dataset'} source
 * @property {string[]} columns
 * @property {string[]} requiredFields
 * @property {ControlledRecord[]} records
 * @property {Array<{id: string, valid: boolean, cells: Record<string, unknown>}>} tableRows
 * @property {Record<string, Record<string, unknown>>} formValues
 * @property {Record<string, {valid: boolean, missingRequired: string[]}>} validationStates
 * @property {Record<string, {deniedFields: string[]}>} permissionStates
 * @property {ControlledDatasetModuleDiagnostics} diagnostics
 * @property {Record<string, unknown>} metadata
 */

/**
 * @typedef {Object} ControlledDatasetDiagnostics
 * @property {boolean} enabled
 * @property {number} moduleCount
 * @property {Record<string, ControlledDatasetModuleDiagnostics>} modules
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} ControlledDatasetModuleSummary
 * @property {'available'} datasetStatus
 * @property {number} recordCount
 * @property {number} validCount
 * @property {number} invalidCount
 * @property {number} deniedFieldCount
 * @property {{id: string, valid: boolean, cells: Record<string, unknown>}|null} sampleRowPreview
 * @property {ControlledDatasetModuleDiagnostics} datasetDiagnostics
 */

export {};
