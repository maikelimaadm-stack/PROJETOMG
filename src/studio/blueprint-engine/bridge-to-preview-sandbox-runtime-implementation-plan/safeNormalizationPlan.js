import { deepFreeze } from './deepFreeze.js';

/**
 * SAFE INPUT NORMALIZATION PLAN — reuses the hardened bridge's structural-safety principles for the future
 * runtime, BEFORE any envelope validation. Declaration only; nothing is normalized here.
 */
export const MAX_ENVELOPE_STRUCTURE_DEPTH = 64; // reflects the merged bridge/contract MAX depth cap.

export const SAFE_NORMALIZATION_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-safe-normalization-plan',
  principles: deepFreeze([
    'cycle guard (WeakSet)',
    'deterministic depth cap',
    'plain JSON-safe values only',
    'sparse array rejection',
    'accessor (getter/setter) rejection',
    'prototype pollution protection (drop __proto__/constructor/prototype)',
    'public try/catch boundary',
    'sanitized emergency rejection',
  ]),
  maxStructureDepth: MAX_ENVELOPE_STRUCTURE_DEPTH,
  issueCodes: deepFreeze([
    'RUNTIME_INPUT_CYCLE', 'RUNTIME_INPUT_TOO_DEEP', 'RUNTIME_INPUT_NON_JSON_SAFE', 'RUNTIME_INPUT_SPARSE_ARRAY',
    'RUNTIME_INPUT_ACCESSOR', 'RUNTIME_INPUT_PROTOTYPE_POLLUTION', 'RUNTIME_INPUT_NON_PLAIN_OBJECT',
  ]),
  forbiddenPrototypeKeys: deepFreeze(['__proto__', 'constructor', 'prototype']),
  normalizationImplemented: false,
  failClosed: true,
});

export default SAFE_NORMALIZATION_PLAN;
