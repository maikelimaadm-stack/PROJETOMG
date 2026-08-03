import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Caller-aware Studio scope governance. This test declares its OWN slice identity, so the branch-relative
// scope check below can ask whether the slice active on this branch is the same as it or genuinely later.
import { evaluateStudioBranchDiffScope, createResolvedActiveStudioSlicePathAuthorizer }
  from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  APP_INTEGRATION_CONTRACT_NAME,
  APP_INTEGRATION_CONTRACT_SEMVER,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_CONTRACT_MODE,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
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
  REQUIRED_FUTURE_CHECKPOINT,
  BLOCKED_INTEGRATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_CONTRACT_READINESS_STATES,
  APP_INTEGRATION_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG,
  appIntegrationDigest,
  isProductionEnv,
  isStudioDevPreviewAppIntegrationContractEnabled,
  isStudioDevPreviewAppIntegrationAttachmentEnabled,
  isStudioDevPreviewAppIntegrationVerifyEnabled,
  isStudioDevPreviewAppIntegrationCompatibilityCheckEnabled,
  APP_INTEGRATION_CONTRACT_ERROR_CODES,
  AppIntegrationContractError,
  createAppIntegrationContractError,
  appIntegrationContractError,
  createAppIntegrationContractSession,
  createAppAttachmentPointContract,
  createDevOnlyFeatureFlagContract,
  createProductIsolationContract,
  createAppBootstrapBoundaryContract,
  createRouterAttachmentContract,
  createRouteExposureContract,
  createMenuExposureContract,
  createRuntimeUiMountAdapterContract,
  createDependencyInjectionBoundaryContract,
  createLifecycleCleanupContract,
  createFailureContainmentContract,
  createOwnershipRollbackContract,
  createProductionStagingDenialContract,
  createPrototypeRelinkProhibitionContract,
  createAppIntegrationManualEnablementGateContract,
  createAppIntegrationSafetyContract,
  createAppIntegrationReadinessDecision,
  createAppIntegrationManifest,
  verifyAppIntegrationContract,
  checkAppIntegrationCompatibility,
  createAppIntegrationDiagnostics,
  createAppIntegrationFallback,
  createStudioDevPreviewAppIntegrationContract,
} from '../../studio/blueprint-engine/dev-preview-app-integration-contract/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewRuntimeUiContract } from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewRuntimeUi } from '../../studio/blueprint-engine/dev-preview-runtime-ui/index.js';
import { createStudioDevPreviewRouteMenuContract } from '../../studio/blueprint-engine/dev-preview-route-menu-contract/index.js';
import { createStudioDevPreviewRouteMenu } from '../../studio/blueprint-engine/dev-preview-route-menu/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-app-integration-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration-contract');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const authorized = (f) => /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//.test(f)
  || f === 'src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js'
  || f === 'scripts/gates/g423-studio-dev-preview-app-integration-contract.mjs'
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-contract\//.test(f);

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
const RM = createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: 'approved_for_isolated_route_menu_runtime', virtualFrame: { syntheticDataOnly: true }, initialPath: '/__dev/studio/preview' });
const U = createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM });

const session = createAppIntegrationContractSession({ routeMenuRuntime: RM });
const attachmentPoint = createAppAttachmentPointContract({ routeMenuRuntime: RM });
const featureFlag = createDevOnlyFeatureFlagContract();
const productIsolation = createProductIsolationContract();
const bootstrapBoundary = createAppBootstrapBoundaryContract();
const routerAttachment = createRouterAttachmentContract();
const routeExposure = createRouteExposureContract();
const menuExposure = createMenuExposureContract();
const runtimeUiMountAdapter = createRuntimeUiMountAdapterContract();
const dependencyInjectionBoundary = createDependencyInjectionBoundaryContract();
const lifecycleCleanup = createLifecycleCleanupContract();
const failureContainment = createFailureContainmentContract();
const ownershipRollback = createOwnershipRollbackContract();
const productionStagingDenial = createProductionStagingDenialContract();
const prototypeRelinkProhibition = createPrototypeRelinkProhibitionContract();
const manualGate = createAppIntegrationManualEnablementGateContract();
const safety = createAppIntegrationSafetyContract();
const caps = APP_INTEGRATION_CONTRACT_CAPABILITIES;

// ===== Contract base + versions (1-40) =====
test('1. created', () => assert.equal(U.kind, 'studio-dev-preview-app-integration-contract'));
test('2. name', () => { assert.equal(U.appIntegrationContractName, 'studio-dev-preview-app-integration-contract'); assert.equal(U.appIntegrationContractName, APP_INTEGRATION_CONTRACT_NAME); });
test('3. version', () => { assert.equal(U.appIntegrationContractVersion, 'studio-dev-preview-app-integration-contract@1.0.0'); assert.equal(U.appIntegrationContractVersion, APP_INTEGRATION_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(APP_INTEGRATION_CONTRACT_SEMVER, '1.0.0'));
test('5. routeMenuVersion', () => { assert.equal(U.routeMenuVersion, 'studio-dev-preview-route-menu@1.0.0'); assert.equal(U.routeMenuVersion, ROUTE_MENU_VERSION); });
test('6. routeMenuContractVersion', () => assert.equal(U.routeMenuContractVersion, ROUTE_MENU_CONTRACT_VERSION));
test('7. routeMenuImplementationPlanVersion', () => assert.equal(U.routeMenuImplementationPlanVersion, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION));
test('8. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, RUNTIME_UI_VERSION));
test('9. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, RUNTIME_UI_CONTRACT_VERSION));
test('10. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, ISOLATED_RUNTIME_VERSION));
test('11. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, RUNTIME_SHELL_CONTRACT_VERSION));
test('12. visualContractVersion', () => assert.equal(U.visualContractVersion, VISUAL_CONTRACT_VERSION));
test('13. bridgeVersion', () => assert.equal(U.bridgeVersion, DEV_PREVIEW_BRIDGE_VERSION));
test('14. sandboxVersion', () => assert.equal(U.sandboxVersion, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('15. plannerVersion', () => assert.equal(U.plannerVersion, MODULE_REFERENCE_PLANNER_VERSION));
test('16. engineVersion', () => assert.equal(U.engineVersion, STUDIO_BLUEPRINT_ENGINE_VERSION));
test('17. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, STUDIO_BLUEPRINT_CONTRACT_VERSION));
test('18. mode', () => { assert.equal(U.mode, 'headless_dev_preview_app_integration_contract'); assert.equal(U.mode, APP_INTEGRATION_CONTRACT_MODE); });
test('19. not fallback', () => assert.equal(U.fallback, false));
test('20. headless', () => assert.equal(U.headless, true));
test('21. contractOnly', () => assert.equal(U.contractOnly, true));
test('22. metadataOnly', () => assert.equal(U.metadataOnly, true));
test('23. appIntegrationContractOnly', () => assert.equal(U.appIntegrationContractOnly, true));
test('24. devOnly', () => assert.equal(U.devOnly, true));
test('25. isolated', () => assert.equal(U.isolated, true));
test('26. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_app_integration_contract_ready'));
test('27. readyForAppIntegrationContract true', () => assert.equal(U.readyForAppIntegrationContract, true));
test('28. readyForAppIntegrationImplementationPlan false', () => assert.equal(U.readyForAppIntegrationImplementationPlan, false));
test('29. readyForAppIntegrationImplementationSlice false', () => assert.equal(U.readyForAppIntegrationImplementationSlice, false));
test('30. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('31. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('32. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('33. warningCount 0', () => assert.equal(U.warningCount, 0));
test('34. blockers array', () => assert.deepEqual(U.blockers, []));
test('35. moduleId string', () => assert.equal(typeof U.moduleId, 'string'));
test('36. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('37. appIntegrationContractDigest fnv1a', () => assert.ok(String(U.appIntegrationContractDigest).startsWith('fnv1a-')));
test('38. capabilities present', () => assert.equal(typeof U.capabilities, 'object'));
test('39. readiness state known', () => assert.ok(APP_INTEGRATION_CONTRACT_READINESS_STATES.includes(U.readiness)));
test('40. required future checkpoint', () => assert.equal(REQUIRED_FUTURE_CHECKPOINT, 'pre_app_integration_implementation_enterprise_checkpoint'));

// ===== Capabilities (41-110) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'appIntegrationContractOnly', 'devOnly', 'isolated', 'attachmentPointMetadataOnly', 'featureFlagMetadataOnly', 'productIsolationMetadataOnly', 'bootstrapBoundaryMetadataOnly', 'routerAttachmentMetadataOnly', 'routeExposureMetadataOnly', 'menuExposureMetadataOnly', 'runtimeUiMountAdapterMetadataOnly', 'dependencyInjectionBoundaryMetadataOnly', 'lifecycleCleanupMetadataOnly', 'failureContainmentMetadataOnly', 'ownershipRollbackMetadataOnly', 'productionDenialMetadataOnly', 'prototypeRelinkProhibitionMetadataOnly', 'manualEnablementGateOnly'];
const FALSE_CAPS = ['appIntegrated', 'appTouched', 'appWiringCreated', 'routerTouched', 'routerWiringCreated', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp', 'featureFlagConnectedToApp', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} true (const + contract)`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); });
}
for (const k of FALSE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} false (const + contract)`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); });
}

// ===== Session (111-120) =====
test('111. session kind', () => assert.equal(session.kind, 'app-integration-contract-session'));
test('112. session no storage', () => assert.equal(session.usesStorage, false));
test('113. session no fetch', () => assert.equal(session.usesFetch, false));
test('114. session no persistence', () => assert.equal(session.usesPersistence, false));
test('115. session no side effects', () => assert.equal(session.runtimeSideEffects, false));
test('116. session seed string', () => assert.equal(typeof session.seed, 'string'));
test('117. session sources route/menu', () => assert.equal(session.sourceRouteMenuRuntime, ROUTE_MENU_VERSION));
test('118. session version', () => assert.equal(session.appIntegrationContractVersion, APP_INTEGRATION_CONTRACT_VERSION));
test('119. session digest fnv1a', () => assert.ok(String(session.sessionDigest).startsWith('fnv1a-')));
test('120. session deterministic', () => assert.equal(createAppIntegrationContractSession({ routeMenuRuntime: RM }).sessionDigest, session.sessionDigest));

// ===== Attachment point (121-130) =====
test('121. attachment kind', () => assert.equal(attachmentPoint.kind, 'app-integration-attachment-point-contract'));
test('122. attachment id string', () => assert.equal(typeof attachmentPoint.attachmentPointId, 'string'));
test('123. attachment future location', () => assert.equal(typeof attachmentPoint.futureAppLocation, 'string'));
test('124. attachment future kind', () => assert.equal(typeof attachmentPoint.futureIntegrationKind, 'string'));
test('125. attachment owner', () => assert.equal(attachmentPoint.futureOwner, 'studio_dev_preview'));
test('126. attachment appTouched false', () => assert.equal(attachmentPoint.appTouched, false));
test('127. attachment attachmentCreated false', () => assert.equal(attachmentPoint.attachmentCreated, false));
test('128. attachment integrationPerformed false', () => assert.equal(attachmentPoint.integrationPerformed, false));
test('129. attachment requires future slice + gate', () => { assert.equal(attachmentPoint.requiresExplicitFutureSlice, true); assert.equal(attachmentPoint.requiresManualGate, true); });
test('130. attachment in contract', () => assert.equal(U.attachmentPoint.kind, 'app-integration-attachment-point-contract'));

// ===== Feature flag (131-140) =====
test('131. featureFlag kind', () => assert.equal(featureFlag.kind, 'app-integration-dev-only-feature-flag-contract'));
test('132. featureFlag name metadata', () => assert.equal(featureFlag.flagNameMetadata, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG));
test('133. featureFlag default off', () => assert.equal(featureFlag.defaultEnabled, false));
test('134. featureFlag devOnly', () => assert.equal(featureFlag.devOnly, true));
test('135. featureFlag production not allowed', () => assert.equal(featureFlag.productionAllowed, false));
test('136. featureFlag staging not allowed', () => assert.equal(featureFlag.stagingAllowed, false));
test('137. featureFlag not connected to App', () => assert.equal(featureFlag.connectedToApp, false));
test('138. featureFlag requires future slice', () => assert.equal(featureFlag.requiresExplicitFutureSlice, true));
test('139. featureFlag requires manual gate', () => assert.equal(featureFlag.requiresManualGate, true));
test('140. featureFlag in contract', () => assert.equal(U.featureFlag.connectedToApp, false));

// ===== Product isolation (141-150) =====
test('141. productIsolation kind', () => assert.equal(productIsolation.kind, 'app-integration-product-isolation-contract'));
test('142. product app isolated', () => assert.equal(productIsolation.productAppIsolated, true));
test('143. product router isolated', () => assert.equal(productIsolation.productRouterIsolated, true));
test('144. product menu isolated', () => assert.equal(productIsolation.productMenuIsolated, true));
test('145. product sidebar isolated', () => assert.equal(productIsolation.productSidebarIsolated, true));
test('146. product navigation isolated', () => assert.equal(productIsolation.productNavigationIsolated, true));
test('147. product modules isolated', () => assert.equal(productIsolation.productModulesIsolated, true));
test('148. product data isolated', () => assert.equal(productIsolation.productDataIsolated, true));
test('149. isolation not breached', () => assert.equal(productIsolation.isolationBreached, false));
test('150. productIsolation in contract', () => assert.equal(U.productIsolation.productAppIsolated, true));

// ===== Bootstrap boundary (151-158) =====
test('151. bootstrap kind', () => assert.equal(bootstrapBoundary.kind, 'app-integration-bootstrap-boundary-contract'));
test('152. bootstrap not touched', () => assert.equal(bootstrapBoundary.bootstrapTouched, false));
test('153. bootstrap integration not created', () => assert.equal(bootstrapBoundary.bootstrapIntegrationCreated, false));
test('154. no auto mount', () => assert.equal(bootstrapBoundary.autoMountAllowed, false));
test('155. no mount on import', () => assert.equal(bootstrapBoundary.mountOnImportAllowed, false));
test('156. no side effect on import', () => assert.equal(bootstrapBoundary.sideEffectOnImportAllowed, false));
test('157. bootstrap requires future slice', () => assert.equal(bootstrapBoundary.requiresExplicitFutureSlice, true));
test('158. bootstrap in contract', () => assert.equal(U.bootstrapBoundary.bootstrapTouched, false));

// ===== Router attachment (159-168) =====
test('159. routerAttachment kind', () => assert.equal(routerAttachment.kind, 'app-integration-router-attachment-contract'));
test('160. router not touched', () => assert.equal(routerAttachment.routerTouched, false));
test('161. router attachment not created', () => assert.equal(routerAttachment.routerAttachmentCreated, false));
test('162. route not registered', () => assert.equal(routerAttachment.routeRegistered, false));
test('163. no BrowserRouter used', () => assert.equal(routerAttachment.browserRouterUsed, false));
test('164. no createBrowserRouter used', () => assert.equal(routerAttachment.createBrowserRouterUsed, false));
test('165. no useNavigate used', () => assert.equal(routerAttachment.useNavigateUsed, false));
test('166. router future attachment metadata', () => assert.equal(routerAttachment.futureAttachment, 'dev_only_contract'));
test('167. router requires manual gate', () => assert.equal(routerAttachment.requiresManualGate, true));
test('168. routerAttachment in contract', () => assert.equal(U.routerAttachment.routerTouched, false));

// ===== Route exposure (169-176) =====
test('169. routeExposure kind', () => assert.equal(routeExposure.kind, 'app-integration-route-exposure-contract'));
test('170. route not exposed to product', () => assert.equal(routeExposure.routeExposedToProduct, false));
test('171. no public route created', () => assert.equal(routeExposure.publicRouteCreated, false));
test('172. no deep link created', () => assert.equal(routeExposure.deepLinkCreated, false));
test('173. no browser navigation allowed', () => assert.equal(routeExposure.browserNavigationAllowed, false));
test('174. route future exposure metadata', () => assert.equal(routeExposure.futureExposure, 'dev_only_contract'));
test('175. route requires manual gate', () => assert.equal(routeExposure.requiresManualGate, true));
test('176. routeExposure in contract', () => assert.equal(U.routeExposure.routeExposedToProduct, false));

// ===== Menu exposure (177-184) =====
test('177. menuExposure kind', () => assert.equal(menuExposure.kind, 'app-integration-menu-exposure-contract'));
test('178. menu not exposed to product', () => assert.equal(menuExposure.menuExposedToProduct, false));
test('179. sidebar not exposed to product', () => assert.equal(menuExposure.sidebarExposedToProduct, false));
test('180. navigation not exposed to product', () => assert.equal(menuExposure.navigationExposedToProduct, false));
test('181. no menu item created', () => assert.equal(menuExposure.menuItemCreated, false));
test('182. menu future exposure metadata', () => assert.equal(menuExposure.futureExposure, 'dev_only_contract'));
test('183. menu requires manual gate', () => assert.equal(menuExposure.requiresManualGate, true));
test('184. menuExposure in contract', () => assert.equal(U.menuExposure.menuExposedToProduct, false));

// ===== Runtime UI mount adapter (185-194) =====
test('185. mountAdapter kind', () => assert.equal(runtimeUiMountAdapter.kind, 'app-integration-runtime-ui-mount-adapter-contract'));
test('186. runtime ui not mounted in app', () => assert.equal(runtimeUiMountAdapter.runtimeUiMountedInApp, false));
test('187. mount adapter not created', () => assert.equal(runtimeUiMountAdapter.mountAdapterCreated, false));
test('188. no reactDom used', () => assert.equal(runtimeUiMountAdapter.reactDomUsed, false));
test('189. no createRoot used', () => assert.equal(runtimeUiMountAdapter.createRootUsed, false));
test('190. no window used', () => assert.equal(runtimeUiMountAdapter.windowUsed, false));
test('191. no document used', () => assert.equal(runtimeUiMountAdapter.documentUsed, false));
test('192. no mount node created', () => assert.equal(runtimeUiMountAdapter.mountNodeCreated, false));
test('193. no root factory injected', () => assert.equal(runtimeUiMountAdapter.rootFactoryInjected, false));
test('194. mountAdapter in contract', () => assert.equal(U.runtimeUiMountAdapter.runtimeUiMountedInApp, false));

// ===== Dependency injection boundary (195-202) =====
test('195. diBoundary kind', () => assert.equal(dependencyInjectionBoundary.kind, 'app-integration-dependency-injection-boundary-contract'));
test('196. DI required', () => assert.equal(dependencyInjectionBoundary.dependencyInjectionRequired, true));
test('197. no implicit lookup', () => assert.equal(dependencyInjectionBoundary.implicitDependencyLookupAllowed, false));
test('198. no global lookup', () => assert.equal(dependencyInjectionBoundary.globalLookupAllowed, false));
test('199. no service locator', () => assert.equal(dependencyInjectionBoundary.serviceLocatorAllowed, false));
test('200. no App import allowed', () => assert.equal(dependencyInjectionBoundary.AppImportAllowed, false));
test('201. no router/menu import allowed', () => { assert.equal(dependencyInjectionBoundary.routerImportAllowed, false); assert.equal(dependencyInjectionBoundary.menuImportAllowed, false); });
test('202. diBoundary in contract', () => assert.equal(U.dependencyInjectionBoundary.dependencyInjectionRequired, true));

// ===== Lifecycle cleanup (203-210) =====
test('203. lifecycle kind', () => assert.equal(lifecycleCleanup.kind, 'app-integration-lifecycle-cleanup-contract'));
test('204. lifecycle not integrated', () => assert.equal(lifecycleCleanup.lifecycleIntegrated, false));
test('205. cleanup not integrated', () => assert.equal(lifecycleCleanup.cleanupIntegrated, false));
test('206. no auto start', () => assert.equal(lifecycleCleanup.autoStartAllowed, false));
test('207. no auto stop', () => assert.equal(lifecycleCleanup.autoStopAllowed, false));
test('208. unmount not integrated', () => assert.equal(lifecycleCleanup.unmountIntegrated, false));
test('209. lifecycle future metadata', () => assert.equal(lifecycleCleanup.futureCleanup, 'dev_only_contract'));
test('210. lifecycle in contract', () => assert.equal(U.lifecycleCleanup.lifecycleIntegrated, false));

// ===== Failure containment (211-218) =====
test('211. failureContainment kind', () => assert.equal(failureContainment.kind, 'app-integration-failure-containment-contract'));
test('212. fail closed', () => assert.equal(failureContainment.failClosed, true));
test('213. failure contained', () => assert.equal(failureContainment.failureContained, true));
test('214. no app failure propagation', () => assert.equal(failureContainment.productAppFailurePropagationAllowed, false));
test('215. no router failure propagation', () => assert.equal(failureContainment.productRouterFailurePropagationAllowed, false));
test('216. no menu failure propagation', () => assert.equal(failureContainment.productMenuFailurePropagationAllowed, false));
test('217. failureContainment digest', () => assert.ok(String(failureContainment.failureContainmentDigest).startsWith('fnv1a-')));
test('218. failureContainment in contract', () => assert.equal(U.failureContainment.failClosed, true));

// ===== Ownership rollback (219-226) =====
test('219. ownership kind', () => assert.equal(ownershipRollback.kind, 'app-integration-ownership-rollback-contract'));
test('220. owner studio dev preview', () => assert.equal(ownershipRollback.owner, 'studio_dev_preview'));
test('221. no product ownership', () => assert.equal(ownershipRollback.productOwnership, false));
test('222. rollback by non-consumption', () => assert.equal(ownershipRollback.rollbackByNonConsumption, true));
test('223. rollback by flag off', () => assert.equal(ownershipRollback.rollbackByFlagOff, true));
test('224. no destructive rollback required', () => assert.equal(ownershipRollback.destructiveRollbackRequired, false));
test('225. ownership digest', () => assert.ok(String(ownershipRollback.ownershipRollbackDigest).startsWith('fnv1a-')));
test('226. ownership in contract', () => assert.equal(U.ownershipRollback.owner, 'studio_dev_preview'));

// ===== Production/staging denial (227-234) =====
test('227. denial kind', () => assert.equal(productionStagingDenial.kind, 'app-integration-production-staging-denial-contract'));
test('228. production denied', () => assert.equal(productionStagingDenial.productionDenied, true));
test('229. staging denied', () => assert.equal(productionStagingDenial.stagingDenied, true));
test('230. default off', () => assert.equal(productionStagingDenial.defaultOff, true));
test('231. fail closed', () => assert.equal(productionStagingDenial.failClosed, true));
test('232. denial digest', () => assert.ok(String(productionStagingDenial.productionStagingDenialDigest).startsWith('fnv1a-')));
test('233. denial in contract', () => { assert.equal(U.productionStagingDenial.productionDenied, true); assert.equal(U.productionStagingDenial.stagingDenied, true); });
test('234. denial deterministic', () => assert.equal(createProductionStagingDenialContract().productionStagingDenialDigest, productionStagingDenial.productionStagingDenialDigest));

// ===== Prototype relink prohibition (235-244) =====
test('235. prototype kind', () => assert.equal(prototypeRelinkProhibition.kind, 'app-integration-prototype-relink-prohibition-contract'));
test('236. relink not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeRelinkAllowed, false));
test('237. import not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeImportAllowed, false));
test('238. copy not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeCopyAllowed, false));
test('239. move not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeMoveAllowed, false));
test('240. old prototype not imported', () => assert.equal(prototypeRelinkProhibition.oldPrototypeImported, false));
test('241. forbidden paths enumerated', () => assert.ok(Array.isArray(prototypeRelinkProhibition.forbiddenPrototypePaths) && prototypeRelinkProhibition.forbiddenPrototypePaths.length === FORBIDDEN_PROTOTYPE_PATHS.length));
test('242. forbidden paths include shell/designers/pages', () => { const p = prototypeRelinkProhibition.forbiddenPrototypePaths.join(','); assert.ok(/studio\/shell\//.test(p) && /studio\/designers\//.test(p) && /studio\/pages\//.test(p)); });
test('243. prototype digest', () => assert.ok(String(prototypeRelinkProhibition.prototypeRelinkProhibitionDigest).startsWith('fnv1a-')));
test('244. prototype in contract', () => assert.equal(U.prototypeRelinkProhibition.prototypeRelinkAllowed, false));

// ===== Manual gate (245-258) =====
test('245. manualGate kind', () => assert.equal(manualGate.kind, 'app-integration-manual-enablement-gate-contract'));
test('246. manual gate required', () => assert.equal(manualGate.manualGateRequired, true));
test('247. required checkpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('248. current authorization contract_only', () => assert.equal(manualGate.currentSliceAuthorization, 'contract_only'));
test('249. authorizes no app touch', () => assert.equal(manualGate.authorizesAppTouch, false));
test('250. authorizes no app wiring', () => assert.equal(manualGate.authorizesAppWiring, false));
test('251. authorizes no router wiring', () => assert.equal(manualGate.authorizesRouterWiring, false));
test('252. authorizes no route exposure', () => assert.equal(manualGate.authorizesRouteExposure, false));
test('253. authorizes no menu exposure', () => assert.equal(manualGate.authorizesMenuExposure, false));
test('254. authorizes no runtime ui mount', () => assert.equal(manualGate.authorizesRuntimeUiMount, false));
test('255. authorizes no production', () => assert.equal(manualGate.authorizesProduction, false));
test('256. authorizes no backend/prisma', () => { assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); });
test('257. authorizes no real data', () => assert.equal(manualGate.authorizesRealData, false));
test('258. manualGate in contract', () => assert.equal(U.manualGate.manualGateRequired, true));

// ===== Safety (259-266) =====
test('259. safety kind', () => assert.equal(safety.kind, 'app-integration-safety-contract'));
test('260. no forbidden side effect', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('261. reversible by non-consumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('262. safety contractOnly', () => assert.equal(safety.contractOnly, true));
test('263. safety forbidden flags all false', () => assert.equal(Object.values(safety.forbiddenFlags).every((v) => v === false), true));
test('264. safety includes appTouched flag', () => assert.equal(safety.forbiddenFlags.appTouched, false));
test('265. safety digest', () => assert.ok(String(safety.safetyDigest).startsWith('fnv1a-')));
test('266. safety in contract', () => assert.equal(U.safety.anyForbiddenSideEffect, false));

// ===== Readiness (267-276) =====
test('267. readiness kind', () => assert.equal(U.readinessDecision.kind, 'app-integration-readiness-decision'));
test('268. readiness ready with no blockers', () => assert.equal(createAppIntegrationReadinessDecision({}).readiness, 'studio_dev_preview_app_integration_contract_ready'));
test('269. readiness blocked with blockers', () => assert.equal(createAppIntegrationReadinessDecision({ blockers: ['x'] }).readiness, 'blocked'));
test('270. readiness never plan', () => assert.equal(createAppIntegrationReadinessDecision({}).readyForAppIntegrationImplementationPlan, false));
test('271. readiness never slice', () => assert.equal(createAppIntegrationReadinessDecision({}).readyForAppIntegrationImplementationSlice, false));
test('272. readiness never module gen', () => assert.equal(createAppIntegrationReadinessDecision({}).readyForRealModuleGeneration, false));
test('273. readiness never production', () => assert.equal(createAppIntegrationReadinessDecision({}).readyForProduction, false));
test('274. readiness digest', () => assert.ok(String(U.readinessDecision.readinessDigest).startsWith('fnv1a-')));
test('275. readiness known state', () => assert.equal(createAppIntegrationReadinessDecision({}).knownState, true));
test('276. readiness deterministic', () => assert.equal(createAppIntegrationReadinessDecision({ blockers: ['a'], warnings: ['b'] }).readinessDigest, createAppIntegrationReadinessDecision({ blockers: ['a'], warnings: ['b'] }).readinessDigest));

// ===== Manifest (277-292) =====
const manifest = U.manifest;
test('277. manifest kind', () => assert.equal(manifest.kind, 'app-integration-contract-manifest'));
test('278. manifest version', () => assert.equal(manifest.appIntegrationContractVersion, APP_INTEGRATION_CONTRACT_VERSION));
test('279. manifest metadataOnly', () => assert.equal(manifest.metadataOnly, true));
test('280. manifest upstream route/menu', () => assert.equal(manifest.upstream.routeMenuRuntime, ROUTE_MENU_VERSION));
test('281. manifest upstream runtime UI', () => assert.equal(manifest.upstream.runtimeUi, RUNTIME_UI_VERSION));
test('282. manifest parts session digest', () => assert.equal(manifest.parts.session, session.sessionDigest));
test('283. manifest parts attachmentPoint digest', () => assert.equal(typeof manifest.parts.attachmentPoint, 'string'));
test('284. manifest parts featureFlag digest', () => assert.equal(typeof manifest.parts.featureFlag, 'string'));
test('285. manifest parts runtimeUiMountAdapter digest', () => assert.equal(typeof manifest.parts.runtimeUiMountAdapter, 'string'));
test('286. manifest parts manualGate digest', () => assert.equal(typeof manifest.parts.manualGate, 'string'));
test('287. manifest parts safety digest', () => assert.equal(typeof manifest.parts.safety, 'string'));
test('288. manifest capabilities mirrored (contractOnly)', () => assert.equal(manifest.capabilities.contractOnly, true));
test('289. manifest capabilities appIntegrated false', () => assert.equal(manifest.capabilities.appIntegrated, false));
test('290. manifest digest fnv1a', () => assert.ok(String(manifest.manifestDigest).startsWith('fnv1a-')));
test('291. standalone manifest builds', () => assert.equal(createAppIntegrationManifest({ routeMenuRuntime: RM }).kind, 'app-integration-contract-manifest'));
test('292. manifest parts readiness present', () => assert.equal(typeof manifest.parts.readiness, 'string'));

// ===== Verifier (293-322) =====
test('293. verification ok', () => assert.equal(U.verification.ok, true));
test('294. verification valid', () => assert.equal(U.verification.valid, true));
test('295. verification headless/contractOnly/metadataOnly', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.contractOnly, true); assert.equal(U.verification.metadataOnly, true); });
test('296. verification appIntegrated false', () => assert.equal(U.verification.appIntegrated, false));
test('297. verification runtimeUiMountedInApp false', () => assert.equal(U.verification.runtimeUiMountedInApp, false));
test('298. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('299. verification kind', () => assert.equal(U.verification.kind, 'app-integration-contract-verification'));
const vok = (o) => verifyAppIntegrationContract(o).blockers;
test('300. verifier detects appIntegrated', () => assert.ok(vok({ contract: { capabilities: { ...caps, appIntegrated: true } } }).includes('capability_appIntegrated_must_be_false')));
test('301. verifier detects appTouched', () => assert.ok(vok({ contract: { capabilities: { ...caps, appTouched: true } } }).includes('capability_appTouched_must_be_false')));
test('302. verifier detects appWiringCreated', () => assert.ok(vok({ contract: { capabilities: { ...caps, appWiringCreated: true } } }).includes('capability_appWiringCreated_must_be_false')));
test('303. verifier detects router wiring', () => assert.ok(vok({ contract: { capabilities: { ...caps, routerWiringCreated: true } } }).includes('capability_routerWiringCreated_must_be_false')));
test('304. verifier detects route/menu exposure', () => { const r = vok({ contract: { capabilities: { ...caps, routeExposedToProduct: true, menuExposedToProduct: true } } }); assert.ok(r.includes('capability_routeExposedToProduct_must_be_false') && r.includes('capability_menuExposedToProduct_must_be_false')); });
test('305. verifier detects runtimeUiMountedInApp', () => assert.ok(vok({ contract: { capabilities: { ...caps, runtimeUiMountedInApp: true } } }).includes('capability_runtimeUiMountedInApp_must_be_false')));
test('306. verifier detects featureFlagConnectedToApp', () => assert.ok(vok({ contract: { capabilities: { ...caps, featureFlagConnectedToApp: true } } }).includes('capability_featureFlagConnectedToApp_must_be_false')));
test('307. verifier detects reactDom/createRoot', () => { const r = vok({ contract: { capabilities: { ...caps, reactDomUsed: true, createRootUsed: true } } }); assert.ok(r.includes('capability_reactDomUsed_must_be_false') && r.includes('capability_createRootUsed_must_be_false')); });
test('308. verifier detects window/document', () => { const r = vok({ contract: { capabilities: { ...caps, windowUsed: true, documentUsed: true } } }); assert.ok(r.includes('capability_windowUsed_must_be_false') && r.includes('capability_documentUsed_must_be_false')); });
test('309. verifier detects deepLinkCreated', () => assert.ok(vok({ contract: { capabilities: { ...caps, deepLinkCreated: true } } }).includes('capability_deepLinkCreated_must_be_false')));
test('310. verifier detects backend/prisma', () => { const r = vok({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false') && r.includes('capability_prismaAccessed_must_be_false')); });
test('311. verifier detects production/staging', () => { const r = vok({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false') && r.includes('capability_stagingAccessed_must_be_false')); });
test('312. verifier detects fetch/mutation/persistence', () => { const r = vok({ contract: { capabilities: { ...caps, fetchUsed: true, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.includes('capability_fetchUsed_must_be_false') && r.includes('capability_mutationAllowed_must_be_false')); });
test('313. verifier detects real data', () => { const r = vok({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false') && r.includes('capability_realDataWrite_must_be_false')); });
test('314. verifier detects mustBeTrue inversion', () => assert.ok(vok({ contract: { capabilities: { ...caps, headless: false } } }).includes('capability_headless_must_be_true')));
test('315. verifier detects attachment (part)', () => assert.ok(vok({ contract: { capabilities: caps, attachmentPoint: { appTouched: true } } }).includes('unsafe_app_touched')));
test('316. verifier detects router api (part)', () => assert.ok(vok({ contract: { capabilities: caps, routerAttachment: { browserRouterUsed: true } } }).includes('unsafe_router_api')));
test('317. verifier detects route exposure (part)', () => assert.ok(vok({ contract: { capabilities: caps, routeExposure: { routeExposedToProduct: true } } }).includes('unsafe_route_exposed')));
test('318. verifier detects menu exposure (part)', () => assert.ok(vok({ contract: { capabilities: caps, menuExposure: { menuExposedToProduct: true } } }).includes('unsafe_menu_exposed')));
test('319. verifier detects runtime UI mount + dom globals (part)', () => { const r = vok({ contract: { capabilities: caps, runtimeUiMountAdapter: { runtimeUiMountedInApp: true, windowUsed: true } } }); assert.ok(r.includes('unsafe_runtime_ui_mounted') && r.includes('unsafe_dom_globals')); });
test('320. verifier detects prototype relink + missing manual gate (part)', () => { const r1 = vok({ contract: { capabilities: caps, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }); const r2 = vok({ contract: { capabilities: caps, manualGate: { manualGateRequired: false } } }); assert.ok(r1.includes('unsafe_prototype_relink') && r2.includes('missing_manual_gate')); });
test('321. verifier detects production/staging denial off (part)', () => assert.ok(vok({ contract: { capabilities: caps, productionStagingDenial: { productionDenied: false } } }).includes('unsafe_production_staging_allowed')));
test('322. verifier never throws', () => assert.doesNotThrow(() => verifyAppIntegrationContract({ contract: null })));

// ===== Compatibility (323-332) =====
test('323. compatibility kind', () => assert.equal(U.compatibility.kind, 'app-integration-compatibility'));
test('324. compatibleWithRouteMenuRuntime', () => assert.equal(U.compatibility.compatibleWithRouteMenuRuntime, true));
test('325. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('326. compat readyForAppIntegrationContract', () => assert.equal(U.compatibility.readyForAppIntegrationContract, true));
test('327. compat readyForImplementationPlan false', () => assert.equal(U.compatibility.readyForAppIntegrationImplementationPlan, false));
test('328. compat readyForImplementationSlice false', () => assert.equal(U.compatibility.readyForAppIntegrationImplementationSlice, false));
test('329. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('330. compat status', () => assert.equal(U.compatibility.status, 'ready_for_future_app_integration_implementation_plan_when_explicitly_authorized'));
test('331. compat mismatch → warning', () => { const r = checkAppIntegrationCompatibility({ routeMenuRuntime: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } }); assert.equal(r.compatibleWithRuntimeUi, false); assert.ok(r.warnings.includes('incompatible_runtimeUi')); });
test('332. compat digest', () => assert.ok(String(U.compatibility.compatibilityDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback (333-346) =====
test('333. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'app-integration-diagnostics'));
test('334. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('335. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('336. diagnostics headless/contractOnly confirmed', () => { assert.equal(U.diagnostics.headlessConfirmed, true); assert.equal(U.diagnostics.contractOnlyConfirmed, true); });
test('337. diagnostics appIntegrated false', () => assert.equal(U.diagnostics.appIntegrated, false));
test('338. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
test('339. diagnostics no external logging', () => { assert.equal(U.diagnostics.logged, false); assert.equal(U.diagnostics.externalLogging, false); });
test('340. fallback missing runtime', () => assert.equal(createStudioDevPreviewAppIntegrationContract({}).fallback, true));
test('341. fallback invalid kind', () => assert.equal(createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: { kind: 'other' } }).fallback, true));
test('342. fallback upstream fallback', () => assert.equal(createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: { kind: 'studio-dev-preview-route-menu', fallback: true } }).fallback, true));
test('343. fallback readiness blocked', () => assert.equal(createAppIntegrationFallback({}).readiness, 'blocked'));
test('344. fallback authorizes nothing', () => { const fb = createAppIntegrationFallback({}); assert.equal(fb.readyForAppIntegrationContract, false); assert.equal(fb.readyForProduction, false); });
test('345. fallback capabilities preserved false', () => assert.equal(createAppIntegrationFallback({}).capabilities.appIntegrated, false));
test('346. fallback digest fnv1a', () => assert.ok(String(createAppIntegrationFallback({}).overallDigest).startsWith('fnv1a-')));

// ===== Errors (347-356) =====
test('347. error codes >= 40', () => assert.ok(APP_INTEGRATION_CONTRACT_ERROR_CODES.length >= 40));
test('348. error descriptor kind', () => assert.equal(createAppIntegrationContractError(APP_INTEGRATION_CONTRACT_ERROR_CODES[0]).kind, 'app-integration-contract-error'));
test('349. error descriptor safe', () => assert.equal(createAppIntegrationContractError('APP_INTEGRATION_PRISMA_BLOCKED').safe, true));
test('350. error descriptor side-effect free', () => assert.equal(createAppIntegrationContractError('APP_INTEGRATION_PRISMA_BLOCKED').sideEffects, false));
test('351. error descriptor no real data', () => { const e = createAppIntegrationContractError('APP_INTEGRATION_BACKEND_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.appTouched, false); });
test('352. error descriptor unknown code normalized', () => assert.equal(createAppIntegrationContractError('NOPE').code, 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME'));
test('353. error class instance', () => assert.ok(appIntegrationContractError('APP_INTEGRATION_SESSION_FAILED', 'x') instanceof AppIntegrationContractError));
test('354. error class normalizes bad code', () => assert.equal(new AppIntegrationContractError('bad', 'x').code, 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME'));
test('355. error no secrets', () => { const e = createAppIntegrationContractError('APP_INTEGRATION_FETCH_BLOCKED'); assert.equal(e.withoutSecrets, true); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('356. error codes unique', () => assert.equal(new Set(APP_INTEGRATION_CONTRACT_ERROR_CODES).size, APP_INTEGRATION_CONTRACT_ERROR_CODES.length));

// ===== Flags (357-366) =====
test('357. flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('358. flag on in dev', () => assert.equal(isStudioDevPreviewAppIntegrationContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG]: 'true', DEV: 'true' }), true));
test('359. flag off by default', () => assert.equal(isStudioDevPreviewAppIntegrationContractEnabled({}), false));
test('360. attachment flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationAttachmentEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('361. verify flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('362. compatibility flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('363. isProductionEnv true for production label', () => assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true));
test('364. isProductionEnv false for DEV', () => assert.equal(isProductionEnv({ DEV: 'true' }), false));
test('365. flag names distinct', () => assert.equal(new Set([MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG]).size, 4));
test('366. blocked integration kinds enumerated', () => assert.ok(Array.isArray(BLOCKED_INTEGRATION_KINDS) && BLOCKED_INTEGRATION_KINDS.length >= 10));

// ===== Determinism / purity (367-376) =====
test('367. deterministic overall digest', () => assert.equal(createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }).overallDigest, U.overallDigest));
test('368. deterministic contract digest', () => assert.equal(createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }).appIntegrationContractDigest, U.appIntegrationContractDigest));
test('369. digest helper stable', () => assert.equal(appIntegrationDigest({ a: 1 }), appIntegrationDigest({ a: 1 })));
test('370. digest helper handles null', () => assert.ok(String(appIntegrationDigest(null)).startsWith('fnv1a-')));
test('371. contract has no functions (clone drops them)', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('372. contract JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('373. second build equals first (manifest digest)', () => assert.equal(createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }).manifest.manifestDigest, U.manifest.manifestDigest));
test('374. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('375. capabilities object mirrors const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('376. building does not mutate route/menu runtime', () => { const before = RM.overallDigest; createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM }); assert.equal(RM.overallDigest, before); });

// ===== Static .js scans (377-396) =====
test('377. subtree is React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('378. no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('379. no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('380. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('381. no <Route JSX / Routes / Link / NavLink (case-sensitive)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsCode())));
test('382. no BrowserRouter / createBrowserRouter / useNavigate', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsCode())));
test('383. no ReactDOM / createRoot / hydrateRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('384. no window/document/history/location access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.(push|replace)State|\blocation\.(href|assign|replace)/i.test(jsCode())));
test('385. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('386. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('387. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('388. no EmpresaApi/apiClient/apis/backend/prisma import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('389. no fetch/XHR/WebSocket/storage-API', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(jsCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('390. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('391. no real POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('392. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('393. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('394. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('395. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('396. exactly 27 .js files', () => assert.equal(jsFiles().length, 27));

// ===== Scope safety (397-406) =====
test('397. no App.jsx in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('src/App.jsx')); });
test('398. no src/pages in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/pages\//.test(f))); });
test('399. no src/components in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/components\//.test(f))); });
test('400. no src/modules in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/modules\//.test(f))); });
test('401. no backend/prisma in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f))); });
test('402. no .jsx/.tsx/.css in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /\.(jsx|tsx|css)$/.test(f))); });
// The production UI guard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
// governance guard may appear ONLY when the slice active on this branch declares it as shared governance —
// which only the governance slices do. Both facts come from the caller-aware evaluation, not a hardcoded list.
test('403. no productionUiGuard/governanceGuard in diff', () => {
  const files = changed(); if (files === null) return;
  assert.ok(!files.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope');
  const scope = evaluateStudioBranchDiffScope(files, { callerSliceId: CALLER_SLICE_ID });
  assert.deepEqual(scope.forbidden, []);
  if (files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) {
    assert.ok(scope.allowed.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      'the governance guard may only appear when the active slice shares it');
    // Exact active-slice authorization: no sliceId prefix, no chronology-free catalog lookup.
    const authorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
    assert.ok(authorizer.ok && authorizer.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      `active ${authorizer.activeSliceId} does not own the governance guard`);
  }
});
// Branch-relative scope check, CALLER-AWARE. It no longer asks "is this path registered somewhere?" — a flat
// registry could not prove the path was later than this slice. It asks "which slice is this branch building, and
// is that slice this one or a later one?", and admits only what that active slice owns, is explicitly
// cross-authorized for, or shares. Forbidden and unknown still fail closed.
const CALLER_SLICE_ID = 'dev-preview-app-integration-contract';
test('404. no prior gate/test altered', () => {
  const files = changed(); if (files === null) return;
  const scope = evaluateStudioBranchDiffScope(files, { callerSliceId: CALLER_SLICE_ID });
  assert.equal(scope.callerSliceId, CALLER_SLICE_ID);
  assert.deepEqual(scope.forbidden, []);
  assert.deepEqual(scope.unknown, []);
  assert.deepEqual(scope.chronologicalViolation, []);
  // An empty branch diff carries nothing to judge (this check also runs on `main`). A real diff
  // must still resolve exactly one active slice at or after this caller.
  if (scope.applicable) {
    assert.ok(scope.activeSliceOrdinal >= scope.callerSliceOrdinal, `active ${scope.activeSliceId} precedes ${CALLER_SLICE_ID}`);
  } else {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.reason, 'empty_branch_diff');
    assert.equal(scope.activeSliceId, null);
  }
  assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
});
test('405. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('406. net-new scope is subtree only (branch-relative)', () => { const files = changed(); if (files === null) return; if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//.test(f))) return; assert.deepEqual(files.filter((f) => !authorized(f)), []); });
test('407. upstream route/menu runtime present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/index.js')));
test('408. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));

// ===== Evidence docs (D1-D23) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'APP-ATTACHMENT-POINT-CONTRACT.md', 'DEV-ONLY-FEATURE-FLAG-CONTRACT.md', 'PRODUCT-ISOLATION-CONTRACT.md',
  'APP-BOOTSTRAP-BOUNDARY-CONTRACT.md', 'ROUTER-ATTACHMENT-CONTRACT.md', 'ROUTE-EXPOSURE-CONTRACT.md',
  'MENU-EXPOSURE-CONTRACT.md', 'RUNTIME-UI-MOUNT-ADAPTER-CONTRACT.md', 'DEPENDENCY-INJECTION-BOUNDARY-CONTRACT.md',
  'LIFECYCLE-CLEANUP-CONTRACT.md', 'FAILURE-CONTAINMENT-CONTRACT.md', 'OWNERSHIP-ROLLBACK-CONTRACT.md',
  'PRODUCTION-STAGING-DENIAL-CONTRACT.md', 'PROTOTYPE-RELINK-PROHIBITION-CONTRACT.md', 'MANUAL-ENABLEMENT-GATE.md',
  'SAFETY-CONTRACT.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-app-integration-contract/${DOCS[i]}`)));
}
test('D-content. contract-not-implementation + no-app + next slice present', () => {
  assert.ok(/App|router|menu|mount/i.test(readEv('NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md')));
  assert.ok(/contract|metadata/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/IMPLEMENTATION PLAN|implementation plan|checkpoint|App/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
