import { isGenericModelPlainObject } from '../../../../runtime/generic-model/index.js';

/**
 * Asserts the non-negotiable read-only/local invariants across any hardening
 * descriptor. Returns `{ ok, violations }`. Pure.
 *
 * @param {Object} [descriptor]
 * @returns {{ok: boolean, violations: string[]}}
 */
export function validateEmpresasHardeningInvariant(descriptor = {}) {
  const d = isGenericModelPlainObject(descriptor) ? descriptor : {};
  /** @type {string[]} */ const violations = [];
  const mustBeFalse = ['mutationAllowed', 'productionAccessed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'tenantLeakageFound', 'permissionBypassFound', 'mutationExposureFound'];
  for (const k of mustBeFalse) {
    if (k in d && d[k] !== false) violations.push(`${k} must be false`);
  }
  const mustBeTrue = ['synthetic', 'localOnly', 'readOnly'];
  for (const k of mustBeTrue) {
    if (k in d && d[k] !== true) violations.push(`${k} must be true`);
  }
  if ('environment' in d && d.environment !== 'local_test') violations.push('environment must be local_test');
  return { ok: violations.length === 0, violations };
}

export default validateEmpresasHardeningInvariant;
