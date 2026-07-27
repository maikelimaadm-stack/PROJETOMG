import { deepFreeze } from './deepFreeze.js';
/** Safe normalization plan for the future builder. No upstream code is copied; principles are declared. */
export const SAFE_NORMALIZATION_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-safe-normalization',
  guards: deepFreeze([
    'cycle detection (WeakSet-style, planned)', 'max structure depth cap', 'JSON-safe values only',
    'finite numbers only', 'negative-zero normalization', 'dense arrays only (no sparse)',
    'reject accessors/getters/proxies', 'reject non-plain objects', 'reject prototype-pollution keys',
    'public try/catch boundary', 'sanitized emergency rejection',
  ]),
  reusesBridgeHardeningPrinciplesNoCodeCopy: true,
  silentTruncationAllowed: false, partialOutputAllowed: false, failClosed: true,
  normalizationImplemented: false,
});
export default SAFE_NORMALIZATION_PLAN;
