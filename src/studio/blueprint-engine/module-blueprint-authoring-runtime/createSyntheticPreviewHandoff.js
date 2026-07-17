import { AUTHORING_RUNTIME_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds SYNTHETIC PREVIEW HANDOFF metadata from a validated draft snapshot. Metadata only — mounts
 * nothing, touches no App, creates no route/menu, attaches no real data. Requires a validated draft;
 * otherwise returns a fail-closed descriptor. Pure. @param {Object} [options] @returns {Object}
 */
export function createSyntheticPreviewHandoff(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const draft = isPlainObject(o.draft) ? o.draft : {};
  const validated = draft.lifecycleState === 'preview_ready' || draft.lifecycleState === 'handoff_ready'
    || (isPlainObject(draft.validation) && draft.validation.passed === true);

  const core = {
    kind: 'authoring-synthetic-preview-handoff',
    handoffKind: 'synthetic_preview_candidate',
    handoffVersion: 'authoring-preview-handoff@1.0.0',
    runtimeVersion: AUTHORING_RUNTIME_VERSION,
    targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    draftId: typeof draft.draftId === 'string' ? draft.draftId : null,
    draftRevision: Number.isFinite(Number(draft.revision)) ? Number(draft.revision) : null,
    draftDigest: typeof draft.digest === 'string' ? draft.digest : null,
    synthetic: true,
    immutable: true,
    validated,
    previewPayloadCreated: validated,
    previewMounted: false,
    realDataAttached: false,
    routeCreated: false,
    menuCreated: false,
    productExposed: false,
    payload: validated ? draft : null,
    ok: validated,
  };
  return Object.freeze({ ...core, handoffDigest: createDeterministicDigest(core) });
}

export default createSyntheticPreviewHandoff;
