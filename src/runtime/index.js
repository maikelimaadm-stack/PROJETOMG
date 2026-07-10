export { bootstrap, hydrate, hydrateWithBundle, destroy, RuntimeBootstrapError } from './core/bootstrap/bootstrap.js';
export { loadRuntimeBundle } from './core/bootstrap/loadRuntimeBundle.js';
export { createContext, createEmptyAccessScope } from './core/context/createContext.js';
export { RuntimeContext } from './core/context/RuntimeContext.js';
export { ContextError } from './core/context/errors.js';
export { createRegistry, RegistryManager } from './core/registry/registryManager.js';
export { RegistryError } from './core/registry/errors.js';
export { REGISTRY_TYPES } from './core/registry/registryTypes.js';
export { SessionFactory, createSessionManager } from './core/session/SessionFactory.js';
export { WebSessionManager } from './core/session/webSession.js';
export { RuntimeSession } from './core/session/RuntimeSession.js';
export { SessionError } from './core/session/errors.js';
export { createMockL1Auth } from './core/session/mockL1Auth.js';
export { createLoader, LoaderManager, LoaderError } from './core/loader/loaderManager.js';
export { LoaderContext } from './core/loader/LoaderContext.js';
export { createCrbLoader, CRBLoader, CrbError } from './core/crb/crbLoader.js';
export { createDependencyResolver, DependencyResolver, DependencyError } from './core/dependency/dependencyResolver.js';
export { createRuntimeRouter, RuntimeRouter, RouteError } from './core/router/runtimeRouter.js';
export { createPermissionEngine, PermissionEngine, PermissionError } from './core/permission/permissionEngine.js';
export { PermissionMatrix } from './core/permission/PermissionMatrix.js';
export { createActionEngine, ActionEngine, ActionError } from './core/action/actionEngine.js';
export { createWorkflowEngine, WorkflowEngine, WorkflowError } from './core/workflow/workflowEngine.js';
export { createRenderEngine, RenderEngine, RenderError } from './core/render/renderEngine.js';
export { createExpressionEngine, ExpressionEngine, ExpressionError } from './core/expression/expressionEngine.js';
export { createFormulaEngine, FormulaEngine, FormulaError } from './core/formula/formulaEngine.js';
export { createValidationEngine, ValidationEngine, ValidationError } from './core/validation/validationEngine.js';
export { createExecutionEngine, ExecutionEngine, ExecutionError } from './core/execution/executionEngine.js';
export { createStateEngine, StateEngine, StateError } from './core/state/stateEngine.js';
export { createPluginEngine, PluginEngine, PluginError } from './core/plugin/pluginEngine.js';
export { createConnectorEngine, ConnectorEngine, ConnectorError } from './core/connector/connectorEngine.js';
export { createCacheEngine, CacheEngine, CacheError } from './infra/cache/cacheEngine.js';
export { createEventBus, EventBus, EventBusError } from './infra/event-bus/eventBus.js';
export { createTransactionEngine, TransactionEngine, TransactionError } from './infra/transaction/transactionEngine.js';
export { createObservabilityEngine, ObservabilityEngine, ObservabilityError } from './infra/observability/observabilityEngine.js';
export { createRuntimeCompletion, RuntimeCompletion, RuntimeCompletionError } from './core/completion/runtimeCompletion.js';
export { createRuntimeShadowMode, RuntimeShadowMode, RuntimeShadowModeError } from './shadow/runtimeShadowMode.js';
export { createEmpresasShadowPilot, EmpresasShadowPilot, EmpresasShadowPilotError } from './shadow/pilots/empresasShadowPilot.js';
export { createEmpresasTableFormShadow, EmpresasTableFormShadow } from './shadow/pilots/empresasTableFormShadow.js';
export { createTableFormProjection } from './shadow/pilots/tableFormProjection.js';
// Generic, module-agnostic shadow runtime (the Empresas pipeline generalized) + second module (cadcps) pilot.
export { createGenericModuleShadowPilot, GenericModuleShadowPilot, GenericModuleShadowError } from './shadow/generic/genericModuleShadowPilot.js';
export { createGenericModuleTableFormShadow, GenericModuleTableFormShadow } from './shadow/generic/genericModuleTableFormShadow.js';
export { validateGenericModuleDescriptor, normalizeGenericModuleDescriptor } from './shadow/generic/genericModuleDescriptor.js';
export {
  createCadcpsShadowPilot,
  createCadcpsTableFormShadow,
  createSecondModuleShadowPilot,
  createSecondModuleTableFormShadow,
  CADCPS_SHADOW_FLAG,
} from './shadow/pilots/secondModuleShadowPilot.js';
export { createCadcpsDescriptor, createSecondModuleDescriptor, CADCPS_DESCRIPTOR } from './shadow/pilots/createSecondModuleDescriptor.js';
export { createControlledPreview, ControlledPreview, ControlledPreviewError } from './preview/controlledPreview.js';
export { createPreviewModel } from './preview/previewModel.js';
// Dev-only visual preview: export ONLY the pure, framework-free helpers from the runtime barrel.
// The React components (dev/*.jsx) are intentionally NOT exported here — they must never be pulled
// into the framework-free runtime core, and they are dev-only (not a production route).
export { createEmpresasDevPreviewModel, isEmpresasDevPreviewEnabled } from './preview/dev/devPreviewConfig.js';
// Dev-only preview harness: again only the pure helpers (fixture + flag) leave the barrel — the
// harness React component (EmpresasDevPreviewHarness.jsx) is dev-only and never exported here.
export { createEmpresasDevPreviewFixture } from './preview/dev/createEmpresasDevPreviewFixture.js';
export { isEmpresasDevPreviewHarnessEnabled } from './preview/dev/devPreviewHarnessConfig.js';
export { createSecondModuleDevPreviewFixture, createCadcpsDevPreviewFixture } from './preview/dev/createSecondModuleDevPreviewFixture.js';
// Runtime v2 dev preview hub: only the pure helpers (model builder + flag) leave the barrel — the
// hub React components (hub/*.jsx) are dev-only and never exported here.
export { createRuntimeV2DevPreviewHubModel } from './preview/dev/hub/createRuntimeV2DevPreviewHubModel.js';
export { isRuntimeV2DevPreviewHubEnabled, detectEnvLabel, RUNTIME_V2_DEV_PREVIEW_HUB_FLAG } from './preview/dev/hub/devPreviewHubConfig.js';
// Runtime v2 controlled dev dataset — pure, dev-only, opt-in mocked data for previews.
export { createControlledDevDataset, ControlledDevDataset, createEmpresasControlledDataset, createCadcpsControlledDataset } from './preview/dev/data/createControlledDevDataset.js';
export { createControlledModuleDataset } from './preview/dev/data/controlledDevDataset.js';
export { isControlledDevDatasetEnabled, CONTROLLED_DEV_DATASET_FLAG } from './preview/dev/data/controlledDatasetConfig.js';
// Runtime v2 dev preview route: only the pure helpers (route model builder + flag + path) leave the
// barrel — the route React components (route/*.jsx) are dev-only and NOT wired into src/App.jsx.
export { createRuntimeV2DevPreviewRouteModel } from './preview/dev/route/createRuntimeV2DevPreviewRouteModel.js';
export { isRuntimeV2DevPreviewRouteEnabled, RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH, RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG } from './preview/dev/route/devPreviewRouteConfig.js';
// Dev-only route MOUNT gate — pure helpers a dev-guarded router branch uses to decide whether to
// mount the route. The .jsx mount wrapper is NOT exported here and src/App.jsx is NOT edited.
export { shouldMountRuntimeV2DevPreviewRoute, isRuntimeV2DevEnvironment, getRuntimeV2DevPreviewRouteMountPlan } from './preview/dev/route/registerRuntimeV2DevPreviewRoute.js';
// First real module migration PLANNING — pure, passive, deterministic plan/readiness/risk/rollback
// models. This layer migrates nothing, reads no real data, touches no backend, and edits no real UI.
export { createMigrationReadinessModel, resolveReadinessStatus, READINESS_STATUSES, MAX_READINESS_THIS_SLICE } from './migration/planning/createMigrationReadinessModel.js';
export { createMigrationRiskModel } from './migration/planning/migrationRiskModel.js';
export { createMigrationRollbackPlan } from './migration/planning/migrationRollbackPlan.js';
export { createFirstModuleMigrationPlan } from './migration/planning/createFirstModuleMigrationPlan.js';
export { createEmpresasMigrationPlan } from './migration/planning/createEmpresasMigrationPlan.js';
export { MigrationPlanningError } from './migration/planning/errors.js';
// Empresas Read-Only Runtime v2 Candidate — the first real READ candidate of runtime v2 for Empresas.
// Read-only, flag-protected, fail-closed in production; writes are impossible (write guard). Pure/passive.
export { createEmpresasReadOnlyRuntimeCandidate } from './migration/empresas-readonly/createEmpresasReadOnlyRuntimeCandidate.js';
export { createEmpresasReadOnlyViewModel } from './migration/empresas-readonly/createEmpresasReadOnlyViewModel.js';
export { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from './migration/empresas-readonly/empresasReadOnlyWriteGuard.js';
export { createEmpresasReadOnlyDiagnostics } from './migration/empresas-readonly/empresasReadOnlyDiagnostics.js';
export { isEmpresasReadOnlyEnabled, EMPRESAS_READONLY_FLAG } from './migration/empresas-readonly/empresasReadOnlyConfig.js';
export { EmpresasReadOnlyError } from './migration/empresas-readonly/errors.js';
// Empresas Dual Read Shadow Compare — passive, deterministic comparison of legacy vs runtime v2
// read-only snapshots. Read-only, flag-protected, fail-closed in production; write guard stays active.
export { createEmpresasDualReadShadowCompare } from './migration/empresas-dual-read/createEmpresasDualReadShadowCompare.js';
export { createEmpresasLegacyReadSnapshot } from './migration/empresas-dual-read/createEmpresasLegacyReadSnapshot.js';
export { createEmpresasRuntimeV2ReadSnapshot } from './migration/empresas-dual-read/createEmpresasRuntimeV2ReadSnapshot.js';
export { compareEmpresasReadSnapshots } from './migration/empresas-dual-read/compareEmpresasReadSnapshots.js';
export { createEmpresasDualReadDiagnostics } from './migration/empresas-dual-read/empresasDualReadDiagnostics.js';
export { makeDifference, summarizeDifferences, DIFFERENCE_SEVERITIES, DIFFERENCE_CATEGORIES } from './migration/empresas-dual-read/empresasDualReadDifferenceModel.js';
export { isEmpresasDualReadEnabled, EMPRESAS_DUAL_READ_FLAG } from './migration/empresas-dual-read/empresasDualReadConfig.js';
export { EmpresasDualReadError } from './migration/empresas-dual-read/errors.js';
// Empresas Guarded Read UI Slice — dev-only, read-only UI model composing the read-only candidate +
// dual-read compare. Only the PURE helpers leave the barrel; the React components (components/*.jsx)
// are dev-only and intentionally NOT exported here (no React in the runtime barrel; src/App.jsx untouched).
export { createEmpresasGuardedReadUiModel } from './migration/empresas-guarded-read-ui/createEmpresasGuardedReadUiModel.js';
export { createEmpresasGuardedReadUiDiagnostics } from './migration/empresas-guarded-read-ui/empresasGuardedReadUiDiagnostics.js';
export { isEmpresasGuardedReadUiEnabled, EMPRESAS_GUARDED_READ_UI_FLAG } from './migration/empresas-guarded-read-ui/empresasGuardedReadUiConfig.js';
export { EmpresasGuardedReadUiError } from './migration/empresas-guarded-read-ui/errors.js';
export {
  createServiceLocator,
  createEmptyServiceLocator,
  ServiceLocator,
  ServiceLocatorError,
} from './infra/service-locator/serviceLocator.js';
export { captureRuntimeMetrics } from './infra/observability/runtimeMetrics.js';
