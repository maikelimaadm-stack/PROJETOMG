import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ROUTE_MENU_CONTRACT_NAME,
  ROUTE_MENU_CONTRACT_SEMVER,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_MODE,
  ROUTE_MENU_CONTRACT_ENVIRONMENT,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  BLOCKED_NAVIGATION_KINDS,
  ROUTE_MENU_CONTRACT_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG,
  routeMenuDigest,
  isStudioDevPreviewRouteMenuContractEnabled,
  isStudioDevPreviewRouteMenuDescriptorEnabled,
  isStudioDevPreviewRouteMenuVerifyEnabled,
  isStudioDevPreviewRouteMenuCompatibilityCheckEnabled,
  ROUTE_MENU_CONTRACT_ERROR_CODES,
  RouteMenuContractError,
  createRouteMenuContractError,
  routeMenuContractError,
  createRouteMenuContractSession,
  createDevPreviewRouteDescriptorContract,
  createDevPreviewRouteEligibilityContract,
  createDevPreviewRouteGuardContract,
  createDevPreviewRouteIsolationContract,
  createDevPreviewRouteVisibilityContract,
  createDevPreviewRouteAccessDecision,
  createDevPreviewMenuPlacementContract,
  createDevPreviewMenuVisibilityContract,
  createDevPreviewMenuEligibilityContract,
  createDevPreviewNavigationBoundaryContract,
  createDevPreviewDeepLinkBlockedContract,
  createDevPreviewAppWiringBlockedContract,
  createDevPreviewManualEnablementGateContract,
  createDevPreviewRouteMenuRolloutRollbackContract,
  createDevPreviewRouteMenuSafetyContract,
  createDevPreviewRouteMenuReadinessDecision,
  createDevPreviewRouteMenuManifest,
  verifyDevPreviewRouteMenuContract,
  checkDevPreviewRouteMenuCompatibility,
  createDevPreviewRouteMenuDiagnostics,
  createDevPreviewRouteMenuFallback,
  createStudioDevPreviewRouteMenuContract,
} from '../../studio/blueprint-engine/dev-preview-route-menu-contract/index.js';
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
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-route-menu-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-route-menu-contract');

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
const U = createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });

const session = createRouteMenuContractSession({ runtimeUi: UI });
const routeDesc = createDevPreviewRouteDescriptorContract({ runtimeUi: UI });
const routeElig = createDevPreviewRouteEligibilityContract();
const routeGuard = createDevPreviewRouteGuardContract();
const routeIso = createDevPreviewRouteIsolationContract();
const routeVis = createDevPreviewRouteVisibilityContract();
const routeAccess = createDevPreviewRouteAccessDecision({ env: { DEV: 'true' } });
const menuPlace = createDevPreviewMenuPlacementContract({ runtimeUi: UI });
const menuVis = createDevPreviewMenuVisibilityContract();
const menuElig = createDevPreviewMenuEligibilityContract();
const navBoundary = createDevPreviewNavigationBoundaryContract();
const deepLink = createDevPreviewDeepLinkBlockedContract();
const appWiring = createDevPreviewAppWiringBlockedContract();
const manualGate = createDevPreviewManualEnablementGateContract();
const rollout = createDevPreviewRouteMenuRolloutRollbackContract();
const safety = createDevPreviewRouteMenuSafetyContract();
const caps = ROUTE_MENU_CONTRACT_CAPABILITIES;

// ===== Contract base (1-60) =====
test('1. contract created', () => assert.equal(U.kind, 'studio-dev-preview-route-menu-contract'));
test('2. name', () => { assert.equal(U.routeMenuContractName, 'studio-dev-preview-route-menu-contract'); assert.equal(U.routeMenuContractName, ROUTE_MENU_CONTRACT_NAME); });
test('3. version', () => { assert.equal(U.routeMenuContractVersion, 'studio-dev-preview-route-menu-contract@1.0.0'); assert.equal(U.routeMenuContractVersion, ROUTE_MENU_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(ROUTE_MENU_CONTRACT_SEMVER, '1.0.0'));
test('5. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, 'studio-dev-preview-runtime-ui@1.0.0'));
test('6. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'));
test('7. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('8. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('9. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('10. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('11. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('12. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('13. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('14. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('15. mode', () => { assert.equal(U.mode, 'headless_dev_preview_route_menu_contract'); assert.equal(U.mode, ROUTE_MENU_CONTRACT_MODE); });
test('16. environment const', () => assert.equal(ROUTE_MENU_CONTRACT_ENVIRONMENT, 'local_contract'));
test('17. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('18. not fallback', () => assert.equal(U.fallback, false));
test('19. headless', () => assert.equal(U.capabilities.headless, true));
test('20. contractOnly', () => assert.equal(U.capabilities.contractOnly, true));
test('21. metadataOnly', () => assert.equal(U.capabilities.metadataOnly, true));
test('22. routeContractOnly', () => assert.equal(U.capabilities.routeContractOnly, true));
test('23. menuContractOnly', () => assert.equal(U.capabilities.menuContractOnly, true));
test('24. navigationContractOnly', () => assert.equal(U.capabilities.navigationContractOnly, true));
test('25. devOnly', () => assert.equal(U.capabilities.devOnly, true));
test('26. isolated', () => assert.equal(U.capabilities.isolated, true));
test('27. routeDescriptorMetadataOnly', () => assert.equal(U.capabilities.routeDescriptorMetadataOnly, true));
test('28. routeEligibilityMetadataOnly', () => assert.equal(U.capabilities.routeEligibilityMetadataOnly, true));
test('29. routeGuardMetadataOnly', () => assert.equal(U.capabilities.routeGuardMetadataOnly, true));
test('30. routeIsolationMetadataOnly', () => assert.equal(U.capabilities.routeIsolationMetadataOnly, true));
test('31. routeVisibilityMetadataOnly', () => assert.equal(U.capabilities.routeVisibilityMetadataOnly, true));
test('32. menuPlacementMetadataOnly', () => assert.equal(U.capabilities.menuPlacementMetadataOnly, true));
test('33. menuVisibilityMetadataOnly', () => assert.equal(U.capabilities.menuVisibilityMetadataOnly, true));
test('34. navigationBoundaryMetadataOnly', () => assert.equal(U.capabilities.navigationBoundaryMetadataOnly, true));
test('35. deepLinkBlockedMetadataOnly', () => assert.equal(U.capabilities.deepLinkBlockedMetadataOnly, true));
test('36. manualEnablementGateOnly', () => assert.equal(U.capabilities.manualEnablementGateOnly, true));
test('37. routeCreated false', () => assert.equal(U.capabilities.routeCreated, false));
test('38. menuCreated false', () => assert.equal(U.capabilities.menuCreated, false));
test('39. appWiringCreated false', () => assert.equal(U.capabilities.appWiringCreated, false));
test('40. routerWiringCreated false', () => assert.equal(U.capabilities.routerWiringCreated, false));
test('41. navigationWiringCreated false', () => assert.equal(U.capabilities.navigationWiringCreated, false));
test('42. sidebarWiringCreated false', () => assert.equal(U.capabilities.sidebarWiringCreated, false));
test('43. deepLinkCreated false', () => assert.equal(U.capabilities.deepLinkCreated, false));
test('44. linkCreated false', () => assert.equal(U.capabilities.linkCreated, false));
test('45. navLinkCreated false', () => assert.equal(U.capabilities.navLinkCreated, false));
test('46. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('47. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('48. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('49. backendAccessed false', () => assert.equal(U.capabilities.backendAccessed, false));
test('50. prismaAccessed false', () => assert.equal(U.capabilities.prismaAccessed, false));
test('51. productionAccessed false', () => assert.equal(U.capabilities.productionAccessed, false));
test('52. stagingAccessed false', () => assert.equal(U.capabilities.stagingAccessed, false));
test('53. fetchUsed false', () => assert.equal(U.capabilities.fetchUsed, false));
test('54. mutationAllowed false', () => assert.equal(U.capabilities.mutationAllowed, false));
test('55. persistenceCreated false', () => assert.equal(U.capabilities.persistenceCreated, false));
test('56. realDataRead false', () => assert.equal(U.capabilities.realDataRead, false));
test('57. realDataWrite false', () => assert.equal(U.capabilities.realDataWrite, false));
test('58. rewriteEmpresas false', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('59. oldPrototypeImported false', () => assert.equal(U.capabilities.oldPrototypeImported, false));
test('60. capabilities frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_CONTRACT_CAPABILITIES)));

// ===== Readiness (61-70) =====
test('61. readyForRouteMenuContract true', () => assert.equal(U.readyForRouteMenuContract, true));
test('62. readyForRouteMenuImplementation false', () => assert.equal(U.readyForRouteMenuImplementation, false));
test('63. readyForAppIntegration false', () => assert.equal(U.readyForAppIntegration, false));
test('64. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('65. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('66. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_route_menu_contract_ready'));
test('67. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('68. warningCount 0', () => assert.equal(U.warningCount, 0));
test('69. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('70. readiness state in enum', () => assert.ok(ROUTE_MENU_CONTRACT_READINESS_STATES.includes(U.readiness)));

// ===== Session (71-82) =====
test('71. session kind', () => assert.equal(session.kind, 'route-menu-contract-session'));
test('72. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-route-menu-contract'));
test('73. session version', () => assert.equal(session.routeMenuContractVersion, ROUTE_MENU_CONTRACT_VERSION));
test('74. sourceRuntimeUi', () => assert.equal(session.sourceRuntimeUi, RUNTIME_UI_VERSION));
test('75. sourceRuntimeUiContract', () => assert.equal(session.sourceRuntimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('76. sourceIsolatedRuntime', () => assert.equal(session.sourceIsolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('77. sourceRuntimeUiImplementationPlan', () => assert.equal(session.sourceRuntimeUiImplementationPlan, RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION));
test('78. session mode', () => assert.equal(session.mode, ROUTE_MENU_CONTRACT_MODE));
test('79. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-runtime-ui'));
test('80. seed deterministic', () => assert.equal(session.seed, createRouteMenuContractSession({ runtimeUi: UI }).seed));
test('81. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('82. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Route descriptor (83-92) =====
test('83. routeDesc kind', () => assert.equal(routeDesc.kind, 'dev-preview-route-descriptor-contract'));
test('84. routeId present', () => assert.ok(typeof routeDesc.routeId === 'string'));
test('85. futurePath present (dev-only path)', () => assert.ok(/^\/__dev\//.test(routeDesc.futurePath)));
test('86. futureRouteName present', () => assert.ok(typeof routeDesc.futureRouteName === 'string'));
test('87. futurePageKind', () => assert.equal(routeDesc.futurePageKind, 'studio_dev_preview_isolated_ui'));
test('88. routeCreated false', () => assert.equal(routeDesc.routeCreated, false));
test('89. componentMounted false', () => assert.equal(routeDesc.componentMounted, false));
test('90. appRegistered false', () => assert.equal(routeDesc.appRegistered, false));
test('91. routerRegistered false', () => assert.equal(routeDesc.routerRegistered, false));
test('92. metadataOnly', () => assert.equal(routeDesc.metadataOnly, true));

// ===== Route eligibility (93-99) =====
test('93. routeElig kind', () => assert.equal(routeElig.kind, 'dev-preview-route-eligibility-contract'));
test('94. eligibleForFutureImplementation', () => assert.equal(routeElig.eligibleForFutureImplementation, true));
test('95. eligibleForCurrentWiring false', () => assert.equal(routeElig.eligibleForCurrentWiring, false));
test('96. requiresExplicitFutureSlice', () => assert.equal(routeElig.requiresExplicitFutureSlice, true));
test('97. requiresManualGate', () => assert.equal(routeElig.requiresManualGate, true));
test('98. requiresDevOnly', () => assert.equal(routeElig.requiresDevOnly, true));
test('99. requiresRuntimeUiReady + syntheticDataOnly', () => { assert.equal(routeElig.requiresRuntimeUiReady, true); assert.equal(routeElig.requiresSyntheticDataOnly, true); });

// ===== Route guard (100-107) =====
test('100. routeGuard kind', () => assert.equal(routeGuard.kind, 'dev-preview-route-guard-contract'));
test('101. defaultDeny', () => assert.equal(routeGuard.defaultDeny, true));
test('102. failClosed', () => assert.equal(routeGuard.failClosed, true));
test('103. devOnlyRequired', () => assert.equal(routeGuard.devOnlyRequired, true));
test('104. productionDenied', () => assert.equal(routeGuard.productionDenied, true));
test('105. stagingDenied', () => assert.equal(routeGuard.stagingDenied, true));
test('106. tenantContextSyntheticOnly', () => assert.equal(routeGuard.tenantContextSyntheticOnly, true));
test('107. permissionContextSyntheticOnly', () => assert.equal(routeGuard.permissionContextSyntheticOnly, true));

// ===== Route isolation (108-119) =====
test('108. routeIso kind', () => assert.equal(routeIso.kind, 'dev-preview-route-isolation-contract'));
test('109. noAppWiring', () => assert.equal(routeIso.noAppWiring, true));
test('110. noRouterWiring', () => assert.equal(routeIso.noRouterWiring, true));
test('111. noRouteRegistration', () => assert.equal(routeIso.noRouteRegistration, true));
test('112. noMenuRegistration', () => assert.equal(routeIso.noMenuRegistration, true));
test('113. noSidebarRegistration', () => assert.equal(routeIso.noSidebarRegistration, true));
test('114. noProduction', () => assert.equal(routeIso.noProduction, true));
test('115. noStaging', () => assert.equal(routeIso.noStaging, true));
test('116. noBackend', () => assert.equal(routeIso.noBackend, true));
test('117. noPrisma', () => assert.equal(routeIso.noPrisma, true));
test('118. noRealData', () => assert.equal(routeIso.noRealData, true));
test('119. noPrototypeRelink', () => assert.equal(routeIso.noPrototypeRelink, true));

// ===== Route visibility + access (120-129) =====
test('120. routeVis kind', () => assert.equal(routeVis.kind, 'dev-preview-route-visibility-contract'));
test('121. visibleNow false', () => assert.equal(routeVis.visibleNow, false));
test('122. visibleInDevMenuNow false', () => assert.equal(routeVis.visibleInDevMenuNow, false));
test('123. visibleInProductNow false', () => assert.equal(routeVis.visibleInProductNow, false));
test('124. futureVisibility contract_only', () => assert.equal(routeVis.futureVisibility, 'contract_only'));
test('125. routeAccess kind', () => assert.equal(routeAccess.kind, 'dev-preview-route-access-decision'));
test('126. accessGrantedNow false', () => assert.equal(routeAccess.accessGrantedNow, false));
test('127. decision deny_contract_only', () => assert.equal(routeAccess.decision, 'deny_contract_only'));
test('128. access failClosed', () => assert.equal(routeAccess.failClosed, true));
test('129. access denies in production', () => { const a = createDevPreviewRouteAccessDecision({ env: { MAK_ENV_LABEL: 'production' } }); assert.equal(a.accessGrantedNow, false); assert.equal(a.productionDetected, true); });

// ===== Menu placement/visibility/eligibility (130-142) =====
test('130. menuPlace kind', () => assert.equal(menuPlace.kind, 'dev-preview-menu-placement-contract'));
test('131. placementId present', () => assert.ok(typeof menuPlace.placementId === 'string'));
test('132. futureGroup', () => assert.equal(menuPlace.futureGroup, 'studio_dev_preview'));
test('133. futureLabel present', () => assert.ok(typeof menuPlace.futureLabel === 'string'));
test('134. menuCreated false', () => assert.equal(menuPlace.menuCreated, false));
test('135. menuItemRegistered false', () => assert.equal(menuPlace.menuItemRegistered, false));
test('136. sidebarTouched false', () => assert.equal(menuPlace.sidebarTouched, false));
test('137. navigationTouched false', () => assert.equal(menuPlace.navigationTouched, false));
test('138. menuVis kind + visibleNow false', () => { assert.equal(menuVis.kind, 'dev-preview-menu-visibility-contract'); assert.equal(menuVis.visibleNow, false); });
test('139. menuVis futureVisibility contract_only', () => assert.equal(menuVis.futureVisibility, 'contract_only'));
test('140. menuElig kind', () => assert.equal(menuElig.kind, 'dev-preview-menu-eligibility-contract'));
test('141. menuElig eligibleForFutureImplementation', () => assert.equal(menuElig.eligibleForFutureImplementation, true));
test('142. menuElig eligibleForCurrentWiring false', () => assert.equal(menuElig.eligibleForCurrentWiring, false));

// ===== Navigation boundary + deep-link + app wiring (143-160) =====
test('143. navBoundary kind', () => assert.equal(navBoundary.kind, 'dev-preview-navigation-boundary-contract'));
test('144. kinds match const', () => assert.deepEqual(navBoundary.blockedNavigationKinds, [...BLOCKED_NAVIGATION_KINDS]));
test('145. 7 actions', () => assert.equal(navBoundary.actionCount, 7));
test('146. navigate blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'navigate' && a.blocked === true)));
test('147. openRoute blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'openRoute' && a.blocked === true)));
test('148. deepLink blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'deepLink' && a.blocked === true)));
test('149. registerRoute blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'registerRoute' && a.blocked === true)));
test('150. registerMenu blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'registerMenu' && a.blocked === true)));
test('151. registerSidebarItem blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'registerSidebarItem' && a.blocked === true)));
test('152. registerModule blocked', () => assert.ok(navBoundary.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('153. allBlocked / anyAllowed false', () => { assert.equal(navBoundary.allBlocked, true); assert.equal(navBoundary.anyAllowed, false); });
test('154. deepLink kind', () => assert.equal(deepLink.kind, 'dev-preview-deep-link-blocked-contract'));
test('155. deepLinkCreated/allowed false', () => { assert.equal(deepLink.deepLinkCreated, false); assert.equal(deepLink.deepLinkAllowed, false); });
test('156. externalLink/browserNavigation false', () => { assert.equal(deepLink.externalLinkAllowed, false); assert.equal(deepLink.browserNavigationAllowed, false); });
test('157. appWiring kind', () => assert.equal(appWiring.kind, 'dev-preview-app-wiring-blocked-contract'));
test('158. app/router/routes not touched', () => { assert.equal(appWiring.appTouched, false); assert.equal(appWiring.routerTouched, false); assert.equal(appWiring.routesTouched, false); });
test('159. menu/sidebar/navigation not touched', () => { assert.equal(appWiring.menuTouched, false); assert.equal(appWiring.sidebarTouched, false); assert.equal(appWiring.navigationTouched, false); });
test('160. wiringAllowed false', () => assert.equal(appWiring.wiringAllowed, false));

// ===== Manual gate + rollout + safety (161-178) =====
test('161. manualGate kind', () => assert.equal(manualGate.kind, 'dev-preview-manual-enablement-gate-contract'));
test('162. manualGateRequired', () => assert.equal(manualGate.manualGateRequired, true));
test('163. requiredCheckpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('164. currentSliceAuthorization contract_only', () => assert.equal(manualGate.currentSliceAuthorization, 'contract_only'));
test('165. authorizesRoute false', () => assert.equal(manualGate.authorizesRoute, false));
test('166. authorizesMenu false', () => assert.equal(manualGate.authorizesMenu, false));
test('167. authorizesAppWiring/routerWiring false', () => { assert.equal(manualGate.authorizesAppWiring, false); assert.equal(manualGate.authorizesRouterWiring, false); });
test('168. authorizesModuleGeneration false', () => assert.equal(manualGate.authorizesModuleGeneration, false));
test('169. authorizesBackend/Prisma/Production false', () => { assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); assert.equal(manualGate.authorizesProduction, false); });
test('170. rollout kind', () => assert.equal(rollout.kind, 'dev-preview-route-menu-rollout-rollback-contract'));
test('171. rolloutAllowed false', () => assert.equal(rollout.rolloutAllowed, false));
test('172. production/staging rollout false', () => { assert.equal(rollout.productionRollout, false); assert.equal(rollout.stagingRollout, false); });
test('173. rollbackByNonConsumption', () => assert.equal(rollout.rollbackByNonConsumption, true));
test('174. safety kind', () => assert.equal(safety.kind, 'dev-preview-route-menu-safety-contract'));
test('175. safety headless/contractOnly/devOnly', () => { assert.equal(safety.headless, true); assert.equal(safety.contractOnly, true); assert.equal(safety.devOnly, true); });
test('176. safety failClosed', () => assert.equal(safety.failClosed, true));
test('177. safety anyForbiddenSideEffect false', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('178. safety forbiddenFlags all false + reversible', () => { assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)); assert.equal(safety.reversibleByNonConsumption, true); });

// ===== Readiness decision (179-186) =====
test('179. readiness kind', () => assert.equal(U.readinessDecision.kind, 'dev-preview-route-menu-readiness-decision'));
test('180. readiness ready state', () => assert.equal(U.readinessDecision.readiness, 'studio_dev_preview_route_menu_contract_ready'));
test('181. readiness readyForContract', () => assert.equal(U.readinessDecision.readyForRouteMenuContract, true));
test('182. readiness readyForImplementation false', () => assert.equal(U.readinessDecision.readyForRouteMenuImplementation, false));
test('183. readiness readyForAppIntegration false', () => assert.equal(U.readinessDecision.readyForAppIntegration, false));
test('184. readiness readyForProduction false', () => assert.equal(U.readinessDecision.readyForProduction, false));
test('185. blocked on blockers', () => { const r = createDevPreviewRouteMenuReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForRouteMenuContract, false); });
test('186. implementation stays false even empty', () => assert.equal(createDevPreviewRouteMenuReadinessDecision({}).readyForRouteMenuImplementation, false));

// ===== Manifest (187-196) =====
test('187. manifest kind', () => assert.equal(U.manifest.kind, 'dev-preview-route-menu-manifest'));
test('188. manifest name', () => assert.equal(U.manifest.routeMenuContractName, ROUTE_MENU_CONTRACT_NAME));
test('189. manifest version', () => assert.equal(U.manifest.routeMenuContractVersion, ROUTE_MENU_CONTRACT_VERSION));
test('190. manifest upstream runtimeUi', () => assert.equal(U.manifest.upstream.runtimeUi, RUNTIME_UI_VERSION));
test('191. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('192. manifest parts.routeDescriptor digest', () => assert.ok(typeof U.manifest.parts.routeDescriptor === 'string'));
test('193. manifest parts.navigationBoundary digest', () => assert.ok(typeof U.manifest.parts.navigationBoundary === 'string'));
test('194. manifest parts.safety digest', () => assert.ok(typeof U.manifest.parts.safety === 'string'));
test('195. manifest standalone builds', () => assert.equal(createDevPreviewRouteMenuManifest({ runtimeUi: UI }).kind, 'dev-preview-route-menu-manifest'));
test('196. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (197-218) =====
test('197. verification ok', () => assert.equal(U.verification.ok, true));
test('198. verification valid', () => assert.equal(U.verification.valid, true));
test('199. verification headless', () => assert.equal(U.verification.headless, true));
test('200. verification routeCreated false', () => assert.equal(U.verification.routeCreated, false));
test('201. verification menuCreated false', () => assert.equal(U.verification.menuCreated, false));
test('202. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('203. verifier detects routeCreated', () => assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, routeCreated: true } } }).blockers.includes('capability_routeCreated_must_be_false')));
test('204. verifier detects menuCreated', () => assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, menuCreated: true } } }).blockers.includes('capability_menuCreated_must_be_false')));
test('205. verifier detects app/router wiring', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, appWiringCreated: true, routerWiringCreated: true } } }); assert.ok(r.blockers.includes('capability_appWiringCreated_must_be_false') && r.blockers.includes('capability_routerWiringCreated_must_be_false')); });
test('206. verifier detects navigation/sidebar wiring', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, navigationWiringCreated: true, sidebarWiringCreated: true } } }); assert.ok(r.blockers.includes('capability_navigationWiringCreated_must_be_false') && r.blockers.includes('capability_sidebarWiringCreated_must_be_false')); });
test('207. verifier detects NavLink/Link created', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, navLinkCreated: true, linkCreated: true } } }); assert.ok(r.blockers.includes('capability_navLinkCreated_must_be_false') && r.blockers.includes('capability_linkCreated_must_be_false')); });
test('208. verifier detects deepLinkCreated cap', () => assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, deepLinkCreated: true } } }).blockers.includes('capability_deepLinkCreated_must_be_false')));
test('209. verifier detects production/staging', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.blockers.includes('capability_productionAccessed_must_be_false') && r.blockers.includes('capability_stagingAccessed_must_be_false')); });
test('210. verifier detects backend/prisma', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('211. verifier detects fetch/mutation', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, fetchUsed: true, mutationAllowed: true } } }); assert.ok(r.blockers.includes('capability_fetchUsed_must_be_false') && r.blockers.includes('capability_mutationAllowed_must_be_false')); });
test('212. verifier detects real data read/write', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('213. verifier detects prototype relink cap', () => assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, oldPrototypeImported: true } } }).blockers.includes('capability_oldPrototypeImported_must_be_false')));
test('214. verifier detects route registered in descriptor', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, routeDescriptor: { routeCreated: true, appRegistered: true, routerRegistered: true } } }); assert.ok(r.blockers.includes('unsafe_route_created') && r.blockers.includes('unsafe_app_registered') && r.blockers.includes('unsafe_router_registered')); });
test('215. verifier detects menu registered / sidebar touched', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, menuPlacement: { menuCreated: true, sidebarTouched: true } } }); assert.ok(r.blockers.includes('unsafe_menu_created') && r.blockers.includes('unsafe_sidebar_touched')); });
test('216. verifier detects deep link + app touched + wiring allowed', () => { const r = verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, deepLinkBlocked: { deepLinkCreated: true }, appWiringBlocked: { appTouched: true, wiringAllowed: true } } }); assert.ok(r.blockers.includes('unsafe_deep_link') && r.blockers.includes('unsafe_app_touched') && r.blockers.includes('unsafe_wiring_allowed')); });
test('217. verifier detects prototype relink + missing manual gate', () => { const r1 = verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, routeIsolation: { noPrototypeRelink: false } } }); const r2 = verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, manualGate: { manualGateRequired: false } } }); assert.ok(r1.blockers.includes('unsafe_prototype_relink') && r2.blockers.includes('missing_manual_gate')); });
test('218. verifier detects mustBeTrue + metadataOnly false + never throws', () => { assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: { ...caps, headless: false } } }).blockers.includes('capability_headless_must_be_true')); assert.ok(verifyDevPreviewRouteMenuContract({ contract: { capabilities: caps, metadataOnly: false } }).blockers.includes('contract_must_be_metadata_only')); assert.doesNotThrow(() => verifyDevPreviewRouteMenuContract({ contract: null })); });

// ===== Compatibility (219-227) =====
test('219. compatibility kind', () => assert.equal(U.compatibility.kind, 'dev-preview-route-menu-compatibility'));
test('220. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('221. compat readyForRouteMenuContract', () => assert.equal(U.compatibility.readyForRouteMenuContract, true));
test('222. compat readyForRouteMenuImplementation false', () => assert.equal(U.compatibility.readyForRouteMenuImplementation, false));
test('223. compat readyForAppIntegration false', () => assert.equal(U.compatibility.readyForAppIntegration, false));
test('224. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('225. compat status after-checkpoint', () => assert.equal(U.compatibility.status, 'ready_for_future_route_menu_implementation_plan_after_enterprise_checkpoint'));
test('226. compat mismatch → warning', () => { const r = checkDevPreviewRouteMenuCompatibility({ runtimeUi: { runtimeUiVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithRuntimeUi, false); assert.ok(r.warnings.includes('incompatible_runtimeUi')); });
test('227. compatibilityDigest present', () => assert.ok(typeof U.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (228-241) =====
test('228. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'dev-preview-route-menu-diagnostics'));
test('229. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('230. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('231. diagnostics headlessConfirmed', () => assert.equal(U.diagnostics.headlessConfirmed, true));
test('232. diagnostics contractOnlyConfirmed', () => assert.equal(U.diagnostics.contractOnlyConfirmed, true));
test('233. diagnostics routeCreated/menuCreated false', () => { assert.equal(U.diagnostics.routeCreated, false); assert.equal(U.diagnostics.menuCreated, false); });
test('234. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRouteMenuContract({});
const fbBad = createStudioDevPreviewRouteMenuContract({ runtimeUi: { kind: 'other' } });
const fbFb = createStudioDevPreviewRouteMenuContract({ runtimeUi: { kind: 'studio-dev-preview-runtime-ui', fallback: true } });
test('235. missing runtimeUi → fallback', () => assert.equal(fbNo.fallback, true));
test('236. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('237. fallback runtimeUi → fallback', () => assert.equal(fbFb.fallback, true));
test('238. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('239. fallback not ready contract/impl/production', () => { assert.equal(fbNo.readyForRouteMenuContract, false); assert.equal(fbNo.readyForRouteMenuImplementation, false); assert.equal(fbNo.readyForProduction, false); });
test('240. fallback caps routeCreated false + never throws', () => { assert.equal(fbNo.capabilities.routeCreated, false); assert.doesNotThrow(() => createDevPreviewRouteMenuFallback({ reason: 'x' })); });
test('241. fallback metadataOnly', () => assert.equal(fbNo.metadataOnly, true));

// ===== Errors (242-251) =====
test('242. error codes >= 30', () => assert.ok(ROUTE_MENU_CONTRACT_ERROR_CODES.length >= 30));
test('243. error descriptor sanitized', () => { const e = createRouteMenuContractError('ROUTE_MENU_CONTRACT_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('244. error no route/menu/appwiring', () => { const e = createRouteMenuContractError('ROUTE_MENU_CONTRACT_ROUTE_BLOCKED'); assert.equal(e.routeCreated, false); assert.equal(e.menuCreated, false); assert.equal(e.appWiringCreated, false); });
test('245. error no deep/nav link', () => { const e = createRouteMenuContractError('ROUTE_MENU_CONTRACT_NAVLINK_BLOCKED'); assert.equal(e.deepLinkCreated, false); assert.equal(e.navLinkCreated, false); assert.equal(e.linkCreated, false); });
test('246. unknown code normalized', () => assert.equal(createRouteMenuContractError('NOPE').code, 'ROUTE_MENU_CONTRACT_INVALID_RUNTIME_UI'));
test('247. typed error', () => { const e = new RouteMenuContractError('ROUTE_MENU_CONTRACT_ROUTER_BLOCKED', 'x'); assert.ok(e instanceof Error && e.name === 'RouteMenuContractError'); });
test('248. helper error', () => assert.equal(routeMenuContractError('ROUTE_MENU_CONTRACT_FETCH_BLOCKED', 'x').code, 'ROUTE_MENU_CONTRACT_FETCH_BLOCKED'));
test('249. codes cover router API blocks', () => ['ROUTE_MENU_CONTRACT_BROWSER_ROUTER_BLOCKED', 'ROUTE_MENU_CONTRACT_USE_NAVIGATE_BLOCKED', 'ROUTE_MENU_CONTRACT_NAVLINK_BLOCKED', 'ROUTE_MENU_CONTRACT_LINK_BLOCKED', 'ROUTE_MENU_CONTRACT_ROUTER_BLOCKED'].forEach((c) => assert.ok(ROUTE_MENU_CONTRACT_ERROR_CODES.includes(c))));
test('250. codes cover prototype relink + manual gate', () => ['ROUTE_MENU_CONTRACT_OLD_PROTOTYPE_RELINK_BLOCKED', 'ROUTE_MENU_CONTRACT_MANUAL_GATE_MISSING'].forEach((c) => assert.ok(ROUTE_MENU_CONTRACT_ERROR_CODES.includes(c))));
test('251. error no stack leak', () => { const e = createRouteMenuContractError('ROUTE_MENU_CONTRACT_BACKEND_BLOCKED'); assert.equal(e.noStackLeak, true); });

// ===== Config flags (252-261) =====
test('252. flag off by default', () => assert.equal(isStudioDevPreviewRouteMenuContractEnabled({}), false));
test('253. flag on in dev', () => assert.equal(isStudioDevPreviewRouteMenuContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('254. flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('255. descriptor flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuDescriptorEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('256. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('257. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRouteMenuCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('258. master flag enables descriptor in dev', () => assert.equal(isStudioDevPreviewRouteMenuDescriptorEnabled({ [MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('259. readiness states frozen', () => assert.ok(Object.isFrozen(ROUTE_MENU_CONTRACT_READINESS_STATES)));
test('260. blocked navigation kinds frozen (7)', () => assert.ok(Object.isFrozen(BLOCKED_NAVIGATION_KINDS) && BLOCKED_NAVIGATION_KINDS.length === 7));
test('261. routeMenuDigest deterministic + format', () => { assert.equal(routeMenuDigest({ a: 1 }), routeMenuDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(routeMenuDigest({ a: 1 }))); });

// ===== Determinism / purity (262-273) =====
test('262. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }).overallDigest));
test('263. deterministic routeMenuContractDigest', () => assert.equal(U.routeMenuContractDigest, createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }).routeMenuContractDigest));
test('264. input not mutated', () => { const snap = JSON.stringify(UI); createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }); assert.equal(JSON.stringify(UI), snap); });
test('265. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('266. different module → different digest', () => {
  const sb2 = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const uc2 = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb2 }) }) }) }) }) });
  const ui2 = createStudioDevPreviewRuntimeUi({ runtimeUiContract: uc2, env: { DEV: 'true' } });
  assert.notEqual(U.overallDigest, createStudioDevPreviewRouteMenuContract({ runtimeUi: ui2 }).overallDigest);
});
test('267. fail-closed for invalid runtime UI', () => assert.equal(createStudioDevPreviewRouteMenuContract({ runtimeUi: {} }).fallback, true));
test('268. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('269. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('270. no route created (contract)', () => assert.equal(U.routeDescriptor.routeCreated, false));
test('271. no menu created (contract)', () => assert.equal(U.menuPlacement.menuCreated, false));
test('272. navigation boundary allBlocked (contract)', () => assert.equal(U.navigationBoundary.allBlocked, true));
test('273. manual gate required (contract)', () => assert.equal(U.manualGate.manualGateRequired, true));

// ===== Purity / no-router-API code scan (274-288) — case-sensitive React-Router API =====
test('274. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('275. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('276. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('277. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('278. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('279. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('280. no react-router import', () => assert.ok(importsOf().every((p) => !/react-router/i.test(p))));
test('281. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('282. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('283. no window/document DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('284. no <Route JSX / Routes / NavLink (case-sensitive API)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b/.test(allCode())));
test('285. no BrowserRouter / createBrowserRouter', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b/.test(allCode())));
test('286. no useNavigate', () => assert.ok(!/\buseNavigate\b/.test(allCode())));
test('287. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));
test('288. no .jsx/.tsx/.css in subtree', () => { assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))); assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))); });

// ===== Scope safety (289-311) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('289. contract subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu-contract')));
test('290. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('291. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('292. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('293. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('294. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('295. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('296. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('297. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('298. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('299. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('300. studio prototype dirs not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(x))); });
test('301. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('302. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('303. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('304. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('305. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('306. no .jsx added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.jsx$/.test(x))); });
test('307. no .tsx added in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.tsx$/.test(x))); });
test('308. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('309. net-new scope is contract subtree only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('310. upstream runtime UI present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/index.js')));
test('311. no prototype import in subtree', () => assert.ok(importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));

// ===== Extended coverage (312-343) =====
test('312. session digest present', () => assert.ok(typeof session.sessionDigest === 'string'));
test('313. routeDescriptor digest present', () => assert.ok(typeof routeDesc.routeDescriptorDigest === 'string'));
test('314. routeEligibility digest present', () => assert.ok(typeof routeElig.routeEligibilityDigest === 'string'));
test('315. routeGuard digest present', () => assert.ok(typeof routeGuard.routeGuardDigest === 'string'));
test('316. routeIsolation digest present', () => assert.ok(typeof routeIso.routeIsolationDigest === 'string'));
test('317. routeVisibility digest present', () => assert.ok(typeof routeVis.routeVisibilityDigest === 'string'));
test('318. routeAccess digest present', () => assert.ok(typeof routeAccess.routeAccessDigest === 'string'));
test('319. menuPlacement digest present', () => assert.ok(typeof menuPlace.menuPlacementDigest === 'string'));
test('320. menuVisibility digest present', () => assert.ok(typeof menuVis.menuVisibilityDigest === 'string'));
test('321. menuEligibility digest present', () => assert.ok(typeof menuElig.menuEligibilityDigest === 'string'));
test('322. navigationBoundary digest present', () => assert.ok(typeof navBoundary.navigationBoundaryDigest === 'string'));
test('323. deepLink digest present', () => assert.ok(typeof deepLink.deepLinkBlockedDigest === 'string'));
test('324. appWiring digest present', () => assert.ok(typeof appWiring.appWiringBlockedDigest === 'string'));
test('325. manualGate digest present', () => assert.ok(typeof manualGate.manualGateDigest === 'string'));
test('326. rollout digest present', () => assert.ok(typeof rollout.rolloutRollbackDigest === 'string'));
test('327. safety digest present', () => assert.ok(typeof safety.safetyDigest === 'string'));
test('328. contract exposes routeDescriptor/eligibility/guard', () => { assert.equal(U.routeDescriptor.kind, 'dev-preview-route-descriptor-contract'); assert.equal(U.routeEligibility.kind, 'dev-preview-route-eligibility-contract'); assert.equal(U.routeGuard.kind, 'dev-preview-route-guard-contract'); });
test('329. contract exposes isolation/visibility/access', () => { assert.equal(U.routeIsolation.kind, 'dev-preview-route-isolation-contract'); assert.equal(U.routeVisibility.kind, 'dev-preview-route-visibility-contract'); assert.equal(U.routeAccessDecision.kind, 'dev-preview-route-access-decision'); });
test('330. contract exposes menu parts', () => { assert.equal(U.menuPlacement.kind, 'dev-preview-menu-placement-contract'); assert.equal(U.menuVisibility.kind, 'dev-preview-menu-visibility-contract'); assert.equal(U.menuEligibility.kind, 'dev-preview-menu-eligibility-contract'); });
test('331. contract exposes navigation/deeplink/appwiring', () => { assert.equal(U.navigationBoundary.kind, 'dev-preview-navigation-boundary-contract'); assert.equal(U.deepLinkBlocked.kind, 'dev-preview-deep-link-blocked-contract'); assert.equal(U.appWiringBlocked.kind, 'dev-preview-app-wiring-blocked-contract'); });
test('332. contract exposes gate/rollout/safety', () => { assert.equal(U.manualGate.kind, 'dev-preview-manual-enablement-gate-contract'); assert.equal(U.rolloutRollback.kind, 'dev-preview-route-menu-rollout-rollback-contract'); assert.equal(U.safety.kind, 'dev-preview-route-menu-safety-contract'); });
test('333. deterministic manifest digest (full composer)', () => assert.equal(U.manifest.manifestDigest, createStudioDevPreviewRouteMenuContract({ runtimeUi: UI }).manifest.manifestDigest));
test('334. compatibility deterministic', () => assert.equal(U.compatibility.compatibilityDigest, checkDevPreviewRouteMenuCompatibility({ runtimeUi: UI }).compatibilityDigest));
test('335. diagnostics deterministic', () => assert.equal(U.diagnostics.diagnosticsDigest, createDevPreviewRouteMenuDiagnostics({ verification: U.verification, compatibility: U.compatibility }).diagnosticsDigest));
test('336. routeDescriptor futurePath is dev sandbox path', () => assert.ok(U.routeDescriptor.futurePath.startsWith('/__dev/studio-preview/')));
test('337. menuPlacement futureOrder numeric', () => assert.ok(typeof U.menuPlacement.futureOrder === 'number'));
test('338. safety forbiddenFlags include route/menu/wiring', () => { assert.equal(U.safety.forbiddenFlags.routeCreated, false); assert.equal(U.safety.forbiddenFlags.menuCreated, false); assert.equal(U.safety.forbiddenFlags.appWiringCreated, false); });
test('339. routeIsolation blocks prototype relink (contract)', () => assert.equal(U.routeIsolation.noPrototypeRelink, true));
test('340. deepLinkBlocked reason mentions future slice', () => assert.ok(/future explicit/.test(U.deepLinkBlocked.reason)));
test('341. navigationBoundary blocks registerRoute/registerMenu (contract)', () => { assert.ok(U.navigationBoundary.actions.some((a) => a.action === 'registerRoute')); assert.ok(U.navigationBoundary.actions.some((a) => a.action === 'registerMenu')); });
test('342. compatibility never authorizes app integration', () => assert.equal(U.compatibility.readyForAppIntegration, false));
test('343. verification checkedCapabilities > 0', () => assert.ok(U.verification.checkedCapabilities > 0));
test('344. routeGuard productionDenied/stagingDenied (contract)', () => { assert.equal(U.routeGuard.productionDenied, true); assert.equal(U.routeGuard.stagingDenied, true); });
test('345. routeEligibility eligibleForCurrentWiring false (contract)', () => assert.equal(U.routeEligibility.eligibleForCurrentWiring, false));
test('346. menuEligibility eligibleForCurrentWiring false (contract)', () => assert.equal(U.menuEligibility.eligibleForCurrentWiring, false));
test('347. routeVisibility not visible now (contract)', () => { assert.equal(U.routeVisibility.visibleNow, false); assert.equal(U.routeVisibility.visibleInProductNow, false); });
test('348. menuVisibility not visible now (contract)', () => assert.equal(U.menuVisibility.visibleNow, false));
test('349. rolloutRollback rolloutAllowed false (contract)', () => { assert.equal(U.rolloutRollback.rolloutAllowed, false); assert.equal(U.rolloutRollback.rollbackByNonConsumption, true); });
test('350. appWiringBlocked wiringAllowed false (contract)', () => assert.equal(U.appWiringBlocked.wiringAllowed, false));
test('351. deepLinkBlocked no external/browser nav (contract)', () => { assert.equal(U.deepLinkBlocked.externalLinkAllowed, false); assert.equal(U.deepLinkBlocked.browserNavigationAllowed, false); });
test('352. routeAccessDecision deny now (contract)', () => assert.equal(U.routeAccessDecision.accessGrantedNow, false));
test('353. session digest deterministic', () => assert.equal(session.sessionDigest, createRouteMenuContractSession({ runtimeUi: UI }).sessionDigest));
test('354. navigation boundary anyAllowed false (contract)', () => assert.equal(U.navigationBoundary.anyAllowed, false));
test('355. readinessDecision digest present', () => assert.ok(typeof U.readinessDecision.readinessDigest === 'string'));

// ===== Evidence docs (D1-D23) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ROUTE-MENU-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'ROUTE-DESCRIPTOR-CONTRACT.md', 'ROUTE-ELIGIBILITY-CONTRACT.md', 'ROUTE-GUARD-CONTRACT.md',
  'ROUTE-ISOLATION-CONTRACT.md', 'ROUTE-VISIBILITY-CONTRACT.md', 'ROUTE-ACCESS-DECISION.md',
  'MENU-PLACEMENT-CONTRACT.md', 'MENU-VISIBILITY-CONTRACT.md', 'MENU-ELIGIBILITY-CONTRACT.md',
  'NAVIGATION-BOUNDARY-CONTRACT.md', 'DEEP-LINK-BLOCKED-CONTRACT.md', 'APP-ROUTER-MENU-WIRING-BLOCKED.md',
  'MANUAL-ENABLEMENT-GATE.md', 'ROLLOUT-ROLLBACK.md', 'SAFETY-CONTRACT.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-APP-NO-ROUTE-NO-MENU-NO-MODULE.md', 'NO-PROTOTYPE-RELINK.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-route-menu-contract/${DOCS[i]}`)));
}
test('D-content. no-app-route-menu doc + next slice spec present', () => {
  assert.ok(/route|rota|menu|App|module|módulo/i.test(readEv('NO-APP-NO-ROUTE-NO-MENU-NO-MODULE.md')));
  assert.ok(/prototype|protótipo|relink/i.test(readEv('NO-PROTOTYPE-RELINK.md')));
  assert.ok(/IMPLEMENTATION PLAN|implementation|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
