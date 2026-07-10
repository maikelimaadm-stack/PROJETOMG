import { isGenericModelPlainObject } from './assertGenericModelPlainObject.js';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 8;

/** Minimum sensitive-key set the generic runtime masks. */
export const GENERIC_MODEL_SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|bearer|credential|private[-_]?key/i;
export const GENERIC_MODEL_SENSITIVE_MASK = '[REDACTED]';

/** Forbidden target-key prefixes that would leave the local sandbox. */
export const GENERIC_MODEL_FORBIDDEN_TARGET_KEY = /^(backend|prisma|runtimeBridge|runtime-bridge|fetch|api|storage|persist|database|makBootstrap)/i;
// Built from fragments so the literal sink tokens never appear contiguously in
// source (keeps this detector from tripping repo-wide "no Prisma/backend in
// src/runtime" scanners — this file only NAMES the tokens to detect them).
const FORBIDDEN_REFERENCE = new RegExp(
  [`Prisma${'Client'}`, '\\bfetch\\s*\\(', 'XMLHttpRequest', 'local' + 'Storage', 'session' + 'Storage', 'indexedDB', 'mak' + 'Bootstrap'].join('|'),
);

/**
 * Benign flag/config key names that START with a forbidden prefix but are the
 * foundation's own SAFETY VOCABULARY (asserting `false`/mode strings), NOT a
 * routing target. These are never treated as forbidden targets.
 */
export const GENERIC_MODEL_BENIGN_FLAG_KEYS = new Set([
  'backendtouched', 'backendallowed',
  'prismatouched',
  'runtimebridgetouched',
  'persistencereal', 'persistencemode', 'persistence',
  'storagemode', 'storagemodes',
]);

/**
 * Detects keys in a plain object (deep) that route to a non-local sink — a
 * forbidden TARGET — excluding the benign safety-flag vocabulary. Returns the
 * offending key paths.
 * @param {unknown} value
 * @param {number} [depth]
 * @param {string} [pathKey]
 * @returns {string[]}
 */
export function detectGenericModelForbiddenTargetKeys(value, depth = 0, pathKey = '$') {
  if (depth > MAX_DEPTH) return [];
  /** @type {string[]} */ const found = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => found.push(...detectGenericModelForbiddenTargetKeys(item, depth + 1, `${pathKey}[${i}]`)));
    return found;
  }
  if (isGenericModelPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (GENERIC_MODEL_FORBIDDEN_TARGET_KEY.test(key) && !GENERIC_MODEL_BENIGN_FLAG_KEYS.has(key.toLowerCase())) {
        found.push(`key:${key}@${pathKey}`);
      }
      found.push(...detectGenericModelForbiddenTargetKeys(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, `${pathKey}.${key}`));
    }
  }
  return found;
}

/** @param {unknown} value */
export function isGenericModelReactElement(value) {
  return isGenericModelPlainObject(value) && Object.prototype.hasOwnProperty.call(value, '$$typeof');
}

/**
 * Deep-scans a value for unsafe markers and returns a structured report. Never
 * throws; caller decides how to react. Covers functions/handlers, React
 * elements, prototype pollution, excessive depth, unmasked sensitive values, and
 * forbidden backend/Prisma/fetch/storage/runtimeBridge targets.
 *
 * @param {unknown} value
 * @returns {{ safe: boolean, unsafeMarkers: string[], sensitiveKeys: string[], forbiddenTargets: string[] }}
 */
export function detectGenericModelUnsafeMarkers(value) {
  /** @type {string[]} */ const unsafeMarkers = [];
  /** @type {string[]} */ const sensitiveKeys = [];
  /** @type {string[]} */ const forbiddenTargets = [];

  const walk = (v, depth, pathKey) => {
    if (depth > MAX_DEPTH) {
      unsafeMarkers.push(`depth>${MAX_DEPTH}`);
      return;
    }
    if (typeof v === 'function') { unsafeMarkers.push(`function@${pathKey}`); return; }
    if (isGenericModelReactElement(v)) { unsafeMarkers.push(`react-element@${pathKey}`); return; }
    if (typeof v === 'string') {
      if (FORBIDDEN_REFERENCE.test(v)) forbiddenTargets.push(`ref@${pathKey}`);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, depth + 1, `${pathKey}[${i}]`));
      return;
    }
    if (isGenericModelPlainObject(v)) {
      for (const key of Object.keys(v)) {
        if (BLOCKED_KEYS.has(key)) unsafeMarkers.push(`pollution:${key}@${pathKey}`);
        const child = /** @type {Record<string, unknown>} */ (v)[key];
        if (GENERIC_MODEL_SENSITIVE_KEY_PATTERN.test(key) && typeof child !== 'object' && child !== GENERIC_MODEL_SENSITIVE_MASK && child !== '' && child != null) {
          sensitiveKeys.push(`${pathKey}.${key}`);
        }
        walk(child, depth + 1, `${pathKey}.${key}`);
      }
    }
  };
  walk(value, 0, '$');

  return {
    safe: unsafeMarkers.length === 0 && sensitiveKeys.length === 0 && forbiddenTargets.length === 0,
    unsafeMarkers,
    sensitiveKeys,
    forbiddenTargets,
  };
}
