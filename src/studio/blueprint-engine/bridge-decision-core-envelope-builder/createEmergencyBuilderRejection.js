import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import { STATUS_REJECTED } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** The single fixed issue the public boundary is allowed to synthesize. Built literally so this path CANNOT throw. */
const EMERGENCY_ISSUE = deepFreeze({
  issueCode: 'BUILDER_UNEXPECTED_EXECUTION_FAILURE',
  severity: 'blocker',
  stage: 'public_boundary',
  path: '',
  message: 'builder rejected: BUILDER_UNEXPECTED_EXECUTION_FAILURE',
  deterministic: true,
  blocksBuilder: true,
  blocksEnvelope: true,
  blocksRuntime: true,
  blocksPreviewSandbox: true,
});

/**
 * Sanitized emergency rejection for ANY unexpected failure at the public boundary — a malicious Proxy trap, a
 * strict issue-construction failure, anything. It is fully self-contained: it does not normalize, validate or
 * re-enter any strict helper, so it can never throw and the builder never propagates an exception to the caller.
 *
 * Carries only BUILDER_UNEXPECTED_EXECUTION_FAILURE at stage `public_boundary`, severity `blocker` — never the raw
 * error, its message, cause, stack, the source decision, the config or any internal path.
 */
export function createEmergencyBuilderRejection() {
  const issues = deepFreeze([EMERGENCY_ISSUE]);
  const builderDecisionDigest = createDeterministicDigest({
    ok: false, status: STATUS_REJECTED, envelopeDigest: null, coreEnvelopeCreated: false, identityVerified: false,
    issueCodes: [`${EMERGENCY_ISSUE.issueCode}::${EMERGENCY_ISSUE.stage}::${EMERGENCY_ISSUE.path}`],
  });
  return deepFreeze({
    ok: false,
    status: STATUS_REJECTED,
    sourceAccepted: false,
    coreExtracted: false,
    identityVerified: false,
    coreEnvelopeCreated: false,
    coreEnvelope: null,
    issues,
    sourceMutated: false,
    sideEffects: false,
    rollbackByNonEmission: true,
    builderDecisionDigest,
  });
}
export default createEmergencyBuilderRejection;
