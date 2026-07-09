/**
 * Formula Engine types (M14).
 * @see docs/runtime-implementation/03-INTERFACES.md#IFormulaEngine
 */

/**
 * @typedef {Object} FormulaDefinition
 * @property {string} code
 * @property {string} expr Expression text, evaluated via M13 Expression Engine.
 * @property {string[]} dependsOn Other formula codes that must be computed first.
 */

/**
 * @typedef {Object} IFormulaEngine
 * @property {(formula: string, fieldValues: Record<string, unknown>) => unknown} compute
 * @property {(formula: string) => string[]} getDependencies
 */

export {};
