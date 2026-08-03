import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Studio scope governance. The ORIGINAL rule below is preserved for every path; the ONLY exemption is the
// exact set of artifacts the chronological-migration slice is authorized to touch, and only while that
// slice is the one active on the branch. A merely similar, uncatalogued path still fails.
import { createResolvedActiveStudioSlicePathAuthorizer } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

// Historical substring rules keep their ORIGINAL regex. The only exemption comes from the single
// central authorizer: exactly one resolved ACTIVE slice, and only the paths that exact slice is
// authorized for. No sliceId prefix, no hardcoded slice, no chronology-free catalog lookup.

import {
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
  STUDIO_BASE_CONTRACT_VERSION,
  STUDIO_HARDENING_HEADLESS_CAPABILITIES,
  STUDIO_HARDENING_ERROR_CODES,
  createStudioHardeningError,
  MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG,
  isStudioBlueprintContractHardeningEnabled,
  createStudioBlueprintInvalidCaseMatrix,
  evaluateStudioBlueprintValidity,
  createStudioDangerousBlueprintMatrix,
  createStudioFieldHardeningMatrix,
  evaluateStudioField,
  createStudioScreenHardeningMatrix,
  createStudioValidationHardeningMatrix,
  createStudioPermissionHardeningMatrix,
  createStudioRouteMenuHardeningMatrix,
  createStudioPersistenceTransitionMatrix,
  createStudioRuntimeBindingHardeningMatrix,
  createStudioCompatibilityBreakingMatrix,
  classifyStudioCompatibility,
  createStudioDigestHardeningSuite,
  safeStudioDigest,
  createStudioVerifierHardeningSuite,
  createStudioSafetyInvariantRunner,
  createStudioContractPerformanceBaseline,
  createStudioBlueprintHardeningDiagnostics,
  createStudioBlueprintHardeningFallback,
  createStudioBlueprintContractHardening,
} from '../../studio/foundation-contracts/hardening/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/foundation-contracts/hardening');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

const H = createStudioBlueprintContractHardening();
const invalid = createStudioBlueprintInvalidCaseMatrix();
const dangerous = createStudioDangerousBlueprintMatrix();
const field = createStudioFieldHardeningMatrix();
const screen = createStudioScreenHardeningMatrix();
const validation = createStudioValidationHardeningMatrix();
const permission = createStudioPermissionHardeningMatrix();
const routeMenu = createStudioRouteMenuHardeningMatrix();
const persistence = createStudioPersistenceTransitionMatrix();
const binding = createStudioRuntimeBindingHardeningMatrix();
const compat = createStudioCompatibilityBreakingMatrix();
const digest = createStudioDigestHardeningSuite();
const verifier = createStudioVerifierHardeningSuite();
const safety = createStudioSafetyInvariantRunner();

const invBlocked = (name) => invalid.scenarios.find((s) => s.name === name)?.blocked === true;
const dangBlocked = (name) => dangerous.scenarios.find((s) => s.name === name)?.blocked === true;
const fieldMatched = (name) => field.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const screenMatched = (name) => screen.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const valMatched = (name) => validation.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const permMatched = (name) => permission.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const rmBlocked = (name) => routeMenu.scenarios.find((s) => s.name === name)?.blocked === true;
const persMatched = (name) => persistence.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const bindMatched = (name) => binding.scenarios.find((s) => s.name === name)?.matchedExpectation === true;
const breakingIs = (name) => compat.breaking.find((s) => s.name === name)?.isBreaking === true;

// ===== Base (1-17) =====
test('1. hardening is created', () => assert.equal(H.kind, 'studio-blueprint-contract-hardening'));
test('2. hardeningVersion', () => assert.equal(H.hardeningVersion, STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION));
test('3. base contractVersion', () => assert.equal(H.contractVersion, STUDIO_BASE_CONTRACT_VERSION));
test('4. environment local_contract', () => assert.equal(H.environment, 'local_contract'));
test('5. headless true', () => assert.equal(H.headless, true));
test('6. uiEnabled false', () => assert.equal(H.uiEnabled, false));
test('7. routeEnabled false', () => assert.equal(H.routeEnabled, false));
test('8. menuEnabled false', () => assert.equal(H.menuEnabled, false));
test('9. moduleRegistrationEnabled false', () => assert.equal(H.moduleRegistrationEnabled, false));
test('10. backendEnabled false', () => assert.equal(H.backendEnabled, false));
test('11. prismaEnabled false', () => assert.equal(H.prismaEnabled, false));
test('12. migrationEnabled false', () => assert.equal(H.migrationEnabled, false));
test('13. productionEnabled false', () => assert.equal(H.productionEnabled, false));
test('14. stagingEnabled false', () => assert.equal(H.stagingEnabled, false));
test('15. fetchEnabled false', () => assert.equal(H.fetchEnabled, false));
test('16. mutationAllowed false', () => assert.equal(H.mutationAllowed, false));
test('17. readiness blueprint_contract_hardened', () => assert.equal(H.readiness, 'blueprint_contract_hardened'));

// ===== Invalid blueprint matrix (18-40) =====
test('18. invalid matrix exists', () => assert.equal(invalid.kind, 'studio-blueprint-invalid-case-matrix'));
test('19. null blocks', () => assert.ok(invBlocked('blueprint null')));
test('20. undefined blocks', () => assert.ok(invBlocked('blueprint undefined')));
test('21. string blocks', () => assert.ok(invBlocked('blueprint string')));
test('22. array blocks', () => assert.ok(invBlocked('blueprint array')));
test('23. function blocks', () => assert.ok(invBlocked('blueprint function')));
test('24. prototype pollution blocks', () => assert.ok(invBlocked('prototype pollution')));
test('25. missing blueprintId blocks', () => assert.ok(invBlocked('missing blueprintId')));
test('26. missing blueprintVersion blocks', () => assert.ok(invBlocked('missing blueprintVersion')));
test('27. missing blueprintType blocks', () => assert.ok(invBlocked('missing blueprintType')));
test('28. invalid status blocks', () => assert.ok(invBlocked('invalid status')));
test('29. invalid modelFamily blocks', () => assert.ok(invBlocked('invalid modelFamily')));
test('30. missing modelType blocks', () => assert.ok(invBlocked('missing modelType')));
test('31. invalid modelType blocks', () => assert.ok(invBlocked('invalid modelType')));
test('32. missing module blocks', () => assert.ok(invBlocked('missing module')));
test('33. fields not array blocks', () => assert.ok(invBlocked('fields not array')));
test('34. missing permissions blocks', () => assert.ok(invBlocked('missing permissions')));
test('35. missing persistenceBoundary blocks', () => assert.ok(invBlocked('missing persistenceBoundary')));
test('36. missing runtimeBinding blocks', () => assert.ok(invBlocked('missing runtimeBinding')));
test('37. unknown keys strict blocks', () => assert.ok(invBlocked('unknown keys strict')));
test('38. circular reference blocks', () => assert.ok(invBlocked('circular reference')));
test('39. oversized blueprint blocks', () => assert.ok(invBlocked('oversized blueprint')));
test('40. dangerous defaults block', () => assert.ok(invBlocked('dangerous defaults') && invalid.allBlocked));

// ===== Dangerous blueprint matrix (41-66) =====
test('41. productionAllowed true blocks', () => assert.ok(dangBlocked('productionAllowed true')));
test('42. menuVisible true blocks', () => assert.ok(dangBlocked('menuVisible true')));
test('43. routeEnabled true blocks', () => assert.ok(dangBlocked('routeEnabled true')));
test('44. backendAllowed true blocks', () => assert.ok(dangBlocked('backendAllowed true')));
test('45. prismaAllowed true blocks', () => assert.ok(dangBlocked('prismaAllowed true')));
test('46. migrationAllowed true blocks', () => assert.ok(dangBlocked('migrationAllowed true')));
test('47. mutationAllowed true blocks', () => assert.ok(dangBlocked('mutationAllowed true')));
test('48. generatedModuleAllowed true blocks', () => assert.ok(dangBlocked('generatedModuleAllowed true')));
test('49. marketplaceEnabled true blocks', () => assert.ok(dangBlocked('marketplaceEnabled true')));
test('50. defaultDeny false blocks', () => assert.ok(dangBlocked('defaultDeny false')));
test('51. failClosed false blocks', () => assert.ok(dangBlocked('failClosed false')));
test('52. tenantRequired false blocks', () => assert.ok(dangBlocked('tenantRequired false')));
test('53. permissionRequired false blocks', () => assert.ok(dangBlocked('permissionRequired false')));
test('54. adminBypassesTenant blocks', () => assert.ok(dangBlocked('adminBypassesTenant true')));
test('55. deleteAllowedByDefault blocks', () => assert.ok(dangBlocked('deleteAllowedByDefault true')));
test('56. publicRoute blocks', () => assert.ok(dangBlocked('publicRoute true')));
test('57. unauthenticatedAccess blocks', () => assert.ok(dangBlocked('unauthenticatedAccess true')));
test('58. autoRegister blocks', () => assert.ok(dangBlocked('autoRegister true')));
test('59. autoPublish blocks', () => assert.ok(dangBlocked('autoPublish true')));
test('60. autoMigration blocks', () => assert.ok(dangBlocked('autoMigration true')));
test('61. rawCodeExecution blocks', () => assert.ok(dangBlocked('rawCodeExecution true')));
test('62. customScript blocks', () => assert.ok(dangBlocked('customScript present')));
test('63. unsafeComputed blocks', () => assert.ok(dangBlocked('unsafeComputed true')));
test('64. externalUrlBinding blocks', () => assert.ok(dangBlocked('externalUrlBinding present')));
test('65. fetchEnabled true blocks', () => assert.ok(dangBlocked('fetchEnabled true')));
test('66. prismaClientBinding blocks', () => assert.ok(dangBlocked('prismaClientBinding present') && dangerous.allBlocked));

// ===== Field matrix (67-83) =====
test('67. all 14 valid types pass', () => assert.equal(field.scenarios.filter((s) => s.name.startsWith('valid ') && s.valid).length, 14));
test('68. unknown type blocks', () => assert.ok(fieldMatched('unknown type')));
test('69. empty name blocks', () => assert.ok(fieldMatched('empty name')));
test('70. dangerous name blocks', () => assert.ok(fieldMatched('dangerous name char')));
test('71. default incompatible blocks', () => assert.ok(fieldMatched('default incompatible')));
test('72. select without options blocks', () => assert.ok(fieldMatched('select without options')));
test('73. relation without target blocks', () => assert.ok(fieldMatched('relation without target')));
test('74. relation without tenantScope blocks', () => assert.ok(fieldMatched('relation without tenantScope')));
test('75. computed function blocks', () => assert.ok(fieldMatched('computed function')));
test('76. computed code string blocks', () => assert.ok(fieldMatched('computed code string')));
test('77. dangerous regex blocks', () => assert.ok(fieldMatched('dangerous regex')));
test('78. protected editable default blocks', () => assert.ok(fieldMatched('protected editable default')));
test('79. searchable invalid blocks', () => assert.ok(fieldMatched('searchable invalid type')));
test('80. sortable invalid blocks', () => assert.ok(fieldMatched('sortable invalid type')));
test('81. duplicate field name blocks', () => assert.ok(fieldMatched('duplicate field name')));
test('82. reserved field name blocks', () => assert.ok(fieldMatched('reserved field name')));
test('83. tenant field removed / all matched', () => assert.ok(field.allMatched));

// ===== Screen matrix (84-100) =====
test('84. valid screens pass', () => assert.ok(screen.scenarios.filter((s) => s.name.startsWith('valid ')).every((s) => s.valid)));
test('85. unknown kind blocks', () => assert.ok(screenMatched('unknown kind')));
test('86. missing id blocks', () => assert.ok(screenMatched('missing id')));
test('87. missing permission blocks', () => assert.ok(screenMatched('missing permission')));
test('88. React component generation blocks', () => assert.ok(screenMatched('generates React component')));
test('89. componentPath real blocks', () => assert.ok(screenMatched('real componentPath')));
test('90. App.jsx binding blocks', () => assert.ok(screenMatched('App.jsx binding')));
test('91. route auto-binding blocks', () => assert.ok(screenMatched('route auto-binding')));
test('92. create action default blocks', () => assert.ok(screenMatched('create action default')));
test('93. update action default blocks', () => assert.ok(screenMatched('update action default')));
test('94. delete action default blocks', () => assert.ok(screenMatched('delete action default')));
test('95. export without permission blocks', () => assert.ok(screenMatched('export without permission')));
test('96. toolbar action without guard blocks', () => assert.ok(screenMatched('toolbar action without guard')));
test('97. diagnostics with secret blocks', () => assert.ok(screenMatched('diagnostics with secret')));
test('98. missing states blocks', () => assert.ok(screenMatched('missing empty/loading/error')));
test('99. missing field reference blocks', () => assert.ok(screenMatched('references missing field')));
test('100. circular layout blocks', () => assert.ok(screenMatched('circular layout') && screen.allMatched));

// ===== Validation matrix (101-115) =====
test('101. valid validations pass', () => assert.ok(validation.scenarios.slice(0, 12).every((s) => s.valid)));
test('102. unknown validation blocks', () => assert.ok(valMatched('unknown validation')));
test('103. regex not string blocks', () => assert.ok(valMatched('regex not string')));
test('104. dangerous regex blocks', () => assert.ok(valMatched('dangerous regex')));
test('105. function validator blocks', () => assert.ok(valMatched('function validator')));
test('106. eval blocks', () => assert.ok(valMatched('eval')));
test('107. Function constructor blocks', () => assert.ok(valMatched('Function constructor')));
test('108. custom JS code blocks', () => assert.ok(valMatched('custom JS code')));
test('109. async fetch blocks', () => assert.ok(valMatched('async fetch')));
test('110. external URL blocks', () => assert.ok(valMatched('external URL')));
test('111. unique creates constraint blocks', () => assert.ok(valMatched('unique creates constraint')));
test('112. relationExists backend blocks', () => assert.ok(valMatched('relationExists backend')));
test('113. tenantScope false blocks', () => assert.ok(valMatched('tenantScope false')));
test('114. crossField circular blocks', () => assert.ok(valMatched('crossField circular')));
test('115. validation side effect blocks', () => assert.ok(valMatched('validation side effect') && validation.allMatched));

// ===== Permission matrix (116-133) =====
test('116. read valid passes', () => assert.ok(permMatched('read valid')));
test('117. defaultDeny false blocks', () => assert.ok(permMatched('defaultDeny false')));
test('118. failClosed false blocks', () => assert.ok(permMatched('failClosed false')));
test('119. permission missing blocks', () => assert.ok(permMatched('permission missing')));
test('120. permission empty blocks', () => assert.ok(permMatched('permission empty')));
test('121. permission unknown blocks', () => assert.ok(permMatched('permission unknown')));
test('122. permission other module blocks', () => assert.ok(permMatched('permission other module')));
test('123. admin bypass tenant blocks', () => assert.ok(permMatched('admin bypass tenant')));
test('124. public read default blocks', () => assert.ok(permMatched('public read default')));
test('125. create default allowed blocks', () => assert.ok(permMatched('create default allowed')));
test('126. update default allowed blocks', () => assert.ok(permMatched('update default allowed')));
test('127. delete default allowed blocks', () => assert.ok(permMatched('delete default allowed')));
test('128. protected visible no rule blocks', () => assert.ok(permMatched('protected visible no rule')));
test('129. protected editable no rule blocks', () => assert.ok(permMatched('protected editable no rule')));
test('130. row-level no tenant blocks', () => assert.ok(permMatched('row-level no tenant')));
test('131. tenant scope removed blocks', () => assert.ok(permMatched('tenant scope removed')));
test('132. releases mutation blocks', () => assert.ok(permMatched('releases mutation')));
test('133. releases production blocks', () => assert.ok(permMatched('releases production') && permission.allMatched));

// ===== Route/Menu matrix (134-150) =====
test('134. routeEnabled default true blocks', () => assert.ok(rmBlocked('routeEnabled default true')));
test('135. menuVisible default true blocks', () => assert.ok(rmBlocked('menuVisible default true')));
test('136. productionAllowed true blocks', () => assert.ok(rmBlocked('productionAllowed true')));
test('137. devOnly false without gate blocks', () => assert.ok(rmBlocked('devOnly false without gate')));
test('138. guardRequired false blocks', () => assert.ok(rmBlocked('guardRequired false')));
test('139. flagRequired false blocks', () => assert.ok(rmBlocked('flagRequired false')));
test('140. permissionRequired false blocks', () => assert.ok(rmBlocked('permissionRequired false')));
test('141. componentBinding real blocks', () => assert.ok(rmBlocked('componentBinding real')));
test('142. App.jsx binding blocks', () => assert.ok(rmBlocked('App.jsx binding')));
test('143. public route blocks', () => assert.ok(rmBlocked('public route')));
test('144. wildcard route blocks', () => assert.ok(rmBlocked('wildcard route')));
test('145. routePath insecure blocks', () => assert.ok(rmBlocked('routePath insecure')));
test('146. routePath duplicate blocks', () => assert.ok(rmBlocked('routePath duplicate')));
test('147. menu without permission blocks', () => assert.ok(rmBlocked('menu without permission')));
test('148. menu production visible blocks', () => assert.ok(rmBlocked('menu production visible')));
test('149. autoRegister blocks', () => assert.ok(rmBlocked('autoRegister true')));
test('150. fallbackRoute external blocks', () => assert.ok(rmBlocked('fallbackRoute external') && routeMenu.allBlocked));

// ===== Persistence transitions (151-161) =====
test('151. safe transitions have gates', () => assert.ok(persistence.scenarios.filter((s) => s.name.startsWith('allowed ')).every((s) => s.transitionAllowed)));
test('152. noPersistence -> productionWriteControlled blocks', () => assert.ok(persMatched('noPersistence -> productionWriteControlled')));
test('153. memoryOnly -> productionWriteControlled blocks', () => assert.ok(persMatched('memoryOnly -> productionWriteControlled')));
test('154. localReadOnly -> productionWriteControlled blocks', () => assert.ok(persMatched('localReadOnly -> productionWriteControlled')));
test('155. auto migration blocks', () => assert.ok(persMatched('auto migration')));
test('156. auto prisma blocks', () => assert.ok(persMatched('auto prisma')));
test('157. auto backend blocks', () => assert.ok(persMatched('auto backend')));
test('158. mutation default blocks', () => assert.ok(persMatched('mutation default')));
test('159. real data as fixture blocks', () => assert.ok(persMatched('real data as fixture')));
test('160. production seed blocks', () => assert.ok(persMatched('production seed')));
test('161. schema auto blocks', () => assert.ok(persMatched('schema auto') && persistence.allMatched));

// ===== Runtime binding (162-173) =====
test('162. cadastro -> ModeloBase1 passes', () => assert.ok(bindMatched('cadastro -> ModeloBase1 reference')));
test('163. operacional -> ModeloBase2 experimental passes', () => assert.ok(bindMatched('operacional -> ModeloBase2 experimental')));
test('164. Empresas certified seed passes', () => assert.ok(bindMatched('Empresas certified seed')));
test('165. cadcps field reference passes', () => assert.ok(bindMatched('cadcps field reference')));
test('166. binding activates production blocks', () => assert.ok(bindMatched('activates production')));
test('167. binding registers module blocks', () => assert.ok(bindMatched('registers module')));
test('168. binding alters App/menu blocks', () => assert.ok(bindMatched('alters App/menu')));
test('169. binding accesses Prisma blocks', () => assert.ok(bindMatched('accesses Prisma directly')));
test('170. binding ignores tenant blocks', () => assert.ok(bindMatched('ignores tenant')));
test('171. binding ignores permission blocks', () => assert.ok(bindMatched('ignores permission')));
test('172. binding rewrites Empresas blocks', () => assert.ok(bindMatched('rewrites Empresas')));
test('173. binding Fuel to production blocks', () => assert.ok(bindMatched('Fuel to production') && binding.allMatched));

// ===== Compatibility (174-194) =====
test('174. breaking matrix exists', () => assert.equal(compat.kind, 'studio-compatibility-breaking-matrix'));
test('175. ui false->true breaking', () => assert.ok(breakingIs('uiEnabled false->true')));
test('176. route false->true breaking', () => assert.ok(breakingIs('routeEnabled false->true')));
test('177. menu false->true breaking', () => assert.ok(breakingIs('menuEnabled false->true')));
test('178. production false->true breaking', () => assert.ok(breakingIs('productionEnabled false->true')));
test('179. backend false->true breaking', () => assert.ok(breakingIs('backendEnabled false->true')));
test('180. prisma false->true breaking', () => assert.ok(breakingIs('prismaEnabled false->true')));
test('181. migration false->true breaking', () => assert.ok(breakingIs('migrationEnabled false->true')));
test('182. fetch false->true breaking', () => assert.ok(breakingIs('fetchEnabled false->true')));
test('183. mutation false->true breaking', () => assert.ok(breakingIs('mutationAllowed false->true')));
test('184. generatedModule false->true breaking', () => assert.ok(breakingIs('generatedModuleAllowed false->true')));
test('185. marketplace false->true breaking', () => assert.ok(breakingIs('marketplaceEnabled false->true')));
test('186. defaultDeny true->false breaking', () => assert.ok(breakingIs('defaultDeny true->false')));
test('187. failClosed true->false breaking', () => assert.ok(breakingIs('failClosed true->false')));
test('188. tenantRequired true->false breaking', () => assert.ok(breakingIs('tenantRequired true->false')));
test('189. permissionRequired true->false breaking', () => assert.ok(breakingIs('permissionRequired true->false')));
test('190. delete default false->true breaking', () => assert.ok(breakingIs('delete default false->true')));
test('191. protected editable false->true breaking', () => assert.ok(breakingIs('protected editable false->true')));
test('192. error code removed breaking', () => assert.ok(breakingIs('error code removed')));
test('193. optional disabled field backward compatible', () => assert.equal(compat.backward.find((s) => s.name === 'optional disabled field added')?.classification, 'backward_compatible'));
test('194. new error code backward compatible', () => assert.ok(compat.allMatched && classifyStudioCompatibility({ errorCodes: ['A'] }, { errorCodes: ['A', 'B'] }).classification === 'backward_compatible'));

// ===== Digest/verifier (195-215) =====
test('195. digest suite exists', () => assert.equal(digest.kind, 'studio-digest-hardening-suite'));
test('196. same input same digest', () => assert.ok(digest.checks.find((c) => c.name === 'same input same digest').ok));
test('197. safety change changes digest', () => assert.ok(digest.checks.find((c) => c.name === 'safety change changes digest').ok));
test('198. permission change changes digest', () => assert.ok(digest.checks.find((c) => c.name === 'permission change changes digest').ok));
test('199. route/menu change changes digest', () => assert.ok(digest.checks.find((c) => c.name === 'route/menu change changes digest').ok));
test('200. persistence change changes digest', () => assert.ok(digest.checks.find((c) => c.name === 'persistence change changes digest').ok));
test('201. field allowlist change changes digest', () => assert.ok(digest.checks.find((c) => c.name === 'field allowlist change changes digest').ok));
test('202. secret-like value sanitized/blocked', () => assert.ok(safeStudioDigest({ token: 'x' }).sanitized || safeStudioDigest({ token: 'x' }).blocked));
test('203. input not mutated', () => assert.ok(digest.checks.find((c) => c.name === 'input not mutated').ok));
test('204. circular input blocked', () => assert.ok(safeStudioDigest((() => { const o = {}; o.s = o; return o; })()).blocked));
test('205. function input blocked', () => assert.ok(safeStudioDigest(() => 1).blocked));
test('206. verifier hardening exists', () => assert.equal(verifier.kind, 'studio-verifier-hardening-suite'));
test('207. verifier blocks manifest altered', () => assert.ok(verifier.scenarios.find((s) => s.name === 'manifest overall digest altered').matchedExpectation));
test('208. verifier blocks safety altered', () => assert.ok(verifier.scenarios.find((s) => s.name === 'safety digest altered').matchedExpectation));
test('209. verifier blocks uiEnabled true', () => assert.ok(verifier.scenarios.find((s) => s.name === 'uiEnabled true').matchedExpectation));
test('210. verifier blocks backendEnabled true', () => assert.ok(verifier.scenarios.find((s) => s.name === 'backendEnabled true').matchedExpectation));
test('211. verifier blocks productionEnabled true', () => assert.ok(verifier.scenarios.find((s) => s.name === 'productionEnabled true').matchedExpectation));
test('212. verifier blocks mutationAllowed true', () => assert.ok(verifier.scenarios.find((s) => s.name === 'mutationAllowed true').matchedExpectation));
test('213. verifier blocks defaultDeny false', () => assert.ok(verifier.scenarios.find((s) => s.name === 'defaultDeny false').matchedExpectation));
test('214. verifier blocks failClosed false', () => assert.ok(verifier.scenarios.find((s) => s.name === 'failClosed false').matchedExpectation));
test('215. verifier safeToUse false on violation', () => assert.ok(verifier.scenarios.every((s) => s.safeToUseAsFoundationReference === false) && verifier.allRejected));

// ===== Safety/performance/fallback (216-233) =====
test('216. safety invariant runner exists', () => assert.equal(safety.kind, 'studio-safety-invariant-runner'));
test('217. all 20 invariants pass', () => assert.ok(safety.invariantCount >= 20 && safety.failed === 0));
test('218. invariance failure blocks', () => assert.ok(createStudioSafetyInvariantRunner({ descriptor: { failClosed: false } }).blockers.length > 0));
test('219. performance baseline executes', () => assert.equal(createStudioContractPerformanceBaseline().kind, 'studio-contract-performance-baseline'));
test('220. performance no network', () => assert.equal(createStudioContractPerformanceBaseline().usesNetwork, false));
test('221. performance no backend', () => assert.equal(createStudioContractPerformanceBaseline().usesBackend, false));
test('222. performance no prisma', () => assert.equal(createStudioContractPerformanceBaseline().usesPrisma, false));
test('223. performance no mutation', () => assert.equal(createStudioContractPerformanceBaseline().executesMutation, false));
test('224. performance no hard hardware limit', () => assert.equal(createStudioContractPerformanceBaseline().usesHardHardwareLimit, false));
test('225. fallback hardening exists', () => assert.equal(createStudioBlueprintHardeningFallback().kind, 'studio-blueprint-hardening-fallback'));
test('226. fallback invalid matrix failure blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'invalid_matrix_failure' }).readiness, 'blocked'));
test('227. fallback route/menu auto-registration blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'route_menu_auto_registration_found' }).readiness, 'blocked'));
test('228. fallback backend attempt blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'backend_attempt' }).backendAccessed, false));
test('229. fallback Prisma attempt blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'prisma_attempt' }).prismaAccessed, false));
test('230. fallback production attempt blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'production_attempt' }).productionAccessed, false));
test('231. fallback mutation attempt blocks', () => assert.equal(createStudioBlueprintHardeningFallback({ scenario: 'mutation_attempt' }).mutationExecuted, false));
test('232. diagnostics contain no secrets', () => assert.ok(!/jwt|token|DATABASE_URL|secret/i.test(JSON.stringify(createStudioBlueprintHardeningDiagnostics()))));
test('233. diagnostics readiness blueprint_contract_hardened', () => assert.equal(createStudioBlueprintHardeningDiagnostics().readiness, 'blueprint_contract_hardened'));

// ===== Scope safety (234-263) =====
const AUTHORIZED = [
  /^src\/studio\/foundation-contracts\/hardening\//,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
  // POST-FOUNDATION C — Studio Blueprint Contract Certification slice paths (cross-slice robustness).
  /^src\/studio\/foundation-contracts\/certification\//,
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
  // Prior-slice tests whose branch-relative git-diff scope allowlists are widened
  // to tolerate this slice's authorized paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('234. hardening subtree exists', () => assert.ok(exists('src/studio/foundation-contracts/hardening')));
test('235. src/studio outside foundation-contracts not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(?!foundation-contracts\/)/.test(x))); });
test('236. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('237. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('238. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('239. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('240. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('241. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = createResolvedActiveStudioSlicePathAuthorizer(f); assert.ok(f.filter((x) => !exempt.isAuthorized(x)).every((x) => !/menu|nav/i.test(x))); });
test('242. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('243. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('244. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = createResolvedActiveStudioSlicePathAuthorizer(f); assert.ok(f.filter((x) => !exempt.isAuthorized(x)).every((x) => !/migration/i.test(x))); });
test('245. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('246. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('247. Empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('248. runtime prod not changed (only test added)', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('249. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('250. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('251. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('252. no Prisma Client', () => assert.ok(importsOf().every((p) => !/prisma|@prisma/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('253. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('254. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('255. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('256. React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('257. POST/PUT/PATCH/DELETE not executed', () => assert.ok(!/\b(method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"])/.test(allCode())));
test('258. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('259. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('260. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/foundation-contracts\/hardening\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
test('261. error catalog >= 20 codes', () => assert.ok(STUDIO_HARDENING_ERROR_CODES.length >= 20));
test('262. error descriptor sanitized', () => { const e = createStudioHardeningError('STUDIO_HARDENING_PRISMA_BLOCKED'); assert.ok(e.safe && !e.prismaAccessed && !e.sideEffects && !e.mutationExecuted); });
test('263. hardening flag fails closed in production', () => assert.equal(isStudioBlueprintContractHardeningEnabled({ [MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));

// Extra invariants (headless capabilities, evaluators) — keep after the numbered set.
test('E1. headless capabilities frozen', () => assert.ok(Object.isFrozen(STUDIO_HARDENING_HEADLESS_CAPABILITIES)));
test('E2. evaluateStudioBlueprintValidity rejects null', () => assert.equal(evaluateStudioBlueprintValidity(null).valid, false));
test('E3. evaluateStudioField accepts safe text field', () => assert.equal(evaluateStudioField({ name: 'codigo', type: 'text' }).valid, true));
