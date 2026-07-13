import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Computes the engine's readiness verdict for a processed blueprint. Pure. The engine
 * FOUNDATION is "ready" only when structure is valid, safety holds, hardening passes,
 * and the manifest verified — and even then it emits a headless blueprint, never a
 * generated module. Never a side effect.
 *
 * @param {Object} [options]
 * @returns {Object} readiness descriptor
 */
export function createStudioBlueprintEngineReadiness(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const validation = isGenericModelPlainObject(o.validation) ? o.validation : {};
  const safety = isGenericModelPlainObject(o.safety) ? o.safety : {};
  const hardening = isGenericModelPlainObject(o.hardening) ? o.hardening : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};

  /** @type {string[]} */ const blockers = [];
  if (validation.valid === false) blockers.push('structural invalid');
  if (safety.safe === false) blockers.push('safety violation');
  if (hardening.passed === false) blockers.push('hardening violation');
  if (verification.valid === false) blockers.push('manifest verification failed');

  const blueprintReady = blockers.length === 0;

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine-readiness',
    // The engine foundation itself is ready to be consumed as a contract kernel.
    engineFoundationReady: true,
    // A specific blueprint is ready only when every stage passed.
    blueprintReady,
    // Even a ready blueprint stays headless: no module is generated here.
    emitsGeneratedModule: false,
    generationAllowedNow: false,
    blockers,
    readiness: blueprintReady ? 'blueprint_engine_foundation_ready' : 'blocked',
  });
}

export default createStudioBlueprintEngineReadiness;
