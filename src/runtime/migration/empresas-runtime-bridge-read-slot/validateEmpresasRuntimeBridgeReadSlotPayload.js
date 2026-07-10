import {
  isPlainObject,
} from '../../shadow/pilots/tableFormProjection.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { EmpresasReadSlotError } from './errors.js';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;
const MAX_DEPTH = 10;

/**
 * Recursively scans a value for functions, React elements, prototype-pollution
 * keys, and exposed sensitive values. Returns a list of problems (empty = safe).
 * @param {unknown} value
 * @param {string} path
 * @param {number} depth
 * @param {string[]} out
 */
function scan(value, path, depth, out) {
  if (depth > MAX_DEPTH) {
    out.push(`${path}: exceeds max depth`);
    return;
  }
  if (typeof value === 'function') {
    out.push(`${path}: contains a function`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => scan(v, `${path}[${i}]`, depth + 1, out));
    return;
  }
  if (isPlainObject(value)) {
    // React element heuristic — a plain object carrying `$$typeof` is a React element/portal.
    if ('$$typeof' in value) out.push(`${path}: looks like a React element ($$typeof)`);
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) out.push(`${path}.${key}: forbidden key (prototype pollution)`);
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        const v = /** @type {Record<string, unknown>} */ (value)[key];
        if (typeof v === 'string' && v && v !== '[REDACTED]') out.push(`${path}.${key}: unmasked sensitive value`);
      }
      scan(/** @type {Record<string, unknown>} */ (value)[key], `${path}.${key}`, depth + 1, out);
    }
  }
}

/**
 * Validates a read-only slot PAYLOAD for safety and completeness. It never
 * mounts, executes, or fetches — it only inspects the plain payload. Returns a
 * structured result (`valid`, `errors`, `warnings`, `blockers`, `score`,
 * `safeToProceed`). A raw prototype-pollution attempt in the OPTIONS themselves
 * throws; problems inside the payload are reported, not thrown.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayload} [options.payload]
 * @returns {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayloadValidation}
 */
export function validateEmpresasRuntimeBridgeReadSlotPayload(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasReadSlotError('MAK-L3-EMP-READ-SLOT-003', 'validateEmpresasRuntimeBridgeReadSlotPayload() options must be a plain object');
  }
  const payload = options.payload;

  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const blockers = [];

  if (!isPlainObject(payload)) {
    return { kind: 'empresas-read-slot-payload-validation', valid: false, errors: ['payload is not a plain object'], warnings: [], blockers: ['payload missing'], score: 0, safeToProceed: false };
  }

  const req = (cond, msg, blocking = false) => {
    if (!cond) {
      errors.push(msg);
      if (blocking) blockers.push(msg);
    }
  };

  req(payload.moduleId === 'empresas', 'moduleId must be "empresas"', true);
  req(payload.mode === 'read_only', 'mode must be "read_only"', true);
  req(typeof payload.slotId === 'string' && payload.slotId.length > 0, 'slotId must be present');
  req(isPlainObject(payload.table), 'table must be present', true);
  req(isPlainObject(payload.form), 'form must be present', true);
  req(isPlainObject(payload.diagnostics), 'diagnostics must be present');
  req(isPlainObject(payload.writeGuard), 'writeGuard must be present', true);
  req(payload.writeGuard && payload.writeGuard.writeBlocked === true, 'writeGuard.writeBlocked must be true', true);
  const blockedOps = payload.writeGuard && Array.isArray(payload.writeGuard.blockedOperations) ? payload.writeGuard.blockedOperations : [];
  req(BLOCKED_WRITE_OPERATIONS.every((op) => blockedOps.includes(op)), 'writeGuard.blockedOperations must be complete', true);
  req(payload.safety && payload.safety.noSideEffects === true, 'safety.noSideEffects must be true', true);
  req(payload.safety && payload.safety.usesRealData === false, 'safety.usesRealData must be false', true);

  // Deep safety scan — functions, React elements, pollution keys, unmasked sensitive values.
  /** @type {string[]} */
  const scanProblems = [];
  scan(payload, 'payload', 0, scanProblems);
  for (const p of scanProblems) {
    errors.push(p);
    blockers.push(p);
  }

  const totalChecks = 11;
  const failed = new Set(errors).size;
  const score = Math.max(0, Math.round(((totalChecks - Math.min(failed, totalChecks)) / totalChecks) * 100));
  const valid = errors.length === 0;
  const safeToProceed = valid && blockers.length === 0;

  return {
    kind: 'empresas-read-slot-payload-validation',
    valid,
    errors,
    warnings,
    blockers,
    score,
    safeToProceed,
  };
}
