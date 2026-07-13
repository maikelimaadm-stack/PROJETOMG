import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
} from './studioBlueprintEngineConfig.js';
import { studioBlueprintEngineDigest } from './createStudioBlueprintEngineDigest.js';

/** Canonical field types the engine understands (mirrors the certified contract). */
export const STUDIO_ENGINE_FIELD_TYPES = [
  'text', 'number', 'decimal', 'date', 'datetime', 'boolean', 'select', 'multiSelect',
  'relation', 'computed', 'money', 'percentage', 'filePlaceholder', 'status',
];

/** Canonical screen kinds. */
export const STUDIO_ENGINE_SCREEN_KINDS = ['table', 'form', 'detail'];

/** Canonical permission actions. */
export const STUDIO_ENGINE_PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete', 'export', 'configure'];

const asString = (v, fallback) => (typeof v === 'string' && v.length > 0 ? v : fallback);
const asBool = (v) => v === true;

/**
 * Builds a DRAFT blueprint from a plain description. Pure: no I/O, no mutation of input,
 * no side effects. The result is a self-describing, headless object with a stable
 * `draftDigest`. It is NOT a module — nothing is registered, rendered, or persisted.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.moduleName]
 * @param {string} [options.modelType] cadastro | operacional
 * @param {string} [options.modelFamily] ModeloBase1 | ModeloBase2
 * @param {Array} [options.fields]
 * @param {Array} [options.screens]
 * @param {Array} [options.permissions]
 * @param {Object} [options.persistence]
 * @param {Object} [options.runtimeBinding]
 * @returns {Object} draft blueprint descriptor
 */
export function createStudioDraftBlueprint(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const moduleId = asString(o.moduleId, 'draftModule');
  const moduleName = asString(o.moduleName, moduleId);
  const modelType = asString(o.modelType, 'cadastro');
  const modelFamily = asString(o.modelFamily, 'ModeloBase1');

  const rawFields = Array.isArray(o.fields) ? o.fields : [];
  const fields = rawFields.filter(isGenericModelPlainObject).map((f, i) => ({
    name: asString(f.name, `field${i + 1}`),
    type: asString(f.type, 'text'),
    label: asString(f.label, asString(f.name, `field${i + 1}`)),
    required: asBool(f.required),
    unique: asBool(f.unique),
    sortable: asBool(f.sortable),
    filterable: asBool(f.filterable),
    searchable: asBool(f.searchable),
    tenantScoped: asBool(f.tenantScoped),
    protectedField: asBool(f.protectedField ?? f.protected),
  }));

  const rawScreens = Array.isArray(o.screens) ? o.screens : [];
  const screens = rawScreens.filter(isGenericModelPlainObject).map((s, i) => ({
    kind: asString(s.kind, 'table'),
    title: asString(s.title, `screen${i + 1}`),
    readOnly: s.readOnly === undefined ? true : asBool(s.readOnly),
  }));

  const rawPermissions = Array.isArray(o.permissions) ? o.permissions : [];
  const permissions = rawPermissions.filter(isGenericModelPlainObject).map((p) => ({
    action: asString(p.action, 'read'),
    level: asString(p.level, 'module'),
    // fail-closed: mutations never start enabled in a draft.
    enabled: p.action === 'read' ? true : false,
  }));

  const persistenceIn = isGenericModelPlainObject(o.persistence) ? o.persistence : {};
  const persistence = {
    boundary: asString(persistenceIn.boundary, 'noPersistence'),
    migrationRequired: false,
    backendRequired: asBool(persistenceIn.backendRequired),
    referenceOnly: true,
  };

  const runtimeBindingIn = isGenericModelPlainObject(o.runtimeBinding) ? o.runtimeBinding : {};
  const runtimeBinding = {
    type: asString(runtimeBindingIn.type, modelType),
    target: modelFamily,
    referenceOnly: true,
    activatesProduction: false,
    registersModule: false,
  };

  const core = {
    kind: 'studio-draft-blueprint',
    blueprintVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    state: 'draft',
    moduleId,
    moduleName,
    modelType,
    modelFamily,
    fields,
    screens,
    permissions,
    persistence,
    runtimeBinding,
    fieldCount: fields.length,
    screenCount: screens.length,
    permissionCount: permissions.length,
  };

  return safeCloneGenericModel({
    ...core,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    blueprintId: `${moduleId}#draft`,
    draftDigest: studioBlueprintEngineDigest(core),
  });
}

export default createStudioDraftBlueprint;
