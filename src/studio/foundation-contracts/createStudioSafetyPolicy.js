import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** The invariants the whole foundation preserves; any violation is a blocker. */
export const STUDIO_SAFETY_INVARIANTS = {
  headlessOnly: true,
  noUi: true,
  noRoute: true,
  noMenu: true,
  noModuleRegistration: true,
  noBackend: true,
  noPrisma: true,
  noMigration: true,
  noFetch: true,
  noProduction: true,
  noStaging: true,
  noMutation: true,
  noStorage: true,
  noDependency: true,
  defaultDeny: true,
  failClosed: true,
  tenantRequired: true,
  permissionRequired: true,
  noAutomaticPublication: true,
  noAutomaticMarketplace: true,
};

/**
 * The Studio safety policy. Pure. Returns the invariants + a checker that flags any
 * descriptor violating them.
 *
 * @param {Object} [options]
 * @returns {Object} safety policy descriptor
 */
export function createStudioSafetyPolicy(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  /**
   * @param {Object} descriptor
   * @returns {{ok: boolean, violations: string[]}}
   */
  function check(descriptor) {
    const d = isGenericModelPlainObject(descriptor) ? descriptor : {};
    /** @type {string[]} */ const violations = [];
    for (const [k, expected] of Object.entries(STUDIO_SAFETY_INVARIANTS)) {
      if (k in d && d[k] !== expected) violations.push(`${k} must be ${expected}`);
    }
    return { ok: violations.length === 0, violations };
  }

  const body = {
    kind: 'studio-safety-policy',
    invariants: { ...STUDIO_SAFETY_INVARIANTS },
    invariantNames: Object.keys(STUDIO_SAFETY_INVARIANTS),
  };
  return {
    ...safeCloneGenericModel({ ...body, safetyPolicyDigest: createStudioContractDigest({ value: STUDIO_SAFETY_INVARIANTS }) }),
    check,
  };
}

export default createStudioSafetyPolicy;
