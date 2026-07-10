import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../pilots/tableFormProjection.js';
import { GenericModuleShadowError } from './errors.js';

/** @param {string} code @param {string} message */
function genericError(code, message) {
  return new GenericModuleShadowError(/** @type {any} */ (code), message);
}

/** @param {unknown} value @param {string} label */
function guard(value, label) {
  // Remap the shared guard's code to the generic module code while keeping the message.
  validateProjectionInput(value, 0, label, (_c, message) => genericError('MAK-L3-GENERIC-SHADOW-001', message));
}

/**
 * Validates a generic CRUD module descriptor. Throws `GenericModuleShadowError`
 * for a structurally invalid descriptor or a prototype-pollution attempt. A
 * descriptor is a PLAIN, side-effect-free object — it must never carry a
 * function (no action/workflow/connector handle) or real data.
 * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} descriptor
 * @returns {true}
 */
export function validateGenericModuleDescriptor(descriptor) {
  if (!isPlainObject(descriptor)) {
    throw genericError('MAK-L3-GENERIC-SHADOW-001', 'Generic module descriptor must be a plain object');
  }
  guard(descriptor, 'Generic module descriptor');
  if (typeof descriptor.moduleId !== 'string' || descriptor.moduleId.length === 0) {
    throw genericError('MAK-L3-GENERIC-SHADOW-001', 'Generic module descriptor requires a non-empty moduleId');
  }
  if (!Array.isArray(descriptor.fields)) {
    throw genericError('MAK-L3-GENERIC-SHADOW-001', 'Generic module descriptor requires a fields array');
  }
  // No descriptor value may be a function — descriptors are pure metadata, never behavior.
  assertNoFunctions(descriptor, 'descriptor');
  return true;
}

/** @param {unknown} value @param {string} path */
function assertNoFunctions(value, path) {
  if (typeof value === 'function') {
    throw genericError('MAK-L3-GENERIC-SHADOW-001', `Generic module descriptor must not contain a function (at ${path})`);
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoFunctions(v, `${path}[${i}]`));
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) assertNoFunctions(v, `${path}.${k}`);
  }
}

/**
 * Normalizes a generic module descriptor into a deterministic, masked, plain
 * shape suitable for the shadow/projection layer. Sensitive keys in `meta` are
 * masked; the result is a deep clone (never a reference to the input).
 * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} descriptor
 * @returns {import('../../types/generic-module-shadow.js').GenericModuleDescriptor}
 */
export function normalizeGenericModuleDescriptor(descriptor) {
  validateGenericModuleDescriptor(descriptor);
  const d = /** @type {any} */ (safeClone(descriptor));
  return {
    moduleId: String(d.moduleId),
    moduleName: typeof d.moduleName === 'string' ? d.moduleName : String(d.moduleId),
    entityName: typeof d.entityName === 'string' ? d.entityName : '',
    fields: Array.isArray(d.fields) ? d.fields : [],
    table: isPlainObject(d.table) ? d.table : { columns: [], actions: [] },
    form: isPlainObject(d.form) ? d.form : { actions: [], workflows: [] },
    requiredFields: Array.isArray(d.requiredFields) ? d.requiredFields : [],
    meta: /** @type {Record<string, unknown>} */ (redactSensitive(d.meta ?? {})),
  };
}
