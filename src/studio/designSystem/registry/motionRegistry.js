const motions = new Map();

/**
 * @param {string} motionId
 * @param {object} definition — contract only; no CSS implementation
 */
export function registerDesignMotion(motionId, definition) {
  if (!motionId) throw new Error("registerDesignMotion: motionId is required.");
  if (!definition?.category) throw new Error("registerDesignMotion: category is required.");
  motions.set(
    motionId,
    Object.freeze({
      motionId,
      durationMs: definition.durationMs ?? 200,
      easing: definition.easing ?? "ease-in-out",
      ...definition,
    })
  );
}

/** @param {string} motionId */
export function getDesignMotion(motionId) {
  return motions.get(motionId) ?? null;
}

export function listDesignMotions(filter = {}) {
  let result = [...motions.values()];
  if (filter.category) result = result.filter((m) => m.category === filter.category);
  return result;
}

export function getDesignMotionCount() {
  return motions.size;
}

export function clearDesignMotions() {
  motions.clear();
}
