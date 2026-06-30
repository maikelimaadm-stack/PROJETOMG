/** Validation Engine — registrable rules, errors, warnings, suggestions, optimizations (Program 2.2.5) */

export const VALIDATION_ENGINE_VERSION = "mak-validation-engine-v1";

/**
 * @typedef {object} ValidationIssue
 * @property {"error"|"warning"|"suggestion"|"optimization"} severity
 * @property {string} code
 * @property {string} message
 * @property {string} [targetId]
 */

export function createValidationEngine() {
  /** @type {Map<string, { id: string, severity: string, validate: Function }>} */
  const rules = new Map();

  const registerRule = ({ id, severity = "error", validate }) => {
    if (!id || typeof validate !== "function") {
      throw new Error("Validation rule requires id and validate function.");
    }
    rules.set(id, { id, severity, validate });
    return id;
  };

  const unregisterRule = (id) => rules.delete(id);

  const validate = (document, context = {}) => {
    /** @type {ValidationIssue[]} */
    const errors = [];
    /** @type {ValidationIssue[]} */
    const warnings = [];
    /** @type {ValidationIssue[]} */
    const suggestions = [];
    /** @type {ValidationIssue[]} */
    const optimizations = [];

    rules.forEach((rule) => {
      const issues = rule.validate(document, context) ?? [];
      issues.forEach((issue) => {
        const entry = { severity: issue.severity ?? rule.severity, ...issue };
        if (entry.severity === "error") errors.push(entry);
        else if (entry.severity === "warning") warnings.push(entry);
        else if (entry.severity === "suggestion") suggestions.push(entry);
        else if (entry.severity === "optimization") optimizations.push(entry);
      });
    });

    return Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
      suggestions: Object.freeze(suggestions),
      optimizations: Object.freeze(optimizations),
      errorCount: errors.length,
      warningCount: warnings.length,
      suggestionCount: suggestions.length,
      optimizationCount: optimizations.length,
    });
  };

  return Object.freeze({
    version: VALIDATION_ENGINE_VERSION,
    registerRule,
    unregisterRule,
    validate,
    listRules: () => [...rules.keys()],
  });
}

export default createValidationEngine;
