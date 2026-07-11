import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createModeloBase1GenericModelAdapter } from '../createModeloBase1GenericModelAdapter.js';
import { resolveModeloBase1GenericKernelConsumption } from './modeloBase1GenericKernelConsumptionConfig.js';
import { createModeloBase1GenericKernelConsumptionFallback } from './modeloBase1GenericKernelConsumptionFallback.js';
import { createModeloBase1GenericKernelConsumptionDiagnostics } from './modeloBase1GenericKernelConsumptionDiagnostics.js';
import { consumptionError } from './modeloBase1GenericKernelConsumptionErrors.js';

/**
 * Routes an APPLIED ModeloBase1 runtime read state through the generic-model
 * kernel adapter, behind a flag, with a legacy fallback.
 *
 * - flag OFF (or beta not applied): returns the current ModeloBase1 read state
 *   verbatim (legacyFallback), so behavior is unchanged.
 * - flag ON + beta applied: maps read → generic model, validates it with the
 *   generic kernel, maps generic → ModeloBase1 state, and MERGES the normalized
 *   table/form back onto the original state with `genericKernelApplied:true`.
 * - any error/validation failure: falls back to the current ModeloBase1 read
 *   state verbatim.
 *
 * Pure: never mutates the input, never touches a backend/Prisma/fetch/storage/
 * runtime bridge, never persists for real. Reversible.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] The applied ModeloBase1 runtime read state.
 * @param {Record<string, unknown>} [options.env]
 * @param {Function} [options.createAdapter] Adapter factory (defaults to the MB1 generic adapter). Injectable for tests.
 * @returns {{ ok: boolean, consumptionEnabled: boolean, consumptionApplied: boolean, legacyFallback: boolean, moduleId: string, readState: Object|null, reason: string|null, diagnostics: Object, validation: Object|null, fallback: Object|null, errors: string[], warnings: string[] }}
 */
export function applyModeloBase1GenericKernelConsumption(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw consumptionError('MAK-MB1-GKC-001', 'applyModeloBase1GenericKernelConsumption() options must be a plain object');
  }
  const readState = isGenericModelPlainObject(options.readState) ? options.readState : null;
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (readState && typeof readState.moduleId === 'string' ? readState.moduleId : 'unknown');
  const env = options.env;
  const createAdapter = typeof options.createAdapter === 'function' ? options.createAdapter : createModeloBase1GenericModelAdapter;

  const resolution = resolveModeloBase1GenericKernelConsumption({ moduleId, readState, env });

  // Flag off or beta not applied → keep the current ModeloBase1 flow verbatim.
  if (!resolution.consumptionEnabled) {
    return finalizeLegacy({
      moduleId,
      readState,
      consumptionEnabled: false,
      reason: resolution.reason,
    });
  }

  // Consumption enabled: route through the generic kernel adapter, guarded.
  try {
    const adapter = createAdapter({ moduleId });
    if (!adapter || typeof adapter.mapReadToGeneric !== 'function' || typeof adapter.mapGenericToRead !== 'function') {
      throw consumptionError('MAK-MB1-GKC-003', 'adapter does not expose mapReadToGeneric/mapGenericToRead');
    }

    const generic = adapter.mapReadToGeneric({ runtimeReadModel: readState });
    if (!generic || generic.ok !== true || !isGenericModelPlainObject(generic.readModel)) {
      return finalizeFallback({
        moduleId,
        readState,
        reason: 'generic-validation-failed',
        validation: generic ? generic.validation : null,
        errors: generic && Array.isArray(generic.errors) ? generic.errors : ['generic read model invalid'],
        warnings: generic && Array.isArray(generic.warnings) ? generic.warnings : [],
      });
    }

    const reconstructed = adapter.mapGenericToRead({
      readModel: generic.readModel,
      writeBlocked: readState.writeBlocked !== false,
    });
    if (!isGenericModelPlainObject(reconstructed)) {
      return finalizeFallback({ moduleId, readState, reason: 'invalid-read-model', errors: ['generic→read mapping produced a non-object'] });
    }

    // Merge the normalized table/form back onto the ORIGINAL state, preserving
    // every original field the ModeloBase1 engine relies on. Only the table/form
    // shape passes through the generic kernel; all other signals are untouched.
    const merged = mergeConsumedState({ readState, reconstructed });

    const diagnostics = createModeloBase1GenericKernelConsumptionDiagnostics({
      moduleId,
      consumptionEnabled: true,
      consumptionApplied: true,
      legacyFallback: false,
      reason: null,
      validation: generic.validation,
      warnings: generic.warnings,
    });

    return {
      ok: true,
      consumptionEnabled: true,
      consumptionApplied: true,
      legacyFallback: false,
      moduleId,
      readState: merged,
      reason: null,
      diagnostics,
      validation: generic.validation ?? null,
      fallback: null,
      errors: [],
      warnings: Array.isArray(generic.warnings) ? generic.warnings : [],
    };
  } catch (err) {
    return finalizeFallback({
      moduleId,
      readState,
      reason: 'adapter-failure',
      errors: [err && err.message ? String(err.message) : 'adapter failure'],
    });
  }
}

/**
 * Merges the generic-kernel-reconstructed state onto the original read state.
 * Preserves original fields (diagnostics, permissionsApplied, writeBlockMessage,
 * etc.); overrides table/form with the normalized shape and marks the flow.
 * @param {{ readState: Object, reconstructed: Object }} input
 * @returns {Object}
 */
function mergeConsumedState(input) {
  const readState = isGenericModelPlainObject(input.readState) ? input.readState : {};
  const reconstructed = isGenericModelPlainObject(input.reconstructed) ? input.reconstructed : {};
  const table = isGenericModelPlainObject(reconstructed.table) ? reconstructed.table : readState.table;
  const form = isGenericModelPlainObject(reconstructed.form) ? reconstructed.form : readState.form;

  return safeCloneGenericModel({
    ...readState,
    table,
    form,
    // Keep the original beta/writeBlocked semantics; only annotate the flow.
    genericKernelApplied: true,
    genericKernelSource: typeof reconstructed.source === 'string' ? reconstructed.source : 'generic-model-local',
    fallbackApplied: readState.fallbackApplied === true,
    localOnly: true,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
  });
}

/**
 * Legacy path: return the original state unchanged (flag off / beta off).
 * @param {{ moduleId: string, readState: Object|null, consumptionEnabled: boolean, reason: string|null }} input
 */
function finalizeLegacy(input) {
  const readState = isGenericModelPlainObject(input.readState) ? safeCloneGenericModel(input.readState) : null;
  const diagnostics = createModeloBase1GenericKernelConsumptionDiagnostics({
    moduleId: input.moduleId,
    consumptionEnabled: input.consumptionEnabled === true,
    consumptionApplied: false,
    legacyFallback: true,
    reason: input.reason ?? null,
  });
  return {
    ok: true,
    consumptionEnabled: input.consumptionEnabled === true,
    consumptionApplied: false,
    legacyFallback: true,
    moduleId: input.moduleId,
    readState,
    reason: input.reason ?? null,
    diagnostics,
    validation: null,
    fallback: null,
    errors: [],
    warnings: [],
  };
}

/**
 * Failure path: return the original state verbatim + a generic fallback record.
 * @param {{ moduleId: string, readState: Object|null, reason: string, validation?: Object|null, errors?: string[], warnings?: string[] }} input
 */
function finalizeFallback(input) {
  const fb = createModeloBase1GenericKernelConsumptionFallback({
    moduleId: input.moduleId,
    readState: input.readState,
    reason: input.reason,
    errors: input.errors,
    warnings: input.warnings,
  });
  const diagnostics = createModeloBase1GenericKernelConsumptionDiagnostics({
    moduleId: input.moduleId,
    consumptionEnabled: true,
    consumptionApplied: false,
    legacyFallback: true,
    reason: input.reason,
    validation: input.validation ?? null,
    errors: input.errors,
    warnings: input.warnings,
  });
  return {
    ok: false,
    consumptionEnabled: true,
    consumptionApplied: false,
    legacyFallback: true,
    moduleId: input.moduleId,
    readState: fb.readState,
    reason: input.reason,
    diagnostics,
    validation: input.validation ?? null,
    fallback: fb.fallback,
    errors: fb.errors,
    warnings: fb.warnings,
  };
}

export default applyModeloBase1GenericKernelConsumption;
