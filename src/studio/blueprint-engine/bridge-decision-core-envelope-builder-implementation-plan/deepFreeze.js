/** Recursive deep freeze (pure; returns the same reference frozen). Dev-only, deterministic, no I/O. */
export function deepFreeze(value) {
  if (value !== null && (typeof value === 'object' || typeof value === 'function') && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      const child = value[key];
      if (child !== null && (typeof child === 'object' || typeof child === 'function')) deepFreeze(child);
    }
  }
  return value;
}
export default deepFreeze;
