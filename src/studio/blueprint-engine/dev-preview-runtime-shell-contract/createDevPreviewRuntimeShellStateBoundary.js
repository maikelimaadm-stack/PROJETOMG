import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_STATE_KINDS, BLOCKED_STATE_KINDS, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the STATE BOUNDARY contract. Pure, metadata-only. Describes which state kinds a
 * future shell WOULD expose (read-only, metadata) and which are permanently blocked (react
 * state / hook state / mutable runtime / persisted / storage). No React state, no hooks, no
 * storage, no persistence.
 *
 * @param {Object} [options]
 * @returns {Object} state boundary contract
 */
export function createDevPreviewRuntimeShellStateBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'dev-preview-runtime-shell-state-boundary',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    allowedStateKinds: [...ALLOWED_STATE_KINDS],
    blockedStateKinds: [...BLOCKED_STATE_KINDS],
    readOnlyState: true,
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, stateBoundaryDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellStateBoundary;
