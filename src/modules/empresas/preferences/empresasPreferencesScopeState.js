/** @typedef {"table"|"cards"|"filtersConfig"|"view"|"formLayout"} PreferenceSection */

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
  dirtySections: /** @type {Set<PreferenceSection>} */ (new Set()),
  pendingWrites: /** @type {Set<PreferenceSection>} */ (new Set()),
  lastRemoteRevision: 0,
  hydrationSource: /** @type {"local"|"remote"|"defaults"} */ ("defaults"),
  syncStatus: /** @type {"idle"|"saving"|"saved"|"offline"|"error"} */ ("idle"),
});

let activeScopeState = createEmptyScopeState();
let activeScopeKey = "";

const buildScopeKey = () => {
  if (typeof window === "undefined") return "";
  const scope = window.__mgActivePrefScopeKey;
  return typeof scope === "string" ? scope : "";
};

const ensureScope = () => {
  const nextKey = buildScopeKey();
  if (nextKey !== activeScopeKey) {
    activeScopeKey = nextKey;
    activeScopeState = createEmptyScopeState();
  }
  return activeScopeState;
};

export const resetEmpPreferencesScopeState = () => {
  activeScopeKey = "";
  activeScopeState = createEmptyScopeState();
};

export const bindEmpPreferencesScopeState = ({ clienteId, userId } = {}) => {
  activeScopeKey = `${clienteId || ""}:${userId || ""}`;
  activeScopeState = createEmptyScopeState();
  if (typeof window !== "undefined") {
    window.__mgActivePrefScopeKey = activeScopeKey;
  }
};

export const getEmpPreferencesScopeState = () => ensureScope();

export const setEmpPreferencesHydrationSource = (source) => {
  const state = ensureScope();
  if (source === "local" || source === "remote" || source === "defaults") {
    state.hydrationSource = source;
  }
};

export const setEmpPreferencesSyncStatus = (status) => {
  const state = ensureScope();
  if (["idle", "saving", "saved", "offline", "error"].includes(status)) {
    state.syncStatus = status;
  }
};

export const markEmpPreferencesSectionDirty = (section) => {
  const normalized = String(section || "").trim();
  if (!SECTIONS.includes(normalized)) return;
  ensureScope().dirtySections.add(normalized);
  ensureScope().pendingWrites.add(normalized);
  setEmpPreferencesSyncStatus("saving");
};

export const clearEmpPreferencesSectionDirty = (section) => {
  const normalized = String(section || "").trim();
  if (!SECTIONS.includes(normalized)) return;
  const state = ensureScope();
  state.dirtySections.delete(normalized);
  state.pendingWrites.delete(normalized);
  if (state.dirtySections.size === 0 && state.syncStatus === "saving") {
    state.syncStatus = "saved";
  }
};

export const isEmpPreferencesSectionDirty = (section) => {
  const normalized = String(section || "").trim();
  return ensureScope().dirtySections.has(normalized);
};

export const hasAnyEmpPreferencesDirtySection = () => ensureScope().dirtySections.size > 0;

export const setEmpPreferencesRemoteRevision = (revision, updatedAt = null) => {
  const state = ensureScope();
  const nextRevision = Number(revision);
  if (Number.isFinite(nextRevision) && nextRevision >= 0) {
    state.lastRemoteRevision = Math.floor(nextRevision);
  }
  if (updatedAt) state.updatedAt = updatedAt;
};

export const canApplyRemotePreferenceSection = (section, { force = false } = {}) => {
  const normalized = String(section || "").trim();
  if (!SECTIONS.includes(normalized)) return false;
  if (force) return true;
  return !isEmpPreferencesSectionDirty(normalized);
};

export const inferPreferenceSectionFromReason = (reason = "") => {
  const normalized = String(reason || "").toLowerCase();
  if (
    normalized.includes("hydrate") ||
    normalized.includes("bootstrap") ||
    normalized.includes("remote-tab") ||
    normalized.includes("remote-sync") ||
    normalized.includes("migration")
  ) {
    return null;
  }
  if (
    normalized.includes("table") ||
    normalized.includes("column") ||
    normalized.includes("width") ||
    normalized.includes("frozen") ||
    normalized.includes("sort") ||
    normalized.includes("batch") ||
    normalized.includes("page-size") ||
    normalized.includes("sizing")
  ) {
    return "table";
  }
  if (normalized.includes("cards")) return "cards";
  if (
    normalized.includes("filter") ||
    normalized.includes("dropdown") ||
    normalized.includes("favorites") ||
    normalized.includes("operator")
  ) {
    return "filtersConfig";
  }
  if (normalized.includes("view-mode") || normalized.includes("panel-style")) return "view";
  if (normalized.includes("form-layout")) return "formLayout";
  return null;
};

export const trackEmpPreferencesWriteReason = (reason = "") => {
  const section = inferPreferenceSectionFromReason(reason);
  if (section) markEmpPreferencesSectionDirty(section);
};
