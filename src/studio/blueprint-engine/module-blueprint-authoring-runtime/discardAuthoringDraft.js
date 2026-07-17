import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds a DISCARD receipt for a draft. Discard only releases in-memory session references — it
 * deletes NO files, touches NO database/storage, performs NO external rollback. Terminal. Pure.
 * @param {Object} [options] @returns {Object}
 */
export function discardAuthoringDraft(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const draft = isPlainObject(o.draft) ? o.draft : {};
  const core = {
    kind: 'authoring-discard-receipt',
    draftId: typeof draft.draftId === 'string' ? draft.draftId : null,
    lifecycleState: 'discarded',
    discarded: true,
    terminal: true,
    externalCleanupRequired: false,
    databaseRollbackRequired: false,
    filesystemCleanupRequired: false,
    sideEffectsReversed: 0,
    furtherMutableOperationsAllowed: false,
  };
  return Object.freeze({ ...core, discardDigest: createDeterministicDigest(core) });
}

export default discardAuthoringDraft;
