import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelForbiddenTargetKeys } from '../safety/detectGenericModelUnsafeMarkers.js';
import { GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS, GENERIC_MODEL_CAPABILITY_KEYS } from './genericModelCapabilityDefaults.js';
import { filterStructuralForbiddenTargets } from '../model-types/validateGenericModelTypeDefinition.js';

/** Capability KEY names are a known vocabulary (e.g. `backendWrite`), not routing targets. */
const CAPABILITY_KEY_SET = new Set(GENERIC_MODEL_CAPABILITY_KEYS.map((k) => k.toLowerCase()));
function foreignForbiddenTargets(capabilities) {
  return filterStructuralForbiddenTargets(detectGenericModelForbiddenTargetKeys(capabilities)).filter((entry) => {
    const m = /^key:([^@]+)@/.exec(String(entry));
    return m ? !CAPABILITY_KEY_SET.has(m[1].toLowerCase()) : true;
  });
}

/**
 * Validates a capability set. Fail-closed: any dangerous capability
 * (backendWrite/connector/marketplacePublish/workflowState/transaction) set true
 * WITHOUT `explicitAllowDangerous` is blocked; `persistenceReal: true` is blocked
 * at this stage; forbidden backend/Prisma/runtimeBridge target keys are blocked.
 * Pure.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.capabilities]
 * @param {string} [options.modelType]
 * @param {boolean} [options.explicitAllowDangerous] Default false.
 * @param {boolean} [options.persistenceReal] Observed persistenceReal (must be false).
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToUse: boolean }}
 */
export function validateGenericModelCapabilities(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const capabilities = isGenericModelPlainObject(o.capabilities) ? o.capabilities : null;
  const explicitAllowDangerous = o.explicitAllowDangerous === true;

  if (!capabilities) {
    return { valid: false, errors: ['capabilities must be a plain object'], warnings, blockers, score: 0, safeToUse: false };
  }

  for (const key of GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS) {
    if (capabilities[key] === true && !explicitAllowDangerous) {
      blockers.push(`dangerous capability "${key}" requires explicitAllowDangerous`);
    }
  }
  if (o.persistenceReal === true) blockers.push('persistenceReal must be false at this stage');
  if (capabilities.persistenceReal === true) blockers.push('capabilities.persistenceReal must be false at this stage');

  const forbidden = foreignForbiddenTargets(capabilities);
  if (forbidden.length > 0) blockers.push(...forbidden.map((t) => `forbidden-target:${t}`));

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 6);
  return { valid, errors, warnings, blockers, score, safeToUse: valid };
}

export default validateGenericModelCapabilities;
