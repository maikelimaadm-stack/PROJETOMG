import { deepFreeze } from './deepFreeze.js';
/** @param {Object} [o] @returns {Object} */
export function createEnvelopeDiagnostics(o = {}) {
  const v = o && typeof o === 'object' && o.verification && typeof o.verification === 'object' ? o.verification : {};
  return deepFreeze({
    kind: 'envelope-diagnostics', ok: v.ok === true, blockerCount: Array.isArray(v.blockers) ? v.blockers.length : 0,
    contractOnly: true, runtimeImplemented: false, notes: 'Envelope identity contract definition only; no runtime executed.',
  });
}
export default createEnvelopeDiagnostics;
