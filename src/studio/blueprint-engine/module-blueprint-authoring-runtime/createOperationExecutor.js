import { AUTHORING_OPERATION_IDS, REVISION_PRODUCING_OPERATIONS } from './authoringRuntimeConfig.js';
import { isPlainObject, safeString, normalizeAuthoringInput } from './normalizeAuthoringInput.js';
import { createDraftSnapshot } from './createDraftSnapshot.js';
import { nextRevision } from './createRevisionEngine.js';
import { runValidationPipeline } from './createValidationPipeline.js';
import { enforceAuthoringResourceLimits, enforceSerializedSnapshotBytes } from './enforceAuthoringResourceLimits.js';
import { createOperationReceipt } from './createOperationReceipt.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** The operation executor descriptor (pure data). @returns {Object} */
export function createOperationExecutor() {
  const core = {
    kind: 'authoring-operation-executor',
    allowlist: [...AUTHORING_OPERATION_IDS],
    allowlistOnly: true,
    unknownOperationsFailClosed: true,
    operationCount: AUTHORING_OPERATION_IDS.length,
    operationExecutorImplemented: true,
    sideEffectsAllowed: false,
    persistenceAllowed: false,
    moduleWriteAllowed: false,
  };
  return Object.freeze({ ...core, operationExecutorDigest: createDeterministicDigest(core) });
}

/** @param {Object} session @param {Object} draft */
function replaceDraft(session, draft) {
  const drafts = session.drafts.map((d) => (d.draftId === draft.draftId ? draft : d));
  return drafts;
}
/** Rebuild a frozen session with new drafts + counts. */
function rebuildSession(session, drafts, opCountDelta, revDelta) {
  const core = {
    ...session,
    drafts,
    operationCount: session.operationCount + opCountDelta,
    revisionCountTotal: session.revisionCountTotal + revDelta,
    draftCount: drafts.length,
  };
  delete core.sessionDigest;
  return Object.freeze({ ...core, sessionDigest: createDeterministicDigest(core) });
}
/** Mutation-eligible lifecycle states (re-open to 'draft' on success). */
const MUTABLE_STATES = ['draft', 'validation_failed', 'validated', 'preview_ready'];

/**
 * Applies ONE operation to a session, returning `{ session, receipt }`. PURE: the input session is
 * never mutated (deep-cloned first); a NEW frozen session is returned. Unknown operations, invalid
 * lifecycle transitions and exceeded limits fail closed (session unchanged except operationCount).
 *
 * @param {Object} options @param {Object} options.session @param {Object} options.operation
 * @returns {{ session: Object, receipt: Object }}
 */
export function executeAuthoringOperation(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const inputSession = isPlainObject(o.session) ? o.session : null;
  const operation = isPlainObject(o.operation) ? o.operation : {};
  const session = inputSession ? normalizeAuthoringInput(inputSession) : null;
  const operationId = safeString(operation.operationId, '', 200);
  const input = isPlainObject(operation.input) ? normalizeAuthoringInput(operation.input) : {};
  const limits = session && isPlainObject(session.limits) ? session.limits : {};

  const reject = (baseSession, code, draftId) => {
    const s = rebuildSession(baseSession, baseSession.drafts, 1, 0);
    const receipt = createOperationReceipt({ operationId, draftId: draftId ?? null, previousRevision: null, nextRevision: null, snapshotDigestBefore: null, snapshotDigestAfter: null, status: 'rejected', issueCode: code });
    return { session: s, receipt };
  };

  if (!session || session.kind !== 'authoring-runtime-session') {
    return { session: session ?? null, receipt: createOperationReceipt({ operationId, status: 'rejected', issueCode: 'AUTHORING_RUNTIME_SESSION_FAILED' }) };
  }
  if (session.status === 'discarded') {
    return reject(session, 'AUTHORING_RUNTIME_SESSION_FAILED');
  }
  // Operation-limit gate (does not increment when it is the reason).
  const opCap = enforceAuthoringResourceLimits({ limits, dimension: 'operations', count: session.operationCount + 1 });
  if (!opCap.ok) {
    const receipt = createOperationReceipt({ operationId, status: 'rejected', issueCode: opCap.issueCode });
    return { session, receipt };
  }
  // Allowlist gate (fail closed).
  if (!AUTHORING_OPERATION_IDS.includes(operationId)) {
    return reject(session, 'AUTHORING_RUNTIME_UNKNOWN_OPERATION');
  }

  const findDraft = (id) => session.drafts.find((d) => d.draftId === id) || (session.drafts.length === 1 ? session.drafts[0] : undefined);

  // createDraft
  if (operationId === 'createDraft') {
    const draftCap = enforceAuthoringResourceLimits({ limits, dimension: 'drafts', count: session.drafts.length + 1 });
    if (!draftCap.ok) return reject(session, draftCap.issueCode);
    const draft = createDraftSnapshot({ ...input, lifecycleState: 'draft', revision: 0 });
    const byteCap = enforceSerializedSnapshotBytes(limits, draft);
    if (!byteCap.ok) return reject(session, byteCap.issueCode);
    const drafts = [...session.drafts, draft];
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: null, nextRevision: 0, snapshotDigestBefore: null, snapshotDigestAfter: draft.digest, status: 'applied', revisionProduced: true });
    return { session: rebuildSession(session, drafts, 1, 1), receipt };
  }

  const draft = findDraft(safeString(operation.draftId, '', 200));
  if (!draft) return reject(session, 'AUTHORING_RUNTIME_DRAFT_NOT_FOUND', operation.draftId ?? null);
  if (draft.discarded === true || draft.lifecycleState === 'discarded') return reject(session, 'AUTHORING_RUNTIME_DRAFT_DISCARDED', draft.draftId);

  const before = draft.digest;
  const prevRev = draft.revision;
  const isRevOp = REVISION_PRODUCING_OPERATIONS.includes(operationId);

  // Lifecycle-only operations.
  if (operationId === 'requestValidation') {
    const report = runValidationPipeline({ draft, limits });
    const next = createDraftSnapshot({ ...draft, lifecycleState: report.passed ? 'validated' : 'validation_failed', validation: { ran: true, issues: report.issues, blockerCount: report.blockerCount, passed: report.passed } });
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: prevRev, nextRevision: prevRev, snapshotDigestBefore: before, snapshotDigestAfter: next.digest, status: 'applied', issueCode: report.passed ? null : 'AUTHORING_RUNTIME_VALIDATION_BLOCKED' });
    return { session: rebuildSession(session, replaceDraft(session, next), 1, 0), receipt };
  }
  if (operationId === 'requestSyntheticPreviewHandoff') {
    if (draft.lifecycleState !== 'validated') return reject(session, 'AUTHORING_RUNTIME_PREVIEW_REQUIRES_VALIDATED_DRAFT', draft.draftId);
    const next = createDraftSnapshot({ ...draft, lifecycleState: 'preview_ready' });
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: prevRev, nextRevision: prevRev, snapshotDigestBefore: before, snapshotDigestAfter: next.digest, status: 'applied' });
    return { session: rebuildSession(session, replaceDraft(session, next), 1, 0), receipt };
  }
  if (operationId === 'requestCertificationCandidateHandoff') {
    if (draft.lifecycleState !== 'validated' && draft.lifecycleState !== 'preview_ready') return reject(session, 'AUTHORING_RUNTIME_CANDIDATE_REQUIRES_VALIDATED_DRAFT', draft.draftId);
    const next = createDraftSnapshot({ ...draft, lifecycleState: 'handoff_ready' });
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: prevRev, nextRevision: prevRev, snapshotDigestBefore: before, snapshotDigestAfter: next.digest, status: 'applied' });
    return { session: rebuildSession(session, replaceDraft(session, next), 1, 0), receipt };
  }
  if (operationId === 'discardDraft') {
    const next = createDraftSnapshot({ ...draft, lifecycleState: 'discarded', discarded: true });
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: prevRev, nextRevision: prevRev, snapshotDigestBefore: before, snapshotDigestAfter: next.digest, status: 'applied' });
    return { session: rebuildSession(session, replaceDraft(session, next), 1, 0), receipt };
  }

  // Revision-producing mutation operations.
  if (isRevOp) {
    if (!MUTABLE_STATES.includes(draft.lifecycleState)) return reject(session, 'AUTHORING_RUNTIME_INVALID_LIFECYCLE_TRANSITION', draft.draftId);
    const revCap = enforceAuthoringResourceLimits({ limits, dimension: 'revisions', count: prevRev + 1 });
    if (!revCap.ok) return reject(session, revCap.issueCode, draft.draftId);
    const nr = nextRevision(prevRev);
    if (nr === null) return reject(session, 'AUTHORING_RUNTIME_REVISION_REGRESSION_BLOCKED', draft.draftId);

    const mutated = applyMutation(operationId, draft, input, limits);
    if (mutated.issueCode) return reject(session, mutated.issueCode, draft.draftId);

    const next = createDraftSnapshot({ ...mutated.draft, lifecycleState: 'draft', revision: nr, validation: { ran: false, issues: [], blockerCount: 0, passed: false } });
    const byteCap = enforceSerializedSnapshotBytes(limits, next);
    if (!byteCap.ok) return reject(session, byteCap.issueCode, draft.draftId);
    const receipt = createOperationReceipt({ operationId, draftId: draft.draftId, previousRevision: prevRev, nextRevision: nr, snapshotDigestBefore: before, snapshotDigestAfter: next.digest, status: 'applied', revisionProduced: true });
    return { session: rebuildSession(session, replaceDraft(session, next), 1, 1), receipt };
  }

  return reject(session, 'AUTHORING_RUNTIME_UNKNOWN_OPERATION', draft.draftId);
}

/** Apply a single mutation to a draft's data (returns { draft, issueCode }). Pure. */
function applyMutation(operationId, draft, input, limits) {
  const fields = [...draft.fields];
  const layout = [...draft.layout];
  const relationships = [...draft.relationships];
  const key = safeString(input.key ?? input.fieldKey, 'field', 200);
  const sectionId = safeString(input.sectionId, 'section', 200);
  const relationshipId = safeString(input.relationshipId, 'relationship', 200);

  switch (operationId) {
    case 'renameDraft': return { draft: { ...draft, name: safeString(input.name, draft.draftName, 400), draftName: safeString(input.name, draft.draftName, 400) } };
    case 'describeDraft': return { draft: { ...draft, description: safeString(input.description, '', 2000) } };
    case 'addFieldDraft': {
      if (fields.length + 1 > Number(limits.maxFieldsPerDraft ?? Infinity)) return { issueCode: 'AUTHORING_RUNTIME_LIMIT_MAX_FIELDS' };
      return { draft: { ...draft, fields: [...fields, { ...input, key }] } };
    }
    case 'updateFieldDraft': return { draft: { ...draft, fields: fields.map((f) => (f.fieldKey === key ? { ...f, ...input, key } : f)) } };
    case 'removeFieldDraft': return { draft: { ...draft, fields: fields.filter((f) => f.fieldKey !== key) } };
    case 'reorderFieldDraft': return { draft: { ...draft, fields: fields.map((f) => (f.fieldKey === key ? { ...f, order: Math.max(0, Number(input.order) || 0) } : f)) } };
    case 'addLayoutSectionDraft': {
      if (layout.length + 1 > Number(limits.maxLayoutSectionsPerDraft ?? Infinity)) return { issueCode: 'AUTHORING_RUNTIME_LIMIT_MAX_LAYOUT_SECTIONS' };
      return { draft: { ...draft, layout: [...layout, { ...input, sectionId }] } };
    }
    case 'updateLayoutSectionDraft': return { draft: { ...draft, layout: layout.map((l) => (l.sectionId === sectionId ? { ...l, ...input, sectionId } : l)) } };
    case 'removeLayoutSectionDraft': return { draft: { ...draft, layout: layout.filter((l) => l.sectionId !== sectionId) } };
    case 'addRelationshipDraft': {
      if (relationships.length + 1 > Number(limits.maxRelationshipsPerDraft ?? Infinity)) return { issueCode: 'AUTHORING_RUNTIME_LIMIT_MAX_RELATIONSHIPS' };
      return { draft: { ...draft, relationships: [...relationships, { ...input, relationshipId }] } };
    }
    case 'removeRelationshipDraft': return { draft: { ...draft, relationships: relationships.filter((r) => r.relationshipId !== relationshipId) } };
    default: return { issueCode: 'AUTHORING_RUNTIME_UNKNOWN_OPERATION' };
  }
}

export default createOperationExecutor;
