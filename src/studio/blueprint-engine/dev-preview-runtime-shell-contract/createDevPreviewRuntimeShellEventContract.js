import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_SHELL_EVENT_KINDS, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the shell EVENT contract. Pure, metadata-only. Describes the contractual events a
 * future shell WOULD emit/observe (previewRequested … permissionDenied) as metadata. There is
 * NO real EventEmitter, NO listener, NO handler, and NO mutation — nothing is wired.
 *
 * @param {Object} [options]
 * @returns {Object} event contract
 */
export function createDevPreviewRuntimeShellEventContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const events = RUNTIME_SHELL_EVENT_KINDS.map((event) => ({
    event,
    kind: event === 'permissionDenied' || event.includes('Blocked') || event.includes('Failed') ? 'blocked' : 'read',
    hasRealHandler: false,
    hasRealListener: false,
    mutation: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-runtime-shell-event-contract',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    events,
    eventKinds: [...RUNTIME_SHELL_EVENT_KINDS],
    usesEventEmitter: false,
    anyRealHandler: false,
    anyRealListener: false,
    anyMutation: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, eventContractDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellEventContract;
