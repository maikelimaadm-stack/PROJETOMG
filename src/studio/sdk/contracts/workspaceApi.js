/**
 * Workspace API — central designer mount region contract.
 * @param {object} deps
 */
export function createWorkspaceApi(deps = {}) {
  let activeDesigner = deps.activeDesigner ?? null;
  const listeners = new Set();

  return Object.freeze({
    getActiveDesigner: () => activeDesigner,
    mountDesigner: (designer) => {
      activeDesigner = designer ?? null;
      listeners.forEach((listener) => listener({ type: "mount", designer: activeDesigner }));
      return activeDesigner;
    },
    unmountDesigner: () => {
      const previous = activeDesigner;
      activeDesigner = null;
      listeners.forEach((listener) => listener({ type: "unmount", designer: previous }));
      return previous;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createWorkspaceApi;
