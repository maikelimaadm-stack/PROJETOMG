export {
  STUDIO_DOMAIN_VERSION,
  OFFICIAL_DOMAIN_SLICES,
  OFFICIAL_DOMAIN_HOOKS,
  OFFICIAL_DOMAIN_SERVICES,
  createInitialStudioDomainState,
} from "./contracts/studioDomainContracts.js";

export { defineStudioDomainServices } from "./contracts/serviceContracts.js";

export { createStudioDomainStore } from "./state/createStudioDomainStore.js";
export { createDomainActions } from "./state/createDomainActions.js";
export { DomainActionTypes } from "./state/studioDomainReducer.js";

export { createMockDomainServiceAdapters } from "./adapters/createMockDomainServiceAdapters.js";
export { createProductionDomainAdapters } from "./adapters/createProductionDomainAdapters.js";

export {
  STUDIO_SELECTION_MODEL_VERSION,
  OFFICIAL_SELECTION_KINDS,
  createStudioSelection,
  validateStudioSelection,
} from "./contracts/selectionModel.js";

export {
  STUDIO_WORKSPACE_SESSION_VERSION,
  createWorkspaceSession,
  validateWorkspaceSession,
} from "./contracts/workspaceSession.js";

export { StudioDomainProvider, useStudioDomain, StudioUniversalBridge } from "./providers/index.js";

export {
  useSelection,
  useWorkspace,
  useDock,
  useTabs,
  useHistory,
  useNotifications,
  useClipboard,
  usePreview,
  usePublish,
  useSearch,
  useAssets,
  useProperties,
} from "./hooks/index.js";
