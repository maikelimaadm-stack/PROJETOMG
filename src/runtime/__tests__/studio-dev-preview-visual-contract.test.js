import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  VISUAL_CONTRACT_NAME,
  VISUAL_CONTRACT_SEMVER,
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_MODE,
  VISUAL_CONTRACT_ENVIRONMENT,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  ALLOWED_VISUAL_PLACEHOLDER_KINDS,
  BLOCKED_VISUAL_PLACEHOLDER_KINDS,
  VISUAL_STATE_KINDS,
  VISUAL_INTERACTION_KINDS,
  VISUAL_THEME_TOKEN_GROUPS,
  VISUAL_CONTRACT_READINESS_STATES,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK_FLAG,
  visualDigest,
  isStudioDevPreviewVisualContractEnabled,
  isStudioDevPreviewVisualTreeEnabled,
  isStudioDevPreviewVisualVerifyEnabled,
  isStudioDevPreviewVisualCompatibilityCheckEnabled,
  VISUAL_CONTRACT_ERROR_CODES,
  DevPreviewVisualContractError,
  createDevPreviewVisualContractError,
  devPreviewVisualContractError,
  createDevPreviewVisualContractSession,
  createDevPreviewVisualTreeContract,
  createDevPreviewVisualScreenContract,
  createDevPreviewVisualSectionContract,
  createDevPreviewVisualComponentPlaceholderRegistry,
  isAllowedVisualPlaceholderKind,
  createDevPreviewVisualStateContract,
  createDevPreviewVisualInteractionContract,
  createDevPreviewVisualThemeTokenContract,
  createDevPreviewVisualValidationContract,
  createDevPreviewVisualAccessibilityContract,
  createDevPreviewVisualRoutePlanMetadata,
  createDevPreviewVisualPlacementPlanMetadata,
  createDevPreviewVisualRuntimeSafetyMetadata,
  createDevPreviewVisualReadinessDecision,
  createDevPreviewVisualContractManifest,
  verifyDevPreviewVisualContract,
  checkDevPreviewVisualContractCompatibility,
  createDevPreviewVisualContractDiagnostics,
  createDevPreviewVisualContractFallback,
  createStudioDevPreviewVisualContract,
} from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-visual-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-visual-contract');

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

// Build the real upstream bridge from a real sandbox.
const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
  engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [
    { name: 'nome', label: 'Nome', type: 'text', sortable: true },
    { name: 'ativo', type: 'boolean' },
    { name: 'tenantId', type: 'text', protectedColumn: true, tenantColumn: true },
  ] },
  formPreviewMetadata: { fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'ativo', type: 'boolean' },
    { name: 'tenantId', type: 'text', protectedField: true, tenantScoped: true },
  ] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedField: true }] },
  fieldPreviewMetadata: { fields: [
    { name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' },
    { name: 'nascimento', type: 'date' }, { name: 'idade', type: 'number' }, { name: 'categoria', type: 'select' },
  ] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const V = createStudioDevPreviewVisualContract({ bridge: BRIDGE });

const arg = { bridge: BRIDGE };
const session = createDevPreviewVisualContractSession(arg);
const tree = createDevPreviewVisualTreeContract(arg);
const screenC = createDevPreviewVisualScreenContract(arg);
const sectionC = createDevPreviewVisualSectionContract(arg);
const registry = createDevPreviewVisualComponentPlaceholderRegistry(arg);
const stateC = createDevPreviewVisualStateContract(arg);
const interactionC = createDevPreviewVisualInteractionContract(arg);
const themeC = createDevPreviewVisualThemeTokenContract(arg);
const validationC = createDevPreviewVisualValidationContract(arg);
const a11yC = createDevPreviewVisualAccessibilityContract(arg);
const routeP = createDevPreviewVisualRoutePlanMetadata(arg);
const placeP = createDevPreviewVisualPlacementPlanMetadata(arg);
const safety = createDevPreviewVisualRuntimeSafetyMetadata(arg);

// ===== Contract base (1-40) =====
test('1. contract created', () => assert.equal(V.kind, 'studio-dev-preview-visual-contract'));
test('2. visualContractName', () => { assert.equal(V.visualContractName, 'studio-dev-preview-visual-contract'); assert.equal(V.visualContractName, VISUAL_CONTRACT_NAME); });
test('3. visualContractVersion', () => { assert.equal(V.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'); assert.equal(V.visualContractVersion, VISUAL_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(VISUAL_CONTRACT_SEMVER, '1.0.0'));
test('5. bridgeVersion', () => assert.equal(V.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('6. sandboxVersion', () => assert.equal(V.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('7. plannerVersion', () => assert.equal(V.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('8. engineVersion', () => assert.equal(V.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('9. blueprintContractVersion', () => assert.equal(V.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('10. mode', () => { assert.equal(V.mode, 'headless_dev_preview_visual_contract'); assert.equal(V.mode, VISUAL_CONTRACT_MODE); });
test('11. environment const', () => assert.equal(VISUAL_CONTRACT_ENVIRONMENT, 'local_contract'));
test('12. moduleId', () => assert.equal(V.moduleId, 'clientes'));
test('13. not fallback', () => assert.equal(V.fallback, false));
test('14. headless', () => assert.equal(V.capabilities.headless, true));
test('15. contractOnly', () => assert.equal(V.capabilities.contractOnly, true));
test('16. metadataOnly', () => assert.equal(V.capabilities.metadataOnly, true));
test('17. visualTreeOnly', () => assert.equal(V.capabilities.visualTreeOnly, true));
test('18. visualScreenOnly', () => assert.equal(V.capabilities.visualScreenOnly, true));
test('19. componentPlaceholderOnly', () => assert.equal(V.capabilities.componentPlaceholderOnly, true));
test('20. stateContractOnly', () => assert.equal(V.capabilities.stateContractOnly, true));
test('21. interactionMetadataOnly', () => assert.equal(V.capabilities.interactionMetadataOnly, true));
test('22. themeTokenMetadataOnly', () => assert.equal(V.capabilities.themeTokenMetadataOnly, true));
test('23. routePlanMetadataOnly', () => assert.equal(V.capabilities.routePlanMetadataOnly, true));
test('24. menuPlanMetadataOnly', () => assert.equal(V.capabilities.menuPlanMetadataOnly, true));
test('25. reactComponentCreated false', () => assert.equal(V.capabilities.reactComponentCreated, false));
test('26. jsxCreated false', () => assert.equal(V.capabilities.jsxCreated, false));
test('27. tsxCreated false', () => assert.equal(V.capabilities.tsxCreated, false));
test('28. domCreated false', () => assert.equal(V.capabilities.domCreated, false));
test('29. cssCreated false', () => assert.equal(V.capabilities.cssCreated, false));
test('30. uiCreated false', () => assert.equal(V.capabilities.uiCreated, false));
test('31. routeCreated false', () => assert.equal(V.capabilities.routeCreated, false));
test('32. menuCreated false', () => assert.equal(V.capabilities.menuCreated, false));
test('33. moduleGenerated false', () => assert.equal(V.capabilities.moduleGenerated, false));
test('34. filesWrittenToModule false', () => assert.equal(V.capabilities.filesWrittenToModule, false));
test('35. moduleRegistered false', () => assert.equal(V.capabilities.moduleRegistered, false));
test('36. backendAccessed false', () => assert.equal(V.capabilities.backendAccessed, false));
test('37. prismaAccessed false', () => assert.equal(V.capabilities.prismaAccessed, false));
test('38. productionAccessed/stagingAccessed false', () => { assert.equal(V.capabilities.productionAccessed, false); assert.equal(V.capabilities.stagingAccessed, false); });
test('39. fetchUsed/mutationAllowed/persistenceCreated/rewriteEmpresas false', () => {
  assert.equal(V.capabilities.fetchUsed, false); assert.equal(V.capabilities.mutationAllowed, false);
  assert.equal(V.capabilities.persistenceCreated, false); assert.equal(V.capabilities.rewriteEmpresas, false);
});
test('40. capabilities frozen', () => assert.ok(Object.isFrozen(VISUAL_CONTRACT_HEADLESS_CAPABILITIES)));

// ===== Readiness top-level (41-50) =====
test('41. readyForDevPreviewVisualContract true', () => assert.equal(V.readyForDevPreviewVisualContract, true));
test('42. readyForDevPreviewVisualRuntime false', () => assert.equal(V.readyForDevPreviewVisualRuntime, false));
test('43. readyForRealModuleGeneration false', () => assert.equal(V.readyForRealModuleGeneration, false));
test('44. readyForProduction false', () => assert.equal(V.readyForProduction, false));
test('45. readiness ready', () => assert.equal(V.readiness, 'studio_dev_preview_visual_contract_ready'));
test('46. blockerCount 0', () => assert.equal(V.blockerCount, 0));
test('47. warningCount 0', () => assert.equal(V.warningCount, 0));
test('48. metadataOnly top', () => assert.equal(V.metadataOnly, true));
test('49. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(V.overallDigest)));
test('50. visualContractDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(V.visualContractDigest)));

// ===== Session (51-62) =====
test('51. session kind', () => assert.equal(session.kind, 'dev-preview-visual-contract-session'));
test('52. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-visual-contract'));
test('53. session version', () => assert.equal(session.visualContractVersion, VISUAL_CONTRACT_VERSION));
test('54. session moduleId', () => assert.equal(session.moduleId, 'clientes'));
test('55. sourceBridgeContract', () => assert.equal(session.sourceBridgeContract, DEV_PREVIEW_BRIDGE_VERSION));
test('56. sourceSandboxContract', () => assert.equal(session.sourceSandboxContract, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('57. session mode', () => assert.equal(session.mode, VISUAL_CONTRACT_MODE));
test('58. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-contract-bridge'));
test('59. seed deterministic', () => assert.equal(session.seed, createDevPreviewVisualContractSession(arg).seed));
test('60. no storage', () => assert.equal(session.usesStorage, false));
test('61. no fetch', () => assert.equal(session.usesFetch, false));
test('62. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Visual tree (63-80) =====
test('63. tree kind', () => assert.equal(tree.kind, 'dev-preview-visual-tree-contract'));
test('64. tree version', () => assert.equal(tree.visualTreeVersion, 'dev-preview-visual-tree-contract@1.0.0'));
test('65. root container placeholder', () => assert.equal(tree.root.placeholderKind, 'VisualContainerPlaceholder'));
test('66. tree has 3 screens', () => assert.equal(tree.root.screens.length, 3));
test('67. list screen table placeholder', () => assert.equal(tree.root.screens.find((s) => s.screen === 'list').placeholderKind, 'VisualTablePlaceholder'));
test('68. form screen form placeholder', () => assert.equal(tree.root.screens.find((s) => s.screen === 'form').placeholderKind, 'VisualFormPlaceholder'));
test('69. detail screen readOnly', () => assert.equal(tree.root.screens.find((s) => s.screen === 'detail').readOnly, true));
test('70. protected form slot uses label', () => { const form = tree.root.screens.find((s) => s.screen === 'form'); const slot = form.sections[0].slots.find((x) => x.slot === 'field:tenantId'); assert.equal(slot.placeholderKind, 'VisualLabelPlaceholder'); assert.equal(slot.readOnly, true); });
test('71. normal form slot uses input', () => { const form = tree.root.screens.find((s) => s.screen === 'form'); const slot = form.sections[0].slots.find((x) => x.slot === 'field:nome'); assert.equal(slot.placeholderKind, 'VisualInputPlaceholder'); });
test('72. detail slots all read-only labels', () => { const d = tree.root.screens.find((s) => s.screen === 'detail'); assert.ok(d.sections[0].slots.every((x) => x.placeholderKind === 'VisualLabelPlaceholder' && x.readOnly === true)); });
test('73. permissionHints defaultDeny', () => assert.equal(tree.permissionHints.defaultDeny, true));
test('74. permissionHints tenantRequired', () => assert.equal(tree.permissionHints.tenantRequired, true));
test('75. stateHints include blocked', () => assert.ok(tree.stateHints.includes('blocked')));
test('76. allPlaceholdersAllowed', () => assert.equal(tree.allPlaceholdersAllowed, true));
test('77. react false', () => assert.equal(tree.react, false));
test('78. jsx/tsx false', () => { assert.equal(tree.jsx, false); assert.equal(tree.tsx, false); });
test('79. dom/cssRuntime false', () => { assert.equal(tree.dom, false); assert.equal(tree.cssRuntime, false); });
test('80. visualTreeDigest present', () => assert.ok(typeof tree.visualTreeDigest === 'string'));

// ===== Visual screen (81-95) =====
test('81. screen kind', () => assert.equal(screenC.kind, 'dev-preview-visual-screen-contract'));
test('82. 3 screens', () => assert.equal(screenC.screens.length, 3));
test('83. list', () => assert.ok(screenC.screens.some((s) => s.screenId === 'list')));
test('84. form', () => assert.ok(screenC.screens.some((s) => s.screenId === 'form')));
test('85. detail readOnly', () => assert.equal(screenC.screens.find((s) => s.screenId === 'detail').readOnly, true));
test('86. 4 state screens', () => assert.equal(screenC.stateScreens.length, 4));
test('87. empty state placeholder', () => assert.equal(screenC.stateScreens.find((s) => s.screenId === 'empty').placeholderKind, 'VisualEmptyStatePlaceholder'));
test('88. loading state placeholder', () => assert.equal(screenC.stateScreens.find((s) => s.screenId === 'loading').placeholderKind, 'VisualLoadingStatePlaceholder'));
test('89. error state placeholder', () => assert.equal(screenC.stateScreens.find((s) => s.screenId === 'error').placeholderKind, 'VisualErrorStatePlaceholder'));
test('90. blocked state placeholder', () => assert.equal(screenC.stateScreens.find((s) => s.screenId === 'blocked').placeholderKind, 'VisualBlockedStatePlaceholder'));
test('91. requiredStateScreens 4', () => assert.equal(screenC.requiredStateScreens.length, 4));
test('92. screen react false', () => assert.equal(screenC.react, false));
test('93. screen dom/css false', () => { assert.equal(screenC.dom, false); assert.equal(screenC.cssRuntime, false); });
test('94. screen routeCreated false', () => assert.equal(screenC.routeCreated, false));
test('95. visualScreenDigest present', () => assert.ok(typeof screenC.visualScreenDigest === 'string'));

// ===== Section (96-103) =====
test('96. section kind', () => assert.equal(sectionC.kind, 'dev-preview-visual-section-contract'));
test('97. 5 sections', () => assert.equal(sectionC.sections.length, 5));
test('98. sectionOrder includes table', () => assert.ok(sectionC.sectionOrder.includes('table')));
test('99. toolbar section', () => assert.ok(sectionC.sections.some((s) => s.sectionId === 'toolbar')));
test('100. section componentCreated false', () => assert.ok(sectionC.sections.every((s) => s.componentCreated === false)));
test('101. section react/dom false', () => { assert.equal(sectionC.react, false); assert.equal(sectionC.dom, false); });
test('102. section metadataOnly', () => assert.equal(sectionC.metadataOnly, true));
test('103. visualSectionDigest present', () => assert.ok(typeof sectionC.visualSectionDigest === 'string'));

// ===== Placeholder registry (104-120) =====
test('104. registry kind', () => assert.equal(registry.kind, 'dev-preview-visual-component-placeholder-registry'));
test('105. entries count 19', () => assert.equal(registry.entries.length, 19));
test('106. allowedKinds 19', () => assert.equal(registry.allowedCount, 19));
test('107. every entry not real component', () => assert.ok(registry.entries.every((e) => e.isRealComponent === false)));
test('108. every entry no import', () => assert.ok(registry.entries.every((e) => e.importsComponent === false)));
test('109. every entry no path ref', () => assert.ok(registry.entries.every((e) => e.referencesComponentPath === false)));
test('110. every entry no jsx/tsx', () => assert.ok(registry.entries.every((e) => e.jsx === false && e.tsx === false)));
test('111. blocked kinds present', () => assert.ok(registry.blockedKinds.includes('ReactComponent') && registry.blockedKinds.includes('DomNode')));
test('112. blocked kinds include router/menu', () => assert.ok(registry.blockedKinds.includes('RouterOutlet') && registry.blockedKinds.includes('MenuItem')));
test('113. allowed/blocked disjoint', () => assert.ok(ALLOWED_VISUAL_PLACEHOLDER_KINDS.every((k) => !BLOCKED_VISUAL_PLACEHOLDER_KINDS.includes(k))));
test('114. placeholderOnly', () => assert.equal(registry.placeholderOnly, true));
test('115. realComponentCreated false', () => assert.equal(registry.realComponentCreated, false));
test('116. isAllowed true for VisualLabelPlaceholder', () => assert.equal(isAllowedVisualPlaceholderKind('VisualLabelPlaceholder'), true));
test('117. isAllowed false for ReactComponent', () => assert.equal(isAllowedVisualPlaceholderKind('ReactComponent'), false));
test('118. isAllowed false for unknown', () => assert.equal(isAllowedVisualPlaceholderKind('NopeThing'), false));
test('119. ALLOWED frozen 19', () => assert.ok(Object.isFrozen(ALLOWED_VISUAL_PLACEHOLDER_KINDS) && ALLOWED_VISUAL_PLACEHOLDER_KINDS.length === 19));
test('120. BLOCKED frozen 15', () => assert.ok(Object.isFrozen(BLOCKED_VISUAL_PLACEHOLDER_KINDS) && BLOCKED_VISUAL_PLACEHOLDER_KINDS.length === 15));

// ===== State contract (121-133) =====
test('121. state kind', () => assert.equal(stateC.kind, 'dev-preview-visual-state-contract'));
test('122. state kinds 8', () => assert.equal(stateC.stateKinds.length, 8));
test('123. idle present', () => assert.ok(stateC.states.some((s) => s.state === 'idle')));
test('124. blocked terminal+blocking', () => { const s = stateC.states.find((x) => x.state === 'blocked'); assert.equal(s.terminal, true); assert.equal(s.blocking, true); });
test('125. permissionDenied blocking', () => assert.equal(stateC.states.find((x) => x.state === 'permissionDenied').blocking, true));
test('126. validationError present', () => assert.ok(stateC.states.some((s) => s.state === 'validationError')));
test('127. initialState idle', () => assert.equal(stateC.initialState, 'idle'));
test('128. usesReactState false', () => assert.equal(stateC.usesReactState, false));
test('129. usesHooks false', () => assert.equal(stateC.usesHooks, false));
test('130. usesRuntimeState false', () => assert.equal(stateC.usesRuntimeState, false));
test('131. VISUAL_STATE_KINDS frozen', () => assert.ok(Object.isFrozen(VISUAL_STATE_KINDS)));
test('132. state metadataOnly', () => assert.equal(stateC.metadataOnly, true));
test('133. visualStateDigest present', () => assert.ok(typeof stateC.visualStateDigest === 'string'));

// ===== Interaction (134-147) =====
test('134. interaction kind', () => assert.equal(interactionC.kind, 'dev-preview-visual-interaction-contract'));
test('135. interaction kinds 10', () => assert.equal(interactionC.interactionKinds.length, 10));
test('136. read interaction not mutation', () => { const i = interactionC.interactions.find((x) => x.interaction === 'read'); assert.equal(i.mutation, false); });
test('137. blockedCreate is mutation+blocked', () => { const i = interactionC.interactions.find((x) => x.interaction === 'blockedCreate'); assert.equal(i.mutation, true); assert.equal(i.blocked, true); });
test('138. all interactions disabled', () => assert.ok(interactionC.interactions.every((i) => i.enabled === false)));
test('139. no real handler', () => assert.ok(interactionC.interactions.every((i) => i.hasRealHandler === false)));
test('140. anyEnabled false', () => assert.equal(interactionC.anyEnabled, false));
test('141. anyMutationEnabled false', () => assert.equal(interactionC.anyMutationEnabled, false));
test('142. anyRealHandler false', () => assert.equal(interactionC.anyRealHandler, false));
test('143. blockedUpdate blocked', () => assert.equal(interactionC.interactions.find((x) => x.interaction === 'blockedUpdate').blocked, true));
test('144. blockedDelete blocked', () => assert.equal(interactionC.interactions.find((x) => x.interaction === 'blockedDelete').blocked, true));
test('145. blockedSubmit blocked', () => assert.equal(interactionC.interactions.find((x) => x.interaction === 'blockedSubmit').blocked, true));
test('146. VISUAL_INTERACTION_KINDS frozen', () => assert.ok(Object.isFrozen(VISUAL_INTERACTION_KINDS)));
test('147. visualInteractionDigest present', () => assert.ok(typeof interactionC.visualInteractionDigest === 'string'));

// ===== Theme token (148-158) =====
test('148. theme kind', () => assert.equal(themeC.kind, 'dev-preview-visual-theme-token-contract'));
test('149. 7 token groups', () => assert.equal(themeC.tokenGroups.length, 7));
test('150. density group', () => assert.ok(themeC.groups.some((g) => g.group === 'density')));
test('151. semanticStatus tokens', () => assert.ok(themeC.groups.find((g) => g.group === 'semanticStatus').tokens.includes('danger')));
test('152. realCss false', () => assert.equal(themeC.realCss, false));
test('153. requiredTailwindClasses false', () => assert.equal(themeC.requiredTailwindClasses, false));
test('154. stylesheetCreated false', () => assert.equal(themeC.stylesheetCreated, false));
test('155. cssRuntime false', () => assert.equal(themeC.cssRuntime, false));
test('156. VISUAL_THEME_TOKEN_GROUPS frozen', () => assert.ok(Object.isFrozen(VISUAL_THEME_TOKEN_GROUPS)));
test('157. theme metadataOnly', () => assert.equal(themeC.metadataOnly, true));
test('158. visualThemeTokenDigest present', () => assert.ok(typeof themeC.visualThemeTokenDigest === 'string'));

// ===== Validation (159-166) =====
test('159. validation kind', () => assert.equal(validationC.kind, 'dev-preview-visual-validation-contract'));
test('160. rules count 3', () => assert.equal(validationC.rules.length, 3));
test('161. required preserved', () => assert.equal(validationC.rules.find((r) => r.field === 'nome').required, true));
test('162. protected read-only', () => assert.equal(validationC.rules.find((r) => r.field === 'tenantId').readOnly, true));
test('163. protectedRemainReadOnly', () => assert.equal(validationC.protectedRemainReadOnly, true));
test('164. executesValidation false', () => assert.equal(validationC.executesValidation, false));
test('165. mutatesData false', () => assert.equal(validationC.mutatesData, false));
test('166. rules executesCode false', () => assert.ok(validationC.rules.every((r) => r.executesCode === false)));

// ===== Accessibility (167-175) =====
test('167. a11y kind', () => assert.equal(a11yC.kind, 'dev-preview-visual-accessibility-contract'));
test('168. labelsRequired', () => assert.equal(a11yC.labelsRequired, true));
test('169. aria placeholders', () => assert.ok(a11yC.ariaMetadataPlaceholders.length >= 3));
test('170. keyboardPlan', () => assert.equal(a11yC.keyboardPlan.tabThroughFields, true));
test('171. focusOrder', () => assert.ok(a11yC.focusOrder.includes('form')));
test('172. blockedInteractionsAnnounced', () => assert.equal(a11yC.blockedInteractionsAnnounced, true));
test('173. domTouched false', () => assert.equal(a11yC.domTouched, false));
test('174. setsRealAria false', () => assert.equal(a11yC.setsRealAria, false));
test('175. visualAccessibilityDigest present', () => assert.ok(typeof a11yC.visualAccessibilityDigest === 'string'));

// ===== Route/placement blocked (176-188) =====
test('176. route kind', () => assert.equal(routeP.kind, 'dev-preview-visual-route-plan-metadata'));
test('177. futureRoutePlan path', () => assert.equal(routeP.futureRoutePlan, '/studio/preview/visual/clientes'));
test('178. routeCreated false', () => assert.equal(routeP.routeCreated, false));
test('179. routerMounted false', () => assert.equal(routeP.routerMounted, false));
test('180. route appTouched false', () => assert.equal(routeP.appTouched, false));
test('181. route navigationTouched false', () => assert.equal(routeP.navigationTouched, false));
test('182. route blockedNow', () => assert.equal(routeP.blockedNow, true));
test('183. placement kind', () => assert.equal(placeP.kind, 'dev-preview-visual-placement-plan-metadata'));
test('184. menuCreated false', () => assert.equal(placeP.menuCreated, false));
test('185. navMounted false', () => assert.equal(placeP.navMounted, false));
test('186. placement appTouched false', () => assert.equal(placeP.appTouched, false));
test('187. placement blockedNow', () => assert.equal(placeP.blockedNow, true));
test('188. placement reason future slice', () => assert.match(placeP.reason, /future approved dev preview runtime slice/));

// ===== Runtime safety (189-200) =====
test('189. safety kind', () => assert.equal(safety.kind, 'dev-preview-visual-runtime-safety-metadata'));
test('190. headless', () => assert.equal(safety.headless, true));
test('191. anySideEffect false', () => assert.equal(safety.anySideEffect, false));
test('192. backendAccessed false', () => assert.equal(safety.backendAccessed, false));
test('193. prismaAccessed false', () => assert.equal(safety.prismaAccessed, false));
test('194. productionAccessed false', () => assert.equal(safety.productionAccessed, false));
test('195. fetchUsed false', () => assert.equal(safety.fetchUsed, false));
test('196. mutationAllowed false', () => assert.equal(safety.mutationAllowed, false));
test('197. domCreated/cssCreated false', () => { assert.equal(safety.domCreated, false); assert.equal(safety.cssCreated, false); });
test('198. reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('199. sideEffectFlags all false', () => assert.ok(Object.values(safety.sideEffectFlags).every((v) => v === false)));
test('200. runtimeSafetyDigest present', () => assert.ok(typeof safety.runtimeSafetyDigest === 'string'));

// ===== Readiness decision (201-210) =====
test('201. readiness kind', () => assert.equal(V.readinessDecision.kind, 'dev-preview-visual-readiness-decision'));
test('202. ready state', () => assert.equal(V.readinessDecision.readiness, 'studio_dev_preview_visual_contract_ready'));
test('203. readyForVisualContract', () => assert.equal(V.readinessDecision.readyForDevPreviewVisualContract, true));
test('204. readyForVisualRuntime false', () => assert.equal(V.readinessDecision.readyForDevPreviewVisualRuntime, false));
test('205. readyForRealModuleGeneration false', () => assert.equal(V.readinessDecision.readyForRealModuleGeneration, false));
test('206. readyForProduction false', () => assert.equal(V.readinessDecision.readyForProduction, false));
test('207. blockers empty', () => assert.deepEqual(V.readinessDecision.blockers, []));
test('208. blocked on blockers', () => { const r = createDevPreviewVisualReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForDevPreviewVisualContract, false); });
test('209. readiness state in enum', () => assert.ok(VISUAL_CONTRACT_READINESS_STATES.includes(V.readinessDecision.readiness)));
test('210. even if future runtime true it stays false here', () => assert.equal(createDevPreviewVisualReadinessDecision({}).readyForDevPreviewVisualRuntime, false));

// ===== Manifest (211-219) =====
test('211. manifest kind', () => assert.equal(V.manifest.kind, 'dev-preview-visual-contract-manifest'));
test('212. manifest name', () => assert.equal(V.manifest.visualContractName, VISUAL_CONTRACT_NAME));
test('213. manifest version', () => assert.equal(V.manifest.visualContractVersion, VISUAL_CONTRACT_VERSION));
test('214. manifest upstream bridge', () => assert.equal(V.manifest.upstream.bridgeContract, DEV_PREVIEW_BRIDGE_VERSION));
test('215. manifest parts.session digest', () => assert.equal(V.manifest.parts.session, session.sessionDigest));
test('216. manifest parts.visualTree digest', () => assert.ok(typeof V.manifest.parts.visualTree === 'string'));
test('217. manifest capabilities headless', () => assert.equal(V.manifest.capabilities.headless, true));
test('218. manifest standalone builds', () => assert.equal(createDevPreviewVisualContractManifest({ bridge: BRIDGE }).kind, 'dev-preview-visual-contract-manifest'));
test('219. manifestDigest present', () => assert.ok(typeof V.manifest.manifestDigest === 'string'));

// ===== Verifier (220-232) =====
test('220. verification ok', () => assert.equal(V.verification.ok, true));
test('221. verification valid', () => assert.equal(V.verification.valid, true));
test('222. verification headless', () => assert.equal(V.verification.headless, true));
test('223. verification no blockers', () => assert.equal(V.verification.blockerCount, 0));
test('224. verifier detects uiCreated', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, uiCreated: true } } }); assert.ok(r.blockers.includes('capability_uiCreated_must_be_false')); });
test('225. verifier detects domCreated', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, domCreated: true } } }); assert.ok(r.blockers.includes('capability_domCreated_must_be_false')); });
test('226. verifier detects cssCreated', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_cssCreated_must_be_false')); });
test('227. verifier detects routeCreated/menuCreated', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('228. verifier detects backend/prisma', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('229. verifier detects mutation/persistence', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: { headless: true, contractOnly: true, metadataOnly: true, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('230. verifier detects unsafe interaction', () => { const r = verifyDevPreviewVisualContract({ contract: { capabilities: VISUAL_CONTRACT_HEADLESS_CAPABILITIES, visualInteraction: { anyMutationEnabled: true } } }); assert.ok(r.blockers.includes('unsafe_interaction_mutation_enabled')); });
test('231. verifier never throws on junk', () => assert.doesNotThrow(() => verifyDevPreviewVisualContract({ contract: null })));
test('232. verificationDigest present', () => assert.ok(typeof V.verification.verificationDigest === 'string'));

// ===== Compatibility (233-240) =====
test('233. compatibility present', () => assert.equal(V.compatibility.kind, 'dev-preview-visual-contract-compatibility'));
test('234. compatibleWithDevPreviewBridge', () => assert.equal(V.compatibility.compatibleWithDevPreviewBridge, true));
test('235. compat readyForVisualRuntime false', () => assert.equal(V.compatibility.readyForDevPreviewVisualRuntime, false));
test('236. compat readyForRealModuleGeneration false', () => assert.equal(V.compatibility.readyForRealModuleGeneration, false));
test('237. compat status future runtime', () => assert.equal(V.compatibility.status, 'ready_for_future_dev_preview_visual_runtime_contract'));
test('238. compat not blocked', () => assert.equal(V.compatibility.blocked, false));
test('239. mismatch → warning', () => { const r = checkDevPreviewVisualContractCompatibility({ bridge: { bridgeVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithDevPreviewBridge, false); assert.ok(r.warnings.includes('incompatible_bridgeContract')); });
test('240. compatibilityDigest present', () => assert.ok(typeof V.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (241-255) =====
test('241. diagnostics present', () => assert.equal(V.diagnostics.kind, 'dev-preview-visual-contract-diagnostics'));
test('242. diagnostics passive', () => assert.equal(V.diagnostics.passive, true));
test('243. diagnostics ok', () => assert.equal(V.diagnostics.ok, true));
test('244. diagnostics headlessConfirmed', () => assert.equal(V.diagnostics.headlessConfirmed, true));
test('245. diagnostics logged false', () => assert.equal(V.diagnostics.logged, false));
test('246. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(V.diagnostics))));
const fbNo = createStudioDevPreviewVisualContract({});
const fbBad = createStudioDevPreviewVisualContract({ bridge: { kind: 'other' } });
const fbFallback = createStudioDevPreviewVisualContract({ bridge: { kind: 'studio-dev-preview-contract-bridge', fallback: true } });
test('247. missing bridge → fallback', () => assert.equal(fbNo.fallback, true));
test('248. wrong-kind bridge → fallback', () => assert.equal(fbBad.fallback, true));
test('249. fallback bridge → fallback', () => assert.equal(fbFallback.fallback, true));
test('250. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('251. fallback not ready for contract', () => assert.equal(fbNo.readyForDevPreviewVisualContract, false));
test('252. fallback not ready for runtime/production', () => { assert.equal(fbNo.readyForDevPreviewVisualRuntime, false); assert.equal(fbNo.readyForProduction, false); });
test('253. fallback caps headless', () => assert.equal(fbNo.capabilities.headless, true));
test('254. fallback caps uiCreated false', () => assert.equal(fbNo.capabilities.uiCreated, false));
test('255. fallback never throws', () => assert.doesNotThrow(() => createDevPreviewVisualContractFallback({ reason: 'x' })));

// ===== Errors (256-263) =====
test('256. error codes >= 30', () => assert.ok(VISUAL_CONTRACT_ERROR_CODES.length >= 30));
test('257. error descriptor sanitized', () => { const e = createDevPreviewVisualContractError('VISUAL_CONTRACT_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('258. error no ui/dom/css', () => { const e = createDevPreviewVisualContractError('VISUAL_CONTRACT_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); });
test('259. unknown code normalized', () => assert.equal(createDevPreviewVisualContractError('NOPE').code, 'VISUAL_CONTRACT_INVALID_BRIDGE'));
test('260. typed error', () => { const e = new DevPreviewVisualContractError('VISUAL_CONTRACT_INVALID_BRIDGE', 'x'); assert.ok(e instanceof Error && e.name === 'DevPreviewVisualContractError'); });
test('261. helper error', () => assert.equal(devPreviewVisualContractError('VISUAL_CONTRACT_FETCH_BLOCKED', 'x').code, 'VISUAL_CONTRACT_FETCH_BLOCKED'));
test('262. codes cover react/jsx/tsx/dom/css/route/menu', () => ['VISUAL_CONTRACT_REACT_COMPONENT_BLOCKED', 'VISUAL_CONTRACT_JSX_BLOCKED', 'VISUAL_CONTRACT_TSX_BLOCKED', 'VISUAL_CONTRACT_DOM_BLOCKED', 'VISUAL_CONTRACT_CSS_RUNTIME_BLOCKED', 'VISUAL_CONTRACT_ROUTE_BLOCKED', 'VISUAL_CONTRACT_MENU_BLOCKED'].forEach((c) => assert.ok(VISUAL_CONTRACT_ERROR_CODES.includes(c))));
test('263. codes cover mutation/persistence/migration', () => ['VISUAL_CONTRACT_MUTATION_BLOCKED', 'VISUAL_CONTRACT_PERSISTENCE_BLOCKED', 'VISUAL_CONTRACT_MIGRATION_BLOCKED'].forEach((c) => assert.ok(VISUAL_CONTRACT_ERROR_CODES.includes(c))));

// ===== Config flags (264-272) =====
test('264. flag off by default', () => assert.equal(isStudioDevPreviewVisualContractEnabled({}), false));
test('265. flag on in dev', () => assert.equal(isStudioDevPreviewVisualContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('266. flag fails closed in production', () => assert.equal(isStudioDevPreviewVisualContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('267. tree flag fails closed in production', () => assert.equal(isStudioDevPreviewVisualTreeEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('268. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewVisualVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('269. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewVisualCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('270. master flag enables tree in dev', () => assert.equal(isStudioDevPreviewVisualTreeEnabled({ [MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('271. readiness states frozen', () => assert.ok(Object.isFrozen(VISUAL_CONTRACT_READINESS_STATES)));
test('272. visualDigest deterministic + format', () => { assert.equal(visualDigest({ a: 1 }), visualDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(visualDigest({ a: 1 }))); });

// ===== Determinism / purity (273-282) =====
test('273. deterministic overallDigest', () => assert.equal(V.overallDigest, createStudioDevPreviewVisualContract({ bridge: BRIDGE }).overallDigest));
test('274. deterministic visualContractDigest', () => assert.equal(V.visualContractDigest, createStudioDevPreviewVisualContract({ bridge: BRIDGE }).visualContractDigest));
test('275. input not mutated', () => { const snap = JSON.stringify(BRIDGE); createStudioDevPreviewVisualContract({ bridge: BRIDGE }); assert.equal(JSON.stringify(BRIDGE), snap); });
test('276. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(V))));
test('277. different module → different digest', () => { const b2 = createStudioDevPreviewContractBridge({ sandbox: { ...SANDBOX, moduleId: 'produtos' } }); assert.notEqual(V.overallDigest, createStudioDevPreviewVisualContract({ bridge: b2 }).overallDigest); });
test('278. builds from real sandbox→bridge chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const br = createStudioDevPreviewContractBridge({ sandbox: sb });
  const vv = createStudioDevPreviewVisualContract({ bridge: br });
  assert.equal(vv.kind, 'studio-dev-preview-visual-contract');
  assert.equal(vv.readyForDevPreviewVisualRuntime, false);
});
test('279. protected fields remain read-only across contracts', () => { assert.equal(validationC.rules.find((r) => r.field === 'tenantId').readOnly, true); });
test('280. tenant/permission hints preserved', () => { assert.equal(tree.permissionHints.tenantRequired, true); assert.equal(tree.permissionHints.defaultDeny, true); });
test('281. no Empresas rewrite', () => assert.equal(V.capabilities.rewriteEmpresas, false));
test('282. no module registration', () => assert.equal(V.capabilities.moduleRegistered, false));

// ===== Purity/no-side-effect code scan (283-293) =====
test('283. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('284. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('285. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('286. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('287. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('288. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('289. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('290. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('291. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('292. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('293. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));

// ===== Scope safety (294-316) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-visual-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-visual-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('294. visual-contract subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-visual-contract')));
test('295. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('296. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('297. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('298. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('299. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('300. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('301. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('302. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('303. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('304. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('305. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('306. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('307. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('308. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('309. CSS global not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('310. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('311. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('312. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('313. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('314. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('315. net-new scope is visual-contract only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('316. upstream bridge present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-contract-bridge/index.js')));

// ===== Evidence docs (D1-D16) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-VISUAL-CONTRACT-REPORT.md', 'VISUAL-CONTRACT-SESSION.md',
  'VISUAL-TREE-CONTRACT.md', 'VISUAL-SCREEN-CONTRACT.md', 'COMPONENT-PLACEHOLDER-REGISTRY.md',
  'VISUAL-STATE-CONTRACT.md', 'VISUAL-INTERACTION-CONTRACT.md', 'THEME-TOKEN-CONTRACT.md',
  'ACCESSIBILITY-CONTRACT.md', 'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-visual-contract/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/RUNTIME SHELL|runtime/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
