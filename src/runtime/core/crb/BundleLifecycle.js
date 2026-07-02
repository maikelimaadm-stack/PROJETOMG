/** @typedef {'pending'|'verified'|'hydrated'|'ready'|'rolled_back'|'failed'} BundleState */

export const BundleLifecycle = Object.freeze({
  PENDING: /** @type {BundleState} */ ('pending'),
  VERIFIED: /** @type {BundleState} */ ('verified'),
  HYDRATED: /** @type {BundleState} */ ('hydrated'),
  READY: /** @type {BundleState} */ ('ready'),
  ROLLED_BACK: /** @type {BundleState} */ ('rolled_back'),
  FAILED: /** @type {BundleState} */ ('failed'),

  /**
   * Tracks hydrate rollback — registered keys per attempt.
   */
  createRollbackTracker() {
    /** @type {Array<{type: string, key: string}>} */
    const registered = [];
    return {
      /** @param {string} type @param {string} key */
      track(type, key) {
        registered.push({ type, key });
      },
      /** @param {import('../registry/registryManager.js').RegistryManager} registry */
      rollback(registry) {
        for (const { type, key } of [...registered].reverse()) {
          registry.unregister(type, key);
        }
        registered.length = 0;
      },
      clear() {
        registered.length = 0;
      },
      get count() {
        return registered.length;
      },
    };
  },
});
