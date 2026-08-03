import { normalizeBuilderConfig } from './normalizeBuilderConfig.js';
import { executeBuilderValidationPipeline } from './executeBuilderValidationPipeline.js';
import { createBuilderDecision } from './createBuilderDecision.js';
import { createBuilderRejection } from './createBuilderRejection.js';
import { createEmergencyBuilderRejection } from './createEmergencyBuilderRejection.js';
import { makeIssue } from './normalizeIssues.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Creates a headless, deterministic, side-effect-free builder: `{ build(bridgeDecision) }`. The build DELEGATES to
 * `executeBuilderValidationPipeline`, which actually executes all 23 canonical stages one by one — including the
 * boundary stages 17-23 — and is STAGE-ATOMIC: the first stage that produces a blocker stops the walk, so no later
 * stage runs, no later-stage issue is reported and no envelope escapes. On success the builder decision records
 * identityVerified=true OUTSIDE the (still-false) envelope (ARCHITECTURE 1). Any unexpected exception at the
 * boundary becomes a sanitized emergency rejection. Synchronous; no Promise/I/O/clock/random/global state. Each
 * instance is isolated.
 * @param {Object} [config] @returns {{build:(bridgeDecision:*)=>Object}}
 */
export function createBridgeDecisionCoreEnvelopeBuilder(config) {
  // The factory NEVER throws: config normalization is fully contained (hostile Proxy traps included).
  let cfg;
  try { cfg = normalizeBuilderConfig(config); } catch { cfg = { ok: false, code: 'BUILDER_CONFIG_INVALID' }; }
  const configOk = cfg.ok === true;
  const configCode = cfg.code;
  const builderConfig = cfg.config || null;

  function build(bridgeDecision) {
    try {
      if (!configOk) return createBuilderRejection([makeIssue(configCode || 'BUILDER_CONFIG_INVALID', 'config_normalization')]);
      const run = executeBuilderValidationPipeline(bridgeDecision, builderConfig);
      if (!run.ok) return createBuilderRejection(run.issues);
      return createBuilderDecision(run.envelope);
    } catch {
      return createEmergencyBuilderRejection();
    }
  }

  return deepFreeze({ build });
}
export default createBridgeDecisionCoreEnvelopeBuilder;
