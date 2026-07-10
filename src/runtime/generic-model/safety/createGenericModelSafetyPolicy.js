import { isGenericModelPlainObject, safeCloneGenericModel } from './assertGenericModelPlainObject.js';
import { GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../contracts/genericModelContractConstants.js';

/**
 * Builds a declarative Generic Model SAFETY POLICY. Dangerous capabilities
 * (backend/Prisma/runtimeBridge/side-effects) are BLOCKED by default; enabling
 * any of them requires an explicit, audited capability gate. Pure and passive —
 * it describes policy, it never executes anything. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {Object} [options.capabilityGates] Explicit opt-in gates (default all off).
 * @returns {Object}
 */
export function createGenericModelSafetyPolicy(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const gates = isGenericModelPlainObject(o.capabilityGates) ? o.capabilityGates : {};

  const capability = (name) => gates[name] === true; // opt-in only

  return safeCloneGenericModel({
    kind: 'generic-model-safety-policy',
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    defaults: {
      backend: 'blocked',
      prisma: 'blocked',
      runtimeBridge: 'blocked',
      sideEffects: 'blocked', // action/workflow/connector
      storage: 'blocked', // no mandatory real storage
    },
    capabilities: {
      // Dangerous capabilities: false unless a gate explicitly opts in.
      backendWrite: capability('backendWrite'),
      workflow: capability('workflow'),
      connector: capability('connector'),
      marketplacePublish: capability('marketplacePublish'),
      // Safe capabilities: default on (still no real IO).
      read: gates.read !== false,
      localWrite: gates.localWrite !== false,
      localPersistenceValidation: gates.localPersistenceValidation !== false,
      studioEditable: gates.studioEditable === true,
    },
    dangerousCapabilities: [...GENERIC_MODEL_DANGEROUS_CAPABILITIES],
    localOnly: true,
    persistenceReal: false,
    noSideEffects: true,
  });
}

/**
 * Evaluates whether a capability is permitted under a policy. Fail-closed:
 * unknown or dangerous capabilities are denied unless the policy explicitly
 * allows them.
 * @param {Object} policy
 * @param {string} capability
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function isGenericModelCapabilityAllowed(policy, capability) {
  if (!isGenericModelPlainObject(policy) || !isGenericModelPlainObject(policy.capabilities)) {
    return { allowed: false, reason: 'invalid policy' };
  }
  const allowed = policy.capabilities[capability] === true;
  return { allowed, reason: allowed ? null : `capability "${capability}" is not permitted by policy` };
}

export default createGenericModelSafetyPolicy;
