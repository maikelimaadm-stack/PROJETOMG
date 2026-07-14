import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_SHELL_LIFECYCLE_PHASES, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the shell LIFECYCLE contract. Pure, metadata-only. Describes the phases a future
 * runtime shell WOULD move through (created → configured → validated → ready → blocked →
 * failed → disposed) as metadata. No real runtime, no timers, no event loop, no DOM.
 *
 * @param {Object} [options]
 * @returns {Object} lifecycle contract
 */
export function createDevPreviewRuntimeShellLifecycleContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const phases = RUNTIME_SHELL_LIFECYCLE_PHASES.map((phase, index) => ({
    phase,
    order: index,
    terminal: phase === 'failed' || phase === 'disposed',
    blocking: phase === 'blocked' || phase === 'failed',
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-runtime-shell-lifecycle-contract',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    phases,
    phaseKinds: [...RUNTIME_SHELL_LIFECYCLE_PHASES],
    initialPhase: 'created',
    readyPhase: 'ready',
    usesTimers: false,
    usesEventLoop: false,
    usesRealRuntime: false,
    dom: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, lifecycleDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellLifecycleContract;
