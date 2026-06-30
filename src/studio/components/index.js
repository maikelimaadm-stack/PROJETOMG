export { UNIVERSAL_COMPONENTS_VERSION, validateProviderContract } from "./contracts/universalComponentContracts.js";

export {
  ExplorerProvider,
  useExplorerProvider,
  InspectorProvider,
  useInspectorProvider,
  PropertyProvider,
  usePropertyProvider,
  WorkspaceProvider,
  useWorkspaceProvider,
  DockProvider,
  useDockProvider,
  NotificationProvider,
  useNotificationProvider,
  BreadcrumbProvider,
  useBreadcrumbProvider,
  CommandPaletteProvider,
  useCommandPaletteProvider,
  StatusBarProvider,
  useStatusBarProvider,
} from "./providers/index.js";

export { UniversalExplorer } from "./UniversalExplorer.jsx";
export { UniversalInspector } from "./UniversalInspector.jsx";
export { UniversalPropertyGrid } from "./UniversalPropertyGrid.jsx";
export { UniversalWorkspace } from "./UniversalWorkspace.jsx";
export { UniversalDock } from "./UniversalDock.jsx";
export { UniversalTabs } from "./UniversalTabs.jsx";
export { UniversalStatusBar } from "./UniversalStatusBar.jsx";
export { UniversalNotificationArea } from "./UniversalNotificationArea.jsx";
export { UniversalBreadcrumb } from "./UniversalBreadcrumb.jsx";
export { UniversalCommandPalette } from "./UniversalCommandPalette.jsx";
