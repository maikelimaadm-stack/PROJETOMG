import { AUTHORING_LIFECYCLE_STATES, AUTHORING_FIELD_KINDS, AUTHORING_RELATIONSHIP_CARDINALITIES } from './authoringRuntimeConfig.js';
import { isPlainObject, safeString, safeNonNegativeInt } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** Recursively freezes a plain value graph so no nested array/object can be mutated. */
function deepFreeze(v) {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v)) deepFreeze(v[k]);
  }
  return v;
}

/** Normalize one field descriptor deterministically. @param {unknown} f */
function normField(f) {
  const o = isPlainObject(f) ? f : {};
  const key = safeString(o.key ?? o.fieldKey, 'field', 200);
  const dataKind = AUTHORING_FIELD_KINDS.includes(o.dataKind) ? o.dataKind
    : (AUTHORING_FIELD_KINDS.includes(o.fieldKind) ? o.fieldKind : 'unknown');
  return {
    fieldId: `field:${key}`, fieldKey: key, key,
    label: safeString(o.label, key, 400), description: typeof o.description === 'string' ? o.description : '',
    dataKind, required: o.required === true, nullable: o.nullable === true,
    order: safeNonNegativeInt(o.order, 0), synthetic: true, canonical: false,
  };
}
/** @param {unknown} l */
function normLayout(l) {
  const o = isPlainObject(l) ? l : {};
  const sectionId = safeString(o.sectionId, 'section', 200);
  const fieldKeys = Array.isArray(o.fieldKeys) ? o.fieldKeys.filter((k) => typeof k === 'string').map((k) => String(k)) : [];
  return { layoutId: `layout:${sectionId}`, sectionId, title: safeString(o.title, sectionId, 400), order: safeNonNegativeInt(o.order, 0), fieldKeys, synthetic: true, canonical: false };
}
/** @param {unknown} r */
function normRel(r) {
  const o = isPlainObject(r) ? r : {};
  const relationshipId = safeString(o.relationshipId, 'relationship', 200);
  return {
    relationshipId,
    sourceDraftEntity: safeString(o.sourceDraftEntity ?? o.fromModule, 'plannedModule', 200),
    targetDraftEntity: safeString(o.targetDraftEntity ?? o.toModule, 'plannedModule', 200),
    cardinality: AUTHORING_RELATIONSHIP_CARDINALITIES.includes(o.cardinality) ? o.cardinality : 'unknown',
    required: o.required === true, cascadePolicy: 'none', resolved: false, synthetic: true, canonical: false,
  };
}

/**
 * Builds an immutable, deterministic DRAFT SNAPSHOT. Metadata only, synthetic, non-canonical. Same
 * input -> same snapshot + digest. Frozen; retains no external mutable reference (all fields cloned).
 *
 * @param {Object} [options]
 * @returns {Object}
 */
export function createDraftSnapshot(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const moduleId = safeString(o.moduleId, 'plannedModule', 200);
  const lifecycleState = AUTHORING_LIFECYCLE_STATES.includes(o.lifecycleState) ? o.lifecycleState : 'draft';
  const name = safeString(o.name ?? o.draftName, moduleId, 400);
  const revision = safeNonNegativeInt(o.revision, 0);
  const fields = (Array.isArray(o.fields) ? o.fields : []).map(normField);
  const layout = (Array.isArray(o.layout) ? o.layout : []).map(normLayout);
  const relationships = (Array.isArray(o.relationships) ? o.relationships : []).map(normRel);
  const validation = isPlainObject(o.validation) ? o.validation
    : { ran: false, issues: [], blockerCount: 0, passed: false };

  const core = {
    kind: 'authoring-draft-snapshot',
    draftId: `${moduleId}#authoring-draft`,
    draftVersion: `${moduleId}#authoring-draft@r${revision}`,
    draftName: name,
    draftLabel: safeString(o.label ?? o.draftLabel, name, 400),
    draftDescription: typeof o.description === 'string' ? o.description : (typeof o.draftDescription === 'string' ? o.draftDescription : ''),
    moduleIntent: safeString(o.moduleIntent, 'cadastro', 200),
    schemaVersion: 'studio-authoring-draft-schema@1.0.0',
    moduleId,
    lifecycleState,
    revision,
    fields,
    layout,
    relationships,
    validation: {
      ran: validation.ran === true,
      issues: Array.isArray(validation.issues) ? validation.issues : [],
      blockerCount: safeNonNegativeInt(validation.blockerCount, 0),
      passed: validation.passed === true,
    },
    synthetic: true,
    canonical: false,
    certified: false,
    generated: false,
    registered: false,
    discarded: lifecycleState === 'discarded' || o.discarded === true,
    fieldCount: fields.length,
    layoutCount: layout.length,
    relationshipCount: relationships.length,
  };
  return deepFreeze({ ...core, digest: createDeterministicDigest(core) });
}

export default createDraftSnapshot;
