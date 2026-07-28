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
        const out = [];
        for (let i = 0; i < v.length; i += 1) {
          if (!Object.prototype.hasOwnProperty.call(v, i)) throw new BuilderNormalizationError('BUILDER_SOURCE_SPARSE_ARRAY');
          const desc = Object.getOwnPropertyDescriptor(v, i);
          if (desc && (typeof desc.get === 'function' || typeof desc.set === 'function')) throw new BuilderNormalizationError('BUILDER_SOURCE_ACCESSOR_FORBIDDEN');
          out.push(clone(v[i], depth + 1));
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
