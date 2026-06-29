/**
 * Inspector API — read-only contextual metadata contract.
 */
export function createInspectorApi(deps = {}) {
  let context = null;

  return Object.freeze({
    setContext: (next) => {
      context = next ? Object.freeze({ ...next }) : null;
      return context;
    },
    getContext: () => context,
    resolveSchema: deps.resolveSchema ?? (async () => null),
    resolveAudit: deps.resolveAudit ?? (async () => null),
    resolveDependencies: deps.resolveDependencies ?? (async () => ({ nodes: [], edges: [] })),
  });
}

export default createInspectorApi;
