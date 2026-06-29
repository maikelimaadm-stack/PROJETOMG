import { STUDIO_SDK_VERSION } from "./studioSdkConstants.js";
import { createWorkspaceApi } from "./contracts/workspaceApi.js";
import { createDockApi } from "./contracts/dockApi.js";
import { createExplorerApi } from "./contracts/explorerApi.js";
import { createInspectorApi } from "./contracts/inspectorApi.js";
import { createHistoryApi } from "./contracts/historyApi.js";
import { createPreviewApi } from "./contracts/previewApi.js";
import { createPublishApi } from "./contracts/publishApi.js";
import { createCommandApi } from "./contracts/commandApi.js";
import { createSelectionApi } from "./contracts/selectionApi.js";
import { createClipboardApi } from "./contracts/clipboardApi.js";
import { createDragDropApi } from "./contracts/dragDropApi.js";
import { createPluginApi } from "./contracts/pluginApi.js";

/**
 * Creates the MAK Studio SDK — sole reusable foundation for all designers.
 * @param {object} [options]
 * @param {object} [options.deps] — MDP client hooks wired by Shell (Phase 2.1)
 */
export function createStudioSdk(options = {}) {
  const { deps = {}, session = {} } = options;

  const selection = createSelectionApi(session.selection);
  const history = createHistoryApi(session.history);
  const clipboard = createClipboardApi();
  const dragDrop = createDragDropApi();
  const workspace = createWorkspaceApi(session.workspace);
  const dock = createDockApi(session.dock);
  const explorer = createExplorerApi({ fetchEntries: deps.fetchRegistryEntries });
  const inspector = createInspectorApi({
    resolveSchema: deps.resolveSchema,
    resolveAudit: deps.resolveAudit,
    resolveDependencies: deps.resolveDependencies,
  });
  const preview = createPreviewApi({
    compileDraft: deps.compileDraft,
    hydratePlan: deps.hydratePlan,
  });
  const publish = createPublishApi({
    validate: deps.validatePublish,
    publish: deps.publish,
    pinEnvironment: deps.pinEnvironment,
    rollback: deps.rollback,
  });
  const command = createCommandApi();
  const plugin = createPluginApi();

  return Object.freeze({
    version: STUDIO_SDK_VERSION,
    workspace,
    dock,
    explorer,
    inspector,
    history,
    preview,
    publish,
    command,
    selection,
    clipboard,
    dragDrop,
    plugin,
  });
}

export default createStudioSdk;
