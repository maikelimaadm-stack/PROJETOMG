const capabilitiesByDesigner = new Map();

/**
 * @param {string} designerId
 * @param {string[]} capabilityIds
 * @param {object} [meta]
 */
export function registerStudioCapabilities(designerId, capabilityIds, meta = {}) {
  if (!designerId) throw new Error("registerStudioCapabilities: designerId is required.");
  if (!Array.isArray(capabilityIds) || capabilityIds.length < 1) {
    throw new Error("registerStudioCapabilities: capabilityIds must be a non-empty array.");
  }
  capabilitiesByDesigner.set(
    designerId,
    Object.freeze({
      designerId,
      capabilityIds: Object.freeze([...capabilityIds]),
      ...meta,
    })
  );
}

/** @param {string} designerId */
export function getStudioCapabilities(designerId) {
  return capabilitiesByDesigner.get(designerId) ?? null;
}

/** @param {string} designerId @param {string} capabilityId */
export function designerHasCapability(designerId, capabilityId) {
  const record = capabilitiesByDesigner.get(designerId);
  return record?.capabilityIds?.includes(capabilityId) ?? false;
}

export function listStudioDesignerCapabilities() {
  return [...capabilitiesByDesigner.values()];
}

export function clearStudioCapabilities() {
  capabilitiesByDesigner.clear();
}
