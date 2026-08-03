import { deepFreeze } from './deepFreeze.js';
import { normalizeIssues } from './normalizeIssues.js';
/**
 * Deterministic, sanitized diagnostics from a builder decision. In-memory only; no logging; never exposes the raw
 * source, target or a secret. Reflects only status/flags and the sanitized issue codes.
 */
export function createBuilderDiagnostics(decision) {
  const d = (decision && typeof decision === 'object') ? decision : {};
  const issues = normalizeIssues(d.issues);
  return deepFreeze({
    kind: 'builder-diagnostics',
    ok: d.ok === true,
    status: typeof d.status === 'string' ? d.status : 'unknown',
    coreEnvelopeCreated: d.coreEnvelopeCreated === true,
    identityVerified: d.identityVerified === true,
    envelopeIdentityVerified: (d.coreEnvelope && typeof d.coreEnvelope === 'object') ? d.coreEnvelope.identityVerified === true : false,
    rollbackByNonEmission: d.rollbackByNonEmission === true,
    sourceMutated: d.sourceMutated === true,
    sideEffects: d.sideEffects === true,
    issueCount: issues.length,
    issueCodes: deepFreeze(issues.map((i) => i.issueCode)),
  });
}
export default createBuilderDiagnostics;
