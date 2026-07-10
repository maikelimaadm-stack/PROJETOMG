import { isPlainObject } from '../shadow/pilots/tableFormProjection.js';

/**
 * The ModeloBase1 direct beta is fully reversible: when the feature flag is off
 * (or production-blocked), NOTHING is injected into the ModeloBase1 config and
 * the screen renders exactly as before (legacy config path). This module makes
 * that fallback contract explicit and testable.
 *
 * The canonical "no injection" value is `null` — the ModeloBase1 injection point
 * treats a `null`/absent read model as a no-op (see
 * `src/ModeloBase1/config/modeloBase1RuntimeReadModel.js`). The module config
 * only attaches a `runtimeReadModel` key when a beta model is present, so with
 * the flag off the built config is byte-identical to the pre-slice config.
 */

/**
 * Builds a passive fallback descriptor (diagnostics only). It is NOT injected
 * into the ModeloBase1 config; it exists to document/inspect why the beta read
 * model is absent. Deterministic and pure.
 *
 * @param {Object} options
 * @param {string} options.moduleId
 * @param {'flag-disabled'|'production-blocked'} [options.reason]
 * @returns {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaFallback}
 */
export function createModeloBase1DirectBetaFallback(options = {}) {
  const moduleId = isPlainObject(options) && typeof options.moduleId === 'string' ? options.moduleId : 'unknown';
  const reason = isPlainObject(options) && options.reason === 'production-blocked' ? 'production-blocked' : 'flag-disabled';
  return {
    kind: 'modelobase1-direct-beta-fallback',
    moduleId,
    injected: false,
    readModel: null,
    usesLegacyConfig: true,
    reason,
    reversible: true,
    note: 'beta flag off — ModeloBase1 renders the legacy config unchanged (no runtime v2 read model injected)',
  };
}

/**
 * True when the given injected read model represents "no injection" — i.e. it is
 * null/undefined or explicitly not enabled. The ModeloBase1 config falls back to
 * the legacy behavior in that case.
 * @param {unknown} readModel
 * @returns {boolean}
 */
export function isModeloBase1DirectBetaFallback(readModel) {
  if (readModel == null) return true;
  if (isPlainObject(readModel) && readModel.enabled === false) return true;
  return false;
}

export default createModeloBase1DirectBetaFallback;
