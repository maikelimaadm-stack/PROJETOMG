import {
  isGenericModelPlainObject,
  sanitizeGenericModelPayload,
  detectGenericModelUnsafeMarkers,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_COMMAND_TYPES,
} from './modeloBase2OperationalRuntimeConfig.js';

/** Commands that require a plain-object payload. */
const PAYLOAD_REQUIRED = new Set(['appendEntry', 'updateEntry', 'restoreSnapshot']);

/**
 * Validates an operational command PAYLOAD. Fail-closed: unknown command type,
 * unsafe payload (function/handler/React/pollution), forbidden backend/Prisma/
 * runtimeBridge/fetch/storage target, or a non-local writeMode all reject it.
 * Returns the sanitized payload (functions dropped, sensitive masked). Pure.
 *
 * @param {Object} [options]
 * @param {string} [options.commandType]
 * @param {unknown} [options.payload]
 * @param {string} [options.moduleId]
 * @param {string} [options.modelId]
 * @returns {{ valid: boolean, safeToApply: boolean, errors: string[], warnings: string[], blockers: string[], sanitizedPayload: unknown, diagnostics: Object }}
 */
export function validateModeloBase2OperationalCommandPayload(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const commandType = o.commandType;
  const payload = o.payload;

  if (typeof commandType !== 'string' || !MODELOBASE2_COMMAND_TYPES.includes(commandType)) errors.push(`command "${String(commandType)}" is not a known operational command`);
  if (o.modelId && o.modelId !== MODELOBASE2_MODEL_ID) warnings.push(`modelId "${o.modelId}" differs from ${MODELOBASE2_MODEL_ID}`);
  if (typeof o.moduleId !== 'string' || o.moduleId.length === 0) warnings.push('moduleId missing');

  if (PAYLOAD_REQUIRED.has(commandType) && !isGenericModelPlainObject(payload)) errors.push(`command "${commandType}" requires a plain-object payload`);
  if (payload !== undefined && payload !== null && !isGenericModelPlainObject(payload)) errors.push('payload must be a plain object when present');

  const sanitizedResult = sanitizeGenericModelPayload({ payload: payload ?? null, label: `${commandType} payload` });
  if (isGenericModelPlainObject(payload)) {
    const markers = detectGenericModelUnsafeMarkers(payload);
    if (markers.unsafeMarkers.length > 0) blockers.push(...markers.unsafeMarkers.map((m) => `unsafe:${m}`));
    if (markers.forbiddenTargets.length > 0) blockers.push(...markers.forbiddenTargets.map((t) => `forbidden:${t}`));
    const target = typeof payload.target === 'string' ? payload.target.toLowerCase() : null;
    if (target && ['backend', 'prisma', 'runtimebridge', 'runtime-bridge', 'fetch', 'api', 'storage', 'database', 'db'].includes(target)) blockers.push(`payload target "${target}" is not local`);
    if (payload.writeMode && payload.writeMode !== 'localOnly') blockers.push(`writeMode "${payload.writeMode}" must be localOnly`);
    if (payload.persistenceReal === true) blockers.push('payload.persistenceReal must be false');
    if (payload.sent === true) blockers.push('payload.sent must be false');
  }

  const valid = errors.length === 0 && blockers.length === 0;
  return {
    valid,
    safeToApply: valid,
    errors,
    warnings,
    blockers,
    sanitizedPayload: sanitizedResult.sanitized ?? null,
    diagnostics: {
      localOnly: true,
      sent: false,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      masked: (sanitizedResult.maskedKeys ?? []).length > 0,
    },
  };
}

export default validateModeloBase2OperationalCommandPayload;
