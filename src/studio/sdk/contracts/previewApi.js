/**
 * Preview API — draft CRB compile + hydration contract.
 * @param {object} deps
 * @param {(params: object) => Promise<object>} [deps.compileDraft]
 * @param {(crb: object) => object} [deps.hydratePlan]
 */
export function createPreviewApi(deps = {}) {
  let lastPreview = null;
  const listeners = new Set();

  return Object.freeze({
    refresh: async (params = {}) => {
      if (!deps.compileDraft) {
        throw new Error("Preview API requires compileDraft dependency.");
      }
      const crb = await deps.compileDraft(params);
      const plan = deps.hydratePlan ? deps.hydratePlan(crb) : null;
      lastPreview = Object.freeze({ crb, plan, refreshedAt: new Date().toISOString() });
      listeners.forEach((listener) => listener({ type: "refresh", preview: lastPreview }));
      return lastPreview;
    },
    getLastPreview: () => lastPreview,
    clear: () => {
      lastPreview = null;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createPreviewApi;
