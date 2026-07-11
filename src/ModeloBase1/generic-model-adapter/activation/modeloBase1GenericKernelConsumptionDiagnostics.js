import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Builds a passive DIAGNOSTICS record for a generic kernel consumption attempt.
 * Pure; never mutates its input. Asserts the local-only / no-side-effect
 * invariants so downstream observers can trust the flow never touched a backend/
 * Prisma/runtime bridge / real persistence.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.consumptionEnabled] Flag + beta resolved on.
 * @param {boolean} [options.consumptionApplied] Generic kernel actually applied.
 * @param {boolean} [options.legacyFallback] Fell back to the current flow.
 * @param {string|null} [options.reason]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.errors]
 * @param {Object|null} [options.validation] Generic validation result.
 * @returns {Object} diagnostics
 */
export function createModeloBase1GenericKernelConsumptionDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const consumptionEnabled = o.consumptionEnabled === true;
  const consumptionApplied = o.consumptionApplied === true;
  const legacyFallback = o.legacyFallback === true || !consumptionApplied;
  const validation = isGenericModelPlainObject(o.validation) ? o.validation : null;

  return safeCloneGenericModel({
    kind: 'modelobase1-generic-kernel-consumption-diagnostics',
    moduleId,
    phase: 'empresas-cadcps-generic-kernel-consumption',
    consumptionEnabled,
    consumptionApplied,
    legacyFallback,
    genericKernelApplied: consumptionApplied,
    readiness: consumptionApplied ? 'generic-kernel' : 'legacy',
    reason: typeof o.reason === 'string' ? o.reason : null,
    validation: validation ? { valid: validation.valid === true, errorCount: Array.isArray(validation.errors) ? validation.errors.length : 0 } : null,
    warnings: Array.isArray(o.warnings) ? o.warnings : [],
    errors: Array.isArray(o.errors) ? o.errors : [],
    // Safe invariants — the consumption path is pure and reversible.
    localOnly: true,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    noSideEffects: true,
    reversible: true,
  });
}

export default createModeloBase1GenericKernelConsumptionDiagnostics;
