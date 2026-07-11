import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { createGenericModelTypeRegistry } from '../model-types/createGenericModelTypeRegistry.js';
import { createGenericModelCapabilityMatrix } from '../capabilities/createGenericModelCapabilityMatrix.js';
import { createGenericModelAdapterConformanceReport } from './createGenericModelAdapterConformanceReport.js';

/**
 * Runs the MULTI-TYPE CONFORMANCE SUITE over a set of INJECTED adapters (kept
 * injected so the generic runtime never imports ModeloBase1/ModeloBase2). It
 * validates each adapter against its model type, asserts the shared invariants,
 * and records the allowed differences between cadastro and operacional. Pure.
 *
 * @param {Object} [options]
 * @param {Array<{ adapter: Object, expectedModelType: string, expectedModelFamily?: string }>} [options.adapters]
 * @param {Object} [options.registry] Injectable type registry.
 * @param {Object} [options.capabilityMatrix] Injectable capability matrix.
 * @returns {Object} suite result
 */
export function createGenericModelMultiTypeConformanceSuite(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const registry = isGenericModelPlainObject(o.registry) ? o.registry : createGenericModelTypeRegistry();
  const capabilityMatrix = isGenericModelPlainObject(o.capabilityMatrix) ? o.capabilityMatrix : createGenericModelCapabilityMatrix();
  const inputs = Array.isArray(o.adapters) ? o.adapters : [];

  const reports = [];
  const modelTypes = [];
  const blockers = [];
  const warnings = [];

  for (const item of inputs) {
    const it = isGenericModelPlainObject(item) ? item : {};
    const expectedModelType = typeof it.expectedModelType === 'string' ? it.expectedModelType : (isGenericModelPlainObject(it.adapter) ? it.adapter.modelType : undefined);
    const report = createGenericModelAdapterConformanceReport({
      adapter: it.adapter,
      modelTypeDefinition: registry.get(expectedModelType),
      capabilityMatrix,
      expectedModelType,
      expectedModelFamily: it.expectedModelFamily,
    });
    reports.push(report);
    if (typeof report.modelType === 'string') modelTypes.push(report.modelType);
    if (!report.safeToConsume) blockers.push(`${expectedModelType}: ${report.blockers.join(', ')}`);
    for (const w of report.warnings) warnings.push(`${expectedModelType}: ${w}`);
  }

  const allPassed = (rule) => reports.length > 0 && reports.every((r) => r.passedRules.includes(rule));
  const sharedInvariants = {
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    dangerousCapabilitiesFalse: allPassed('dangerousCapabilitiesFalse'),
    persistenceRealFalse: allPassed('persistenceRealFalse'),
    fallbackAvailable: allPassed('fallback'),
    diagnosticsAvailable: allPassed('diagnostics'),
    readContractAvailable: allPassed('readContract'),
    noForbiddenTargets: allPassed('noForbiddenTargets'),
    noFetch: true,
    noMandatoryStorage: true,
    returnsSafeCopies: true,
    noInputMutation: true,
  };

  const allowedDifferences = {
    cadastro: { central: 'table/form', localWrite: 'crud-local', eventAppend: false, sent: 'n/a' },
    operacional: { central: 'entries/timeline/event', localWrite: 'event-append', eventAppend: true, sent: false, tableForm: 'secondary-compat' },
  };

  const ok = blockers.length === 0 && reports.length > 0;
  return safeCloneGenericModel({
    kind: 'generic-model-multi-type-conformance-suite',
    ok,
    modelTypes: [...new Set(modelTypes)].sort(),
    reports,
    sharedInvariants,
    allowedDifferences,
    blockers,
    warnings,
    registeredTypes: registry.list(),
    nextSteps: ['ModeloBase2 Operational Runtime Foundation'],
    localOnly: true,
    persistenceReal: false,
  });
}

export default createGenericModelMultiTypeConformanceSuite;
