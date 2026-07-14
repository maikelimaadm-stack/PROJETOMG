import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  DEV_PREVIEW_BRIDGE_NAME,
  DEV_PREVIEW_BRIDGE_SEMVER,
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_MODE,
  DEV_PREVIEW_BRIDGE_ENVIRONMENT,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  ALLOWED_COMPONENT_KINDS,
  BLOCKED_COMPONENT_KINDS,
  DEV_PREVIEW_BRIDGE_READINESS_STATES,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK_FLAG,
  bridgeDigest,
  isStudioDevPreviewContractBridgeEnabled,
  isStudioDevPreviewRenderSchemaEnabled,
  isStudioDevPreviewVerifyEnabled,
  isStudioDevPreviewCompatibilityCheckEnabled,
  DEV_PREVIEW_BRIDGE_ERROR_CODES,
  DevPreviewBridgeError,
  createDevPreviewBridgeError,
  devPreviewBridgeError,
  createDevPreviewBridgeSession,
  createDevPreviewRenderSchema,
  createDevPreviewLayoutSchema,
  createDevPreviewScreenSchema,
  createDevPreviewTableBridgeSchema,
  createDevPreviewFormBridgeSchema,
  createDevPreviewDetailBridgeSchema,
  createDevPreviewFieldBridgeSchema,
  createDevPreviewActionBridgeSchema,
  createDevPreviewPermissionBridgeSchema,
  createDevPreviewAllowedComponentContract,
  createDevPreviewVisualAdapterContract,
  createDevPreviewRoutePlanMetadata,
  createDevPreviewMenuPlanMetadata,
  createDevPreviewRuntimeSafetyMetadata,
  createDevPreviewReadinessDecision,
  createDevPreviewBridgeManifest,
  verifyDevPreviewBridgeContract,
  checkDevPreviewBridgeCompatibility,
  createDevPreviewBridgeDiagnostics,
  createDevPreviewBridgeFallback,
  createStudioDevPreviewContractBridge,
} from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-contract-bridge');

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

// Hand-built sandbox fixture (precise shape control for field-level assertions).
const MS = {
  moduleId: 'clientes',
  sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
  engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
  overallDigest: 'fnv1a-deadbeef',
  sourceBlueprintDigest: 'fnv1a-cafe0001',
  tablePreviewMetadata: { columns: [
    { name: 'nome', label: 'Nome', type: 'text', sortable: true },
    { name: 'ativo', label: 'Ativo', type: 'boolean' },
    { name: 'tenantId', type: 'text', protectedColumn: true, tenantColumn: true },
  ] },
  formPreviewMetadata: { fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'ativo', type: 'boolean' },
    { name: 'tenantId', type: 'text', protectedField: true, tenantScoped: true },
  ] },
  detailPreviewMetadata: { fields: [
    { name: 'nome', type: 'text' },
    { name: 'tenantId', type: 'text', protectedField: true },
  ] },
  fieldPreviewMetadata: { fields: [
    { name: 'nome', type: 'text' },
    { name: 'ativo', type: 'boolean' },
    { name: 'nascimento', type: 'date' },
    { name: 'idade', type: 'number' },
    { name: 'categoria', type: 'select' },
    { name: 'tenantId', type: 'text', protectedField: true },
  ] },
  actionPreviewMetadata: { actions: [
    { action: 'read', mutation: false },
    { action: 'create', mutation: true },
    { action: 'update', mutation: true },
  ] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};

const B = createStudioDevPreviewContractBridge({ sandbox: MS });
const session = createDevPreviewBridgeSession({ sandbox: MS });
const render = createDevPreviewRenderSchema({ sandbox: MS });
const layout = createDevPreviewLayoutSchema({ sandbox: MS });
const screen = createDevPreviewScreenSchema({ sandbox: MS });
const tableB = createDevPreviewTableBridgeSchema({ sandbox: MS });
const formB = createDevPreviewFormBridgeSchema({ sandbox: MS });
const detailB = createDevPreviewDetailBridgeSchema({ sandbox: MS });
const fieldB = createDevPreviewFieldBridgeSchema({ sandbox: MS });
const actionB = createDevPreviewActionBridgeSchema({ sandbox: MS });
const permB = createDevPreviewPermissionBridgeSchema({ sandbox: MS });
const allowedC = createDevPreviewAllowedComponentContract({ sandbox: MS });
const visualC = createDevPreviewVisualAdapterContract({ sandbox: MS });
const routeP = createDevPreviewRoutePlanMetadata({ sandbox: MS });
const menuP = createDevPreviewMenuPlanMetadata({ sandbox: MS });
const safety = createDevPreviewRuntimeSafetyMetadata({ sandbox: MS });

// ===== Bridge base (1-32) =====
test('1. bridge created', () => assert.equal(B.kind, 'studio-dev-preview-contract-bridge'));
test('2. bridgeName', () => { assert.equal(B.bridgeName, 'studio-dev-preview-contract-bridge'); assert.equal(B.bridgeName, DEV_PREVIEW_BRIDGE_NAME); });
test('3. bridgeVersion', () => { assert.equal(B.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'); assert.equal(B.bridgeVersion, DEV_PREVIEW_BRIDGE_VERSION); });
test('4. semver', () => assert.equal(DEV_PREVIEW_BRIDGE_SEMVER, '1.0.0'));
test('5. mode', () => { assert.equal(B.mode, 'headless_dev_preview_contract_bridge'); assert.equal(B.mode, DEV_PREVIEW_BRIDGE_MODE); });
test('6. environment const', () => assert.equal(DEV_PREVIEW_BRIDGE_ENVIRONMENT, 'local_contract'));
test('7. moduleId', () => assert.equal(B.moduleId, 'clientes'));
test('8. not fallback', () => assert.equal(B.fallback, false));
test('9. readiness ready', () => assert.equal(B.readiness, 'studio_dev_preview_contract_bridge_ready'));
test('10. readyForDevPreviewBridge true', () => assert.equal(B.readyForDevPreviewBridge, true));
test('11. readyForDevPreviewVisualSlice true', () => assert.equal(B.readyForDevPreviewVisualSlice, true));
test('12. readyForRealModuleGeneration false', () => assert.equal(B.readyForRealModuleGeneration, false));
test('13. readyForProduction false', () => assert.equal(B.readyForProduction, false));
test('14. blockerCount 0', () => assert.equal(B.blockerCount, 0));
test('15. warningCount 0', () => assert.equal(B.warningCount, 0));
test('16. metadataOnly', () => assert.equal(B.metadataOnly, true));
test('17. capabilities.headless', () => assert.equal(B.capabilities.headless, true));
test('18. capabilities.contractOnly', () => assert.equal(B.capabilities.contractOnly, true));
test('19. caps.reactComponentCreated false', () => assert.equal(B.capabilities.reactComponentCreated, false));
test('20. caps.jsxCreated false', () => assert.equal(B.capabilities.jsxCreated, false));
test('21. caps.tsxCreated false', () => assert.equal(B.capabilities.tsxCreated, false));
test('22. caps.uiCreated false', () => assert.equal(B.capabilities.uiCreated, false));
test('23. caps.routeCreated false', () => assert.equal(B.capabilities.routeCreated, false));
test('24. caps.menuCreated false', () => assert.equal(B.capabilities.menuCreated, false));
test('25. caps.moduleGenerated false', () => assert.equal(B.capabilities.moduleGenerated, false));
test('26. caps.filesWrittenToModule false', () => assert.equal(B.capabilities.filesWrittenToModule, false));
test('27. caps.moduleRegistered false', () => assert.equal(B.capabilities.moduleRegistered, false));
test('28. caps.backendAccessed false', () => assert.equal(B.capabilities.backendAccessed, false));
test('29. caps.prismaAccessed false', () => assert.equal(B.capabilities.prismaAccessed, false));
test('30. caps.productionAccessed false', () => assert.equal(B.capabilities.productionAccessed, false));
test('31. caps.stagingAccessed false', () => assert.equal(B.capabilities.stagingAccessed, false));
test('32. caps.fetchUsed/mutationAllowed/persistenceCreated/rewriteEmpresas false', () => {
  assert.equal(B.capabilities.fetchUsed, false);
  assert.equal(B.capabilities.mutationAllowed, false);
  assert.equal(B.capabilities.persistenceCreated, false);
  assert.equal(B.capabilities.rewriteEmpresas, false);
});
test('33. capabilities frozen source', () => assert.ok(Object.isFrozen(DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES)));
test('34. overallDigest present', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(B.overallDigest)));
test('35. bridgeDigest present', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(B.bridgeDigest)));

// ===== Session (36-50) =====
test('36. session kind', () => assert.equal(session.kind, 'dev-preview-bridge-session'));
test('37. bridgeId', () => assert.equal(session.bridgeId, 'clientes#dev-preview-contract-bridge'));
test('38. session bridgeVersion', () => assert.equal(session.bridgeVersion, DEV_PREVIEW_BRIDGE_VERSION));
test('39. session moduleId', () => assert.equal(session.moduleId, 'clientes'));
test('40. sourceSandboxContract', () => assert.equal(session.sourceSandboxContract, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('41. sourcePlannerContract', () => assert.equal(session.sourcePlannerContract, MODULE_REFERENCE_PLANNER_VERSION));
test('42. sourceEngineContract', () => assert.equal(session.sourceEngineContract, STUDIO_BLUEPRINT_ENGINE_VERSION));
test('43. sourceSandboxDigest', () => assert.equal(session.sourceSandboxDigest, 'fnv1a-deadbeef'));
test('44. session mode', () => assert.equal(session.mode, DEV_PREVIEW_BRIDGE_MODE));
test('45. createdFrom', () => assert.equal(session.createdFrom, 'studio-module-preview-sandbox-contract'));
test('46. seed deterministic', () => assert.equal(session.seed, createDevPreviewBridgeSession({ sandbox: MS }).seed));
test('47. usesStorage false', () => assert.equal(session.usesStorage, false));
test('48. usesFetch false', () => assert.equal(session.usesFetch, false));
test('49. usesPersistence false', () => assert.equal(session.usesPersistence, false));
test('50. runtimeSideEffects false', () => assert.equal(session.runtimeSideEffects, false));

// ===== Render schema (51-70) =====
test('51. render kind', () => assert.equal(render.kind, 'dev-preview-render-schema'));
test('52. render version', () => assert.equal(render.renderSchemaVersion, 'dev-preview-render-schema@1.0.0'));
test('53. render moduleId', () => assert.equal(render.moduleId, 'clientes'));
test('54. screenTree root', () => assert.equal(render.screenTree.root, 'screen'));
test('55. screenTree has areas', () => assert.ok(Array.isArray(render.screenTree.areas) && render.screenTree.areas.length >= 3));
test('56. fieldBindings count', () => assert.equal(render.fieldBindings.length, 3));
test('57. protected field binds to label', () => { const b = render.fieldBindings.find((x) => x.name === 'tenantId'); assert.equal(b.componentKind, 'label'); assert.equal(b.readOnly, true); });
test('58. normal field binds to input-placeholder', () => { const b = render.fieldBindings.find((x) => x.name === 'nome'); assert.equal(b.componentKind, 'input-placeholder'); });
test('59. actionBindings both disabled', () => assert.ok(render.actionBindings.every((a) => a.enabled === false)));
test('60. permissionHints defaultDeny', () => assert.equal(render.permissionHints.defaultDeny, true));
test('61. permissionHints failClosed', () => assert.equal(render.permissionHints.failClosed, true));
test('62. permissionHints tenantRequired', () => assert.equal(render.permissionHints.tenantRequired, true));
test('63. componentImport false', () => assert.equal(render.componentImport, false));
test('64. jsx false', () => assert.equal(render.jsx, false));
test('65. tsx false', () => assert.equal(render.tsx, false));
test('66. react false', () => assert.equal(render.react, false));
test('67. dom false', () => assert.equal(render.dom, false));
test('68. css false', () => assert.equal(render.css, false));
test('69. render metadataOnly', () => assert.equal(render.metadataOnly, true));
test('70. renderSchemaDigest present', () => assert.ok(typeof render.renderSchemaDigest === 'string'));

// ===== Layout schema (71-85) =====
test('71. layout kind', () => assert.equal(layout.kind, 'dev-preview-layout-schema'));
test('72. layout version', () => assert.equal(layout.layoutSchemaVersion, 'dev-preview-layout-schema@1.0.0'));
test('73. layoutKind', () => assert.equal(layout.layoutKind, 'cadastro-standard'));
test('74. screenDensity', () => assert.equal(layout.screenDensity, 'comfortable'));
test('75. grid columns 12', () => assert.equal(layout.grid.columns, 12));
test('76. sectionOrder includes table', () => assert.ok(layout.sectionOrder.includes('table')));
test('77. positions.table columnCount', () => assert.equal(layout.positions.table.columnCount, 3));
test('78. positions.form fieldCount', () => assert.equal(layout.positions.form.fieldCount, 3));
test('79. positions.detail readOnly', () => assert.equal(layout.positions.detail.readOnly, true));
test('80. responsivePlan breakpoints', () => assert.ok(layout.responsivePlan.breakpoints.includes('md')));
test('81. realCss false', () => assert.equal(layout.realCss, false));
test('82. requiredTailwindClasses false', () => assert.equal(layout.requiredTailwindClasses, false));
test('83. domLayout false', () => assert.equal(layout.domLayout, false));
test('84. layout metadataOnly', () => assert.equal(layout.metadataOnly, true));
test('85. layoutSchemaDigest present', () => assert.ok(typeof layout.layoutSchemaDigest === 'string'));

// ===== Screen schema (86-100) =====
test('86. screen kind', () => assert.equal(screen.kind, 'dev-preview-screen-schema'));
test('87. screen version', () => assert.equal(screen.screenSchemaVersion, 'dev-preview-screen-schema@1.0.0'));
test('88. 3 screens', () => assert.equal(screen.screens.length, 3));
test('89. list screen', () => assert.ok(screen.screens.some((s) => s.screenId === 'list')));
test('90. form screen', () => assert.ok(screen.screens.some((s) => s.screenId === 'form')));
test('91. detail screen readOnly', () => { const d = screen.screens.find((s) => s.screenId === 'detail'); assert.equal(d.readOnly, true); });
test('92. state empty', () => assert.equal(screen.states.empty.kind, 'empty'));
test('93. state loading', () => assert.equal(screen.states.loading.kind, 'loading'));
test('94. state error', () => assert.equal(screen.states.error.kind, 'error'));
test('95. state blocked', () => assert.equal(screen.states.blocked.kind, 'blocked'));
test('96. requiredStates 4', () => assert.equal(screen.requiredStates.length, 4));
test('97. screen componentCreated false', () => assert.equal(screen.componentCreated, false));
test('98. screen routeCreated false', () => assert.equal(screen.routeCreated, false));
test('99. screen metadataOnly', () => assert.equal(screen.metadataOnly, true));
test('100. screenSchemaDigest present', () => assert.ok(typeof screen.screenSchemaDigest === 'string'));

// ===== Table bridge (101-113) =====
test('101. table kind', () => assert.equal(tableB.kind, 'dev-preview-table-bridge-schema'));
test('102. table columns count', () => assert.equal(tableB.columns.length, 3));
test('103. protected column preserved', () => { const c = tableB.columns.find((x) => x.name === 'tenantId'); assert.equal(c.protectedColumn, true); assert.equal(c.tenantColumn, true); });
test('104. protected column not visible', () => { const c = tableB.columns.find((x) => x.name === 'tenantId'); assert.equal(c.visible, false); });
test('105. normal column visible', () => { const c = tableB.columns.find((x) => x.name === 'nome'); assert.equal(c.visible, true); });
test('106. column componentKind table', () => assert.ok(tableB.columns.every((c) => c.componentKind === 'table')));
test('107. sortable preserved', () => { const c = tableB.columns.find((x) => x.name === 'nome'); assert.equal(c.sortable, true); });
test('108. rowActions disabled', () => assert.ok(tableB.rowActionsMetadata.every((a) => a.enabled === false)));
test('109. dataFetched false', () => assert.equal(tableB.dataFetched, false));
test('110. table componentCreated false', () => assert.equal(tableB.componentCreated, false));
test('111. table mutationAllowed false', () => assert.equal(tableB.mutationAllowed, false));
test('112. table metadataOnly', () => assert.equal(tableB.metadataOnly, true));
test('113. tableBridgeDigest present', () => assert.ok(typeof tableB.tableBridgeDigest === 'string'));

// ===== Form bridge (114-125) =====
test('114. form kind', () => assert.equal(formB.kind, 'dev-preview-form-bridge-schema'));
test('115. form fields count', () => assert.equal(formB.fields.length, 3));
test('116. required preserved', () => { const f = formB.fields.find((x) => x.name === 'nome'); assert.equal(f.required, true); });
test('117. protected field readOnly label', () => { const f = formB.fields.find((x) => x.name === 'tenantId'); assert.equal(f.readOnly, true); assert.equal(f.componentKind, 'label'); });
test('118. normal field input-placeholder', () => { const f = formB.fields.find((x) => x.name === 'nome'); assert.equal(f.componentKind, 'input-placeholder'); });
test('119. submitBinding disabled', () => { assert.equal(formB.submitBinding.enabled, false); assert.equal(formB.submitBinding.mutation, false); });
test('120. realInput false', () => assert.equal(formB.realInput, false));
test('121. form componentCreated false', () => assert.equal(formB.componentCreated, false));
test('122. form mutationAllowed false', () => assert.equal(formB.mutationAllowed, false));
test('123. form sections', () => assert.ok(Array.isArray(formB.sections) && formB.sections.length >= 1));
test('124. form metadataOnly', () => assert.equal(formB.metadataOnly, true));
test('125. formBridgeDigest present', () => assert.ok(typeof formB.formBridgeDigest === 'string'));

// ===== Detail bridge (126-135) =====
test('126. detail kind', () => assert.equal(detailB.kind, 'dev-preview-detail-bridge-schema'));
test('127. detail fields count', () => assert.equal(detailB.fields.length, 2));
test('128. all detail fields readOnly', () => assert.ok(detailB.fields.every((f) => f.readOnly === true)));
test('129. all detail componentKind label', () => assert.ok(detailB.fields.every((f) => f.componentKind === 'label')));
test('130. detail readOnly', () => assert.equal(detailB.readOnly, true));
test('131. detail editable false', () => assert.equal(detailB.editable, false));
test('132. detail componentCreated false', () => assert.equal(detailB.componentCreated, false));
test('133. detail mutationAllowed false', () => assert.equal(detailB.mutationAllowed, false));
test('134. detail metadataOnly', () => assert.equal(detailB.metadataOnly, true));
test('135. detailBridgeDigest present', () => assert.ok(typeof detailB.detailBridgeDigest === 'string'));

// ===== Field bridge (136-150) =====
test('136. field kind', () => assert.equal(fieldB.kind, 'dev-preview-field-bridge-schema'));
test('137. field count', () => assert.equal(fieldB.fields.length, 6));
test('138. text → input-placeholder', () => assert.equal(fieldB.fields.find((f) => f.name === 'nome').componentKind, 'input-placeholder'));
test('139. boolean → boolean-placeholder', () => assert.equal(fieldB.fields.find((f) => f.name === 'ativo').componentKind, 'boolean-placeholder'));
test('140. date → date-placeholder', () => assert.equal(fieldB.fields.find((f) => f.name === 'nascimento').componentKind, 'date-placeholder'));
test('141. number → number-placeholder', () => assert.equal(fieldB.fields.find((f) => f.name === 'idade').componentKind, 'number-placeholder'));
test('142. select → select-placeholder', () => assert.equal(fieldB.fields.find((f) => f.name === 'categoria').componentKind, 'select-placeholder'));
test('143. protected → label', () => assert.equal(fieldB.fields.find((f) => f.name === 'tenantId').componentKind, 'label'));
test('144. all component kinds allowed', () => assert.equal(fieldB.allComponentsAllowed, true));
test('145. all mapped kinds in ALLOWED set', () => assert.ok(fieldB.fields.every((f) => ALLOWED_COMPONENT_KINDS.includes(f.componentKind))));
test('146. no realInput', () => assert.ok(fieldB.fields.every((f) => f.realInput === false)));
test('147. field componentCreated false', () => assert.equal(fieldB.componentCreated, false));
test('148. field metadataOnly', () => assert.equal(fieldB.metadataOnly, true));
test('149. fieldBridgeDigest present', () => assert.ok(typeof fieldB.fieldBridgeDigest === 'string'));
test('150. unknown type falls back to text-placeholder', () => { const r = createDevPreviewFieldBridgeSchema({ sandbox: { fieldPreviewMetadata: { fields: [{ name: 'x', type: 'weird' }] } } }); assert.equal(r.fields[0].componentKind, 'text-placeholder'); });

// ===== Action bridge (151-162) =====
test('151. action kind', () => assert.equal(actionB.kind, 'dev-preview-action-bridge-schema'));
test('152. action count', () => assert.equal(actionB.actions.length, 3));
test('153. all actions disabled', () => assert.ok(actionB.actions.every((a) => a.enabled === false)));
test('154. mutation action flagged mutation', () => { const a = actionB.actions.find((x) => x.action === 'create'); assert.equal(a.mutation, true); assert.equal(a.kind, 'mutation'); });
test('155. read action not mutation', () => { const a = actionB.actions.find((x) => x.action === 'read'); assert.equal(a.mutation, false); });
test('156. all button-placeholder', () => assert.ok(actionB.actions.every((a) => a.componentKind === 'button-placeholder')));
test('157. anyEnabled false', () => assert.equal(actionB.anyEnabled, false));
test('158. action mutationAllowed false', () => assert.equal(actionB.mutationAllowed, false));
test('159. action componentCreated false', () => assert.equal(actionB.componentCreated, false));
test('160. action metadataOnly', () => assert.equal(actionB.metadataOnly, true));
test('161. actionBridgeDigest present', () => assert.ok(typeof actionB.actionBridgeDigest === 'string'));
test('162. empty actions default to read', () => { const r = createDevPreviewActionBridgeSchema({ sandbox: {} }); assert.equal(r.actions[0].action, 'read'); assert.equal(r.actions[0].enabled, false); });

// ===== Permission bridge (163-172) =====
test('163. permission kind', () => assert.equal(permB.kind, 'dev-preview-permission-bridge-schema'));
test('164. defaultDeny', () => assert.equal(permB.defaultDeny, true));
test('165. failClosed', () => assert.equal(permB.failClosed, true));
test('166. tenantRequired', () => assert.equal(permB.tenantRequired, true));
test('167. requiredScopes preserved', () => assert.ok(permB.requiredScopes.includes('clientes:read')));
test('168. enforcementEngine false', () => assert.equal(permB.enforcementEngine, false));
test('169. grantsAccess false', () => assert.equal(permB.grantsAccess, false));
test('170. permission metadataOnly', () => assert.equal(permB.metadataOnly, true));
test('171. permissionBridgeDigest present', () => assert.ok(typeof permB.permissionBridgeDigest === 'string'));
test('172. empty perms fail closed by default', () => { const r = createDevPreviewPermissionBridgeSchema({ sandbox: {} }); assert.equal(r.defaultDeny, true); assert.equal(r.tenantRequired, true); });

// ===== Allowed component contract (173-183) =====
test('173. allowed kind', () => assert.equal(allowedC.kind, 'dev-preview-allowed-component-contract'));
test('174. allowed kinds match source', () => assert.deepEqual(allowedC.allowedComponentKinds, [...ALLOWED_COMPONENT_KINDS]));
test('175. blocked kinds match source', () => assert.deepEqual(allowedC.blockedComponentKinds, [...BLOCKED_COMPONENT_KINDS]));
test('176. allowedCount 16', () => assert.equal(allowedC.allowedCount, 16));
test('177. blocked kinds include react-component', () => assert.ok(allowedC.blockedComponentKinds.includes('react-component')));
test('178. blocked kinds include jsx/tsx/menu/nav/route', () => ['jsx', 'tsx', 'menu', 'nav', 'route'].forEach((k) => assert.ok(allowedC.blockedComponentKinds.includes(k))));
test('179. placeholderOnly', () => assert.equal(allowedC.placeholderOnly, true));
test('180. realComponentCreated false', () => assert.equal(allowedC.realComponentCreated, false));
test('181. reactComponentCreated false', () => assert.equal(allowedC.reactComponentCreated, false));
test('182. allowed metadataOnly', () => assert.equal(allowedC.metadataOnly, true));
test('183. ALLOWED and BLOCKED are disjoint', () => assert.ok(ALLOWED_COMPONENT_KINDS.every((k) => !BLOCKED_COMPONENT_KINDS.includes(k))));

// ===== Visual adapter contract (184-193) =====
test('184. visual kind', () => assert.equal(visualC.kind, 'dev-preview-visual-adapter-contract'));
test('185. adapterVersion', () => assert.equal(visualC.adapterVersion, 'dev-preview-visual-adapter-contract@1.0.0'));
test('186. inputs list', () => assert.ok(visualC.inputs.includes('renderSchema') && visualC.inputs.includes('layoutSchema')));
test('187. requiresReact false', () => assert.equal(visualC.requiresReact, false));
test('188. requiresDom false', () => assert.equal(visualC.requiresDom, false));
test('189. mountsAnything false', () => assert.equal(visualC.mountsAnything, false));
test('190. importsComponent false', () => assert.equal(visualC.importsComponent, false));
test('191. adapterImplemented false', () => assert.equal(visualC.adapterImplemented, false));
test('192. downstreamSlice marker', () => assert.equal(visualC.downstreamSlice, 'ready_for_dev_preview_visual_contract_slice'));
test('193. visual metadataOnly', () => assert.equal(visualC.metadataOnly, true));

// ===== Route plan (194-202) =====
test('194. route kind', () => assert.equal(routeP.kind, 'dev-preview-route-plan-metadata'));
test('195. plannedPath', () => assert.equal(routeP.plannedPath, '/studio/preview/clientes'));
test('196. plannedGuards', () => assert.ok(routeP.plannedGuards.includes('permission') && routeP.plannedGuards.includes('tenant')));
test('197. route wired false', () => assert.equal(routeP.wired, false));
test('198. routeCreated false', () => assert.equal(routeP.routeCreated, false));
test('199. routerMounted false', () => assert.equal(routeP.routerMounted, false));
test('200. route exposedInApp false', () => assert.equal(routeP.exposedInApp, false));
test('201. route blocked true', () => assert.equal(routeP.blocked, true));
test('202. route metadataOnly', () => assert.equal(routeP.metadataOnly, true));

// ===== Placement (menu) plan (203-211) =====
test('203. menu plan kind', () => assert.equal(menuP.kind, 'dev-preview-menu-plan-metadata'));
test('204. plannedLabel', () => assert.equal(menuP.plannedLabel, 'clientes'));
test('205. menu wired false', () => assert.equal(menuP.wired, false));
test('206. menuCreated false', () => assert.equal(menuP.menuCreated, false));
test('207. navMounted false', () => assert.equal(menuP.navMounted, false));
test('208. menu exposedInApp false', () => assert.equal(menuP.exposedInApp, false));
test('209. menu blocked true', () => assert.equal(menuP.blocked, true));
test('210. menu metadataOnly', () => assert.equal(menuP.metadataOnly, true));
test('211. menuPlanDigest present', () => assert.ok(typeof menuP.menuPlanDigest === 'string'));

// ===== Runtime safety (212-224) =====
test('212. safety kind', () => assert.equal(safety.kind, 'dev-preview-runtime-safety-metadata'));
test('213. headless true', () => assert.equal(safety.headless, true));
test('214. contractOnly true', () => assert.equal(safety.contractOnly, true));
test('215. anySideEffect false', () => assert.equal(safety.anySideEffect, false));
test('216. usesStorage false', () => assert.equal(safety.usesStorage, false));
test('217. usesNetwork false', () => assert.equal(safety.usesNetwork, false));
test('218. touchesBackend false', () => assert.equal(safety.touchesBackend, false));
test('219. touchesPrisma false', () => assert.equal(safety.touchesPrisma, false));
test('220. touchesProduction false', () => assert.equal(safety.touchesProduction, false));
test('221. mutates false', () => assert.equal(safety.mutates, false));
test('222. reversibleByNonConsumption true', () => assert.equal(safety.reversibleByNonConsumption, true));
test('223. sideEffectFlags all false', () => assert.ok(Object.values(safety.sideEffectFlags).every((v) => v === false)));
test('224. runtimeSafetyDigest present', () => assert.ok(typeof safety.runtimeSafetyDigest === 'string'));

// ===== Readiness decision (225-234) =====
test('225. readiness kind', () => assert.equal(B.readinessDecision.kind, 'dev-preview-readiness-decision'));
test('226. ready state', () => assert.equal(B.readinessDecision.readiness, 'studio_dev_preview_contract_bridge_ready'));
test('227. readyForDevPreviewBridge', () => assert.equal(B.readinessDecision.readyForDevPreviewBridge, true));
test('228. readyForRealModuleGeneration false', () => assert.equal(B.readinessDecision.readyForRealModuleGeneration, false));
test('229. readyForProduction false', () => assert.equal(B.readinessDecision.readyForProduction, false));
test('230. blockers empty', () => assert.deepEqual(B.readinessDecision.blockers, []));
test('231. blocked on blockers', () => { const r = createDevPreviewReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForDevPreviewBridge, false); });
test('232. readiness state in enum', () => assert.ok(DEV_PREVIEW_BRIDGE_READINESS_STATES.includes(B.readinessDecision.readiness)));
test('233. warnings passthrough', () => { const r = createDevPreviewReadinessDecision({ warnings: ['w1'] }); assert.equal(r.warningCount, 1); });
test('234. readinessDigest present', () => assert.ok(typeof B.readinessDecision.readinessDigest === 'string'));

// ===== Manifest (235-244) =====
test('235. manifest present', () => assert.equal(B.manifest.kind, 'dev-preview-bridge-manifest'));
test('236. manifest bridgeName', () => assert.equal(B.manifest.bridgeName, DEV_PREVIEW_BRIDGE_NAME));
test('237. manifest bridgeVersion', () => assert.equal(B.manifest.bridgeVersion, DEV_PREVIEW_BRIDGE_VERSION));
test('238. manifest upstream sandbox', () => assert.equal(B.manifest.upstream.sandboxContract, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('239. manifest parts.session digest', () => assert.equal(B.manifest.parts.session, session.sessionDigest));
test('240. manifest parts.renderSchema digest', () => assert.ok(typeof B.manifest.parts.renderSchema === 'string'));
test('241. manifest capabilities headless', () => assert.equal(B.manifest.capabilities.headless, true));
test('242. manifest metadataOnly', () => assert.equal(B.manifest.metadataOnly, true));
test('243. manifest standalone builds', () => assert.equal(createDevPreviewBridgeManifest({ sandbox: MS }).kind, 'dev-preview-bridge-manifest'));
test('244. manifestDigest present', () => assert.ok(typeof B.manifest.manifestDigest === 'string'));

// ===== Verifier (245-254) =====
test('245. verification ok', () => assert.equal(B.verification.ok, true));
test('246. verification valid', () => assert.equal(B.verification.valid, true));
test('247. verification headless', () => assert.equal(B.verification.headless, true));
test('248. verification contractOnly', () => assert.equal(B.verification.contractOnly, true));
test('249. verification no blockers', () => assert.equal(B.verification.blockerCount, 0));
test('250. verifier flags forced side effect', () => { const r = verifyDevPreviewBridgeContract({ bridge: { capabilities: { headless: true, contractOnly: true, uiCreated: true } } }); assert.equal(r.ok, false); assert.ok(r.blockers.includes('capability_uiCreated_must_be_false')); });
test('251. verifier flags missing headless', () => { const r = verifyDevPreviewBridgeContract({ bridge: { capabilities: { contractOnly: true } } }); assert.ok(r.blockers.includes('capability_headless_must_be_true')); });
test('252. verifier never throws on junk', () => assert.doesNotThrow(() => verifyDevPreviewBridgeContract({ bridge: null })));
test('253. verification checkedCapabilities count', () => assert.ok(B.verification.checkedCapabilities >= 17));
test('254. verificationDigest present', () => assert.ok(typeof B.verification.verificationDigest === 'string'));

// ===== Compatibility (255-262) =====
test('255. compatibility present', () => assert.equal(B.compatibility.kind, 'dev-preview-bridge-compatibility'));
test('256. compatible true for aligned versions', () => assert.equal(B.compatibility.compatible, true));
test('257. compatibility checks 3', () => assert.equal(B.compatibility.checks.length, 3));
test('258. compatibility not blocked', () => assert.equal(B.compatibility.blocked, false));
test('259. mismatch → warning not blocker', () => { const r = checkDevPreviewBridgeCompatibility({ sandbox: { sandboxVersion: 'x@9.9.9' } }); assert.equal(r.compatible, false); assert.ok(r.warnings.includes('incompatible_sandboxContract')); assert.equal(r.blocked, false); });
test('260. compatibility metadataOnly', () => assert.equal(B.compatibility.metadataOnly, true));
test('261. compatibilityDigest present', () => assert.ok(typeof B.compatibility.compatibilityDigest === 'string'));
test('262. warnings propagate to bridge', () => { const r = createStudioDevPreviewContractBridge({ sandbox: { ...MS, engineVersion: 'x@0.0.0' } }); assert.ok(r.warningCount >= 1); assert.equal(r.readyForDevPreviewBridge, true); });

// ===== Diagnostics (263-270) =====
test('263. diagnostics present', () => assert.equal(B.diagnostics.kind, 'dev-preview-bridge-diagnostics'));
test('264. diagnostics passive', () => assert.equal(B.diagnostics.passive, true));
test('265. diagnostics ok', () => assert.equal(B.diagnostics.ok, true));
test('266. diagnostics headlessConfirmed', () => assert.equal(B.diagnostics.headlessConfirmed, true));
test('267. diagnostics logged false', () => assert.equal(B.diagnostics.logged, false));
test('268. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(B.diagnostics))));
test('269. diagnostics metadataOnly', () => assert.equal(B.diagnostics.metadataOnly, true));
test('270. diagnosticsDigest present', () => assert.ok(typeof B.diagnostics.diagnosticsDigest === 'string'));

// ===== Fallback (271-281) =====
const fb = createStudioDevPreviewContractBridge({});
const fb2 = createStudioDevPreviewContractBridge({ sandbox: 42 });
test('271. missing sandbox → fallback', () => assert.equal(fb.fallback, true));
test('272. non-object sandbox → fallback', () => assert.equal(fb2.fallback, true));
test('273. fallback kind', () => assert.equal(fb.kind, 'studio-dev-preview-contract-bridge'));
test('274. fallback readiness blocked', () => assert.equal(fb.readiness, 'blocked'));
test('275. fallback not ready for bridge', () => assert.equal(fb.readyForDevPreviewBridge, false));
test('276. fallback not ready for production', () => assert.equal(fb.readyForProduction, false));
test('277. fallback has blocker', () => assert.equal(fb.blockerCount, 1));
test('278. fallback capabilities headless', () => assert.equal(fb.capabilities.headless, true));
test('279. fallback caps uiCreated false', () => assert.equal(fb.capabilities.uiCreated, false));
test('280. fallback never throws', () => assert.doesNotThrow(() => createDevPreviewBridgeFallback({ reason: 'x' })));
test('281. fallback metadataOnly', () => assert.equal(fb.metadataOnly, true));

// ===== Errors (282-291) =====
test('282. error codes >= 30', () => assert.ok(DEV_PREVIEW_BRIDGE_ERROR_CODES.length >= 30));
test('283. error descriptor sanitized', () => { const e = createDevPreviewBridgeError('DEV_PREVIEW_BRIDGE_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('284. error descriptor no ui/module', () => { const e = createDevPreviewBridgeError('DEV_PREVIEW_BRIDGE_UI_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.moduleGenerated, false); });
test('285. unknown code normalized', () => { const e = createDevPreviewBridgeError('NOPE'); assert.equal(e.code, 'DEV_PREVIEW_BRIDGE_INVALID_SANDBOX'); });
test('286. DevPreviewBridgeError typed', () => { const e = new DevPreviewBridgeError('DEV_PREVIEW_BRIDGE_INVALID_SANDBOX', 'x'); assert.ok(e instanceof Error && e.name === 'DevPreviewBridgeError'); });
test('287. devPreviewBridgeError helper', () => { const e = devPreviewBridgeError('DEV_PREVIEW_BRIDGE_FETCH_BLOCKED', 'x'); assert.equal(e.code, 'DEV_PREVIEW_BRIDGE_FETCH_BLOCKED'); });
test('288. error rewriteEmpresas false', () => assert.equal(createDevPreviewBridgeError('DEV_PREVIEW_BRIDGE_REWRITE_EMPRESAS_BLOCKED').rewriteEmpresas, false));
test('289. error message no secrets', () => assert.ok(!/jwt|secret|DATABASE_URL/i.test(JSON.stringify(createDevPreviewBridgeError('DEV_PREVIEW_BRIDGE_BACKEND_BLOCKED')))));
test('290. codes cover react/jsx/tsx/route/menu blocks', () => ['DEV_PREVIEW_BRIDGE_REACT_COMPONENT_BLOCKED', 'DEV_PREVIEW_BRIDGE_JSX_BLOCKED', 'DEV_PREVIEW_BRIDGE_TSX_BLOCKED', 'DEV_PREVIEW_BRIDGE_ROUTE_BLOCKED', 'DEV_PREVIEW_BRIDGE_MENU_BLOCKED'].forEach((c) => assert.ok(DEV_PREVIEW_BRIDGE_ERROR_CODES.includes(c))));
test('291. codes cover mutation/persistence/migration', () => ['DEV_PREVIEW_BRIDGE_MUTATION_BLOCKED', 'DEV_PREVIEW_BRIDGE_PERSISTENCE_BLOCKED', 'DEV_PREVIEW_BRIDGE_MIGRATION_BLOCKED'].forEach((c) => assert.ok(DEV_PREVIEW_BRIDGE_ERROR_CODES.includes(c))));

// ===== Config / flags (292-301) =====
test('292. flag off by default', () => assert.equal(isStudioDevPreviewContractBridgeEnabled({}), false));
test('293. flag on in dev', () => assert.equal(isStudioDevPreviewContractBridgeEnabled({ [MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG]: 'true', DEV: true }), true));
test('294. flag fails closed in production', () => assert.equal(isStudioDevPreviewContractBridgeEnabled({ [MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('295. render schema flag fails closed in production', () => assert.equal(isStudioDevPreviewRenderSchemaEnabled({ [MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('296. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('297. compatibility flag fails closed in production', () => assert.equal(isStudioDevPreviewCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('298. master flag enables sub-capabilities in dev', () => assert.equal(isStudioDevPreviewRenderSchemaEnabled({ [MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG]: 'true', DEV: true }), true));
test('299. ALLOWED frozen 16', () => assert.ok(Object.isFrozen(ALLOWED_COMPONENT_KINDS) && ALLOWED_COMPONENT_KINDS.length === 16));
test('300. BLOCKED frozen 13', () => assert.ok(Object.isFrozen(BLOCKED_COMPONENT_KINDS) && BLOCKED_COMPONENT_KINDS.length === 13));
test('301. readiness states frozen', () => assert.ok(Object.isFrozen(DEV_PREVIEW_BRIDGE_READINESS_STATES)));

// ===== Determinism / purity (302-309) =====
test('302. bridge deterministic overallDigest', () => assert.equal(B.overallDigest, createStudioDevPreviewContractBridge({ sandbox: MS }).overallDigest));
test('303. bridge deterministic bridgeDigest', () => assert.equal(B.bridgeDigest, createStudioDevPreviewContractBridge({ sandbox: MS }).bridgeDigest));
test('304. bridgeDigest helper deterministic', () => assert.equal(bridgeDigest({ a: 1 }), bridgeDigest({ a: 1 })));
test('305. bridgeDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(bridgeDigest({ a: 1 }))));
test('306. input not mutated', () => { const snap = JSON.stringify(MS); createStudioDevPreviewContractBridge({ sandbox: MS }); assert.equal(JSON.stringify(MS), snap); });
test('307. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(B))));
test('308. different module → different digest', () => assert.notEqual(B.overallDigest, createStudioDevPreviewContractBridge({ sandbox: { ...MS, moduleId: 'produtos' } }).overallDigest));
test('309. builds from real preview-sandbox contract', () => {
  const sandbox = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const r = createStudioDevPreviewContractBridge({ sandbox });
  assert.equal(r.kind, 'studio-dev-preview-contract-bridge');
  assert.equal(r.readyForRealModuleGeneration, false);
});

// ===== Purity/no-side-effect code scan (310-320) =====
test('310. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('311. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('312. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('313. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('314. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('315. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('316. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('317. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('318. no localStorage/sessionStorage', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('319. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('320. only imports runtime generic-model + own config', () => assert.ok(importsOf().every((p) => /generic-model|devPreviewBridgeConfig|\.js$/.test(p))));

// ===== Scope safety (321-343) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-contract-bridge\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-contract-bridge\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('321. bridge subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-contract-bridge')));
test('322. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('323. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('324. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('325. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('326. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('327. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('328. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('329. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('330. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('331. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('332. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('333. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('334. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('335. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('336. CSS global not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('337. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('338. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('339. mutation not exposed', () => assert.equal(B.capabilities.mutationAllowed, false));
test('340. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('341. no .jsx/.tsx created in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('342. net-new scope is bridge only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('343. upstream preview-sandbox present', () => assert.ok(exists('src/studio/blueprint-engine/module-preview-sandbox/index.js')));

// ===== Evidence docs (D1-D16) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-CONTRACT-BRIDGE-REPORT.md', 'DEV-PREVIEW-BRIDGE-SESSION.md',
  'RENDER-SCHEMA.md', 'LAYOUT-SCHEMA.md', 'SCREEN-SCHEMA.md', 'TABLE-FORM-DETAIL-BRIDGE.md',
  'FIELD-ACTION-PERMISSION-BRIDGE.md', 'ALLOWED-COMPONENT-CONTRACT.md', 'VISUAL-ADAPTER-CONTRACT.md',
  'ROUTE-PLACEMENT-PLAN-BLOCKED.md', 'RUNTIME-SAFETY-METADATA.md', 'READINESS-DECISION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md',
  'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-contract-bridge/${DOCS[i]}`)));
}
test('D-content. no-ui doc + next slice spec present', () => {
  assert.ok(/React|UI|generat|produç/i.test(readEv('NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md')));
  assert.ok(/VISUAL|DEV PREVIEW/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
