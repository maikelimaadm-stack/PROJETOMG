/** Official Workspace Session contract — Program 2.1B */

export const STUDIO_WORKSPACE_SESSION_VERSION = "mak-studio-workspace-session-v1";

/**
 * @typedef {object} WorkspaceEditorSlot
 * @property {string} editorId
 * @property {string} designerId
 * @property {string} moduleId
 * @property {boolean} dirty
 */

/**
 * @typedef {object} WorkspaceSession
 * @property {string} sessionId
 * @property {string} moduleId
 * @property {string} designerId
 * @property {string|null} activeEditorId
 * @property {WorkspaceEditorSlot[]} editors
 * @property {import("./selectionModel.js").StudioSelection} selection
 * @property {boolean} dirty
 * @property {{ left: string, right: string, bottom: string }} tabs
 * @property {{ status: string, compileId?: string|null }} preview
 * @property {{ canUndo: boolean, canRedo: boolean }} history
 */

export function createWorkspaceSession(partial = {}) {
  return Object.freeze({
    sessionId: partial.sessionId ?? `ws-${partial.moduleId ?? "default"}`,
    moduleId: partial.moduleId ?? "empresas",
    designerId: partial.designerId ?? "layout",
    activeEditorId: partial.activeEditorId ?? null,
    editors: Object.freeze(partial.editors ?? []),
    selection: partial.selection ?? createEmptySelectionRef(),
    dirty: Boolean(partial.dirty),
    tabs: Object.freeze(partial.tabs ?? { left: "explorer", right: "inspector", bottom: "preview" }),
    preview: Object.freeze(partial.preview ?? { status: "idle", compileId: null }),
    history: Object.freeze(partial.history ?? { canUndo: false, canRedo: false }),
  });
}

function createEmptySelectionRef() {
  return {
    selectionKind: null,
    targetId: null,
    entryId: null,
    entryType: null,
    moduleId: null,
    designerId: null,
    metadata: {},
  };
}

export function validateWorkspaceSession(session) {
  const errors = [];
  if (!session?.sessionId) errors.push("sessionId is required.");
  if (!session?.moduleId) errors.push("moduleId is required.");
  if (!session?.designerId) errors.push("designerId is required.");
  return { valid: errors.length === 0, errors };
}

export default createWorkspaceSession;
