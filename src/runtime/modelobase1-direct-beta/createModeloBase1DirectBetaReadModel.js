import {
  isPlainObject,
  safeClone,
} from '../shadow/pilots/tableFormProjection.js';
import { directBetaError } from './errors.js';

/** Where the beta read model plugs into the ModeloBase1 config. */
export const MODELOBASE1_INJECTION_POINT = 'ModeloBase1.runtimeReadModel';

/** @param {string} code @param {string} message */
function betaError(code, message) {
  return directBetaError(/** @type {any} */ (code), message);
}

/**
 * Builds the generic, injectable ModeloBase1 DIRECT BETA read model descriptor.
 *
 * This is the value a beta screen attaches to its ModeloBase1 config under the
 * `runtimeReadModel` slot when its feature flag is on. It is a passive,
 * deterministic description — no React element, no click handler, no execution
 * path. It carries a live `writeGuard` (every write is blocked) and an async
 * `resolve()` that materializes the full read-only view model on demand
 * (structure/rows come from runtime v2 + the controlled dev dataset — never real
 * data, never the backend, never Prisma).
 *
 * The static descriptor is deterministic (deep-equal across calls); the resolved
 * model is a safe deep copy with the live `writeGuard` re-attached.
 *
 * @param {Object} options
 * @param {string} options.moduleId
 * @param {string} options.moduleName
 * @param {boolean} options.enabled
 * @param {boolean} [options.productionBlocked]
 * @param {string} options.source
 * @param {import('../types/modelobase1-direct-beta.js').BetaWriteGuard} options.writeGuard
 * @param {() => (Promise<Object>|Object)} options.resolveViewModel
 * @param {string} [options.betaFlag]
 * @returns {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel}
 */
export function createModeloBase1DirectBetaReadModel(options = {}) {
  if (!isPlainObject(options)) {
    throw betaError('MAK-L3-MB1-BETA-004', 'createModeloBase1DirectBetaReadModel() options must be a plain object');
  }
  // Shallow pollution guard on the options envelope (never the deep trusted models).
  if (['__proto__', 'constructor', 'prototype'].some((k) => Object.prototype.hasOwnProperty.call(options, k))) {
    throw betaError('MAK-L3-MB1-BETA-007', 'createModeloBase1DirectBetaReadModel() options contain a forbidden key');
  }
  const { moduleId, moduleName, enabled, productionBlocked = false, source, writeGuard, resolveViewModel, betaFlag } = options;
  if (typeof moduleId !== 'string' || moduleId.length === 0) {
    throw betaError('MAK-L3-MB1-BETA-004', 'createModeloBase1DirectBetaReadModel() requires a moduleId');
  }
  if (typeof resolveViewModel !== 'function') {
    throw betaError('MAK-L3-MB1-BETA-004', 'createModeloBase1DirectBetaReadModel() requires a resolveViewModel function');
  }
  if (!writeGuard || typeof writeGuard.attempt !== 'function') {
    throw betaError('MAK-L3-MB1-BETA-004', 'createModeloBase1DirectBetaReadModel() requires a write guard with attempt()');
  }

  /**
   * Materializes the full read-only view model. Every call returns a fresh safe
   * copy with the live write guard re-attached (the guard's `attempt` function
   * is dropped by the JSON clone, so it is re-attached afterwards).
   * @returns {Promise<Object>}
   */
  async function resolve() {
    const viewModel = await resolveViewModel();
    if (!isPlainObject(viewModel)) {
      throw betaError('MAK-L3-MB1-BETA-004', `resolveViewModel() for "${moduleId}" must return a plain object`);
    }
    const model = {
      kind: 'modelobase1-direct-beta-resolved',
      moduleId,
      moduleName,
      readOnly: true,
      injectedAt: MODELOBASE1_INJECTION_POINT,
      source,
      table: viewModel.table ?? null,
      form: viewModel.form ?? null,
      permissions: viewModel.permissions ?? [],
      validations: viewModel.validations ?? [],
      writeActionsBlocked: true,
      usesRealData: false,
    };
    const cloned = /** @type {any} */ (safeClone(model));
    cloned.writeGuard = writeGuard; // re-attach the live guard dropped by the clone
    return cloned;
  }

  return {
    kind: 'modelobase1-direct-beta-read-model',
    moduleId,
    moduleName,
    enabled: Boolean(enabled),
    injected: Boolean(enabled),
    productionBlocked: Boolean(productionBlocked),
    readOnly: true,
    injectedAt: MODELOBASE1_INJECTION_POINT,
    source,
    betaFlag: betaFlag ?? null,
    writeActionsBlocked: true,
    usesRealData: false,
    writeGuard,
    resolve,
  };
}

/**
 * Attempts a write through the read model's guard and asserts it is blocked.
 * Convenience for callers/tests; never performs the operation.
 * @param {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel} readModel
 * @param {string} operation
 * @param {unknown} [payload]
 * @returns {import('../types/modelobase1-direct-beta.js').BetaWriteGuardResult}
 */
export function attemptDirectBetaWrite(readModel, operation, payload) {
  if (!isPlainObject(readModel) || !readModel.writeGuard || typeof readModel.writeGuard.attempt !== 'function') {
    throw betaError('MAK-L3-MB1-BETA-004', 'attemptDirectBetaWrite() requires a read model with a write guard');
  }
  return readModel.writeGuard.attempt(operation, payload);
}
