import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES } from './studioBlueprintEngineConfig.js';
import { studioBlueprintEngineDigest } from './createStudioBlueprintEngineDigest.js';

const byName = (a, b) => String(a.name).localeCompare(String(b.name));
const byKind = (a, b) => String(a.kind).localeCompare(String(b.kind));
const byAction = (a, b) => String(a.action).localeCompare(String(b.action));

/**
 * Canonicalizes a draft blueprint into a deterministic, comparable shape: fields sorted
 * by name, screens by kind, permissions by action; string values trimmed; duplicate
 * field names collapsed (first wins) and reported. Pure; never mutates the input; never
 * a side effect. Sets `state: 'normalized'` and a stable `normalizedDigest`.
 *
 * @param {Object} [blueprint] a draft blueprint
 * @returns {Object} normalized blueprint descriptor
 */
export function normalizeStudioBlueprint(blueprint = {}) {
  const b = isGenericModelPlainObject(blueprint) ? blueprint : {};

  const fieldsIn = Array.isArray(b.fields) ? b.fields.filter(isGenericModelPlainObject) : [];
  const seen = new Set();
  const collapsedDuplicates = [];
  const fields = [];
  for (const f of fieldsIn) {
    const name = String(f.name ?? '').trim();
    if (seen.has(name)) { collapsedDuplicates.push(name); continue; }
    seen.add(name);
    fields.push({
      name,
      type: String(f.type ?? 'text').trim(),
      label: String(f.label ?? name).trim(),
      required: f.required === true,
      unique: f.unique === true,
      sortable: f.sortable === true,
      filterable: f.filterable === true,
      searchable: f.searchable === true,
      tenantScoped: f.tenantScoped === true,
      protectedField: (f.protectedField ?? f.protected) === true,
    });
  }
  fields.sort(byName);

  const screens = (Array.isArray(b.screens) ? b.screens.filter(isGenericModelPlainObject) : []).map((s) => ({
    kind: String(s.kind ?? 'table').trim(),
    title: String(s.title ?? '').trim(),
    readOnly: s.readOnly === undefined ? true : s.readOnly === true,
  })).sort(byKind);

  const permissions = (Array.isArray(b.permissions) ? b.permissions.filter(isGenericModelPlainObject) : []).map((p) => ({
    action: String(p.action ?? 'read').trim(),
    level: String(p.level ?? 'module').trim(),
    enabled: String(p.action ?? 'read').trim() === 'read' ? p.enabled === true || p.enabled === undefined : false,
  })).sort(byAction);

  const persistenceIn = isGenericModelPlainObject(b.persistence) ? b.persistence : {};
  const persistence = {
    boundary: String(persistenceIn.boundary ?? 'noPersistence').trim(),
    migrationRequired: false,
    backendRequired: persistenceIn.backendRequired === true,
    referenceOnly: true,
  };

  const runtimeBindingIn = isGenericModelPlainObject(b.runtimeBinding) ? b.runtimeBinding : {};
  const runtimeBinding = {
    type: String(runtimeBindingIn.type ?? b.modelType ?? 'cadastro').trim(),
    target: String(runtimeBindingIn.target ?? b.modelFamily ?? 'ModeloBase1').trim(),
    referenceOnly: true,
    activatesProduction: false,
    registersModule: false,
  };

  const core = {
    kind: 'studio-normalized-blueprint',
    state: 'normalized',
    moduleId: String(b.moduleId ?? 'draftModule').trim(),
    moduleName: String(b.moduleName ?? b.moduleId ?? 'draftModule').trim(),
    modelType: String(b.modelType ?? 'cadastro').trim(),
    modelFamily: String(b.modelFamily ?? 'ModeloBase1').trim(),
    fields,
    screens,
    permissions,
    persistence,
    runtimeBinding,
    fieldCount: fields.length,
    screenCount: screens.length,
    permissionCount: permissions.length,
    collapsedDuplicates,
  };

  return safeCloneGenericModel({
    ...core,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    blueprintId: `${core.moduleId}#normalized`,
    normalizedDigest: studioBlueprintEngineDigest(core),
  });
}

export default normalizeStudioBlueprint;
