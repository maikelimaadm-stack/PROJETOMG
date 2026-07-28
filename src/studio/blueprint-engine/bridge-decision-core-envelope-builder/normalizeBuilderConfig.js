import { DEFAULT_BUILDER_CONFIG, FORBIDDEN_CONFIG_OVERRIDE_KEYS, MAX_STRUCTURE_DEPTH } from './builderConfig.js';
import { safeCloneAndNormalize, BuilderNormalizationError } from './safeCloneAndNormalize.js';
import { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Normalize + freeze the builder config fail-closed. Rejects a non-plain config, any forbidden critical override,
 * prototype pollution and any unsafe structure. Returns { ok, config?, code? }. Never throws.
 */
export function normalizeBuilderConfig(config) {
  if (typeof config === 'undefined' || config === null) return { ok: true, config: DEFAULT_BUILDER_CONFIG };
  if (typeof config !== 'object' || Array.isArray(config)) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };
  for (const k of Object.keys(config)) {
    if (FORBIDDEN_CONFIG_OVERRIDE_KEYS.includes(k)) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };
  }
  if (hasPrototypePollutionKey(config)) return { ok: false, code: 'BUILDER_SOURCE_PROTOTYPE_POLLUTION_KEY' };
  let cloned;
  try { cloned = safeCloneAndNormalize(config, { maxDepth: MAX_STRUCTURE_DEPTH }); }
  catch (e) { return { ok: false, code: e instanceof BuilderNormalizationError ? e.code : 'BUILDER_CONFIG_INVALID' }; }
  const strict = cloned.strict === false ? false : true;
  const maxStructureDepth = Number.isInteger(cloned.maxStructureDepth) && cloned.maxStructureDepth > 0 && cloned.maxStructureDepth <= MAX_STRUCTURE_DEPTH
    ? cloned.maxStructureDepth : MAX_STRUCTURE_DEPTH;
  return { ok: true, config: deepFreeze({ strict, maxStructureDepth }) };
}
export default normalizeBuilderConfig;
