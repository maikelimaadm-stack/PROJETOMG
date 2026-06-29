/**
 * Studio Designer Contract — official contract for designer plugins.
 * Shell registers designers without structural modification.
 */

/**
 * @typedef {object} StudioDesignerContract
 * @property {string} designerId
 * @property {string} label
 * @property {string[]} supportedEntryTypes
 * @property {string[]} supportedBaseTemplates
 * @property {string[]} [requiredCapabilities]
 * @property {() => unknown} [mount]
 * @property {(entryId: string | null) => void} [onSelectionChange]
 */

/**
 * @param {StudioDesignerContract} designer
 */
export function validateStudioDesigner(designer) {
  const errors = [];

  if (!designer || typeof designer !== "object") {
    return { valid: false, errors: ["Designer contract must be an object."] };
  }
  if (!designer.designerId || typeof designer.designerId !== "string") {
    errors.push("designerId is required.");
  }
  if (!designer.label || typeof designer.label !== "string") {
    errors.push("label is required.");
  }
  if (!Array.isArray(designer.supportedEntryTypes) || designer.supportedEntryTypes.length < 1) {
    errors.push("supportedEntryTypes must be a non-empty array.");
  }
  if (!Array.isArray(designer.supportedBaseTemplates) || designer.supportedBaseTemplates.length < 1) {
    errors.push("supportedBaseTemplates must be a non-empty array.");
  }
  if (designer.mount != null && typeof designer.mount !== "function") {
    errors.push("mount must be a function when provided.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {StudioDesignerContract} designer
 */
export function defineStudioDesigner(designer) {
  const validation = validateStudioDesigner(designer);
  if (!validation.valid) {
    throw new Error(`defineStudioDesigner: ${validation.errors.join(" ")}`);
  }
  return Object.freeze({ ...designer });
}

export default validateStudioDesigner;
