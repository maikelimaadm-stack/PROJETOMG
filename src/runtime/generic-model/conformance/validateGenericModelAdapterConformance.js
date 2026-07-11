import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelForbiddenTargetKeys } from '../safety/detectGenericModelUnsafeMarkers.js';
import { GENERIC_MODEL_DANGEROUS_CAPABILITIES } from '../contracts/genericModelContractConstants.js';
import { getApplicableConformanceRules } from './genericModelConformanceRules.js';
import { filterStructuralForbiddenTargets } from '../model-types/validateGenericModelTypeDefinition.js';

/** Tolerant presence detectors (an adapter may expose a member in several places). */
const has = {
  readContract: (a) => Boolean(a.readContract || (isGenericModelPlainObject(a.runtimeContract) && a.runtimeContract.readContract) || typeof a.mapReadToGeneric === 'function'),
  writeContract: (a) => Boolean(a.writeContract || (isGenericModelPlainObject(a.runtimeContract) && a.runtimeContract.writeContract) || a.writeBridge),
  eventContract: (a) => Boolean(a.eventContract),
  persistence: (a) => Boolean(a.persistenceBridge || a.persistenceContract || (isGenericModelPlainObject(a.runtimeContract) && a.runtimeContract.persistenceContract) || typeof a.createSnapshot === 'function' || typeof a.roundTrip === 'function'),
  diagnostics: (a) => Boolean(a.diagnosticsBridge || typeof a.createDiagnostics === 'function' || a.diagnostics),
  fallback: (a) => Boolean(a.fallbackBridge || typeof a.createFallback === 'function' || a.fallback),
};

/**
 * Trusted, kernel-produced containers whose SAFETY VOCABULARY legitimately names
 * `backend`/`prisma`/`runtimeBridge`/`storage`/`backendWrite` (declaring them
 * false/blocked). They are validated by the foundation's own gates — re-scanning
 * them here would false-positive on that vocabulary. The `noForbiddenTargets`
 * rule scans only the ADAPTER-AUTHORED metadata, so a forbidden routing target
 * smuggled into the descriptor itself is still caught.
 */
const TRUSTED_CONTRACT_CONTAINERS = new Set([
  'runtimeContract', 'safetyPolicy', 'readContract', 'writeContract', 'eventContract',
  'persistenceContract', 'capabilities', 'diagnostics',
]);

/** Only adapter-authored serializable fields (drop functions + trusted kernel contracts). */
function plainDescriptor(a) {
  const out = {};
  for (const [k, v] of Object.entries(a)) {
    if (TRUSTED_CONTRACT_CONTAINERS.has(k)) continue;
    const t = typeof v;
    if (t === 'function') continue;
    if (t === 'object' && v !== null) { try { JSON.stringify(v); out[k] = v; } catch { /* skip cyclic/live */ } continue; }
    out[k] = v;
  }
  return out;
}

/**
 * Validates a model ADAPTER against the generic conformance rules for its model
 * type. Tolerant of how MB1/MB2 expose contracts. Pure — reads the adapter object,
 * never mutates it, never triggers a side effect.
 *
 * @param {Object} [options]
 * @param {Object} [options.adapter]
 * @param {Object} [options.modelTypeDefinition]
 * @param {Object} [options.capabilityMatrix]
 * @param {string} [options.expectedModelFamily]
 * @param {string} [options.expectedModelType]
 * @returns {{ valid: boolean, conformanceScore: number, passedRules: string[], warnings: string[], blockers: string[], recommendations: string[], safeToConsume: boolean, modelType: string|null, modelFamily: string|null }}
 */
export function validateGenericModelAdapterConformance(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const a = isGenericModelPlainObject(o.adapter) ? o.adapter : null;
  /** @type {string[]} */ const passedRules = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];
  /** @type {string[]} */ const recommendations = [];

  if (!a) {
    return { valid: false, conformanceScore: 0, passedRules, warnings, blockers: ['adapter must be a plain object'], recommendations, safeToConsume: false, modelType: null, modelFamily: null };
  }

  const supports = isGenericModelPlainObject(a.supports) ? a.supports : {};
  const capabilities = isGenericModelPlainObject(a.capabilities) ? a.capabilities : {};
  const applicable = getApplicableConformanceRules(supports);

  const check = (id, ok, hint) => {
    if (ok) passedRules.push(id);
    else { blockers.push(`conformance:${id}`); if (hint) recommendations.push(hint); }
  };

  for (const rule of applicable) {
    switch (rule.id) {
      case 'adapterId': check('adapterId', typeof a.adapterId === 'string' && a.adapterId.length > 0, 'expose a string adapterId'); break;
      case 'modelFamily': check('modelFamily', typeof a.modelFamily === 'string' && (!o.expectedModelFamily || a.modelFamily === o.expectedModelFamily), `modelFamily should equal "${o.expectedModelFamily ?? '<any>'}"`); break;
      case 'modelType': check('modelType', typeof a.modelType === 'string' && (!o.expectedModelType || a.modelType === o.expectedModelType), `modelType should equal "${o.expectedModelType ?? '<any>'}"`); break;
      case 'supports': check('supports', isGenericModelPlainObject(a.supports) && a.supports.read === true, 'declare a supports object with read:true'); break;
      case 'readContract': check('readContract', has.readContract(a), 'provide a read contract / map'); break;
      case 'writeContract': check('writeContract', has.writeContract(a), 'provide a write contract when localWrite'); break;
      case 'eventContract': check('eventContract', has.eventContract(a), 'provide an eventContract when eventAppend'); break;
      case 'persistence': check('persistence', has.persistence(a), 'provide persistence/snapshot when localPersistenceValidation'); break;
      case 'diagnostics': check('diagnostics', has.diagnostics(a), 'provide diagnostics'); break;
      case 'fallback': check('fallback', has.fallback(a), 'provide fallback'); break;
      case 'dangerousCapabilitiesFalse': check('dangerousCapabilitiesFalse', GENERIC_MODEL_DANGEROUS_CAPABILITIES.every((c) => capabilities[c] === false), 'dangerous capabilities must be false'); break;
      case 'localOnly': check('localOnly', a.localOnly === true, 'localOnly must be true when local write'); break;
      case 'persistenceRealFalse': check('persistenceRealFalse', a.persistenceReal === false, 'persistenceReal must be false'); break;
      case 'sentFalse': check('sentFalse', a.sent === false, 'sent must be false for operational adapters'); break;
      case 'noForbiddenTargets': check('noForbiddenTargets', filterStructuralForbiddenTargets(detectGenericModelForbiddenTargetKeys(plainDescriptor(a))).length === 0, 'remove backend/Prisma/runtimeBridge target keys'); break;
      default: break;
    }
  }

  // Cross-check declared capabilities against the matrix (warning only).
  if (isGenericModelPlainObject(o.capabilityMatrix) && typeof a.modelType === 'string') {
    const expected = isGenericModelPlainObject(o.capabilityMatrix.matrix) ? o.capabilityMatrix.matrix[a.modelType] : null;
    if (expected) {
      for (const [k, v] of Object.entries(expected)) {
        if (v === true && capabilities[k] === false && ['read', 'localWrite', 'localPersistenceValidation', 'eventAppend'].includes(k)) {
          warnings.push(`capability "${k}" expected true for ${a.modelType} but adapter reports false`);
        }
      }
    }
  }

  const totalApplicable = applicable.length;
  const conformanceScore = totalApplicable === 0 ? 1 : passedRules.length / totalApplicable;
  const valid = blockers.length === 0;
  return { valid, conformanceScore, passedRules, warnings, blockers, recommendations, safeToConsume: valid, modelType: typeof a.modelType === 'string' ? a.modelType : null, modelFamily: typeof a.modelFamily === 'string' ? a.modelFamily : null };
}

export default validateGenericModelAdapterConformance;
