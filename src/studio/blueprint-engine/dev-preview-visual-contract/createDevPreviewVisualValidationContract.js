import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the VISUAL VALIDATION contract. Pure, metadata-only. Describes which visual fields
 * WOULD carry validation hints (required / read-only / protected) — as metadata for a future
 * preview. It runs NO validation, executes NO code, and mutates nothing.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} visual validation contract
 */
export function createDevPreviewVisualValidationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : {};
  const formFields = Array.isArray(bridge.formBridge?.fields) ? bridge.formBridge.fields.filter(isGenericModelPlainObject) : [];

  const rules = formFields.map((f) => ({
    field: f.name,
    required: f.required === true,
    readOnly: f.readOnly === true || f.protectedField === true,
    protectedField: f.protectedField === true,
    executesCode: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-visual-validation-contract',
    moduleId: String(bridge.moduleId ?? 'plannedModule'),
    rules,
    protectedRemainReadOnly: rules.filter((r) => r.protectedField).every((r) => r.readOnly === true),
    executesValidation: false,
    mutatesData: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualValidationDigest: visualDigest(core) });
}

export default createDevPreviewVisualValidationContract;
