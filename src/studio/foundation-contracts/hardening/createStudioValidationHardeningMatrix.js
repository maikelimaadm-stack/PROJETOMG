import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_VALIDATION_KINDS } from '../createStudioValidationBlueprintContract.js';

const ALLOWED = new Set(STUDIO_VALIDATION_KINDS);
const DANGEROUS_REGEX = /(\(.*[+*].*\)[+*])|(\[[^\]]*\][+*]){3,}/;

/**
 * Classifies a validation definition. Pure. Never executes code, never calls the
 * network, never creates a DB constraint, never removes tenant scope.
 * @param {unknown} validation
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioValidation(validation) {
  const v = isGenericModelPlainObject(validation) ? validation : {};
  /** @type {string[]} */ const reasons = [];
  const kind = typeof v.kind === 'string' ? v.kind : '';

  if (!ALLOWED.has(kind)) reasons.push(`unknown validation kind: ${kind || '(none)'}`);
  if (kind === 'regex') {
    if (typeof v.pattern !== 'string') reasons.push('regex pattern is not a string');
    else if (v.pattern.length > 512 || DANGEROUS_REGEX.test(v.pattern)) reasons.push('dangerous regex');
  }
  if (typeof v.fn === 'function') reasons.push('function validator');
  if (typeof v.code === 'string' && v.code.length > 0) reasons.push('custom JS code');
  if (typeof v.eval === 'string' || v.useEval === true) reasons.push('eval');
  if (v.useFunctionConstructor === true) reasons.push('Function constructor');
  if (kind === 'asyncValidationPlanned' && (v.callsNetwork === true || typeof v.url === 'string')) reasons.push('async validation calls network / external URL');
  if (kind === 'uniquePlanned' && v.createsConstraint === true) reasons.push('unique creates a DB constraint');
  if (kind === 'relationExists' && v.accessesBackend === true) reasons.push('relationExists accesses backend');
  if (kind === 'tenantScope' && v.enabled === false) reasons.push('tenantScope disabled');
  if (v.removesTenantScope === true) reasons.push('removes tenant scope');
  if (kind === 'crossFieldValidation' && v.circular === true && v.maxDepth == null) reasons.push('crossField circular without limit');
  if (v.mutatesValue === true || v.sideEffect === true) reasons.push('validation has a side effect');

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const VALID_VALIDATIONS = [
  ['required', { kind: 'required' }],
  ['typeCheck', { kind: 'typeCheck' }],
  ['min', { kind: 'min', value: 0 }],
  ['max', { kind: 'max', value: 10 }],
  ['safe regex', { kind: 'regex', pattern: '^[0-9]{1,8}$' }],
  ['enum', { kind: 'enum', values: ['a', 'b'] }],
  ['relationExists planned', { kind: 'relationExists' }],
  ['uniquePlanned', { kind: 'uniquePlanned' }],
  ['tenantScope', { kind: 'tenantScope', enabled: true }],
  ['computedValidation restricted', { kind: 'computedValidation' }],
  ['crossFieldValidation declarative', { kind: 'crossFieldValidation', maxDepth: 3 }],
  ['asyncValidationPlanned no network', { kind: 'asyncValidationPlanned' }],
].map(([name, val]) => [name, val, true]);

const INVALID_VALIDATIONS = [
  ['unknown validation', { kind: 'evil' }],
  ['regex not string', { kind: 'regex', pattern: 42 }],
  ['dangerous regex', { kind: 'regex', pattern: '(a+)+$' }],
  ['function validator', { kind: 'required', fn: () => true }],
  ['eval', { kind: 'required', useEval: true }],
  ['Function constructor', { kind: 'required', useFunctionConstructor: true }],
  ['custom JS code', { kind: 'required', code: 'return true' }],
  ['async fetch', { kind: 'asyncValidationPlanned', callsNetwork: true }],
  ['external URL', { kind: 'asyncValidationPlanned', url: 'https://evil' }],
  ['unique creates constraint', { kind: 'uniquePlanned', createsConstraint: true }],
  ['relationExists backend', { kind: 'relationExists', accessesBackend: true }],
  ['tenantScope false', { kind: 'tenantScope', enabled: false }],
  ['crossField circular', { kind: 'crossFieldValidation', circular: true }],
  ['validation side effect', { kind: 'required', sideEffect: true }],
].map(([name, val]) => [name, val, false]);

/**
 * Runs the validation hardening matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioValidationHardeningMatrix(options = {}) {
  void options;
  const scenarios = [...VALID_VALIDATIONS, ...INVALID_VALIDATIONS].map(([name, validation, expectValid]) => {
    const r = evaluateStudioValidation(validation);
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      expectValid: Boolean(expectValid),
      matchedExpectation: r.valid === Boolean(expectValid),
      codeExecuted: false, networkCalled: false, constraintCreated: false, tenantPreserved: true,
      reasons: r.reasons.slice(0, 4),
    };
  });
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-validation-hardening-matrix',
    allowedKinds: [...STUDIO_VALIDATION_KINDS],
    scenarios,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioValidationHardeningMatrix;
