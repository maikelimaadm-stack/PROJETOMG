import { isPlainObject } from './safety.js';

/**
 * The ModeloBase1 runtime wiring is SAFE-BY-FALLBACK: whenever the runtime read
 * model is absent, disabled, invalid, unsafe, or errors while resolving, the
 * engine keeps the legacy behavior and the screen renders unchanged. This module
 * builds the canonical fallback "applied state" the wiring returns in those
 * cases.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.fallbackReason] Stable reason code/string.
 * @param {string} [options.fallbackSource] Where the fallback came from.
 * @param {boolean} [options.runtimeReadModelPresent]
 * @param {boolean} [options.runtimeReadModelValid]
 * @returns {import('./types.js').ModeloBase1RuntimeReadState}
 */
export function createModeloBase1RuntimeReadFallbackState(options = {}) {
  const o = isPlainObject(options) ? options : {};
  return {
    kind: 'modelobase1-runtime-read-state',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    betaApplied: false,
    fallbackApplied: true,
    fallbackReason: typeof o.fallbackReason === 'string' ? o.fallbackReason : 'runtime-read-model-absent',
    fallbackSource: typeof o.fallbackSource === 'string' ? o.fallbackSource : 'legacy-config',
    runtimeReadModelPresent: Boolean(o.runtimeReadModelPresent),
    runtimeReadModelValid: Boolean(o.runtimeReadModelValid),
    source: 'legacy-config',
    table: null,
    form: null,
    tableApplied: false,
    formApplied: false,
    writeBlocked: false,
    writeBlockMessage: null,
    diagnostics: null,
    noSideEffects: true,
  };
}

/**
 * True when the applied state represents a fallback (legacy behavior). Used by
 * the engine to decide whether to keep the current render path.
 * @param {unknown} state
 * @returns {boolean}
 */
export function isModeloBase1RuntimeReadFallback(state) {
  return !isPlainObject(state) || state.betaApplied !== true || state.fallbackApplied === true;
}

export default createModeloBase1RuntimeReadFallbackState;
