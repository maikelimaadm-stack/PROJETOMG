import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  STUDIO_ENGINE_FIELD_TYPES,
  STUDIO_ENGINE_SCREEN_KINDS,
  STUDIO_ENGINE_PERMISSION_ACTIONS,
} from './createStudioDraftBlueprint.js';

const ID_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/;

/**
 * Structural validation of a (normalized) blueprint. Pure. Checks module identity,
 * field identity/type/uniqueness, screen kinds, permission actions and persistence
 * shape. Does NOT enforce safety invariants (that is validateStudioBlueprintSafety) or
 * hardening (validateStudioBlueprintAgainstHardening). Never a side effect.
 *
 * @param {Object} [blueprint]
 * @returns {Object} validation result
 */
export function validateStudioBlueprint(blueprint = {}) {
  const b = isGenericModelPlainObject(blueprint) ? blueprint : {};
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];

  if (!ID_RE.test(String(b.moduleId ?? ''))) errors.push('invalid moduleId');
  if (typeof b.moduleName !== 'string' || b.moduleName.length === 0) errors.push('missing moduleName');
  if (!['cadastro', 'operacional'].includes(String(b.modelType))) errors.push('invalid modelType');
  if (!['ModeloBase1', 'ModeloBase2'].includes(String(b.modelFamily))) errors.push('invalid modelFamily');

  const fields = Array.isArray(b.fields) ? b.fields : [];
  if (fields.length === 0) errors.push('at least one field required');
  const names = new Set();
  for (const f of fields) {
    if (!isGenericModelPlainObject(f)) { errors.push('field must be an object'); continue; }
    if (!ID_RE.test(String(f.name ?? ''))) errors.push(`invalid field name: ${String(f.name)}`);
    if (names.has(f.name)) errors.push(`duplicate field name: ${f.name}`);
    names.add(f.name);
    if (!STUDIO_ENGINE_FIELD_TYPES.includes(String(f.type))) errors.push(`invalid field type: ${String(f.type)} (${String(f.name)})`);
    if (f.searchable === true && !['text', 'select', 'status'].includes(String(f.type))) warnings.push(`searchable on non-text field: ${f.name}`);
  }

  const screens = Array.isArray(b.screens) ? b.screens : [];
  for (const s of screens) {
    if (!isGenericModelPlainObject(s)) { errors.push('screen must be an object'); continue; }
    if (!STUDIO_ENGINE_SCREEN_KINDS.includes(String(s.kind))) errors.push(`invalid screen kind: ${String(s.kind)}`);
  }

  const permissions = Array.isArray(b.permissions) ? b.permissions : [];
  let hasRead = false;
  for (const p of permissions) {
    if (!isGenericModelPlainObject(p)) { errors.push('permission must be an object'); continue; }
    if (!STUDIO_ENGINE_PERMISSION_ACTIONS.includes(String(p.action))) errors.push(`invalid permission action: ${String(p.action)}`);
    if (p.action === 'read') hasRead = true;
    if (p.action !== 'read' && p.enabled === true) errors.push(`mutation permission must not start enabled: ${p.action}`);
  }
  if (permissions.length > 0 && !hasRead) warnings.push('no read permission declared');

  const persistence = isGenericModelPlainObject(b.persistence) ? b.persistence : null;
  if (persistence) {
    if (persistence.migrationRequired === true) errors.push('migrationRequired must be false in engine foundation');
    if (persistence.referenceOnly !== true) errors.push('persistence must be referenceOnly');
  }

  const valid = errors.length === 0;
  return safeCloneGenericModel({
    kind: 'studio-blueprint-validation',
    valid,
    errors,
    warnings,
    fieldCount: fields.length,
    checkedFieldTypes: [...STUDIO_ENGINE_FIELD_TYPES],
    readiness: valid ? 'structurally_valid' : 'invalid',
  });
}

export default validateStudioBlueprint;
