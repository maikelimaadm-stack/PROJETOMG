const components = new Map();

/**
 * @param {string} componentId
 * @param {object} definition
 */
export function registerStudioComponent(componentId, definition) {
  if (!componentId) throw new Error("registerStudioComponent: componentId is required.");
  if (!definition?.category) throw new Error("registerStudioComponent: category is required.");
  components.set(componentId, Object.freeze({ componentId, ...definition }));
}

/** @param {string} componentId */
export function getStudioComponent(componentId) {
  return components.get(componentId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.category]
 * @param {string} [filter.baseTemplateId]
 */
export function listStudioComponents(filter = {}) {
  let result = [...components.values()];
  if (filter.category) result = result.filter((c) => c.category === filter.category);
  if (filter.baseTemplateId) {
    result = result.filter(
      (c) =>
        !c.compatibility?.baseTemplates?.length ||
        c.compatibility.baseTemplates.includes(filter.baseTemplateId)
    );
  }
  return result;
}

export function hasStudioComponent(componentId) {
  return components.has(componentId);
}

export function getStudioComponentCount() {
  return components.size;
}

export function clearStudioComponents() {
  components.clear();
}
