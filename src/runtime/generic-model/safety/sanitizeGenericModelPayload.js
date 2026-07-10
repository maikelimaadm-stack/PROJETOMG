import { isGenericModelPlainObject, safeCloneGenericModel } from './assertGenericModelPlainObject.js';
import {
  detectGenericModelUnsafeMarkers,
  GENERIC_MODEL_SENSITIVE_KEY_PATTERN,
  GENERIC_MODEL_SENSITIVE_MASK,
} from './detectGenericModelUnsafeMarkers.js';

/** Recursively masks sensitive values in a plain structure (operates on a copy). */
function maskSensitive(value) {
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (isGenericModelPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = GENERIC_MODEL_SENSITIVE_KEY_PATTERN.test(k) && typeof v !== 'object' ? GENERIC_MODEL_SENSITIVE_MASK : maskSensitive(v);
    }
    return out;
  }
  return value;
}

/**
 * Sanitizes a generic model payload for safe use/storage. Produces a masked,
 * function-free safe copy plus a full safety report. It DROPS functions/React
 * elements (via JSON clone), masks sensitive values, and flags prototype
 * pollution / forbidden targets. Pure; never mutates the input.
 *
 * @param {Object} [options]
 * @param {unknown} [options.payload]
 * @param {string} [options.label]
 * @returns {{ safe: boolean, sanitized: unknown, errors: string[], warnings: string[], blockers: string[], maskedKeys: string[], unsafeMarkers: string[], score: number }}
 */
export function sanitizeGenericModelPayload(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const payload = o.payload;

  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const report = detectGenericModelUnsafeMarkers(payload);
  if (report.unsafeMarkers.length > 0) blockers.push(...report.unsafeMarkers.map((m) => `unsafe:${m}`));
  if (report.forbiddenTargets.length > 0) blockers.push(...report.forbiddenTargets.map((t) => `forbidden:${t}`));
  if (report.sensitiveKeys.length > 0) warnings.push(...report.sensitiveKeys.map((k) => `sensitive:${k}`));

  // Build a safe, masked copy (functions/React already dropped by the clone).
  const cloned = safeCloneGenericModel(payload);
  const sanitized = cloned === null ? null : maskSensitive(cloned);
  if (cloned === null && payload !== null && payload !== undefined) {
    errors.push('payload is not serializable');
  }

  // Pollution keys survive JSON.parse as own keys — strip them from the copy.
  const stripPollution = (v) => {
    if (Array.isArray(v)) return v.map(stripPollution);
    if (isGenericModelPlainObject(v)) {
      /** @type {Record<string, unknown>} */
      const out = {};
      for (const [k, val] of Object.entries(v)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        out[k] = stripPollution(val);
      }
      return out;
    }
    return v;
  };
  const finalSanitized = sanitized === null ? null : stripPollution(sanitized);

  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 6);
  return {
    safe: errors.length === 0 && blockers.length === 0,
    sanitized: finalSanitized,
    errors,
    warnings,
    blockers,
    maskedKeys: report.sensitiveKeys,
    unsafeMarkers: [...report.unsafeMarkers, ...report.forbiddenTargets],
    score,
  };
}
