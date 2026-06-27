/** @typedef {"table"|"cards"|"filtersConfig"|"view"|"formLayout"} MakPreferenceSection */

const SECTIONS = /** @type {const} */ ([
  "table",
  "cards",
  "filtersConfig",
  "view",
  "formLayout",
]);

const createEmptyScopeState = () => ({
  data: null,
  revision: 0,
  updatedAt: null,
  localUpdatedAt: null,
  dirtySections: /** @type {Set<MakPreferenceSection>} */ (new Set()),
  pendingWrites: /** @type {Set<MakPreferenceSection>} */ (new Set()),
  lastRemoteRevision: 0,
  hydrationSource: /** @type {"local"|"remote"|"defaults"} */ ("defaults"),
  syncStatus: /** @type {"idle"|"saving"|"saved"|"offline"|"error"} */ ("idle"),
});

/** @type {Map<string, { scopeKey: string, state: ReturnType<typeof createEmptyScopeState> }>} */
const scopeStates = new Map();

const buildScopeKey = () => {
  if (typeof window === "undefined") return "";
  const scope = window.__mgActivePrefScopeKey;
  return typeof scope === "string" ? scope : "";
};

/**
 * Estado de escopo/dirty por módulo — espelha empresasPreferencesScopeState.
 */
export function createMakModulePreferencesScopeState(moduleId) {
  const id = String(moduleId || "cadastro").trim();

  const ensureScope = () => {
    const nextKey = buildScopeKey();
    if (!scopeStates.has(id)) {
      scopeStates.set(id, { scopeKey: nextKey, state: createEmptyScopeState() });
    }
    const entry = scopeStates.get(id);
    if (entry.scopeKey !== nextKey) {
      entry.scopeKey = nextKey;
      entry.state = createEmptyScopeState();
    }
    return entry.state;
  };

  return {
    moduleId: id,
    resetScopeState: () => {
      scopeStates.delete(id);
    },
    bindScopeState: ({ clienteId, userId } = {}) => {
      const scopeKey = `${clienteId || ""}:${userId || ""}`;
      scopeStates.set(id, { scopeKey, state: createEmptyScopeState() });
      if (typeof window !== "undefined") {
        window.__mgActivePrefScopeKey = scopeKey;
      }
    },
    getScopeState: () => ensureScope(),
    setHydrationSource: (source) => {
      const state = ensureScope();
      if (source === "local" || source === "remote" || source === "defaults") {
        state.hydrationSource = source;
      }
    },
    setSyncStatus: (status) => {
      const state = ensureScope();
      if (["idle", "saving", "saved", "offline", "error"].includes(status)) {
        state.syncStatus = status;
      }
    },
    markSectionDirty: (section) => {
      const normalized = String(section || "").trim();
      if (!SECTIONS.includes(normalized)) return;
      ensureScope().dirtySections.add(normalized);
      ensureScope().pendingWrites.add(normalized);
      ensureScope().syncStatus = "saving";
    },
    clearSectionDirty: (section) => {
      const normalized = String(section || "").trim();
      if (!SECTIONS.includes(normalized)) return;
      ensureScope().dirtySections.delete(normalized);
      ensureScope().pendingWrites.delete(normalized);
    },
    isSectionDirty: (section) => {
      const normalized = String(section || "").trim();
      if (!SECTIONS.includes(normalized)) return false;
      return ensureScope().dirtySections.has(normalized);
    },
    canApplyRemoteSection: (section) => {
      const normalized = String(section || "").trim();
      if (!SECTIONS.includes(normalized)) return true;
      return !ensureScope().dirtySections.has(normalized);
    },
    setRemoteRevision: (revision, updatedAt = null) => {
      const state = ensureScope();
      state.lastRemoteRevision = Number(revision) || 0;
      state.updatedAt = updatedAt;
    },
    trackWriteReason: (reason = "") => {
      const normalized = String(reason || "").toLowerCase();
      if (!normalized || normalized.includes("hydrate") || normalized.includes("bootstrap")) return;
      if (normalized.includes("table") || normalized.includes("page-size") || normalized.includes("load-batch")) {
        ensureScope().dirtySections.add("table");
      } else if (normalized.includes("cards")) {
        ensureScope().dirtySections.add("cards");
      } else if (
        normalized.includes("filter") ||
        normalized.includes("dropdown") ||
        normalized.includes("favorites")
      ) {
        ensureScope().dirtySections.add("filtersConfig");
      } else if (normalized.includes("view-mode") || normalized.includes("panel-style")) {
        ensureScope().dirtySections.add("view");
      } else if (normalized.includes("form-layout")) {
        ensureScope().dirtySections.add("formLayout");
      }
    },
  };
}

export default createMakModulePreferencesScopeState;
