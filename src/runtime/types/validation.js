/**
 * Validation Engine types (M15).
 * @see docs/runtime-implementation/03-INTERFACES.md#IValidationEngine
 */

/**
 * @typedef {'required'|'type'|'min'|'max'|'minLength'|'maxLength'|'pattern'|'enum'|'custom'} ValidationRuleName
 */

/**
 * @typedef {Object} ValidationRule
 * @property {ValidationRuleName} rule
 * @property {string} [field] Field code this rule targets (registry-driven validation sets).
 * @property {'string'|'number'|'boolean'|'date'|'object'|'array'} [type]
 * @property {number} [value] Numeric threshold for `min`/`max`.
 * @property {number} [length] Length threshold for `minLength`/`maxLength`.
 * @property {string} [pattern] Regex source for `pattern`.
 * @property {string} [flags] Regex flags for `pattern`.
 * @property {unknown[]} [values] Allowed values for `enum`.
 * @property {string} [expr] Expression text for `custom` (evaluated via M13 Expression Engine).
 * @property {string} [message] Optional custom error message, overrides the default.
 * @property {'error'|'warning'} [severity] Default 'error'.
 */

/**
 * @typedef {Object} ValidationErrorEntry
 * @property {string} code
 * @property {string} [field]
 * @property {string} [rule]
 * @property {string} message
 * @property {'error'|'warning'} [severity]
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {ValidationErrorEntry[]} errors
 * @property {ValidationErrorEntry[]} [warnings]
 */

/**
 * @typedef {Object} IValidationEngine
 * @property {(rules: ValidationRule[], value: unknown, ctx: unknown) => ValidationResult} validateSync
 * @property {(rules: ValidationRule[], value: unknown, ctx: unknown) => Promise<ValidationResult>} validateAsync
 */

export {};
