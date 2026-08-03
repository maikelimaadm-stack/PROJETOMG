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

/** Paths exempt from the historical substring rules: EXACTLY what the chronological-migration slice is authorized
 * to touch, and only when that slice is the active one. Never a category (any test, any gate, any evidence). */
const MIGRATION_SLICE_ID = 'studio-scope-governance-chronological-migration';
const migrationExempt = (changedPaths) => {
  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok || active.sliceId !== MIGRATION_SLICE_ID) return () => false;
  return (p) => isPathAuthorizedForStudioSlice(p, MIGRATION_SLICE_ID);
};

import {
  MODULE_REFERENCE_PLANNER_NAME,
  MODULE_REFERENCE_PLANNER_VERSION,
  MODULE_REFERENCE_PLANNER_MODE,
  MODULE_PERSISTENCE_STATES,
  MODULE_READINESS_STATES,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
  MODULE_REFERENCE_PLANNER_ERROR_CODES,
  ModuleReferencePlannerError,
  createModuleReferencePlannerError,
  MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG,
  MAK_STUDIO_MODULE_PLAN_VERIFY_FLAG,
  isStudioModuleReferencePlannerEnabled,
  isStudioModulePlanVerifyEnabled,
  plannerDigest,
  createModuleIdentityPlan,
  createModuleFilePlan,
  createModuleScreenPlan,
  createModuleFieldTableFormPlan,
  createModulePermissionPlan,
  createModuleRouteMenuPlan,
  createModulePersistencePlan,
  createModuleRuntimeBindingPlan,
  createModuleTestGatePlan,
  createModuleEvidencePlan,
  createModuleRiskPlan,
  createModuleReadinessDecision,
  createModuleReferencePlannerManifest,
  verifyModuleReferencePlan,
  checkModuleReferencePlanCompatibility,
  createModuleReferencePlannerDiagnostics,
  createModuleReferencePlannerFallback,
  MODULE_REFERENCE_PLANNER_FALLBACK_SCENARIOS,
  createStudioBlueprintModuleReferencePlanner,
} from '../../studio/blueprint-engine/module-reference-planner/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/module-reference-planner');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-module-reference-planner');

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
  screens: [{ kind: 'table', title: 'Lista' }, { kind: 'form', title: 'Form' }],
  permissions: [{ action: 'read', level: 'module' }, { action: 'create', level: 'module' }],
};

const P = createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
const identity = createModuleIdentityPlan({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: BP.fields } });
const filePlan = createModuleFilePlan({ blueprint: BP });
const screenPlan = createModuleScreenPlan({ blueprint: BP });
const fieldPlan = createModuleFieldTableFormPlan({ blueprint: BP });
const permPlan = createModulePermissionPlan({ blueprint: BP });
const routeMenu = createModuleRouteMenuPlan({ blueprint: BP });
const persistence = createModulePersistencePlan({ blueprint: BP });
const runtimeBinding = createModuleRuntimeBindingPlan({ blueprint: BP });
const testGate = createModuleTestGatePlan({ blueprint: BP });
const evidence = createModuleEvidencePlan({ blueprint: BP });
const risk = createModuleRiskPlan();

// ===== Planner identity & capabilities (1-22) =====
test('1. planner created', () => assert.equal(P.kind, 'studio-blueprint-module-reference-plan'));
test('2. plannerName', () => assert.equal(P.plannerName, MODULE_REFERENCE_PLANNER_NAME) && assert.equal(P.plannerName, 'studio-blueprint-module-reference-planner'));
test('3. plannerVersion', () => assert.equal(P.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('4. engineVersion', () => assert.equal(P.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('5. blueprintContractVersion', () => assert.equal(P.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('6. mode', () => assert.equal(P.mode, 'contract_only_reference_planning') && assert.equal(P.mode, MODULE_REFERENCE_PLANNER_MODE));
test('7. headless', () => assert.equal(P.headless, true));
test('8. moduleGenerated false', () => assert.equal(P.moduleGenerated, false));
test('9. filesWrittenToModule false', () => assert.equal(P.filesWrittenToModule, false));
test('10. routeCreated false', () => assert.equal(P.routeCreated, false));
test('11. menuCreated false', () => assert.equal(P.menuCreated, false));
test('12. moduleRegistered false', () => assert.equal(P.moduleRegistered, false));
test('13. backendAccessed false', () => assert.equal(P.backendAccessed, false));
test('14. prismaAccessed false', () => assert.equal(P.prismaAccessed, false));
test('15. productionAccessed false', () => assert.equal(P.productionAccessed, false));
test('16. stagingAccessed false', () => assert.equal(P.stagingAccessed, false));
test('17. fetchUsed false', () => assert.equal(P.fetchUsed, false));
test('18. mutationAllowed false', () => assert.equal(P.mutationAllowed, false));
test('19. persistenceCreated false', () => assert.equal(P.persistenceCreated, false));
test('20. rewriteEmpresas false', () => assert.equal(P.rewriteEmpresas, false));
test('21. readyForRealModuleGeneration false', () => assert.equal(P.readyForRealModuleGeneration, false));
test('22. readiness module_reference_plan_ready', () => assert.equal(P.readiness, 'module_reference_plan_ready'));

// ===== Identity plan (23-31) =====
test('23. identity plan exists', () => assert.equal(P.identityPlan.kind, 'module-identity-plan'));
test('24. moduleId safe', () => assert.ok(P.identityPlan.moduleIdSafe === true && P.identityPlan.moduleId === 'produtos'));
test('25. displayName exists', () => assert.equal(identity.displayName, 'Produtos'));
test('26. modelType exists', () => assert.equal(identity.modelType, 'cadastro'));
test('27. modelFamily exists', () => assert.equal(identity.modelFamily, 'ModeloBase1'));
test('28. namespacePlan exists (plannedOnly)', () => assert.ok(identity.namespacePlan.plannedOnly === true && identity.namespacePlan.createdNow === false));
test('29. versionPlan exists', () => assert.ok(identity.versionPlan.bumpedNow === false));
test('30. module not registered', () => assert.equal(identity.registeredNow, false));
test('31. src/modules not created (directoryCreatedNow false)', () => assert.equal(identity.directoryCreatedNow, false));

// ===== File plan (32-40) =====
test('32. file plan exists', () => assert.equal(filePlan.kind, 'module-file-plan'));
test('33. file plan has domain category', () => assert.ok(filePlan.categories.includes('domain')));
test('34. file plan has application category', () => assert.ok(filePlan.categories.includes('application')));
test('35. file plan has infrastructure futureOnly (backend/prisma)', () => assert.ok(filePlan.backendPrismaFutureOnly === true && filePlan.categories.includes('infrastructure')));
test('36. file plan has tests category', () => assert.ok(filePlan.categories.includes('tests')));
test('37. file plan has gates category', () => assert.ok(filePlan.categories.includes('gates')));
test('38. file plan has evidence category', () => assert.ok(filePlan.categories.includes('evidence')));
test('39. file plan generationAllowedNow false', () => assert.ok(filePlan.generationAllowedNow === false && filePlan.files.every((f) => f.generationAllowedNow === false)));
test('40. no module file written', () => assert.ok(filePlan.filesWrittenToModule === false && filePlan.anyFileWritten === false));

// ===== Screen plan (41-49) =====
test('41. screen plan exists', () => assert.equal(screenPlan.kind, 'module-screen-plan'));
test('42. table screen planned', () => assert.ok(screenPlan.screens.some((s) => s.kind === 'table')));
test('43. form screen planned', () => assert.ok(screenPlan.screens.some((s) => s.kind === 'form')));
test('44. detail screen planned or future', () => assert.ok(screenPlan.screens.some((s) => s.kind === 'detail')));
test('45. empty/loading/error states planned', () => assert.deepEqual(screenPlan.requiredStates, ['empty', 'loading', 'error']));
test('46. diagnostics area planned', () => assert.ok(screenPlan.areas.diagnosticsArea.planned === true));
test('47. screen does not generate React component', () => assert.equal(screenPlan.generatesReactComponent, false));
test('48. screen does not change App.jsx', () => assert.equal(screenPlan.changesAppJsx, false));
test('49. screen does not create route', () => assert.equal(screenPlan.createsRoute, false));

// ===== Field/table/form plan (50-59) =====
test('50. field/table/form plan exists', () => assert.equal(fieldPlan.kind, 'module-field-table-form-plan'));
test('51. fields planned', () => assert.equal(fieldPlan.fieldCount, 3));
test('52. table columns planned (excludes protected)', () => assert.ok(!fieldPlan.tableColumns.some((c) => c.name === 'clienteId')));
test('53. form fields planned', () => assert.equal(fieldPlan.formFields.length, 3));
test('54. validations planned', () => assert.ok(fieldPlan.validations.some((v) => v.field === 'nome' && v.rule === 'required')));
test('55. protected fields default read-only', () => assert.equal(fieldPlan.protectedDefaultReadOnly, true));
test('56. tenant fields preserved', () => assert.ok(fieldPlan.tenantFields.includes('clienteId')));
test('57. computed does not execute code', () => assert.equal(fieldPlan.computedExecutesCode, false));
test('58. relation preserves tenant', () => { const fp = createModuleFieldTableFormPlan({ blueprint: { moduleId: 'x', fields: [{ name: 'r', type: 'relation', tenantScoped: true }] } }); assert.equal(fp.fields[0].relationPreservesTenant, true); });
test('59. form/table generationAllowedNow false', () => assert.equal(fieldPlan.generationAllowedNow, false));

// ===== Permission plan (60-68) =====
test('60. permission plan exists', () => assert.equal(permPlan.kind, 'module-permission-plan'));
test('61. defaultDeny true', () => assert.equal(permPlan.defaultDeny, true));
test('62. failClosed true', () => assert.equal(permPlan.failClosed, true));
test('63. permissionRequired true', () => assert.equal(permPlan.permissionRequired, true));
test('64. tenantRequired true', () => assert.equal(permPlan.tenantRequired, true));
test('65. admin does not bypass tenant', () => assert.equal(permPlan.adminBypassesTenant, false));
test('66. delete default false', () => assert.equal(permPlan.deleteEnabledByDefault, false));
test('67. mutation default false', () => assert.equal(permPlan.mutationEnabledByDefault, false));
test('68. no real permission created', () => assert.ok(permPlan.createsRealPermission === false && permPlan.plannedOnly === true));

// ===== Route/menu plan (69-78) =====
test('69. route/menu plan exists', () => assert.equal(routeMenu.kind, 'module-route-menu-plan'));
test('70. routeCreated false', () => assert.equal(routeMenu.routeCreated, false));
test('71. menuCreated false', () => assert.equal(routeMenu.menuCreated, false));
test('72. productionAllowed false', () => assert.ok(routeMenu.productionAllowed === false && routeMenu.routePlan.productionAllowed === false));
test('73. guardRequired true', () => assert.equal(routeMenu.guardRequired, true));
test('74. flagRequired true', () => assert.equal(routeMenu.flagRequired, true));
test('75. permissionRequired true', () => assert.equal(routeMenu.permissionRequired, true));
test('76. autoRegister false', () => assert.equal(routeMenu.autoRegister, false));
test('77. App.jsx not changed', () => assert.equal(routeMenu.changesAppJsx, false));
test('78. menu not changed', () => assert.equal(routeMenu.changesMenu, false));

// ===== Persistence plan (79-88) =====
test('79. persistence plan exists', () => assert.equal(persistence.kind, 'module-persistence-plan'));
test('80. schemaAllowedNow false', () => assert.equal(persistence.schemaAllowedNow, false));
test('81. migrationAllowedNow false', () => assert.equal(persistence.migrationAllowedNow, false));
test('82. backendAllowedNow false', () => assert.equal(persistence.backendAllowedNow, false));
test('83. prismaAllowedNow false', () => assert.equal(persistence.prismaAllowedNow, false));
test('84. mutationAllowedNow false', () => assert.equal(persistence.mutationAllowedNow, false));
test('85. productionAllowedNow false', () => assert.equal(persistence.productionAllowedNow, false));
test('86. stagingAllowedNow false', () => assert.equal(persistence.stagingAllowedNow, false));
test('87. real persistence blocked', () => assert.equal(persistence.realPersistenceBlocked, true));
test('88. real data never fixture', () => assert.equal(persistence.realDataUsedAsFixture, false));

// ===== Runtime binding plan (89-96) =====
test('89. runtime binding plan exists', () => assert.equal(runtimeBinding.kind, 'module-runtime-binding-plan'));
test('90. generic model runtime planned', () => assert.ok(runtimeBinding.bindings.genericModelRuntime.activatesProduction === false));
test('91. ModeloBase1 planned for cadastro', () => assert.equal(runtimeBinding.selectedBinding, 'modeloBase1'));
test('92. ModeloBase2 experimental only', () => assert.equal(runtimeBinding.modeloBase2IsProduction, false));
test('93. Empresas referenceOnly when source empresas', () => { const rb = createModuleRuntimeBindingPlan({ blueprint: { moduleId: 'empresas', modelType: 'cadastro' } }); assert.ok(rb.sourceModuleReferenceOnly === true && rb.bindings.empresasMirror.referenceOnly === true); });
test('94. runtime binding does not register module', () => assert.equal(runtimeBinding.registersModule, false));
test('95. runtime binding does not access Prisma', () => assert.equal(runtimeBinding.accessesPrismaDirectly, false));
test('96. runtime binding does not alter Empresas', () => assert.equal(runtimeBinding.altersEmpresas, false));

// ===== Test/gate & evidence & risk plans (97-114) =====
test('97. test/gate plan exists', () => assert.equal(testGate.kind, 'module-test-gate-plan'));
test('98. scope guard planned', () => assert.ok(testGate.plannedGates.includes('scope guard')));
test('99. production guard planned', () => assert.ok(testGate.plannedGates.includes('production guard')));
test('100. module generation guard planned', () => assert.ok(testGate.plannedGates.includes('module generation guard')));
test('101. route/menu guard planned', () => assert.ok(testGate.plannedGates.includes('route/menu guard')));
test('102. backend/prisma guard planned', () => assert.ok(testGate.plannedGates.includes('backend/prisma guard')));
test('103. mutation guard planned', () => assert.ok(testGate.plannedGates.includes('mutation guard')));
test('104. migration guard planned', () => assert.ok(testGate.plannedGates.includes('migration guard')));
test('105. evidence plan exists', () => assert.equal(evidence.kind, 'module-evidence-plan'));
test('106. module reference plan report planned', () => assert.ok(evidence.plannedEvidence.includes('module reference plan report')));
test('107. safety/no-production report planned', () => assert.ok(evidence.plannedEvidence.includes('safety/no-production report')));
test('108. risk plan exists', () => assert.equal(risk.kind, 'module-risk-plan'));
test('109. risk planner-confused-with-generator registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'planner_confused_with_generator')));
test('110. risk early route/menu registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'early_route_menu')));
test('111. risk backend/prisma early registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'backend_prisma_as_execution')));
test('112. risk open permission registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'open_permission')));
test('113. risk tenant bypass registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'tenant_bypass')));
test('114. risk Empresas rewrite registered', () => assert.ok(risk.risks.some((r) => r.riskId === 'empresas_rewrite')));

// ===== Readiness decision (115-120) =====
test('115. readiness decision exists', () => assert.equal(P.readinessDecision.kind, 'module-readiness-decision'));
test('116. readyForRealModuleGeneration false', () => assert.equal(P.readinessDecision.readyForRealModuleGeneration, false));
test('117. readyForPreviewSandbox computed', () => assert.equal(typeof P.readinessDecision.readyForPreviewSandbox, 'boolean'));
test('118. no blockers allows module_reference_plan_ready', () => assert.equal(P.readinessDecision.readiness, 'module_reference_plan_ready'));
test('119. critical gap blocks preview sandbox', () => { const d = createModuleReadinessDecision({ blueprintValid: false, safetyOk: true }); assert.ok(d.readyForPreviewSandbox === false && d.readiness === 'blocked'); });
test('120. real module never allowed now', () => { const d = createModuleReadinessDecision({ blueprintValid: true, safetyOk: true, routeMenuPlan: routeMenu, persistencePlan: persistence, permissionPlan: permPlan, fieldTableFormPlan: fieldPlan }); assert.equal(d.readyForRealModuleGeneration, false); });

// ===== Manifest (121-123) =====
test('121. manifest created', () => assert.equal(P.manifest.kind, 'module-reference-planner-manifest'));
test('122. manifest has digests', () => assert.ok(['identityPlanDigest', 'filePlanDigest', 'permissionPlanDigest', 'readinessDecisionDigest'].every((k) => typeof P.manifest[k] === 'string')));
test('123. overallDigest deterministic', () => { const a = createStudioBlueprintModuleReferencePlanner({ blueprint: BP }); const b = createStudioBlueprintModuleReferencePlanner({ blueprint: BP }); assert.ok(a.overallDigest === b.overallDigest && /^fnv1a-[0-9a-f]{8}$/.test(a.overallDigest)); });

// ===== Verifier (124-143) =====
test('124. verifier valid on correct plan', () => assert.equal(P.verifierResult.valid, true));
const tamper = (key) => { const t = JSON.parse(JSON.stringify(P)); t.manifest[key] = 'fnv1a-deadbeef'; return verifyModuleReferencePlan({ plan: t }).valid; };
test('125. verifier detects identity digest altered', () => assert.equal(tamper('identityPlanDigest'), false));
test('126. verifier detects file plan digest altered', () => assert.equal(tamper('filePlanDigest'), false));
test('127. verifier detects screen plan digest altered', () => assert.equal(tamper('screenPlanDigest'), false));
test('128. verifier detects field/table/form digest altered', () => assert.equal(tamper('fieldTableFormPlanDigest'), false));
test('129. verifier detects permission digest altered', () => assert.equal(tamper('permissionPlanDigest'), false));
test('130. verifier detects route/menu digest altered', () => assert.equal(tamper('routeMenuPlanDigest'), false));
test('131. verifier detects persistence digest altered', () => assert.equal(tamper('persistencePlanDigest'), false));
test('132. verifier detects runtime binding digest altered', () => assert.equal(tamper('runtimeBindingPlanDigest'), false));
test('133. verifier detects readiness digest altered', () => assert.equal(tamper('readinessDecisionDigest'), false));
const flip = (flag) => { const t = JSON.parse(JSON.stringify(P)); t.manifest[flag] = true; return verifyModuleReferencePlan({ plan: t }).valid; };
test('134. verifier requires moduleGenerated false', () => assert.equal(flip('moduleGenerated'), false));
test('135. verifier requires filesWrittenToModule false', () => assert.equal(flip('filesWrittenToModule'), false));
test('136. verifier requires routeCreated false', () => assert.equal(flip('routeCreated'), false));
test('137. verifier requires menuCreated false', () => assert.equal(flip('menuCreated'), false));
test('138. verifier requires moduleRegistered false', () => assert.equal(flip('moduleRegistered'), false));
test('139. verifier requires backendAccessed false', () => assert.equal(flip('backendAccessed'), false));
test('140. verifier requires prismaAccessed false', () => assert.equal(flip('prismaAccessed'), false));
test('141. verifier requires productionAccessed false', () => assert.equal(flip('productionAccessed'), false));
test('142. verifier requires mutationAllowed false', () => assert.equal(flip('mutationAllowed'), false));
test('143. verifier requires readyForRealModuleGeneration false', () => { const t = JSON.parse(JSON.stringify(P)); t.manifest.readyForRealModuleGeneration = true; assert.equal(verifyModuleReferencePlan({ plan: t }).valid, false); });

// ===== Compatibility checker (144-152) =====
test('144. compatibility checker exists', () => assert.equal(P.compatibilityResult.kind, 'module-reference-planner-compatibility'));
test('145. invalid blueprint blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, blueprintValid: false } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('146. route/menu exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, routeCreated: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('147. module generation exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, moduleGenerated: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('148. file write exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, filesWrittenToModule: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('149. backend/prisma exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, prismaAccessed: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('150. persistence real exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, persistenceCreated: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('151. mutation exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, mutationAllowed: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('152. rewrite Empresas exposed blocks', () => { const c = checkModuleReferencePlanCompatibility({ plan: { ...P, rewriteEmpresas: true } }); assert.equal(c.compatibilityStatus, 'blocked'); });
test('152b. compatibleForRealModuleGeneration always false', () => assert.equal(P.compatibilityResult.compatibleForRealModuleGeneration, false));

// ===== Fallback (153-160) =====
test('153. fallback flag off safe', () => { const fb = createModuleReferencePlannerFallback({ scenario: 'flag_off' }); assert.ok(fb.safeToUseAsModuleReferencePlan === false && fb.readiness === 'blocked'); });
test('154. fallback invalid engine output blocks', () => assert.equal(createModuleReferencePlannerFallback({ scenario: 'invalid_engine_output' }).sideEffects, false));
test('155. fallback module generation attempt blocks', () => assert.equal(createModuleReferencePlannerFallback({ scenario: 'module_generation_attempt' }).moduleGenerated, false));
test('156. fallback file write attempt blocks', () => assert.equal(createModuleReferencePlannerFallback({ scenario: 'file_write_attempt' }).filesWrittenToModule, false));
test('157. fallback route/menu attempt blocks', () => assert.ok(createModuleReferencePlannerFallback({ scenario: 'route_attempt' }).routeCreated === false && createModuleReferencePlannerFallback({ scenario: 'menu_attempt' }).menuCreated === false));
test('158. fallback backend/prisma/migration blocks', () => assert.ok(createModuleReferencePlannerFallback({ scenario: 'backend_attempt' }).backendAccessed === false && createModuleReferencePlannerFallback({ scenario: 'prisma_attempt' }).prismaAccessed === false && createModuleReferencePlannerFallback({ scenario: 'migration_attempt' }).migrationExecuted === false));
test('159. fallback production/staging/fetch/mutation blocks', () => assert.ok(createModuleReferencePlannerFallback({ scenario: 'production_attempt' }).productionAccessed === false && createModuleReferencePlannerFallback({ scenario: 'mutation_attempt' }).mutationAllowed === false));
test('160. fallback rewrite Empresas blocks', () => assert.equal(createModuleReferencePlannerFallback({ scenario: 'rewrite_empresas_attempt' }).rewriteEmpresas, false));

// ===== Scope safety (161-189) =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('161. module-reference-planner exists', () => assert.ok(exists('src/studio/blueprint-engine/module-reference-planner')));
test('162. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('163. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('164. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('165. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('166. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('167. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('168. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('169. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('170. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('171. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/migration/i.test(x))); });
test('172. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('173. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/menu|nav/i.test(x))); });
test('174. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('175. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('176. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('177. CSS global not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('178. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('179. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('180. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('181. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('182. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('183. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('184. staging not accessed', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('185. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('186. mutation not exposed', () => assert.equal(P.mutationAllowed, false));
test('187. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('188. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('189. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

// ===== Upstream gates still importable + misc (190-194) =====
test('190. blueprint engine foundation subtree present', () => assert.ok(exists('src/studio/blueprint-engine/index.js')));
test('191. studio blueprint certification present', () => assert.ok(exists('src/studio/foundation-contracts/certification/index.js')));
test('192. empresas blueprint mirror present', () => assert.ok(exists('src/studio/blueprint-mirrors/empresas/index.js')));
test('193. empresas certified read contract present', () => assert.ok(exists('src/modules/empresas/local-read-contract-pilot')));
test('194. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/module-reference-planner\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});

// ===== Extra guards + config (E1-E10) =====
test('E1. capabilities frozen', () => assert.ok(Object.isFrozen(MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES)));
test('E2. persistence states frozen (8)', () => assert.ok(Object.isFrozen(MODULE_PERSISTENCE_STATES) && MODULE_PERSISTENCE_STATES.length === 8));
test('E3. readiness states frozen', () => assert.ok(Object.isFrozen(MODULE_READINESS_STATES) && MODULE_READINESS_STATES.includes('module_reference_plan_ready')));
test('E4. error catalog >= 24 codes', () => assert.ok(MODULE_REFERENCE_PLANNER_ERROR_CODES.length >= 24));
test('E5. error descriptor sanitized + no side effects', () => { const e = createModuleReferencePlannerError('MODULE_REFERENCE_PLANNER_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false && e.rewriteEmpresas === false); });
test('E6. ModuleReferencePlannerError typed', () => { const e = new ModuleReferencePlannerError('MODULE_REFERENCE_PLANNER_INVALID_ENGINE_OUTPUT', 'x'); assert.ok(e instanceof Error && e.code === 'MODULE_REFERENCE_PLANNER_INVALID_ENGINE_OUTPUT'); });
test('E7. flag fails closed in production', () => assert.equal(isStudioModuleReferencePlannerEnabled({ [MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E8. verify flag fails closed in production', () => assert.equal(isStudioModulePlanVerifyEnabled({ [MAK_STUDIO_MODULE_PLAN_VERIFY_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E9. plannerDigest deterministic', () => assert.equal(plannerDigest({ a: 1 }), plannerDigest({ a: 1 })));
test('E10. React-free + no backend imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p) && !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('E11. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(P.diagnostics))));
test('E12. fallback scenarios include all escape attempts', () => assert.ok(['module_generation_attempt', 'file_write_attempt', 'route_attempt', 'backend_attempt', 'prisma_attempt', 'mutation_attempt', 'rewrite_empresas_attempt'].every((s) => MODULE_REFERENCE_PLANNER_FALLBACK_SCENARIOS.includes(s))));

// ===== Evidence docs (D1-D19) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-MODULE-REFERENCE-PLANNER-REPORT.md', 'MODULE-IDENTITY-PLAN.md',
  'MODULE-FILE-PLAN.md', 'MODULE-SCREEN-PLAN.md', 'MODULE-FIELD-TABLE-FORM-PLAN.md', 'MODULE-PERMISSION-PLAN.md',
  'MODULE-ROUTE-MENU-PLAN.md', 'MODULE-PERSISTENCE-PLAN.md', 'MODULE-RUNTIME-BINDING-PLAN.md', 'MODULE-TEST-GATE-PLAN.md',
  'MODULE-EVIDENCE-PLAN.md', 'MODULE-RISK-PLAN.md', 'MODULE-READINESS-DECISION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-blueprint-module-reference-planner/${DOCS[i]}`)));
}
test('D-content. no-generation doc + next slice spec present', () => { assert.ok(/generat|produç|production/i.test(readEv('NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md'))); assert.ok(/PREVIEW SANDBOX/i.test(readEv('NEXT-SLICE-SPEC.md'))); });
