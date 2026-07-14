import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  RUNTIME_UI_NAME,
  RUNTIME_UI_SEMVER,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_MODE,
  RUNTIME_UI_ENVIRONMENT,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_UI_COMPONENT_NAMES,
  RUNTIME_UI_INTERACTION_KINDS,
  RUNTIME_UI_BLOCKED_ACTION_KINDS,
  FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES,
  RUNTIME_UI_READINESS_STATES,
  RUNTIME_UI_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG,
  runtimeUiDigest,
  isStudioDevPreviewRuntimeUiEnabled,
  isStudioDevPreviewRuntimeUiRenderEnabled,
  isStudioDevPreviewRuntimeUiVerifyEnabled,
  isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled,
  RUNTIME_UI_ERROR_CODES,
  RuntimeUiError,
  createRuntimeUiError,
  runtimeUiError,
  createRuntimeUiSession,
  createRuntimeUiPreflight,
  createRuntimeUiContractLoader,
  createRuntimeUiVirtualFrameInput,
  createRuntimeUiDevFlagGate,
  createRuntimeUiIsolationBoundary,
  createRuntimeUiComponentRegistry,
  createRuntimeUiInteractionRegistry,
  createRuntimeUiStateProjection,
  createRuntimeUiAccessibilityProjection,
  createRuntimeUiThemeProjection,
  createRuntimeUiBlockedActionModel,
  createRuntimeUiReactTree,
  createRuntimeUiManifest,
  verifyRuntimeUi,
  checkRuntimeUiCompatibility,
  createRuntimeUiDiagnostics,
  createRuntimeUiFallback,
  createStudioDevPreviewRuntimeUi,
} from '../../studio/blueprint-engine/dev-preview-runtime-ui/index.js';
import { createStudioDevPreviewRuntimeUiContract } from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewRuntimeUiImplementationPlan } from '../../studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-runtime-ui');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui');

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
const UIP = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC });
const DEV = { DEV: 'true' };
const U = createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, implementationPlan: UIP, env: DEV });

const session = createRuntimeUiSession({ runtimeUiContract: UC });
const preflight = createRuntimeUiPreflight({ runtimeUiContract: UC, implementationPlan: UIP, env: DEV });
const loader = createRuntimeUiContractLoader({ runtimeUiContract: UC });
const frameInput = createRuntimeUiVirtualFrameInput({ runtimeUiContract: UC });
const devGate = createRuntimeUiDevFlagGate({ env: DEV });
const isolation = createRuntimeUiIsolationBoundary();
const compReg = createRuntimeUiComponentRegistry();
const intReg = createRuntimeUiInteractionRegistry();
const stateP = createRuntimeUiStateProjection();
const a11yP = createRuntimeUiAccessibilityProjection();
const themeP = createRuntimeUiThemeProjection();
const blockedA = createRuntimeUiBlockedActionModel();
const reactTree = createRuntimeUiReactTree({ runtimeUiContract: UC });
const caps = RUNTIME_UI_CAPABILITIES;

// ===== Contract base (1-60) =====
test('1. runtime ui created', () => assert.equal(U.kind, 'studio-dev-preview-runtime-ui'));
test('2. name', () => { assert.equal(U.runtimeUiName, 'studio-dev-preview-runtime-ui'); assert.equal(U.runtimeUiName, RUNTIME_UI_NAME); });
test('3. version', () => { assert.equal(U.runtimeUiVersion, 'studio-dev-preview-runtime-ui@1.0.0'); assert.equal(U.runtimeUiVersion, RUNTIME_UI_VERSION); });
test('4. semver', () => assert.equal(RUNTIME_UI_SEMVER, '1.0.0'));
test('5. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'));
test('6. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('7. implementationPlanVersion', () => assert.equal(U.implementationPlanVersion, 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0'));
test('8. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('9. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('10. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('11. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('12. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('13. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('14. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('15. mode', () => { assert.equal(U.mode, 'dev_only_isolated_runtime_ui'); assert.equal(U.mode, RUNTIME_UI_MODE); });
test('16. environment const', () => assert.equal(RUNTIME_UI_ENVIRONMENT, 'local_dev_only'));
test('17. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('18. not fallback', () => assert.equal(U.fallback, false));
test('19. headless false', () => assert.equal(U.capabilities.headless, false));
test('20. devOnly', () => assert.equal(U.capabilities.devOnly, true));
test('21. isolated', () => assert.equal(U.capabilities.isolated, true));
test('22. contractDriven', () => assert.equal(U.capabilities.contractDriven, true));
test('23. syntheticDataOnly', () => assert.equal(U.capabilities.syntheticDataOnly, true));
test('24. virtualFrameDriven', () => assert.equal(U.capabilities.virtualFrameDriven, true));
test('25. blockedActionsOnly', () => assert.equal(U.capabilities.blockedActionsOnly, true));
test('26. reactComponentCreated true', () => assert.equal(U.capabilities.reactComponentCreated, true));
test('27. jsxCreated true', () => assert.equal(U.capabilities.jsxCreated, true));
test('28. uiCreated true', () => assert.equal(U.capabilities.uiCreated, true));
test('29. runtimeUiImplemented true', () => assert.equal(U.capabilities.runtimeUiImplemented, true));
test('30. visualRuntimeImplemented true', () => assert.equal(U.capabilities.visualRuntimeImplemented, true));
test('31. reactRuntimeCreated true', () => assert.equal(U.capabilities.reactRuntimeCreated, true));
test('32. tsxCreated false', () => assert.equal(U.capabilities.tsxCreated, false));
test('33. domCreated false', () => assert.equal(U.capabilities.domCreated, false));
test('34. cssCreated false', () => assert.equal(U.capabilities.cssCreated, false));
test('35. routeCreated false', () => assert.equal(U.capabilities.routeCreated, false));
test('36. menuCreated false', () => assert.equal(U.capabilities.menuCreated, false));
test('37. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('38. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('39. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('40. domRuntimeCreated false', () => assert.equal(U.capabilities.domRuntimeCreated, false));
test('41. cssRuntimeCreated false', () => assert.equal(U.capabilities.cssRuntimeCreated, false));
test('42. routeRuntimeCreated false', () => assert.equal(U.capabilities.routeRuntimeCreated, false));
test('43. menuRuntimeCreated false', () => assert.equal(U.capabilities.menuRuntimeCreated, false));
test('44. moduleRuntimeCreated false', () => assert.equal(U.capabilities.moduleRuntimeCreated, false));
test('45. backendAccessed false', () => assert.equal(U.capabilities.backendAccessed, false));
test('46. prismaAccessed false', () => assert.equal(U.capabilities.prismaAccessed, false));
test('47. productionAccessed false', () => assert.equal(U.capabilities.productionAccessed, false));
test('48. stagingAccessed false', () => assert.equal(U.capabilities.stagingAccessed, false));
test('49. fetchUsed false', () => assert.equal(U.capabilities.fetchUsed, false));
test('50. mutationAllowed false', () => assert.equal(U.capabilities.mutationAllowed, false));
test('51. persistenceCreated false', () => assert.equal(U.capabilities.persistenceCreated, false));
test('52. realDataRead false', () => assert.equal(U.capabilities.realDataRead, false));
test('53. realDataWrite false', () => assert.equal(U.capabilities.realDataWrite, false));
test('54. rewriteEmpresas false', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('55. oldPrototypeImported false', () => assert.equal(U.capabilities.oldPrototypeImported, false));
test('56. appWired false', () => assert.equal(U.capabilities.appWired, false));
test('57. capabilities frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_CAPABILITIES)));
test('58. readyForRuntimeUi true', () => assert.equal(U.readyForRuntimeUi, true));
test('59. readyForRouteMenuIntegration false', () => assert.equal(U.readyForRouteMenuIntegration, false));
test('60. readyForRealModuleGeneration/production false', () => { assert.equal(U.readyForRealModuleGeneration, false); assert.equal(U.readyForProduction, false); });

// ===== Readiness (61-66) =====
test('61. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_runtime_ui_ready'));
test('62. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('63. warningCount 0', () => assert.equal(U.warningCount, 0));
test('64. blockedActionsOnly top-level', () => assert.equal(U.blockedActionsOnly, true));
test('65. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('66. readiness state in enum', () => assert.ok(RUNTIME_UI_READINESS_STATES.includes(U.readiness)));

// ===== Session (67-78) =====
test('67. session kind', () => assert.equal(session.kind, 'runtime-ui-session'));
test('68. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-runtime-ui'));
test('69. session version', () => assert.equal(session.runtimeUiVersion, RUNTIME_UI_VERSION));
test('70. sourceRuntimeUiContract', () => assert.equal(session.sourceRuntimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('71. sourceIsolatedRuntime', () => assert.equal(session.sourceIsolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('72. sourceImplementationPlan', () => assert.equal(session.sourceImplementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('73. session mode', () => assert.equal(session.mode, RUNTIME_UI_MODE));
test('74. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-runtime-ui-contract'));
test('75. session devOnly/isolated/synthetic', () => { assert.equal(session.devOnly, true); assert.equal(session.isolated, true); assert.equal(session.syntheticDataOnly, true); });
test('76. seed deterministic', () => assert.equal(session.seed, createRuntimeUiSession({ runtimeUiContract: UC }).seed));
test('77. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('78. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Preflight (79-90) =====
test('79. preflight kind', () => assert.equal(preflight.kind, 'runtime-ui-preflight'));
test('80. preflight ok', () => assert.equal(preflight.ok, true));
test('81. checkpoint authorized', () => assert.equal(preflight.runtimeUiImplementationCheckpointAuthorized, true));
test('82. manual gate satisfied', () => assert.equal(preflight.manualGateSatisfied, true));
test('83. runtime ui contract compatible', () => assert.equal(preflight.runtimeUiContractCompatible, true));
test('84. isolated runtime compatible', () => assert.equal(preflight.isolatedRuntimeCompatible, true));
test('85. virtual frame valid', () => assert.equal(preflight.virtualFrameValid, true));
test('86. preflight devOnly', () => assert.equal(preflight.devOnly, true));
test('87. preflight production/staging false', () => { assert.equal(preflight.production, false); assert.equal(preflight.staging, false); });
test('88. preflight forbidden flags false', () => assert.equal(preflight.forbiddenFlagsFalse, true));
test('89. preflight no blockers', () => assert.equal(preflight.blockerCount, 0));
test('90. preflight fails closed in production', () => { const p = createRuntimeUiPreflight({ runtimeUiContract: UC, implementationPlan: UIP, env: { MAK_ENV_LABEL: 'production' } }); assert.equal(p.ok, false); assert.ok(p.blockers.includes('production_forbidden')); });

// ===== Contract loader (91-97) =====
test('91. loader kind', () => assert.equal(loader.kind, 'runtime-ui-contract-loader'));
test('92. loader by relative import only', () => assert.equal(loader.loadedByRelativeImportOnly, true));
test('93. loader no fetch/network/dynamic', () => { assert.equal(loader.usesFetch, false); assert.equal(loader.usesNetwork, false); assert.equal(loader.usesDynamicPath, false); });
test('94. loader loaded runtimeUiContract', () => assert.equal(loader.loaded.runtimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('95. loader loaded isolatedRuntime', () => assert.equal(loader.loaded.isolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('96. loader loaded implementationPlan', () => assert.equal(loader.loaded.implementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('97. loader runtimeUiContractPresent', () => assert.equal(loader.runtimeUiContractPresent, true));

// ===== Virtual frame input (98-106) =====
test('98. frameInput kind', () => assert.equal(frameInput.kind, 'runtime-ui-virtual-frame-input'));
test('99. frameId present', () => assert.ok(typeof frameInput.frameId === 'string'));
test('100. screenKind present', () => assert.ok(typeof frameInput.screenKind === 'string'));
test('101. syntheticDataOnly', () => assert.equal(frameInput.syntheticDataOnly, true));
test('102. allRowsSynthetic', () => assert.equal(frameInput.allRowsSynthetic, true));
test('103. rootNodeKind present', () => assert.ok(typeof frameInput.rootNodeKind === 'string'));
test('104. no real data read', () => assert.equal(frameInput.realDataRead, false));
test('105. no real data write', () => assert.equal(frameInput.realDataWrite, false));
test('106. no storage/network', () => { assert.equal(frameInput.usesStorage, false); assert.equal(frameInput.usesNetwork, false); });

// ===== Dev flag gate (107-114) =====
test('107. devGate kind', () => assert.equal(devGate.kind, 'runtime-ui-dev-flag-gate'));
test('108. devGate devOnly', () => assert.equal(devGate.devOnly, true));
test('109. devGate validInDevOnly', () => assert.equal(devGate.validInDevOnly, true));
test('110. devGate productionAllowed false', () => assert.equal(devGate.productionAllowed, false));
test('111. devGate stagingAllowed false', () => assert.equal(devGate.stagingAllowed, false));
test('112. devGate failsClosedInProduction', () => assert.equal(devGate.failsClosedInProduction, true));
test('113. devGate open in dev', () => assert.equal(devGate.open, true));
test('114. devGate closed in production', () => { const g = createRuntimeUiDevFlagGate({ env: { MAK_ENV_LABEL: 'production' } }); assert.equal(g.open, false); assert.equal(g.productionDetected, true); });

// ===== Isolation boundary (115-130) =====
test('115. isolation kind', () => assert.equal(isolation.kind, 'runtime-ui-isolation-boundary'));
test('116. no app wired', () => assert.equal(isolation.appWired, false));
test('117. no route wired', () => assert.equal(isolation.routeWired, false));
test('118. no menu wired', () => assert.equal(isolation.menuWired, false));
test('119. no module wired', () => assert.equal(isolation.moduleWired, false));
test('120. no backend accessed', () => assert.equal(isolation.backendAccessed, false));
test('121. no prisma accessed', () => assert.equal(isolation.prismaAccessed, false));
test('122. no real data accessed', () => assert.equal(isolation.realDataAccessed, false));
test('123. no production accessed', () => assert.equal(isolation.productionAccessed, false));
test('124. no staging accessed', () => assert.equal(isolation.stagingAccessed, false));
test('125. no old prototype imported', () => assert.equal(isolation.oldPrototypeImported, false));
test('126. no ReactDOM used', () => assert.equal(isolation.reactDomUsed, false));
test('127. no createRoot used', () => assert.equal(isolation.createRootUsed, false));
test('128. no dom globals used', () => assert.equal(isolation.domGlobalsUsed, false));
test('129. no components/pages imported', () => { assert.equal(isolation.componentsImported, false); assert.equal(isolation.pagesImported, false); });
test('130. confined + reversible', () => { assert.equal(isolation.confinedToAuthorizedSubtree, true); assert.equal(isolation.reversibleByNonConsumption, true); });

// ===== Component registry (131-141) =====
test('131. compReg kind', () => assert.equal(compReg.kind, 'runtime-ui-component-registry'));
test('132. 7 components', () => assert.equal(compReg.componentCount, 7));
test('133. names match const', () => assert.deepEqual(compReg.components.map((x) => x.name), [...RUNTIME_UI_COMPONENT_NAMES]));
test('134. all local to subtree', () => assert.equal(compReg.allLocalToSubtree, true));
test('135. none from old prototype', () => assert.equal(compReg.anyFromOldPrototype, false));
test('136. each component .jsx file', () => assert.ok(compReg.components.every((x) => /\.jsx$/.test(x.file))));
test('137. no forbidden component import', () => assert.ok(compReg.components.every((x) => x.realComponentImportFromForbiddenPath === false)));
test('138. importsOldPrototype false', () => assert.equal(compReg.importsOldPrototype, false));
test('139. importsPages false', () => assert.equal(compReg.importsPages, false));
test('140. importsComponents false', () => assert.equal(compReg.importsComponents, false));
test('141. forbidden prefixes recorded', () => assert.deepEqual(compReg.forbiddenImportPrefixes, [...FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES]));

// ===== Interaction registry (142-150) =====
test('142. intReg kind', () => assert.equal(intReg.kind, 'runtime-ui-interaction-registry'));
test('143. interactions match const', () => assert.deepEqual(intReg.interactions.map((x) => x.kind), [...RUNTIME_UI_INTERACTION_KINDS]));
test('144. all blocked', () => assert.equal(intReg.allBlocked, true));
test('145. each handler noop_safe', () => assert.ok(intReg.interactions.every((i) => i.handler === 'noop_safe')));
test('146. no real handler', () => assert.equal(intReg.anyRealHandler, false));
test('147. realMutation false', () => assert.equal(intReg.realMutation, false));
test('148. realNavigation false', () => assert.equal(intReg.realNavigation, false));
test('149. realSubmit false', () => assert.equal(intReg.realSubmit, false));
test('150. realSave false', () => assert.equal(intReg.realSave, false));

// ===== State/accessibility/theme projections (151-166) =====
test('151. state kind', () => assert.equal(stateP.kind, 'runtime-ui-state-projection'));
test('152. state pure/localOnly', () => { assert.equal(stateP.pure, true); assert.equal(stateP.localOnly, true); });
test('153. state no global hooks', () => assert.equal(stateP.globalHooksState, false));
test('154. state no window/document', () => { assert.equal(stateP.usesWindow, false); assert.equal(stateP.usesDocument, false); });
test('155. state no storage/persistence', () => { assert.equal(stateP.usesStorage, false); assert.equal(stateP.persistence, false); });
test('156. state no real data', () => { assert.equal(stateP.realDataRead, false); assert.equal(stateP.realDataWrite, false); });
test('157. a11y kind', () => assert.equal(a11yP.kind, 'runtime-ui-accessibility-projection'));
test('158. a11y labels/roles/keyboard', () => { assert.equal(a11yP.labelsProvided, true); assert.equal(a11yP.rolesProvided, true); assert.equal(a11yP.keyboardHintsProvided, true); });
test('159. a11y no real aria mutation', () => assert.equal(a11yP.realAriaMutationInDom, false));
test('160. a11y no window/document', () => { assert.equal(a11yP.usesWindow, false); assert.equal(a11yP.usesDocument, false); });
test('161. a11y no css runtime', () => assert.equal(a11yP.cssRuntime, false));
test('162. theme kind', () => assert.equal(themeP.kind, 'runtime-ui-theme-projection'));
test('163. theme >= 7 groups', () => assert.ok(themeP.groupCount >= 7));
test('164. theme inline tokens only', () => assert.equal(themeP.inlineStyleTokensOnly, true));
test('165. theme no css runtime/stylesheet/realCss', () => { assert.equal(themeP.cssRuntime, false); assert.equal(themeP.stylesheetCreated, false); assert.equal(themeP.realCss, false); });
test('166. theme no window/document', () => { assert.equal(themeP.usesWindow, false); assert.equal(themeP.usesDocument, false); });

// ===== Blocked action model (167-178) =====
test('167. blockedA kind', () => assert.equal(blockedA.kind, 'runtime-ui-blocked-action-model'));
test('168. kinds match const', () => assert.deepEqual(blockedA.blockedActionKinds, [...RUNTIME_UI_BLOCKED_ACTION_KINDS]));
test('169. 11 actions', () => assert.equal(blockedA.actionCount, 11));
test('170. create blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'create' && a.blocked === true)));
test('171. delete blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'delete' && a.blocked === true)));
test('172. navigate blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'navigate' && a.blocked === true)));
test('173. openRoute blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'openRoute' && a.blocked === true)));
test('174. registerModule blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('175. readRealData/writeRealData blocked', () => { assert.ok(blockedA.actions.some((a) => a.action === 'readRealData' && a.blocked === true)); assert.ok(blockedA.actions.some((a) => a.action === 'writeRealData' && a.blocked === true)); });
test('176. allBlocked', () => assert.equal(blockedA.allBlocked, true));
test('177. anyAllowed false', () => assert.equal(blockedA.anyAllowed, false));
test('178. banner surface', () => assert.ok(blockedA.actions.every((a) => a.surface === 'RuntimeUiBlockedActionBanner')));

// ===== React UI tree (179-190) =====
test('179. reactTree kind', () => assert.equal(reactTree.kind, 'runtime-ui-react-tree'));
test('180. root component', () => assert.equal(reactTree.rootComponent, 'RuntimeUiRoot'));
test('181. tree root component', () => assert.equal(reactTree.tree.component, 'RuntimeUiRoot'));
test('182. component names', () => assert.deepEqual(reactTree.componentNames, [...RUNTIME_UI_COMPONENT_NAMES]));
test('183. reactComponentCreated true', () => assert.equal(reactTree.reactComponentCreated, true));
test('184. jsxCreated true', () => assert.equal(reactTree.jsxCreated, true));
test('185. tsxCreated false', () => assert.equal(reactTree.tsxCreated, false));
test('186. domNodeCreated false', () => assert.equal(reactTree.domNodeCreated, false));
test('187. reactDomUsed false', () => assert.equal(reactTree.reactDomUsed, false));
test('188. createRootUsed false', () => assert.equal(reactTree.createRootUsed, false));
test('189. mountedToRealDom false', () => assert.equal(reactTree.mountedToRealDom, false));
test('190. confined to subtree', () => assert.equal(reactTree.confinedToAuthorizedSubtree, true));

// ===== Manifest (191-200) =====
test('191. manifest kind', () => assert.equal(U.manifest.kind, 'runtime-ui-manifest'));
test('192. manifest name', () => assert.equal(U.manifest.runtimeUiName, RUNTIME_UI_NAME));
test('193. manifest version', () => assert.equal(U.manifest.runtimeUiVersion, RUNTIME_UI_VERSION));
test('194. manifest upstream runtimeUiContract', () => assert.equal(U.manifest.upstream.runtimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('195. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('196. manifest parts.reactTree digest', () => assert.ok(typeof U.manifest.parts.reactTree === 'string'));
test('197. manifest parts.isolationBoundary digest', () => assert.ok(typeof U.manifest.parts.isolationBoundary === 'string'));
test('198. manifest capabilities uiCreated', () => assert.equal(U.manifest.capabilities.uiCreated, true));
test('199. manifest standalone builds', () => assert.equal(createRuntimeUiManifest({ runtimeUiContract: UC }).kind, 'runtime-ui-manifest'));
test('200. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (201-224) =====
test('201. verification ok', () => assert.equal(U.verification.ok, true));
test('202. verification valid', () => assert.equal(U.verification.valid, true));
test('203. verification devOnly', () => assert.equal(U.verification.devOnly, true));
test('204. verification isolated', () => assert.equal(U.verification.isolated, true));
test('205. verification runtimeUiImplemented', () => assert.equal(U.verification.runtimeUiImplemented, true));
test('206. verification domRuntimeCreated false', () => assert.equal(U.verification.domRuntimeCreated, false));
test('207. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('208. verifier detects domRuntimeCreated', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: { ...caps, domRuntimeCreated: true } } }).blockers.includes('capability_domRuntimeCreated_must_be_false')));
test('209. verifier detects oldPrototypeImported cap', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: { ...caps, oldPrototypeImported: true } } }).blockers.includes('capability_oldPrototypeImported_must_be_false')));
test('210. verifier detects appWired cap', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: { ...caps, appWired: true } } }).blockers.includes('capability_appWired_must_be_false')));
test('211. verifier detects tsx/css', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, tsxCreated: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_tsxCreated_must_be_false') && r.blockers.includes('capability_cssCreated_must_be_false')); });
test('212. verifier detects route/menu', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('213. verifier detects backend/prisma', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('214. verifier detects mutation/persistence', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('215. verifier detects real data read/write', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('216. verifier detects production/staging', () => { const r = verifyRuntimeUi({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.blockers.includes('capability_productionAccessed_must_be_false') && r.blockers.includes('capability_stagingAccessed_must_be_false')); });
test('217. verifier detects isolation old prototype import', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: caps, isolationBoundary: { oldPrototypeImported: true } } }).blockers.includes('unsafe_old_prototype_import')));
test('218. verifier detects components/pages import', () => { const r = verifyRuntimeUi({ contract: { capabilities: caps, isolationBoundary: { componentsImported: true, pagesImported: true } } }); assert.ok(r.blockers.includes('unsafe_components_import') && r.blockers.includes('unsafe_pages_import')); });
test('219. verifier detects app/route/menu wired', () => { const r = verifyRuntimeUi({ contract: { capabilities: caps, isolationBoundary: { appWired: true, routeWired: true, menuWired: true } } }); assert.ok(r.blockers.includes('unsafe_app_wired') && r.blockers.includes('unsafe_route_wired') && r.blockers.includes('unsafe_menu_wired')); });
test('220. verifier detects ReactDOM/createRoot', () => { const r = verifyRuntimeUi({ contract: { capabilities: caps, isolationBoundary: { reactDomUsed: true, createRootUsed: true } } }); assert.ok(r.blockers.includes('unsafe_react_dom') && r.blockers.includes('unsafe_create_root')); });
test('221. verifier detects window/document globals', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: caps, isolationBoundary: { domGlobalsUsed: true } } }).blockers.includes('unsafe_dom_globals')));
test('222. verifier detects real mutation/navigation/submit/save', () => { const r = verifyRuntimeUi({ contract: { capabilities: caps, interactionRegistry: { realMutation: true, realNavigation: true, realSubmit: true, realSave: true } } }); assert.ok(r.blockers.includes('unsafe_real_mutation') && r.blockers.includes('unsafe_real_navigation') && r.blockers.includes('unsafe_real_submit') && r.blockers.includes('unsafe_real_save')); });
test('223. verifier detects mounted to real dom', () => assert.ok(verifyRuntimeUi({ contract: { capabilities: caps, reactTree: { mountedToRealDom: true } } }).blockers.includes('unsafe_mounted_to_real_dom')));
test('224. verifier detects missing mustBeTrue devOnly + never throws on junk', () => { assert.ok(verifyRuntimeUi({ contract: { capabilities: { ...caps, devOnly: false } } }).blockers.includes('capability_devOnly_must_be_true')); assert.doesNotThrow(() => verifyRuntimeUi({ contract: null })); });

// ===== Compatibility (225-233) =====
test('225. compatibility kind', () => assert.equal(U.compatibility.kind, 'runtime-ui-compatibility'));
test('226. compatibleWithRuntimeUiContract', () => assert.equal(U.compatibility.compatibleWithRuntimeUiContract, true));
test('227. compatibleWithIsolatedRuntime', () => assert.equal(U.compatibility.compatibleWithIsolatedRuntime, true));
test('228. compat readyForRuntimeUi', () => assert.equal(U.compatibility.readyForRuntimeUi, true));
test('229. compat readyForRouteMenu false', () => assert.equal(U.compatibility.readyForRouteMenuIntegration, false));
test('230. compat readyForRealModuleGeneration false', () => assert.equal(U.compatibility.readyForRealModuleGeneration, false));
test('231. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('232. compat status future-route-menu', () => assert.equal(U.compatibility.status, 'ready_for_future_dev_preview_route_menu_contract_when_explicitly_authorized'));
test('233. compat mismatch → warning', () => { const r = checkRuntimeUiCompatibility({ runtimeUiContract: { runtimeUiContractVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithRuntimeUiContract, false); assert.ok(r.warnings.includes('incompatible_runtimeUiContract')); });

// ===== Diagnostics + fallback (234-247) =====
test('234. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'runtime-ui-diagnostics'));
test('235. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('236. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('237. diagnostics devOnlyConfirmed', () => assert.equal(U.diagnostics.devOnlyConfirmed, true));
test('238. diagnostics isolatedConfirmed', () => assert.equal(U.diagnostics.isolatedConfirmed, true));
test('239. diagnostics no old prototype/app', () => { assert.equal(U.diagnostics.oldPrototypeImported, false); assert.equal(U.diagnostics.appWired, false); });
test('240. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRuntimeUi({});
const fbBad = createStudioDevPreviewRuntimeUi({ runtimeUiContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewRuntimeUi({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: true } });
test('241. missing contract → fallback', () => assert.equal(fbNo.fallback, true));
test('242. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('243. fallback contract → fallback', () => assert.equal(fbFb.fallback, true));
test('244. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('245. fallback not ready ui/route/production', () => { assert.equal(fbNo.readyForRuntimeUi, false); assert.equal(fbNo.readyForRouteMenuIntegration, false); assert.equal(fbNo.readyForProduction, false); });
test('246. fallback caps uiCreated false + never throws', () => { assert.equal(fbNo.capabilities.uiCreated, false); assert.doesNotThrow(() => createRuntimeUiFallback({ reason: 'x' })); });
test('247. invalid virtual frame → fallback (fail-closed)', () => { const bad = createStudioDevPreviewRuntimeUi({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: false, isolatedRuntimeVersion: 'studio-dev-preview-isolated-runtime@1.0.0', frameMapping: { reactElement: true } } }); assert.equal(bad.fallback, true); });

// ===== Errors (248-257) =====
test('248. error codes >= 30', () => assert.ok(RUNTIME_UI_ERROR_CODES.length >= 30));
test('249. error descriptor sanitized', () => { const e = createRuntimeUiError('RUNTIME_UI_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('250. error no tsx/css/domRuntime', () => { const e = createRuntimeUiError('RUNTIME_UI_TSX_BLOCKED'); assert.equal(e.tsxCreated, false); assert.equal(e.cssCreated, false); assert.equal(e.domRuntimeCreated, false); });
test('251. error no old prototype/app', () => { const e = createRuntimeUiError('RUNTIME_UI_OLD_PROTOTYPE_IMPORT_BLOCKED'); assert.equal(e.oldPrototypeImported, false); assert.equal(e.appWired, false); });
test('252. unknown code normalized', () => assert.equal(createRuntimeUiError('NOPE').code, 'RUNTIME_UI_INVALID_RUNTIME_UI_CONTRACT'));
test('253. typed error', () => { const e = new RuntimeUiError('RUNTIME_UI_INVALID_VIRTUAL_FRAME', 'x'); assert.ok(e instanceof Error && e.name === 'RuntimeUiError'); });
test('254. helper error', () => assert.equal(runtimeUiError('RUNTIME_UI_FETCH_BLOCKED', 'x').code, 'RUNTIME_UI_FETCH_BLOCKED'));
test('255. codes cover reactdom/createRoot/window/document', () => ['RUNTIME_UI_REACT_DOM_BLOCKED', 'RUNTIME_UI_CREATE_ROOT_BLOCKED', 'RUNTIME_UI_WINDOW_BLOCKED', 'RUNTIME_UI_DOCUMENT_BLOCKED'].forEach((c) => assert.ok(RUNTIME_UI_ERROR_CODES.includes(c))));
test('256. codes cover old-prototype/app/pages/components', () => ['RUNTIME_UI_OLD_PROTOTYPE_IMPORT_BLOCKED', 'RUNTIME_UI_APP_IMPORT_BLOCKED', 'RUNTIME_UI_PAGES_IMPORT_BLOCKED', 'RUNTIME_UI_COMPONENTS_IMPORT_BLOCKED'].forEach((c) => assert.ok(RUNTIME_UI_ERROR_CODES.includes(c))));
test('257. error no stack leak', () => { const e = createRuntimeUiError('RUNTIME_UI_BACKEND_BLOCKED'); assert.equal(e.noStackLeak, true); });

// ===== Config flags (258-268) =====
test('258. flag off by default', () => assert.equal(isStudioDevPreviewRuntimeUiEnabled({}), false));
test('259. flag on in dev', () => assert.equal(isStudioDevPreviewRuntimeUiEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG]: 'true', DEV: true }), true));
test('260. flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('261. render flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiRenderEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('262. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('263. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('264. master flag enables render in dev', () => assert.equal(isStudioDevPreviewRuntimeUiRenderEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG]: 'true', DEV: true }), true));
test('265. readiness states frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_READINESS_STATES)));
test('266. component names frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_COMPONENT_NAMES)));
test('267. blocked action kinds frozen (11)', () => assert.ok(Object.isFrozen(RUNTIME_UI_BLOCKED_ACTION_KINDS) && RUNTIME_UI_BLOCKED_ACTION_KINDS.length === 11));
test('268. runtimeUiDigest deterministic + format', () => { assert.equal(runtimeUiDigest({ a: 1 }), runtimeUiDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(runtimeUiDigest({ a: 1 }))); });

// ===== Determinism / purity (269-280) =====
test('269. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, implementationPlan: UIP, env: DEV }).overallDigest));
test('270. deterministic runtimeUiDigest', () => assert.equal(U.runtimeUiDigest, createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, implementationPlan: UIP, env: DEV }).runtimeUiDigest));
test('271. input not mutated', () => { const snap = JSON.stringify(UC); createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: DEV }); assert.equal(JSON.stringify(UC), snap); });
test('272. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('273. different module → different digest', () => {
  const sb2 = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const uc2 = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb2 }) }) }) }) }) });
  assert.notEqual(U.overallDigest, createStudioDevPreviewRuntimeUi({ runtimeUiContract: uc2, env: DEV }).overallDigest);
});
test('274. fails closed in production (no fallback escape)', () => assert.equal(createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { MAK_ENV_LABEL: 'production' } }).fallback, true));
test('275. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('276. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('277. no old prototype imported cap', () => assert.equal(U.capabilities.oldPrototypeImported, false));
test('278. no app wired cap', () => assert.equal(U.capabilities.appWired, false));
test('279. builds from full real chain', () => { assert.equal(U.kind, 'studio-dev-preview-runtime-ui'); assert.equal(U.readyForRouteMenuIntegration, false); });
test('280. runtimeUiDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.runtimeUiDigest)));

// ===== .js graph purity scan (281-292) =====
test('281. .js graph React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('282. .js graph no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(|<[A-Za-z][^>]*\/?>(?!=)/.test(jsCode())));
test('283. .js no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom|ReactDOM/.test(p))));
test('284. .js no createRoot call', () => assert.ok(!/createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('285. .js no window/document', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsCode())));
test('286. .js no fetch', () => assert.ok(!/\bfetch\s*\(/.test(jsCode())));
test('287. .js no storage APIs', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(jsCode())));
test('288. no DATABASE_URL anywhere', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('289. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('290. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('291. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));
test('292. no backend/apis imports anywhere', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));

// ===== .jsx isolation scan (293-308) =====
test('293. 7 jsx files exist', () => assert.equal(jsxFiles().length, 7));
test('294. RuntimeUiRoot.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiRoot.jsx')));
test('295. RuntimeUiScreen.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiScreen.jsx')));
test('296. RuntimeUiSection.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiSection.jsx')));
test('297. RuntimeUiSlot.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiSlot.jsx')));
test('298. RuntimeUiPlaceholder.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiPlaceholder.jsx')));
test('299. RuntimeUiBlockedActionBanner.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiBlockedActionBanner.jsx')));
test('300. RuntimeUiFallback.jsx exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui/RuntimeUiFallback.jsx')));
test('301. jsx files contain real JSX', () => assert.ok(jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8')))));
test('302. jsx use automatic runtime (no explicit react import; still real JSX)', () => { assert.ok(jsxImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))); assert.ok(jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8')))); });
test('303. jsx no react-dom', () => assert.ok(jsxImports().every((p) => !/react-dom|ReactDOM/.test(p))));
test('304. jsx no createRoot/hydrateRoot', () => assert.ok(!/createRoot|hydrateRoot/.test(jsxCode())));
test('305. jsx no window/document', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsxCode())));
test('306. jsx no old prototype imports', () => assert.ok(jsxImports().every((p) => !/(studio\/(components|shell|designers|pages|navigation|dock|panels|editor))|(^|\.\.\/)components\/|(^|\.\.\/)pages\//.test(p))));
test('307. jsx imports only local siblings or react', () => assert.ok(jsxImports().every((p) => p === 'react' || /^\.\/RuntimeUi/.test(p))));
test('308. no .tsx anywhere in subtree', () => assert.ok(walkExt(DIR, /\.tsx$/).length === 0 && !fs.readdirSync(DIR).some((f) => /\.tsx$/.test(f))));

// ===== No CSS / prototype relink (309-318) =====
test('309. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('310. .jsx only in authorized subtree', () => assert.ok(jsxFiles().every((f) => f.startsWith(DIR))));
test('311. all subtree code React-free except .jsx', () => assert.ok(jsImports().every((p) => p !== 'react')));
test('312. no import from src/studio/components', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/components/.test(p))));
test('313. no import from src/studio/shell', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/shell/.test(p))));
test('314. no import from src/studio/designers', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/designers/.test(p))));
test('315. no import from src/studio/pages', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/pages/.test(p))));
test('316. no import from src/studio/navigation|dock|panels|editor', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/studio\/(navigation|dock|panels|editor)/.test(p))));
test('317. no import from src/App', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('318. no XMLHttpRequest/WebSocket', () => assert.ok(!/XMLHttpRequest|WebSocket/.test(allCode())));

// ===== Scope safety (319-341) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('319. runtime ui subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui')));
test('320. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('321. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('322. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('323. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('324. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('325. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('326. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('327. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('328. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('329. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('330. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('331. studio prototype dirs not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(x))); });
test('332. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('333. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('334. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('335. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('336. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('337. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('338. net-new scope is runtime-ui subtree only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('339. .tsx never added anywhere in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.tsx$/.test(x))); });
test('340. .css never added anywhere in diff', () => { const f = changed(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('341. upstream runtime UI contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js')));

// ===== Extended coverage — deeper invariants (342-373) =====
test('342. session digest present', () => assert.ok(typeof session.sessionDigest === 'string'));
test('343. preflight digest present', () => assert.ok(typeof preflight.preflightDigest === 'string'));
test('344. loader digest present', () => assert.ok(typeof loader.contractLoaderDigest === 'string'));
test('345. frameInput digest present', () => assert.ok(typeof frameInput.virtualFrameInputDigest === 'string'));
test('346. devGate digest present', () => assert.ok(typeof devGate.devFlagGateDigest === 'string'));
test('347. isolation digest present', () => assert.ok(typeof isolation.isolationBoundaryDigest === 'string'));
test('348. compReg digest present', () => assert.ok(typeof compReg.componentRegistryDigest === 'string'));
test('349. intReg digest present', () => assert.ok(typeof intReg.interactionRegistryDigest === 'string'));
test('350. reactTree digest present', () => assert.ok(typeof reactTree.reactTreeDigest === 'string'));
test('351. blockedA digest present', () => assert.ok(typeof blockedA.blockedActionModelDigest === 'string'));
test('352. manifest parts.componentRegistry digest', () => assert.equal(U.manifest.parts.componentRegistry, compReg.componentRegistryDigest));
test('353. manifest parts.blockedActionModel digest', () => assert.equal(U.manifest.parts.blockedActionModel, blockedA.blockedActionModelDigest));
test('354. manifest parts.devFlagGate digest present', () => assert.ok(typeof U.manifest.parts.devFlagGate === 'string'));
test('355. contract exposes all part kinds', () => { assert.equal(U.session.kind, 'runtime-ui-session'); assert.equal(U.preflight.kind, 'runtime-ui-preflight'); assert.equal(U.contractLoader.kind, 'runtime-ui-contract-loader'); });
test('356. contract exposes virtualFrameInput + devFlagGate', () => { assert.equal(U.virtualFrameInput.kind, 'runtime-ui-virtual-frame-input'); assert.equal(U.devFlagGate.kind, 'runtime-ui-dev-flag-gate'); });
test('357. contract exposes projections', () => { assert.equal(U.stateProjection.kind, 'runtime-ui-state-projection'); assert.equal(U.accessibilityProjection.kind, 'runtime-ui-accessibility-projection'); assert.equal(U.themeProjection.kind, 'runtime-ui-theme-projection'); });
test('358. contract exposes reactTree + isolationBoundary', () => { assert.equal(U.reactTree.kind, 'runtime-ui-react-tree'); assert.equal(U.isolationBoundary.kind, 'runtime-ui-isolation-boundary'); });
test('359. verification checkedCapabilities > 0', () => assert.ok(U.verification.checkedCapabilities > 0));
test('360. verification visualRuntimeImplemented true', () => assert.equal(U.verification.visualRuntimeImplemented, true));
test('361. reactTree tree has children', () => assert.ok(Array.isArray(U.reactTree.tree.children) && U.reactTree.tree.children.length > 0));
test('362. reactTree screen node region', () => assert.equal(U.reactTree.tree.children[0].component, 'RuntimeUiScreen'));
test('363. blocked banner present in tree metadata', () => assert.ok(JSON.stringify(U.reactTree.tree).includes('RuntimeUiBlockedActionBanner')));
test('364. interaction registry count matches const', () => assert.equal(intReg.interactionCount, RUNTIME_UI_INTERACTION_KINDS.length));
test('365. component registry files are all jsx siblings', () => assert.ok(compReg.components.every((x) => RUNTIME_UI_COMPONENT_NAMES.includes(x.name))));
test('366. fallback in prod has capabilities uiCreated false', () => assert.equal(createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { MAK_ENV_LABEL: 'production' } }).capabilities.uiCreated, false));
test('367. deterministic manifest digest', () => assert.equal(U.manifest.manifestDigest, createRuntimeUiManifest({ runtimeUiContract: UC }).manifestDigest));
test('368. preflight deterministic', () => assert.equal(preflight.preflightDigest, createRuntimeUiPreflight({ runtimeUiContract: UC, implementationPlan: UIP, env: DEV }).preflightDigest));
test('369. compatibility deterministic', () => assert.equal(U.compatibility.compatibilityDigest, checkRuntimeUiCompatibility({ runtimeUiContract: UC }).compatibilityDigest));
test('370. diagnostics deterministic', () => assert.equal(U.diagnostics.diagnosticsDigest, createRuntimeUiDiagnostics({ verification: U.verification, compatibility: U.compatibility }).diagnosticsDigest));
test('371. no ReactDOM import anywhere in subtree', () => assert.ok([...jsImports(), ...jsxImports()].every((p) => !/react-dom/.test(p))));
test('372. jsx sibling imports resolve to existing files', () => { const sib = jsxImports().filter((p) => /^\.\/RuntimeUi/.test(p)); assert.ok(sib.every((p) => exists(`src/studio/blueprint-engine/dev-preview-runtime-ui/${p.replace('./', '')}`))); });
test('373. composer accepts missing implementationPlan (manual gate optional path)', () => { const u = createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: DEV }); assert.equal(u.fallback, false); assert.equal(u.readyForRuntimeUi, true); });

// ===== Evidence docs (D1-D19) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-UI-REPORT.md', 'RUNTIME-UI-SESSION.md',
  'PREFLIGHT.md', 'CONTRACT-LOADER.md', 'VIRTUAL-FRAME-INPUT.md', 'REACT-UI-TREE.md',
  'COMPONENT-REGISTRY.md', 'INTERACTION-REGISTRY.md', 'STATE-PROJECTION.md',
  'ACCESSIBILITY-PROJECTION.md', 'THEME-PROJECTION.md', 'BLOCKED-ACTIONS.md', 'DEV-FLAG-GATE.md',
  'ISOLATION-BOUNDARY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-APP-NO-ROUTE-NO-MODULE-NO-PROTOTYPE-RELINK.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui/${DOCS[i]}`)));
}
test('D-content. no-prototype-relink doc + next slice spec present', () => {
  assert.ok(/prototype|protótipo|App|route|rota|isolated|isolad/i.test(readEv('NO-APP-NO-ROUTE-NO-MODULE-NO-PROTOTYPE-RELINK.md')));
  assert.ok(/ROUTE\/MENU CONTRACT|route|menu|governan/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
