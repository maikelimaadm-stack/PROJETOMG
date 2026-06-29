const properties = new Map();

/**
 * @param {string} propertyId
 * @param {object} definition
 */
export function registerStudioProperty(propertyId, definition) {
  if (!propertyId) throw new Error("registerStudioProperty: propertyId is required.");
  if (!definition?.valueType) throw new Error("registerStudioProperty: valueType is required.");
  properties.set(propertyId, Object.freeze({ propertyId, ...definition }));
}

/** @param {string} propertyId */
export function getStudioProperty(propertyId) {
  return properties.get(propertyId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.group]
 */
export function listStudioProperties(filter = {}) {
  let result = [...properties.values()];
  if (filter.group) result = result.filter((p) => p.group === filter.group);
  return result;
}

export function hasStudioProperty(propertyId) {
  return properties.has(propertyId);
}

export function getStudioPropertyCount() {
  return properties.size;
}

export function clearStudioProperties() {
  properties.clear();
}
