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
  STUDIO_CORE_VERSION,
  OFFICIAL_CORE_ENGINES,
  STUDIO_ARTIFACT_TYPES,
  DOCUMENT_ENGINE_VERSION,
  createDocumentEngine,
  createDocumentStore,
  AST_ENGINE_VERSION,
  createAstEngine,
  VALIDATION_ENGINE_VERSION,
  createValidationEngine,
  COMMAND_ENGINE_VERSION,
  createCommandEngine,
  STUDIO_PROJECT_VERSION,
  createStudioProject,
  createProjectModel,
  DEPENDENCY_GRAPH_VERSION,
  DEPENDENCY_KINDS,
  createDependencyGraphEngine,
  REFACTORING_ENGINE_VERSION,
  createRefactoringEngine,
} from "./core/index.js";
export {
  STUDIO_OBJECT_MODEL_VERSION,
  OFFICIAL_SOM_ENGINES,
  SOM_OBJECT_KINDS,
  BINDING_KINDS,
  BEHAVIOR_TRIGGER_KINDS,
  BEHAVIOR_ACTION_KINDS,
  OBJECT_MODEL_VERSION,
  createSomObject,
  createStudioObjectModel,
  PROPERTY_ENGINE_VERSION,
  createPropertyEngine,
  BINDING_ENGINE_VERSION,
  createBindingEngine,
  BEHAVIOR_ENGINE_VERSION,
  createBehaviorEngine,
  OBJECT_IDENTITY_VERSION,
  createObjectIdentitySystem,
  STUDIO_PACKAGE_VERSION,
  createStudioPackage,
  createPackageModel,
} from "./som/index.js";
export {
  STUDIO_EDITOR_VERSION,
  OFFICIAL_EDITOR_SERVICES,
  EDITOR_CONTRIBUTION_KINDS,
  EDITOR_HUB_EVENTS,
  createStudioEditor,
  createEditorRegistry,
  getEditorRegistry,
  EditorHost,
  useEditorBridge,
  StudioEditorShellBridge,
} from "./editor/index.js";
export {
  STUDIO_EXPRESSION_VERSION,
  EXPRESSION_DOCUMENT_VERSION,
  EXPRESSION_AST_VERSION,
  EXPRESSION_IR_VERSION,
  OFFICIAL_EXPRESSION_ENGINES,
  createExpressionEngine,
  createExpressionDocument,
  createExpressionParser,
  createFunctionCatalog,
  OFFICIAL_EXPRESSION_FUNCTIONS,
} from "./expression/index.js";
export {
  STUDIO_DEPENDENCY_VERSION,
  OFFICIAL_DEPENDENCY_ENGINES,
  DEPENDENCY_NODE_KINDS,
  DEPENDENCY_EDGE_KINDS,
  createDependencyEngine,
  createDependencyGraph,
  createCycleDetection,
  createImpactAnalyzer,
} from "./dependency/index.js";
export {
  STUDIO_TYPE_SYSTEM_VERSION,
  OFFICIAL_TYPE_ENGINES,
  PRIMITIVE_TYPE_IDS,
  createTypeSystem,
  createTypeRegistry,
  createTypeCompatibilityEngine,
  createTypeInferenceEngine,
} from "./typeSystem/index.js";
export {
  STUDIO_EVALUATION_VERSION,
  OFFICIAL_EVALUATION_ENGINES,
  EVALUATION_STRATEGIES,
  createEvaluationEngine,
  createEvaluationPipeline,
  createEvaluationCache,
  createEvaluationScheduler,
} from "./evaluation/index.js";
export {
  STUDIO_COMPUTATION_VERSION,
  OFFICIAL_COMPUTATION_ENGINES,
  COMPUTATION_DOCUMENT_VERSION,
  COMPUTATION_AST_VERSION,
  COMPUTATION_GRAPH_VERSION,
  EXECUTION_GRAPH_VERSION,
  COMPUTATION_IR_VERSION,
  createComputationEngine,
  createComputationDocument,
  createComputationGraph,
  createExecutionGraph,
  createStudioContext,
  createRuntimeContext,
  createComputationContext,
} from "./computation/index.js";
export {
  BUSINESS_INTENT_DOCUMENT_VERSION,
  INTENT_RESOLVER_VERSION,
  INTENT_RESOLVER_ENGINE_ID,
  RESOLVER_DOCUMENT_VERSION,
  RESOLVER_RESULT_VERSION,
  DERIVATION_KIND_FORMULA,
  createBusinessIntentDocument,
  validateBusinessIntentDocument,
  createBusinessLanguageInput,
  businessLanguageToIntent,
  createIntentResolver,
  getIntentResolver,
  resolveIntentDocument,
  resolveFromBusinessLanguage,
  runResolverPipeline,
  RESOLVER_PIPELINE_STAGES,
  RESOLVER_EXTENSION_POINTS,
} from "./intent/index.js";
export {
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
export {
  LAYOUT_DOCUMENT_VERSION,
  LAYOUT_AST_VERSION,
  LayoutDesignerPlugin,
  registerLayoutDesigner,
  createLayoutCommandBus,
  compileLayoutDocumentPreview,
} from "./designers/layout/index.js";
export {
  FIELD_DOCUMENT_VERSION,
  FIELD_AST_VERSION,
  FieldDesignerPlugin,
  registerFieldDesigner,
  createFieldCommandBus,
  compileFieldDocumentPreview,
} from "./designers/field/index.js";

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
