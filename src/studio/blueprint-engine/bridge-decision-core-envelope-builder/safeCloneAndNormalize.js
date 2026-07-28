import { MAX_STRUCTURE_DEPTH, PROTOTYPE_POLLUTION_KEYS, RESOURCE_LIMITS } from './builderConfig.js';

/**
 * A typed normalization failure. Carries a real issue CODE only — never the offending value, path source, stack or
 * secret. The public build boundary converts it into a sanitized rejection.
 */
export class BuilderNormalizationError extends Error {
  constructor(code) { super(code); this.name = 'BuilderNormalizationError'; this.code = code; }
}

const isPlainObject = (v) => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

/**
 * Deterministically deep-clones + normalizes a value, rejecting (fail-closed) every unsafe construct:
 * cycles, excessive depth, NaN/Infinity, BigInt/Symbol/Function, undefined inside objects, accessors (getters/
 * setters), non-plain objects (Date/Map/Set/RegExp/Error/class instances), sparse arrays and prototype-pollution
 * keys. Negative zero is normalized to +0. No getter is executed on the ORIGINAL beyond descriptor inspection; the
 * clone is built from own enumerable data descriptors only. Throws BuilderNormalizationError on any violation.
 * @param {*} value @param {{maxDepth?:number}} [opts] @returns {*} a safe, structurally cloned value
 */
export function safeCloneAndNormalize(value, opts = {}) {
  const maxDepth = Number.isInteger(opts.maxDepth) ? opts.maxDepth : MAX_STRUCTURE_DEPTH;
  const seen = new WeakSet();

  const clone = (v, depth) => {
    if (depth > maxDepth) throw new BuilderNormalizationError('BUILDER_SOURCE_STRUCTURE_TOO_DEEP');
    // Primitives.
    if (v === null) return null;
    const t = typeof v;
    // maxStringLength is the REAL contract limit, applied recursively at every string (values and keys).
    if (t === 'string') { if (v.length > RESOURCE_LIMITS.maxStringLength) throw new BuilderNormalizationError('BUILDER_LIMIT_EXCEEDED'); return v; }
    if (t === 'boolean') return v;
    if (t === 'number') {
      if (!Number.isFinite(v)) throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
      return Object.is(v, -0) ? 0 : v;
    }
    if (t === 'undefined' || t === 'bigint' || t === 'symbol' || t === 'function') {
      throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
    }
    // Objects/arrays.
    if (t === 'object') {
      if (seen.has(v)) throw new BuilderNormalizationError('BUILDER_SOURCE_STRUCTURE_CYCLE');
      // Reject exotic built-ins / class instances.
      if (v instanceof Date || v instanceof Map || v instanceof Set || v instanceof RegExp
        || v instanceof Error || v instanceof Promise || ArrayBuffer.isView(v) || v instanceof ArrayBuffer) {
        throw new BuilderNormalizationError('BUILDER_SOURCE_NON_PLAIN_OBJECT');
      }
      if (Array.isArray(v)) {
        seen.add(v);
        // DESCRIPTOR-ONLY read path: `v.length` and `v[i]` are never evaluated, so a hostile Proxy-over-array `get`
        // trap is never invoked by the normalizer. Length and every element come from own data descriptors.
        const lenDesc = Object.getOwnPropertyDescriptor(v, 'length');
        if (!lenDesc) throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
        if (typeof lenDesc.get === 'function' || typeof lenDesc.set === 'function') throw new BuilderNormalizationError('BUILDER_SOURCE_ACCESSOR_FORBIDDEN');
        const len = lenDesc.value;
        if (!Number.isSafeInteger(len) || len < 0) throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
        if (len > RESOURCE_LIMITS.maxSourceDecisionFields) throw new BuilderNormalizationError('BUILDER_LIMIT_EXCEEDED');
        const out = [];
        for (let i = 0; i < len; i += 1) {
          const desc = Object.getOwnPropertyDescriptor(v, String(i));
          if (!desc) throw new BuilderNormalizationError('BUILDER_SOURCE_SPARSE_ARRAY');
          if (typeof desc.get === 'function' || typeof desc.set === 'function') throw new BuilderNormalizationError('BUILDER_SOURCE_ACCESSOR_FORBIDDEN');
          out.push(clone(desc.value, depth + 1));
        }
        // No own key beyond the indices and `length` — an array carrying extra properties is not a plain list.
        for (const key of Object.keys(v)) {
          if (PROTOTYPE_POLLUTION_KEYS.includes(key)) throw new BuilderNormalizationError('BUILDER_SOURCE_PROTOTYPE_POLLUTION_KEY');
          const asIndex = Number(key);
          if (!Number.isInteger(asIndex) || asIndex < 0 || asIndex >= len) throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
        }
        seen.delete(v);
        return out;
      }
      if (!isPlainObject(v)) throw new BuilderNormalizationError('BUILDER_SOURCE_NON_PLAIN_OBJECT');
      seen.add(v);
      const out = {};
      for (const key of Object.keys(v)) {
        if (PROTOTYPE_POLLUTION_KEYS.includes(key)) throw new BuilderNormalizationError('BUILDER_SOURCE_PROTOTYPE_POLLUTION_KEY');
        if (key.length > RESOURCE_LIMITS.maxStringLength) throw new BuilderNormalizationError('BUILDER_LIMIT_EXCEEDED');
        const desc = Object.getOwnPropertyDescriptor(v, key);
        if (!desc) continue;
        if (typeof desc.get === 'function' || typeof desc.set === 'function') throw new BuilderNormalizationError('BUILDER_SOURCE_ACCESSOR_FORBIDDEN');
        const child = clone(desc.value, depth + 1);
        if (typeof child === 'undefined') throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
        out[key] = child;
      }
      seen.delete(v);
      return out;
    }
    throw new BuilderNormalizationError('BUILDER_SOURCE_UNSUPPORTED_VALUE');
  };

  return clone(value, 0);
}
export default safeCloneAndNormalize;
