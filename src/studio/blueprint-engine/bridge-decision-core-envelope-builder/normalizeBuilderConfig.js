import {
  DEFAULT_BUILDER_CONFIG, BUILDER_CONFIG_ALLOWED_KEYS, FORBIDDEN_CONFIG_OVERRIDE_KEYS, MAX_STRUCTURE_DEPTH,
} from './builderConfig.js';
import { safeCloneAndNormalize, BuilderNormalizationError } from './safeCloneAndNormalize.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Normalize + freeze the builder config FAIL-CLOSED. NEVER throws — every read of the RAW config (including
 * Object.keys, descriptor inspection and property access) happens inside a single try/catch boundary, so a hostile
 * Proxy whose ownKeys / getPrototypeOf / getOwnPropertyDescriptor traps throw is contained and converted into a
 * deterministic sanitized failure. Returns `{ ok, config? , code? }`.
 *
 * ACCEPTED: omitted / null / `{}`, and `maxStructureDepth` as an integer in 1..MAX_STRUCTURE_DEPTH.
 * REJECTED (never silently defaulted over): any unknown key, any forbidden critical override, a non-integer /
 * zero / negative / over-limit depth, accessors, hostile proxies, cycles, custom prototypes, pollution keys and
 * arrays. There is NO `strict` option — the builder is always strict, so accepting one would be fiction.
 * A default is applied ONLY when the property is absent.
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
      if (!BUILDER_CONFIG_ALLOWED_KEYS.includes(k)) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };
    }

    let maxStructureDepth = DEFAULT_BUILDER_CONFIG.maxStructureDepth;
    if (Object.prototype.hasOwnProperty.call(cloned, 'maxStructureDepth')) {
      const d = cloned.maxStructureDepth;
      // An invalid value is a REJECTION, never a fallback to the default.
      if (!Number.isInteger(d) || d < 1 || d > MAX_STRUCTURE_DEPTH) return { ok: false, code: 'BUILDER_CONFIG_INVALID' };
      maxStructureDepth = d;
    }
    return { ok: true, config: deepFreeze({ maxStructureDepth }) };
  } catch (e) {
    return { ok: false, code: e instanceof BuilderNormalizationError ? e.code : 'BUILDER_CONFIG_INVALID' };
  }
}
export default normalizeBuilderConfig;
