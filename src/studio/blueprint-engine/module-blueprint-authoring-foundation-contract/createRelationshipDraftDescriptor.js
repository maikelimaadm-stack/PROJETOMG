import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/** Relationship cardinalities the authoring foundation recognizes (metadata only). */
export const AUTHORING_RELATIONSHIP_CARDINALITIES = Object.freeze([
  'one_to_one', 'one_to_many', 'many_to_one', 'many_to_many', 'unknown',
]);

/** Relationship kinds the authoring foundation recognizes (metadata only). */
export const AUTHORING_RELATIONSHIP_KINDS = Object.freeze([
  'association', 'aggregation', 'composition', 'reference', 'unknown',
]);

/**
 * Describes a single RELATIONSHIP DRAFT — a temporary, non-canonical relationship description within
 * an authoring draft. Metadata only: it declares no foreign key, no join, no query, no persistence,
 * no cascade, and touches no real data. Pure and deterministic; same input -> same descriptor +
 * digest.
 *
 * @param {Object} [options]
 * @param {string} [options.relationshipId]
 * @param {string} [options.sourceDraftEntity]
 * @param {string} [options.targetDraftEntity]
 * @param {string} [options.relationshipKind] one of AUTHORING_RELATIONSHIP_KINDS
 * @param {string} [options.cardinality] one of AUTHORING_RELATIONSHIP_CARDINALITIES
 * @param {boolean} [options.required]
 * @returns {Object}
 */
export function createRelationshipDraftDescriptor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const relationshipId = typeof o.relationshipId === 'string' && o.relationshipId.length > 0 ? o.relationshipId : 'relationship';
  const sourceDraftEntity = typeof o.sourceDraftEntity === 'string' && o.sourceDraftEntity.length > 0
    ? o.sourceDraftEntity : String(o.fromModule ?? 'plannedModule');
  const targetDraftEntity = typeof o.targetDraftEntity === 'string' && o.targetDraftEntity.length > 0
    ? o.targetDraftEntity : String(o.toModule ?? 'plannedModule');
  const relationshipKind = AUTHORING_RELATIONSHIP_KINDS.includes(o.relationshipKind) ? o.relationshipKind : 'unknown';
  const cardinality = AUTHORING_RELATIONSHIP_CARDINALITIES.includes(o.cardinality) ? o.cardinality : 'unknown';

  const core = {
    kind: 'authoring-relationship-draft-descriptor',
    relationshipId,
    sourceDraftEntity,
    targetDraftEntity,
    fromModule: sourceDraftEntity,
    toModule: targetDraftEntity,
    relationshipKind,
    cardinality,
    required: o.required === true,
    cascadePolicy: 'none',
    resolved: false,
    endpointsKnown: true,
    synthetic: true,
    canonical: false,
    draftOnly: true,
    foreignKeyCreated: false,
    joinCreated: false,
    queryCreated: false,
    persisted: false,
    realDataBound: false,
  };
  return safeCloneGenericModel({ ...core, relationshipDraftDigest: authoringFoundationDigest(core) });
}

export default createRelationshipDraftDescriptor;
