import { DEFAULT_BUILDER_CONFIG, FORBIDDEN_CONFIG_OVERRIDE_KEYS, MAX_STRUCTURE_DEPTH } from './builderConfig.js';
import { safeCloneAndNormalize, BuilderNormalizationError } from './safeCloneAndNormalize.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Normalize + freeze the builder config fail-closed. NEVER throws — every read of the RAW config (including
 * Object.keys, descriptor inspection and property access) happens inside a single try/catch boundary, so a hostile
 * Proxy whose ownKeys / getPrototypeOf / getOwnPropertyDescriptor traps throw is contained and converted into a
 * deterministic sanitized failure. Rejects forbidden critical overrides, prototype pollution (via the safe clone) and
 * any unsafe structure. Returns { ok, config?, code? }.
 */
export function normalizeBuilderConfig(config) {
  try {
    if (typeof config === 'undefined' || config === null) return { ok: true, config: DEFAULT_BUILDER_CONFIG };
    if (typeof config !== 'object' || Array.isArray(config)) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };

    // The FIRST touch of the raw object is the safe clone, which itself rejects accessors, cycles, non-plain
    // objects, custom prototypes, sparse arrays and pollution keys. Hostile traps throw inside this boundary.
    const cloned = safeCloneAndNormalize(config, { maxDepth: MAX_STRUCTURE_DEPTH });

    // From here on we only ever read the SAFE clone, never the raw config.
    for (const k of Object.keys(cloned)) {
      if (FORBIDDEN_CONFIG_OVERRIDE_KEYS.includes(k)) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };
    }
    const strict = cloned.strict === false ? false : true;
    const maxStructureDepth = Number.isInteger(cloned.maxStructureDepth) && cloned.maxStructureDepth > 0 && cloned.maxStructureDepth <= MAX_STRUCTURE_DEPTH
      ? cloned.maxStructureDepth : MAX_STRUCTURE_DEPTH;
    return { ok: true, config: deepFreeze({ strict, maxStructureDepth }) };
  } catch (e) {
    return { ok: false, code: e instanceof BuilderNormalizationError ? e.code : 'BUILDER_CONFIG_INVALID' };
  }
}
export default normalizeBuilderConfig;
