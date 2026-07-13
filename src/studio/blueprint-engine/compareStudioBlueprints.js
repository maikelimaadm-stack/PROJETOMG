import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { studioBlueprintEngineDigest } from './createStudioBlueprintEngineDigest.js';

const fieldMap = (bp) => {
  const map = new Map();
  const fields = Array.isArray(bp?.fields) ? bp.fields : [];
  for (const f of fields) if (isGenericModelPlainObject(f) && typeof f.name === 'string') map.set(f.name, f);
  return map;
};

/**
 * Compares two (normalized) blueprints structurally: added/removed/retyped fields,
 * fields that gained `required`, and permission action deltas. Pure. Produces a stable
 * `compareDigest`. Never a side effect. This is a structural diff only; the
 * compatibility CLASSIFICATION (compatible/backward_compatible/breaking) is decided by
 * checkStudioBlueprintEngineCompatibility using this diff.
 *
 * @param {Object} [current]
 * @param {Object} [next]
 * @returns {Object} comparison descriptor
 */
export function compareStudioBlueprints(current = {}, next = {}) {
  const c = isGenericModelPlainObject(current) ? current : {};
  const n = isGenericModelPlainObject(next) ? next : {};
  const cm = fieldMap(c);
  const nm = fieldMap(n);

  const addedFields = [];
  const removedFields = [];
  const retypedFields = [];
  const nowRequiredFields = [];

  for (const name of nm.keys()) if (!cm.has(name)) addedFields.push(name);
  for (const name of cm.keys()) if (!nm.has(name)) removedFields.push(name);
  for (const [name, cf] of cm.entries()) {
    const nf = nm.get(name);
    if (!nf) continue;
    if (cf.type !== nf.type) retypedFields.push({ field: name, from: cf.type, to: nf.type });
    if (cf.required !== true && nf.required === true) nowRequiredFields.push(name);
  }

  const cActions = new Set((Array.isArray(c.permissions) ? c.permissions : []).map((p) => p?.action));
  const nActions = new Set((Array.isArray(n.permissions) ? n.permissions : []).map((p) => p?.action));
  const addedPermissions = [...nActions].filter((a) => a && !cActions.has(a));
  const removedPermissions = [...cActions].filter((a) => a && !nActions.has(a));

  const moduleIdChanged = String(c.moduleId ?? '') !== String(n.moduleId ?? '');
  const modelFamilyChanged = String(c.modelFamily ?? '') !== String(n.modelFamily ?? '');

  const core = {
    kind: 'studio-blueprint-comparison',
    addedFields: addedFields.sort(),
    removedFields: removedFields.sort(),
    retypedFields,
    nowRequiredFields: nowRequiredFields.sort(),
    addedPermissions: addedPermissions.sort(),
    removedPermissions: removedPermissions.sort(),
    moduleIdChanged,
    modelFamilyChanged,
    identical: addedFields.length === 0 && removedFields.length === 0 && retypedFields.length === 0
      && nowRequiredFields.length === 0 && addedPermissions.length === 0 && removedPermissions.length === 0
      && !moduleIdChanged && !modelFamilyChanged,
  };

  return safeCloneGenericModel({ ...core, compareDigest: studioBlueprintEngineDigest(core) });
}

export default compareStudioBlueprints;
