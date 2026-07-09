/**
 * Expression Engine types (M13).
 * @see docs/runtime-implementation/03-INTERFACES.md#IExpressionEngine
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/**
 * @typedef {Object} IExpressionEngine
 * @property {(expr: string, bindings: Record<string, unknown>) => unknown} evaluate
 * @property {(expr: string) => ValidationResult} validate
 */

export {};
