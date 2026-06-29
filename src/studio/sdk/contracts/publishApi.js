/**
 * Publish API — validate → publish → pin contract.
 * @param {object} deps
 */
export function createPublishApi(deps = {}) {
  let lastPublish = null;

  return Object.freeze({
    validate: deps.validate ?? (async () => ({ valid: true, errors: [] })),
    publish: async (payload = {}) => {
      if (!deps.publish) throw new Error("Publish API requires publish dependency.");
      const validation = await (deps.validate ?? (async () => ({ valid: true, errors: [] })))(payload);
      if (!validation.valid) {
        throw new Error(validation.errors?.join(" ") || "Publish validation failed.");
      }
      lastPublish = await deps.publish(payload);
      return lastPublish;
    },
    pinEnvironment: deps.pinEnvironment ?? (async () => null),
    rollback: deps.rollback ?? (async () => null),
    getLastPublish: () => lastPublish,
  });
}

export default createPublishApi;
