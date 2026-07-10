import { isPlainObject, safeClone } from './safety.js';
import { resolveModeloBase1RuntimeReadModel } from './resolveModeloBase1RuntimeReadModel.js';
import {
  validateModeloBase1RuntimeReadModel,
  validateModeloBase1RuntimeReadPayload,
} from './validateModeloBase1RuntimeReadModel.js';
import { createModeloBase1RuntimeReadFallbackState } from './modeloBase1RuntimeReadFallback.js';
import { createModeloBase1RuntimeReadDiagnostics } from './createModeloBase1RuntimeReadDiagnostics.js';

const DEFAULT_WRITE_BLOCK_MESSAGE = 'Modo beta somente leitura: gravação desabilitada nesta tela.';

/**
 * The single entry point the ModeloBase1 engine calls to consume
 * `config.runtimeReadModel`. It detects, validates, resolves and applies the
 * runtime v2 beta read model — READ-ONLY — or falls back safely to the legacy
 * behavior. It never writes, never calls the backend/Prisma/fetch, never touches
 * real data or storage. It returns a plain, safe applied-state object.
 *
 * Fallback (legacy) is returned when the read model is: absent, disabled,
 * invalid, has no working write guard, resolves to an unsafe payload, or throws.
 * In every fallback case the screen keeps rendering exactly as before.
 *
 * @param {Object} input
 * @param {object|null|undefined} input.config A built ModeloBase1 config.
 * @param {string} [input.writeBlockMessage]
 * @returns {Promise<import('./types.js').ModeloBase1RuntimeReadState>}
 */
export async function applyModeloBase1RuntimeReadModel(input = {}) {
  const config = isPlainObject(input) ? input.config : null;
  const writeBlockMessage = isPlainObject(input) && typeof input.writeBlockMessage === 'string'
    ? input.writeBlockMessage
    : DEFAULT_WRITE_BLOCK_MESSAGE;

  const resolution = resolveModeloBase1RuntimeReadModel(config);
  const moduleId = resolution.readModel?.moduleId
    ?? (isPlainObject(config?.runtimeReadModel) ? config.runtimeReadModel.moduleId : null)
    ?? config?.moduleId
    ?? null;

  // Absent → fallback.
  if (!resolution.present) {
    return withDiagnostics(createModeloBase1RuntimeReadFallbackState({
      moduleId, fallbackReason: 'runtime-read-model-absent', runtimeReadModelPresent: false, runtimeReadModelValid: false,
    }), { present: false, enabled: false, valid: false });
  }
  // Present but disabled/skipped → fallback.
  if (!resolution.enabled || !resolution.readModel) {
    return withDiagnostics(createModeloBase1RuntimeReadFallbackState({
      moduleId, fallbackReason: 'runtime-read-model-disabled', runtimeReadModelPresent: true, runtimeReadModelValid: false,
    }), { present: true, enabled: false, valid: false });
  }

  // Validate the descriptor contract.
  const validation = validateModeloBase1RuntimeReadModel(resolution.readModel);
  if (!validation.valid) {
    return withDiagnostics(createModeloBase1RuntimeReadFallbackState({
      moduleId, fallbackReason: `invalid-read-model:${validation.code}`, runtimeReadModelPresent: true, runtimeReadModelValid: false,
    }), { present: true, enabled: true, valid: false, blockers: validation.reasons });
  }

  // Materialize the read payload (async). Any failure → safe fallback.
  let resolved;
  try {
    resolved = await resolution.readModel.resolve();
  } catch (err) {
    return withDiagnostics(createModeloBase1RuntimeReadFallbackState({
      moduleId, fallbackReason: 'resolve-failed', runtimeReadModelPresent: true, runtimeReadModelValid: true,
    }), { present: true, enabled: true, valid: true, blockers: [err instanceof Error ? err.message : String(err)] });
  }

  // Validate the resolved payload (purity/safety/masking).
  const payloadValidation = validateModeloBase1RuntimeReadPayload(resolved);
  if (!payloadValidation.valid) {
    return withDiagnostics(createModeloBase1RuntimeReadFallbackState({
      moduleId, fallbackReason: `unsafe-payload:${payloadValidation.code}`, runtimeReadModelPresent: true, runtimeReadModelValid: true,
    }), { present: true, enabled: true, valid: true, blockers: payloadValidation.reasons });
  }

  // Apply — READ-ONLY. Table/form are consumed where compatible; write is blocked.
  const table = isPlainObject(resolved.table) ? safeClone(resolved.table) : null;
  const form = isPlainObject(resolved.form) ? safeClone(resolved.form) : null;
  const tableApplied = table != null && Array.isArray(table.columns) && table.columns.length > 0;
  const formApplied = form != null && Array.isArray(form.fields) && form.fields.length > 0;

  /** @type {import('./types.js').ModeloBase1RuntimeReadState} */
  const state = {
    kind: 'modelobase1-runtime-read-state',
    moduleId,
    betaApplied: true,
    fallbackApplied: false,
    fallbackReason: null,
    fallbackSource: null,
    runtimeReadModelPresent: true,
    runtimeReadModelValid: true,
    source: 'runtime-v2-beta',
    table,
    form,
    tableApplied,
    formApplied,
    writeBlocked: true,
    writeBlockMessage,
    diagnostics: null,
    noSideEffects: true,
  };
  return withDiagnostics(state, {
    present: true, enabled: true, valid: true, betaApplied: true, tableApplied, formApplied, table, form,
  });
}

/**
 * Attaches diagnostics to an applied state (in place, safe copy). Keeps the
 * live nothing — the state is already plain.
 * @param {import('./types.js').ModeloBase1RuntimeReadState} state
 * @param {Object} diagInput
 * @returns {import('./types.js').ModeloBase1RuntimeReadState}
 */
function withDiagnostics(state, diagInput) {
  state.diagnostics = createModeloBase1RuntimeReadDiagnostics({
    moduleId: state.moduleId,
    present: diagInput.present,
    enabled: diagInput.enabled,
    valid: diagInput.valid,
    betaApplied: state.betaApplied,
    fallbackApplied: state.fallbackApplied,
    fallbackReason: state.fallbackReason,
    tableApplied: state.tableApplied,
    formApplied: state.formApplied,
    writeBlocked: state.writeBlocked,
    table: diagInput.table ?? state.table,
    form: diagInput.form ?? state.form,
    blockers: diagInput.blockers ?? [],
    warnings: diagInput.warnings ?? [],
  });
  return state;
}

export default applyModeloBase1RuntimeReadModel;
