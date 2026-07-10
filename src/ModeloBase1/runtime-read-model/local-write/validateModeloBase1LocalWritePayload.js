import { isPlainObject, findUnsafeContent, hasUnmaskedSensitive, hasForbiddenReference } from '../safety.js';
import { LOCAL_WRITE_MUTATION_OPERATIONS } from './createModeloBase1LocalWriteContract.js';

/** Mutation verbs the controller accepts. */
const KNOWN_OPERATIONS = new Set(LOCAL_WRITE_MUTATION_OPERATIONS);

/** Keys/targets (lowercased) that would route a write outside the in-memory sandbox. */
const FORBIDDEN_TARGETS = new Set(['backend', 'prisma', 'runtimebridge', 'runtime-bridge', 'api', 'fetch', 'storage', 'localstorage', 'database', 'db']);

/**
 * Validates a LOCAL WRITE PAYLOAD before the controller applies it. Fail-closed:
 * an unknown operation, an unsafe payload, or any attempt to target a backend/
 * Prisma/runtimeBridge/storage sink is rejected. Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {unknown} [options.payload]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToApply: boolean }}
 */
export function validateModeloBase1LocalWritePayload(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isPlainObject(options) ? options : {};
  const moduleId = o.moduleId;
  const operation = o.operation;
  const payload = o.payload;

  if (typeof moduleId !== 'string' || moduleId.length === 0) {
    errors.push('moduleId is required');
  }
  if (typeof operation !== 'string' || !KNOWN_OPERATIONS.has(operation)) {
    blockers.push(`operation "${String(operation)}" is not an allowed local mutation`);
  }

  // submitDraft/saveDraft may carry no payload; row ops require a plain object.
  const requiresPayload = operation === 'createRow' || operation === 'updateRow';
  if (requiresPayload && !isPlainObject(payload)) {
    errors.push(`operation "${operation}" requires a plain-object payload`);
  }
  if (payload !== undefined && payload !== null && !isPlainObject(payload)) {
    errors.push('payload must be a plain object when present');
  }

  if (isPlainObject(payload)) {
    const unsafe = findUnsafeContent(payload);
    if (unsafe) blockers.push(unsafe); // function/handler/React element/pollution/depth
    if (hasUnmaskedSensitive(payload)) blockers.push('payload has unmasked sensitive values');
    if (hasForbiddenReference(payload)) blockers.push('payload references backend/fetch/Prisma/storage');
    // Explicit routing target that would leave the sandbox.
    const target = typeof payload.target === 'string' ? payload.target.toLowerCase() : null;
    if (target && FORBIDDEN_TARGETS.has(target)) blockers.push(`payload target "${target}" is not local`);
    if (payload.writeMode && payload.writeMode !== 'localOnly') blockers.push(`payload writeMode "${payload.writeMode}" must be localOnly`);
    for (const key of Object.keys(payload)) {
      if (/^(backend|prisma|runtimeBridge|fetch|api|storage|persist)/i.test(key)) {
        blockers.push(`payload key "${key}" targets a non-local sink`);
      }
    }
  }

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 5);
  return { valid, errors, warnings, blockers, score, safeToApply: valid };
}

export default validateModeloBase1LocalWritePayload;
