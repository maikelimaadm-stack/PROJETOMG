import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_OPERATION_IDS,
  AUTHORING_LIFECYCLE_STATES,
  FORBIDDEN_LIFECYCLE_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';

/** Per-operation allowed lifecycle states + declared required inputs (metadata only). */
const OPERATION_RULES = Object.freeze({
  createDraft: { allowed: ['empty'], inputs: ['moduleIntent'], newRevision: true },
  renameDraft: { allowed: ['draft', 'validation_failed', 'validated'], inputs: ['draftName'], newRevision: true },
  describeDraft: { allowed: ['draft', 'validation_failed', 'validated'], inputs: ['draftDescription'], newRevision: true },
  addFieldDraft: { allowed: ['draft', 'validation_failed'], inputs: ['fieldKey', 'dataKind'], newRevision: true },
  updateFieldDraft: { allowed: ['draft', 'validation_failed'], inputs: ['fieldKey'], newRevision: true },
  removeFieldDraft: { allowed: ['draft', 'validation_failed'], inputs: ['fieldKey'], newRevision: true },
  reorderFieldDraft: { allowed: ['draft', 'validation_failed'], inputs: ['order'], newRevision: true },
  addLayoutSectionDraft: { allowed: ['draft', 'validation_failed'], inputs: ['sectionId'], newRevision: true },
  updateLayoutSectionDraft: { allowed: ['draft', 'validation_failed'], inputs: ['sectionId'], newRevision: true },
  removeLayoutSectionDraft: { allowed: ['draft', 'validation_failed'], inputs: ['sectionId'], newRevision: true },
  addRelationshipDraft: { allowed: ['draft', 'validation_failed'], inputs: ['relationshipId'], newRevision: true },
  removeRelationshipDraft: { allowed: ['draft', 'validation_failed'], inputs: ['relationshipId'], newRevision: true },
  requestValidation: { allowed: ['draft', 'validation_pending'], inputs: [], newRevision: false },
  requestSyntheticPreviewHandoff: { allowed: ['validated', 'preview_ready'], inputs: [], newRevision: false },
  requestCertificationCandidateHandoff: { allowed: ['handoff_ready'], inputs: [], newRevision: false },
  discardDraft: { allowed: [...AUTHORING_LIFECYCLE_STATES.filter((s) => s !== 'discarded')], inputs: [], newRevision: false },
});

/**
 * The AUTHORING OPERATION CATALOG — enumerates the authorable FUTURE operations (createDraft,
 * addFieldDraft, requestValidation, requestSyntheticPreviewHandoff, ...) as DESCRIPTORS ONLY. None is
 * implemented here; each declares its allowed/forbidden lifecycle states and required inputs, records
 * that it produces no side effects / no persistence / no module writes, and would require the future
 * enterprise checkpoint before any runtime could enact it. Metadata only. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createAuthoringOperationCatalog() {
  const operations = AUTHORING_OPERATION_IDS.map((id) => {
    const rule = OPERATION_RULES[id] ?? { allowed: [], inputs: [], newRevision: false };
    const allowedLifecycleStates = [...rule.allowed];
    const forbiddenLifecycleStates = AUTHORING_LIFECYCLE_STATES.filter((s) => !allowedLifecycleStates.includes(s));
    return {
      id,
      operationId: id,
      kind: 'authoring-operation-descriptor',
      allowedLifecycleStates,
      forbiddenLifecycleStates,
      requiredInputs: [...rule.inputs],
      producesNewRevision: rule.newRevision === true,
      implemented: false,
      draftScoped: true,
      sideEffectsAllowed: false,
      persistenceAllowed: false,
      moduleWriteAllowed: false,
      mutatesCertifiedContract: false,
      generatesModule: false,
      writesFiles: false,
      persists: false,
      publishes: false,
      touchesBackend: false,
      requiresFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    };
  });

  const core = {
    kind: 'authoring-operation-catalog',
    operations,
    operationIds: [...AUTHORING_OPERATION_IDS],
    operationCount: operations.length,
    anyImplemented: false,
    anyMutatesCertifiedContract: false,
    anyGeneratesModule: false,
    anySideEffectsAllowed: false,
    anyPersistenceAllowed: false,
    anyModuleWriteAllowed: false,
    forbiddenLifecycleStates: [...FORBIDDEN_LIFECYCLE_STATES],
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    catalogOnly: true,
  };
  return safeCloneGenericModel({ ...core, operationCatalogDigest: authoringFoundationDigest(core) });
}

export default createAuthoringOperationCatalog;
