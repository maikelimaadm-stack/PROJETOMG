import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';

const READINESS = new Set(['ready', 'partial', 'blocked', 'needs_fixes', 'skipped']);

/**
 * Summarizes the MULTI-TYPE HARDENING state into a passive diagnostics record.
 * Pure; never mutates the input; asserts the local-only / no-side-effect
 * invariants. Derives readiness from the conformance suite + capability matrix.
 *
 * @param {Object} [options]
 * @param {Object} [options.registry] Type registry.
 * @param {Object} [options.capabilityMatrix] Capability matrix.
 * @param {Object} [options.suite] Multi-type conformance suite result.
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createGenericModelMultiTypeDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const registry = isGenericModelPlainObject(o.registry) ? o.registry : null;
  const matrix = isGenericModelPlainObject(o.capabilityMatrix) ? o.capabilityMatrix : null;
  const suite = isGenericModelPlainObject(o.suite) ? o.suite : null;

  const registeredTypes = registry && typeof registry.list === 'function' ? registry.list() : (Array.isArray(o.registeredTypes) ? o.registeredTypes : []);
  const activeAdapters = suite && Array.isArray(suite.modelTypes) ? suite.modelTypes : [];
  const conformanceOk = Boolean(suite && suite.ok);
  const matrixOk = Boolean(matrix && matrix.dangerousAllFalse === true);
  const sharedInvariantOk = Boolean(suite && isGenericModelPlainObject(suite.sharedInvariants)
    && suite.sharedInvariants.dangerousCapabilitiesFalse
    && suite.sharedInvariants.persistenceRealFalse
    && suite.sharedInvariants.noForbiddenTargets);

  const blockers = [
    ...(Array.isArray(o.blockers) ? o.blockers : []),
    ...(suite && Array.isArray(suite.blockers) ? suite.blockers : []),
  ];
  const warnings = [
    ...(Array.isArray(o.warnings) ? o.warnings : []),
    ...(suite && Array.isArray(suite.warnings) ? suite.warnings : []),
  ];

  let readiness = 'skipped';
  if (blockers.length > 0) readiness = 'blocked';
  else if (conformanceOk && matrixOk && sharedInvariantOk) readiness = warnings.length > 0 ? 'partial' : 'ready';
  else if (registeredTypes.length > 0) readiness = 'needs_fixes';
  if (typeof o.readiness === 'string' && READINESS.has(o.readiness)) readiness = o.readiness;

  return safeCloneGenericModel({
    kind: 'generic-model-multi-type-diagnostics',
    registeredTypes,
    activeAdapters,
    conformanceStatus: conformanceOk ? 'ok' : (suite ? 'blocked' : 'skipped'),
    capabilityMatrixStatus: matrixOk ? 'ok' : (matrix ? 'blocked' : 'skipped'),
    dangerousCapabilityStatus: matrixOk && sharedInvariantOk ? 'all-false' : 'review',
    sharedInvariantStatus: sharedInvariantOk ? 'ok' : 'review',
    modelSpecificStatus: suite && isGenericModelPlainObject(suite.allowedDifferences) ? 'documented' : 'unknown',
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    localOnly: true,
    noSideEffects: true,
    warnings,
    blockers,
    readiness,
  });
}

export default createGenericModelMultiTypeDiagnostics;
