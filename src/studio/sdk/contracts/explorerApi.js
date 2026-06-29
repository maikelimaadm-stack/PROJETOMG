/**
 * Explorer API — registry tree navigation contract.
 * @param {object} deps
 * @param {() => Promise<object[]>} [deps.fetchEntries]
 */
export function createExplorerApi(deps = {}) {
  let entries = [];
  let filter = { entryType: null, status: null };
  const listeners = new Set();

  const load = async (query = {}) => {
    filter = { ...filter, ...query };
    entries = deps.fetchEntries ? await deps.fetchEntries(filter) : [];
    listeners.forEach((listener) => listener({ type: "load", entries, filter }));
    return entries;
  };

  return Object.freeze({
    load,
    getEntries: () => entries,
    getFilter: () => Object.freeze({ ...filter }),
    setFilter: (next) => {
      filter = { ...filter, ...next };
      return filter;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createExplorerApi;
