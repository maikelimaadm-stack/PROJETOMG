import { BUILDER_MAX_STRUCTURE_DEPTH, FORBIDDEN_PROTOTYPE_KEYS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Safe structural normalization requirements (reused from bridge hardening principles). Declaration only. */
export const SAFE_NORMALIZATION_CONTRACT = deepFreeze({
  kind: 'builder-safe-normalization-contract',
  requirements: deepFreeze([
    'cycle guard', 'depth cap', 'plain JSON-safe values', 'finite numbers only', 'negative zero policy',
    'dense arrays only', 'accessor rejection', 'getter non-execution', 'proxy exception containment',
    'non-plain object rejection', 'prototype pollution protection', 'dangerous key rejection',
    'public try/catch boundary', 'sanitized emergency rejection',
  ]),
  maxStructureDepth: BUILDER_MAX_STRUCTURE_DEPTH,
  forbiddenPrototypeKeys: [...FORBIDDEN_PROTOTYPE_KEYS],
  reusesBridgeHardeningPrinciplesNoCodeCopy: true,
  normalizationImplemented: false, failClosed: true,
});
export default SAFE_NORMALIZATION_CONTRACT;
