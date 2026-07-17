import { isPlainObject, safeString, safeNonNegativeInt } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds a deterministic, immutable operation receipt. Records the revision transition and the
 * snapshot digests before/after. Pure. @param {Object} [options] @returns {Object}
 */
export function createOperationReceipt(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const core = {
    kind: 'authoring-operation-receipt',
    operationId: safeString(o.operationId, 'unknown', 200),
    draftId: typeof o.draftId === 'string' ? o.draftId : null,
    previousRevision: o.previousRevision === null ? null : safeNonNegativeInt(o.previousRevision, 0),
    nextRevision: o.nextRevision === null ? null : safeNonNegativeInt(o.nextRevision, 0),
    snapshotDigestBefore: typeof o.snapshotDigestBefore === 'string' ? o.snapshotDigestBefore : null,
    snapshotDigestAfter: typeof o.snapshotDigestAfter === 'string' ? o.snapshotDigestAfter : null,
    status: o.status === 'applied' ? 'applied' : 'rejected',
    issueCode: typeof o.issueCode === 'string' ? o.issueCode : null,
    revisionProduced: o.revisionProduced === true,
    sideEffects: false,
  };
  return Object.freeze({ ...core, receiptDigest: createDeterministicDigest(core) });
}

export default createOperationReceipt;
