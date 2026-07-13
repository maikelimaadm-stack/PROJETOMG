import { createStudioContractDigest } from '../createStudioContractDigest.js';

/**
 * Deterministic certification digest built on the foundation digest helper. Blocks
 * function/circular inputs and sanitizes secret-like keys before hashing. Pure; never
 * mutates the input.
 *
 * @param {Object} [options]
 * @param {unknown} [options.value]
 * @returns {{ ok: boolean, digest: string|null, blocked: boolean, sanitized: boolean, reason: string }}
 */
export function createStudioBlueprintCertificationDigest(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const input = o.value;
  if (typeof input === 'function') return { ok: false, digest: null, blocked: true, sanitized: false, reason: 'function input blocked' };

  const seen = new WeakSet();
  let circular = false;
  let sanitized = false;
  const SECRET = /(jwt|token|password|secret|DATABASE[_]URL|api[_-]?key)/i;
  const sanitize = (v) => {
    if (circular) return v;
    if (Array.isArray(v)) return v.map(sanitize);
    if (v && typeof v === 'object') {
      if (seen.has(v)) { circular = true; return null; }
      seen.add(v);
      const out = {};
      for (const k of Object.keys(v).sort()) {
        if (SECRET.test(k)) { sanitized = true; out[k] = '[redacted]'; continue; }
        out[k] = sanitize(v[k]);
      }
      return out;
    }
    return v;
  };
  const normalized = sanitize(input);
  if (circular) return { ok: false, digest: null, blocked: true, sanitized, reason: 'circular input blocked' };
  return { ok: true, digest: createStudioContractDigest({ value: normalized }), blocked: false, sanitized, reason: sanitized ? 'sanitized secret-like keys' : 'ok' };
}

/** Convenience: the raw digest string (or null when blocked). */
export function certificationDigest(value) {
  return createStudioBlueprintCertificationDigest({ value }).digest;
}

export default createStudioBlueprintCertificationDigest;
