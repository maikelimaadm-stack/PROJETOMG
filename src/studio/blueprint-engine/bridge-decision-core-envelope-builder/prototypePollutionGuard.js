import { PROTOTYPE_POLLUTION_KEYS } from './builderConfig.js';
/** Returns true if any own key at any depth is a prototype-pollution key. Pure; iterative; bounded by clone depth. */
export function hasPrototypePollutionKey(value, maxDepth = 64) {
  const stack = [[value, 0]];
  while (stack.length) {
    const [v, d] = stack.pop();
    if (d > maxDepth || v === null || typeof v !== 'object') continue;
    for (const k of Object.keys(v)) {
      if (PROTOTYPE_POLLUTION_KEYS.includes(k)) return true;
      const child = v[k];
      if (child !== null && typeof child === 'object') stack.push([child, d + 1]);
    }
  }
  return false;
}
export default hasPrototypePollutionKey;
