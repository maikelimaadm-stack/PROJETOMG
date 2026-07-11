import {
  isGenericModelPlainObject,
  sanitizeGenericModelPayload,
  detectGenericModelUnsafeMarkers,
} from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelDomainSchema } from './createModeloBase2FuelDomainSchema.js';
import { MODELOBASE2_MODEL_ID, FUEL_COMMAND_TYPES } from './modeloBase2FuelHeadlessConfig.js';

/** Fuel commands whose payload carries a fuel entry (validated against the domain schema). */
const ENTRY_COMMANDS = new Set(['appendFuelEntry', 'updateFuelEntry']);
const FORBIDDEN_TARGETS = ['backend', 'prisma', 'runtimebridge', 'runtime-bridge', 'fetch', 'api', 'storage', 'database', 'db'];

/**
 * Validates a FUEL command PAYLOAD. Fail-closed: unknown command, unsafe payload
 * (function/handler/React/pollution), forbidden target, or a domain-rule violation
 * (date/machine/quantityLiters/hourmeter) all reject it. Returns the sanitized
 * payload + normalized fuel entry. Pure.
 *
 * @param {Object} [options]
 * @param {string} [options.commandType]
 * @param {unknown} [options.payload]
 * @param {string} [options.moduleId]
 * @param {Object} [options.schema] Injectable domain schema.
 * @returns {{ valid: boolean, safeToApply: boolean, errors: string[], warnings: string[], blockers: string[], sanitizedPayload: unknown, normalizedFuelEntry: Object|null, diagnostics: Object }}
 */
export function validateModeloBase2FuelPayload(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const commandType = o.commandType;
  const payload = o.payload;
  const schema = isGenericModelPlainObject(o.schema) ? o.schema : createModeloBase2FuelDomainSchema();

  if (typeof commandType !== 'string' || !FUEL_COMMAND_TYPES.includes(commandType)) errors.push(`fuel command "${String(commandType)}" is not known`);
  if (payload !== undefined && payload !== null && !isGenericModelPlainObject(payload)) errors.push('payload must be a plain object when present');

  const sanitizedResult = sanitizeGenericModelPayload({ payload: payload ?? null, label: `${commandType} payload` });
  if (isGenericModelPlainObject(payload)) {
    const markers = detectGenericModelUnsafeMarkers(payload);
    if (markers.unsafeMarkers.length > 0) blockers.push(...markers.unsafeMarkers.map((m) => `unsafe:${m}`));
    if (markers.forbiddenTargets.length > 0) blockers.push(...markers.forbiddenTargets.map((t) => `forbidden:${t}`));
    const target = typeof payload.target === 'string' ? payload.target.toLowerCase() : null;
    if (target && FORBIDDEN_TARGETS.includes(target)) blockers.push(`payload target "${target}" is not local`);
    if (payload.writeMode && payload.writeMode !== 'localOnly') blockers.push(`writeMode "${payload.writeMode}" must be localOnly`);
    if (payload.persistenceReal === true) blockers.push('payload.persistenceReal must be false');
    if (payload.sent === true) blockers.push('payload.sent must be false');
  }

  // Domain validation for entry-carrying commands.
  let normalizedFuelEntry = null;
  if (typeof commandType === 'string' && ENTRY_COMMANDS.has(commandType)) {
    const rawEntry = isGenericModelPlainObject(payload) && isGenericModelPlainObject(payload.entry)
      ? payload.entry
      : (isGenericModelPlainObject(payload) && isGenericModelPlainObject(payload.values) ? payload.values : payload);
    const domain = schema.validateEntry(rawEntry);
    if (!domain.valid) errors.push(...domain.errors.map((e) => `fuel:${e}`));
    warnings.push(...domain.warnings);
    if (domain.valid) normalizedFuelEntry = schema.normalizeEntry(rawEntry);
  }

  const valid = errors.length === 0 && blockers.length === 0;
  return {
    valid,
    safeToApply: valid,
    errors,
    warnings,
    blockers,
    sanitizedPayload: sanitizedResult.sanitized ?? null,
    normalizedFuelEntry,
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

export default validateModeloBase2FuelPayload;
