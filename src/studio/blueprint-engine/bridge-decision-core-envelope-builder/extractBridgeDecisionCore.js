import { DIGEST_FIELD } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * exact_allowlist_pick: builds `bridgeDecisionCore` from EXACTLY the allowlist fields present on the (already
 * safe-normalized) source. No aliases, defaults, coercion or semantic transformation. The digest field is never
 * copied. Values are already safe clones from normalization; the result is deep-frozen (independent output).
 * @returns {{core:Object, missing:string[]}}
 */
export function extractBridgeDecisionCore(source, allowlist) {
  const core = {};
  const missing = [];
  for (const f of allowlist) {
    if (f === DIGEST_FIELD) continue; // never inside the core
    if (!Object.prototype.hasOwnProperty.call(source, f)) { missing.push(f); continue; }
    core[f] = source[f];
  }
  return { core: deepFreeze(core), missing };
}
export default extractBridgeDecisionCore;
