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
