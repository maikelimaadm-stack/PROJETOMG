import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import { STATUS_REJECTED } from './builderConfig.js';
import { normalizeIssues } from './normalizeIssues.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Deterministic, sanitized rejection. No envelope is emitted (rollbackByNonEmission=true). Issues are normalized
 * (sanitized codes/stages only). identityVerified=false. Deep-frozen; digest deterministic over the sanitized issue
 * codes. Never leaks a raw value, path, stack or secret.
 */
export function createBuilderRejection(issues) {
  const normalized = normalizeIssues(issues);
  const base = {
    ok: false,
    status: STATUS_REJECTED,
    sourceAccepted: false,
    coreExtracted: false,
    identityVerified: false,
    coreEnvelopeCreated: false,
    coreEnvelope: null,
    issues: normalized,
    sourceMutated: false,
    sideEffects: false,
    rollbackByNonEmission: true,
  };
  const builderDecisionDigest = createDeterministicDigest({
    ok: false, status: STATUS_REJECTED, envelopeDigest: null, coreEnvelopeCreated: false, identityVerified: false,
    issueCodes: normalized.map((i) => `${i.code}::${i.stage}`),
  });
  return deepFreeze({ ...base, builderDecisionDigest });
}
export default createBuilderRejection;
