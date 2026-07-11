import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { validateGenericModelAdapterConformance } from './validateGenericModelAdapterConformance.js';

/**
 * Produces a structured, documentable CONFORMANCE REPORT for a single adapter.
 * Pure; returns a safe clone (no live functions). Wraps
 * validateGenericModelAdapterConformance + carries the invariant flags.
 *
 * @param {Object} [options] Same shape as validateGenericModelAdapterConformance.
 * @returns {Object} report
 */
export function createGenericModelAdapterConformanceReport(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const result = validateGenericModelAdapterConformance(o);

  return safeCloneGenericModel({
    kind: 'generic-model-adapter-conformance-report',
    modelType: result.modelType,
    modelFamily: result.modelFamily,
    expectedModelType: typeof o.expectedModelType === 'string' ? o.expectedModelType : null,
    expectedModelFamily: typeof o.expectedModelFamily === 'string' ? o.expectedModelFamily : null,
    valid: result.valid,
    safeToConsume: result.safeToConsume,
    conformanceScore: result.conformanceScore,
    passedRules: result.passedRules,
    blockers: result.blockers,
    warnings: result.warnings,
    recommendations: result.recommendations,
    invariants: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
      localOnly: true,
      noSideEffects: true,
    },
  });
}

export default createGenericModelAdapterConformanceReport;
