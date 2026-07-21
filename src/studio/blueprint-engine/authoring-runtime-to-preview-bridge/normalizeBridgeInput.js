import { MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';

/**
 * Deterministic, side-effect-free input normalization for the bridge. Deep-clones plain data (dropping
 * functions/symbols/undefined and the dangerous prototype-pollution keys `__proto__`/`constructor`/
 * `prototype`), preserves array order, and returns a fresh graph so the caller's input is never mutated and
 * no external reference is retained. Bounded and stack-safe: it carries a WeakSet of active ancestors (so a
 * cyclic reference is dropped to `null` instead of recursing forever) and a deterministic depth cap (so an
 * adversarially deep structure is cut off to `null` at the bound instead of overflowing the stack). It never
 * throws and never invokes getters/setters. @param {unknown} value @returns {unknown}
 */
export function normalizeBridgeInput(value) {
  return clone(value, 0, new WeakSet());
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** @param {unknown} v @param {number} depth @param {WeakSet<object>} ancestors @returns {unknown} */
function clone(v, depth, ancestors) {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === 'number') return Number.isFinite(v) ? v : null;
  if (t === 'boolean' || t === 'string') return v;
  if (t === 'function' || t === 'symbol' || t === 'bigint') return null;
  if (t !== 'object') return null;
  // Depth cap + cycle guard: bounded, stack-safe, never infinite.
  if (depth >= MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH) return null;
  if (ancestors.has(v)) return null;
  ancestors.add(v);
  let out;
  if (Array.isArray(v)) {
    out = [];
    for (let i = 0; i < v.length; i += 1) {
      // Read-only own-index access; holes clone to null (structural validator rejects sparse arrays upstream).
      out.push(Object.prototype.hasOwnProperty.call(v, i) ? clone(v[i], depth + 1, ancestors) : null);
    }
  } else {
    // Only plain-object / null-prototype graphs reach a successful bridge decision (enforced by the
    // structural validator). Build a fresh literal and assign own data keys, skipping accessors and the
    // dangerous prototype-pollution keys so `({}).polluted` can never be created.
    out = {};
    const descriptors = Object.getOwnPropertyDescriptors(v);
    for (const k of Object.keys(descriptors)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      const d = descriptors[k];
      if (typeof d.get === 'function' || typeof d.set === 'function') continue; // never invoke accessors
      const vt = typeof d.value;
      if (vt === 'function' || vt === 'symbol' || vt === 'undefined') continue;
      out[k] = clone(d.value, depth + 1, ancestors);
    }
  }
  ancestors.delete(v);
  return out;
}

/**
 * Structurally validates a source value BEFORE any pipeline processing and returns a bounded safe clone.
 * Fail-closed on cycles, excessive depth, non-JSON-safe value types (undefined/function/symbol/bigint),
 * non-finite numbers, negative zero, non-plain objects (Date/RegExp/Map/Set/typed arrays/class instances/
 * Error/Promise/exotic prototypes), sparse arrays and accessor properties. Never invokes getters/setters,
 * never mutates the input, never throws, and produces no prototype pollution. Returns
 * `{ ok, value, issues }`; on any blocker `value` is `null`. @param {unknown} value @param {Object} [options]
 * @returns {{ ok: boolean, value: unknown, issues: Object[] }}
 */
export function safeNormalizeSourceStructure(value, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const maxDepth = Number.isInteger(o.maxDepth) && o.maxDepth >= 0 ? o.maxDepth : MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH;
  const issues = [];
  const add = (issueCode, path, message) => {
    issues.push(createBridgeIssue({ issueCode, severity: 'blocker', stage: 'source_shape_validation', path: path || 'source', message }));
  };

  const visit = (v, path, depth, ancestors) => {
    if (depth > maxDepth) { add('BRIDGE_SOURCE_STRUCTURE_TOO_DEEP', path, `Source structure exceeds the maximum depth of ${maxDepth}.`); return; }
    if (v === null) return;
    const t = typeof v;
    if (t === 'boolean' || t === 'string') return;
    if (t === 'number') {
      if (!Number.isFinite(v)) { add('BRIDGE_SOURCE_NON_FINITE_NUMBER', path, 'Non-finite number (NaN/Infinity) is forbidden.'); return; }
      if (Object.is(v, -0)) { add('BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN', path, 'Negative zero is forbidden.'); }
      return;
    }
    if (t === 'undefined' || t === 'function' || t === 'symbol' || t === 'bigint') {
      add('BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE', path, `Unsupported value type "${t}".`);
      return;
    }
    if (t !== 'object') { add('BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE', path, `Unsupported value type "${t}".`); return; }
    if (ancestors.has(v)) { add('BRIDGE_SOURCE_STRUCTURE_CYCLE', path, 'Cyclic reference is forbidden.'); return; }
    ancestors.add(v);
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i += 1) {
        if (!Object.prototype.hasOwnProperty.call(v, i)) { add('BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN', `${path}[${i}]`, 'Sparse array (hole) is forbidden.'); continue; }
        visit(v[i], `${path}[${i}]`, depth + 1, ancestors);
      }
    } else {
      const proto = Object.getPrototypeOf(v);
      if (proto !== Object.prototype && proto !== null) {
        add('BRIDGE_SOURCE_NON_PLAIN_OBJECT', path, 'Only plain objects (Object.prototype or null prototype) are allowed.');
      } else {
        const descriptors = Object.getOwnPropertyDescriptors(v);
        for (const k of Object.keys(descriptors)) {
          const d = descriptors[k];
          if (typeof d.get === 'function' || typeof d.set === 'function') {
            add('BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN', `${path}.${k}`, 'Accessor (getter/setter) property is forbidden.');
            continue; // never invoke the accessor
          }
          if (DANGEROUS_KEYS.has(k)) continue; // dropped from the clone; not a blocker on its own
          visit(d.value, `${path}.${k}`, depth + 1, ancestors);
        }
      }
    }
    ancestors.delete(v);
  };

  visit(value, 'source', 0, new WeakSet());
  const ok = issues.length === 0;
  return { ok, value: ok ? clone(value, 0, new WeakSet()) : null, issues };
}

/** @param {unknown} v @returns {boolean} */
export function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** @param {unknown} v @returns {boolean} */
export function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

/** @param {unknown} v @returns {boolean} */
export function isNonNegativeInteger(v) {
  return Number.isInteger(v) && v >= 0;
}

export default normalizeBridgeInput;
