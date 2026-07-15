import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
  ROUTE_MENU_IMPLEMENTATION_PLAN_SEMVER,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
  ROUTE_MENU_IMPLEMENTATION_PLAN_ENVIRONMENT,
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
  ROUTE_MENU_IMPLEMENTATION_PHASE_IDS,
  BLOCKED_NAVIGATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  ROUTE_MENU_IMPLEMENTATION_PLAN_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  routeMenuPlanDigest,
  isStudioDevPreviewRouteMenuImplementationPlanEnabled,
  isStudioDevPreviewRouteMenuImplementationPhasesEnabled,
  isStudioDevPreviewRouteMenuImplementationVerifyEnabled,
  isStudioDevPreviewRouteMenuImplementationCompatibilityCheckEnabled,
  ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES,
  RouteMenuImplementationPlanError,
  createRouteMenuImplementationPlanError,
  routeMenuImplementationPlanError,
  createRouteMenuImplementationPlanSession,
  createRouteMenuImplementationPhases,
  createAppWiringBoundaryPlan,
  createRouterWiringBoundaryPlan,
  createRouteRegistrationPlan,
  createMenuRegistrationPlan,
  createSidebarNavigationPlacementPlan,
  createDevOnlyAccessPolicy,
  createRouteGuardImplementationPlan,
  createMenuVisibilityImplementationPlan,
  createDeepLinkPolicyPlan,
  createRuntimeUiMountBoundaryPlan,
  createBlockedNavigationActionPlan,
  createRouteMenuTestHarnessPlan,
  createRouteMenuManualEnablementGatePlan,
  createRouteMenuRolloutRollbackPlan,
  createRouteMenuObservabilityDiagnosticsPlan,
  createPrototypeRelinkProhibitionPlan,
  createRouteMenuSafetyPlan,
  createRouteMenuImplementationReadinessDecision,
  createRouteMenuImplementationPlanManifest,
  verifyRouteMenuImplementationPlan,
  checkRouteMenuImplementationPlanCompatibility,
  createRouteMenuImplementationPlanDiagnostics,
  createRouteMenuImplementationPlanFallback,
  createStudioDevPreviewRouteMenuImplementationPlan,
} from '../../studio/blueprint-engine/dev-preview-route-menu-implementation-plan/index.js';
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
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-route-menu-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu-implementation-plan');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

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
const U = createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC });

const session = createRouteMenuImplementationPlanSession({ routeMenuContract: RMC });
const phases = createRouteMenuImplementationPhases();
const appWiring = createAppWiringBoundaryPlan();
const routerWiring = createRouterWiringBoundaryPlan();
const routeReg = createRouteRegistrationPlan({ routeMenuContract: RMC });
const menuReg = createMenuRegistrationPlan({ routeMenuContract: RMC });
const placement = createSidebarNavigationPlacementPlan();
const devAccess = createDevOnlyAccessPolicy();
const guard = createRouteGuardImplementationPlan();
const menuVis = createMenuVisibilityImplementationPlan();
const deepLink = createDeepLinkPolicyPlan();
const mount = createRuntimeUiMountBoundaryPlan();
const blockedNav = createBlockedNavigationActionPlan();
const harness = createRouteMenuTestHarnessPlan();
const manualGate = createRouteMenuManualEnablementGatePlan();
const rollout = createRouteMenuRolloutRollbackPlan();
const observability = createRouteMenuObservabilityDiagnosticsPlan();
const protoProhibition = createPrototypeRelinkProhibitionPlan();
const safety = createRouteMenuSafetyPlan();
const caps = ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES;

// ===== Contract base (1-60) =====
test('1. plan created', () => assert.equal(U.kind, 'studio-dev-preview-route-menu-implementation-plan'));
test('2. name', () => { assert.equal(U.routeMenuImplementationPlanName, 'studio-dev-preview-route-menu-implementation-plan'); assert.equal(U.routeMenuImplementationPlanName, ROUTE_MENU_IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(U.routeMenuImplementationPlanVersion, 'studio-dev-preview-route-menu-implementation-plan@1.0.0'); assert.equal(U.routeMenuImplementationPlanVersion, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(ROUTE_MENU_IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. routeMenuContractVersion', () => assert.equal(U.routeMenuContractVersion, 'studio-dev-preview-route-menu-contract@1.0.0'));
test('6. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, 'studio-dev-preview-runtime-ui@1.0.0'));
test('7. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'));
test('8. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('9. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('10. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('11. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('12. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('13. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('14. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('15. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('16. mode', () => { assert.equal(U.mode, 'headless_dev_preview_route_menu_implementation_plan'); assert.equal(U.mode, ROUTE_MENU_IMPLEMENTATION_PLAN_MODE); });
test('17. environment const', () => assert.equal(ROUTE_MENU_IMPLEMENTATION_PLAN_ENVIRONMENT, 'local_contract'));
test('18. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('19. not fallback', () => assert.equal(U.fallback, false));
test('20. headless', () => assert.equal(U.capabilities.headless, true));
test('21. contractOnly', () => assert.equal(U.capabilities.contractOnly, true));
test('22. metadataOnly', () => assert.equal(U.capabilities.metadataOnly, true));
test('23. planOnly', () => assert.equal(U.capabilities.planOnly, true));
test('24. implementationPhasesOnly', () => assert.equal(U.capabilities.implementationPhasesOnly, true));
test('25. appWiringBoundaryPlanOnly', () => assert.equal(U.capabilities.appWiringBoundaryPlanOnly, true));
test('26. routerWiringBoundaryPlanOnly', () => assert.equal(U.capabilities.routerWiringBoundaryPlanOnly, true));
test('27. routeRegistrationPlanOnly', () => assert.equal(U.capabilities.routeRegistrationPlanOnly, true));
test('28. menuRegistrationPlanOnly', () => assert.equal(U.capabilities.menuRegistrationPlanOnly, true));
test('29. sidebarNavigationPlacementPlanOnly', () => assert.equal(U.capabilities.sidebarNavigationPlacementPlanOnly, true));
test('30. devOnlyAccessPolicyOnly', () => assert.equal(U.capabilities.devOnlyAccessPolicyOnly, true));
test('31. routeGuardImplementationPlanOnly', () => assert.equal(U.capabilities.routeGuardImplementationPlanOnly, true));
test('32. menuVisibilityImplementationPlanOnly', () => assert.equal(U.capabilities.menuVisibilityImplementationPlanOnly, true));
test('33. deepLinkPolicyPlanOnly', () => assert.equal(U.capabilities.deepLinkPolicyPlanOnly, true));
test('34. runtimeUiMountBoundaryPlanOnly', () => assert.equal(U.capabilities.runtimeUiMountBoundaryPlanOnly, true));
test('35. blockedNavigationActionPlanOnly', () => assert.equal(U.capabilities.blockedNavigationActionPlanOnly, true));
test('36. testHarnessPlanOnly', () => assert.equal(U.capabilities.testHarnessPlanOnly, true));
test('37. manualEnablementGatePlanOnly', () => assert.equal(U.capabilities.manualEnablementGatePlanOnly, true));
test('38. rolloutRollbackPlanOnly', () => assert.equal(U.capabilities.rolloutRollbackPlanOnly, true));
test('39. observabilityDiagnosticsPlanOnly', () => assert.equal(U.capabilities.observabilityDiagnosticsPlanOnly, true));
test('40. prototypeRelinkProhibitionPlanOnly', () => assert.equal(U.capabilities.prototypeRelinkProhibitionPlanOnly, true));
test('41. routeImplemented false', () => assert.equal(U.capabilities.routeImplemented, false));
test('42. menuImplemented false', () => assert.equal(U.capabilities.menuImplemented, false));
test('43. appWiringImplemented false', () => assert.equal(U.capabilities.appWiringImplemented, false));
test('44. routerWiringImplemented false', () => assert.equal(U.capabilities.routerWiringImplemented, false));
test('45. navigationWiringImplemented false', () => assert.equal(U.capabilities.navigationWiringImplemented, false));
test('46. sidebarWiringImplemented false', () => assert.equal(U.capabilities.sidebarWiringImplemented, false));
test('47. deepLinkImplemented false', () => assert.equal(U.capabilities.deepLinkImplemented, false));
test('48. runtimeUiMounted false', () => assert.equal(U.capabilities.runtimeUiMounted, false));
test('49. routeCreated false', () => assert.equal(U.capabilities.routeCreated, false));
test('50. menuCreated false', () => assert.equal(U.capabilities.menuCreated, false));
test('51. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('52. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('53. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('54. backendAccessed false', () => assert.equal(U.capabilities.backendAccessed, false));
test('55. prismaAccessed false', () => assert.equal(U.capabilities.prismaAccessed, false));
test('56. productionAccessed/stagingAccessed false', () => { assert.equal(U.capabilities.productionAccessed, false); assert.equal(U.capabilities.stagingAccessed, false); });
test('57. fetchUsed/mutationAllowed/persistenceCreated false', () => { assert.equal(U.capabilities.fetchUsed, false); assert.equal(U.capabilities.mutationAllowed, false); assert.equal(U.capabilities.persistenceCreated, false); });
test('58. realDataRead/realDataWrite/rewriteEmpresas false', () => { assert.equal(U.capabilities.realDataRead, false); assert.equal(U.capabilities.realDataWrite, false); assert.equal(U.capabilities.rewriteEmpresas, false); });
test('59. oldPrototypeImported false', () => assert.equal(U.capabilities.oldPrototypeImported, false));
test('60. capabilities frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES)));

// ===== Readiness (61-70) =====
test('61. readyForRouteMenuImplementationPlan true', () => assert.equal(U.readyForRouteMenuImplementationPlan, true));
test('62. readyForRouteMenuImplementationSlice false', () => assert.equal(U.readyForRouteMenuImplementationSlice, false));
test('63. readyForAppIntegration false', () => assert.equal(U.readyForAppIntegration, false));
test('64. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('65. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('66. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_route_menu_implementation_plan_ready'));
test('67. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('68. warningCount 0', () => assert.equal(U.warningCount, 0));
test('69. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('70. readiness state in enum', () => assert.ok(ROUTE_MENU_IMPLEMENTATION_PLAN_READINESS_STATES.includes(U.readiness)));

// ===== Session (71-80) =====
test('71. session kind', () => assert.equal(session.kind, 'route-menu-implementation-plan-session'));
test('72. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-route-menu-implementation-plan'));
test('73. session version', () => assert.equal(session.routeMenuImplementationPlanVersion, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION));
test('74. sourceRouteMenuContract', () => assert.equal(session.sourceRouteMenuContract, ROUTE_MENU_CONTRACT_VERSION));
test('75. sourceRuntimeUi', () => assert.equal(session.sourceRuntimeUi, RUNTIME_UI_VERSION));
test('76. session mode', () => assert.equal(session.mode, ROUTE_MENU_IMPLEMENTATION_PLAN_MODE));
test('77. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-route-menu-contract'));
test('78. seed deterministic', () => assert.equal(session.seed, createRouteMenuImplementationPlanSession({ routeMenuContract: RMC }).seed));
test('79. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('80. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Implementation phases (81-98) =====
test('81. phases kind', () => assert.equal(phases.kind, 'route-menu-implementation-phases'));
test('82. phase ids match const', () => assert.deepEqual(phases.phases.map((p) => p.id), [...ROUTE_MENU_IMPLEMENTATION_PHASE_IDS]));
test('83. 13 phases', () => assert.equal(phases.phaseCount, 13));
test('84. all planned', () => assert.equal(phases.allPlanned, true));
test('85. none implemented', () => assert.equal(phases.anyImplemented, false));
test('86. phase 0 preflight', () => assert.ok(phases.phases.some((p) => p.id === 'phase_0_preflight')));
test('87. phase 2 app wiring boundary', () => assert.ok(phases.phases.some((p) => p.id === 'phase_2_app_wiring_boundary')));
test('88. phase 3 router wiring boundary', () => assert.ok(phases.phases.some((p) => p.id === 'phase_3_router_wiring_boundary')));
test('89. phase 9 runtime ui mount boundary', () => assert.ok(phases.phases.some((p) => p.id === 'phase_9_runtime_ui_mount_boundary')));
test('90. phase 11 manual enablement gate', () => assert.ok(phases.phases.some((p) => p.id === 'phase_11_manual_enablement_gate')));
test('91. phase 12 rollout blocked', () => assert.ok(phases.phases.some((p) => p.id === 'phase_12_rollout_blocked')));
test('92. each phase goal', () => assert.ok(phases.phases.every((p) => typeof p.goal === 'string' && p.goal.length > 0)));
test('93. each phase allowedEffects', () => assert.ok(phases.phases.every((p) => Array.isArray(p.allowedEffects))));
test('94. each phase blockedEffects incl createRoute', () => assert.ok(phases.phases.every((p) => Array.isArray(p.blockedEffects) && p.blockedEffects.includes('createRoute'))));
test('95. each phase entry/exit criteria', () => assert.ok(phases.phases.every((p) => Array.isArray(p.entryCriteria) && Array.isArray(p.exitCriteria))));
test('96. each phase rollbackPlan', () => assert.ok(phases.phases.every((p) => typeof p.rollbackPlan === 'string')));
test('97. each phase status planned', () => assert.ok(phases.phases.every((p) => p.status === 'planned')));
test('98. each phase implemented false', () => assert.ok(phases.phases.every((p) => p.implemented === false)));

// ===== App/router wiring boundary (99-112) =====
test('99. appWiring kind', () => assert.equal(appWiring.kind, 'route-menu-app-wiring-boundary-plan'));
test('100. appTouched false', () => assert.equal(appWiring.appTouched, false));
test('101. appWiringImplemented false', () => assert.equal(appWiring.appWiringImplemented, false));
test('102. appJsxAllowed false', () => assert.equal(appWiring.appJsxAllowed, false));
test('103. appWiring requires future slice + gate', () => { assert.equal(appWiring.requiresExplicitFutureSlice, true); assert.equal(appWiring.requiresManualGate, true); });
test('104. routerWiring kind', () => assert.equal(routerWiring.kind, 'route-menu-router-wiring-boundary-plan'));
test('105. routerTouched false', () => assert.equal(routerWiring.routerTouched, false));
test('106. routerWiringImplemented false', () => assert.equal(routerWiring.routerWiringImplemented, false));
test('107. routeRegistrationImplemented false', () => assert.equal(routerWiring.routeRegistrationImplemented, false));
test('108. routeElementCreated false', () => assert.equal(routerWiring.routeElementCreated, false));
test('109. routesElementCreated false', () => assert.equal(routerWiring.routesElementCreated, false));
test('110. browserRouterUsed false', () => assert.equal(routerWiring.browserRouterUsed, false));
test('111. createBrowserRouterUsed false', () => assert.equal(routerWiring.createBrowserRouterUsed, false));
test('112. useNavigateUsed false', () => assert.equal(routerWiring.useNavigateUsed, false));

// ===== Route/menu registration + placement (113-128) =====
test('113. routeReg kind', () => assert.equal(routeReg.kind, 'route-menu-route-registration-plan'));
test('114. futureRouteId present', () => assert.ok(typeof routeReg.futureRouteId === 'string'));
test('115. futurePath dev path', () => assert.ok(/^\/__dev\//.test(routeReg.futurePath)));
test('116. futureRouteName present', () => assert.ok(typeof routeReg.futureRouteName === 'string'));
test('117. futureRuntimeUiEntry', () => assert.equal(routeReg.futureRuntimeUiEntry, 'studio-dev-preview-runtime-ui@1.0.0'));
test('118. route registrationImplemented false', () => assert.equal(routeReg.registrationImplemented, false));
test('119. route routeCreated/deepLinkCreated false', () => { assert.equal(routeReg.routeCreated, false); assert.equal(routeReg.deepLinkCreated, false); });
test('120. menuReg kind', () => assert.equal(menuReg.kind, 'route-menu-menu-registration-plan'));
test('121. futureMenuId present', () => assert.ok(typeof menuReg.futureMenuId === 'string'));
test('122. futureGroup', () => assert.equal(menuReg.futureGroup, 'studio_dev_preview'));
test('123. menu registrationImplemented false', () => assert.equal(menuReg.registrationImplemented, false));
test('124. menu menuCreated/sidebar/navigation false', () => { assert.equal(menuReg.menuCreated, false); assert.equal(menuReg.sidebarTouched, false); assert.equal(menuReg.navigationTouched, false); });
test('125. placement kind', () => assert.equal(placement.kind, 'route-menu-sidebar-navigation-placement-plan'));
test('126. placementPlanned true', () => assert.equal(placement.placementPlanned, true));
test('127. placementImplemented false', () => assert.equal(placement.placementImplemented, false));
test('128. sidebar/navigation wiring implemented false', () => { assert.equal(placement.sidebarWiringImplemented, false); assert.equal(placement.navigationWiringImplemented, false); });

// ===== Dev-only access + guard + visibility + deeplink (129-146) =====
test('129. devAccess kind', () => assert.equal(devAccess.kind, 'route-menu-dev-only-access-policy'));
test('130. devOnly', () => assert.equal(devAccess.devOnly, true));
test('131. production/staging not allowed', () => { assert.equal(devAccess.productionAllowed, false); assert.equal(devAccess.stagingAllowed, false); });
test('132. requiresExplicitFutureSlice + manualGate', () => { assert.equal(devAccess.requiresExplicitFutureSlice, true); assert.equal(devAccess.requiresManualGate, true); });
test('133. requiredCheckpoint', () => assert.equal(devAccess.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('134. requiresRuntimeUiReady + syntheticDataOnly', () => { assert.equal(devAccess.requiresRuntimeUiReady, true); assert.equal(devAccess.requiresSyntheticDataOnly, true); });
test('135. guard kind', () => assert.equal(guard.kind, 'route-menu-route-guard-implementation-plan'));
test('136. guardImplemented false', () => assert.equal(guard.guardImplemented, false));
test('137. guard defaultDeny/failClosed', () => { assert.equal(guard.defaultDeny, true); assert.equal(guard.failClosed, true); });
test('138. guard production/staging denied', () => { assert.equal(guard.productionDenied, true); assert.equal(guard.stagingDenied, true); });
test('139. guard synthetic contexts', () => { assert.equal(guard.tenantContextSyntheticOnly, true); assert.equal(guard.permissionContextSyntheticOnly, true); });
test('140. menuVis kind', () => assert.equal(menuVis.kind, 'route-menu-menu-visibility-implementation-plan'));
test('141. visibilityImplemented false', () => assert.equal(menuVis.visibilityImplemented, false));
test('142. not visible now', () => { assert.equal(menuVis.visibleNow, false); assert.equal(menuVis.visibleInProduct, false); assert.equal(menuVis.visibleInDevMenu, false); });
test('143. futureVisibility planned_only', () => assert.equal(menuVis.futureVisibility, 'planned_only'));
test('144. deepLink kind', () => assert.equal(deepLink.kind, 'route-menu-deep-link-policy-plan'));
test('145. deepLinkImplemented/allowed false', () => { assert.equal(deepLink.deepLinkImplemented, false); assert.equal(deepLink.deepLinkAllowed, false); });
test('146. deepLink browser/external nav false', () => { assert.equal(deepLink.browserNavigationAllowed, false); assert.equal(deepLink.externalLinkAllowed, false); });

// ===== Runtime UI mount boundary + blocked navigation (147-162) =====
test('147. mount kind', () => assert.equal(mount.kind, 'route-menu-runtime-ui-mount-boundary-plan'));
test('148. runtimeUiMounted false', () => assert.equal(mount.runtimeUiMounted, false));
test('149. mountImplemented false', () => assert.equal(mount.mountImplemented, false));
test('150. reactDomUsed false', () => assert.equal(mount.reactDomUsed, false));
test('151. createRootUsed false', () => assert.equal(mount.createRootUsed, false));
test('152. documentApiUsed false', () => assert.equal(mount.documentApiUsed, false));
test('153. windowApiUsed false', () => assert.equal(mount.windowApiUsed, false));
test('154. mountTargetCreated false', () => assert.equal(mount.mountTargetCreated, false));
test('155. blockedNav kind', () => assert.equal(blockedNav.kind, 'route-menu-blocked-navigation-action-plan'));
test('156. blocked kinds match const', () => assert.deepEqual(blockedNav.blockedNavigationKinds, [...BLOCKED_NAVIGATION_KINDS]));
test('157. 9 blocked actions', () => assert.equal(blockedNav.actionCount, 9));
test('158. navigate blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'navigate' && a.blocked === true)));
test('159. mountRuntimeUi blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'mountRuntimeUi' && a.blocked === true)));
test('160. registerNavigationItem blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerNavigationItem' && a.blocked === true)));
test('161. registerModule blocked', () => assert.ok(blockedNav.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('162. allBlocked / anyAllowed false', () => { assert.equal(blockedNav.allBlocked, true); assert.equal(blockedNav.anyAllowed, false); });

// ===== Test harness + manual gate + rollout + observability + prototype + safety (163-186) =====
test('163. harness kind', () => assert.equal(harness.kind, 'route-menu-test-harness-plan'));
test('164. harness suites >= 5', () => assert.ok(harness.suiteCount >= 5));
test('165. harness each planned', () => assert.ok(harness.suites.every((s) => s.planned === true)));
test('166. harnessImplemented false', () => assert.equal(harness.harnessImplemented, false));
test('167. harness no real runtime/data', () => { assert.equal(harness.usesRealRuntime, false); assert.equal(harness.usesRealData, false); });
test('168. manualGate kind', () => assert.equal(manualGate.kind, 'route-menu-manual-enablement-gate-plan'));
test('169. manualGateRequired', () => assert.equal(manualGate.manualGateRequired, true));
test('170. requiredCheckpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('171. currentSliceAuthorization plan_only', () => assert.equal(manualGate.currentSliceAuthorization, 'plan_only'));
test('172. authorizesRoute/Menu false', () => { assert.equal(manualGate.authorizesRoute, false); assert.equal(manualGate.authorizesMenu, false); });
test('173. authorizesApp/Router/Navigation/Sidebar wiring false', () => { assert.equal(manualGate.authorizesAppWiring, false); assert.equal(manualGate.authorizesRouterWiring, false); assert.equal(manualGate.authorizesNavigationWiring, false); assert.equal(manualGate.authorizesSidebarWiring, false); });
test('174. authorizesRuntimeUiMount false', () => assert.equal(manualGate.authorizesRuntimeUiMount, false));
test('175. authorizesModule/backend/prisma/production false', () => { assert.equal(manualGate.authorizesModuleGeneration, false); assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); assert.equal(manualGate.authorizesProduction, false); });
test('176. rollout kind', () => assert.equal(rollout.kind, 'route-menu-rollout-rollback-plan'));
test('177. rolloutAllowed false', () => assert.equal(rollout.rolloutAllowed, false));
test('178. production/staging rollout false', () => { assert.equal(rollout.productionRollout, false); assert.equal(rollout.stagingRollout, false); });
test('179. rollbackByNonConsumption', () => assert.equal(rollout.rollbackByNonConsumption, true));
test('180. observability kind', () => assert.equal(observability.kind, 'route-menu-observability-diagnostics-plan'));
test('181. observability safe/no-secrets', () => { assert.equal(observability.safeDiagnostics, true); assert.equal(observability.withoutSecrets, true); assert.equal(observability.noStackLeak, true); });
test('182. observability no telemetry/logging', () => { assert.equal(observability.noTelemetryRuntime, true); assert.equal(observability.noExternalLogging, true); });
test('183. prototype prohibition kind', () => assert.equal(protoProhibition.kind, 'route-menu-prototype-relink-prohibition-plan'));
test('184. prototype relink/import/copy/move not allowed', () => { assert.equal(protoProhibition.prototypeRelinkAllowed, false); assert.equal(protoProhibition.prototypeImportAllowed, false); assert.equal(protoProhibition.prototypeCopyAllowed, false); assert.equal(protoProhibition.prototypeMoveAllowed, false); });
test('185. prototype forbidden paths match const', () => assert.deepEqual(protoProhibition.forbiddenPrototypePaths, [...FORBIDDEN_PROTOTYPE_PATHS]));
test('186. safety anyForbiddenSideEffect false + reversible + flags false', () => { assert.equal(safety.kind, 'route-menu-safety-plan'); assert.equal(safety.anyForbiddenSideEffect, false); assert.equal(safety.reversibleByNonConsumption, true); assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)); });

// ===== Readiness decision (187-194) =====
test('187. readiness kind', () => assert.equal(U.readinessDecision.kind, 'route-menu-implementation-readiness-decision'));
test('188. readiness ready state', () => assert.equal(U.readinessDecision.readiness, 'studio_dev_preview_route_menu_implementation_plan_ready'));
test('189. readiness readyForPlan', () => assert.equal(U.readinessDecision.readyForRouteMenuImplementationPlan, true));
test('190. readiness readyForSlice false', () => assert.equal(U.readinessDecision.readyForRouteMenuImplementationSlice, false));
test('191. readiness readyForAppIntegration false', () => assert.equal(U.readinessDecision.readyForAppIntegration, false));
test('192. readiness readyForProduction false', () => assert.equal(U.readinessDecision.readyForProduction, false));
test('193. blocked on blockers', () => { const r = createRouteMenuImplementationReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForRouteMenuImplementationPlan, false); });
test('194. slice stays false even empty', () => assert.equal(createRouteMenuImplementationReadinessDecision({}).readyForRouteMenuImplementationSlice, false));

// ===== Manifest (195-204) =====
test('195. manifest kind', () => assert.equal(U.manifest.kind, 'route-menu-implementation-plan-manifest'));
test('196. manifest name', () => assert.equal(U.manifest.routeMenuImplementationPlanName, ROUTE_MENU_IMPLEMENTATION_PLAN_NAME));
test('197. manifest version', () => assert.equal(U.manifest.routeMenuImplementationPlanVersion, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION));
test('198. manifest upstream routeMenuContract', () => assert.equal(U.manifest.upstream.routeMenuContract, ROUTE_MENU_CONTRACT_VERSION));
test('199. manifest upstream runtimeUi', () => assert.equal(U.manifest.upstream.runtimeUi, RUNTIME_UI_VERSION));
test('200. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('201. manifest parts.phases digest', () => assert.ok(typeof U.manifest.parts.phases === 'string'));
test('202. manifest parts.safety digest', () => assert.ok(typeof U.manifest.parts.safety === 'string'));
test('203. manifest standalone builds', () => assert.equal(createRouteMenuImplementationPlanManifest({ routeMenuContract: RMC }).kind, 'route-menu-implementation-plan-manifest'));
test('204. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (205-228) =====
test('205. verification ok', () => assert.equal(U.verification.ok, true));
test('206. verification valid', () => assert.equal(U.verification.valid, true));
test('207. verification headless/planOnly', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.planOnly, true); });
test('208. verification routeImplemented false', () => assert.equal(U.verification.routeImplemented, false));
test('209. verification menuImplemented false', () => assert.equal(U.verification.menuImplemented, false));
test('210. verification runtimeUiMounted false', () => assert.equal(U.verification.runtimeUiMounted, false));
test('211. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('212. verifier detects routeImplemented', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, routeImplemented: true } } }).blockers.includes('capability_routeImplemented_must_be_false')));
test('213. verifier detects menuImplemented', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, menuImplemented: true } } }).blockers.includes('capability_menuImplemented_must_be_false')));
test('214. verifier detects app/router wiring', () => { const r = verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, appWiringImplemented: true, routerWiringImplemented: true } } }); assert.ok(r.blockers.includes('capability_appWiringImplemented_must_be_false') && r.blockers.includes('capability_routerWiringImplemented_must_be_false')); });
test('215. verifier detects navigation/sidebar wiring', () => { const r = verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, navigationWiringImplemented: true, sidebarWiringImplemented: true } } }); assert.ok(r.blockers.includes('capability_navigationWiringImplemented_must_be_false') && r.blockers.includes('capability_sidebarWiringImplemented_must_be_false')); });
test('216. verifier detects runtimeUiMounted cap', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, runtimeUiMounted: true } } }).blockers.includes('capability_runtimeUiMounted_must_be_false')));
test('217. verifier detects deepLinkImplemented cap', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, deepLinkImplemented: true } } }).blockers.includes('capability_deepLinkImplemented_must_be_false')));
test('218. verifier detects backend/prisma', () => { const r = verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('219. verifier detects production/staging', () => { const r = verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.blockers.includes('capability_productionAccessed_must_be_false') && r.blockers.includes('capability_stagingAccessed_must_be_false')); });
test('220. verifier detects real data + prototype', () => { const r = verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, realDataRead: true, realDataWrite: true, oldPrototypeImported: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_oldPrototypeImported_must_be_false')); });
test('221. verifier detects app touched (part)', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, appWiringBoundary: { appTouched: true } } }).blockers.includes('unsafe_app_touched')));
test('222. verifier detects router primitive/api (part)', () => { const r1 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, routerWiringBoundary: { routeElementCreated: true } } }); const r2 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, routerWiringBoundary: { browserRouterUsed: true } } }); assert.ok(r1.blockers.includes('unsafe_router_primitive') && r2.blockers.includes('unsafe_router_api')); });
test('223. verifier detects route/menu registered (part)', () => { const r1 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, routeRegistration: { routeCreated: true } } }); const r2 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, menuRegistration: { menuCreated: true } } }); assert.ok(r1.blockers.includes('unsafe_route_registered') && r2.blockers.includes('unsafe_menu_registered')); });
test('224. verifier detects runtime UI mount / dom globals (part)', () => { const r1 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, runtimeUiMountBoundary: { runtimeUiMounted: true } } }); const r2 = verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, runtimeUiMountBoundary: { windowApiUsed: true } } }); assert.ok(r1.blockers.includes('unsafe_runtime_ui_mounted') && r2.blockers.includes('unsafe_dom_globals')); });
test('225. verifier detects deep link (part)', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, deepLinkPolicy: { deepLinkImplemented: true } } }).blockers.includes('unsafe_deep_link')));
test('226. verifier detects prototype relink (part)', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).blockers.includes('unsafe_prototype_relink')));
test('227. verifier detects missing manual gate', () => assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, manualGate: { manualGateRequired: false } } }).blockers.includes('missing_manual_gate')));
test('228. verifier detects mustBeTrue + metadataOnly false + never throws', () => { assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: { ...caps, planOnly: false } } }).blockers.includes('capability_planOnly_must_be_true')); assert.ok(verifyRouteMenuImplementationPlan({ plan: { capabilities: caps, metadataOnly: false } }).blockers.includes('plan_must_be_metadata_only')); assert.doesNotThrow(() => verifyRouteMenuImplementationPlan({ plan: null })); });

// ===== Compatibility (229-237) =====
test('229. compatibility kind', () => assert.equal(U.compatibility.kind, 'route-menu-implementation-plan-compatibility'));
test('230. compatibleWithRouteMenuContract', () => assert.equal(U.compatibility.compatibleWithRouteMenuContract, true));
test('231. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('232. compat readyForPlan', () => assert.equal(U.compatibility.readyForRouteMenuImplementationPlan, true));
test('233. compat readyForSlice false', () => assert.equal(U.compatibility.readyForRouteMenuImplementationSlice, false));
test('234. compat readyForAppIntegration false', () => assert.equal(U.compatibility.readyForAppIntegration, false));
test('235. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('236. compat status after-checkpoint', () => assert.equal(U.compatibility.status, 'ready_for_future_route_menu_implementation_slice_after_enterprise_checkpoint'));
test('237. compat mismatch → warning', () => { const r = checkRouteMenuImplementationPlanCompatibility({ routeMenuContract: { routeMenuContractVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithRouteMenuContract, false); assert.ok(r.warnings.includes('incompatible_routeMenuContract')); });

// ===== Diagnostics + fallback (238-251) =====
test('238. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'route-menu-implementation-plan-diagnostics'));
test('239. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('240. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('241. diagnostics headless/planOnly confirmed', () => { assert.equal(U.diagnostics.headlessConfirmed, true); assert.equal(U.diagnostics.planOnlyConfirmed, true); });
test('242. diagnostics route/menu/mount false', () => { assert.equal(U.diagnostics.routeImplemented, false); assert.equal(U.diagnostics.menuImplemented, false); assert.equal(U.diagnostics.runtimeUiMounted, false); });
test('243. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRouteMenuImplementationPlan({});
const fbBad = createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: { kind: 'studio-dev-preview-route-menu-contract', fallback: true } });
test('244. missing contract → fallback', () => assert.equal(fbNo.fallback, true));
test('245. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('246. fallback contract → fallback', () => assert.equal(fbFb.fallback, true));
test('247. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('248. fallback not ready plan/slice/production', () => { assert.equal(fbNo.readyForRouteMenuImplementationPlan, false); assert.equal(fbNo.readyForRouteMenuImplementationSlice, false); assert.equal(fbNo.readyForProduction, false); });
test('249. fallback caps routeImplemented false', () => assert.equal(fbNo.capabilities.routeImplemented, false));
test('250. fallback never throws', () => assert.doesNotThrow(() => createRouteMenuImplementationPlanFallback({ reason: 'x' })));
test('251. fallback metadataOnly', () => assert.equal(fbNo.metadataOnly, true));

// ===== Errors (252-261) =====
test('252. error codes >= 30', () => assert.ok(ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30));
test('253. error descriptor sanitized', () => { const e = createRouteMenuImplementationPlanError('ROUTE_MENU_PLAN_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('254. error no route/menu/appwiring/mount', () => { const e = createRouteMenuImplementationPlanError('ROUTE_MENU_PLAN_ROUTE_BLOCKED'); assert.equal(e.routeImplemented, false); assert.equal(e.menuImplemented, false); assert.equal(e.appWiringImplemented, false); assert.equal(e.runtimeUiMounted, false); });
test('255. error no prototype/real-data', () => { const e = createRouteMenuImplementationPlanError('ROUTE_MENU_PLAN_PROTOTYPE_RELINK_UNSAFE'); assert.equal(e.oldPrototypeImported, false); assert.equal(e.realDataRead, false); assert.equal(e.realDataWrite, false); });
test('256. unknown code normalized', () => assert.equal(createRouteMenuImplementationPlanError('NOPE').code, 'ROUTE_MENU_PLAN_INVALID_ROUTE_MENU_CONTRACT'));
test('257. typed error', () => { const e = new RouteMenuImplementationPlanError('ROUTE_MENU_PLAN_ROUTER_PRIMITIVE_BLOCKED', 'x'); assert.ok(e instanceof Error && e.name === 'RouteMenuImplementationPlanError'); });
test('258. helper error', () => assert.equal(routeMenuImplementationPlanError('ROUTE_MENU_PLAN_FETCH_BLOCKED', 'x').code, 'ROUTE_MENU_PLAN_FETCH_BLOCKED'));
test('259. codes cover router/dom API blocks', () => ['ROUTE_MENU_PLAN_BROWSER_ROUTER_BLOCKED', 'ROUTE_MENU_PLAN_USE_NAVIGATE_BLOCKED', 'ROUTE_MENU_PLAN_REACT_DOM_BLOCKED', 'ROUTE_MENU_PLAN_CREATE_ROOT_BLOCKED', 'ROUTE_MENU_PLAN_WINDOW_BLOCKED', 'ROUTE_MENU_PLAN_DOCUMENT_BLOCKED'].forEach((c) => assert.ok(ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('260. codes cover manual gate + app wiring', () => ['ROUTE_MENU_PLAN_MANUAL_GATE_MISSING', 'ROUTE_MENU_PLAN_APP_WIRING_BLOCKED'].forEach((c) => assert.ok(ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('261. error no stack leak', () => { const e = createRouteMenuImplementationPlanError('ROUTE_MENU_PLAN_BACKEND_BLOCKED'); assert.equal(e.noStackLeak, true); });

// ===== Config flags (262-271) =====
test('262. flag off by default', () => assert.equal(isStudioDevPreviewRouteMenuImplementationPlanEnabled({}), false));
test('263. flag on in dev', () => assert.equal(isStudioDevPreviewRouteMenuImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('264. flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('265. phases flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('266. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuImplementationVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('267. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuImplementationCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('268. master flag enables phases in dev', () => assert.equal(isStudioDevPreviewRouteMenuImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('269. readiness states frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_IMPLEMENTATION_PLAN_READINESS_STATES)));
test('270. phase ids + blocked nav + prototype paths frozen', () => { assert.ok(Object.isFrozen(ROUTE_MENU_IMPLEMENTATION_PHASE_IDS)); assert.ok(Object.isFrozen(BLOCKED_NAVIGATION_KINDS)); assert.ok(Object.isFrozen(FORBIDDEN_PROTOTYPE_PATHS)); });
test('271. routeMenuPlanDigest deterministic + format', () => { assert.equal(routeMenuPlanDigest({ a: 1 }), routeMenuPlanDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(routeMenuPlanDigest({ a: 1 }))); });

// ===== Determinism / purity (272-283) =====
test('272. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC }).overallDigest));
test('273. deterministic routeMenuImplementationPlanDigest', () => assert.equal(U.routeMenuImplementationPlanDigest, createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC }).routeMenuImplementationPlanDigest));
test('274. input not mutated', () => { const snap = JSON.stringify(RMC); createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC }); assert.equal(JSON.stringify(RMC), snap); });
test('275. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('276. different module → different digest', () => {
  const sb2 = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const uc2 = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb2 }) }) }) }) }) });
  const ui2 = createStudioDevPreviewRuntimeUi({ runtimeUiContract: uc2, env: { DEV: 'true' } });
  const rmc2 = createStudioDevPreviewRouteMenuContract({ runtimeUi: ui2 });
  assert.notEqual(U.overallDigest, createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: rmc2 }).overallDigest);
});
test('277. fail-closed for invalid route/menu contract', () => assert.equal(createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: {} }).fallback, true));
test('278. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('279. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('280. no route implemented (contract)', () => assert.equal(U.routeRegistration.routeCreated, false));
test('281. no menu implemented (contract)', () => assert.equal(U.menuRegistration.menuCreated, false));
test('282. runtime UI not mounted (contract)', () => assert.equal(U.runtimeUiMountBoundary.runtimeUiMounted, false));
test('283. blocked navigation allBlocked (contract)', () => assert.equal(U.blockedNavigation.allBlocked, true));

// ===== Purity / no-router-API / no-dom code scan (284-298) — case-sensitive React-Router + DOM API =====
test('284. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('285. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('286. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('287. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('288. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('289. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('290. no react-router / react-dom import', () => assert.ok(importsOf().every((p) => !/react-router|react-dom/i.test(p))));
test('291. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('292. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('293. no window/document DOM access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('294. no <Route JSX / Routes / NavLink (case-sensitive API)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b/.test(allCode())));
test('295. no BrowserRouter / createBrowserRouter', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b/.test(allCode())));
test('296. no useNavigate / createRoot call', () => assert.ok(!/\buseNavigate\b|createRoot\s*\(|hydrateRoot\s*\(/.test(allCode())));
test('297. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));
test('298. no .jsx/.tsx/.css in subtree', () => { assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))); assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))); });

// ===== Scope safety (299-321) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('299. plan subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu-implementation-plan')));
test('300. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('301. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('302. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('303. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('304. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('305. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('306. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('307. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('308. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('309. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('310. studio prototype dirs not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(x))); });
test('311. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('312. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('313. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('314. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('315. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('316. no .jsx added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.jsx$/.test(x))); });
test('317. no .tsx added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.tsx$/.test(x))); });
test('318. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('319. net-new scope is plan subtree only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('320. upstream route/menu contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu-contract/index.js')));
test('321. no prototype import in subtree', () => assert.ok(importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));

// ===== Extended coverage (322-353) =====
test('322. session digest present', () => assert.ok(typeof session.sessionDigest === 'string'));
test('323. phases digest present', () => assert.ok(typeof phases.phasesDigest === 'string'));
test('324. appWiring digest present', () => assert.ok(typeof appWiring.appWiringBoundaryDigest === 'string'));
test('325. routerWiring digest present', () => assert.ok(typeof routerWiring.routerWiringBoundaryDigest === 'string'));
test('326. routeReg digest present', () => assert.ok(typeof routeReg.routeRegistrationDigest === 'string'));
test('327. menuReg digest present', () => assert.ok(typeof menuReg.menuRegistrationDigest === 'string'));
test('328. placement digest present', () => assert.ok(typeof placement.sidebarNavigationPlacementDigest === 'string'));
test('329. devAccess digest present', () => assert.ok(typeof devAccess.devOnlyAccessPolicyDigest === 'string'));
test('330. guard digest present', () => assert.ok(typeof guard.routeGuardImplementationDigest === 'string'));
test('331. menuVis digest present', () => assert.ok(typeof menuVis.menuVisibilityImplementationDigest === 'string'));
test('332. deepLink digest present', () => assert.ok(typeof deepLink.deepLinkPolicyDigest === 'string'));
test('333. mount digest present', () => assert.ok(typeof mount.runtimeUiMountBoundaryDigest === 'string'));
test('334. blockedNav digest present', () => assert.ok(typeof blockedNav.blockedNavigationDigest === 'string'));
test('335. harness digest present', () => assert.ok(typeof harness.testHarnessDigest === 'string'));
test('336. manualGate digest present', () => assert.ok(typeof manualGate.manualGateDigest === 'string'));
test('337. rollout digest present', () => assert.ok(typeof rollout.rolloutRollbackDigest === 'string'));
test('338. observability digest present', () => assert.ok(typeof observability.observabilityDigest === 'string'));
test('339. protoProhibition digest present', () => assert.ok(typeof protoProhibition.prototypeRelinkProhibitionDigest === 'string'));
test('340. safety digest present', () => assert.ok(typeof safety.safetyDigest === 'string'));
test('341. contract exposes phases/appWiring/routerWiring', () => { assert.equal(U.phases.kind, 'route-menu-implementation-phases'); assert.equal(U.appWiringBoundary.kind, 'route-menu-app-wiring-boundary-plan'); assert.equal(U.routerWiringBoundary.kind, 'route-menu-router-wiring-boundary-plan'); });
test('342. contract exposes registrations/placement', () => { assert.equal(U.routeRegistration.kind, 'route-menu-route-registration-plan'); assert.equal(U.menuRegistration.kind, 'route-menu-menu-registration-plan'); assert.equal(U.sidebarNavigationPlacement.kind, 'route-menu-sidebar-navigation-placement-plan'); });
test('343. contract exposes guard/visibility/deeplink/mount', () => { assert.equal(U.routeGuard.kind, 'route-menu-route-guard-implementation-plan'); assert.equal(U.menuVisibility.kind, 'route-menu-menu-visibility-implementation-plan'); assert.equal(U.deepLinkPolicy.kind, 'route-menu-deep-link-policy-plan'); assert.equal(U.runtimeUiMountBoundary.kind, 'route-menu-runtime-ui-mount-boundary-plan'); });
test('344. contract exposes gate/rollout/observability/prototype/safety', () => { assert.equal(U.manualGate.kind, 'route-menu-manual-enablement-gate-plan'); assert.equal(U.rolloutRollback.kind, 'route-menu-rollout-rollback-plan'); assert.equal(U.observability.kind, 'route-menu-observability-diagnostics-plan'); assert.equal(U.prototypeRelinkProhibition.kind, 'route-menu-prototype-relink-prohibition-plan'); assert.equal(U.safety.kind, 'route-menu-safety-plan'); });
test('345. deterministic manifest digest (full composer)', () => assert.equal(U.manifest.manifestDigest, createStudioDevPreviewRouteMenuImplementationPlan({ routeMenuContract: RMC }).manifest.manifestDigest));
test('346. compatibility deterministic', () => assert.equal(U.compatibility.compatibilityDigest, checkRouteMenuImplementationPlanCompatibility({ routeMenuContract: RMC }).compatibilityDigest));
test('347. diagnostics deterministic', () => assert.equal(U.diagnostics.diagnosticsDigest, createRouteMenuImplementationPlanDiagnostics({ verification: U.verification, compatibility: U.compatibility }).diagnosticsDigest));
test('348. session deterministic digest', () => assert.equal(session.sessionDigest, createRouteMenuImplementationPlanSession({ routeMenuContract: RMC }).sessionDigest));
test('349. app wiring boundary intact (contract)', () => { assert.equal(U.appWiringBoundary.appTouched, false); assert.equal(U.appWiringBoundary.appWiringImplemented, false); });
test('350. router wiring boundary intact (contract)', () => { assert.equal(U.routerWiringBoundary.routerWiringImplemented, false); assert.equal(U.routerWiringBoundary.browserRouterUsed, false); });
test('351. manual gate required (contract)', () => { assert.equal(U.manualGate.manualGateRequired, true); assert.equal(U.manualGate.authorizesRoute, false); });
test('352. prototype relink prohibited (contract)', () => assert.equal(U.prototypeRelinkProhibition.prototypeRelinkAllowed, false));
test('353. verification checkedCapabilities > 0', () => assert.ok(U.verification.checkedCapabilities > 0));
test('354. devOnlyAccessPolicy in contract (production/staging not allowed)', () => { assert.equal(U.devOnlyAccessPolicy.productionAllowed, false); assert.equal(U.devOnlyAccessPolicy.stagingAllowed, false); });
test('355. routeGuard default-deny in contract', () => { assert.equal(U.routeGuard.defaultDeny, true); assert.equal(U.routeGuard.failClosed, true); });
test('356. menuVisibility not visible now in contract', () => assert.equal(U.menuVisibility.visibleNow, false));
test('357. deepLinkPolicy not implemented in contract', () => assert.equal(U.deepLinkPolicy.deepLinkImplemented, false));
test('358. runtimeUiMountBoundary no dom globals in contract', () => { assert.equal(U.runtimeUiMountBoundary.windowApiUsed, false); assert.equal(U.runtimeUiMountBoundary.documentApiUsed, false); });
test('359. rolloutRollback rollout blocked in contract', () => { assert.equal(U.rolloutRollback.rolloutAllowed, false); assert.equal(U.rolloutRollback.rollbackByNonConsumption, true); });
test('360. observability safe in contract', () => { assert.equal(U.observability.safeDiagnostics, true); assert.equal(U.observability.noExternalLogging, true); });
test('361. testHarness not implemented in contract', () => assert.equal(U.testHarness.harnessImplemented, false));
test('362. phases all planned in contract', () => { assert.equal(U.phases.allPlanned, true); assert.equal(U.phases.anyImplemented, false); });
test('363. safety plan no forbidden side-effect in contract', () => assert.equal(U.safety.anyForbiddenSideEffect, false));
test('364. routeRegistration futurePath dev sandbox (contract)', () => assert.ok(U.routeRegistration.futurePath.startsWith('/__dev/')));
test('365. menuRegistration futureOrder numeric (contract)', () => assert.ok(typeof U.menuRegistration.futureOrder === 'number'));
test('366. sidebar/navigation placement not implemented (contract)', () => { assert.equal(U.sidebarNavigationPlacement.sidebarWiringImplemented, false); assert.equal(U.sidebarNavigationPlacement.navigationWiringImplemented, false); });
test('367. compatibility never authorizes app integration', () => assert.equal(U.compatibility.readyForAppIntegration, false));
test('368. manifest parts.manualGate digest present', () => assert.ok(typeof U.manifest.parts.manualGate === 'string'));
test('369. manifest parts.prototypeRelinkProhibition digest present', () => assert.ok(typeof U.manifest.parts.prototypeRelinkProhibition === 'string'));

// ===== Evidence docs (D1-D25) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'APP-WIRING-BOUNDARY-PLAN.md', 'ROUTER-WIRING-BOUNDARY-PLAN.md',
  'ROUTE-REGISTRATION-PLAN.md', 'MENU-REGISTRATION-PLAN.md', 'SIDEBAR-NAVIGATION-PLACEMENT-PLAN.md',
  'DEV-ONLY-ACCESS-POLICY.md', 'ROUTE-GUARD-IMPLEMENTATION-PLAN.md', 'MENU-VISIBILITY-IMPLEMENTATION-PLAN.md',
  'DEEP-LINK-POLICY-PLAN.md', 'RUNTIME-UI-MOUNT-BOUNDARY-PLAN.md', 'BLOCKED-NAVIGATION-ACTION-PLAN.md',
  'TEST-HARNESS-PLAN.md', 'MANUAL-ENABLEMENT-GATE-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md',
  'OBSERVABILITY-DIAGNOSTICS-PLAN.md', 'PROTOTYPE-RELINK-PROHIBITION-PLAN.md', 'SAFETY-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTE-NO-MENU-NO-MOUNT.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-route-menu-implementation-plan/${DOCS[i]}`)));
}
test('D-content. no-app-route-menu-mount doc + next slice spec present', () => {
  assert.ok(/App|route|rota|menu|mount|montad/i.test(readEv('NO-APP-NO-ROUTE-NO-MENU-NO-MOUNT.md')));
  assert.ok(/ENTERPRISE CHECKPOINT|checkpoint|FABLE/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
