import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelUnsafeMarkers, detectGenericModelForbiddenTargetKeys } from '../safety/detectGenericModelUnsafeMarkers.js';
import { GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS } from '../contracts/genericModelContractConstants.js';

const ALLOWED = new Set(GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS);
const FORBIDDEN_TARGET = new Set(['backend', 'prisma', 'runtimebridge', 'runtime-bridge', 'api', 'fetch', 'storage', 'localstorage', 'database', 'db']);

/**
 * Validates a Generic Model WRITE PAYLOAD. Fail-closed: unknown operation, unsafe
 * payload (function/handler/React/pollution), forbidden backend/Prisma/
 * runtimeBridge target, or a non-local write mode all reject it. Pure.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {unknown} [options.payload]
 * @param {boolean} [options.requireLocalOnly] Default true.
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToApply: boolean }}
 */
export function validateGenericModelWritePayload(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const operation = o.operation;
  const payload = o.payload;
  const requireLocalOnly = o.requireLocalOnly !== false;

  if (typeof o.moduleId !== 'string' || o.moduleId.length === 0) errors.push('moduleId is required');
  if (typeof operation !== 'string' || !ALLOWED.has(operation)) blockers.push(`operation "${String(operation)}" is not an allowed local operation`);

  const requiresPayload = operation === 'create' || operation === 'update';
  if (requiresPayload && !isGenericModelPlainObject(payload)) errors.push(`operation "${operation}" requires a plain-object payload`);
  if (payload !== undefined && payload !== null && !isGenericModelPlainObject(payload)) errors.push('payload must be a plain object when present');

  if (isGenericModelPlainObject(payload)) {
    const report = detectGenericModelUnsafeMarkers(payload);
    if (report.unsafeMarkers.length > 0) blockers.push(...report.unsafeMarkers.map((m) => `unsafe:${m}`));
    if (report.sensitiveKeys.length > 0) blockers.push(...report.sensitiveKeys.map((k) => `unmasked-sensitive:${k}`));
    if (report.forbiddenTargets.length > 0) blockers.push(...report.forbiddenTargets.map((t) => `forbidden:${t}`));
    const targetKeys = detectGenericModelForbiddenTargetKeys(payload);
    if (targetKeys.length > 0) blockers.push(...targetKeys.map((t) => `forbidden-target:${t}`));
    const target = typeof payload.target === 'string' ? payload.target.toLowerCase() : null;
    if (target && FORBIDDEN_TARGET.has(target)) blockers.push(`payload target "${target}" is not local`);
    if (requireLocalOnly && payload.writeMode && payload.writeMode !== 'localOnly') blockers.push(`writeMode "${payload.writeMode}" must be localOnly`);
  }

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 5);
  return { valid, errors, warnings, blockers, score, safeToApply: valid };
}

export default validateGenericModelWritePayload;
