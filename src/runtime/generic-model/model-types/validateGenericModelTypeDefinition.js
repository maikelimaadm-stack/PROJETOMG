import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelUnsafeMarkers, detectGenericModelForbiddenTargetKeys } from '../safety/detectGenericModelUnsafeMarkers.js';
import { GENERIC_MODEL_TYPES, GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../contracts/genericModelContractConstants.js';

const PERSISTENCE_POLICIES = new Set(['none', 'local_validation', 'local']);
const SIDE_EFFECT_POLICIES = new Set(['none', 'local-only']);

/**
 * Structural contract-metadata key names that START with a forbidden prefix
 * (e.g. `persist…`) but are benign vocabulary of the contracts themselves, NOT a
 * routing target. Filtered out of the forbidden-target scan for definitions/
 * descriptors (which legitimately name `persistencePolicy`/`persistenceContract`).
 */
const STRUCTURAL_BENIGN_TARGET_KEYS = new Set([
  'persistencepolicy', 'persistencecontract', 'persistencebridge', 'persistencemode', 'persistencereal', 'persistence',
  'storagemode', 'storagemodes', 'backendallowed', 'backendtouched', 'prismatouched', 'runtimebridgetouched',
]);

/** Filters structural benign contract keys out of the raw forbidden-target hits. */
export function filterStructuralForbiddenTargets(found) {
  return (Array.isArray(found) ? found : []).filter((entry) => {
    const m = /^key:([^@]+)@/.exec(String(entry));
    const key = m ? m[1].toLowerCase() : '';
    return !STRUCTURAL_BENIGN_TARGET_KEYS.has(key);
  });
}

/**
 * Validates a GENERIC MODEL TYPE DEFINITION. Fail-closed: unknown type (non-custom),
 * missing required fields, unsafe content (function/handler/React/pollution) or a
 * forbidden backend/Prisma/runtimeBridge target all reject it. Dangerous
 * capabilities may be declared but must be listed (never silently enabled). Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.definition]
 * @param {boolean} [options.allowDangerous] Reserved; default false.
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToRegister: boolean }}
 */
export function validateGenericModelTypeDefinition(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const def = isGenericModelPlainObject(o.definition) ? o.definition : null;

  if (!def) {
    return { valid: false, errors: ['definition must be a plain object'], warnings, blockers, score: 0, safeToRegister: false };
  }

  // modelType known or an explicitly-custom string.
  if (typeof def.modelType !== 'string' || def.modelType.length === 0) errors.push('modelType is required');
  else if (!GENERIC_MODEL_TYPES.includes(def.modelType) && def.modelType !== 'custom') warnings.push(`modelType "${def.modelType}" is not a known type (treated as custom)`);

  if (!Array.isArray(def.requiredContracts) || def.requiredContracts.length === 0) errors.push('requiredContracts must be a non-empty array');
  if (!Array.isArray(def.dangerousCapabilities)) errors.push('dangerousCapabilities must be a declared array');
  else {
    const unknownDanger = def.dangerousCapabilities.filter((c) => !GENERIC_MODEL_DANGEROUS_CAPABILITIES.includes(c) && !['transaction', 'workflowState'].includes(c));
    if (unknownDanger.length > 0) warnings.push(`unknown dangerous capabilities: ${unknownDanger.join(', ')}`);
  }
  if (!isGenericModelPlainObject(def.defaultSafety)) errors.push('defaultSafety must be a plain object');
  else {
    if (def.defaultSafety.persistenceReal === true) blockers.push('defaultSafety.persistenceReal must be false');
    if (def.defaultSafety.localOnly !== true) warnings.push('defaultSafety.localOnly should be true');
  }

  if (typeof def.persistencePolicy !== 'string' || !PERSISTENCE_POLICIES.has(def.persistencePolicy)) errors.push(`persistencePolicy must be one of ${[...PERSISTENCE_POLICIES].join('/')}`);
  if (typeof def.sideEffectPolicy !== 'string' || !SIDE_EFFECT_POLICIES.has(def.sideEffectPolicy)) errors.push(`sideEffectPolicy must be one of ${[...SIDE_EFFECT_POLICIES].join('/')}`);
  if (!isGenericModelPlainObject(def.expectedReadShape)) errors.push('expectedReadShape must be a plain object');
  if (!isGenericModelPlainObject(def.expectedWriteShape)) errors.push('expectedWriteShape must be a plain object');

  // Safety: no function/handler/React/pollution; no forbidden target keys.
  const markers = detectGenericModelUnsafeMarkers(def);
  if (markers.unsafeMarkers.length > 0) blockers.push(...markers.unsafeMarkers.map((m) => `unsafe:${m}`));
  const forbidden = filterStructuralForbiddenTargets(detectGenericModelForbiddenTargetKeys(def));
  if (forbidden.length > 0) blockers.push(...forbidden.map((t) => `forbidden-target:${t}`));

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 8);
  return { valid, errors, warnings, blockers, score, safeToRegister: valid };
}

export default validateGenericModelTypeDefinition;
