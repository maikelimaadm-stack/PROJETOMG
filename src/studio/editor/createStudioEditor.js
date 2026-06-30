/**
 * Studio Editor Engine — reusable editor for all Designers (Program 2.2.7)
 * Consumes: Studio Core, SOM, SDK, Design System, Event Hub
 */
import { STUDIO_EDITOR_VERSION } from "./contracts/editorContracts.js";
import { getEditorCatalog } from "./catalog/editorCatalog.js";
import { createExplorerService } from "./services/explorerService.js";
import { createWorkspaceService } from "./services/workspaceService.js";
import { createInspectorService } from "./services/inspectorService.js";
import { createPropertyGridService } from "./services/propertyGridService.js";
import { createCanvasService } from "./services/canvasService.js";
import { createPreviewService } from "./services/previewService.js";
import { createHistoryService } from "./services/historyService.js";
import { createPublishService } from "./services/publishService.js";
import { createSelectionService } from "./services/selectionService.js";

export function createStudioEditor(config = {}) {
  const { sdk, hub } = config;
  const registry = config.registry ?? getEditorCatalog();

  const services = Object.freeze({
    explorer: createExplorerService({ sdk, hub }),
    workspace: createWorkspaceService({ sdk, hub }),
    inspector: createInspectorService(),
    propertyGrid: createPropertyGridService({ sdk, hub }),
    canvas: createCanvasService({ sdk, hub }),
    preview: createPreviewService({ sdk, hub }),
    history: createHistoryService({ sdk, hub }),
    publish: createPublishService({ sdk, hub }),
    selection: createSelectionService({ sdk, hub }),
  });

  const mount = (designerId, context) => registry.mount(designerId, context);

  const getBridgeConfig = (designerId) => registry.getDesigner(designerId)?.bridge ?? null;

  return Object.freeze({
    version: STUDIO_EDITOR_VERSION,
    registry,
    services,
    mount,
    getBridgeConfig,
    hasDesigner: (designerId) => registry.hasDesigner(designerId),
  });
}

export default createStudioEditor;
