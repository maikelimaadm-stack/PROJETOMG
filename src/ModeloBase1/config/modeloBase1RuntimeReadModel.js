/**
 * ModeloBase1 runtime read-model injection point.
 *
 * A ModeloBase1 config may optionally carry a `runtimeReadModel` — an additive,
 * OPT-IN slot where a module can inject a runtime v2 read model (currently used
 * by the Empresas/Campos direct-beta activation, behind a feature flag). The
 * slot is a NO-OP when absent: with no read model the ModeloBase1 config and the
 * rendered screen are byte-identical to the pre-injection behavior (legacy
 * config path). The ModeloBase1 engine does not consume this slot yet — it is a
 * passive seam that Phase 2 (ModeloBase1 Runtime Wiring) will read from.
 *
 * This module is pure and framework-agnostic: it never imports the runtime
 * module (keeping the ModeloBase1 engine decoupled from runtime v2).
 */

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalizes a candidate runtime read model for the ModeloBase1 config. Returns
 * the model unchanged when it is a plain, enabled read model; otherwise returns
 * `null` (the no-op / fallback value). An explicitly disabled read model
 * (`enabled === false`) normalizes to `null` so the legacy path is used.
 *
 * @param {unknown} readModel
 * @returns {object|null}
 */
export function normalizeModeloBase1RuntimeReadModel(readModel) {
  if (!isPlainObject(readModel)) return null;
  if (readModel.enabled === false) return null;
  return readModel;
}

/**
 * Reads the injected runtime read model from a built ModeloBase1 config. Returns
 * `null` when no read model is present (fallback / legacy path). This is the
 * Phase-2 seam: the engine (or an inspector) can call this to discover whether a
 * runtime v2 read model is attached, without any coupling to the runtime module.
 *
 * @param {object|null|undefined} config
 * @returns {object|null}
 */
export function readModeloBase1RuntimeReadModel(config) {
  if (!isPlainObject(config)) return null;
  return normalizeModeloBase1RuntimeReadModel(config.runtimeReadModel);
}

/**
 * True when the given ModeloBase1 config has an active runtime read model
 * injected (i.e. the beta is on for that screen). False otherwise (fallback).
 * @param {object|null|undefined} config
 * @returns {boolean}
 */
export function hasModeloBase1RuntimeReadModel(config) {
  return readModeloBase1RuntimeReadModel(config) !== null;
}
