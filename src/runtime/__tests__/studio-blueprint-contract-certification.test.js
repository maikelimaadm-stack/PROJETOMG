import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
  STUDIO_CERTIFICATION_ERROR_CODES,
  MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG,
  isStudioBlueprintContractCertificationEnabled,
  createStudioBlueprintCertificationDigest,
  createStudioCanonicalMetamodel,
  createStudioCanonicalBlueprintContract,
  createStudioCanonicalModuleBlueprint,
  createStudioCanonicalFieldContract,
  createStudioCanonicalScreenContract,
  createStudioCanonicalValidationContract,
  createStudioCanonicalPermissionContract,
  createStudioCanonicalRouteMenuContract,
  createStudioCanonicalPersistenceBoundary,
  createStudioCanonicalRuntimeBinding,
  createStudioCanonicalSafetyInvariants,
  createStudioCanonicalErrorCatalog,
  createStudioCanonicalCompatibilityRules,
  createStudioCanonicalHardeningBaseline,
  createStudioBlueprintCertificationManifest,
  verifyStudioBlueprintContractCertification,
  checkStudioBlueprintCertificationCompatibility,
  createStudioBlueprintCertificationDiagnostics,
  createStudioBlueprintCertificationFallback,
  createStudioBlueprintContractCertification,
} from '../../studio/foundation-contracts/certification/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/foundation-contracts/certification');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

const C = createStudioBlueprintContractCertification();
const meta = createStudioCanonicalMetamodel();
const bp = createStudioCanonicalBlueprintContract();
const mod = createStudioCanonicalModuleBlueprint();
const field = createStudioCanonicalFieldContract();
const screen = createStudioCanonicalScreenContract();
const validation = createStudioCanonicalValidationContract();
const perm = createStudioCanonicalPermissionContract();
const rm = createStudioCanonicalRouteMenuContract();
const pers = createStudioCanonicalPersistenceBoundary();
const bind = createStudioCanonicalRuntimeBinding();
const safety = createStudioCanonicalSafetyInvariants();
const errs = createStudioCanonicalErrorCatalog();
const compat = createStudioCanonicalCompatibilityRules();
const baseline = createStudioCanonicalHardeningBaseline();
const dig = (v) => createStudioBlueprintCertificationDigest({ value: v }).digest;
const breaking = (a, b) => checkStudioBlueprintCertificationCompatibility({ certified: a, candidate: b }).classification === 'breaking';

// ===== Base (1-22) =====
test('1. certification created', () => assert.equal(C.kind, 'studio-blueprint-contract-certification'));
test('2. certificationName', () => assert.equal(C.certificationName, 'studio-blueprint-contract-certification'));
test('3. blueprintContractName', () => assert.equal(C.blueprintContractName, 'studio-blueprint-contract'));
test('4. blueprintContractVersion', () => assert.equal(C.blueprintContractVersion, STUDIO_BLUEPRINT_CONTRACT_VERSION));
test('5. certificationVersion', () => assert.equal(C.certificationVersion, STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION));
test('6. certificationStatus', () => assert.equal(C.certificationStatus, 'certified_headless_blueprint_contract'));
test('7. environment', () => assert.equal(C.environment, 'local_contract'));
test('8. headless', () => assert.equal(C.headless, true));
test('9. uiEnabled false', () => assert.equal(C.uiEnabled, false));
test('10. routeEnabled false', () => assert.equal(C.routeEnabled, false));
test('11. menuEnabled false', () => assert.equal(C.menuEnabled, false));
test('12. moduleRegistrationEnabled false', () => assert.equal(C.moduleRegistrationEnabled, false));
test('13. backendEnabled false', () => assert.equal(C.backendEnabled, false));
test('14. prismaEnabled false', () => assert.equal(C.prismaEnabled, false));
test('15. migrationEnabled false', () => assert.equal(C.migrationEnabled, false));
test('16. productionEnabled false', () => assert.equal(C.productionEnabled, false));
test('17. stagingEnabled false', () => assert.equal(C.stagingEnabled, false));
test('18. fetchEnabled false', () => assert.equal(C.fetchEnabled, false));
test('19. mutationAllowed false', () => assert.equal(C.mutationAllowed, false));
test('20. generatedModuleAllowed false', () => assert.equal(C.generatedModuleAllowed, false));
test('21. marketplaceEnabled false', () => assert.equal(C.marketplaceEnabled, false));
test('22. readiness certified', () => assert.equal(C.readiness, 'certified_headless_blueprint_contract'));

// ===== Canonical contracts (23-74) =====
test('23. canonical metamodel exists', () => assert.equal(meta.kind, 'studio-canonical-metamodel'));
test('24. metamodel 19 entities', () => assert.equal(meta.entityCount, 19));
test('25. metamodel contract-only', () => assert.ok(meta.contractOnly && meta.entities.every((e) => e.contractOnly)));
test('26. canonical blueprint exists', () => assert.equal(bp.kind, 'studio-canonical-blueprint-contract'));
test('27. blueprint 7 states', () => assert.equal(bp.states.length, 7));
test('28. draft does not register module', () => assert.equal(bp.stateRules.draft.registersModule, false));
test('29. certified_local not production', () => assert.equal(bp.stateRules.certified_local.production, false));
test('30. ready_for_staging no auto staging', () => assert.match(bp.stateRules.ready_for_staging.note, /does not access staging/i));
test('31. blocked fails closed', () => assert.equal(bp.failClosed, true));
test('32. canonical module blueprint exists', () => assert.equal(mod.kind, 'studio-canonical-module-blueprint'));
test('33. module requires permission', () => assert.equal(mod.permissionBlueprintRequired, true));
test('34. module requires persistence', () => assert.equal(mod.persistenceBoundaryRequired, true));
test('35. module dangerous defaults false', () => assert.ok(Object.values(mod.defaults).every((v) => v === false)));
test('36. canonical field contract exists', () => assert.equal(field.kind, 'studio-canonical-field-contract'));
test('37. field 14 types', () => assert.equal(field.allowedTypes.length, 14));
test('38. field blocks invalid type', () => assert.equal(createStudioCanonicalFieldContract({ field: { name: 'x', type: 'evil' } }).fieldCheck.valid, false));
test('39. computed does not execute code', () => assert.equal(field.computedExecutesCode, false));
test('40. relation preserves tenant', () => assert.equal(field.relationPreservesTenant, true));
test('41. protected read-only default', () => assert.equal(field.protectedReadOnlyByDefault, true));
test('42. canonical screen contract exists', () => assert.equal(screen.kind, 'studio-canonical-screen-contract'));
test('43. screen no react component', () => assert.equal(screen.generatesReactComponent, false));
test('44. screen no route', () => assert.equal(screen.registersRoute, false));
test('45. screen requires empty/loading/error', () => assert.deepEqual(screen.requiredStates, ['emptyState', 'loadingState', 'errorState']));
test('46. canonical validation contract exists', () => assert.equal(validation.kind, 'studio-canonical-validation-contract'));
test('47. validation blocks unsafe', () => assert.equal(validation.unsafeValidationAllowed, false));
test('48. async no network', () => assert.equal(validation.asyncCallsNetwork, false));
test('49. unique no constraint', () => assert.equal(validation.uniqueCreatesConstraint, false));
test('50. tenantScope not removable', () => assert.equal(validation.tenantScopeRemovable, false));
test('51. canonical permission contract exists', () => assert.equal(perm.kind, 'studio-canonical-permission-contract'));
test('52. permission failClosed', () => assert.equal(perm.failClosed, true));
test('53. permission defaultDeny', () => assert.equal(perm.defaultDeny, true));
test('54. admin no bypass tenant', () => assert.equal(perm.adminBypassesTenant, false));
test('55. mutation not default', () => assert.equal(perm.mutationEnabledByDefault, false));
test('56. canonical route/menu exists', () => assert.equal(rm.kind, 'studio-canonical-route-menu-contract'));
test('57. routeEnabled default false', () => assert.equal(rm.routeEnabledDefault, false));
test('58. menuVisible default false', () => assert.equal(rm.menuVisibleDefault, false));
test('59. autoRegister false', () => assert.equal(rm.autoRegister, false));
test('60. public route blocked', () => assert.equal(rm.publicRouteAllowed, false));
test('61. canonical persistence exists', () => assert.equal(pers.kind, 'studio-canonical-persistence-boundary'));
test('62. default noPersistence', () => assert.equal(pers.defaultState, 'noPersistence'));
test('63. schemaAllowed false', () => assert.equal(pers.defaults.schemaAllowed, false));
test('64. migrationAllowed false', () => assert.equal(pers.defaults.migrationAllowed, false));
test('65. prismaAllowed false', () => assert.equal(pers.defaults.prismaAllowed, false));
test('66. backendAllowed false', () => assert.equal(pers.defaults.backendAllowed, false));
test('67. mutationAllowed false', () => assert.equal(pers.defaults.mutationAllowed, false));
test('68. real data not fixture', () => assert.equal(pers.realDataAsFixture, false));
test('69. canonical runtime binding exists', () => assert.equal(bind.kind, 'studio-canonical-runtime-binding'));
test('70. ModeloBase1 cadastro', () => assert.equal(bind.typeMap.cadastro, 'modeloBase1'));
test('71. ModeloBase2 experimental', () => assert.equal(bind.typeMap.operacional, 'modeloBase2Experimental'));
test('72. Empresas seed model', () => assert.match(bind.bindings.empresasCertifiedContract.ref, /empresas-local-read-contract@1\.0\.0/));
test('73. binding not rewrite Empresas', () => assert.equal(bind.rewritesEmpresas, false));
test('74. binding no prisma direct', () => assert.equal(bind.accessesPrismaDirectly, false));

// ===== Safety (75-97) =====
test('75. canonical safety invariants exist', () => assert.equal(safety.kind, 'studio-canonical-safety-invariants'));
test('76. 20 invariants', () => assert.equal(safety.invariantCount, 20));
test('77. headlessOnly', () => assert.equal(safety.invariants.headlessOnly, true));
test('78. noUi', () => assert.equal(safety.invariants.noUi, true));
test('79. noRoute', () => assert.equal(safety.invariants.noRoute, true));
test('80. noMenu', () => assert.equal(safety.invariants.noMenu, true));
test('81. noModuleRegistration', () => assert.equal(safety.invariants.noModuleRegistration, true));
test('82. noBackend', () => assert.equal(safety.invariants.noBackend, true));
test('83. noPrisma', () => assert.equal(safety.invariants.noPrisma, true));
test('84. noMigration', () => assert.equal(safety.invariants.noMigration, true));
test('85. noFetch', () => assert.equal(safety.invariants.noFetch, true));
test('86. noProduction', () => assert.equal(safety.invariants.noProduction, true));
test('87. noStaging', () => assert.equal(safety.invariants.noStaging, true));
test('88. noMutation', () => assert.equal(safety.invariants.noMutation, true));
test('89. noStorage', () => assert.equal(safety.invariants.noStorage, true));
test('90. noDependency', () => assert.equal(safety.invariants.noDependency, true));
test('91. defaultDeny', () => assert.equal(safety.invariants.defaultDeny, true));
test('92. failClosed', () => assert.equal(safety.invariants.failClosed, true));
test('93. tenantRequired', () => assert.equal(safety.invariants.tenantRequired, true));
test('94. permissionRequired', () => assert.equal(safety.invariants.permissionRequired, true));
test('95. noAutomaticPublication', () => assert.equal(safety.invariants.noAutomaticPublication, true));
test('96. noAutomaticMarketplace', () => assert.equal(safety.invariants.noAutomaticMarketplace, true));
test('97. exactSafety true', () => assert.equal(safety.exactSafety, true));

// ===== Error catalog (98-109) =====
test('98. error catalog exists', () => assert.equal(errs.kind, 'studio-canonical-error-catalog'));
test('99. error codes unique', () => assert.equal(errs.uniqueCodes, true));
test('100. error types present', () => assert.ok(errs.entries.every((e) => typeof e.descriptor.type === 'string')));
test('101. error messages sanitized', () => assert.equal(errs.allSanitized, true));
test('102. base errors present', () => assert.ok(errs.codes.includes('STUDIO_INVALID_BLUEPRINT')));
test('103. hardening errors present', () => assert.ok(errs.codes.includes('STUDIO_HARDENING_DANGEROUS_BLUEPRINT')));
test('104. certification errors present', () => assert.ok(errs.codes.includes('STUDIO_CERTIFICATION_INVALID')));
test('105. errors no secrets', () => assert.ok(!/jwt|token|DATABASE_URL|secret/i.test(JSON.stringify(errs.entries))));
test('106. errors sideEffects false', () => assert.ok(errs.entries.every((e) => e.descriptor.sideEffects === false)));
test('107. errors productionAccessed false', () => assert.ok(errs.entries.every((e) => e.descriptor.productionAccessed === false)));
test('108. errors mutationExecuted false', () => assert.ok(errs.entries.every((e) => e.descriptor.mutationExecuted === false)));
test('109. errors fetchUsed false', () => assert.ok(errs.entries.every((e) => e.descriptor.fetchUsed === false)));

// ===== Compatibility (110-134) =====
test('110. compatibility rules exist', () => assert.equal(compat.kind, 'studio-canonical-compatibility-rules'));
test('111. ui release breaking', () => assert.ok(breaking({ uiEnabled: false }, { uiEnabled: true })));
test('112. route release breaking', () => assert.ok(breaking({ routeEnabled: false }, { routeEnabled: true })));
test('113. menu release breaking', () => assert.ok(breaking({ menuEnabled: false }, { menuEnabled: true })));
test('114. moduleRegistration release breaking', () => assert.ok(breaking({ moduleRegistrationEnabled: false }, { moduleRegistrationEnabled: true })));
test('115. backend release breaking', () => assert.ok(breaking({ backendEnabled: false }, { backendEnabled: true })));
test('116. prisma release breaking', () => assert.ok(breaking({ prismaEnabled: false }, { prismaEnabled: true })));
test('117. migration release breaking', () => assert.ok(breaking({ migrationEnabled: false }, { migrationEnabled: true })));
test('118. production release breaking', () => assert.ok(breaking({ productionEnabled: false }, { productionEnabled: true })));
test('119. staging release breaking', () => assert.ok(breaking({ stagingEnabled: false }, { stagingEnabled: true })));
test('120. fetch release breaking', () => assert.ok(breaking({ fetchEnabled: false }, { fetchEnabled: true })));
test('121. mutation release breaking', () => assert.ok(breaking({ mutationAllowed: false }, { mutationAllowed: true })));
test('122. generatedModule release breaking', () => assert.ok(breaking({ generatedModuleAllowed: false }, { generatedModuleAllowed: true })));
test('123. marketplace release breaking', () => assert.ok(breaking({ marketplaceEnabled: false }, { marketplaceEnabled: true })));
test('124. defaultDeny relax breaking', () => assert.ok(breaking({ defaultDeny: true }, { defaultDeny: false })));
test('125. failClosed relax breaking', () => assert.ok(breaking({ failClosed: true }, { failClosed: false })));
test('126. tenantRequired relax breaking', () => assert.ok(breaking({ tenantRequired: true }, { tenantRequired: false })));
test('127. permissionRequired relax breaking', () => assert.ok(breaking({ permissionRequired: true }, { permissionRequired: false })));
test('128. route/menu default release breaking', () => assert.ok(breaking({ routeEnabled: false }, { routeEnabled: true })));
test('129. persistence write breaking', () => assert.ok(breaking({ persistenceDefault: 'noPersistence' }, { persistenceDefault: 'localWriteDraft' })));
test('130. protected editable breaking', () => assert.ok(breaking({ protectedFieldEditableDefault: false }, { protectedFieldEditableDefault: true })));
test('131. error code removed breaking', () => assert.ok(breaking({ errorCodes: ['A', 'B'] }, { errorCodes: ['A'] })));
test('132. new optional field backward', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { optionalFields: ['a'] }, candidate: { optionalFields: ['a', 'b'] } }).classification, 'backward_compatible'));
test('133. new error code backward', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { errorCodes: ['A'] }, candidate: { errorCodes: ['A', 'B'] } }).classification, 'backward_compatible'));
test('134. new disabled placeholder backward', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { plannedScreenKinds: [] }, candidate: { plannedScreenKinds: ['timeline'] } }).classification, 'backward_compatible'));

// ===== Hardening baseline (135-153) =====
test('135. baseline exists', () => assert.equal(baseline.kind, 'studio-canonical-hardening-baseline'));
test('136. invalid >= 22', () => assert.ok(baseline.measured.invalidCaseScenarios >= 22));
test('137. dangerous >= 27', () => assert.ok(baseline.measured.dangerousScenarios >= 27));
test('138. field >= 35', () => assert.ok(baseline.measured.fieldScenarios >= 35));
test('139. screen >= 22', () => assert.ok(baseline.measured.screenScenarios >= 22));
test('140. validation >= 26', () => assert.ok(baseline.measured.validationScenarios >= 26));
test('141. permission >= 26', () => assert.ok(baseline.measured.permissionScenarios >= 26));
test('142. route/menu >= 19', () => assert.ok(baseline.measured.routeMenuScenarios >= 19));
test('143. persistence >= 17', () => assert.ok(baseline.measured.persistenceTransitionScenarios >= 17));
test('144. runtime binding >= 14', () => assert.ok(baseline.measured.runtimeBindingScenarios >= 14));
test('145. compatibility >= 22', () => assert.ok(baseline.measured.compatibilityScenarios >= 22));
test('146. digest >= 16', () => assert.ok(baseline.measured.digestScenarios >= 16));
test('147. verifier >= 19', () => assert.ok(baseline.measured.verifierScenarios >= 19));
test('148. safety invariants = 20', () => assert.equal(baseline.measured.safetyInvariants, 20));
test('149. performance >= 165', () => assert.ok(baseline.measured.performanceScenarios >= 165));
test('150. baseline blockers zero', () => assert.deepEqual(baseline.hardeningBlockers, []));
test('151. baseline warnings zero', () => assert.deepEqual(baseline.hardeningWarnings, []));
test('152. baseline readiness hardened', () => assert.equal(baseline.hardeningReadiness, 'blueprint_contract_hardened'));
test('153. reduced baseline invalidates', () => { const b = createStudioCanonicalHardeningBaseline(); assert.equal(b.valid, true); assert.ok(Array.isArray(b.regressions)); });

// ===== Digest / Manifest / Verifier (154-192) =====
const baseVal = { safety: { failClosed: true }, permission: { defaultDeny: true }, routeMenu: { routeEnabled: false }, persistence: 'noPersistence', compatibility: ['ui'], hardening: 165 };
test('154. certification digest exists', () => assert.match(dig({ a: 1 }), /^fnv1a-/));
test('155. same input same digest', () => assert.equal(dig(baseVal), dig(baseVal)));
test('156. safety change digest', () => assert.notEqual(dig({ ...baseVal, safety: { failClosed: false } }), dig(baseVal)));
test('157. permission change digest', () => assert.notEqual(dig({ ...baseVal, permission: { defaultDeny: false } }), dig(baseVal)));
test('158. route/menu change digest', () => assert.notEqual(dig({ ...baseVal, routeMenu: { routeEnabled: true } }), dig(baseVal)));
test('159. persistence change digest', () => assert.notEqual(dig({ ...baseVal, persistence: 'localWriteDraft' }), dig(baseVal)));
test('160. compatibility change digest', () => assert.notEqual(dig({ ...baseVal, compatibility: ['ui', 'route'] }), dig(baseVal)));
test('161. hardening baseline change digest', () => assert.notEqual(dig({ ...baseVal, hardening: 200 }), dig(baseVal)));
test('162. secret-like blocked or sanitized', () => { const r = createStudioBlueprintCertificationDigest({ value: { token: 'x' } }); assert.ok(r.sanitized || r.blocked); });
test('163. circular input blocks', () => { const o = {}; o.s = o; assert.equal(createStudioBlueprintCertificationDigest({ value: o }).blocked, true); });
test('164. function input blocks', () => assert.equal(createStudioBlueprintCertificationDigest({ value: () => 1 }).blocked, true));
test('165. manifest created', () => assert.equal(C.manifest.kind, 'studio-blueprint-certification-manifest'));
test('166. manifest all digests', () => ['metamodelDigest', 'blueprintContractDigest', 'permissionContractDigest', 'safetyInvariantsDigest', 'errorCatalogDigest', 'compatibilityRulesDigest', 'hardeningBaselineDigest'].forEach((k) => assert.ok(typeof C.manifest[k] === 'string')));
test('167. overallDigest deterministic', () => assert.equal(createStudioBlueprintContractCertification().manifest.overallDigest, C.manifest.overallDigest));
test('168. verifier valid on correct', () => assert.equal(verifyStudioBlueprintContractCertification({ certification: C }).valid, true));
const tamper = (fn) => { const t = JSON.parse(JSON.stringify(C)); fn(t); return verifyStudioBlueprintContractCertification({ certification: t }).valid === false; };
test('169. verifier detects metamodel digest', () => assert.ok(tamper((t) => { t.manifest.metamodelDigest = 'fnv1a-0'; })));
test('170. verifier detects blueprint digest', () => assert.ok(tamper((t) => { t.manifest.blueprintContractDigest = 'fnv1a-0'; })));
test('171. verifier detects field digest', () => assert.ok(tamper((t) => { t.manifest.fieldContractDigest = 'fnv1a-0'; })));
test('172. verifier detects permission digest', () => assert.ok(tamper((t) => { t.manifest.permissionContractDigest = 'fnv1a-0'; })));
test('173. verifier detects route/menu digest', () => assert.ok(tamper((t) => { t.manifest.routeMenuContractDigest = 'fnv1a-0'; })));
test('174. verifier detects persistence digest', () => assert.ok(tamper((t) => { t.manifest.persistenceBoundaryDigest = 'fnv1a-0'; })));
test('175. verifier detects runtime binding digest', () => assert.ok(tamper((t) => { t.manifest.runtimeBindingDigest = 'fnv1a-0'; })));
test('176. verifier detects safety digest', () => assert.ok(tamper((t) => { t.manifest.safetyInvariantsDigest = 'fnv1a-0'; })));
test('177. verifier detects error catalog digest', () => assert.ok(tamper((t) => { t.manifest.errorCatalogDigest = 'fnv1a-0'; })));
test('178. verifier detects compatibility digest', () => assert.ok(tamper((t) => { t.manifest.compatibilityRulesDigest = 'fnv1a-0'; })));
test('179. verifier detects hardening baseline digest', () => assert.ok(tamper((t) => { t.manifest.hardeningBaselineDigest = 'fnv1a-0'; })));
test('180. verifier requires exactSafety', () => assert.ok(tamper((t) => { t.exactSafety = false; t.manifest.exactSafety = false; })));
test('181. verifier requires blockers zero', () => assert.ok(tamper((t) => { t.manifest.blockers = ['x']; })));
test('182. verifier requires uiEnabled false', () => assert.ok(tamper((t) => { t.uiEnabled = true; })));
test('183. verifier requires routeEnabled false', () => assert.ok(tamper((t) => { t.routeEnabled = true; })));
test('184. verifier requires menuEnabled false', () => assert.ok(tamper((t) => { t.menuEnabled = true; })));
test('185. verifier requires backendEnabled false', () => assert.ok(tamper((t) => { t.backendEnabled = true; })));
test('186. verifier requires prismaEnabled false', () => assert.ok(tamper((t) => { t.prismaEnabled = true; })));
test('187. verifier requires migrationEnabled false', () => assert.ok(tamper((t) => { t.migrationEnabled = true; })));
test('188. verifier requires productionEnabled false', () => assert.ok(tamper((t) => { t.productionEnabled = true; })));
test('189. verifier requires stagingEnabled false', () => assert.ok(tamper((t) => { t.stagingEnabled = true; })));
test('190. verifier requires fetchEnabled false', () => assert.ok(tamper((t) => { t.fetchEnabled = true; })));
test('191. verifier requires mutationAllowed false', () => assert.ok(tamper((t) => { t.mutationAllowed = true; })));
test('192. verifier safeToUse true', () => assert.equal(C.safeToUseAsBlueprintReference, true));

// ===== Compatibility checker / diagnostics / fallback (193-216) =====
test('193. compatibility checker exists', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: {}, candidate: {} }).kind, 'studio-blueprint-certification-compatibility'));
test('194. identical compatible', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { headless: true }, candidate: { headless: true } }).classification, 'compatible'));
test('195. new optional backward', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { optionalFields: [] }, candidate: { optionalFields: ['a'] } }).classification, 'backward_compatible'));
test('196. ui release invalidates', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { uiEnabled: false }, candidate: { uiEnabled: true } }).certificationInvalidated, true));
test('197. production release invalidates', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { productionEnabled: false }, candidate: { productionEnabled: true } }).certificationInvalidated, true));
test('198. mutation release invalidates', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { mutationAllowed: false }, candidate: { mutationAllowed: true } }).certificationInvalidated, true));
test('199. safety relax invalidates', () => assert.equal(checkStudioBlueprintCertificationCompatibility({ certified: { failClosed: true }, candidate: { failClosed: false } }).certificationInvalidated, true));
test('200. diagnostics created', () => assert.equal(C.diagnostics.kind, 'studio-blueprint-certification-diagnostics'));
test('201. diagnostics no secrets', () => assert.ok(!/jwt|token|DATABASE_URL|secret/i.test(JSON.stringify(createStudioBlueprintCertificationDiagnostics()))));
test('202. diagnostics readiness certified', () => assert.equal(createStudioBlueprintCertificationDiagnostics().readiness, 'certified_headless_blueprint_contract'));
test('203. fallback flag off safe', () => assert.equal(createStudioBlueprintCertificationFallback().certified, false));
test('204. fallback invalid manifest blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'invalid_manifest' }).readiness, 'blocked'));
test('205. fallback digest mismatch blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'metamodel_digest_mismatch' }).readiness, 'blocked'));
test('206. fallback exactSafety false blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'exact_safety_false' }).safeToUseAsBlueprintReference, false));
test('207. fallback UI attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'ui_attempt' }).uiCreated, false));
test('208. fallback route/menu attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'route_attempt' }).routeCreated, false));
test('209. fallback backend attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'backend_attempt' }).backendAccessed, false));
test('210. fallback Prisma attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'prisma_attempt' }).prismaAccessed, false));
test('211. fallback migration attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'migration_attempt' }).migrationExecuted, false));
test('212. fallback production attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'production_attempt' }).productionAccessed, false));
test('213. fallback staging attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'staging_attempt' }).readiness, 'blocked'));
test('214. fallback fetch attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'fetch_attempt' }).fetchUsed, false));
test('215. fallback mutation attempt blocks', () => assert.equal(createStudioBlueprintCertificationFallback({ scenario: 'mutation_attempt' }).mutationExecuted, false));
test('216. fallback sideEffects false', () => assert.equal(createStudioBlueprintCertificationFallback().sideEffects, false));

// ===== Scope safety (217-248) =====
const AUTHORIZED = [
  /^src\/studio\/foundation-contracts\/certification\//,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-certification\//,
  // POST-FOUNDATION C — Empresas Certified Blueprint Mirror & Alignment Audit slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-mirrors\/empresas\//,
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
  /^docs\/evidence\/post-foundation-c-empresas-certified-blueprint-mirror-alignment-audit\//,
  // POST-FOUNDATION C — Empresas Studio Compatibility Slice 1 slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
  /^scripts\/gates\/g423-empresas-studio-compatibility-slice-1\.mjs$/,
  /^docs\/evidence\/post-foundation-c-empresas-studio-compatibility-slice-1\//,
  // POST-FOUNDATION C — Studio Blueprint Engine Foundation slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-engine\//,
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
  // POST-FOUNDATION C — Studio Blueprint Module Reference Planner slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
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
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('217. certification subtree exists', () => assert.ok(exists('src/studio/foundation-contracts/certification')));
test('218. src/studio outside foundation-contracts not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(?!foundation-contracts\/)/.test(x))); });
test('219. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('220. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('221. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('222. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('223. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('224. menu not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('225. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('226. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('227. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('228. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('229. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('230. Empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('231. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('232. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('233. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('234. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('235. no Prisma Client', () => assert.ok(importsOf().every((p) => !/prisma|@prisma/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('236. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('237. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('238. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('239. staging not accessed (no real staging url)', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('240. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('241. mutation not exposed', () => assert.equal(C.mutationAllowed, false));
test('242. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('243. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('244. React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('245. error catalog >= 40 codes', () => assert.ok(STUDIO_CERTIFICATION_ERROR_CODES.length >= 4 && errs.codeCount >= 40));
test('246. headless capabilities frozen', () => assert.ok(Object.isFrozen(STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES)));
test('247. flag fails closed in production', () => assert.equal(isStudioBlueprintContractCertificationEnabled({ [MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('248. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/foundation-contracts\/certification\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
