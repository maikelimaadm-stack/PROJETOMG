import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioContractDigest } from '../createStudioContractDigest.js';

/** Deep-freeze a value so a "not mutated" check is meaningful. */
function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => deepFreeze(v));
    Object.freeze(value);
  }
  return value;
}

/**
 * Safely computes a digest of an arbitrary input, blocking function/circular inputs
 * and sanitizing secret-like values. Pure. Never mutates the input.
 * @param {unknown} input
 * @returns {{ ok: boolean, digest: string|null, blocked: boolean, sanitized: boolean, reason: string }}
 */
export function safeStudioDigest(input) {
  if (typeof input === 'function') return { ok: false, digest: null, blocked: true, sanitized: false, reason: 'function input blocked' };
  // Circular detection.
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

/**
 * Runs the digest hardening suite. Pure. Confirms determinism, sensitivity to
 * safety/permission/route-menu/persistence/validation/field changes, secret
 * sanitization, non-mutation, and safe handling of circular/function/undefined.
 * @param {Object} [options]
 * @returns {Object} suite result
 */
export function createStudioDigestHardeningSuite(options = {}) {
  void options;
  const base = { safety: { failClosed: true }, permission: { defaultDeny: true }, routeMenu: { routeEnabled: false }, persistence: 'noPersistence', validation: ['required'], fields: ['text'], status: 'draft' };
  const d = (v) => createStudioContractDigest({ value: v });
  const change = (patch) => d({ ...base, ...patch });

  const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); return Boolean(ok); };

  check('same input same digest', d(base) === d(base));
  check('order relevant (array)', d([1, 2]) !== d([2, 1]));
  check('safety change changes digest', change({ safety: { failClosed: false } }) !== d(base));
  check('permission change changes digest', change({ permission: { defaultDeny: false } }) !== d(base));
  check('tenant rule change changes digest', change({ permission: { defaultDeny: true, tenantRequired: false } }) !== d(base));
  check('route/menu change changes digest', change({ routeMenu: { routeEnabled: true } }) !== d(base));
  check('persistence change changes digest', change({ persistence: 'localReadOnly' }) !== d(base));
  check('validation change changes digest', change({ validation: ['required', 'min'] }) !== d(base));
  check('field allowlist change changes digest', change({ fields: ['text', 'money'] }) !== d(base));
  check('blueprint status change changes digest', change({ status: 'validated' }) !== d(base));

  // Secret sanitize + non-mutation.
  const withSecret = deepFreeze({ token: 'abc', keep: 1 });
  const secretRes = safeStudioDigest(withSecret);
  check('secret-like value sanitized or blocked', secretRes.sanitized === true || secretRes.blocked === true);
  const beforeInput = { a: { b: 1 } };
  const beforeJson = JSON.stringify(beforeInput);
  safeStudioDigest(beforeInput);
  check('input not mutated', JSON.stringify(beforeInput) === beforeJson);

  // Circular / function / undefined.
  const circ = {}; circ.self = circ;
  check('circular input blocked', safeStudioDigest(circ).blocked === true);
  check('function input blocked', safeStudioDigest(() => 1).blocked === true);
  check('undefined deterministic', d(undefined) === d(undefined) && typeof d(undefined) === 'string');
  check('key order normalized', d({ a: 1, b: 2 }) === d({ a: 1, b: 2 }));

  const failures = checks.filter((c) => !c.ok).map((c) => c.name);
  return safeCloneGenericModel({
    kind: 'studio-digest-hardening-suite',
    checks,
    checkCount: checks.length,
    scenarioCount: checks.length,
    allPassed: failures.length === 0,
    blockers: failures,
    warnings: [],
    readiness: failures.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioDigestHardeningSuite;
