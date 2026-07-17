import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Passive, deterministic diagnostics for a session (no secrets, no envs, no real data, no network,
 * no storage). Pure. @param {Object} [options] @returns {Object}
 */
export function createAuthoringRuntimeDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const session = isPlainObject(o.session) ? o.session : {};
  const verification = isPlainObject(o.verification) ? o.verification : {};
  const drafts = Array.isArray(session.drafts) ? session.drafts : [];
  const validationSummary = drafts.map((d) => ({
    draftId: d && d.draftId, lifecycleState: d && d.lifecycleState, revision: d && d.revision,
    validationRan: !!(d && d.validation && d.validation.ran), blockerCount: (d && d.validation && d.validation.blockerCount) || 0,
  }));
  const core = {
    kind: 'authoring-runtime-diagnostics',
    passive: true,
    deterministic: true,
    sessionStatus: typeof session.status === 'string' ? session.status : 'unknown',
    draftCount: drafts.length,
    operationCount: Number.isFinite(Number(session.operationCount)) ? Number(session.operationCount) : 0,
    revisionCountTotal: Number.isFinite(Number(session.revisionCountTotal)) ? Number(session.revisionCountTotal) : 0,
    limits: isPlainObject(session.limits) ? session.limits : null,
    validationSummary,
    blockerCount: validationSummary.reduce((a, s) => a + (s.blockerCount || 0), 0),
    warnings: [],
    readiness: 'studio_module_blueprint_authoring_runtime_ready',
    verificationOk: verification.ok === true,
    secretsExposed: false,
    envsExposed: false,
    realDataExposed: false,
    networkUsed: false,
    storageUsed: false,
  };
  return Object.freeze({ ...core, diagnosticsDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeDiagnostics;
