import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { compareStudioBlueprints } from './compareStudioBlueprints.js';

/**
 * Classifies the compatibility between two blueprint versions. Pure. Uses the structural
 * diff from `compareStudioBlueprints` and maps it to one of:
 *   - `invalid`             — either side is not a plain object.
 *   - `breaking`            — a field/permission was removed, a field was retyped, a
 *                             field became required, or moduleId/modelFamily changed.
 *   - `backward_compatible` — only additive changes (new optional fields / permissions).
 *   - `compatible`          — identical.
 * Never a side effect.
 *
 * @param {Object} [options]
 * @param {Object} [options.current]
 * @param {Object} [options.next]
 * @returns {Object} compatibility result
 */
export function checkStudioBlueprintEngineCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  if (!isGenericModelPlainObject(o.current) || !isGenericModelPlainObject(o.next)) {
    return safeCloneGenericModel({
      kind: 'studio-blueprint-engine-compatibility',
      classification: 'invalid',
      compatible: false,
      requiresMajorVersion: false,
      breakingChanges: ['non-object blueprint'],
      backwardCompatibleChanges: [],
      diff: null,
    });
  }

  const diff = compareStudioBlueprints(o.current, o.next);
  /** @type {string[]} */ const breakingChanges = [];
  /** @type {string[]} */ const backwardCompatibleChanges = [];

  for (const f of diff.removedFields) breakingChanges.push(`field removed: ${f}`);
  for (const r of diff.retypedFields) breakingChanges.push(`field retyped: ${r.field} (${r.from}→${r.to})`);
  for (const f of diff.nowRequiredFields) breakingChanges.push(`field now required: ${f}`);
  for (const p of diff.removedPermissions) breakingChanges.push(`permission removed: ${p}`);
  if (diff.moduleIdChanged) breakingChanges.push('moduleId changed');
  if (diff.modelFamilyChanged) breakingChanges.push('modelFamily changed');

  for (const f of diff.addedFields) backwardCompatibleChanges.push(`field added: ${f}`);
  for (const p of diff.addedPermissions) backwardCompatibleChanges.push(`permission added: ${p}`);

  let classification;
  if (breakingChanges.length > 0) classification = 'breaking';
  else if (diff.identical) classification = 'compatible';
  else classification = 'backward_compatible';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-compatibility',
    classification,
    compatible: classification === 'compatible' || classification === 'backward_compatible',
    requiresMajorVersion: classification === 'breaking',
    requiresMinorVersion: classification === 'backward_compatible',
    breakingChanges,
    backwardCompatibleChanges,
    diff,
  });
}

export default checkStudioBlueprintEngineCompatibility;
