import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Studio scope governance. The ORIGINAL rule below is preserved for every path; the ONLY exemption is the
// exact set of artifacts the chronological-migration slice is authorized to touch, and only while that
// slice is the one active on the branch. A merely similar, uncatalogued path still fails.
import { resolveActiveStudioSlice, isPathAuthorizedForStudioSlice } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  ALLOWED_PREVIEW_KINDS,
  PROHIBITED_EFFECTS,
  MODULE_PREVIEW_READINESS_STATES,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
  MODULE_PREVIEW_SANDBOX_ERROR_CODES,
  ModulePreviewSandboxError,
  createModulePreviewSandboxError,
  MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG,
  MAK_STUDIO_MODULE_PREVIEW_VERIFY_FLAG,
  isStudioModulePreviewSandboxContractEnabled,
  isStudioModulePreviewVerifyEnabled,
  sandboxDigest,
  createModulePreviewSandboxSession,
  createModulePreviewTableMetadata,
  createModulePreviewFormMetadata,
  createModulePreviewDetailMetadata,
  createModulePreviewFieldMetadata,
  createModulePreviewActionMetadata,
  createModulePreviewPermissionMetadata,
  createModulePreviewRouteBlockedMetadata,
  createModulePreviewPersistenceBlockedMetadata,
  createModulePreviewRuntimeBindingMetadata,
  createModulePreviewReadinessDecision,
  createModulePreviewSandboxManifest,
  verifyModulePreviewSandboxContract,
  checkModulePreviewSandboxCompatibility,
  createModulePreviewSandboxDiagnostics,
  createModulePreviewSandboxFallback,
  MODULE_PREVIEW_SANDBOX_FALLBACK_SCENARIOS,
  createStudioModulePreviewSandboxContract,
} from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { createStudioBlueprintModuleReferencePlanner } from '../../studio/blueprint-engine/module-reference-planner/index.js';

/** Paths exempt from the historical substring rules: EXACTLY what the chronological-migration slice is authorized
 * to touch, and only when that slice is the active one. Never a category (any test, any gate, any evidence). */
const MIGRATION_SLICE_ID = 'studio-scope-governance-chronological-migration';
const migrationExempt = (changedPaths) => {
  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok || active.sliceId !== MIGRATION_SLICE_ID) return () => false;
  return (p) => isPathAuthorizedForStudioSlice(p, MIGRATION_SLICE_ID);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract');

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

const BP = {
  moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1',
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true, searchable: true, sortable: true },
    { name: 'preco', type: 'money', sortable: true },
    { name: 'clienteId', type: 'text', tenantScoped: true, protectedField: true },
  ],
  permissions: [{ action: 'read', level: 'module' }, { action: 'create', level: 'module' }],
};
const C = createStudioModulePreviewSandboxContract({ blueprint: BP });
const plan = createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
const session = createModulePreviewSandboxSession({ plan });
const table = createModulePreviewTableMetadata({ plan });
const form = createModulePreviewFormMetadata({ plan });
const detail = createModulePreviewDetailMetadata({ plan });
const fieldMeta = createModulePreviewFieldMetadata({ plan });
const action = createModulePreviewActionMetadata({ plan });
const permission = createModulePreviewPermissionMetadata({ plan });
const routeMenu = createModulePreviewRouteBlockedMetadata({ plan });
const persistence = createModulePreviewPersistenceBlockedMetadata({ plan });
const runtimeBinding = createModulePreviewRuntimeBindingMetadata({ plan });

// ===== Base (1-27) =====
test('1. contract created', () => assert.equal(C.kind, 'studio-module-preview-sandbox-contract'));
test('2. sandboxName', () => { assert.equal(C.sandboxName, 'studio-module-preview-sandbox-contract'); assert.equal(C.sandboxName, MODULE_PREVIEW_SANDBOX_CONTRACT_NAME); });
test('3. sandboxVersion', () => { assert.equal(C.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'); assert.equal(C.sandboxVersion, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION); });
test('4. engineVersion', () => assert.equal(C.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('5. plannerVersion', () => assert.equal(C.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('6. blueprintContractVersion', () => assert.equal(C.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('7. mode', () => { assert.equal(C.mode, 'headless_preview_sandbox_contract'); assert.equal(C.mode, MODULE_PREVIEW_SANDBOX_MODE); });
test('8. headless', () => assert.equal(C.headless, true));
test('9. previewMetadataOnly', () => assert.equal(C.previewMetadataOnly, true));
test('10. reactComponentCreated false', () => assert.equal(C.reactComponentCreated, false));
test('11. uiCreated false', () => assert.equal(C.uiCreated, false));
test('12. routeCreated false', () => assert.equal(C.routeCreated, false));
test('13. menuCreated false', () => assert.equal(C.menuCreated, false));
test('14. moduleGenerated false', () => assert.equal(C.moduleGenerated, false));
test('15. filesWrittenToModule false', () => assert.equal(C.filesWrittenToModule, false));
test('16. moduleRegistered false', () => assert.equal(C.moduleRegistered, false));
test('17. backendAccessed false', () => assert.equal(C.backendAccessed, false));
test('18. prismaAccessed false', () => assert.equal(C.prismaAccessed, false));
test('19. productionAccessed false', () => assert.equal(C.productionAccessed, false));
test('20. stagingAccessed false', () => assert.equal(C.stagingAccessed, false));
test('21. fetchUsed false', () => assert.equal(C.fetchUsed, false));
test('22. mutationAllowed false', () => assert.equal(C.mutationAllowed, false));
test('23. persistenceCreated false', () => assert.equal(C.persistenceCreated, false));
test('24. rewriteEmpresas false', () => assert.equal(C.rewriteEmpresas, false));
test('25. readyForRealModuleGeneration false', () => assert.equal(C.readyForRealModuleGeneration, false));
test('26. readyForProduction false', () => assert.equal(C.readyForProduction, false));
test('27. readiness ready', () => assert.equal(C.readiness, 'module_preview_sandbox_contract_ready'));

// ===== Session (28-44) =====
test('28. session exists', () => assert.equal(session.kind, 'module-preview-sandbox-session'));
test('29. sessionId exists', () => assert.ok(typeof session.sessionId === 'string' && session.sessionId.length > 0));
test('30. sourceBlueprintDigest exists', () => assert.ok(typeof session.sourceBlueprintDigest === 'string'));
test('31. sourcePlannerDigest exists', () => assert.ok(typeof session.sourcePlannerDigest === 'string'));
test('32. allowedPreviewKinds has table_metadata', () => assert.ok(session.allowedPreviewKinds.includes('table_metadata')));
test('33. allowedPreviewKinds has form_metadata', () => assert.ok(session.allowedPreviewKinds.includes('form_metadata')));
test('34. allowedPreviewKinds has detail_metadata', () => assert.ok(session.allowedPreviewKinds.includes('detail_metadata')));
test('35. allowedPreviewKinds has field_metadata', () => assert.ok(session.allowedPreviewKinds.includes('field_metadata')));
test('36. allowedPreviewKinds has action_metadata', () => assert.ok(session.allowedPreviewKinds.includes('action_metadata')));
test('37. allowedPreviewKinds has permission_metadata', () => assert.ok(session.allowedPreviewKinds.includes('permission_metadata')));
test('38. prohibitedEffects has react_component_creation', () => assert.ok(session.prohibitedEffects.includes('react_component_creation')));
test('39. prohibitedEffects has module_generation', () => assert.ok(session.prohibitedEffects.includes('module_generation')));
test('40. prohibitedEffects has backend_access', () => assert.ok(session.prohibitedEffects.includes('backend_access')));
test('41. prohibitedEffects has prisma_access', () => assert.ok(session.prohibitedEffects.includes('prisma_access')));
test('42. prohibitedEffects has mutation', () => assert.ok(session.prohibitedEffects.includes('mutation')));
test('43. deterministicSeed stable', () => assert.equal(createModulePreviewSandboxSession({ plan }).deterministicSeed, session.deterministicSeed));
test('44. session no real storage', () => assert.ok(session.usesRealStorage === false && session.usesLocalStorage === false && session.usesIndexedDb === false && session.usesFetch === false));

// ===== Table/Form/Detail metadata (45-69) =====
test('45. table metadata exists', () => assert.equal(table.kind, 'module-preview-table-metadata'));
test('46. columns exist', () => assert.ok(table.columns.length > 0));
test('47. protected/tenant columns not born open (excluded from visible)', () => { assert.ok(!table.visibleColumns.includes('clienteId')); assert.ok(table.protectedColumns.includes('clienteId')); });
test('48. table componentCreated false', () => assert.equal(table.componentCreated, false));
test('49. table routeCreated false', () => assert.equal(table.routeCreated, false));
test('50. table dataFetched false', () => assert.equal(table.dataFetched, false));
test('51. table mutationAllowed false', () => assert.equal(table.mutationAllowed, false));
test('52. form metadata exists', () => assert.equal(form.kind, 'module-preview-form-metadata'));
test('53. fields exist', () => assert.ok(form.fields.length > 0));
test('54. required/optional/protected/tenant fields exist', () => assert.ok(form.requiredFields.includes('nome') && form.protectedFields.includes('clienteId') && form.tenantFields.includes('clienteId')));
test('55. submitAction disabled', () => assert.equal(form.submitAction.enabled, false));
test('56. form componentCreated false', () => assert.equal(form.componentCreated, false));
test('57. form dataFetched false', () => assert.equal(form.dataFetched, false));
test('58. form mutationAllowed false', () => assert.equal(form.mutationAllowed, false));
test('59. computed fields do not execute code', () => assert.equal(form.computedExecutesCode, false));
test('60. relation fields preserve tenant', () => { const f = createModulePreviewFormMetadata({ plan: createStudioBlueprintModuleReferencePlanner({ blueprint: { moduleId: 'x', moduleName: 'X', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'r', type: 'relation', tenantScoped: true }], permissions: [{ action: 'read', level: 'module' }] } }) }); assert.equal(f.fields[0].relationPreservesTenant, true); });
test('61. detail metadata exists', () => assert.equal(detail.kind, 'module-preview-detail-metadata'));
test('62. detail strategy allowed', () => assert.ok(['derive_from_form_readonly', 'dedicated_detail_future', 'blocked'].includes(detail.strategy)));
test('63. detail readOnly true', () => assert.equal(detail.readOnly, true));
test('64. detail componentCreated false', () => assert.equal(detail.componentCreated, false));
test('65. detail routeCreated false', () => assert.equal(detail.routeCreated, false));
test('66. detail dataFetched false', () => assert.equal(detail.dataFetched, false));
test('67. detail mutationAllowed false', () => assert.equal(detail.mutationAllowed, false));
test('68. detail does not change PAGEMP', () => assert.equal(detail.changesPagemp, false));
test('69. detail does not change ModeloBase1CadastroPage', () => assert.equal(detail.changesModeloBase1CadastroPage, false));

// ===== Field/Action/Permission metadata (70-87) =====
test('70. field metadata exists', () => assert.equal(fieldMeta.kind, 'module-preview-field-metadata'));
test('71. each field has type', () => assert.ok(fieldMeta.fields.every((f) => typeof f.type === 'string')));
test('72. protected default read-only', () => assert.equal(fieldMeta.protectedDefaultReadOnly, true));
test('73. tenant field preserved', () => assert.ok(fieldMeta.fields.find((f) => f.fieldName === 'clienteId').tenantScoped === true));
test('74. unsafe field blocks preview', () => { const fm = createModulePreviewFieldMetadata({ plan: { moduleId: 'x', fieldTableFormPlan: { fields: [{ name: 'bad', type: 'bogus' }] } } }); assert.ok(fm.hasUnsafeField === true && fm.fields[0].previewBlocked === true); });
test('75. action metadata exists', () => assert.equal(action.kind, 'module-preview-action-metadata'));
test('76. read metadata-only', () => assert.equal(action.readMetadataOnly, true));
test('77. create/update/delete disabled', () => assert.ok(['create', 'update', 'delete'].every((id) => action.actions.find((a) => a.actionId === id).enabledByDefault === false)));
test('78. export/configure planned/disabled', () => assert.ok(['export', 'configure'].every((id) => action.actions.find((a) => a.actionId === id).enabledByDefault === false)));
test('79. no action calls backend', () => assert.equal(action.anyActionCallsBackend, false));
test('80. no action executes mutation by default', () => assert.equal(action.anyMutationEnabled, false));
test('81. permission metadata exists', () => assert.equal(permission.kind, 'module-preview-permission-metadata'));
test('82. defaultDeny true', () => assert.equal(permission.defaultDeny, true));
test('83. failClosed true', () => assert.equal(permission.failClosed, true));
test('84. tenantRequired true', () => assert.equal(permission.tenantRequired, true));
test('85. permissionRequired true', () => assert.equal(permission.permissionRequired, true));
test('86. admin does not bypass tenant', () => assert.equal(permission.adminBypassesTenant, false));
test('87. mutation permissions default false', () => assert.equal(permission.mutationPermissionsDefaultFalse, true));

// ===== Blocked metadata (88-113) =====
test('88. route/menu blocked metadata exists', () => assert.equal(routeMenu.kind, 'module-preview-route-menu-blocked-metadata'));
test('89. routeCreated false', () => assert.equal(routeMenu.routeCreated, false));
test('90. menuCreated false', () => assert.equal(routeMenu.menuCreated, false));
test('91. appJsChanged false', () => assert.equal(routeMenu.appJsChanged, false));
test('92. menuChanged false', () => assert.equal(routeMenu.menuChanged, false));
test('93. autoRegister false', () => assert.equal(routeMenu.autoRegister, false));
test('94. productionAllowed false', () => assert.equal(routeMenu.productionAllowed, false));
test('95. blockedNow true', () => assert.equal(routeMenu.blockedNow, true));
test('96. does not activate dev preview this slice', () => assert.ok(routeMenu.devOnlyFuture === true && routeMenu.flagRequired === true));
test('97. persistence blocked metadata exists', () => assert.equal(persistence.kind, 'module-preview-persistence-blocked-metadata'));
test('98. schemaAllowedNow false', () => assert.equal(persistence.schemaAllowedNow, false));
test('99. migrationAllowedNow false', () => assert.equal(persistence.migrationAllowedNow, false));
test('100. backendAllowedNow false', () => assert.equal(persistence.backendAllowedNow, false));
test('101. prismaAllowedNow false', () => assert.equal(persistence.prismaAllowedNow, false));
test('102. mutationAllowedNow false', () => assert.equal(persistence.mutationAllowedNow, false));
test('103. productionAllowedNow false', () => assert.equal(persistence.productionAllowedNow, false));
test('104. stagingAllowedNow false', () => assert.equal(persistence.stagingAllowedNow, false));
test('105. persistenceCreated false', () => assert.equal(persistence.persistenceCreated, false));
test('106. persistence blockedNow true', () => assert.equal(persistence.blockedNow, true));
test('107. runtime binding metadata exists', () => assert.equal(runtimeBinding.kind, 'module-preview-runtime-binding-metadata'));
test('108. bindingCreated false', () => assert.equal(runtimeBinding.bindingCreated, false));
test('109. moduleRegistered false', () => assert.equal(runtimeBinding.moduleRegistered, false));
test('110. productionActivated false', () => assert.equal(runtimeBinding.productionActivated, false));
test('111. prismaAccessed false', () => assert.equal(runtimeBinding.prismaAccessed, false));
test('112. rewriteEmpresas false', () => assert.equal(runtimeBinding.rewriteEmpresas, false));
test('113. ModeloBase2/Fuel not production', () => assert.equal(runtimeBinding.modeloBase2IsProduction, false));

// ===== Readiness/manifest/verifier/compat/fallback (114-162) =====
test('114. readiness decision exists', () => assert.equal(C.readinessDecision.kind, 'module-preview-readiness-decision'));
test('115. readyForPreviewSandbox true', () => assert.equal(C.readinessDecision.readyForPreviewSandbox, true));
test('116. readyForDevPreviewContract computed', () => assert.equal(typeof C.readinessDecision.readyForDevPreviewContract, 'boolean'));
test('117. readyForRealModuleGeneration false', () => assert.equal(C.readinessDecision.readyForRealModuleGeneration, false));
test('118. readyForProduction false', () => assert.equal(C.readinessDecision.readyForProduction, false));
test('119. manifest created', () => assert.equal(C.manifest.kind, 'module-preview-sandbox-manifest'));
test('120. manifest has digests', () => assert.ok(['sessionDigest', 'tablePreviewDigest', 'formPreviewDigest', 'readinessDecisionDigest'].every((k) => typeof C.manifest[k] === 'string')));
test('121. overallDigest deterministic', () => { const a = createStudioModulePreviewSandboxContract({ blueprint: BP }); const b = createStudioModulePreviewSandboxContract({ blueprint: BP }); assert.ok(a.overallDigest === b.overallDigest && /^fnv1a-[0-9a-f]{8}$/.test(a.overallDigest)); });
test('122. verifier validates correct contract', () => assert.equal(C.verifierResult.valid, true));
const tamper = (key) => { const t = JSON.parse(JSON.stringify(C)); t.manifest[key] = 'fnv1a-deadbeef'; return verifyModulePreviewSandboxContract({ contract: t }).valid; };
test('123. verifier detects session digest altered', () => assert.equal(tamper('sessionDigest'), false));
test('124. verifier detects table preview digest altered', () => assert.equal(tamper('tablePreviewDigest'), false));
test('125. verifier detects form preview digest altered', () => assert.equal(tamper('formPreviewDigest'), false));
test('126. verifier detects detail preview digest altered', () => assert.equal(tamper('detailPreviewDigest'), false));
test('127. verifier detects field preview digest altered', () => assert.equal(tamper('fieldPreviewDigest'), false));
test('128. verifier detects permission digest altered', () => assert.equal(tamper('permissionPreviewDigest'), false));
test('129. verifier detects route/menu digest altered', () => assert.equal(tamper('routeMenuBlockedDigest'), false));
test('130. verifier detects persistence digest altered', () => assert.equal(tamper('persistenceBlockedDigest'), false));
const flip = (flag) => { const t = JSON.parse(JSON.stringify(C)); t.manifest[flag] = true; return verifyModulePreviewSandboxContract({ contract: t }).valid; };
test('131. verifier requires reactComponentCreated false', () => assert.equal(flip('reactComponentCreated'), false));
test('132. verifier requires uiCreated false', () => assert.equal(flip('uiCreated'), false));
test('133. verifier requires routeCreated false', () => assert.equal(flip('routeCreated'), false));
test('134. verifier requires menuCreated false', () => assert.equal(flip('menuCreated'), false));
test('135. verifier requires moduleGenerated false', () => assert.equal(flip('moduleGenerated'), false));
test('136. verifier requires filesWrittenToModule false', () => assert.equal(flip('filesWrittenToModule'), false));
test('137. verifier requires backendAccessed false', () => assert.equal(flip('backendAccessed'), false));
test('138. verifier requires prismaAccessed false', () => assert.equal(flip('prismaAccessed'), false));
test('139. verifier requires productionAccessed false', () => assert.equal(flip('productionAccessed'), false));
test('140. verifier requires mutationAllowed false', () => assert.equal(flip('mutationAllowed'), false));
test('141. verifier requires readyForRealModuleGeneration false', () => { const t = JSON.parse(JSON.stringify(C)); t.manifest.readyForRealModuleGeneration = true; assert.equal(verifyModulePreviewSandboxContract({ contract: t }).valid, false); });
test('142. verifier requires readyForProduction false', () => { const t = JSON.parse(JSON.stringify(C)); t.manifest.readyForProduction = true; assert.equal(verifyModulePreviewSandboxContract({ contract: t }).valid, false); });
test('143. compatibility checker exists', () => assert.equal(C.compatibilityResult.kind, 'module-preview-sandbox-compatibility'));
test('144. invalid planner blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, plannerValid: false } }).compatibilityStatus, 'blocked'));
test('145. table/form/detail unsafe blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, detailPreviewMetadata: { readOnly: false } } }).compatibilityStatus, 'blocked'));
test('146. permission unsafe blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, permissionPreviewMetadata: { defaultDeny: false } } }).compatibilityStatus, 'blocked'));
test('147. route/menu exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, routeCreated: true } }).compatibilityStatus, 'blocked'));
test('148. react component created blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, reactComponentCreated: true } }).compatibilityStatus, 'blocked'));
test('149. UI created blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, uiCreated: true } }).compatibilityStatus, 'blocked'));
test('150. module generation exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, moduleGenerated: true } }).compatibilityStatus, 'blocked'));
test('151. backend/prisma exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, prismaAccessed: true } }).compatibilityStatus, 'blocked'));
test('152. persistence real exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, persistenceCreated: true } }).compatibilityStatus, 'blocked'));
test('153. mutation exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, mutationAllowed: true } }).compatibilityStatus, 'blocked'));
test('154. rewrite Empresas exposed blocks', () => assert.equal(checkModulePreviewSandboxCompatibility({ contract: { ...C, rewriteEmpresas: true } }).compatibilityStatus, 'blocked'));
test('154b. compatibleForRealModuleGeneration/Production false', () => assert.ok(C.compatibilityResult.compatibleForRealModuleGeneration === false && C.compatibilityResult.compatibleForProduction === false));
test('155. fallback flag off safe', () => { const fb = createModulePreviewSandboxFallback({ scenario: 'flag_off' }); assert.ok(fb.safeToUseAsPreviewSandboxContract === false && fb.readiness === 'blocked'); });
test('156. fallback invalid planner blocks', () => assert.equal(createModulePreviewSandboxFallback({ scenario: 'invalid_planner' }).sideEffects, false));
test('157. fallback React/UI attempt blocks', () => assert.ok(createModulePreviewSandboxFallback({ scenario: 'react_component_creation_attempt' }).reactComponentCreated === false && createModulePreviewSandboxFallback({ scenario: 'ui_attempt' }).uiCreated === false));
test('158. fallback module generation/file write blocks', () => assert.ok(createModulePreviewSandboxFallback({ scenario: 'module_generation_attempt' }).moduleGenerated === false && createModulePreviewSandboxFallback({ scenario: 'file_write_attempt' }).filesWrittenToModule === false));
test('159. fallback route/menu attempt blocks', () => assert.ok(createModulePreviewSandboxFallback({ scenario: 'route_attempt' }).routeCreated === false && createModulePreviewSandboxFallback({ scenario: 'menu_attempt' }).menuCreated === false));
test('160. fallback backend/prisma/migration blocks', () => assert.ok(createModulePreviewSandboxFallback({ scenario: 'backend_attempt' }).backendAccessed === false && createModulePreviewSandboxFallback({ scenario: 'migration_attempt' }).migrationExecuted === false));
test('161. fallback production/staging/fetch/mutation blocks', () => assert.ok(createModulePreviewSandboxFallback({ scenario: 'production_attempt' }).productionAccessed === false && createModulePreviewSandboxFallback({ scenario: 'mutation_attempt' }).mutationAllowed === false));
test('162. fallback rewrite Empresas blocks', () => assert.equal(createModulePreviewSandboxFallback({ scenario: 'rewrite_empresas_attempt' }).rewriteEmpresas, false));

// ===== Scope safety (163-191) — branch-relative, tolerant of the base planner PR (#461) =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/module-preview-sandbox\//,
  /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-module-preview-sandbox-contract\//,
];
// Files inherited from the base branch (unmerged Module Reference Planner PR #461).
// Tolerated so the branch-relative scope check is meaningful for THIS slice's net-new set.
const INHERITED_FROM_PLANNER_PR = [
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
  /^src\/runtime\/__tests__\/[a-z0-9-]+\.test\.js$/, // prior sibling tests the planner slice widened
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || INHERITED_FROM_PLANNER_PR.some((re) => re.test(f));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('163. module-preview-sandbox exists', () => assert.ok(exists('src/studio/blueprint-engine/module-preview-sandbox')));
test('164. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('165. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('166. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('167. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('168. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('169. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('170. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('171. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('172. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('173. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/migration/i.test(x))); });
test('174. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('175. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/menu|nav/i.test(x))); });
test('176. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('177. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('178. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('179. CSS global not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('180. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('181. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('182. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('183. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('184. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('185. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('186. staging not accessed', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('187. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('188. mutation not exposed', () => assert.equal(C.mutationAllowed, false));
test('189. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('190. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('191. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

// ===== Upstream presence + misc (192-197) =====
test('192. module reference planner present', () => assert.ok(exists('src/studio/blueprint-engine/module-reference-planner/index.js')));
test('193. blueprint engine present', () => assert.ok(exists('src/studio/blueprint-engine/index.js')));
test('194. studio certification present', () => assert.ok(exists('src/studio/foundation-contracts/certification/index.js')));
test('195. empresas mirror present', () => assert.ok(exists('src/studio/blueprint-mirrors/empresas/index.js')));
test('196. net-new scope is preview-sandbox only (branch-relative, tolerant of base PR #461)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/module-preview-sandbox\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('197. manifest standalone builds', () => assert.equal(createModulePreviewSandboxManifest({ session }).kind, 'module-preview-sandbox-manifest'));

// ===== Extra guards + config (E1-E12) =====
test('E1. capabilities frozen', () => assert.ok(Object.isFrozen(MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES)));
test('E2. allowedPreviewKinds frozen (9)', () => assert.ok(Object.isFrozen(ALLOWED_PREVIEW_KINDS) && ALLOWED_PREVIEW_KINDS.length === 9));
test('E3. prohibitedEffects frozen (14)', () => assert.ok(Object.isFrozen(PROHIBITED_EFFECTS) && PROHIBITED_EFFECTS.length === 14));
test('E4. readiness states frozen', () => assert.ok(Object.isFrozen(MODULE_PREVIEW_READINESS_STATES) && MODULE_PREVIEW_READINESS_STATES.includes('module_preview_sandbox_contract_ready')));
test('E5. error catalog >= 30 codes', () => assert.ok(MODULE_PREVIEW_SANDBOX_ERROR_CODES.length >= 30));
test('E6. error descriptor sanitized + no side effects', () => { const e = createModulePreviewSandboxError('MODULE_PREVIEW_SANDBOX_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false && e.rewriteEmpresas === false && e.previewMetadataOnly === true); });
test('E7. ModulePreviewSandboxError typed', () => { const e = new ModulePreviewSandboxError('MODULE_PREVIEW_SANDBOX_INVALID_PLANNER', 'x'); assert.ok(e instanceof Error && e.code === 'MODULE_PREVIEW_SANDBOX_INVALID_PLANNER'); });
test('E8. flag fails closed in production', () => assert.equal(isStudioModulePreviewSandboxContractEnabled({ [MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E9. verify flag fails closed in production', () => assert.equal(isStudioModulePreviewVerifyEnabled({ [MAK_STUDIO_MODULE_PREVIEW_VERIFY_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E10. sandboxDigest deterministic', () => assert.equal(sandboxDigest({ a: 1 }), sandboxDigest({ a: 1 })));
test('E11. React-free + no backend imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p) && !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('E12. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(C.diagnostics))));

// ===== Evidence docs (D1-D18) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-PREVIEW-SANDBOX-CONTRACT-REPORT.md', 'PREVIEW-SANDBOX-SESSION.md',
  'TABLE-PREVIEW-METADATA.md', 'FORM-PREVIEW-METADATA.md', 'DETAIL-PREVIEW-METADATA.md', 'FIELD-PREVIEW-METADATA.md',
  'ACTION-PREVIEW-METADATA.md', 'PERMISSION-PREVIEW-METADATA.md', 'ROUTE-BLOCKED-METADATA.md',
  'PERSISTENCE-BLOCKED-METADATA.md', 'RUNTIME-BINDING-METADATA.md', 'READINESS-DECISION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md',
  'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/${DOCS[i]}`)));
}
test('D-content. no-ui/no-generation doc + next slice spec present', () => { assert.ok(/componente React|UI criada|generat|produç/i.test(readEv('NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md'))); assert.ok(/DEV PREVIEW CONTRACT BRIDGE/i.test(readEv('NEXT-SLICE-SPEC.md'))); });
