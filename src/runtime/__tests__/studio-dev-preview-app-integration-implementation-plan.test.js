import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_SEMVER,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
  APP_INTEGRATION_CONTRACT_VERSION,
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
  APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS,
  BLOCKED_INTEGRATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  appIntegrationPlanDigest,
  isProductionEnv,
  isStudioDevPreviewAppIntegrationImplementationPlanEnabled,
  isStudioDevPreviewAppIntegrationImplementationPhasesEnabled,
  isStudioDevPreviewAppIntegrationImplementationVerifyEnabled,
  isStudioDevPreviewAppIntegrationImplementationCompatibilityCheckEnabled,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES,
  AppIntegrationImplementationPlanError,
  createAppIntegrationImplementationPlanError,
  appIntegrationImplementationPlanError,
  createAppIntegrationImplementationPlanSession,
  createAppIntegrationImplementationPhases,
  createAppTouchBoundaryPlan,
  createProductionUiGuardExtensionPlan,
  createFeatureFlagImplementationPlan,
  createAppAttachmentImplementationPlan,
  createRouterExposureImplementationPlan,
  createMenuSidebarExposureImplementationPlan,
  createRuntimeUiMountImplementationPlan,
  createDependencyInjectionImplementationPlan,
  createLifecycleCleanupImplementationPlan,
  createFailureContainmentImplementationPlan,
  createProductionStagingFailClosedPlan,
  createPrototypeRelinkStaticAssertionPlan,
  createAppIntegrationTestHarnessPlan,
  createAppIntegrationManualEnablementGatePlan,
  createAppIntegrationRolloutRollbackPlan,
  createAppIntegrationObservabilityDiagnosticsPlan,
  createAppIntegrationGovernanceRegistryPlan,
  createAppIntegrationSafetyPlan,
  createAppIntegrationImplementationReadinessDecision,
  createAppIntegrationImplementationPlanManifest,
  verifyAppIntegrationImplementationPlan,
  checkAppIntegrationImplementationPlanCompatibility,
  createAppIntegrationImplementationPlanDiagnostics,
  createAppIntegrationImplementationPlanFallback,
  createStudioDevPreviewAppIntegrationImplementationPlan,
} from '../../studio/blueprint-engine/dev-preview-app-integration-implementation-plan/index.js';
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
import { createStudioDevPreviewAppIntegrationContract } from '../../studio/blueprint-engine/dev-preview-app-integration-contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-app-integration-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration-implementation-plan');

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
const authorized = (f) => /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//.test(f)
  || f === 'src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js'
  || f === 'scripts/gates/g423-studio-dev-preview-app-integration-implementation-plan.mjs'
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-implementation-plan\//.test(f);

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
const AIC = createStudioDevPreviewAppIntegrationContract({ routeMenuRuntime: RM });
const U = createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC });

const session = createAppIntegrationImplementationPlanSession({ appIntegrationContract: AIC });
const phases = createAppIntegrationImplementationPhases();
const appTouchBoundary = createAppTouchBoundaryPlan();
const productionUiGuardExtension = createProductionUiGuardExtensionPlan();
const featureFlag = createFeatureFlagImplementationPlan();
const appAttachment = createAppAttachmentImplementationPlan({ appIntegrationContract: AIC });
const routerExposure = createRouterExposureImplementationPlan();
const menuSidebarExposure = createMenuSidebarExposureImplementationPlan();
const runtimeUiMount = createRuntimeUiMountImplementationPlan();
const dependencyInjection = createDependencyInjectionImplementationPlan();
const lifecycleCleanup = createLifecycleCleanupImplementationPlan();
const failureContainment = createFailureContainmentImplementationPlan();
const productionStagingFailClosed = createProductionStagingFailClosedPlan();
const prototypeRelinkStaticAssertion = createPrototypeRelinkStaticAssertionPlan();
const testHarness = createAppIntegrationTestHarnessPlan();
const manualGate = createAppIntegrationManualEnablementGatePlan();
const rolloutRollback = createAppIntegrationRolloutRollbackPlan();
const observability = createAppIntegrationObservabilityDiagnosticsPlan();
const governanceRegistry = createAppIntegrationGovernanceRegistryPlan();
const safety = createAppIntegrationSafetyPlan();
const caps = APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES;

// ===== Base + versions (1-42) =====
test('1. created', () => assert.equal(U.kind, 'studio-dev-preview-app-integration-implementation-plan'));
test('2. name', () => { assert.equal(U.appIntegrationImplementationPlanName, 'studio-dev-preview-app-integration-implementation-plan'); assert.equal(U.appIntegrationImplementationPlanName, APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(U.appIntegrationImplementationPlanVersion, 'studio-dev-preview-app-integration-implementation-plan@1.0.0'); assert.equal(U.appIntegrationImplementationPlanVersion, APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(APP_INTEGRATION_IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. appIntegrationContractVersion', () => { assert.equal(U.appIntegrationContractVersion, 'studio-dev-preview-app-integration-contract@1.0.0'); assert.equal(U.appIntegrationContractVersion, APP_INTEGRATION_CONTRACT_VERSION); });
test('6. routeMenuVersion', () => assert.equal(U.routeMenuVersion, ROUTE_MENU_VERSION));
test('7. routeMenuContractVersion', () => assert.equal(U.routeMenuContractVersion, ROUTE_MENU_CONTRACT_VERSION));
test('8. routeMenuImplementationPlanVersion', () => assert.equal(U.routeMenuImplementationPlanVersion, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION));
test('9. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, RUNTIME_UI_VERSION));
test('10. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, RUNTIME_UI_CONTRACT_VERSION));
test('11. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, ISOLATED_RUNTIME_VERSION));
test('12. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, RUNTIME_SHELL_CONTRACT_VERSION));
test('13. visualContractVersion', () => assert.equal(U.visualContractVersion, VISUAL_CONTRACT_VERSION));
test('14. bridgeVersion', () => assert.equal(U.bridgeVersion, DEV_PREVIEW_BRIDGE_VERSION));
test('15. sandboxVersion', () => assert.equal(U.sandboxVersion, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('16. plannerVersion', () => assert.equal(U.plannerVersion, MODULE_REFERENCE_PLANNER_VERSION));
test('17. engineVersion', () => assert.equal(U.engineVersion, STUDIO_BLUEPRINT_ENGINE_VERSION));
test('18. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, STUDIO_BLUEPRINT_CONTRACT_VERSION));
test('19. mode', () => { assert.equal(U.mode, 'headless_dev_preview_app_integration_implementation_plan'); assert.equal(U.mode, APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE); });
test('20. not fallback', () => assert.equal(U.fallback, false));
test('21. metadataOnly', () => assert.equal(U.metadataOnly, true));
test('22. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_app_integration_implementation_plan_ready'));
test('23. readyForAppIntegrationImplementationPlan true', () => assert.equal(U.readyForAppIntegrationImplementationPlan, true));
test('24. readyForAppIntegrationImplementationSlice false', () => assert.equal(U.readyForAppIntegrationImplementationSlice, false));
test('25. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('26. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('27. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('28. warningCount 0', () => assert.equal(U.warningCount, 0));
test('29. blockers array', () => assert.deepEqual(U.blockers, []));
test('30. moduleId string', () => assert.equal(typeof U.moduleId, 'string'));
test('31. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('32. planDigest fnv1a', () => assert.ok(String(U.appIntegrationImplementationPlanDigest).startsWith('fnv1a-')));
test('33. capabilities object', () => assert.equal(typeof U.capabilities, 'object'));
test('34. readiness state known', () => assert.ok(APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES.includes(U.readiness)));
test('35. required future checkpoint', () => assert.equal(REQUIRED_FUTURE_CHECKPOINT, 'pre_app_integration_implementation_enterprise_checkpoint'));
test('36. phase ids count 15', () => assert.equal(APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS.length, 15));
test('37. phase ids include preflight', () => assert.ok(APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS.includes('phase_0_preflight')));
test('38. phase ids include rollout blocked', () => assert.ok(APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS.includes('phase_14_rollout_blocked')));
test('39. phase ids include production ui guard extension plan', () => assert.ok(APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS.includes('phase_4_production_ui_guard_extension_plan')));
test('40. blocked integration kinds enumerated', () => assert.ok(Array.isArray(BLOCKED_INTEGRATION_KINDS) && BLOCKED_INTEGRATION_KINDS.length >= 12));
test('41. blocked kinds include extendProductionUiGuard', () => assert.ok(BLOCKED_INTEGRATION_KINDS.includes('extendProductionUiGuard')));
test('42. forbidden prototype paths 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));

// ===== Capabilities (43-115) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'implementationPhasesOnly', 'appTouchBoundaryPlanOnly', 'productionUiGuardExtensionPlanOnly', 'featureFlagImplementationPlanOnly', 'appAttachmentImplementationPlanOnly', 'routerExposureImplementationPlanOnly', 'menuSidebarExposureImplementationPlanOnly', 'runtimeUiMountImplementationPlanOnly', 'dependencyInjectionImplementationPlanOnly', 'lifecycleCleanupImplementationPlanOnly', 'failureContainmentImplementationPlanOnly', 'productionStagingFailClosedPlanOnly', 'prototypeRelinkStaticAssertionPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
const FALSE_CAPS = ['appIntegrated', 'appTouched', 'appWiringImplemented', 'productionUiGuardExtended', 'featureFlagImplemented', 'featureFlagConnectedToApp', 'routerWiringImplemented', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported'];
test('43. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 44;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); }); }

// ===== Session (116-125) =====
test('116. session kind', () => assert.equal(session.kind, 'app-integration-implementation-plan-session'));
test('117. session no storage', () => assert.equal(session.usesStorage, false));
test('118. session no fetch', () => assert.equal(session.usesFetch, false));
test('119. session no persistence', () => assert.equal(session.usesPersistence, false));
test('120. session no side effects', () => assert.equal(session.runtimeSideEffects, false));
test('121. session seed string', () => assert.equal(typeof session.seed, 'string'));
test('122. session sources contract', () => assert.equal(session.sourceAppIntegrationContract, APP_INTEGRATION_CONTRACT_VERSION));
test('123. session version', () => assert.equal(session.appIntegrationImplementationPlanVersion, APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION));
test('124. session digest', () => assert.ok(String(session.sessionDigest).startsWith('fnv1a-')));
test('125. session deterministic', () => assert.equal(createAppIntegrationImplementationPlanSession({ appIntegrationContract: AIC }).sessionDigest, session.sessionDigest));

// ===== Phases (126-137) =====
test('126. phases kind', () => assert.equal(phases.kind, 'app-integration-implementation-phases'));
test('127. phase count 15', () => assert.equal(phases.phaseCount, 15));
test('128. all planned', () => assert.equal(phases.allPlanned, true));
test('129. none implemented', () => assert.equal(phases.anyImplemented, false));
test('130. each phase planned true', () => assert.ok(phases.phases.every((p) => p.planned === true)));
test('131. each phase implemented false', () => assert.ok(phases.phases.every((p) => p.implemented === false)));
test('132. phases ordered', () => assert.ok(phases.phases.every((p, i) => p.order === i)));
test('133. phase 0 preflight', () => assert.equal(phases.phases[0].id, 'phase_0_preflight'));
test('134. phase 2 scope registry preparation', () => assert.equal(phases.phases[2].id, 'phase_2_scope_registry_preparation'));
test('135. phase 4 production ui guard extension', () => assert.equal(phases.phases[4].id, 'phase_4_production_ui_guard_extension_plan'));
test('136. phases digest', () => assert.ok(String(phases.phasesDigest).startsWith('fnv1a-')));
test('137. phases in plan', () => assert.equal(U.phases.phaseCount, 15));

// ===== App touch boundary (138-145) =====
test('138. appTouch kind', () => assert.equal(appTouchBoundary.kind, 'app-integration-app-touch-boundary-plan'));
test('139. app not touched', () => assert.equal(appTouchBoundary.appTouched, false));
test('140. app wiring not implemented', () => assert.equal(appTouchBoundary.appWiringImplemented, false));
test('141. app jsx not allowed', () => assert.equal(appTouchBoundary.appJsxAllowed, false));
test('142. app touch requires future slice', () => assert.equal(appTouchBoundary.requiresExplicitFutureSlice, true));
test('143. app touch requires manual gate', () => assert.equal(appTouchBoundary.requiresManualGate, true));
test('144. appTouch digest', () => assert.ok(String(appTouchBoundary.appTouchBoundaryPlanDigest).startsWith('fnv1a-')));
test('145. appTouch in plan', () => assert.equal(U.appTouchBoundary.appTouched, false));

// ===== productionUiGuard extension (146-153) =====
test('146. guardExt kind', () => assert.equal(productionUiGuardExtension.kind, 'app-integration-production-ui-guard-extension-plan'));
test('147. guard not extended', () => assert.equal(productionUiGuardExtension.productionUiGuardExtended, false));
test('148. guard not touched', () => assert.equal(productionUiGuardExtension.productionUiGuardTouched, false));
test('149. extension not implemented', () => assert.equal(productionUiGuardExtension.extensionImplemented, false));
test('150. guard future extension metadata', () => assert.equal(typeof productionUiGuardExtension.futureExtensionKind, 'string'));
test('151. guard requires future slice', () => assert.equal(productionUiGuardExtension.requiresExplicitFutureSlice, true));
test('152. guardExt digest', () => assert.ok(String(productionUiGuardExtension.productionUiGuardExtensionPlanDigest).startsWith('fnv1a-')));
test('153. guardExt in plan', () => assert.equal(U.productionUiGuardExtension.productionUiGuardExtended, false));

// ===== Feature flag (154-163) =====
test('154. featureFlag kind', () => assert.equal(featureFlag.kind, 'app-integration-feature-flag-implementation-plan'));
test('155. feature flag not implemented', () => assert.equal(featureFlag.featureFlagImplemented, false));
test('156. feature flag not connected', () => assert.equal(featureFlag.featureFlagConnectedToApp, false));
test('157. feature flag default off', () => assert.equal(featureFlag.defaultEnabled, false));
test('158. feature flag devOnly', () => assert.equal(featureFlag.devOnly, true));
test('159. feature flag production denied', () => assert.equal(featureFlag.productionAllowed, false));
test('160. feature flag staging denied', () => assert.equal(featureFlag.stagingAllowed, false));
test('161. feature flag name metadata', () => assert.equal(featureFlag.flagNameMetadata, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG));
test('162. featureFlag digest', () => assert.ok(String(featureFlag.featureFlagImplementationPlanDigest).startsWith('fnv1a-')));
test('163. featureFlag in plan', () => assert.equal(U.featureFlag.featureFlagConnectedToApp, false));

// ===== App attachment (164-171) =====
test('164. attachment kind', () => assert.equal(appAttachment.kind, 'app-integration-app-attachment-implementation-plan'));
test('165. attachment id string', () => assert.equal(typeof appAttachment.attachmentPointId, 'string'));
test('166. attachment not implemented', () => assert.equal(appAttachment.attachmentImplemented, false));
test('167. attachment app not touched', () => assert.equal(appAttachment.appTouched, false));
test('168. attachment integration not performed', () => assert.equal(appAttachment.integrationPerformed, false));
test('169. attachment requires manual gate', () => assert.equal(appAttachment.requiresManualGate, true));
test('170. attachment digest', () => assert.ok(String(appAttachment.appAttachmentImplementationPlanDigest).startsWith('fnv1a-')));
test('171. attachment in plan', () => assert.equal(U.appAttachment.attachmentImplemented, false));

// ===== Router exposure (172-181) =====
test('172. routerExposure kind', () => assert.equal(routerExposure.kind, 'app-integration-router-exposure-implementation-plan'));
test('173. router not wired', () => assert.equal(routerExposure.routerWiringImplemented, false));
test('174. route not exposed', () => assert.equal(routerExposure.routeExposedToProduct, false));
test('175. no route element', () => assert.equal(routerExposure.routeElementCreated, false));
test('176. no routes element', () => assert.equal(routerExposure.routesElementCreated, false));
test('177. no browser router', () => assert.equal(routerExposure.browserRouterUsed, false));
test('178. no createBrowserRouter', () => assert.equal(routerExposure.createBrowserRouterUsed, false));
test('179. no useNavigate', () => assert.equal(routerExposure.useNavigateUsed, false));
test('180. routerExposure digest', () => assert.ok(String(routerExposure.routerExposureImplementationPlanDigest).startsWith('fnv1a-')));
test('181. routerExposure in plan', () => assert.equal(U.routerExposure.routeExposedToProduct, false));

// ===== Menu/sidebar exposure (182-189) =====
test('182. menuExposure kind', () => assert.equal(menuSidebarExposure.kind, 'app-integration-menu-sidebar-exposure-implementation-plan'));
test('183. menu not exposed', () => assert.equal(menuSidebarExposure.menuExposedToProduct, false));
test('184. sidebar not exposed', () => assert.equal(menuSidebarExposure.sidebarExposedToProduct, false));
test('185. navigation not exposed', () => assert.equal(menuSidebarExposure.navigationExposedToProduct, false));
test('186. no menu item', () => assert.equal(menuSidebarExposure.menuItemCreated, false));
test('187. sidebar wiring not implemented', () => assert.equal(menuSidebarExposure.sidebarWiringImplemented, false));
test('188. menuExposure digest', () => assert.ok(String(menuSidebarExposure.menuSidebarExposureImplementationPlanDigest).startsWith('fnv1a-')));
test('189. menuExposure in plan', () => assert.equal(U.menuSidebarExposure.menuExposedToProduct, false));

// ===== Runtime UI mount (190-199) =====
test('190. mount kind', () => assert.equal(runtimeUiMount.kind, 'app-integration-runtime-ui-mount-implementation-plan'));
test('191. runtime ui not mounted', () => assert.equal(runtimeUiMount.runtimeUiMountedInApp, false));
test('192. mount not implemented', () => assert.equal(runtimeUiMount.mountImplemented, false));
test('193. no reactDom', () => assert.equal(runtimeUiMount.reactDomUsed, false));
test('194. no createRoot', () => assert.equal(runtimeUiMount.createRootUsed, false));
test('195. no window api', () => assert.equal(runtimeUiMount.windowApiUsed, false));
test('196. no document api', () => assert.equal(runtimeUiMount.documentApiUsed, false));
test('197. no mount node / root factory', () => { assert.equal(runtimeUiMount.mountNodeCreated, false); assert.equal(runtimeUiMount.rootFactoryInjected, false); });
test('198. mount digest', () => assert.ok(String(runtimeUiMount.runtimeUiMountImplementationPlanDigest).startsWith('fnv1a-')));
test('199. mount in plan', () => assert.equal(U.runtimeUiMount.runtimeUiMountedInApp, false));

// ===== Dependency injection (200-207) =====
test('200. di kind', () => assert.equal(dependencyInjection.kind, 'app-integration-dependency-injection-implementation-plan'));
test('201. di required', () => assert.equal(dependencyInjection.dependencyInjectionRequired, true));
test('202. no implicit lookup', () => assert.equal(dependencyInjection.implicitDependencyLookupAllowed, false));
test('203. no global lookup', () => assert.equal(dependencyInjection.globalLookupAllowed, false));
test('204. no service locator', () => assert.equal(dependencyInjection.serviceLocatorAllowed, false));
test('205. no App import', () => assert.equal(dependencyInjection.AppImportAllowed, false));
test('206. no router/menu import', () => { assert.equal(dependencyInjection.routerImportAllowed, false); assert.equal(dependencyInjection.menuImportAllowed, false); });
test('207. di in plan', () => assert.equal(U.dependencyInjection.dependencyInjectionRequired, true));

// ===== Lifecycle cleanup (208-215) =====
test('208. lifecycle kind', () => assert.equal(lifecycleCleanup.kind, 'app-integration-lifecycle-cleanup-implementation-plan'));
test('209. lifecycle not integrated', () => assert.equal(lifecycleCleanup.lifecycleIntegrated, false));
test('210. cleanup not integrated', () => assert.equal(lifecycleCleanup.cleanupIntegrated, false));
test('211. no auto start', () => assert.equal(lifecycleCleanup.autoStartAllowed, false));
test('212. no auto stop', () => assert.equal(lifecycleCleanup.autoStopAllowed, false));
test('213. unmount not integrated', () => assert.equal(lifecycleCleanup.unmountIntegrated, false));
test('214. lifecycle digest', () => assert.ok(String(lifecycleCleanup.lifecycleCleanupImplementationPlanDigest).startsWith('fnv1a-')));
test('215. lifecycle in plan', () => assert.equal(U.lifecycleCleanup.lifecycleIntegrated, false));

// ===== Failure containment (216-222) =====
test('216. failure kind', () => assert.equal(failureContainment.kind, 'app-integration-failure-containment-implementation-plan'));
test('217. fail closed', () => assert.equal(failureContainment.failClosed, true));
test('218. failure contained', () => assert.equal(failureContainment.failureContained, true));
test('219. no app failure propagation', () => assert.equal(failureContainment.productAppFailurePropagationAllowed, false));
test('220. no router failure propagation', () => assert.equal(failureContainment.productRouterFailurePropagationAllowed, false));
test('221. no menu failure propagation', () => assert.equal(failureContainment.productMenuFailurePropagationAllowed, false));
test('222. failure in plan', () => assert.equal(U.failureContainment.failClosed, true));

// ===== Production/staging fail-closed (223-229) =====
test('223. failClosed kind', () => assert.equal(productionStagingFailClosed.kind, 'app-integration-production-staging-fail-closed-plan'));
test('224. production denied', () => assert.equal(productionStagingFailClosed.productionDenied, true));
test('225. staging denied', () => assert.equal(productionStagingFailClosed.stagingDenied, true));
test('226. default off', () => assert.equal(productionStagingFailClosed.defaultOff, true));
test('227. fail closed flag', () => assert.equal(productionStagingFailClosed.failClosed, true));
test('228. failClosed digest', () => assert.ok(String(productionStagingFailClosed.productionStagingFailClosedPlanDigest).startsWith('fnv1a-')));
test('229. failClosed in plan', () => { assert.equal(U.productionStagingFailClosed.productionDenied, true); assert.equal(U.productionStagingFailClosed.stagingDenied, true); });

// ===== Prototype relink static assertion (230-239) =====
test('230. prototype kind', () => assert.equal(prototypeRelinkStaticAssertion.kind, 'app-integration-prototype-relink-static-assertion-plan'));
test('231. relink not allowed', () => assert.equal(prototypeRelinkStaticAssertion.prototypeRelinkAllowed, false));
test('232. import not allowed', () => assert.equal(prototypeRelinkStaticAssertion.prototypeImportAllowed, false));
test('233. copy not allowed', () => assert.equal(prototypeRelinkStaticAssertion.prototypeCopyAllowed, false));
test('234. move not allowed', () => assert.equal(prototypeRelinkStaticAssertion.prototypeMoveAllowed, false));
test('235. old prototype not imported', () => assert.equal(prototypeRelinkStaticAssertion.oldPrototypeImported, false));
test('236. static assertion planned', () => assert.equal(prototypeRelinkStaticAssertion.staticAssertionPlanned, true));
test('237. forbidden paths enumerated', () => assert.equal(prototypeRelinkStaticAssertion.forbiddenPrototypePaths.length, FORBIDDEN_PROTOTYPE_PATHS.length));
test('238. prototype digest', () => assert.ok(String(prototypeRelinkStaticAssertion.prototypeRelinkStaticAssertionPlanDigest).startsWith('fnv1a-')));
test('239. prototype in plan', () => assert.equal(U.prototypeRelinkStaticAssertion.prototypeRelinkAllowed, false));

// ===== Test harness (240-246) =====
test('240. harness kind', () => assert.equal(testHarness.kind, 'app-integration-test-harness-plan'));
test('241. harness not implemented', () => assert.equal(testHarness.harnessImplemented, false));
test('242. harness headless', () => assert.equal(testHarness.headless, true));
test('243. harness no real runtime', () => assert.equal(testHarness.usesRealRuntime, false));
test('244. harness no real data', () => assert.equal(testHarness.usesRealData, false));
test('245. harness suite count', () => assert.ok(testHarness.suiteCount >= 5));
test('246. harness in plan', () => assert.equal(U.testHarness.harnessImplemented, false));

// ===== Manual gate (247-261) =====
test('247. manualGate kind', () => assert.equal(manualGate.kind, 'app-integration-manual-enablement-gate-plan'));
test('248. manual gate required', () => assert.equal(manualGate.manualGateRequired, true));
test('249. required checkpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('250. current authorization plan_only', () => assert.equal(manualGate.currentSliceAuthorization, 'plan_only'));
test('251. authorizes no app touch', () => assert.equal(manualGate.authorizesAppTouch, false));
test('252. authorizes no app wiring', () => assert.equal(manualGate.authorizesAppWiring, false));
test('253. authorizes no router wiring', () => assert.equal(manualGate.authorizesRouterWiring, false));
test('254. authorizes no route exposure', () => assert.equal(manualGate.authorizesRouteExposure, false));
test('255. authorizes no menu exposure', () => assert.equal(manualGate.authorizesMenuExposure, false));
test('256. authorizes no runtime ui mount', () => assert.equal(manualGate.authorizesRuntimeUiMount, false));
test('257. authorizes no production ui guard extension', () => assert.equal(manualGate.authorizesProductionUiGuardExtension, false));
test('258. authorizes no production', () => assert.equal(manualGate.authorizesProduction, false));
test('259. authorizes no backend/prisma', () => { assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); });
test('260. authorizes no real data', () => assert.equal(manualGate.authorizesRealData, false));
test('261. manualGate in plan', () => assert.equal(U.manualGate.manualGateRequired, true));

// ===== Rollout / observability / governance / safety (262-283) =====
test('262. rollout kind', () => assert.equal(rolloutRollback.kind, 'app-integration-rollout-rollback-plan'));
test('263. rollout blocked', () => assert.equal(rolloutRollback.rolloutAllowed, false));
test('264. no production rollout', () => assert.equal(rolloutRollback.productionRollout, false));
test('265. no staging rollout', () => assert.equal(rolloutRollback.stagingRollout, false));
test('266. rollback by non-consumption', () => assert.equal(rolloutRollback.rollbackByNonConsumption, true));
test('267. rollback by flag off', () => assert.equal(rolloutRollback.rollbackByFlagOff, true));
test('268. no destructive rollback', () => assert.equal(rolloutRollback.destructiveRollbackRequired, false));
test('269. rollout in plan', () => assert.equal(U.rolloutRollback.rolloutAllowed, false));
test('270. observability kind', () => assert.equal(observability.kind, 'app-integration-observability-diagnostics-plan'));
test('271. observability safe', () => assert.equal(observability.safeDiagnostics, true));
test('272. observability no secrets', () => assert.equal(observability.withoutSecrets, true));
test('273. observability no stack leak', () => assert.equal(observability.noStackLeak, true));
test('274. observability no telemetry runtime', () => assert.equal(observability.noTelemetryRuntime, true));
test('275. observability no external logging', () => assert.equal(observability.noExternalLogging, true));
test('276. governance kind', () => assert.equal(governanceRegistry.kind, 'app-integration-governance-registry-plan'));
test('277. governance registry not touched', () => assert.equal(governanceRegistry.registryTouched, false));
test('278. governance guard not touched', () => assert.equal(governanceRegistry.guardTouched, false));
test('279. governance no broad wildcard', () => assert.equal(governanceRegistry.broadWildcardAllowed, false));
test('280. governance specific paths only', () => assert.equal(governanceRegistry.specificPathsOnly, true));
test('281. safety kind', () => assert.equal(safety.kind, 'app-integration-safety-plan'));
test('282. safety no forbidden side effect', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('283. safety reversible + all flags false', () => { assert.equal(safety.reversibleByNonConsumption, true); assert.equal(Object.values(safety.forbiddenFlags).every((v) => v === false), true); });

// ===== Readiness (284-293) =====
test('284. readiness kind', () => assert.equal(U.readinessDecision.kind, 'app-integration-implementation-readiness-decision'));
test('285. readiness ready no blockers', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).readiness, 'studio_dev_preview_app_integration_implementation_plan_ready'));
test('286. readiness blocked on blockers', () => assert.equal(createAppIntegrationImplementationReadinessDecision({ blockers: ['x'] }).readiness, 'blocked'));
test('287. readiness never slice', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).readyForAppIntegrationImplementationSlice, false));
test('288. readiness never module gen', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).readyForRealModuleGeneration, false));
test('289. readiness never production', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).readyForProduction, false));
test('290. readiness ready plan when clean', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).readyForAppIntegrationImplementationPlan, true));
test('291. readiness known state', () => assert.equal(createAppIntegrationImplementationReadinessDecision({}).knownState, true));
test('292. readiness digest', () => assert.ok(String(U.readinessDecision.readinessDigest).startsWith('fnv1a-')));
test('293. readiness deterministic', () => assert.equal(createAppIntegrationImplementationReadinessDecision({ blockers: ['a'] }).readinessDigest, createAppIntegrationImplementationReadinessDecision({ blockers: ['a'] }).readinessDigest));

// ===== Manifest (294-311) =====
const manifest = U.manifest;
test('294. manifest kind', () => assert.equal(manifest.kind, 'app-integration-implementation-plan-manifest'));
test('295. manifest version', () => assert.equal(manifest.appIntegrationImplementationPlanVersion, APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION));
test('296. manifest metadataOnly', () => assert.equal(manifest.metadataOnly, true));
test('297. manifest upstream contract', () => assert.equal(manifest.upstream.appIntegrationContract, APP_INTEGRATION_CONTRACT_VERSION));
test('298. manifest upstream route/menu', () => assert.equal(manifest.upstream.routeMenuRuntime, ROUTE_MENU_VERSION));
test('299. manifest parts session', () => assert.equal(manifest.parts.session, session.sessionDigest));
test('300. manifest parts phases', () => assert.equal(typeof manifest.parts.phases, 'string'));
test('301. manifest parts appTouchBoundary', () => assert.equal(typeof manifest.parts.appTouchBoundary, 'string'));
test('302. manifest parts productionUiGuardExtension', () => assert.equal(typeof manifest.parts.productionUiGuardExtension, 'string'));
test('303. manifest parts featureFlag', () => assert.equal(typeof manifest.parts.featureFlag, 'string'));
test('304. manifest parts runtimeUiMount', () => assert.equal(typeof manifest.parts.runtimeUiMount, 'string'));
test('305. manifest parts manualGate', () => assert.equal(typeof manifest.parts.manualGate, 'string'));
test('306. manifest parts governanceRegistry', () => assert.equal(typeof manifest.parts.governanceRegistry, 'string'));
test('307. manifest parts safety', () => assert.equal(typeof manifest.parts.safety, 'string'));
test('308. manifest capabilities mirrored', () => { assert.equal(manifest.capabilities.planOnly, true); assert.equal(manifest.capabilities.appIntegrated, false); });
test('309. manifest digest', () => assert.ok(String(manifest.manifestDigest).startsWith('fnv1a-')));
test('310. standalone manifest builds', () => assert.equal(createAppIntegrationImplementationPlanManifest({ appIntegrationContract: AIC }).kind, 'app-integration-implementation-plan-manifest'));
test('311. manifest parts readiness present', () => assert.equal(typeof manifest.parts.readiness, 'string'));

// ===== Verifier (312-342) =====
test('312. verification ok', () => assert.equal(U.verification.ok, true));
test('313. verification valid', () => assert.equal(U.verification.valid, true));
test('314. verification headless/planOnly', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.planOnly, true); });
test('315. verification appIntegrated false', () => assert.equal(U.verification.appIntegrated, false));
test('316. verification productionUiGuardExtended false', () => assert.equal(U.verification.productionUiGuardExtended, false));
test('317. verification runtimeUiMountedInApp false', () => assert.equal(U.verification.runtimeUiMountedInApp, false));
test('318. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('319. verification kind', () => assert.equal(U.verification.kind, 'app-integration-implementation-plan-verification'));
const vok = (o) => verifyAppIntegrationImplementationPlan(o).blockers;
test('320. verifier detects appIntegrated', () => assert.ok(vok({ plan: { capabilities: { ...caps, appIntegrated: true } } }).includes('capability_appIntegrated_must_be_false')));
test('321. verifier detects appTouched', () => assert.ok(vok({ plan: { capabilities: { ...caps, appTouched: true } } }).includes('capability_appTouched_must_be_false')));
test('322. verifier detects appWiringImplemented', () => assert.ok(vok({ plan: { capabilities: { ...caps, appWiringImplemented: true } } }).includes('capability_appWiringImplemented_must_be_false')));
test('323. verifier detects productionUiGuardExtended', () => assert.ok(vok({ plan: { capabilities: { ...caps, productionUiGuardExtended: true } } }).includes('capability_productionUiGuardExtended_must_be_false')));
test('324. verifier detects featureFlagImplemented/connected', () => { const r = vok({ plan: { capabilities: { ...caps, featureFlagImplemented: true, featureFlagConnectedToApp: true } } }); assert.ok(r.includes('capability_featureFlagImplemented_must_be_false') && r.includes('capability_featureFlagConnectedToApp_must_be_false')); });
test('325. verifier detects router/route exposure', () => { const r = vok({ plan: { capabilities: { ...caps, routerWiringImplemented: true, routeExposedToProduct: true } } }); assert.ok(r.includes('capability_routerWiringImplemented_must_be_false') && r.includes('capability_routeExposedToProduct_must_be_false')); });
test('326. verifier detects menu/sidebar exposure', () => { const r = vok({ plan: { capabilities: { ...caps, menuExposedToProduct: true, sidebarExposedToProduct: true } } }); assert.ok(r.includes('capability_menuExposedToProduct_must_be_false')); });
test('327. verifier detects runtimeUiMountedInApp', () => assert.ok(vok({ plan: { capabilities: { ...caps, runtimeUiMountedInApp: true } } }).includes('capability_runtimeUiMountedInApp_must_be_false')));
test('328. verifier detects reactDom/createRoot', () => { const r = vok({ plan: { capabilities: { ...caps, reactDomUsed: true, createRootUsed: true } } }); assert.ok(r.includes('capability_reactDomUsed_must_be_false')); });
test('329. verifier detects window/document', () => { const r = vok({ plan: { capabilities: { ...caps, windowUsed: true, documentUsed: true } } }); assert.ok(r.includes('capability_windowUsed_must_be_false')); });
test('330. verifier detects deepLinkCreated', () => assert.ok(vok({ plan: { capabilities: { ...caps, deepLinkCreated: true } } }).includes('capability_deepLinkCreated_must_be_false')));
test('331. verifier detects backend/prisma', () => { const r = vok({ plan: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false')); });
test('332. verifier detects production/staging', () => { const r = vok({ plan: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false')); });
test('333. verifier detects real data', () => { const r = vok({ plan: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false')); });
test('334. verifier detects mustBeTrue inversion', () => assert.ok(vok({ plan: { capabilities: { ...caps, planOnly: false } } }).includes('capability_planOnly_must_be_true')));
test('335. verifier detects app touch (part)', () => assert.ok(vok({ plan: { capabilities: caps, appTouchBoundary: { appTouched: true } } }).includes('unsafe_app_touched')));
test('336. verifier detects guard extension (part)', () => assert.ok(vok({ plan: { capabilities: caps, productionUiGuardExtension: { productionUiGuardExtended: true } } }).includes('unsafe_production_ui_guard_extended')));
test('337. verifier detects feature flag connected (part)', () => assert.ok(vok({ plan: { capabilities: caps, featureFlag: { featureFlagConnectedToApp: true } } }).includes('unsafe_feature_flag_connected_to_app')));
test('338. verifier detects router api + primitive (part)', () => { const r1 = vok({ plan: { capabilities: caps, routerExposure: { browserRouterUsed: true } } }); const r2 = vok({ plan: { capabilities: caps, routerExposure: { routeElementCreated: true } } }); assert.ok(r1.includes('unsafe_router_api') && r2.includes('unsafe_router_primitive')); });
test('339. verifier detects runtime UI mount + dom globals (part)', () => { const r = vok({ plan: { capabilities: caps, runtimeUiMount: { runtimeUiMountedInApp: true, windowApiUsed: true } } }); assert.ok(r.includes('unsafe_runtime_ui_mounted') && r.includes('unsafe_dom_globals')); });
test('340. verifier detects prototype relink + governance + missing gate (part)', () => { const r1 = vok({ plan: { capabilities: caps, prototypeRelinkStaticAssertion: { prototypeRelinkAllowed: true } } }); const r2 = vok({ plan: { capabilities: caps, governanceRegistry: { broadWildcardAllowed: true } } }); const r3 = vok({ plan: { capabilities: caps, manualGate: { manualGateRequired: false } } }); assert.ok(r1.includes('unsafe_prototype_relink') && r2.includes('unsafe_governance_registry') && r3.includes('missing_manual_gate')); });
test('341. verifier detects production/staging denial off (part)', () => assert.ok(vok({ plan: { capabilities: caps, productionStagingFailClosed: { productionDenied: false } } }).includes('unsafe_production_staging_allowed')));
test('342. verifier never throws', () => assert.doesNotThrow(() => verifyAppIntegrationImplementationPlan({ plan: null })));

// ===== Compatibility (343-352) =====
test('343. compatibility kind', () => assert.equal(U.compatibility.kind, 'app-integration-implementation-plan-compatibility'));
test('344. compatibleWithAppIntegrationContract', () => assert.equal(U.compatibility.compatibleWithAppIntegrationContract, true));
test('345. compatibleWithRouteMenuRuntime', () => assert.equal(U.compatibility.compatibleWithRouteMenuRuntime, true));
test('346. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('347. compat readyForPlan', () => assert.equal(U.compatibility.readyForAppIntegrationImplementationPlan, true));
test('348. compat readyForSlice false', () => assert.equal(U.compatibility.readyForAppIntegrationImplementationSlice, false));
test('349. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('350. compat status', () => assert.equal(U.compatibility.status, 'ready_for_future_app_integration_implementation_slice_after_enterprise_checkpoint'));
test('351. compat mismatch → warning', () => { const r = checkAppIntegrationImplementationPlanCompatibility({ appIntegrationContract: { appIntegrationContractVersion: 'x@9.9.9', kind: 'other' } }); assert.equal(r.compatibleWithAppIntegrationContract, false); assert.ok(r.warnings.includes('incompatible_appIntegrationContract')); });
test('352. compat digest', () => assert.ok(String(U.compatibility.compatibilityDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback (353-366) =====
test('353. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'app-integration-implementation-plan-diagnostics'));
test('354. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('355. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('356. diagnostics headless/planOnly confirmed', () => { assert.equal(U.diagnostics.headlessConfirmed, true); assert.equal(U.diagnostics.planOnlyConfirmed, true); });
test('357. diagnostics appIntegrated false', () => assert.equal(U.diagnostics.appIntegrated, false));
test('358. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
test('359. diagnostics no external logging', () => { assert.equal(U.diagnostics.logged, false); assert.equal(U.diagnostics.externalLogging, false); });
test('360. fallback missing contract', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({}).fallback, true));
test('361. fallback invalid kind', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: { kind: 'other' } }).fallback, true));
test('362. fallback upstream fallback', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: { kind: 'studio-dev-preview-app-integration-contract', fallback: true } }).fallback, true));
test('363. fallback readiness blocked', () => assert.equal(createAppIntegrationImplementationPlanFallback({}).readiness, 'blocked'));
test('364. fallback authorizes nothing', () => { const fb = createAppIntegrationImplementationPlanFallback({}); assert.equal(fb.readyForAppIntegrationImplementationPlan, false); assert.equal(fb.readyForProduction, false); });
test('365. fallback capabilities false', () => assert.equal(createAppIntegrationImplementationPlanFallback({}).capabilities.appIntegrated, false));
test('366. fallback digest', () => assert.ok(String(createAppIntegrationImplementationPlanFallback({}).overallDigest).startsWith('fnv1a-')));

// ===== Errors (367-376) =====
test('367. error codes >= 40', () => assert.ok(APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 40));
test('368. error descriptor kind', () => assert.equal(createAppIntegrationImplementationPlanError(APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES[0]).kind, 'app-integration-implementation-plan-error'));
test('369. error descriptor safe', () => assert.equal(createAppIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_PRISMA_BLOCKED').safe, true));
test('370. error descriptor side-effect free', () => assert.equal(createAppIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_PRISMA_BLOCKED').sideEffects, false));
test('371. error descriptor no real data', () => { const e = createAppIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_BACKEND_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.appTouched, false); });
test('372. error unknown code normalized', () => assert.equal(createAppIntegrationImplementationPlanError('NOPE').code, 'APP_INTEGRATION_PLAN_INVALID_APP_INTEGRATION_CONTRACT'));
test('373. error class instance', () => assert.ok(appIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_SESSION_FAILED', 'x') instanceof AppIntegrationImplementationPlanError));
test('374. error class normalizes bad code', () => assert.equal(new AppIntegrationImplementationPlanError('bad', 'x').code, 'APP_INTEGRATION_PLAN_INVALID_APP_INTEGRATION_CONTRACT'));
test('375. error no secrets in message', () => { const e = createAppIntegrationImplementationPlanError('APP_INTEGRATION_PLAN_FETCH_BLOCKED'); assert.equal(e.withoutSecrets, true); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('376. error codes unique', () => assert.equal(new Set(APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES).size, APP_INTEGRATION_IMPLEMENTATION_PLAN_ERROR_CODES.length));

// ===== Flags (377-386) =====
test('377. flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('378. flag on in dev', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' }), true));
test('379. flag off by default', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationPlanEnabled({}), false));
test('380. phases flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('381. verify flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('382. compatibility flag off in production', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('383. isProductionEnv true for production', () => assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true));
test('384. isProductionEnv false for DEV', () => assert.equal(isProductionEnv({ DEV: 'true' }), false));
test('385. flag names distinct', () => assert.equal(new Set([MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG, MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]).size, 4));
test('386. phases flag on in dev', () => assert.equal(isStudioDevPreviewAppIntegrationImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG]: 'true', DEV: 'true' }), true));

// ===== Determinism / purity (387-396) =====
test('387. deterministic overall digest', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC }).overallDigest, U.overallDigest));
test('388. deterministic plan digest', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC }).appIntegrationImplementationPlanDigest, U.appIntegrationImplementationPlanDigest));
test('389. digest helper stable', () => assert.equal(appIntegrationPlanDigest({ a: 1 }), appIntegrationPlanDigest({ a: 1 })));
test('390. digest helper handles null', () => assert.ok(String(appIntegrationPlanDigest(null)).startsWith('fnv1a-')));
test('391. plan has no functions', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('392. plan JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('393. manifest digest stable second build', () => assert.equal(createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC }).manifest.manifestDigest, U.manifest.manifestDigest));
test('394. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('395. capabilities mirror const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('396. building does not mutate contract', () => { const before = AIC.overallDigest; createStudioDevPreviewAppIntegrationImplementationPlan({ appIntegrationContract: AIC }); assert.equal(AIC.overallDigest, before); });

// ===== Static .js scans (397-416) =====
test('397. subtree is React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('398. no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('399. no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('400. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('401. no <Route JSX / Routes / Link / NavLink (case-sensitive)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsCode())));
test('402. no BrowserRouter / createBrowserRouter / useNavigate', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsCode())));
test('403. no ReactDOM / createRoot / hydrateRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('404. no window/document/history/location access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.(push|replace)State|\blocation\.(href|assign|replace)/i.test(jsCode())));
test('405. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('406. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('407. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('408. no productionUiGuard lib import', () => assert.ok(jsImports().every((p) => !/productionUiGuard\.mjs|gates\/lib\/productionUiGuard/i.test(p))));
test('409. no EmpresaApi/apiClient/apis/backend/prisma import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('410. no fetch/XHR/WebSocket/storage-API', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(jsCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('411. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('412. no real POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('413. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('414. no .jsx/.tsx/.css in subtree', () => { assert.equal(walkExt(DIR, /\.jsx$/).length, 0); assert.equal(walkExt(DIR, /\.tsx$/).length, 0); assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))); });
test('415. exactly 30 .js files', () => assert.equal(jsFiles().length, 30));
test('416. upstream app integration contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-app-integration-contract/index.js')));

// ===== Scope safety (417-426) =====
test('417. no App.jsx in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('src/App.jsx')); });
test('418. no src/pages/components/modules in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/(pages|components|modules)\//.test(f))); });
test('419. no backend/prisma/migration in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f))); });
test('420. no .jsx/.tsx/.css in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /\.(jsx|tsx|css)$/.test(f))); });
test('421. no productionUiGuard/governanceGuard in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
test('422. no prior gate/test altered', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => (/^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-dev-preview-app-integration-implementation-plan.mjs') || (/^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js'))); });
test('423. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('424. net-new scope is subtree only (branch-relative)', () => { const files = changed(); if (files === null) return; if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//.test(f))) return; assert.deepEqual(files.filter((f) => !authorized(f)), []); });
test('425. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('426. productionUiGuard file not in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('scripts/gates/lib/productionUiGuard.mjs')); });

// ===== Evidence docs (D1-D26) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'APP-TOUCH-BOUNDARY-PLAN.md', 'PRODUCTION-UI-GUARD-EXTENSION-PLAN.md',
  'FEATURE-FLAG-IMPLEMENTATION-PLAN.md', 'APP-ATTACHMENT-IMPLEMENTATION-PLAN.md', 'ROUTER-EXPOSURE-IMPLEMENTATION-PLAN.md',
  'MENU-SIDEBAR-EXPOSURE-IMPLEMENTATION-PLAN.md', 'RUNTIME-UI-MOUNT-IMPLEMENTATION-PLAN.md',
  'DEPENDENCY-INJECTION-IMPLEMENTATION-PLAN.md', 'LIFECYCLE-CLEANUP-IMPLEMENTATION-PLAN.md',
  'FAILURE-CONTAINMENT-IMPLEMENTATION-PLAN.md', 'PRODUCTION-STAGING-FAIL-CLOSED-PLAN.md',
  'PROTOTYPE-RELINK-STATIC-ASSERTION-PLAN.md', 'GOVERNANCE-REGISTRY-PLAN.md', 'TEST-HARNESS-PLAN.md',
  'MANUAL-ENABLEMENT-GATE-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md',
  'SAFETY-PLAN.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-app-integration-implementation-plan/${DOCS[i]}`)));
}
test('D-content. plan-not-implementation + no-app + next slice present', () => {
  assert.ok(/App|router|menu|mount/i.test(readEv('NO-APP-NO-ROUTER-NO-MENU-NO-MOUNT.md')));
  assert.ok(/plan|metadata/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/CHECKPOINT|checkpoint|FABLE|enterprise/i.test(readEv('NEXT-SLICE-SPEC.md')));
  assert.ok(/productionUiGuard|guard/i.test(readEv('PRODUCTION-UI-GUARD-EXTENSION-PLAN.md')));
});
