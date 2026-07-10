import { isPlainObject, safeClone } from '../safety.js';
import { applyModeloBase1RuntimeReadModel } from '../applyModeloBase1RuntimeReadModel.js';
import { createModeloBase1BetaUiChecklist } from './createModeloBase1BetaUiChecklist.js';
import { createModeloBase1BetaUiDiagnostics } from './modeloBase1BetaUiDiagnostics.js';
import { hardeningError } from './errors.js';

const FORBIDDEN_OPTION_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Builds the ModeloBase1 BETA UI HARDENING MODEL from an already-applied runtime
 * read state. It composes the checklist + diagnostics and reports a hardening
 * verdict. Pure, deterministic, passive — never writes, never resolves anything,
 * never touches the backend/Prisma/real data. Returns a safe deep copy.
 *
 * @param {Object} options
 * @param {import('../types.js').ModeloBase1RuntimeReadState} options.state
 * @param {string} [options.moduleId]
 * @returns {Object}
 */
export function createModeloBase1BetaUiHardeningModel(options = {}) {
  if (!isPlainObject(options)) {
    throw hardeningError('MAK-MB1-BUH-001', 'createModeloBase1BetaUiHardeningModel() options must be a plain object');
  }
  if (FORBIDDEN_OPTION_KEYS.some((k) => Object.prototype.hasOwnProperty.call(options, k))) {
    throw hardeningError('MAK-MB1-BUH-002', 'options contain a forbidden key');
  }
  const state = isPlainObject(options.state) ? options.state : null;
  if (!state) {
    throw hardeningError('MAK-MB1-BUH-001', 'createModeloBase1BetaUiHardeningModel() requires a read state');
  }
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (typeof state.moduleId === 'string' ? state.moduleId : 'unknown');

  const checklist = createModeloBase1BetaUiChecklist(state);
  const diagnostics = createModeloBase1BetaUiDiagnostics({ moduleId, checklist, state });

  return safeClone({
    kind: 'modelobase1-beta-ui-hardening-model',
    moduleId,
    betaApplied: state.betaApplied === true,
    fallbackApplied: state.fallbackApplied === true,
    fallbackReason: typeof state.fallbackReason === 'string' ? state.fallbackReason : null,
    writeBlocked: Boolean(state.writeBlocked),
    source: typeof state.source === 'string' ? state.source : null,
    checklist,
    diagnostics,
    hardeningStatus: diagnostics.hardeningStatus,
    noSideEffects: true,
    nextAllowedStep: 'ModeloBase1 Controlled Local Write Plan',
  });
}

/**
 * Convenience: applies the runtime read model for a config and then builds the
 * hardening model. Async (delegates to the wiring's apply). Never writes.
 *
 * @param {Object} options
 * @param {object|null|undefined} options.config
 * @returns {Promise<Object>}
 */
export async function createModeloBase1BetaUiHardeningFromConfig(options = {}) {
  const config = isPlainObject(options) ? options.config : null;
  const state = await applyModeloBase1RuntimeReadModel({ config });
  return createModeloBase1BetaUiHardeningModel({ state });
}

export default createModeloBase1BetaUiHardeningModel;
