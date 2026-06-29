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

import { bootstrapStudioRegistries } from "./registry/bootstrapStudioRegistries.js";
import { bootstrapDesignSystem } from "./designSystem/bootstrapDesignSystem.js";
import { bootstrapStudioEvents } from "./events/bootstrapStudioEvents.js";

bootstrapStudioRegistries();
bootstrapDesignSystem();
bootstrapStudioEvents();
