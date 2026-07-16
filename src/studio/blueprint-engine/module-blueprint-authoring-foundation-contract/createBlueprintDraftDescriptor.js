import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_LIFECYCLE_STATES, authoringFoundationDigest } from './authoringFoundationContractConfig.js';
import { createFieldDraftDescriptor } from './createFieldDraftDescriptor.js';
import { createLayoutDraftDescriptor } from './createLayoutDraftDescriptor.js';
import { createRelationshipDraftDescriptor } from './createRelationshipDraftDescriptor.js';

/**
 * Describes a BLUEPRINT DRAFT — a temporary, NON-CANONICAL authoring draft. It aggregates field,
 * layout and relationship draft descriptors under a deterministic draft id, a schema version, a
 * revision and a lifecycle state.
 *
 * Metadata only. A draft is NEVER canonical, NEVER certified, NEVER generated, NEVER registered; it
 * NEVER self-certifies, NEVER overwrites the certified blueprint contract, NEVER registers a module,
 * NEVER generates files, and NEVER publishes. Same input -> same descriptor + digest. Pure and
 * deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.name]
 * @param {string} [options.label]
 * @param {string} [options.description]
 * @param {string} [options.moduleIntent]
 * @param {string} [options.lifecycleState] one of AUTHORING_LIFECYCLE_STATES (default 'empty')
 * @param {number} [options.revision]
 * @param {Object[]} [options.fields]
 * @param {Object[]} [options.layout]
 * @param {Object[]} [options.relationships]
 * @returns {Object}
 */
export function createBlueprintDraftDescriptor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.moduleId ?? 'plannedModule');
  const name = typeof o.name === 'string' && o.name.length > 0 ? o.name : moduleId;
  const label = typeof o.label === 'string' && o.label.length > 0 ? o.label : name;
  const description = typeof o.description === 'string' ? o.description : '';
  const moduleIntent = typeof o.moduleIntent === 'string' && o.moduleIntent.length > 0 ? o.moduleIntent : 'cadastro';
  const lifecycleState = AUTHORING_LIFECYCLE_STATES.includes(o.lifecycleState) ? o.lifecycleState : 'empty';
  const rawRevision = Number(o.revision);
  const revision = Number.isFinite(rawRevision) && rawRevision >= 0 ? Math.floor(rawRevision) : 0;

  const fields = (Array.isArray(o.fields) ? o.fields : [])
    .map((f) => createFieldDraftDescriptor(isGenericModelPlainObject(f) ? f : {}));
  const layout = (Array.isArray(o.layout) ? o.layout : [])
    .map((l) => createLayoutDraftDescriptor(isGenericModelPlainObject(l) ? l : {}));
  const relationships = (Array.isArray(o.relationships) ? o.relationships : [])
    .map((r) => createRelationshipDraftDescriptor(isGenericModelPlainObject(r) ? r : {}));

  const fieldKeys = fields.map((f) => f.fieldKey);
  const uniqueFieldKeys = new Set(fieldKeys);
  const sectionIds = layout.map((l) => l.sectionId);
  const uniqueSectionIds = new Set(sectionIds);
  const relationshipIds = relationships.map((r) => r.relationshipId);
  const uniqueRelationshipIds = new Set(relationshipIds);

  const core = {
    kind: 'authoring-blueprint-draft-descriptor',
    draftId: `${moduleId}#authoring-draft`,
    draftVersion: `${moduleId}#authoring-draft@r${revision}`,
    draftName: name,
    draftLabel: label,
    draftDescription: description,
    moduleIntent,
    schemaVersion: 'studio-authoring-draft-schema@1.0.0',
    moduleId,
    name,
    lifecycleState,
    revision,
    synthetic: true,
    canonical: false,
    certified: false,
    generated: false,
    registered: false,
    isDraft: true,
    selfCertifiable: false,
    overwritesCertifiedContract: false,
    registersModule: false,
    generatesFiles: false,
    publishes: false,
    fields,
    layout,
    relationships,
    fieldCount: fields.length,
    layoutCount: layout.length,
    relationshipCount: relationships.length,
    fieldKeysUnique: uniqueFieldKeys.size === fieldKeys.length,
    sectionIdsUnique: uniqueSectionIds.size === sectionIds.length,
    relationshipIdsUnique: uniqueRelationshipIds.size === relationshipIds.length,
  };
  return safeCloneGenericModel({ ...core, blueprintDraftDigest: authoringFoundationDigest(core) });
}

export default createBlueprintDraftDescriptor;
