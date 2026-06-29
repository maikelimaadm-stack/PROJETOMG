/**
 * MAK Studio — SDK + Design System + Event Architecture + Registry Foundation
 * Layer order: SDK → Design System → Event Architecture → Shell (Phase 2.1) → Designers
 */
export { createStudioSdk, STUDIO_SDK_VERSION, validateStudioDesigner, validateStudioPlugin } from "./sdk/index.js";
export {
  bootstrapStudioRegistries,
  getStudioRegistrySnapshot,
  getStudioComponent,
  listStudioComponents,
  getStudioProperty,
  listStudioProperties,
  getStudioEvent,
  listStudioEvents,
  getStudioAction,
  listStudioActions,
  getStudioCapabilities,
  designerHasCapability,
} from "./registry/index.js";
export {
  DESIGN_SYSTEM_VERSION,
  bootstrapDesignSystem,
  getDesignSystemSnapshot,
  getDesignToken,
  listDesignTokens,
  resolveTokenValue,
  getDesignTheme,
  listDesignThemes,
  getDesignMotion,
  getComponentManifest,
  getUniversalComponent,
  listUniversalComponents,
  validateComponentManifest,
  validateUniversalComponent,
} from "./designSystem/index.js";
export {
  STUDIO_EVENT_ARCHITECTURE_VERSION,
  bootstrapStudioEvents,
  getStudioEventsSnapshot,
  getStudioEventHub,
  createStudioEventHub,
  getBusEvent,
  listBusEvents,
  validateEventManifest,
  createPluginEventBridge,
  createDesignerEventBridge,
  wireHistoryToEventHub,
  wirePreviewToEventHub,
} from "./events/index.js";
export {
  STUDIO_GOVERNANCE_VERSION,
  validateStudioArchitecture,
  DEPENDENCY_STACK,
  validateDependencyGraph,
} from "./governance/index.js";
export {
  UNIVERSAL_COMPONENTS_VERSION,
  UniversalExplorer,
  UniversalInspector,
  UniversalPropertyGrid,
  UniversalWorkspace,
  UniversalDock,
  UniversalTabs,
  UniversalStatusBar,
  UniversalNotificationArea,
  UniversalBreadcrumb,
  UniversalCommandPalette,
  ExplorerProvider,
  InspectorProvider,
  PropertyProvider,
  WorkspaceProvider,
  DockProvider,
  NotificationProvider,
  BreadcrumbProvider,
  CommandPaletteProvider,
  StatusBarProvider,
  useExplorerProvider,
  useInspectorProvider,
  usePropertyProvider,
  useWorkspaceProvider,
  useDockProvider,
  useNotificationProvider,
  useBreadcrumbProvider,
  useCommandPaletteProvider,
  useStatusBarProvider,
} from "./components/index.js";
export {
  STUDIO_DOMAIN_VERSION,
  OFFICIAL_DOMAIN_SLICES,
  OFFICIAL_DOMAIN_HOOKS,
  OFFICIAL_DOMAIN_SERVICES,
  createInitialStudioDomainState,
  createStudioDomainStore,
  createMockDomainServiceAdapters,
  createProductionDomainAdapters,
  STUDIO_SELECTION_MODEL_VERSION,
  OFFICIAL_SELECTION_KINDS,
  createStudioSelection,
  STUDIO_WORKSPACE_SESSION_VERSION,
  createWorkspaceSession,
  StudioDomainProvider,
  StudioUniversalBridge,
  useStudioDomain,
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
} from "./domain/index.js";
export {
  STUDIO_CONTRIBUTIONS_VERSION,
  OFFICIAL_CONTRIBUTION_TYPES,
  OFFICIAL_REGISTRY_IDS,
  CONTRIBUTION_LIFECYCLE_STATES,
  getContributionManager,
  getRegistryManager,
  createContributionManager,
  createRegistryManager,
  validateMakPackageManifest,
  validateContributionMetadata,
} from "./contributions/index.js";
export {
  mdpIntrospect,
  mdpRegistryIntrospect,
  mdpCompile,
  mdpPublish,
  loadPreviewCrbFromIntrospect,
  loadPreviewCrbFromCompile,
  buildExplorerTreeFromRegistry,
  buildPersistenceKey,
  loadStudioPersistence,
  saveStudioPersistence,
} from "./services/index.js";

import { getContributionManager } from "./contributions/contributionManager.js";
import { bootstrapStudioRegistries } from "./registry/bootstrapStudioRegistries.js";
import { bootstrapDesignSystem } from "./designSystem/bootstrapDesignSystem.js";
import { bootstrapStudioEvents } from "./events/bootstrapStudioEvents.js";

const contributionManager = () => getContributionManager();
export const registerExplorerContribution = (...args) =>
  contributionManager().registerExplorerContribution(...args);
export const registerToolbarContribution = (...args) =>
  contributionManager().registerToolbarContribution(...args);
export const registerInspectorContribution = (...args) =>
  contributionManager().registerInspectorContribution(...args);
export const registerCommandContribution = (...args) =>
  contributionManager().registerCommandContribution(...args);
export const registerContextMenuContribution = (...args) =>
  contributionManager().registerContextMenuContribution(...args);
export const registerDockContribution = (...args) =>
  contributionManager().registerDockContribution(...args);
export const registerPropertyContribution = (...args) =>
  contributionManager().registerPropertyContribution(...args);

bootstrapStudioRegistries();
bootstrapDesignSystem();
bootstrapStudioEvents();
