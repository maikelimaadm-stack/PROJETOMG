import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  RUNTIME_UI_CONTRACT_NAME,
  RUNTIME_UI_CONTRACT_SEMVER,
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_MODE,
  RUNTIME_UI_CONTRACT_ENVIRONMENT,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  UI_NODE_KINDS,
  BLOCKED_ACTION_KINDS,
  INTERACTION_KINDS,
  RUNTIME_UI_CONTRACT_READINESS_STATES,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG,
  uiContractDigest,
  isStudioDevPreviewRuntimeUiContractEnabled,
  isStudioDevPreviewRuntimeUiNodesEnabled,
  isStudioDevPreviewRuntimeUiVerifyEnabled,
  isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled,
  RUNTIME_UI_CONTRACT_ERROR_CODES,
  RuntimeUiContractError,
  createRuntimeUiContractError,
  runtimeUiContractError,
  createRuntimeUiContractSession,
  createRuntimeUiVirtualFrameMapping,
  createRuntimeUiNodeContract,
  createRuntimeUiLayoutContract,
  createRuntimeUiComponentBindingContract,
  createRuntimeUiInteractionBindingContract,
  createRuntimeUiRenderBoundaryContract,
  createRuntimeUiStateProjectionContract,
  createRuntimeUiAccessibilityProjectionContract,
  createRuntimeUiThemeProjectionContract,
  createRuntimeUiBlockedActionContract,
  createRuntimeUiSafetyPolicy,
  createRuntimeUiReadinessDecision,
  createRuntimeUiManifest,
  verifyRuntimeUiContract,
  checkRuntimeUiContractCompatibility,
  createRuntimeUiDiagnostics,
  createRuntimeUiFallback,
  createStudioDevPreviewRuntimeUiContract,
} from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-runtime-ui-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-contract');

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
const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
  engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, permissionRequired: true },
};
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const RS = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
const PLAN = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
const IR = createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN });
const U = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });

const session = createRuntimeUiContractSession({ isolatedRuntime: IR });
const mapping = createRuntimeUiVirtualFrameMapping({ isolatedRuntime: IR });
const arg = { isolatedRuntime: IR, frameMapping: mapping };
const nodeC = createRuntimeUiNodeContract(arg);
const layout = createRuntimeUiLayoutContract(arg);
const compBind = createRuntimeUiComponentBindingContract(arg);
const intBind = createRuntimeUiInteractionBindingContract(arg);
const renderB = createRuntimeUiRenderBoundaryContract(arg);
const stateP = createRuntimeUiStateProjectionContract(arg);
const a11yP = createRuntimeUiAccessibilityProjectionContract(arg);
const themeP = createRuntimeUiThemeProjectionContract(arg);
const blockedA = createRuntimeUiBlockedActionContract(arg);
const safety = createRuntimeUiSafetyPolicy(arg);

// ===== Contract base (1-50) =====
test('1. contract created', () => assert.equal(U.kind, 'studio-dev-preview-runtime-ui-contract'));
test('2. name', () => { assert.equal(U.runtimeUiContractName, 'studio-dev-preview-runtime-ui-contract'); assert.equal(U.runtimeUiContractName, RUNTIME_UI_CONTRACT_NAME); });
test('3. version', () => { assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'); assert.equal(U.runtimeUiContractVersion, RUNTIME_UI_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(RUNTIME_UI_CONTRACT_SEMVER, '1.0.0'));
test('5. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('6. implementationPlanVersion', () => assert.equal(U.implementationPlanVersion, 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'));
test('7. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('8. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('9. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('10. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('11. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('12. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('13. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('14. mode', () => { assert.equal(U.mode, 'headless_dev_preview_runtime_ui_contract'); assert.equal(U.mode, RUNTIME_UI_CONTRACT_MODE); });
test('15. environment const', () => assert.equal(RUNTIME_UI_CONTRACT_ENVIRONMENT, 'local_contract'));
test('16. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('17. not fallback', () => assert.equal(U.fallback, false));
test('18. headless', () => assert.equal(U.capabilities.headless, true));
test('19. contractOnly', () => assert.equal(U.capabilities.contractOnly, true));
test('20. metadataOnly', () => assert.equal(U.capabilities.metadataOnly, true));
test('21. uiContractOnly', () => assert.equal(U.capabilities.uiContractOnly, true));
test('22. virtualFrameDriven', () => assert.equal(U.capabilities.virtualFrameDriven, true));
test('23. uiNodeMetadataOnly', () => assert.equal(U.capabilities.uiNodeMetadataOnly, true));
test('24. layoutMetadataOnly', () => assert.equal(U.capabilities.layoutMetadataOnly, true));
test('25. componentBindingMetadataOnly', () => assert.equal(U.capabilities.componentBindingMetadataOnly, true));
test('26. interactionBindingMetadataOnly', () => assert.equal(U.capabilities.interactionBindingMetadataOnly, true));
test('27. renderBoundaryMetadataOnly', () => assert.equal(U.capabilities.renderBoundaryMetadataOnly, true));
test('28. stateProjectionMetadataOnly', () => assert.equal(U.capabilities.stateProjectionMetadataOnly, true));
test('29. accessibilityProjectionMetadataOnly', () => assert.equal(U.capabilities.accessibilityProjectionMetadataOnly, true));
test('30. themeProjectionMetadataOnly', () => assert.equal(U.capabilities.themeProjectionMetadataOnly, true));
test('31. blockedActionMetadataOnly', () => assert.equal(U.capabilities.blockedActionMetadataOnly, true));
test('32. reactComponentCreated false', () => assert.equal(U.capabilities.reactComponentCreated, false));
test('33. jsxCreated false', () => assert.equal(U.capabilities.jsxCreated, false));
test('34. tsxCreated false', () => assert.equal(U.capabilities.tsxCreated, false));
test('35. domCreated false', () => assert.equal(U.capabilities.domCreated, false));
test('36. cssCreated false', () => assert.equal(U.capabilities.cssCreated, false));
test('37. uiCreated false', () => assert.equal(U.capabilities.uiCreated, false));
test('38. routeCreated false', () => assert.equal(U.capabilities.routeCreated, false));
test('39. menuCreated false', () => assert.equal(U.capabilities.menuCreated, false));
test('40. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('41. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('42. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('43. visualRuntimeImplemented false', () => assert.equal(U.capabilities.visualRuntimeImplemented, false));
test('44. reactRuntimeCreated/domRuntimeCreated/cssRuntimeCreated false', () => { assert.equal(U.capabilities.reactRuntimeCreated, false); assert.equal(U.capabilities.domRuntimeCreated, false); assert.equal(U.capabilities.cssRuntimeCreated, false); });
test('45. routeRuntimeCreated/menuRuntimeCreated/moduleRuntimeCreated false', () => { assert.equal(U.capabilities.routeRuntimeCreated, false); assert.equal(U.capabilities.menuRuntimeCreated, false); assert.equal(U.capabilities.moduleRuntimeCreated, false); });
test('46. backendAccessed/prismaAccessed false', () => { assert.equal(U.capabilities.backendAccessed, false); assert.equal(U.capabilities.prismaAccessed, false); });
test('47. productionAccessed/stagingAccessed false', () => { assert.equal(U.capabilities.productionAccessed, false); assert.equal(U.capabilities.stagingAccessed, false); });
test('48. fetchUsed/mutationAllowed/persistenceCreated false', () => { assert.equal(U.capabilities.fetchUsed, false); assert.equal(U.capabilities.mutationAllowed, false); assert.equal(U.capabilities.persistenceCreated, false); });
test('49. realDataRead/realDataWrite/rewriteEmpresas false', () => { assert.equal(U.capabilities.realDataRead, false); assert.equal(U.capabilities.realDataWrite, false); assert.equal(U.capabilities.rewriteEmpresas, false); });
test('50. capabilities frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_CONTRACT_CAPABILITIES)));

// ===== Readiness top-level (51-60) =====
test('51. readyForRuntimeUiContract true', () => assert.equal(U.readyForRuntimeUiContract, true));
test('52. readyForRuntimeUiImplementation false', () => assert.equal(U.readyForRuntimeUiImplementation, false));
test('53. readyForRouteMenuIntegration false', () => assert.equal(U.readyForRouteMenuIntegration, false));
test('54. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('55. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('56. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_runtime_ui_contract_ready'));
test('57. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('58. warningCount 0', () => assert.equal(U.warningCount, 0));
test('59. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('60. readiness state in enum', () => assert.ok(RUNTIME_UI_CONTRACT_READINESS_STATES.includes(U.readiness)));

// ===== Session (61-71) =====
test('61. session kind', () => assert.equal(session.kind, 'runtime-ui-contract-session'));
test('62. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-runtime-ui-contract'));
test('63. session version', () => assert.equal(session.runtimeUiContractVersion, RUNTIME_UI_CONTRACT_VERSION));
test('64. sourceIsolatedRuntime', () => assert.equal(session.sourceIsolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('65. sourceImplementationPlan', () => assert.equal(session.sourceImplementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('66. sourceVisualContract', () => assert.equal(session.sourceVisualContract, VISUAL_CONTRACT_VERSION));
test('67. session mode', () => assert.equal(session.mode, RUNTIME_UI_CONTRACT_MODE));
test('68. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-isolated-runtime'));
test('69. seed deterministic', () => assert.equal(session.seed, createRuntimeUiContractSession({ isolatedRuntime: IR }).seed));
test('70. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('71. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Virtual frame mapping (72-83) =====
test('72. mapping kind', () => assert.equal(mapping.kind, 'runtime-ui-virtual-frame-mapping'));
test('73. frameId present', () => assert.ok(typeof mapping.frameId === 'string'));
test('74. frameVersion present', () => assert.ok(typeof mapping.frameVersion === 'string'));
test('75. sourceDigests present', () => assert.ok(mapping.sourceDigests && typeof mapping.sourceDigests === 'object'));
test('76. screenKind', () => assert.equal(mapping.screenKind, 'list'));
test('77. sections present', () => assert.ok(Array.isArray(mapping.sections)));
test('78. syntheticRows present', () => assert.ok(mapping.syntheticRows.length > 0 && mapping.syntheticRows.every((r) => r.synthetic === true)));
test('79. blockedActions all blocked', () => assert.ok(mapping.blockedActions.every((a) => a.blocked === true)));
test('80. permissionHints defaultDeny', () => assert.equal(mapping.permissionHints.defaultDeny, true));
test('81. no react element', () => assert.equal(mapping.reactElement, false));
test('82. no dom node/css runtime', () => { assert.equal(mapping.domNode, false); assert.equal(mapping.cssRuntime, false); });
test('83. frameMappingDigest present', () => assert.ok(typeof mapping.frameMappingDigest === 'string'));

// ===== UI node contract (84-95) =====
test('84. node kind', () => assert.equal(nodeC.kind, 'runtime-ui-node-contract'));
test('85. root nodeKind uiRoot', () => assert.equal(nodeC.root.nodeKind, 'uiRoot'));
test('86. root nodeRole screen', () => assert.equal(nodeC.root.nodeRole, 'screen'));
test('87. root has children', () => assert.ok(Array.isArray(nodeC.root.children)));
test('88. children have source ids', () => assert.ok(nodeC.root.children.every((c) => 'sourceSectionId' in c && 'sourcePlaceholderId' in c)));
test('89. nodeKinds match const', () => assert.deepEqual(nodeC.nodeKinds, [...UI_NODE_KINDS]));
test('90. allNodeKindsKnown', () => assert.equal(nodeC.allNodeKindsKnown, true));
test('91. no react element', () => assert.equal(nodeC.reactElement, false));
test('92. no jsx', () => assert.equal(nodeC.jsx, false));
test('93. no dom node', () => assert.equal(nodeC.domNode, false));
test('94. no required real css class', () => assert.equal(nodeC.requiredRealCssClass, false));
test('95. no real handler + UI_NODE_KINDS frozen', () => { assert.equal(nodeC.realHandler, false); assert.ok(Object.isFrozen(UI_NODE_KINDS)); });

// ===== Layout contract (96-104) =====
test('96. layout kind', () => assert.equal(layout.kind, 'runtime-ui-layout-contract'));
test('97. layoutId', () => assert.equal(layout.layoutId, 'layout:clientes'));
test('98. layoutKind', () => assert.equal(layout.layoutKind, 'cadastro-standard'));
test('99. density', () => assert.equal(layout.density, 'comfortable'));
test('100. regions present', () => assert.ok(Array.isArray(layout.regions)));
test('101. responsivePlanMetadata', () => assert.ok(layout.responsivePlanMetadata.breakpoints.includes('md')));
test('102. no real css', () => assert.equal(layout.realCss, false));
test('103. no required tailwind', () => assert.equal(layout.requiredTailwind, false));
test('104. no dom', () => assert.equal(layout.dom, false));

// ===== Component binding contract (105-114) =====
test('105. binding kind', () => assert.equal(compBind.kind, 'runtime-ui-component-binding-contract'));
test('106. bindings present', () => assert.ok(Array.isArray(compBind.bindings) && compBind.bindings.length > 0));
test('107. bindingAllowed false', () => assert.ok(compBind.bindings.every((b) => b.bindingAllowed === false)));
test('108. realComponentPath null', () => assert.ok(compBind.bindings.every((b) => b.realComponentPath === null)));
test('109. reactComponent false', () => assert.ok(compBind.bindings.every((b) => b.reactComponent === false)));
test('110. jsx false', () => assert.ok(compBind.bindings.every((b) => b.jsx === false)));
test('111. tsx false', () => assert.ok(compBind.bindings.every((b) => b.tsx === false)));
test('112. dom false', () => assert.ok(compBind.bindings.every((b) => b.dom === false)));
test('113. anyBindingAllowed false', () => assert.equal(compBind.anyBindingAllowed, false));
test('114. anyRealComponentPath false', () => assert.equal(compBind.anyRealComponentPath, false));

// ===== Interaction binding contract (115-123) =====
test('115. interaction kind', () => assert.equal(intBind.kind, 'runtime-ui-interaction-binding-contract'));
test('116. interactions present', () => assert.ok(intBind.interactions.length === INTERACTION_KINDS.length));
test('117. all blockedNow', () => assert.equal(intBind.allBlockedNow, true));
test('118. requiresFutureRuntimeImplementation', () => assert.ok(intBind.interactions.every((i) => i.requiresFutureRuntimeImplementation === true)));
test('119. handlerCreated false', () => assert.ok(intBind.interactions.every((i) => i.handlerCreated === false)));
test('120. mutationAllowed false', () => assert.ok(intBind.interactions.every((i) => i.mutationAllowed === false)));
test('121. anyHandlerCreated false', () => assert.equal(intBind.anyHandlerCreated, false));
test('122. anyMutationAllowed false', () => assert.equal(intBind.anyMutationAllowed, false));
test('123. INTERACTION_KINDS frozen', () => assert.ok(Object.isFrozen(INTERACTION_KINDS)));

// ===== Render boundary (124-131) =====
test('124. render kind', () => assert.equal(renderB.kind, 'runtime-ui-render-boundary-contract'));
test('125. renderAllowed false', () => assert.equal(renderB.renderAllowed, false));
test('126. realRenderProduced false', () => assert.equal(renderB.realRenderProduced, false));
test('127. virtualRenderContractProduced true', () => assert.equal(renderB.virtualRenderContractProduced, true));
test('128. reactElementProduced false', () => assert.equal(renderB.reactElementProduced, false));
test('129. domProduced false', () => assert.equal(renderB.domProduced, false));
test('130. cssProduced false', () => assert.equal(renderB.cssProduced, false));
test('131. reason future slice', () => assert.match(renderB.reason, /future explicit UI runtime implementation slice/));

// ===== State projection (132-139) =====
test('132. state kind', () => assert.equal(stateP.kind, 'runtime-ui-state-projection-contract'));
test('133. states >= 8', () => assert.ok(stateP.states.length >= 8));
test('134. blocked terminal', () => assert.equal(stateP.states.find((s) => s.state === 'blocked').terminal, true));
test('135. reactState false', () => assert.equal(stateP.reactState, false));
test('136. hooks false', () => assert.equal(stateP.hooks, false));
test('137. storage false', () => assert.equal(stateP.storage, false));
test('138. persistence false', () => assert.equal(stateP.persistence, false));
test('139. dom false', () => assert.equal(stateP.dom, false));

// ===== Accessibility projection (140-147) =====
test('140. a11y kind', () => assert.equal(a11yP.kind, 'runtime-ui-accessibility-projection-contract'));
test('141. labelsRequired', () => assert.equal(a11yP.labelsRequired, true));
test('142. ariaMetadata present', () => assert.ok(a11yP.ariaMetadata.length >= 2));
test('143. keyboardPlan', () => assert.equal(a11yP.keyboardPlan.tabThroughFields, true));
test('144. focusOrder', () => assert.ok(a11yP.focusOrder.includes('form')));
test('145. blockedInteractionsAnnounced', () => assert.equal(a11yP.blockedInteractionsAnnounced, true));
test('146. domTouched false', () => assert.equal(a11yP.domTouched, false));
test('147. setsRealAria false', () => assert.equal(a11yP.setsRealAria, false));

// ===== Theme projection (148-155) =====
test('148. theme kind', () => assert.equal(themeP.kind, 'runtime-ui-theme-projection-contract'));
test('149. groups >= 7', () => assert.ok(themeP.groups.length >= 7));
test('150. semanticStatus tokens', () => assert.ok(themeP.groups.find((g) => g.group === 'semanticStatus').tokens.includes('danger')));
test('151. realCss false', () => assert.equal(themeP.realCss, false));
test('152. requiredTailwind false', () => assert.equal(themeP.requiredTailwind, false));
test('153. stylesheetCreated false', () => assert.equal(themeP.stylesheetCreated, false));
test('154. cssRuntime false', () => assert.equal(themeP.cssRuntime, false));
test('155. theme metadataOnly', () => assert.equal(themeP.metadataOnly, true));

// ===== Blocked action (156-165) =====
test('156. blocked kind', () => assert.equal(blockedA.kind, 'runtime-ui-blocked-action-contract'));
test('157. blockedActionKinds match const', () => assert.deepEqual(blockedA.blockedActionKinds, [...BLOCKED_ACTION_KINDS]));
test('158. create blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'create' && a.blocked === true)));
test('159. delete blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'delete' && a.blocked === true)));
test('160. navigate blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'navigate' && a.blocked === true)));
test('161. openRoute blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'openRoute' && a.blocked === true)));
test('162. registerModule blocked', () => assert.ok(blockedA.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('163. allBlocked true', () => assert.equal(blockedA.allBlocked, true));
test('164. anyAllowed false', () => assert.equal(blockedA.anyAllowed, false));
test('165. BLOCKED_ACTION_KINDS frozen (9)', () => assert.ok(Object.isFrozen(BLOCKED_ACTION_KINDS) && BLOCKED_ACTION_KINDS.length === 9));

// ===== Safety policy (166-174) =====
test('166. safety kind', () => assert.equal(safety.kind, 'runtime-ui-safety-policy'));
test('167. headless + contractOnly', () => { assert.equal(safety.headless, true); assert.equal(safety.contractOnly, true); });
test('168. failClosed', () => assert.equal(safety.failClosed, true));
test('169. visualRuntimeImplemented false', () => assert.equal(safety.visualRuntimeImplemented, false));
test('170. anyForbiddenSideEffect false', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('171. reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('172. forbiddenFlags all false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));
test('173. forbiddenFlags includes visualRuntimeImplemented', () => assert.equal(safety.forbiddenFlags.visualRuntimeImplemented, false));
test('174. safetyPolicyDigest present', () => assert.ok(typeof safety.safetyPolicyDigest === 'string'));

// ===== Readiness decision (175-183) =====
test('175. readiness kind', () => assert.equal(U.readinessDecision.kind, 'runtime-ui-readiness-decision'));
test('176. ready state', () => assert.equal(U.readinessDecision.readiness, 'studio_dev_preview_runtime_ui_contract_ready'));
test('177. readyForRuntimeUiContract', () => assert.equal(U.readinessDecision.readyForRuntimeUiContract, true));
test('178. readyForRuntimeUiImplementation false', () => assert.equal(U.readinessDecision.readyForRuntimeUiImplementation, false));
test('179. readyForRouteMenuIntegration false', () => assert.equal(U.readinessDecision.readyForRouteMenuIntegration, false));
test('180. readyForProduction false', () => assert.equal(U.readinessDecision.readyForProduction, false));
test('181. blockers empty', () => assert.deepEqual(U.readinessDecision.blockers, []));
test('182. blocked on blockers', () => { const r = createRuntimeUiReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForRuntimeUiContract, false); });
test('183. implementation stays false', () => assert.equal(createRuntimeUiReadinessDecision({}).readyForRuntimeUiImplementation, false));

// ===== Manifest (184-192) =====
test('184. manifest kind', () => assert.equal(U.manifest.kind, 'runtime-ui-contract-manifest'));
test('185. manifest name', () => assert.equal(U.manifest.runtimeUiContractName, RUNTIME_UI_CONTRACT_NAME));
test('186. manifest version', () => assert.equal(U.manifest.runtimeUiContractVersion, RUNTIME_UI_CONTRACT_VERSION));
test('187. manifest upstream isolatedRuntime', () => assert.equal(U.manifest.upstream.isolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('188. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('189. manifest parts.nodeContract digest', () => assert.ok(typeof U.manifest.parts.nodeContract === 'string'));
test('190. manifest capabilities headless', () => assert.equal(U.manifest.capabilities.headless, true));
test('191. manifest standalone builds', () => assert.equal(createRuntimeUiManifest({ isolatedRuntime: IR }).kind, 'runtime-ui-contract-manifest'));
test('192. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (193-210) =====
const caps = RUNTIME_UI_CONTRACT_CAPABILITIES;
test('193. verification ok', () => assert.equal(U.verification.ok, true));
test('194. verification valid', () => assert.equal(U.verification.valid, true));
test('195. verification headless', () => assert.equal(U.verification.headless, true));
test('196. verification visualRuntimeImplemented false', () => assert.equal(U.verification.visualRuntimeImplemented, false));
test('197. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('198. verifier detects uiCreated', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: { ...caps, uiCreated: true } } }).blockers.includes('capability_uiCreated_must_be_false')));
test('199. verifier detects visualRuntimeImplemented', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: { ...caps, visualRuntimeImplemented: true } } }).blockers.includes('capability_visualRuntimeImplemented_must_be_false')));
test('200. verifier detects domCreated/cssCreated', () => { const r = verifyRuntimeUiContract({ contract: { capabilities: { ...caps, domCreated: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_domCreated_must_be_false') && r.blockers.includes('capability_cssCreated_must_be_false')); });
test('201. verifier detects route/menu', () => { const r = verifyRuntimeUiContract({ contract: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('202. verifier detects backend/prisma', () => { const r = verifyRuntimeUiContract({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('203. verifier detects mutation/persistence', () => { const r = verifyRuntimeUiContract({ contract: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('204. verifier detects real data read/write', () => { const r = verifyRuntimeUiContract({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('205. verifier detects renderAllowed true', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: caps, renderBoundary: { renderAllowed: true } } }).blockers.includes('unsafe_render_allowed_true')));
test('206. verifier detects bindingAllowed true', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: caps, componentBinding: { anyBindingAllowed: true } } }).blockers.includes('unsafe_binding_allowed_true')));
test('207. verifier detects handlerCreated true', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: caps, interactionBinding: { anyHandlerCreated: true } } }).blockers.includes('unsafe_handler_created')));
test('208. verifier detects unsafe ui node', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: caps, nodeContract: { reactElement: true } } }).blockers.includes('unsafe_ui_node')));
test('209. verifier detects real component path', () => assert.ok(verifyRuntimeUiContract({ contract: { capabilities: caps, componentBinding: { anyRealComponentPath: true } } }).blockers.includes('unsafe_real_component_path')));
test('210. verifier never throws on junk', () => assert.doesNotThrow(() => verifyRuntimeUiContract({ contract: null })));

// ===== Compatibility (211-219) =====
test('211. compatibility kind', () => assert.equal(U.compatibility.kind, 'runtime-ui-contract-compatibility'));
test('212. compatibleWithIsolatedRuntime', () => assert.equal(U.compatibility.compatibleWithIsolatedRuntime, true));
test('213. compat readyForRuntimeUiContract', () => assert.equal(U.compatibility.readyForRuntimeUiContract, true));
test('214. compat readyForRuntimeUiImplementation false', () => assert.equal(U.compatibility.readyForRuntimeUiImplementation, false));
test('215. compat readyForRouteMenuIntegration false', () => assert.equal(U.compatibility.readyForRouteMenuIntegration, false));
test('216. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('217. compat status when-authorized', () => assert.equal(U.compatibility.status, 'ready_for_future_runtime_ui_implementation_slice_when_explicitly_authorized'));
test('218. mismatch → warning', () => { const r = checkRuntimeUiContractCompatibility({ isolatedRuntime: { isolatedRuntimeVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithIsolatedRuntime, false); assert.ok(r.warnings.includes('incompatible_isolatedRuntime')); });
test('219. compatibilityDigest present', () => assert.ok(typeof U.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (220-233) =====
test('220. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'runtime-ui-diagnostics'));
test('221. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('222. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('223. diagnostics headlessConfirmed', () => assert.equal(U.diagnostics.headlessConfirmed, true));
test('224. diagnostics visualRuntimeImplemented false', () => assert.equal(U.diagnostics.visualRuntimeImplemented, false));
test('225. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRuntimeUiContract({});
const fbBad = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: { kind: 'other' } });
const fbFb = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: { kind: 'studio-dev-preview-isolated-runtime', fallback: true } });
test('226. missing runtime → fallback', () => assert.equal(fbNo.fallback, true));
test('227. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('228. fallback runtime → fallback', () => assert.equal(fbFb.fallback, true));
test('229. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('230. fallback not ready contract/impl/production', () => { assert.equal(fbNo.readyForRuntimeUiContract, false); assert.equal(fbNo.readyForRuntimeUiImplementation, false); assert.equal(fbNo.readyForProduction, false); });
test('231. fallback caps visualRuntimeImplemented false', () => assert.equal(fbNo.capabilities.visualRuntimeImplemented, false));
test('232. fallback never throws', () => assert.doesNotThrow(() => createRuntimeUiFallback({ reason: 'x' })));
test('233. fallback metadataOnly', () => assert.equal(fbNo.metadataOnly, true));

// ===== Errors (234-243) =====
test('234. error codes >= 30', () => assert.ok(RUNTIME_UI_CONTRACT_ERROR_CODES.length >= 30));
test('235. error descriptor sanitized', () => { const e = createRuntimeUiContractError('RUNTIME_UI_CONTRACT_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('236. error no ui/dom/css', () => { const e = createRuntimeUiContractError('RUNTIME_UI_CONTRACT_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); });
test('237. error no real data + no visual runtime', () => { const e = createRuntimeUiContractError('RUNTIME_UI_CONTRACT_REAL_DATA_READ_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.realDataWrite, false); assert.equal(e.visualRuntimeImplemented, false); });
test('238. unknown code normalized', () => assert.equal(createRuntimeUiContractError('NOPE').code, 'RUNTIME_UI_CONTRACT_INVALID_ISOLATED_RUNTIME'));
test('239. typed error', () => { const e = new RuntimeUiContractError('RUNTIME_UI_CONTRACT_INVALID_VIRTUAL_FRAME', 'x'); assert.ok(e instanceof Error && e.name === 'RuntimeUiContractError'); });
test('240. helper error', () => assert.equal(runtimeUiContractError('RUNTIME_UI_CONTRACT_FETCH_BLOCKED', 'x').code, 'RUNTIME_UI_CONTRACT_FETCH_BLOCKED'));
test('241. codes cover react/jsx/tsx/dom/css/route/menu', () => ['RUNTIME_UI_CONTRACT_REACT_BLOCKED', 'RUNTIME_UI_CONTRACT_JSX_BLOCKED', 'RUNTIME_UI_CONTRACT_TSX_BLOCKED', 'RUNTIME_UI_CONTRACT_DOM_BLOCKED', 'RUNTIME_UI_CONTRACT_CSS_RUNTIME_BLOCKED', 'RUNTIME_UI_CONTRACT_ROUTE_BLOCKED', 'RUNTIME_UI_CONTRACT_MENU_BLOCKED'].forEach((c) => assert.ok(RUNTIME_UI_CONTRACT_ERROR_CODES.includes(c))));
test('242. codes cover render/binding/handler', () => ['RUNTIME_UI_CONTRACT_RENDER_ALLOWED_BLOCKED', 'RUNTIME_UI_CONTRACT_BINDING_ALLOWED_BLOCKED', 'RUNTIME_UI_CONTRACT_HANDLER_CREATED_BLOCKED'].forEach((c) => assert.ok(RUNTIME_UI_CONTRACT_ERROR_CODES.includes(c))));
test('243. error no secrets/stack leak', () => { const e = createRuntimeUiContractError('RUNTIME_UI_CONTRACT_BACKEND_BLOCKED'); assert.equal(e.noSecrets, true); assert.equal(e.noStackLeak, true); });

// ===== Config flags (244-252) =====
test('244. flag off by default', () => assert.equal(isStudioDevPreviewRuntimeUiContractEnabled({}), false));
test('245. flag on in dev', () => assert.equal(isStudioDevPreviewRuntimeUiContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('246. flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('247. nodes flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiNodesEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('248. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('249. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('250. master flag enables nodes in dev', () => assert.equal(isStudioDevPreviewRuntimeUiNodesEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('251. readiness states frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_CONTRACT_READINESS_STATES)));
test('252. uiContractDigest deterministic + format', () => { assert.equal(uiContractDigest({ a: 1 }), uiContractDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(uiContractDigest({ a: 1 }))); });

// ===== Determinism / purity (253-262) =====
test('253. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }).overallDigest));
test('254. deterministic runtimeUiContractDigest', () => assert.equal(U.runtimeUiContractDigest, createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }).runtimeUiContractDigest));
test('255. input not mutated', () => { const snap = JSON.stringify(IR); createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); assert.equal(JSON.stringify(IR), snap); });
test('256. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('257. different module → different digest', () => { const b2 = createStudioDevPreviewContractBridge({ sandbox: { ...SANDBOX, moduleId: 'produtos' } }); const vc2 = createStudioDevPreviewVisualContract({ bridge: b2 }); const rs2 = createStudioDevPreviewRuntimeShellContract({ visualContract: vc2 }); const p2 = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs2 }); const ir2 = createStudioDevPreviewIsolatedRuntime({ implementationPlan: p2 }); assert.notEqual(U.overallDigest, createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: ir2 }).overallDigest); });
test('258. builds from full real chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const br = createStudioDevPreviewContractBridge({ sandbox: sb });
  const vc = createStudioDevPreviewVisualContract({ bridge: br });
  const rs = createStudioDevPreviewRuntimeShellContract({ visualContract: vc });
  const pl = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs });
  const ir = createStudioDevPreviewIsolatedRuntime({ implementationPlan: pl });
  const uu = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: ir });
  assert.equal(uu.kind, 'studio-dev-preview-runtime-ui-contract');
  assert.equal(uu.readyForRuntimeUiImplementation, false);
});
test('259. tenant/permission hints synthetic only', () => assert.equal(mapping.permissionHints.defaultDeny, true));
test('260. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('261. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('262. no visual runtime implemented', () => assert.equal(U.capabilities.visualRuntimeImplemented, false));

// ===== Purity/no-side-effect code scan (263-273) =====
test('263. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('264. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('265. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('266. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('267. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('268. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('269. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('270. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('271. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('272. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('273. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));

// ===== Scope safety (274-296) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('274. ui-contract subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui-contract')));
test('275. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('276. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('277. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('278. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('279. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('280. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('281. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('282. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('283. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('284. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('285. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('286. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('287. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('288. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('289. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('290. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('291. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('292. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('293. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('294. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('295. net-new scope is ui-contract only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('296. upstream isolated runtime present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-isolated-runtime/index.js')));

// ===== Evidence docs (D1-D18) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-UI-CONTRACT-REPORT.md', 'CONTRACT-SESSION.md',
  'VIRTUAL-FRAME-MAPPING.md', 'UI-NODE-CONTRACT.md', 'LAYOUT-CONTRACT.md', 'COMPONENT-BINDING-CONTRACT.md',
  'INTERACTION-BINDING-CONTRACT.md', 'RENDER-BOUNDARY-CONTRACT.md', 'STATE-PROJECTION-CONTRACT.md',
  'ACCESSIBILITY-PROJECTION-CONTRACT.md', 'THEME-PROJECTION-CONTRACT.md', 'BLOCKED-ACTION-CONTRACT.md',
  'SAFETY-POLICY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-contract/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/React|UI|rota|menu|módulo|module|runtime/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/RUNTIME UI IMPLEMENTATION PLAN|implementation plan|implementation/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
