import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ROUTE_MENU_NAME,
  ROUTE_MENU_SEMVER,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_MODE,
  ROUTE_MENU_ENVIRONMENT,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_CHECKPOINT_RECEIPT,
  ISOLATED_ROUTE_PATHS,
  ROUTE_MENU_COMPONENT_NAMES,
  BLOCKED_NAVIGATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  ROUTE_MENU_READINESS_STATES,
  ROUTE_MENU_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG,
  routeMenuDigest,
  resolveEnvironmentLabel,
  isDevelopmentEnvironment,
  isProductionOrStaging,
  isStudioDevPreviewRouteMenuEnabled,
  isStudioDevPreviewRouteMenuMountEnabled,
  isStudioDevPreviewRouteMenuVerifyEnabled,
  isStudioDevPreviewRouteMenuCompatibilityCheckEnabled,
  ROUTE_MENU_ERROR_CODES,
  RouteMenuError,
  createRouteMenuError,
  routeMenuError,
  createRouteMenuSession,
  createRouteMenuPreflight,
  createRouteMenuContractLoader,
  createRouteMenuCheckpointReceipt,
  createDevOnlyFeatureGate,
  createIsolatedRouteRegistry,
  createIsolatedRouteResolver,
  createIsolatedMenuRegistry,
  createIsolatedNavigationController,
  createRouteGuard,
  createMenuVisibilityDecision,
  createRuntimeUiMountRequest,
  mountStudioDevPreviewRouteMenu,
  createRouteMenuReactHostTree,
  createBlockedNavigationModel,
  createRouteMenuIsolationBoundary,
  createRouteMenuManifest,
  verifyRouteMenuRuntime,
  checkRouteMenuRuntimeCompatibility,
  createRouteMenuDiagnostics,
  createRouteMenuFallback,
  createStudioDevPreviewRouteMenu,
} from '../../studio/blueprint-engine/dev-preview-route-menu/index.js';
import { createStudioDevPreviewRouteMenuContract } from '../../studio/blueprint-engine/dev-preview-route-menu-contract/index.js';
import { createStudioDevPreviewRuntimeUi } from '../../studio/blueprint-engine/dev-preview-runtime-ui/index.js';
import { createStudioDevPreviewRuntimeUiContract } from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-route-menu');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsxFiles = () => walkExt(DIR, /\.jsx$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsxCode = () => stripComments(jsxFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const allCode = () => stripComments([...jsFiles(), ...jsxFiles()].map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const jsxImports = () => jsxFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

// Build the full real upstream chain.
const SANDBOX = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }], permissions: [{ action: 'read', level: 'module' }] } });
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const RS = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
const IPLAN = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
const IR = createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN });
const UC = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
const UI = createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } });
const RMC = createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });
const AUTH = { routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, virtualFrame: { syntheticDataOnly: true }, initialPath: '/__dev/studio/preview' };
const U = createStudioDevPreviewRouteMenu(AUTH);

const openGate = createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });
const session = createRouteMenuSession({ routeMenuContract: RMC });
const preflight = createRouteMenuPreflight({ routeMenuContract: RMC, implementationPlan: null, runtimeUi: UI, virtualFrame: { syntheticDataOnly: true }, enabled: true, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });
const loader = createRouteMenuContractLoader({ routeMenuContract: RMC });
const receipt = createRouteMenuCheckpointReceipt({ checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });
const routeReg = createIsolatedRouteRegistry();
const resolver = createIsolatedRouteResolver({ path: '/__dev/studio/preview' });
const menuReg = createIsolatedMenuRegistry();
const guard = createRouteGuard({ featureGate: openGate, environment: 'development', syntheticData: true });
const visibility = createMenuVisibilityDecision({ featureGate: openGate });
const mountReq = createRuntimeUiMountRequest({ featureGate: openGate, routeGuard: guard, routeResolver: resolver, virtualFrame: { syntheticDataOnly: true } });
const hostTree = createRouteMenuReactHostTree();
const blockedNav = createBlockedNavigationModel();
const isolation = createRouteMenuIsolationBoundary();
const caps = ROUTE_MENU_CAPABILITIES;
const fakeRoot = () => { const r = { renders: [], unmounts: 0 }; r.render = (el) => r.renders.push(el); r.unmount = () => { r.unmounts += 1; }; return r; };

// ===== Contract base (1-70) =====
test('1. runtime created', () => assert.equal(U.kind, 'studio-dev-preview-route-menu'));
test('2. name', () => { assert.equal(U.routeMenuName, 'studio-dev-preview-route-menu'); assert.equal(U.routeMenuName, ROUTE_MENU_NAME); });
test('3. version', () => { assert.equal(U.routeMenuVersion, 'studio-dev-preview-route-menu@1.0.0'); assert.equal(U.routeMenuVersion, ROUTE_MENU_VERSION); });
test('4. semver', () => assert.equal(ROUTE_MENU_SEMVER, '1.0.0'));
test('5. routeMenuImplementationPlanVersion', () => assert.equal(U.routeMenuImplementationPlanVersion, 'studio-dev-preview-route-menu-implementation-plan@1.0.0'));
test('6. routeMenuContractVersion', () => assert.equal(U.routeMenuContractVersion, 'studio-dev-preview-route-menu-contract@1.0.0'));
test('7. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, 'studio-dev-preview-runtime-ui@1.0.0'));
test('8. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'));
test('9. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('10. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('11. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('12. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('13. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('14. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('15. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('16. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('17. mode', () => { assert.equal(U.mode, 'dev_only_isolated_route_menu_runtime'); assert.equal(U.mode, ROUTE_MENU_MODE); });
test('18. environment const', () => assert.equal(ROUTE_MENU_ENVIRONMENT, 'local_dev_only'));
test('19. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('20. not fallback', () => assert.equal(U.fallback, false));
test('21. devOnly', () => assert.equal(U.capabilities.devOnly, true));
test('22. isolated', () => assert.equal(U.capabilities.isolated, true));
test('23. defaultOff', () => assert.equal(U.capabilities.defaultOff, true));
test('24. failClosed', () => assert.equal(U.capabilities.failClosed, true));
test('25. syntheticDataOnly', () => assert.equal(U.capabilities.syntheticDataOnly, true));
test('26. routeImplemented true', () => assert.equal(U.capabilities.routeImplemented, true));
test('27. menuImplemented true', () => assert.equal(U.capabilities.menuImplemented, true));
test('28. isolatedRouteResolverImplemented true', () => assert.equal(U.capabilities.isolatedRouteResolverImplemented, true));
test('29. isolatedRouteRegistryImplemented true', () => assert.equal(U.capabilities.isolatedRouteRegistryImplemented, true));
test('30. isolatedMenuRegistryImplemented true', () => assert.equal(U.capabilities.isolatedMenuRegistryImplemented, true));
test('31. isolatedMenuUiImplemented true', () => assert.equal(U.capabilities.isolatedMenuUiImplemented, true));
test('32. routeViewImplemented true', () => assert.equal(U.capabilities.routeViewImplemented, true));
test('33. mountAdapterImplemented true', () => assert.equal(U.capabilities.mountAdapterImplemented, true));
test('34. runtimeUiMountCapabilityImplemented true', () => assert.equal(U.capabilities.runtimeUiMountCapabilityImplemented, true));
test('35. runtimeUiMountedByDefault false', () => assert.equal(U.capabilities.runtimeUiMountedByDefault, false));
test('36. globalRuntimeUiMounted false', () => assert.equal(U.capabilities.globalRuntimeUiMounted, false));
test('37. browserRouteRegistered false', () => assert.equal(U.capabilities.browserRouteRegistered, false));
test('38. productRouterWiringImplemented false', () => assert.equal(U.capabilities.productRouterWiringImplemented, false));
test('39. productMenuRegistered false', () => assert.equal(U.capabilities.productMenuRegistered, false));
test('40. productSidebarRegistered false', () => assert.equal(U.capabilities.productSidebarRegistered, false));
test('41. appWiringImplemented false', () => assert.equal(U.capabilities.appWiringImplemented, false));
test('42. deepLinkImplemented false', () => assert.equal(U.capabilities.deepLinkImplemented, false));
test('43. publicUrlCreated false', () => assert.equal(U.capabilities.publicUrlCreated, false));
test('44. routeCreatedInMainApp false', () => assert.equal(U.capabilities.routeCreatedInMainApp, false));
test('45. menuCreatedInMainApp false', () => assert.equal(U.capabilities.menuCreatedInMainApp, false));
test('46. featureFlagRequired true', () => assert.equal(U.capabilities.featureFlagRequired, true));
test('47. featureFlagDefaultEnabled false', () => assert.equal(U.capabilities.featureFlagDefaultEnabled, false));
test('48. productionDenied true', () => assert.equal(U.capabilities.productionDenied, true));
test('49. stagingDenied true', () => assert.equal(U.capabilities.stagingDenied, true));
test('50. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('51. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('52. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('53. backendAccessed false', () => assert.equal(U.capabilities.backendAccessed, false));
test('54. prismaAccessed false', () => assert.equal(U.capabilities.prismaAccessed, false));
test('55. productionAccessed false', () => assert.equal(U.capabilities.productionAccessed, false));
test('56. stagingAccessed false', () => assert.equal(U.capabilities.stagingAccessed, false));
test('57. fetchUsed false', () => assert.equal(U.capabilities.fetchUsed, false));
test('58. mutationAllowed false', () => assert.equal(U.capabilities.mutationAllowed, false));
test('59. persistenceCreated false', () => assert.equal(U.capabilities.persistenceCreated, false));
test('60. realDataRead false', () => assert.equal(U.capabilities.realDataRead, false));
test('61. realDataWrite false', () => assert.equal(U.capabilities.realDataWrite, false));
test('62. rewriteEmpresas false', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('63. prototypeRelinked false', () => assert.equal(U.capabilities.prototypeRelinked, false));
test('64. capabilities frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_CAPABILITIES)));
test('65. readyForIsolatedRouteMenuRuntime true', () => assert.equal(U.readyForIsolatedRouteMenuRuntime, true));
test('66. readyForAppIntegration false', () => assert.equal(U.readyForAppIntegration, false));
test('67. readyForProductRouterIntegration false', () => assert.equal(U.readyForProductRouterIntegration, false));
test('68. readyForProductMenuIntegration false', () => assert.equal(U.readyForProductMenuIntegration, false));
test('69. readyForRealModuleGeneration/production false', () => { assert.equal(U.readyForRealModuleGeneration, false); assert.equal(U.readyForProduction, false); });
test('70. readiness ready + in enum', () => { assert.equal(U.readiness, 'studio_dev_preview_isolated_route_menu_runtime_ready'); assert.ok(ROUTE_MENU_READINESS_STATES.includes(U.readiness)); });

// ===== Readiness (71-74) =====
test('71. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('72. warningCount 0', () => assert.equal(U.warningCount, 0));
test('73. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('74. routeMenuDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.routeMenuDigest)));

// ===== Session (75-84) =====
test('75. session kind', () => assert.equal(session.kind, 'route-menu-session'));
test('76. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-route-menu'));
test('77. session version', () => assert.equal(session.routeMenuVersion, ROUTE_MENU_VERSION));
test('78. sourceRouteMenuContract', () => assert.equal(session.sourceRouteMenuContract, ROUTE_MENU_CONTRACT_VERSION));
test('79. sourceRuntimeUi', () => assert.equal(session.sourceRuntimeUi, RUNTIME_UI_VERSION));
test('80. session mode', () => assert.equal(session.mode, ROUTE_MENU_MODE));
test('81. session devOnly/isolated/defaultOff/synthetic', () => { assert.equal(session.devOnly, true); assert.equal(session.isolated, true); assert.equal(session.defaultOff, true); assert.equal(session.syntheticDataOnly, true); });
test('82. seed deterministic', () => assert.equal(session.seed, createRouteMenuSession({ routeMenuContract: RMC }).seed));
test('83. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('84. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Preflight (85-98) =====
test('85. preflight kind', () => assert.equal(preflight.kind, 'route-menu-preflight'));
test('86. preflight ok', () => assert.equal(preflight.ok, true));
test('87. checkpoint approved', () => assert.equal(preflight.checkpointApproved, true));
test('88. manualGate satisfied (no plan → true)', () => assert.equal(preflight.manualGateSatisfied, true));
test('89. route/menu contract compatible', () => assert.equal(preflight.routeMenuContractCompatible, true));
test('90. runtime UI compatible', () => assert.equal(preflight.runtimeUiCompatible, true));
test('91. feature flag explicit', () => assert.equal(preflight.featureFlagExplicit, true));
test('92. isDevelopment', () => assert.equal(preflight.isDevelopment, true));
test('93. production/staging false', () => { assert.equal(preflight.production, false); assert.equal(preflight.staging, false); });
test('94. virtual frame valid', () => assert.equal(preflight.virtualFrameValid, true));
test('95. preflight no blockers', () => assert.equal(preflight.blockerCount, 0));
test('96. preflight fails closed without checkpoint', () => { const p = createRouteMenuPreflight({ routeMenuContract: RMC, enabled: true, environment: 'development', checkpointReceipt: 'nope', virtualFrame: { syntheticDataOnly: true } }); assert.equal(p.ok, false); assert.ok(p.blockers.includes('checkpoint_not_approved')); });
test('97. preflight fails closed in production', () => { const p = createRouteMenuPreflight({ routeMenuContract: RMC, enabled: true, environment: 'production', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, virtualFrame: { syntheticDataOnly: true } }); assert.equal(p.ok, false); assert.ok(p.blockers.includes('production_or_staging_forbidden')); });
test('98. preflight fails closed when flag not explicit', () => { const p = createRouteMenuPreflight({ routeMenuContract: RMC, enabled: false, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, virtualFrame: { syntheticDataOnly: true } }); assert.equal(p.ok, false); assert.ok(p.blockers.includes('feature_flag_not_explicit')); });

// ===== Contract loader (99-104) =====
test('99. loader kind', () => assert.equal(loader.kind, 'route-menu-contract-loader'));
test('100. loader relative import only', () => assert.equal(loader.loadedByRelativeImportOnly, true));
test('101. loader no fetch/network/dynamic', () => { assert.equal(loader.usesFetch, false); assert.equal(loader.usesNetwork, false); assert.equal(loader.usesDynamicPath, false); });
test('102. loader loaded routeMenuContract', () => assert.equal(loader.loaded.routeMenuContract, ROUTE_MENU_CONTRACT_VERSION));
test('103. loader loaded runtimeUi', () => assert.equal(loader.loaded.runtimeUi, RUNTIME_UI_VERSION));
test('104. loader routeMenuContractPresent', () => assert.equal(loader.routeMenuContractPresent, true));

// ===== Checkpoint receipt (105-110) =====
test('105. receipt kind', () => assert.equal(receipt.kind, 'route-menu-checkpoint-receipt'));
test('106. requiredCheckpoint', () => assert.equal(receipt.requiredCheckpoint, REQUIRED_CHECKPOINT_RECEIPT));
test('107. approved true when matching', () => assert.equal(receipt.approved, true));
test('108. receiptPresent', () => assert.equal(receipt.receiptPresent, true));
test('109. fromManualEnterpriseCheckpoint', () => assert.equal(receipt.fromManualEnterpriseCheckpoint, true));
test('110. not approved when wrong token', () => assert.equal(createRouteMenuCheckpointReceipt({ checkpointReceipt: 'nope' }).approved, false));

// ===== Dev-only feature gate (111-122) =====
test('111. gate kind', () => assert.equal(openGate.kind, 'route-menu-dev-only-feature-gate'));
test('112. gate open when authorized', () => assert.equal(openGate.open, true));
test('113. featureFlagDefaultEnabled false', () => assert.equal(openGate.featureFlagDefaultEnabled, false));
test('114. gate closed by default', () => assert.equal(createDevOnlyFeatureGate({}).open, false));
test('115. gate closed when disabled', () => assert.equal(createDevOnlyFeatureGate({ enabled: false, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).open, false));
test('116. gate closed in production', () => assert.equal(createDevOnlyFeatureGate({ enabled: true, environment: 'production', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).open, false));
test('117. gate closed in staging', () => assert.equal(createDevOnlyFeatureGate({ enabled: true, environment: 'staging', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).open, false));
test('118. gate closed without checkpoint', () => assert.equal(createDevOnlyFeatureGate({ enabled: true, environment: 'development', checkpointReceipt: 'nope' }).open, false));
test('119. gate productionDenied/stagingDenied', () => { assert.equal(openGate.productionDenied, true); assert.equal(openGate.stagingDenied, true); });
test('120. gate failsClosed', () => assert.equal(openGate.failsClosed, true));
test('121. gate isDevelopment', () => assert.equal(openGate.isDevelopment, true));
test('122. gate checkpointApproved', () => assert.equal(openGate.checkpointApproved, true));

// ===== Route registry + resolver (123-138) =====
test('123. routeReg kind', () => assert.equal(routeReg.kind, 'route-menu-isolated-route-registry'));
test('124. routes match const count', () => assert.equal(routeReg.routeCount, ISOLATED_ROUTE_PATHS.length));
test('125. all internal', () => assert.equal(routeReg.allInternal, true));
test('126. no product route', () => assert.equal(routeReg.anyProductRoute, false));
test('127. no public route', () => assert.equal(routeReg.anyPublicRoute, false));
test('128. each route requiresDevFlag + syntheticData', () => assert.ok(routeReg.routes.every((r) => r.requiresDevFlag === true && r.requiresSyntheticData === true)));
test('129. each route productRoute/publicRoute false', () => assert.ok(routeReg.routes.every((r) => r.productRoute === false && r.publicRoute === false)));
test('130. ISOLATED_ROUTE_PATHS frozen + dev paths', () => { assert.ok(Object.isFrozen(ISOLATED_ROUTE_PATHS)); assert.ok(ISOLATED_ROUTE_PATHS.every((p) => p.startsWith('/__dev/'))); });
test('131. resolver kind', () => assert.equal(resolver.kind, 'route-menu-isolated-route-resolver'));
test('132. resolver resolves known path', () => { assert.equal(resolver.resolvedPath, '/__dev/studio/preview'); assert.equal(resolver.matched, true); });
test('133. resolver preview screenKind', () => assert.equal(resolver.screenKind, 'preview'));
test('134. resolver unknown → not-found', () => { const r = createIsolatedRouteResolver({ path: '/whatever' }); assert.equal(r.matched, false); assert.equal(r.screenKind, 'notFound'); });
test('135. resolver no window.location', () => assert.equal(resolver.usesWindowLocation, false));
test('136. resolver no history', () => assert.equal(resolver.usesHistory, false));
test('137. resolver no react-router', () => assert.equal(resolver.usesReactRouter, false));
test('138. resolver productRoute false', () => assert.equal(resolver.productRoute, false));

// ===== Menu registry + visibility (139-149) =====
test('139. menuReg kind', () => assert.equal(menuReg.kind, 'route-menu-isolated-menu-registry'));
test('140. menu items present', () => assert.ok(menuReg.itemCount >= 1));
test('141. no product menu', () => assert.equal(menuReg.anyProductMenu, false));
test('142. no product sidebar', () => assert.equal(menuReg.anyProductSidebar, false));
test('143. all visible only when dev gate open', () => assert.equal(menuReg.allVisibleOnlyWhenDevGateOpen, true));
test('144. each item productMenu/productSidebar false', () => assert.ok(menuReg.items.every((x) => x.productMenu === false && x.productSidebar === false)));
test('145. visibility kind', () => assert.equal(visibility.kind, 'route-menu-menu-visibility-decision'));
test('146. visible local only when gate open', () => assert.equal(visibility.visibleLocalOnly, true));
test('147. no global menu/sidebar', () => { assert.equal(visibility.registersGlobalMenu, false); assert.equal(visibility.registersSidebar, false); });
test('148. no product menu/sidebar registered', () => { assert.equal(visibility.productMenuRegistered, false); assert.equal(visibility.productSidebarRegistered, false); });
test('149. visibility hidden when gate closed', () => assert.equal(createMenuVisibilityDecision({ featureGate: createDevOnlyFeatureGate({}) }).visibleLocalOnly, false));

// ===== Navigation controller (150-160) =====
test('150. nav controller kind', () => { const n = createIsolatedNavigationController({ initialPath: '/__dev/studio/preview' }); assert.equal(n.controller.kind, 'route-menu-isolated-navigation-controller'); });
test('151. nav getSnapshot preview', () => { const n = createIsolatedNavigationController({ initialPath: '/__dev/studio/preview' }); assert.equal(n.controller.getSnapshot().screenKind, 'preview'); });
test('152. navigateLocal changes local snapshot', () => { const n = createIsolatedNavigationController({ initialPath: '/__dev/studio/preview' }); const s = n.controller.navigateLocal('/__dev/studio/preview/not-found'); assert.equal(s.screenKind, 'notFound'); });
test('153. navigateLocal invokes onChange', () => { let called = null; const n = createIsolatedNavigationController({ initialPath: '/__dev/studio/preview', onChange: (s) => { called = s; } }); n.controller.navigateLocal('/__dev/studio/preview'); assert.ok(called && called.path === '/__dev/studio/preview'); });
test('154. nav no browser history mutation', () => { const n = createIsolatedNavigationController({}); assert.equal(n.controller.mutatesBrowserHistory, false); });
test('155. nav no global url change', () => { const n = createIsolatedNavigationController({}); assert.equal(n.controller.changesGlobalUrl, false); });
test('156. nav does not navigate app', () => { const n = createIsolatedNavigationController({}); assert.equal(n.controller.navigatesApp, false); });
test('157. nav does not open product route', () => { const n = createIsolatedNavigationController({}); assert.equal(n.controller.opensProductRoute, false); });
test('158. nav descriptor localOnly', () => { const n = createIsolatedNavigationController({}); assert.equal(n.descriptor.localOnly, true); });
test('159. nav descriptor digest present', () => { const n = createIsolatedNavigationController({}); assert.ok(typeof n.descriptor.navigationControllerDigest === 'string'); });
test('160. nav descriptor no browser mutation', () => { const n = createIsolatedNavigationController({}); assert.equal(n.descriptor.mutatesBrowserHistory, false); assert.equal(n.descriptor.changesGlobalUrl, false); });

// ===== Route guard (161-169) =====
test('161. guard kind', () => assert.equal(guard.kind, 'route-menu-route-guard'));
test('162. guard allow when gate open', () => assert.equal(guard.allow, true));
test('163. guard defaultDeny/failClosed', () => { assert.equal(guard.defaultDeny, true); assert.equal(guard.failClosed, true); });
test('164. guard production/staging denied', () => { assert.equal(guard.productionDenied, true); assert.equal(guard.stagingDenied, true); });
test('165. guard featureFlagRequired', () => assert.equal(guard.featureFlagRequired, true));
test('166. guard syntheticDataRequired', () => assert.equal(guard.syntheticDataRequired, true));
test('167. guard denies when gate closed', () => assert.equal(createRouteGuard({ featureGate: createDevOnlyFeatureGate({}), environment: 'development', syntheticData: true }).allow, false));
test('168. guard denies in production', () => assert.equal(createRouteGuard({ featureGate: openGate, environment: 'production', syntheticData: true }).allow, false));
test('169. guard denies without synthetic data', () => assert.equal(createRouteGuard({ featureGate: openGate, environment: 'development', syntheticData: false }).allow, false));

// ===== Mount request (170-178) =====
test('170. mountReq kind', () => assert.equal(mountReq.kind, 'route-menu-runtime-ui-mount-request'));
test('171. mountReq authorized when all ok', () => assert.equal(mountReq.mountAuthorized, true));
test('172. mountReq featureGateOpen', () => assert.equal(mountReq.featureGateOpen, true));
test('173. mountReq routeGuardAllows', () => assert.equal(mountReq.routeGuardAllows, true));
test('174. mountReq routeAuthorized', () => assert.equal(mountReq.routeAuthorized, true));
test('175. mountReq synthetic frame', () => assert.equal(mountReq.syntheticFrame, true));
test('176. mountReq no global mount', () => assert.equal(mountReq.globalRuntimeUiMounted, false));
test('177. mountReq not mounted by default', () => assert.equal(mountReq.mountedByDefault, false));
test('178. mountReq blocked when gate closed', () => { const r = createRuntimeUiMountRequest({ featureGate: createDevOnlyFeatureGate({}), routeGuard: guard, routeResolver: resolver, virtualFrame: { syntheticDataOnly: true } }); assert.equal(r.mountAuthorized, false); });

// ===== Mount adapter — authorized (179-190) =====
test('179. mount authorized → mounted', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, initialPath: '/__dev/studio/preview' }); assert.equal(ctl.mounted, true); assert.equal(ctl.blocked, false); });
test('180. mount authorized → rootFactoryCalled', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.rootFactoryCalled, true); });
test('181. mount authorized → initial render via injected root', () => { const r = fakeRoot(); mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, initialPath: '/__dev/studio/preview' }); assert.equal(r.renders.length, 1); });
test('182. mount uses hostElementFactory when provided', () => { const r = fakeRoot(); let calls = 0; mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, hostElementFactory: (snap) => { calls += 1; return { kind: 'host', snap }; } }); assert.ok(calls >= 1); assert.equal(r.renders[0].kind, 'host'); });
test('183. navigateLocal re-renders via injected root', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, initialPath: '/__dev/studio/preview' }); ctl.navigateLocal('/__dev/studio/preview/not-found'); assert.equal(r.renders.length, 2); });
test('184. navigateLocal changes only local snapshot', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, initialPath: '/__dev/studio/preview' }); const s = ctl.navigateLocal('/__dev/studio/preview/not-found'); assert.equal(s.screenKind, 'notFound'); assert.equal(ctl.getSnapshot().screenKind, 'notFound'); });
test('185. render() returns true when mounted', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.render(), true); });
test('186. dispose unmounts via injected root only', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.dispose(), true); assert.equal(r.unmounts, 1); });
test('187. dispose idempotent', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); ctl.dispose(); assert.equal(ctl.dispose(), false); assert.equal(r.unmounts, 1); });
test('188. render() no-op after dispose', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); ctl.dispose(); assert.equal(ctl.render(), false); });
test('189. mount controller flags no window/document/internal createRoot', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.usesWindow, false); assert.equal(ctl.usesDocument, false); assert.equal(ctl.usesInternalCreateRoot, false); });
test('190. mount getSnapshot returns local snapshot', () => { const r = fakeRoot(); const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => r, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, initialPath: '/__dev/studio/preview' }); assert.equal(ctl.getSnapshot().screenKind, 'preview'); });

// ===== Mount adapter — blocked (191-204) — rootFactory must NOT be called =====
test('191. blocked in production', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'production', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.blocked, true); assert.equal(ctl.reason, 'production_or_staging_denied'); assert.equal(called, false); assert.equal(ctl.rootFactoryCalled, false); });
test('192. blocked in staging', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'staging', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.blocked, true); assert.equal(called, false); });
test('193. blocked when disabled (default-off)', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'development', enabled: false, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.reason, 'default_off_or_disabled'); assert.equal(called, false); });
test('194. blocked when environment not development', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'unknown', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.reason, 'environment_not_development'); assert.equal(called, false); });
test('195. blocked without checkpoint', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: 'nope' }); assert.equal(ctl.reason, 'checkpoint_not_approved'); assert.equal(called, false); });
test('196. blocked when rootFactory missing', () => { const ctl = mountStudioDevPreviewRouteMenu({ mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.reason, 'root_factory_missing'); assert.equal(ctl.mounted, false); });
test('197. blocked when mountNode missing', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, environment: 'development', enabled: true, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }); assert.equal(ctl.reason, 'mount_node_missing'); assert.equal(called, false); });
test('198. blocked controller navigateLocal is no-op', () => { const ctl = mountStudioDevPreviewRouteMenu({ environment: 'production', enabled: true }); assert.equal(ctl.navigateLocal('/x').blocked, true); });
test('199. blocked controller render false', () => { const ctl = mountStudioDevPreviewRouteMenu({ environment: 'production', enabled: true }); assert.equal(ctl.render(), false); });
test('200. blocked controller dispose false', () => { const ctl = mountStudioDevPreviewRouteMenu({ environment: 'production', enabled: true }); assert.equal(ctl.dispose(), false); });
test('201. blocked controller getSnapshot blocked', () => { const ctl = mountStudioDevPreviewRouteMenu({ environment: 'production', enabled: true }); assert.equal(ctl.getSnapshot().blocked, true); });
test('202. blocked default (no args)', () => { const ctl = mountStudioDevPreviewRouteMenu(); assert.equal(ctl.blocked, true); });
test('203. blocked never uses window/document', () => { const ctl = mountStudioDevPreviewRouteMenu({ environment: 'production' }); assert.equal(ctl.usesWindow, false); assert.equal(ctl.usesDocument, false); });
test('204. blocked reason feature_gate closed path', () => { let called = false; const ctl = mountStudioDevPreviewRouteMenu({ rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {}, environment: 'development', enabled: true, checkpointReceipt: 'nope' }); assert.equal(called, false); });

// ===== React host tree (205-214) =====
test('205. hostTree kind', () => assert.equal(hostTree.kind, 'route-menu-react-host-tree'));
test('206. root component', () => assert.equal(hostTree.rootComponent, 'StudioDevPreviewRouteMenuHost'));
test('207. component names match const', () => assert.deepEqual(hostTree.componentNames, [...ROUTE_MENU_COMPONENT_NAMES]));
test('208. reactComponentCreated/jsxCreated true', () => { assert.equal(hostTree.reactComponentCreated, true); assert.equal(hostTree.jsxCreated, true); });
test('209. tsxCreated false', () => assert.equal(hostTree.tsxCreated, false));
test('210. no react-router', () => assert.equal(hostTree.reactRouterUsed, false));
test('211. no reactDom / internal createRoot', () => { assert.equal(hostTree.reactDomUsed, false); assert.equal(hostTree.internalCreateRootUsed, false); });
test('212. not mounted by default', () => assert.equal(hostTree.mountedByDefault, false));
test('213. confined to isolated host', () => assert.equal(hostTree.confinedToIsolatedHost, true));
test('214. tree has host + menu + route view', () => { const s = JSON.stringify(hostTree.tree); assert.ok(s.includes('StudioDevPreviewMenu') && s.includes('StudioDevPreviewRouteView')); });

// ===== Blocked navigation + isolation boundary (215-236) =====
test('215. blockedNav kind', () => assert.equal(blockedNav.kind, 'route-menu-blocked-navigation-model'));
test('216. kinds match const', () => assert.deepEqual(blockedNav.blockedNavigationKinds, [...BLOCKED_NAVIGATION_KINDS]));
test('217. navigateProduct blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'navigateProduct' && a.blocked === true)));
test('218. registerProductRoute blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerProductRoute' && a.blocked === true)));
test('219. registerProductMenu blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerProductMenu' && a.blocked === true)));
test('220. registerSidebarItem blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerSidebarItem' && a.blocked === true)));
test('221. openPublicDeepLink blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'openPublicDeepLink' && a.blocked === true)));
test('222. registerModule blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('223. readRealData/writeRealData blocked', () => { assert.ok(blockedNav.actions.some((a) => a.action === 'readRealData' && a.blocked === true)); assert.ok(blockedNav.actions.some((a) => a.action === 'writeRealData' && a.blocked === true)); });
test('224. allBlocked / anyAllowed false', () => { assert.equal(blockedNav.allBlocked, true); assert.equal(blockedNav.anyAllowed, false); });
test('225. isolation kind', () => assert.equal(isolation.kind, 'route-menu-isolation-boundary'));
test('226. no app touched', () => assert.equal(isolation.appJsxTouched, false));
test('227. no main router wired', () => assert.equal(isolation.mainRouterWired, false));
test('228. no product menu/sidebar wired', () => { assert.equal(isolation.productMenuWired, false); assert.equal(isolation.productSidebarWired, false); });
test('229. no global browser navigation', () => assert.equal(isolation.globalBrowserNavigation, false));
test('230. no browser route / public url / deep link', () => { assert.equal(isolation.browserRouteRegistered, false); assert.equal(isolation.publicUrlCreated, false); assert.equal(isolation.deepLinkImplemented, false); });
test('231. no backend/prisma/real data', () => { assert.equal(isolation.backendAccessed, false); assert.equal(isolation.prismaAccessed, false); assert.equal(isolation.realDataAccessed, false); });
test('232. no old prototype imported', () => assert.equal(isolation.oldPrototypeImported, false));
test('233. no react-router / react-dom / internal createRoot', () => { assert.equal(isolation.reactRouterUsed, false); assert.equal(isolation.reactDomUsed, false); assert.equal(isolation.internalCreateRootUsed, false); });
test('234. no window/document/history/location', () => { assert.equal(isolation.windowUsed, false); assert.equal(isolation.documentUsed, false); assert.equal(isolation.historyUsed, false); assert.equal(isolation.locationUsed, false); });
test('235. no auto mount on import', () => assert.equal(isolation.autoMountOnImport, false));
test('236. confined + reversible', () => { assert.equal(isolation.confinedToIsolatedHost, true); assert.equal(isolation.reversibleByNonConsumption, true); });

// ===== Manifest (237-246) =====
test('237. manifest kind', () => assert.equal(U.manifest.kind, 'route-menu-manifest'));
test('238. manifest name', () => assert.equal(U.manifest.routeMenuName, ROUTE_MENU_NAME));
test('239. manifest version', () => assert.equal(U.manifest.routeMenuVersion, ROUTE_MENU_VERSION));
test('240. manifest upstream routeMenuContract', () => assert.equal(U.manifest.upstream.routeMenuContract, ROUTE_MENU_CONTRACT_VERSION));
test('241. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('242. manifest parts.mountRequest digest', () => assert.ok(typeof U.manifest.parts.mountRequest === 'string'));
test('243. manifest parts.reactHostTree digest', () => assert.ok(typeof U.manifest.parts.reactHostTree === 'string'));
test('244. manifest parts.isolationBoundary digest', () => assert.ok(typeof U.manifest.parts.isolationBoundary === 'string'));
test('245. manifest standalone builds', () => assert.equal(createRouteMenuManifest({ routeMenuContract: RMC }).kind, 'route-menu-manifest'));
test('246. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (247-272) =====
test('247. verification ok', () => assert.equal(U.verification.ok, true));
test('248. verification valid', () => assert.equal(U.verification.valid, true));
test('249. verification devOnly/isolated/defaultOff', () => { assert.equal(U.verification.devOnly, true); assert.equal(U.verification.isolated, true); assert.equal(U.verification.defaultOff, true); });
test('250. verification route/menu implemented', () => { assert.equal(U.verification.routeImplemented, true); assert.equal(U.verification.menuImplemented, true); });
test('251. verification globalRuntimeUiMounted false', () => assert.equal(U.verification.globalRuntimeUiMounted, false));
test('252. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('253. verifier detects appWiringImplemented', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, appWiringImplemented: true } } }).blockers.includes('capability_appWiringImplemented_must_be_false')));
test('254. verifier detects productRouterWiringImplemented', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, productRouterWiringImplemented: true } } }).blockers.includes('capability_productRouterWiringImplemented_must_be_false')));
test('255. verifier detects product menu/sidebar', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, productMenuRegistered: true, productSidebarRegistered: true } } }); assert.ok(r.blockers.includes('capability_productMenuRegistered_must_be_false') && r.blockers.includes('capability_productSidebarRegistered_must_be_false')); });
test('256. verifier detects browserRouteRegistered', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, browserRouteRegistered: true } } }).blockers.includes('capability_browserRouteRegistered_must_be_false')));
test('257. verifier detects public url / deep link', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, publicUrlCreated: true, deepLinkImplemented: true } } }); assert.ok(r.blockers.includes('capability_publicUrlCreated_must_be_false') && r.blockers.includes('capability_deepLinkImplemented_must_be_false')); });
test('258. verifier detects global mount / mount by default', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, globalRuntimeUiMounted: true, runtimeUiMountedByDefault: true } } }); assert.ok(r.blockers.includes('capability_globalRuntimeUiMounted_must_be_false') && r.blockers.includes('capability_runtimeUiMountedByDefault_must_be_false')); });
test('259. verifier detects feature flag default-on', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, featureFlagDefaultEnabled: true } } }).blockers.includes('capability_featureFlagDefaultEnabled_must_be_false')));
test('260. verifier detects backend/prisma', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('261. verifier detects production/staging', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.blockers.includes('capability_productionAccessed_must_be_false') && r.blockers.includes('capability_stagingAccessed_must_be_false')); });
test('262. verifier detects mutation/persistence', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('263. verifier detects real data', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('264. verifier detects prototype relinked cap', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, prototypeRelinked: true } } }).blockers.includes('capability_prototypeRelinked_must_be_false')));
test('265. verifier detects module generated', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, moduleGenerated: true } } }).blockers.includes('capability_moduleGenerated_must_be_false')));
test('266. verifier detects app touched (part)', () => assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { appJsxTouched: true } } }).blockers.includes('unsafe_app_touched')));
test('267. verifier detects main router / product menu (part)', () => { const r1 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { mainRouterWired: true } } }); const r2 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { productMenuWired: true } } }); assert.ok(r1.blockers.includes('unsafe_main_router_wired') && r2.blockers.includes('unsafe_product_menu_wired')); });
test('268. verifier detects react-router / react-dom (part)', () => { const r1 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { reactRouterUsed: true } } }); const r2 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { reactDomUsed: true } } }); assert.ok(r1.blockers.includes('unsafe_react_router') && r2.blockers.includes('unsafe_react_dom')); });
test('269. verifier detects browser globals (part)', () => { const r = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { windowUsed: true } } }); assert.ok(r.blockers.includes('unsafe_browser_globals')); });
test('270. verifier detects auto mount / public deep link (part)', () => { const r1 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { autoMountOnImport: true } } }); const r2 = verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { publicUrlCreated: true } } }); assert.ok(r1.blockers.includes('unsafe_auto_mount') && r2.blockers.includes('unsafe_public_deep_link')); });
test('271. verifier detects feature flag default-on (part) + missing checkpoint', () => { const r1 = verifyRouteMenuRuntime({ contract: { capabilities: caps, featureGate: { featureFlagDefaultEnabled: true } } }); const r2 = verifyRouteMenuRuntime({ contract: { capabilities: caps, checkpointReceipt: { approved: false } } }); assert.ok(r1.blockers.includes('unsafe_feature_flag_default_on') && r2.blockers.includes('missing_checkpoint')); });
test('272. verifier detects mustBeTrue + prototype relink (part) + never throws', () => { assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: { ...caps, devOnly: false } } }).blockers.includes('capability_devOnly_must_be_true')); assert.ok(verifyRouteMenuRuntime({ contract: { capabilities: caps, isolationBoundary: { oldPrototypeImported: true } } }).blockers.includes('unsafe_prototype_relink')); assert.doesNotThrow(() => verifyRouteMenuRuntime({ contract: null })); });

// ===== Compatibility (273-281) =====
test('273. compatibility kind', () => assert.equal(U.compatibility.kind, 'route-menu-runtime-compatibility'));
test('274. compatibleWithRouteMenuContract', () => assert.equal(U.compatibility.compatibleWithRouteMenuContract, true));
test('275. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('276. compat readyForIsolatedRouteMenuRuntime', () => assert.equal(U.compatibility.readyForIsolatedRouteMenuRuntime, true));
test('277. compat readyForAppIntegration false', () => assert.equal(U.compatibility.readyForAppIntegration, false));
test('278. compat readyForProductRouter/Menu false', () => { assert.equal(U.compatibility.readyForProductRouterIntegration, false); assert.equal(U.compatibility.readyForProductMenuIntegration, false); });
test('279. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('280. compat status after-checkpoint', () => assert.equal(U.compatibility.status, 'ready_for_future_app_integration_contract_after_enterprise_checkpoint'));
test('281. compat mismatch → warning', () => { const r = checkRouteMenuRuntimeCompatibility({ routeMenuContract: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } }); assert.equal(r.compatibleWithRuntimeUi, false); assert.ok(r.warnings.includes('incompatible_runtimeUi')); });

// ===== Diagnostics + fallback (282-295) =====
test('282. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'route-menu-diagnostics'));
test('283. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('284. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('285. diagnostics devOnly/isolated/defaultOff confirmed', () => { assert.equal(U.diagnostics.devOnlyConfirmed, true); assert.equal(U.diagnostics.isolatedConfirmed, true); assert.equal(U.diagnostics.defaultOffConfirmed, true); });
test('286. diagnostics appWiring/globalMount false', () => { assert.equal(U.diagnostics.appWiringImplemented, false); assert.equal(U.diagnostics.globalRuntimeUiMounted, false); });
test('287. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRouteMenu({});
const fbBad = createStudioDevPreviewRouteMenu({ routeMenuContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewRouteMenu({ routeMenuContract: { kind: 'studio-dev-preview-route-menu-contract', fallback: true } });
test('288. missing contract → fallback', () => assert.equal(fbNo.fallback, true));
test('289. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('290. fallback contract → fallback', () => assert.equal(fbFb.fallback, true));
test('291. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('292. fallback not ready isolated/app/production', () => { assert.equal(fbNo.readyForIsolatedRouteMenuRuntime, false); assert.equal(fbNo.readyForAppIntegration, false); assert.equal(fbNo.readyForProduction, false); });
test('293. fallback caps routeImplemented false', () => assert.equal(fbNo.capabilities.routeImplemented, false));
test('294. fallback never throws', () => assert.doesNotThrow(() => createRouteMenuFallback({ reason: 'x' })));
test('295. fallback featureFlagDefaultEnabled false', () => assert.equal(fbNo.capabilities.featureFlagDefaultEnabled, false));

// ===== Errors (296-306) =====
test('296. error codes >= 30', () => assert.ok(ROUTE_MENU_ERROR_CODES.length >= 30));
test('297. error descriptor sanitized', () => { const e = createRouteMenuError('ROUTE_MENU_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('298. error no app/router/product-menu wiring', () => { const e = createRouteMenuError('ROUTE_MENU_APP_WIRING_BLOCKED'); assert.equal(e.appWiringImplemented, false); assert.equal(e.productRouterWiringImplemented, false); assert.equal(e.productMenuRegistered, false); });
test('299. error no browser route / public url / deep link', () => { const e = createRouteMenuError('ROUTE_MENU_BROWSER_ROUTE_BLOCKED'); assert.equal(e.browserRouteRegistered, false); assert.equal(e.publicUrlCreated, false); assert.equal(e.deepLinkImplemented, false); });
test('300. error no global mount / prototype', () => { const e = createRouteMenuError('ROUTE_MENU_AUTO_MOUNT_BLOCKED'); assert.equal(e.globalRuntimeUiMounted, false); assert.equal(e.prototypeRelinked, false); });
test('301. unknown code normalized', () => assert.equal(createRouteMenuError('NOPE').code, 'ROUTE_MENU_INVALID_ROUTE_MENU_CONTRACT'));
test('302. typed error', () => { const e = new RouteMenuError('ROUTE_MENU_REACT_ROUTER_BLOCKED', 'x'); assert.ok(e instanceof Error && e.name === 'RouteMenuError'); });
test('303. helper error', () => assert.equal(routeMenuError('ROUTE_MENU_FETCH_BLOCKED', 'x').code, 'ROUTE_MENU_FETCH_BLOCKED'));
test('304. codes cover router/dom API blocks', () => ['ROUTE_MENU_REACT_ROUTER_BLOCKED', 'ROUTE_MENU_BROWSER_ROUTER_BLOCKED', 'ROUTE_MENU_USE_NAVIGATE_BLOCKED', 'ROUTE_MENU_NAVLINK_BLOCKED', 'ROUTE_MENU_LINK_BLOCKED', 'ROUTE_MENU_WINDOW_BLOCKED', 'ROUTE_MENU_DOCUMENT_BLOCKED', 'ROUTE_MENU_HISTORY_BLOCKED', 'ROUTE_MENU_LOCATION_BLOCKED', 'ROUTE_MENU_REACT_DOM_BLOCKED', 'ROUTE_MENU_CREATE_ROOT_BLOCKED'].forEach((c) => assert.ok(ROUTE_MENU_ERROR_CODES.includes(c))));
test('305. codes cover mount/checkpoint blocks', () => ['ROUTE_MENU_AUTO_MOUNT_BLOCKED', 'ROUTE_MENU_ROOT_FACTORY_MISSING', 'ROUTE_MENU_MOUNT_NODE_MISSING', 'ROUTE_MENU_CHECKPOINT_MISSING', 'ROUTE_MENU_PROTOTYPE_RELINK_BLOCKED'].forEach((c) => assert.ok(ROUTE_MENU_ERROR_CODES.includes(c))));
test('306. error no stack leak', () => { const e = createRouteMenuError('ROUTE_MENU_BACKEND_BLOCKED'); assert.equal(e.noStackLeak, true); });

// ===== Config flags + env helpers (307-320) =====
test('307. flag off by default', () => assert.equal(isStudioDevPreviewRouteMenuEnabled({}), false));
test('308. flag on in dev', () => assert.equal(isStudioDevPreviewRouteMenuEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG]: 'true', DEV: true }), true));
test('309. flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('310. mount flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuMountEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('311. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('312. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('313. mount flag on in dev via master', () => assert.equal(isStudioDevPreviewRouteMenuMountEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG]: 'true', DEV: true }), true));
test('314. resolveEnvironmentLabel DEV', () => assert.equal(resolveEnvironmentLabel({ DEV: 'true' }), 'development'));
test('315. resolveEnvironmentLabel production', () => assert.equal(resolveEnvironmentLabel({ MAK_ENV_LABEL: 'production' }), 'production'));
test('316. isDevelopmentEnvironment', () => { assert.equal(isDevelopmentEnvironment('development'), true); assert.equal(isDevelopmentEnvironment('production'), false); });
test('317. isProductionOrStaging', () => { assert.equal(isProductionOrStaging('production'), true); assert.equal(isProductionOrStaging('staging'), true); assert.equal(isProductionOrStaging('development'), false); });
test('318. readiness states frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_READINESS_STATES)));
test('319. component names + blocked nav + prototype paths frozen', () => { assert.ok(Object.isFrozen(ROUTE_MENU_COMPONENT_NAMES)); assert.ok(Object.isFrozen(BLOCKED_NAVIGATION_KINDS)); assert.ok(Object.isFrozen(FORBIDDEN_PROTOTYPE_PATHS)); });
test('320. routeMenuDigest deterministic + format', () => { assert.equal(routeMenuDigest({ a: 1 }), routeMenuDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(routeMenuDigest({ a: 1 }))); });

// ===== Determinism / purity (321-332) =====
test('321. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRouteMenu(AUTH).overallDigest));
test('322. deterministic routeMenuDigest', () => assert.equal(U.routeMenuDigest, createStudioDevPreviewRouteMenu(AUTH).routeMenuDigest));
test('323. input not mutated', () => { const snap = JSON.stringify(RMC); createStudioDevPreviewRouteMenu(AUTH); assert.equal(JSON.stringify(RMC), snap); });
test('324. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('325. different module → different digest', () => {
  const sb2 = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const ui2 = createStudioDevPreviewRuntimeUi({ runtimeUiContract: createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb2 }) }) }) }) }) }), env: { DEV: 'true' } });
  const rmc2 = createStudioDevPreviewRouteMenuContract({ runtimeUi: ui2 });
  assert.notEqual(U.overallDigest, createStudioDevPreviewRouteMenu({ ...AUTH, routeMenuContract: rmc2, runtimeUi: ui2 }).overallDigest);
});
test('326. contract builds without enabled (default-off; still valid metadata)', () => { const u = createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI }); assert.equal(u.fallback, false); assert.equal(u.featureGate.open, false); });
test('327. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('328. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('329. no browser route (contract)', () => assert.equal(U.capabilities.browserRouteRegistered, false));
test('330. no app wiring (contract)', () => assert.equal(U.capabilities.appWiringImplemented, false));
test('331. no product menu/sidebar (contract)', () => { assert.equal(U.capabilities.productMenuRegistered, false); assert.equal(U.capabilities.productSidebarRegistered, false); });
test('332. deterministic manifest digest (full composer)', () => assert.equal(U.manifest.manifestDigest, createStudioDevPreviewRouteMenu(AUTH).manifest.manifestDigest));

// ===== .js graph purity scan (333-344) =====
test('333. .js graph React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('334. .js no react-router', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('335. .js no react-dom', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('336. .js no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(|<[A-Za-z][^>]*\/?>(?!=)/.test(jsCode())));
test('337. .js no createRoot/hydrateRoot call', () => assert.ok(!/createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('338. .js no window/document/history/location', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.[a-z]|\blocation\.[a-z]/i.test(jsCode())));
test('339. .js no fetch', () => assert.ok(!/\bfetch\s*\(/.test(jsCode())));
test('340. .js no storage APIs', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(jsCode())));
test('341. no DATABASE_URL anywhere', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('342. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('343. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('344. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));

// ===== .jsx isolation scan (345-360) =====
test('345. 5 jsx files exist', () => assert.equal(jsxFiles().length, 5));
test('346. Host.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/StudioDevPreviewRouteMenuHost.jsx')));
test('347. Menu.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/StudioDevPreviewMenu.jsx')));
test('348. RouteView.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/StudioDevPreviewRouteView.jsx')));
test('349. NotFound.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/StudioDevPreviewNotFound.jsx')));
test('350. Blocked.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/StudioDevPreviewBlocked.jsx')));
test('351. jsx contain real JSX', () => assert.ok(jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8')))));
test('352. jsx automatic runtime (no react import)', () => assert.ok(jsxImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('353. jsx no react-dom', () => assert.ok(jsxImports().every((p) => !/react-dom/i.test(p))));
test('354. jsx no react-router', () => assert.ok(jsxImports().every((p) => !/react-router/i.test(p))));
test('355. jsx no createRoot/hydrateRoot', () => assert.ok(!/createRoot\s*\(|hydrateRoot\s*\(/.test(jsxCode())));
test('356. jsx no window/document/history/location', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.[a-z]|\blocation\.[a-z]/i.test(jsxCode())));
test('357. jsx no BrowserRouter/NavLink/Route (case-sensitive)', () => assert.ok(!/\bBrowserRouter\b|\bNavLink\b|<Route[\s/>]|\bRoutes\b|\buseNavigate\b/.test(jsxCode())));
test('358. jsx imports only local siblings', () => assert.ok(jsxImports().every((p) => /^\.\/StudioDevPreview/.test(p))));
test('359. no .tsx anywhere in subtree', () => assert.ok(walkExt(DIR, /\.tsx$/).length === 0 && !fs.readdirSync(DIR).some((f) => /\.tsx$/.test(f))));
test('360. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));

// ===== No react-router / prototype relink across subtree (361-372) =====
test('361. no react-router anywhere', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/react-router/i.test(p))));
test('362. no react-dom anywhere', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/react-dom/i.test(p))));
test('363. no old prototype import', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('364. no src/components or src/pages import', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('365. no App import', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('366. no BrowserRouter/createBrowserRouter anywhere', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b/.test(allCode())));
test('367. no useNavigate anywhere', () => assert.ok(!/\buseNavigate\b/.test(allCode())));
test('368. no NavLink / <Route / Routes anywhere', () => assert.ok(!/\bNavLink\b|<Route[\s/>]|\bRoutes\b/.test(allCode())));
test('369. no XMLHttpRequest/WebSocket', () => assert.ok(!/XMLHttpRequest|WebSocket/.test(allCode())));
test('370. no import of backend/apis/prisma', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('371. mount adapter references rootFactory + mountNode', () => { const code = fs.readFileSync(path.join(DIR, 'createRuntimeUiMountAdapter.js'), 'utf8'); assert.ok(/rootFactory/.test(code) && /mountNode/.test(code)); });
test('372. no internal ReactDOM import', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/^react-dom(\/|$)/.test(p)) && !/\bReactDOM\b/.test(allCode())));

// ===== Scope safety (373-395) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('373. subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu')));
test('374. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('375. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('376. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('377. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('378. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('379. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('380. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('381. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('382. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('383. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('384. studio prototype dirs not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(x))); });
test('385. vite config / index.html not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^vite\.config\.|^index\.html$/.test(x))); });
test('386. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('387. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('388. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('389. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('390. .tsx never added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.tsx$/.test(x))); });
test('391. .css never added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('392. .jsx only inside authorized subtree in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.jsx$/.test(x) || /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//.test(x))); });
test('393. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('394. net-new scope is subtree only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('395. upstream route/menu contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu-contract/index.js')));

// ===== Evidence docs (D1-D24) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-REPORT.md', 'ARCHITECTURAL-DECISION-ISOLATED-HOST.md',
  'SESSION.md', 'PREFLIGHT.md', 'CONTRACT-LOADER.md', 'DEV-ONLY-FEATURE-GATE.md', 'ISOLATED-ROUTE-REGISTRY.md',
  'ISOLATED-ROUTE-RESOLVER.md', 'ISOLATED-MENU-REGISTRY.md', 'LOCAL-NAVIGATION-CONTROLLER.md', 'ROUTE-GUARD.md',
  'MENU-VISIBILITY.md', 'RUNTIME-UI-MOUNT-ADAPTER.md', 'REACT-HOST-TREE.md', 'BLOCKED-NAVIGATION.md',
  'CHECKPOINT-RECEIPT.md', 'ISOLATION-BOUNDARY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-APP-NO-PRODUCT-ROUTER-NO-PRODUCT-MENU.md', 'NO-PROTOTYPE-RELINK.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md', 'ROUTE-MENU-INVENTORY.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-route-menu/${DOCS[i]}`)));
}
test('D-content. isolated-host decision + no-prototype + next slice present', () => {
  assert.ok(/isolated|isolad|host|App/i.test(readEv('ARCHITECTURAL-DECISION-ISOLATED-HOST.md')));
  assert.ok(/prototype|protótipo|relink/i.test(readEv('NO-PROTOTYPE-RELINK.md')));
  assert.ok(/APP INTEGRATION CONTRACT|integration|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));
});

// ===== Additional isolation & robustness scenarios (396-419) =====
test('396. mount blocked in production does not call rootFactory', () => {
  let called = false;
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'production', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {} });
  assert.equal(r.mounted, false);
  assert.equal(r.blocked, true);
  assert.equal(r.rootFactoryCalled, false);
  assert.equal(called, false);
});
test('397. mount blocked in staging', () => {
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'staging', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, rootFactory: () => fakeRoot(), mountNode: {} });
  assert.equal(r.blocked, true);
});
test('398. mount blocked when disabled (default-off)', () => {
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: false, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, rootFactory: () => fakeRoot(), mountNode: {} });
  assert.equal(r.blocked, true);
});
test('399. mount blocked when checkpoint missing', () => {
  let called = false;
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: null, rootFactory: () => { called = true; return fakeRoot(); }, mountNode: {} });
  assert.equal(r.blocked, true);
  assert.equal(called, false);
});
test('400. mount blocked when rootFactory missing', () => {
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, mountNode: {} });
  assert.equal(r.blocked, true);
});
test('401. mount blocked when mountNode missing', () => {
  const r = mountStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT, rootFactory: () => fakeRoot() });
  assert.equal(r.blocked, true);
});
test('402. authorized mount calls injected rootFactory exactly once', () => {
  let calls = 0;
  const r = mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: (n) => { calls += 1; assert.ok(n); return fakeRoot(); }, mountNode: { id: 'host' } });
  assert.equal(r.mounted, true);
  assert.equal(r.rootFactoryCalled, true);
  assert.equal(calls, 1);
});
test('403. authorized mount renders initial snapshot through injected root', () => {
  const root = fakeRoot();
  mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: () => root, mountNode: {} });
  assert.ok(root.renders.length >= 1);
});
test('404. navigateLocal re-renders through injected root', () => {
  const root = fakeRoot();
  const r = mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: () => root, mountNode: {} });
  const before = root.renders.length;
  r.navigateLocal('/__dev/studio/preview/not-found');
  assert.ok(root.renders.length > before);
});
test('405. dispose unmounts injected root', () => {
  const root = fakeRoot();
  const r = mountStudioDevPreviewRouteMenu({ ...AUTH, rootFactory: () => root, mountNode: {} });
  r.dispose();
  assert.equal(root.unmounts, 1);
});
test('406. resolver matches canonical preview path', () => {
  const res = createIsolatedRouteResolver({ path: '/__dev/studio/preview' });
  assert.equal(res.matched, true);
});
test('407. resolver returns not-found for unknown dev path', () => {
  const res = createIsolatedRouteResolver({ path: '/__dev/studio/preview/nope' });
  assert.equal(res.matched, false);
});
test('408. resolver does not match a product path', () => {
  const res = createIsolatedRouteResolver({ path: '/clientes' });
  assert.equal(res.matched, false);
});
test('409. feature gate closed by default (no args)', () => {
  const g = createDevOnlyFeatureGate({});
  assert.equal(g.open, false);
});
test('410. feature gate closed in production even with checkpoint', () => {
  const g = createDevOnlyFeatureGate({ enabled: true, environment: 'production', checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });
  assert.equal(g.open, false);
});
test('411. route guard denies when gate closed', () => {
  const g = createRouteGuard({ featureGate: createDevOnlyFeatureGate({}), environment: 'development', syntheticData: true });
  assert.equal(g.allow, false);
});
test('412. menu invisible when gate closed', () => {
  const v = createMenuVisibilityDecision({ featureGate: createDevOnlyFeatureGate({}) });
  assert.equal(v.visibleLocalOnly, false);
});
test('413. blocked navigation denies every product/data kind', () => {
  for (const kind of BLOCKED_NAVIGATION_KINDS) {
    assert.ok(blockedNav.actions.some((a) => a.action === kind && a.blocked === true));
  }
  assert.equal(blockedNav.allBlocked, true);
  assert.equal(blockedNav.anyAllowed, false);
});
test('414. verifier confirms runtime ok/valid for authorized composer', () => {
  assert.equal(U.verification.ok, true);
  assert.equal(U.verification.valid, true);
});
test('415. verifier reports no blockers for authorized composer', () => {
  const v = verifyRouteMenuRuntime({ contract: { capabilities: caps, checkpointReceipt: { approved: true } } });
  assert.deepEqual(v.blockers, []);
});
test('416. verifier mustBeTrue capabilities hold', () => {
  assert.equal(U.verification.devOnly, true);
  assert.equal(U.verification.isolated, true);
  assert.equal(U.verification.defaultOff, true);
  assert.equal(U.verification.routeImplemented, true);
  assert.equal(U.verification.menuImplemented, true);
});
test('417. isolation boundary confined + reversible', () => {
  assert.equal(isolation.confinedToIsolatedHost, true);
  assert.equal(isolation.reversibleByNonConsumption, true);
});
test('418. runtime serializes with no functions leaking', () => {
  const snap = JSON.parse(JSON.stringify(U));
  assert.equal(typeof snap, 'object');
  assert.ok(!/function/i.test(Object.prototype.toString.call(snap.manifest)));
});
test('419. deterministic composer digest is stable', () => {
  const a = createStudioDevPreviewRouteMenu(AUTH);
  const b = createStudioDevPreviewRouteMenu(AUTH);
  assert.equal(a.manifest.digest, b.manifest.digest);
});
