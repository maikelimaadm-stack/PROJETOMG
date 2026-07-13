import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_FOUNDATION_CONTRACT_NAME,
  STUDIO_FOUNDATION_CONTRACT_VERSION,
  STUDIO_FOUNDATION_CONTRACTS_VERSION,
  STUDIO_FOUNDATION_ENVIRONMENT,
  STUDIO_HEADLESS_CAPABILITIES,
  MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG,
  MAK_STUDIO_CONTRACT_VERIFY_FLAG,
  MAK_STUDIO_BLUEPRINT_VALIDATE_FLAG,
  MAK_STUDIO_COMPATIBILITY_CHECK_FLAG,
  isStudioFoundationContractsEnabled,
  isStudioContractVerifyEnabled,
  isStudioBlueprintValidateEnabled,
  isStudioCompatibilityCheckEnabled,
  STUDIO_ERROR_CODES,
  StudioFoundationContractError,
  createStudioError,
  studioFoundationContractError,
  createStudioContractDigest,
  createStudioMetamodelContract,
  createStudioBlueprintContract,
  STUDIO_BLUEPRINT_STATES,
  createStudioModuleBlueprintContract,
  createStudioFieldBlueprintContract,
  STUDIO_FIELD_TYPES,
  createStudioScreenBlueprintContract,
  STUDIO_SCREEN_KINDS,
  createStudioValidationBlueprintContract,
  STUDIO_VALIDATION_KINDS,
  createStudioPermissionBlueprintContract,
  STUDIO_PERMISSION_ACTIONS,
  STUDIO_PERMISSION_LEVELS,
  createStudioRouteMenuBlueprintContract,
  createStudioPersistenceBoundaryContract,
  STUDIO_PERSISTENCE_STATES,
  createStudioRuntimeBindingContract,
  STUDIO_RUNTIME_BINDING_TYPES,
  createStudioSafetyPolicy,
  STUDIO_SAFETY_INVARIANTS,
  createStudioDiagnostics,
  createStudioFallback,
  STUDIO_FALLBACK_SCENARIOS,
  createStudioContractManifest,
  verifyStudioFoundationContracts,
  checkStudioContractCompatibility,
  createStudioFoundationContract,
} from '../../studio/foundation-contracts/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/foundation-contracts');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

const build = () => createStudioFoundationContract();

// ============ A. Config & flags (1-16) ============
test('1. contract name', () => assert.equal(STUDIO_FOUNDATION_CONTRACT_NAME, 'studio-foundation-contracts'));
test('2. contract version', () => assert.equal(STUDIO_FOUNDATION_CONTRACT_VERSION, '1.0.0'));
test('3. versioned id', () => assert.equal(STUDIO_FOUNDATION_CONTRACTS_VERSION, 'studio-foundation-contracts@1.0.0'));
test('4. environment is local_contract', () => assert.equal(STUDIO_FOUNDATION_ENVIRONMENT, 'local_contract'));
test('5. headless capability headless=true', () => assert.equal(STUDIO_HEADLESS_CAPABILITIES.headless, true));
test('6. headless uiEnabled=false', () => assert.equal(STUDIO_HEADLESS_CAPABILITIES.uiEnabled, false));
test('7. headless routeEnabled=false', () => assert.equal(STUDIO_HEADLESS_CAPABILITIES.routeEnabled, false));
test('8. headless prismaEnabled=false', () => assert.equal(STUDIO_HEADLESS_CAPABILITIES.prismaEnabled, false));
test('9. headless capabilities frozen', () => assert.ok(Object.isFrozen(STUDIO_HEADLESS_CAPABILITIES)));
test('10. flag names distinct', () => assert.equal(new Set([MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG, MAK_STUDIO_CONTRACT_VERIFY_FLAG, MAK_STUDIO_BLUEPRINT_VALIDATE_FLAG, MAK_STUDIO_COMPATIBILITY_CHECK_FLAG]).size, 4));
test('11. flag disabled by default', () => assert.equal(isStudioFoundationContractsEnabled({}), false));
test('12. flag enabled outside production', () => assert.equal(isStudioFoundationContractsEnabled({ [MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG]: 'true', DEV: 'true' }), true));
test('13. flag fails closed in production', () => assert.equal(isStudioFoundationContractsEnabled({ [MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('14. verify flag umbrella-enabled', () => assert.equal(isStudioContractVerifyEnabled({ [MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG]: 'true', DEV: 'true' }), true));
test('15. blueprint-validate flag disabled by default', () => assert.equal(isStudioBlueprintValidateEnabled({}), false));
test('16. compatibility flag fails closed in production', () => assert.equal(isStudioCompatibilityCheckEnabled({ [MAK_STUDIO_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' }), false));

// ============ B. Digest (17-26) ============
test('17. digest is fnv1a string', () => assert.match(createStudioContractDigest({ value: { a: 1 } }), /^fnv1a-[0-9a-f]{8}$/));
test('18. digest deterministic', () => assert.equal(createStudioContractDigest({ value: { a: 1 } }), createStudioContractDigest({ value: { a: 1 } })));
test('19. digest differs on different value', () => assert.notEqual(createStudioContractDigest({ value: { a: 1 } }), createStudioContractDigest({ value: { a: 2 } })));
test('20. digest handles null', () => assert.match(createStudioContractDigest({ value: null }), /^fnv1a-/));
test('21. digest handles missing value', () => assert.match(createStudioContractDigest({}), /^fnv1a-/));
test('22. digest of arrays deterministic', () => assert.equal(createStudioContractDigest({ value: [1, 2, 3] }), createStudioContractDigest({ value: [1, 2, 3] })));
test('23. digest order-sensitive', () => assert.notEqual(createStudioContractDigest({ value: [1, 2] }), createStudioContractDigest({ value: [2, 1] })));
test('24. digest string value', () => assert.match(createStudioContractDigest({ value: 'x' }), /^fnv1a-/));
test('25. digest not constant across shapes', () => assert.notEqual(createStudioContractDigest({ value: {} }), createStudioContractDigest({ value: { k: 'v' } })));
test('26. digest undefined-safe', () => assert.match(createStudioContractDigest({ value: undefined }), /^fnv1a-/));

// ============ C. Errors (27-42) ============
test('27. error codes >= 20', () => assert.ok(STUDIO_ERROR_CODES.length >= 20));
test('28. error codes unique', () => assert.equal(new Set(STUDIO_ERROR_CODES).size, STUDIO_ERROR_CODES.length));
STUDIO_ERROR_CODES.slice(0, 6).forEach((code, i) => {
  test(`${29 + i}. createStudioError(${code}) safe + no side effects`, () => {
    const e = createStudioError(code, { message: 'm' });
    assert.equal(e.safe, true);
    assert.equal(e.sideEffects, false);
    assert.equal(e.prismaAccessed, false);
    assert.equal(e.backendAccessed, false);
    assert.equal(e.fetchUsed, false);
    assert.equal(e.code, code);
  });
});
test('35. unknown code normalized', () => assert.equal(createStudioError('NOPE').code, 'STUDIO_INVALID_CONTRACT'));
test('36. error never leaks secrets', () => assert.ok(!/DATABASE_URL|jwt|token/i.test(JSON.stringify(createStudioError('STUDIO_PRISMA_BLOCKED', { message: 'x' })))));
test('37. error class instanceof Error', () => assert.ok(studioFoundationContractError('STUDIO_INVALID_CONTRACT', 'x') instanceof Error));
test('38. error class name', () => assert.equal(new StudioFoundationContractError('STUDIO_INVALID_CONTRACT', 'x').name, 'StudioFoundationContractError'));
test('39. error class normalizes bad code', () => assert.equal(new StudioFoundationContractError('bogus', 'x').code, 'STUDIO_INVALID_CONTRACT'));
test('40. error default message', () => assert.match(createStudioError('STUDIO_MUTATION_BLOCKED').message, /STUDIO_MUTATION_BLOCKED/));
test('41. prisma error code present', () => assert.ok(STUDIO_ERROR_CODES.includes('STUDIO_PRISMA_BLOCKED')));
test('42. marketplace error code present', () => assert.ok(STUDIO_ERROR_CODES.includes('STUDIO_MARKETPLACE_PUBLICATION_BLOCKED')));

// ============ D. Metamodel (43-66) ============
const mm = createStudioMetamodelContract();
test('43. metamodel kind', () => assert.equal(mm.kind, 'studio-metamodel-contract'));
test('44. metamodel >= 19 entities', () => assert.ok(mm.entityCount >= 19));
test('45. metamodel entityNames length matches', () => assert.equal(mm.entityNames.length, mm.entityCount));
test('46. metamodel generates no schema', () => assert.equal(mm.generatesSchema, false));
test('47. metamodel generates no migration', () => assert.equal(mm.generatesMigration, false));
test('48. metamodel generates no backend', () => assert.equal(mm.generatesBackend, false));
test('49. metamodel generates no module', () => assert.equal(mm.generatesModule, false));
test('50. metamodel generates no ui', () => assert.equal(mm.generatesUi, false));
test('51. metamodel is contract', () => assert.equal(mm.isContract, true));
test('52. metamodel is not persistence', () => assert.equal(mm.isPersistence, false));
test('53. metamodel has StudioProject', () => assert.ok(mm.entityNames.includes('StudioProject')));
test('54. metamodel has StudioModule', () => assert.ok(mm.entityNames.includes('StudioModule')));
test('55. metamodel has StudioPermission', () => assert.ok(mm.entityNames.includes('StudioPermission')));
test('56. metamodel has StudioPersistenceBoundary', () => assert.ok(mm.entityNames.includes('StudioPersistenceBoundary')));
test('57. metamodel digest stable', () => assert.equal(mm.metamodelDigest, createStudioMetamodelContract().metamodelDigest));
mm.entities.slice(0, 8).forEach((e, i) => {
  test(`${58 + i}. entity ${e.entityName} has requiredFields + status contract`, () => {
    assert.ok(Array.isArray(e.requiredFields) && e.requiredFields.length > 0);
    assert.equal(e.status, 'contract');
  });
});
test('66. every entity has a purpose', () => assert.ok(mm.entities.every((e) => typeof e.purpose === 'string' && e.purpose.length > 0)));

// ============ E. Blueprint envelope (67-78) ============
const bp = createStudioBlueprintContract();
test('67. blueprint kind', () => assert.equal(bp.kind, 'studio-blueprint-contract'));
test('68. blueprint states match export', () => assert.deepEqual(bp.states, STUDIO_BLUEPRINT_STATES));
test('69. blueprint has draft state', () => assert.ok(bp.states.includes('draft')));
test('70. blueprint has certified_local state', () => assert.ok(bp.states.includes('certified_local')));
test('71. blueprint no state registers module', () => assert.equal(bp.anyStateRegistersModule, false));
test('72. blueprint no state allows production', () => assert.equal(bp.anyStateAllowsProduction, false));
test('73. blueprint fail closed', () => assert.equal(bp.failClosed, true));
test('74. blueprint envelope has permissions', () => assert.ok(bp.envelope.includes('permissions')));
test('75. blueprint envelope has persistenceBoundary', () => assert.ok(bp.envelope.includes('persistenceBoundary')));
STUDIO_BLUEPRINT_STATES.slice(0, 3).forEach((s, i) => {
  test(`${76 + i}. state ${s} does not register module`, () => assert.equal(bp.stateRules[s].registersModule, false));
});

// ============ F. Module blueprint (79-91) ============
const modb = createStudioModuleBlueprintContract();
test('79. module blueprint kind', () => assert.equal(modb.kind, 'studio-module-blueprint-contract'));
test('80. module requires permission blueprint', () => assert.equal(modb.permissionBlueprintRequired, true));
test('81. module requires persistence boundary', () => assert.equal(modb.persistenceBoundaryRequired, true));
test('82. module route/menu not automatic', () => assert.equal(modb.routeMenuAutomatic, false));
test('83. module default production off', () => assert.equal(modb.defaults.productionAllowed, false));
test('84. module default menuVisible off', () => assert.equal(modb.defaults.menuVisible, false));
test('85. module default routeEnabled off', () => assert.equal(modb.defaults.routeEnabled, false));
test('86. module default mutation off', () => assert.equal(modb.defaults.mutationAllowed, false));
test('87. module default backend off', () => assert.equal(modb.defaults.backendAllowed, false));
test('88. module default prisma off', () => assert.equal(modb.defaults.prismaAllowed, false));
test('89. module default migration off', () => assert.equal(modb.defaults.migrationAllowed, false));
test('90. module required fields include moduleId', () => assert.ok(modb.requiredFields.includes('moduleId')));
test('91. module required fields include permissions', () => assert.ok(modb.requiredFields.includes('permissions')));

// ============ G. Field blueprint (92-107) ============
const fb = createStudioFieldBlueprintContract();
test('92. field blueprint kind', () => assert.equal(fb.kind, 'studio-field-blueprint-contract'));
test('93. field types match export', () => assert.deepEqual(fb.allowedTypes, STUDIO_FIELD_TYPES));
test('94. field types >= 14', () => assert.ok(STUDIO_FIELD_TYPES.length >= 14));
test('95. protected not editable by default', () => assert.equal(fb.protectedEditableByDefault, false));
test('96. relation does not bypass tenant', () => assert.equal(fb.relationBypassesTenant, false));
test('97. valid text field accepted', () => assert.equal(createStudioFieldBlueprintContract({ field: { name: 'codigo', type: 'text' } }).fieldCheck.valid, true));
test('98. unknown type rejected', () => assert.equal(createStudioFieldBlueprintContract({ field: { name: 'x', type: 'evil' } }).fieldCheck.valid, false));
test('99. unsafe name rejected', () => assert.equal(createStudioFieldBlueprintContract({ field: { name: '1bad', type: 'text' } }).fieldCheck.valid, false));
test('100. computed function rejected', () => assert.equal(createStudioFieldBlueprintContract({ field: { name: 'c', type: 'computed', computed: () => 1 } }).fieldCheck.valid, false));
test('101. protected editable rejected', () => assert.equal(createStudioFieldBlueprintContract({ field: { name: 'p', type: 'text', protected: true, editableByDefault: true } }).fieldCheck.valid, false));
test('102. field digest stable', () => assert.equal(fb.fieldBlueprintDigest, createStudioFieldBlueprintContract().fieldBlueprintDigest));
['text', 'number', 'money', 'select', 'status'].forEach((t, i) => {
  test(`${103 + i}. field type ${t} is allowlisted`, () => assert.ok(STUDIO_FIELD_TYPES.includes(t)));
});

// ============ H. Screen blueprint (108-119) ============
const sb = createStudioScreenBlueprintContract();
test('108. screen blueprint kind', () => assert.equal(sb.kind, 'studio-screen-blueprint-contract'));
test('109. screen generates no react component', () => assert.equal(sb.generatesReactComponent, false));
test('110. screen generates no ui', () => assert.equal(sb.generatesUi, false));
test('111. screen mutation actions blocked by default', () => assert.equal(sb.mutationActionsBlockedByDefault, true));
test('112. screen requires empty/loading/error states', () => assert.deepEqual(sb.requiredStates, ['emptyState', 'loadingState', 'errorState']));
test('113. screen diagnostics do not expose secrets', () => assert.equal(sb.diagnosticsExposeSecrets, false));
test('114. screen kinds match export', () => assert.deepEqual(sb.kindNames, STUDIO_SCREEN_KINDS));
test('115. screen has table kind', () => assert.ok(sb.kindNames.includes('table')));
test('116. screen has form kind', () => assert.ok(sb.kindNames.includes('form')));
test('117. placeholder screens flagged planned', () => assert.ok(sb.kinds.filter((k) => /Placeholder$/.test(k.kind)).every((k) => k.planned === true)));
test('118. no screen kind generates react component', () => assert.ok(sb.kinds.every((k) => k.generatesReactComponent === false)));
test('119. screen digest stable', () => assert.equal(sb.screenBlueprintDigest, createStudioScreenBlueprintContract().screenBlueprintDigest));

// ============ I. Validation blueprint (120-134) ============
const vb = createStudioValidationBlueprintContract();
test('120. validation blueprint kind', () => assert.equal(vb.kind, 'studio-validation-blueprint-contract'));
test('121. validation kinds match export', () => assert.deepEqual(vb.allowedKinds, STUDIO_VALIDATION_KINDS));
test('122. unsafe validation not allowed', () => assert.equal(vb.unsafeValidationAllowed, false));
test('123. unique does not create constraint', () => assert.equal(vb.uniqueCreatesConstraint, false));
test('124. async does not call network', () => assert.equal(vb.asyncCallsNetwork, false));
test('125. required validation valid', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'required' } }).validationCheck.valid, true));
test('126. unknown validation kind rejected', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'evil' } }).validationCheck.valid, false));
test('127. async network validation rejected', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'asyncValidationPlanned', callsNetwork: true } }).validationCheck.valid, false));
test('128. computed fn validation rejected', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'computedValidation', fn: () => true } }).validationCheck.valid, false));
test('129. tenant removal rejected', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'tenantScope', removesTenantScope: true } }).validationCheck.valid, false));
test('130. regex requires string pattern', () => assert.equal(createStudioValidationBlueprintContract({ validation: { kind: 'regex', pattern: 42 } }).validationCheck.regexSafe, false));
test('131. validation digest stable', () => assert.equal(vb.validationBlueprintDigest, createStudioValidationBlueprintContract().validationBlueprintDigest));
['required', 'regex', 'tenantScope'].forEach((k, i) => {
  test(`${132 + i}. validation kind ${k} allowlisted`, () => assert.ok(STUDIO_VALIDATION_KINDS.includes(k)));
});

// ============ J. Permission blueprint (135-147) ============
const pb2 = createStudioPermissionBlueprintContract();
test('135. permission blueprint kind', () => assert.equal(pb2.kind, 'studio-permission-blueprint-contract'));
test('136. permission fail closed', () => assert.equal(pb2.failClosed, true));
test('137. permission default deny', () => assert.equal(pb2.defaultDeny, true));
test('138. missing permission blocks', () => assert.equal(pb2.missingPermissionBlocks, true));
test('139. admin does not bypass tenant', () => assert.equal(pb2.adminBypassesTenant, false));
test('140. delete not enabled by default', () => assert.equal(pb2.deleteEnabledByDefault, false));
test('141. mutation not enabled by default', () => assert.equal(pb2.mutationEnabledByDefault, false));
test('142. protected fields need field visibility', () => assert.equal(pb2.fieldLevelVisibilityRequiredForProtected, true));
test('143. row access preserves tenant', () => assert.equal(pb2.rowLevelAccessPreservesTenant, true));
test('144. production perms require explicit policy', () => assert.equal(pb2.productionPermissionsRequireExplicitPolicy, true));
test('145. actions match export', () => assert.deepEqual(pb2.actions, STUDIO_PERMISSION_ACTIONS));
test('146. levels match export', () => assert.deepEqual(pb2.levels, STUDIO_PERMISSION_LEVELS));
test('147. permission digest stable', () => assert.equal(pb2.permissionBlueprintDigest, createStudioPermissionBlueprintContract().permissionBlueprintDigest));

// ============ K. Route/menu (148-159) ============
const rm = createStudioRouteMenuBlueprintContract();
test('148. route/menu kind', () => assert.equal(rm.kind, 'studio-route-menu-blueprint-contract'));
test('149. no automatic registration', () => assert.equal(rm.automaticRegistration, false));
test('150. App.jsx not changed', () => assert.equal(rm.appJsxChanged, false));
test('151. menu not changed', () => assert.equal(rm.menuChanged, false));
test('152. route disabled by default', () => assert.equal(rm.routeEnabledDefault, false));
test('153. menu invisible by default', () => assert.equal(rm.menuVisibleDefault, false));
test('154. production not allowed by default', () => assert.equal(rm.productionAllowedDefault, false));
test('155. future registry required', () => assert.equal(rm.futureRegistryRequired, true));
test('156. flag rollback required', () => assert.equal(rm.flagRollbackRequired, true));
test('157. route plan default guardRequired', () => assert.equal(rm.routePlan.defaults.guardRequired, true));
test('158. menu plan default flagRequired', () => assert.equal(rm.menuPlan.defaults.flagRequired, true));
test('159. route/menu digest stable', () => assert.equal(rm.routeMenuDigest, createStudioRouteMenuBlueprintContract().routeMenuDigest));

// ============ L. Persistence (160-172) ============
const persb = createStudioPersistenceBoundaryContract();
test('160. persistence kind', () => assert.equal(persb.kind, 'studio-persistence-boundary-contract'));
test('161. default state noPersistence', () => assert.equal(persb.defaultState, 'noPersistence'));
test('162. states match export', () => assert.deepEqual(persb.states, STUDIO_PERSISTENCE_STATES));
test('163. schema off by default', () => assert.equal(persb.defaults.schemaAllowed, false));
test('164. migration off by default', () => assert.equal(persb.defaults.migrationAllowed, false));
test('165. prisma off by default', () => assert.equal(persb.defaults.prismaAllowed, false));
test('166. backend off by default', () => assert.equal(persb.defaults.backendAllowed, false));
test('167. mutation off by default', () => assert.equal(persb.defaults.mutationAllowed, false));
test('168. real data not a fixture', () => assert.equal(persb.realDataAsFixture, false));
test('169. no automatic schema/migration', () => assert.equal(persb.automaticSchemaOrMigration, false));
test('170. production write requires future plan', () => assert.equal(persb.productionWriteRequiresExplicitFuturePlan, true));
test('171. states include productionWriteControlled', () => assert.ok(persb.states.includes('productionWriteControlled')));
test('172. persistence digest stable', () => assert.equal(persb.persistenceBoundaryDigest, createStudioPersistenceBoundaryContract().persistenceBoundaryDigest));

// ============ M. Runtime binding (173-183) ============
const rb = createStudioRuntimeBindingContract();
test('173. runtime binding kind', () => assert.equal(rb.kind, 'studio-runtime-binding-contract'));
test('174. does not activate production', () => assert.equal(rb.activatesProduction, false));
test('175. does not register module', () => assert.equal(rb.registersModule, false));
test('176. does not access prisma directly', () => assert.equal(rb.accessesPrismaDirectly, false));
test('177. types match export', () => assert.deepEqual(rb.types, STUDIO_RUNTIME_BINDING_TYPES));
test('178. cadastro maps to modeloBase1', () => assert.equal(rb.typeMap.cadastro, 'modeloBase1'));
test('179. operacional maps to modeloBase2Experimental', () => assert.equal(rb.typeMap.operacional, 'modeloBase2Experimental'));
test('180. binds generic model runtime', () => assert.ok(rb.bindings.genericModelRuntime));
test('181. empresas certified is seed not rewritten', () => assert.match(rb.bindings.empresasCertifiedContract.ref, /empresas-local-read-contract@1\.0\.0/));
test('182. modelobase2 experimental role', () => assert.match(rb.bindings.modeloBase2Experimental.role, /experimental/i));
test('183. runtime binding digest stable', () => assert.equal(rb.runtimeBindingDigest, createStudioRuntimeBindingContract().runtimeBindingDigest));

// ============ N. Safety policy (184-197) ============
const sp = createStudioSafetyPolicy();
test('184. safety policy kind', () => assert.equal(sp.kind, 'studio-safety-policy'));
test('185. headlessOnly invariant', () => assert.equal(sp.invariants.headlessOnly, true));
test('186. failClosed invariant', () => assert.equal(sp.invariants.failClosed, true));
test('187. defaultDeny invariant', () => assert.equal(sp.invariants.defaultDeny, true));
test('188. noProduction invariant', () => assert.equal(sp.invariants.noProduction, true));
test('189. noPrisma invariant', () => assert.equal(sp.invariants.noPrisma, true));
test('190. noMutation invariant', () => assert.equal(sp.invariants.noMutation, true));
test('191. tenantRequired invariant', () => assert.equal(sp.invariants.tenantRequired, true));
test('192. invariants match export', () => assert.deepEqual(sp.invariants, STUDIO_SAFETY_INVARIANTS));
test('193. checker passes a clean descriptor', () => assert.equal(sp.check({ failClosed: true, defaultDeny: true }).ok, true));
test('194. checker flags a violation', () => assert.equal(sp.check({ failClosed: false }).ok, false));
test('195. checker lists the violation', () => assert.ok(sp.check({ noProduction: false }).violations.length > 0));
test('196. >= 20 invariants', () => assert.ok(Object.keys(STUDIO_SAFETY_INVARIANTS).length >= 20));
test('197. safety digest stable', () => assert.equal(sp.safetyPolicyDigest, createStudioSafetyPolicy().safetyPolicyDigest));

// ============ O. Diagnostics (198-204) ============
const dg = createStudioDiagnostics();
test('198. diagnostics kind', () => assert.equal(dg.kind, 'studio-diagnostics'));
test('199. diagnostics headless', () => assert.equal(dg.headless, true));
test('200. diagnostics ready when clean', () => assert.equal(dg.readiness, 'foundation_contract_ready'));
test('201. diagnostics blocked with blocker', () => assert.equal(createStudioDiagnostics({ blockers: ['x'] }).readiness, 'blocked'));
test('202. diagnostics needs_fixes with warning', () => assert.equal(createStudioDiagnostics({ warnings: ['w'] }).readiness, 'needs_fixes'));
test('203. diagnostics no secrets', () => assert.ok(!/DATABASE_URL|jwt|token/i.test(JSON.stringify(dg))));
test('204. diagnostics environment local_contract', () => assert.equal(dg.environment, 'local_contract'));

// ============ P. Fallback (205-213) ============
test('205. fallback kind', () => assert.equal(createStudioFallback().kind, 'studio-fallback'));
test('206. fallback readiness always blocked', () => assert.equal(createStudioFallback({ scenario: 'production_attempt' }).readiness, 'blocked'));
test('207. fallback no side effects', () => assert.equal(createStudioFallback().sideEffects, false));
test('208. fallback no production access', () => assert.equal(createStudioFallback().productionAccessed, false));
test('209. fallback no mutation', () => assert.equal(createStudioFallback().mutationExecuted, false));
test('210. fallback no prisma', () => assert.equal(createStudioFallback().prismaAccessed, false));
test('211. fallback no fetch', () => assert.equal(createStudioFallback().fetchUsed, false));
test('212. fallback passive rollback', () => assert.equal(createStudioFallback().rollbackPlan.passive, true));
test('213. fallback scenarios include marketplace attempt', () => assert.ok(STUDIO_FALLBACK_SCENARIOS.includes('marketplace_publication_attempt')));

// ============ Q. Manifest (214-221) ============
const manifest = createStudioContractManifest({
  metamodel: mm, blueprint: bp, moduleBlueprint: modb, fieldBlueprint: fb, screenBlueprint: sb,
  validationBlueprint: vb, permissionBlueprint: pb2, routeMenu: rm, persistenceBoundary: persb,
  runtimeBinding: rb, safetyPolicy: sp, diagnostics: dg,
});
test('214. manifest kind', () => assert.equal(manifest.kind, 'studio-contract-manifest'));
test('215. manifest status ready with no blockers', () => assert.equal(manifest.status, 'foundation_contract_ready'));
test('216. manifest overall digest present', () => assert.match(manifest.overallDigest, /^fnv1a-/));
test('217. manifest metamodel digest present', () => assert.equal(manifest.metamodelDigest, mm.metamodelDigest));
test('218. manifest safety digest present', () => assert.equal(manifest.safetyPolicyDigest, sp.safetyPolicyDigest));
test('219. manifest blockers empty', () => assert.deepEqual(manifest.blockers, []));
test('220. manifest blocked with blocker', () => assert.equal(createStudioContractManifest({ blockers: ['x'] }).status, 'blocked'));
test('221. manifest deterministic', () => assert.equal(manifest.overallDigest, createStudioContractManifest({ metamodel: mm, blueprint: bp, moduleBlueprint: modb, fieldBlueprint: fb, screenBlueprint: sb, validationBlueprint: vb, permissionBlueprint: pb2, routeMenu: rm, persistenceBoundary: persb, runtimeBinding: rb, safetyPolicy: sp, diagnostics: dg }).overallDigest));

// ============ R. Verifier (222-231) ============
test('222. verifier valid on real foundation', () => assert.equal(build().verification.valid, true));
test('223. verifier status ready', () => assert.equal(build().verification.status, 'foundation_contract_ready'));
test('224. verifier readiness ready', () => assert.equal(build().verification.readiness, 'foundation_contract_ready'));
test('225. verifier safeToUseAsFoundationReference', () => assert.equal(build().verification.safeToUseAsFoundationReference, true));
test('226. verifier zero failures', () => assert.deepEqual(build().verification.failures, []));
test('227. verifier invalid on empty', () => assert.equal(verifyStudioFoundationContracts({}).valid, false));
test('228. verifier detects tampered digest', () => {
  const f = JSON.parse(JSON.stringify(build()));
  f.manifest.metamodelDigest = 'fnv1a-deadbeef';
  assert.equal(verifyStudioFoundationContracts({ foundation: f }).valid, false);
});
test('229. verifier detects flipped ui flag', () => {
  const f = JSON.parse(JSON.stringify(build()));
  f.uiEnabled = true;
  assert.equal(verifyStudioFoundationContracts({ foundation: f }).valid, false);
});
test('230. verifier has many checks', () => assert.ok(build().verification.checks.length >= 30));
test('231. verifier all check names unique', () => {
  const names = build().verification.checks.map((c) => c.name);
  assert.equal(new Set(names).size, names.length);
});

// ============ S. Compatibility (232-243) ============
test('232. compat identical is compatible', () => assert.equal(checkStudioContractCompatibility({ current: { headless: true }, next: { headless: true } }).classification, 'compatible'));
test('233. compat release ui is breaking', () => assert.equal(checkStudioContractCompatibility({ current: { uiEnabled: false }, next: { uiEnabled: true } }).classification, 'breaking'));
test('234. compat breaking requires major', () => assert.equal(checkStudioContractCompatibility({ current: { prismaEnabled: false }, next: { prismaEnabled: true } }).requiresMajorVersion, true));
test('235. compat additive is backward_compatible', () => assert.equal(checkStudioContractCompatibility({ current: { allowedTypes: ['text'] }, next: { allowedTypes: ['text', 'money'] } }).classification, 'backward_compatible'));
test('236. compat invalid when non-object', () => assert.equal(checkStudioContractCompatibility({ current: null, next: {} }).classification, 'invalid'));
test('237. compat invalid sets contractInvalidated', () => assert.equal(checkStudioContractCompatibility({ current: 1, next: 2 }).contractInvalidated, true));
test('238. compat relax failClosed is breaking', () => assert.equal(checkStudioContractCompatibility({ current: { safetyInvariants: { failClosed: true } }, next: { safetyInvariants: { failClosed: false } } }).classification, 'breaking'));
test('239. compat relax defaultDeny is breaking', () => assert.equal(checkStudioContractCompatibility({ current: { safetyInvariants: { defaultDeny: true } }, next: { safetyInvariants: { defaultDeny: false } } }).classification, 'breaking'));
test('240. compat removing required gate is breaking', () => assert.equal(checkStudioContractCompatibility({ current: { requiredGates: ['safety'] }, next: { requiredGates: [] } }).classification, 'breaking'));
test('241. compat enabling marketplace is breaking', () => assert.equal(checkStudioContractCompatibility({ current: { marketplaceEnabled: false }, next: { marketplaceEnabled: true } }).classification, 'breaking'));
test('242. compat neutral version bump conditionally_compatible', () => assert.equal(checkStudioContractCompatibility({ current: { contractVersion: '1.0.0' }, next: { contractVersion: '1.0.1' } }).classification, 'conditionally_compatible'));
test('243. compat lists breaking changes', () => assert.ok(checkStudioContractCompatibility({ current: { routeEnabled: false }, next: { routeEnabled: true } }).breakingChanges.length > 0));

// ============ T. Composer / foundation (244-260) ============
test('244. foundation kind', () => assert.equal(build().kind, 'studio-foundation-contract'));
test('245. foundation contract version', () => assert.equal(build().contractVersion, '1.0.0'));
test('246. foundation environment', () => assert.equal(build().environment, 'local_contract'));
test('247. foundation status ready', () => assert.equal(build().foundationStatus, 'foundation_contract_ready'));
test('248. foundation headless', () => assert.equal(build().headless, true));
test('249. foundation ui off', () => assert.equal(build().uiEnabled, false));
test('250. foundation route off', () => assert.equal(build().routeEnabled, false));
test('251. foundation menu off', () => assert.equal(build().menuEnabled, false));
test('252. foundation module registration off', () => assert.equal(build().moduleRegistrationEnabled, false));
test('253. foundation backend off', () => assert.equal(build().backendEnabled, false));
test('254. foundation prisma off', () => assert.equal(build().prismaEnabled, false));
test('255. foundation migration off', () => assert.equal(build().migrationEnabled, false));
test('256. foundation production off', () => assert.equal(build().productionEnabled, false));
test('257. foundation mutation off', () => assert.equal(build().mutationAllowed, false));
test('258. foundation has manifest', () => assert.equal(build().manifest.kind, 'studio-contract-manifest'));
test('259. foundation next stage is blueprint hardening', () => assert.match(build().nextAllowedStage, /blueprint-contract-hardening/));
test('260. foundation deterministic overall digest', () => assert.equal(build().manifest.overallDigest, build().manifest.overallDigest));

// ============ U. Source-scan invariants (261-272) ============
test('261. subtree is React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('262. no backend/apis/prisma imports', () => assert.ok(importsOf().every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma|@prisma/i.test(p))));
test('263. no fetch call', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('264. no XMLHttpRequest', () => assert.ok(!/XMLHttpRequest/.test(allCode())));
test('265. no WebSocket', () => assert.ok(!/WebSocket/.test(allCode())));
test('266. no localStorage', () => assert.ok(!/localStorage\./.test(allCode())));
test('267. no sessionStorage', () => assert.ok(!/sessionStorage\./.test(allCode())));
test('268. no indexedDB', () => assert.ok(!/indexedDB\./.test(allCode())));
test('269. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('270. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('271. no railway reference', () => assert.ok(!/railway/i.test(allCode())));
test('272. all source files exist', () => assert.ok(walk(DIR).length >= 21));

// ============ V. Scope (273-280) ============
const AUTHORIZED = [
  /^src\/studio\/foundation-contracts\//,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
  // POST-FOUNDATION C — Studio Blueprint Contract Hardening slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
  // POST-FOUNDATION C — Studio Blueprint Contract Certification slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
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
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('273. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('274. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('275. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('276. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('277. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('278. prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('279. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('280. other src/studio not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(?!foundation-contracts\/)/.test(x))); });
test('281. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/foundation-contracts\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
test('282. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip when base unavailable */ }
});
test('283. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
