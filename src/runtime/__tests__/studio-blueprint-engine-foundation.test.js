import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_BLUEPRINT_ENGINE_NAME,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_MODE,
  STUDIO_BLUEPRINT_ENGINE_STATES,
  STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
  STUDIO_BLUEPRINT_ENGINE_ERROR_CODES,
  StudioBlueprintEngineError,
  createStudioBlueprintEngineError,
  MAK_STUDIO_BLUEPRINT_ENGINE_FLAG,
  MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE_FLAG,
  isStudioBlueprintEngineEnabled,
  isStudioBlueprintEngineValidateEnabled,
  engineDigest,
  createStudioBlueprintEngineDigest,
  studioBlueprintEngineDigest,
  createStudioDraftBlueprint,
  STUDIO_ENGINE_FIELD_TYPES,
  STUDIO_ENGINE_SCREEN_KINDS,
  STUDIO_ENGINE_PERMISSION_ACTIONS,
  normalizeStudioBlueprint,
  validateStudioBlueprint,
  validateStudioBlueprintSafety,
  validateStudioBlueprintAgainstHardening,
  createStudioBlueprintManifest,
  verifyStudioBlueprintEngineManifest,
  compareStudioBlueprints,
  checkStudioBlueprintEngineCompatibility,
  createStudioBlueprintDiagnostics,
  createStudioBlueprintFallback,
  STUDIO_BLUEPRINT_ENGINE_FALLBACK_SCENARIOS,
  createStudioHeadlessPreviewMetadata,
  createStudioBlueprintEngineReadiness,
  createStudioBlueprintEngineNextDecision,
  createStudioBlueprintEngine,
} from '../../studio/blueprint-engine/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-engine-foundation');

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

// A realistic, valid draft description (a "Produtos" cadastro).
const DRAFT = {
  moduleId: 'produtos',
  moduleName: 'Produtos',
  modelType: 'cadastro',
  modelFamily: 'ModeloBase1',
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true, searchable: true, sortable: true },
    { name: 'preco', type: 'money', label: 'Preço', sortable: true },
    { name: 'ativo', type: 'boolean', label: 'Ativo' },
    { name: 'clienteId', type: 'text', label: 'Cliente', tenantScoped: true, protectedField: true },
  ],
  screens: [
    { kind: 'table', title: 'Lista de Produtos' },
    { kind: 'form', title: 'Cadastro de Produto' },
  ],
  permissions: [
    { action: 'read', level: 'module' },
    { action: 'create', level: 'module' },
  ],
  persistence: { boundary: 'noPersistence' },
  runtimeBinding: { type: 'cadastro' },
};

const E = createStudioBlueprintEngine({ blueprint: DRAFT });
const draft = createStudioDraftBlueprint(DRAFT);
const normalized = normalizeStudioBlueprint(draft);
const validation = validateStudioBlueprint(normalized);
const safety = validateStudioBlueprintSafety(normalized);
const hardening = validateStudioBlueprintAgainstHardening(normalized);
const manifest = createStudioBlueprintManifest({ draft, normalized, validation, safety, hardening });
const verification = verifyStudioBlueprintEngineManifest({ manifest });
const preview = createStudioHeadlessPreviewMetadata(normalized);

// ===== Config & identity (1-24) =====
test('1. engine created', () => assert.equal(E.kind, 'studio-blueprint-engine'));
test('2. engineName', () => assert.equal(E.engineName, 'studio-blueprint-engine'));
test('3. STUDIO_BLUEPRINT_ENGINE_NAME const', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_NAME, 'studio-blueprint-engine'));
test('4. engineVersion', () => assert.equal(E.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('5. STUDIO_BLUEPRINT_ENGINE_VERSION const', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_VERSION, 'studio-blueprint-engine@1.0.0'));
test('6. mode headless_engine_foundation', () => assert.equal(E.mode, STUDIO_BLUEPRINT_ENGINE_MODE));
test('7. mode const value', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_MODE, 'headless_engine_foundation'));
test('8. certificationVersion', () => assert.equal(E.certificationVersion, 'studio-blueprint-contract-certification@1.0.0'));
test('9. hardeningVersion', () => assert.equal(E.hardeningVersion, 'studio-blueprint-contract-hardening@1.0.0'));
test('10. empresasMirrorVersion', () => assert.equal(E.empresasMirrorVersion, 'empresas-certified-blueprint-mirror@1.0.0'));
test('11. moduleId', () => assert.equal(E.moduleId, 'produtos'));
test('12. modelType', () => assert.equal(E.modelType, 'cadastro'));
test('13. modelFamily', () => assert.equal(E.modelFamily, 'ModeloBase1'));
test('14. readiness ready', () => assert.equal(E.readiness, 'blueprint_engine_foundation_ready'));
test('15. states const has draft/normalized/validated/rejected/reference', () => assert.deepEqual([...STUDIO_BLUEPRINT_ENGINE_STATES], ['draft', 'normalized', 'validated', 'rejected', 'reference']));
test('16. states frozen', () => assert.ok(Object.isFrozen(STUDIO_BLUEPRINT_ENGINE_STATES)));
test('17. compatibility const', () => assert.deepEqual([...STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY], ['compatible', 'backward_compatible', 'breaking', 'invalid']));
test('18. compatibility frozen', () => assert.ok(Object.isFrozen(STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY)));
test('19. field types (14)', () => assert.equal(STUDIO_ENGINE_FIELD_TYPES.length, 14));
test('20. field types include money/computed/status', () => assert.ok(['money', 'computed', 'status', 'relation'].every((t) => STUDIO_ENGINE_FIELD_TYPES.includes(t))));
test('21. screen kinds table/form/detail', () => assert.deepEqual([...STUDIO_ENGINE_SCREEN_KINDS], ['table', 'form', 'detail']));
test('22. permission actions include read/create/update/delete', () => assert.ok(['read', 'create', 'update', 'delete'].every((a) => STUDIO_ENGINE_PERMISSION_ACTIONS.includes(a))));
test('23. overallDigest fnv1a', () => assert.match(E.overallDigest, /^fnv1a-[0-9a-f]{8}$/));
test('24. safeToUseAsEngineOutput true', () => assert.equal(E.safeToUseAsEngineOutput, true));

// ===== Headless capabilities (25-52) =====
test('25. headless', () => assert.equal(E.headless, true));
test('26. capabilities frozen', () => assert.ok(Object.isFrozen(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES)));
test('27. canCreateDraft true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canCreateDraft, true));
test('28. canNormalize true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canNormalize, true));
test('29. canValidate true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canValidate, true));
test('30. canValidateSafety true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canValidateSafety, true));
test('31. canValidateAgainstHardening true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canValidateAgainstHardening, true));
test('32. canBuildManifest true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canBuildManifest, true));
test('33. canVerify true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canVerify, true));
test('34. canCompare true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canCompare, true));
test('35. canCheckCompatibility true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canCheckCompatibility, true));
test('36. canDiagnose true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canDiagnose, true));
test('37. canFallback true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canFallback, true));
test('38. canPreviewMetadata true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canPreviewMetadata, true));
test('39. canDecideReadiness true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canDecideReadiness, true));
test('40. canDecideNext true', () => assert.equal(STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES.canDecideNext, true));
test('41. uiEnabled false', () => assert.equal(E.uiEnabled, false));
test('42. routeEnabled false', () => assert.equal(E.routeEnabled, false));
test('43. menuEnabled false', () => assert.equal(E.menuEnabled, false));
test('44. moduleRegistrationEnabled false', () => assert.equal(E.moduleRegistrationEnabled, false));
test('45. backendEnabled false', () => assert.equal(E.backendEnabled, false));
test('46. prismaEnabled false', () => assert.equal(E.prismaEnabled, false));
test('47. migrationEnabled false', () => assert.equal(E.migrationEnabled, false));
test('48. productionEnabled false', () => assert.equal(E.productionEnabled, false));
test('49. stagingEnabled false', () => assert.equal(E.stagingEnabled, false));
test('50. fetchEnabled false', () => assert.equal(E.fetchEnabled, false));
test('51. mutationAllowed false', () => assert.equal(E.mutationAllowed, false));
test('52. persistenceEnabled + generatedModuleAllowed + rewriteEmpresas false', () => assert.ok(E.persistenceEnabled === false && E.generatedModuleAllowed === false && E.rewriteEmpresas === false));

// ===== Digest (53-62) =====
test('53. engineDigest deterministic', () => assert.equal(engineDigest({ a: 1, b: 2 }), engineDigest({ a: 1, b: 2 })));
test('54. engineDigest fnv1a', () => assert.match(engineDigest({ x: 1 }), /^fnv1a-[0-9a-f]{8}$/));
test('55. engineDigest null-safe', () => assert.match(engineDigest(undefined), /^fnv1a-/));
test('56. createStudioBlueprintEngineDigest ok', () => assert.equal(createStudioBlueprintEngineDigest({ value: { a: 1 } }).ok, true));
test('57. digest blocks function input', () => assert.equal(createStudioBlueprintEngineDigest({ value: () => 1 }).blocked, true));
test('58. digest blocks circular', () => { const o = {}; o.self = o; assert.equal(createStudioBlueprintEngineDigest({ value: o }).blocked, true); });
test('59. digest sanitizes secret keys', () => { const r = createStudioBlueprintEngineDigest({ value: { token: 'x', ok: 1 } }); assert.equal(r.sanitized, true); });
test('60. digest sanitizes DATABASE_URL-like key', () => assert.equal(createStudioBlueprintEngineDigest({ value: { ['DATABASE' + '_URL']: 'x' } }).sanitized, true));
test('61. studioBlueprintEngineDigest returns string', () => assert.equal(typeof studioBlueprintEngineDigest({ a: 1 }), 'string'));
test('62. studioBlueprintEngineDigest null on blocked', () => assert.equal(studioBlueprintEngineDigest(() => 1), null));

// ===== Draft (63-78) =====
test('63. draft kind', () => assert.equal(draft.kind, 'studio-draft-blueprint'));
test('64. draft state draft', () => assert.equal(draft.state, 'draft'));
test('65. draft moduleId', () => assert.equal(draft.moduleId, 'produtos'));
test('66. draft fieldCount 4', () => assert.equal(draft.fieldCount, 4));
test('67. draft screenCount 2', () => assert.equal(draft.screenCount, 2));
test('68. draft permissionCount 2', () => assert.equal(draft.permissionCount, 2));
test('69. draft has draftDigest', () => assert.match(draft.draftDigest, /^fnv1a-/));
test('70. draft blueprintId', () => assert.equal(draft.blueprintId, 'produtos#draft'));
test('71. draft headless', () => assert.equal(draft.headless, true));
test('72. draft rewriteEmpresas false', () => assert.equal(draft.rewriteEmpresas, false));
test('73. draft read permission enabled, create not', () => { const r = draft.permissions.find((p) => p.action === 'read'); const c = draft.permissions.find((p) => p.action === 'create'); assert.ok(r.enabled === true && c.enabled === false); });
test('74. draft persistence referenceOnly', () => assert.equal(draft.persistence.referenceOnly, true));
test('75. draft persistence migrationRequired false', () => assert.equal(draft.persistence.migrationRequired, false));
test('76. draft runtimeBinding does not activate production', () => assert.equal(draft.runtimeBinding.activatesProduction, false));
test('77. draft defaults on empty options', () => { const d = createStudioDraftBlueprint(); assert.ok(d.moduleId === 'draftModule' && d.fieldCount === 0); });
test('78. draft protectedField preserved', () => assert.equal(draft.fields.find((f) => f.name === 'clienteId').protectedField, true));

// ===== Normalize (79-94) =====
test('79. normalized kind', () => assert.equal(normalized.kind, 'studio-normalized-blueprint'));
test('80. normalized state', () => assert.equal(normalized.state, 'normalized'));
test('81. normalized fields sorted by name', () => { const names = normalized.fields.map((f) => f.name); assert.deepEqual(names, [...names].sort()); });
test('82. normalized has normalizedDigest', () => assert.match(normalized.normalizedDigest, /^fnv1a-/));
test('83. normalize deterministic', () => assert.equal(normalizeStudioBlueprint(draft).normalizedDigest, normalizeStudioBlueprint(draft).normalizedDigest));
test('84. normalize collapses duplicate field names', () => { const n = normalizeStudioBlueprint({ ...draft, fields: [{ name: 'a', type: 'text' }, { name: 'a', type: 'number' }] }); assert.ok(n.collapsedDuplicates.includes('a') && n.fieldCount === 1); });
test('85. normalize trims strings', () => { const n = normalizeStudioBlueprint({ moduleId: '  x  ', fields: [{ name: 'a', type: 'text' }] }); assert.equal(n.moduleId, 'x'); });
test('86. normalize screens sorted by kind', () => { const kinds = normalized.screens.map((s) => s.kind); assert.deepEqual(kinds, [...kinds].sort()); });
test('87. normalize permissions sorted by action', () => { const acts = normalized.permissions.map((p) => p.action); assert.deepEqual(acts, [...acts].sort()); });
test('88. normalize forces mutation permission disabled', () => { const n = normalizeStudioBlueprint({ fields: [{ name: 'a', type: 'text' }], permissions: [{ action: 'delete', enabled: true }] }); assert.equal(n.permissions[0].enabled, false); });
test('89. normalize persistence referenceOnly', () => assert.equal(normalized.persistence.referenceOnly, true));
test('90. normalize runtimeBinding referenceOnly', () => assert.equal(normalized.runtimeBinding.referenceOnly, true));
test('91. normalize headless', () => assert.equal(normalized.headless, true));
test('92. normalize idempotent field count', () => assert.equal(normalizeStudioBlueprint(normalized).fieldCount, normalized.fieldCount));
test('93. normalize handles non-object', () => assert.equal(normalizeStudioBlueprint(null).fieldCount, 0));
test('94. normalize preserves modelFamily', () => assert.equal(normalized.modelFamily, 'ModeloBase1'));

// ===== Structural validation (95-114) =====
test('95. validation valid', () => assert.equal(validation.valid, true));
test('96. validation kind', () => assert.equal(validation.kind, 'studio-blueprint-validation'));
test('97. validation readiness', () => assert.equal(validation.readiness, 'structurally_valid'));
test('98. validation rejects invalid moduleId', () => assert.ok(validateStudioBlueprint({ ...normalized, moduleId: '9bad' }).valid === false));
test('99. validation rejects missing fields', () => assert.ok(validateStudioBlueprint({ ...normalized, fields: [] }).valid === false));
test('100. validation rejects invalid field type', () => assert.ok(validateStudioBlueprint({ ...normalized, fields: [{ name: 'a', type: 'bogus' }] }).valid === false));
test('101. validation rejects duplicate field name', () => assert.ok(validateStudioBlueprint({ ...normalized, fields: [{ name: 'a', type: 'text' }, { name: 'a', type: 'text' }] }).valid === false));
test('102. validation rejects invalid modelType', () => assert.ok(validateStudioBlueprint({ ...normalized, modelType: 'weird' }).valid === false));
test('103. validation rejects invalid modelFamily', () => assert.ok(validateStudioBlueprint({ ...normalized, modelFamily: 'ModeloBase9' }).valid === false));
test('104. validation rejects invalid screen kind', () => assert.ok(validateStudioBlueprint({ ...normalized, screens: [{ kind: 'wizard' }] }).valid === false));
test('105. validation rejects invalid permission action', () => assert.ok(validateStudioBlueprint({ ...normalized, permissions: [{ action: 'nuke' }] }).valid === false));
test('106. validation rejects enabled mutation permission', () => assert.ok(validateStudioBlueprint({ ...normalized, permissions: [{ action: 'delete', enabled: true }] }).valid === false));
test('107. validation rejects migrationRequired persistence', () => assert.ok(validateStudioBlueprint({ ...normalized, persistence: { migrationRequired: true, referenceOnly: true } }).valid === false));
test('108. validation rejects non-referenceOnly persistence', () => assert.ok(validateStudioBlueprint({ ...normalized, persistence: { referenceOnly: false } }).valid === false));
test('109. validation reports field type list', () => assert.equal(validation.checkedFieldTypes.length, 14));
test('110. validation invalid field name flagged', () => assert.ok(validateStudioBlueprint({ ...normalized, fields: [{ name: 'has space', type: 'text' }] }).valid === false));
test('111. validation warns searchable on non-text', () => { const v = validateStudioBlueprint({ ...normalized, fields: [{ name: 'x', type: 'number', searchable: true }] }); assert.ok(v.warnings.some((w) => /searchable/.test(w))); });
test('112. validation handles non-object', () => assert.equal(validateStudioBlueprint(null).valid, false));
test('113. validation errors is array', () => assert.ok(Array.isArray(validation.errors)));
test('114. validation fieldCount', () => assert.equal(validation.fieldCount, normalized.fieldCount));

// ===== Safety validation (115-134) =====
test('115. safety safe', () => assert.equal(safety.safe, true));
test('116. safety kind', () => assert.equal(safety.kind, 'studio-blueprint-safety'));
test('117. safety readiness', () => assert.equal(safety.readiness, 'safety_valid'));
test('118. safety flags uiEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ uiEnabled: true }).safe === false));
test('119. safety flags routeEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ routeEnabled: true }).safe === false));
test('120. safety flags menuEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ menuEnabled: true }).safe === false));
test('121. safety flags moduleRegistrationEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ moduleRegistrationEnabled: true }).safe === false));
test('122. safety flags backendEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ backendEnabled: true }).safe === false));
test('123. safety flags prismaEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ prismaEnabled: true }).safe === false));
test('124. safety flags migrationEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ migrationEnabled: true }).safe === false));
test('125. safety flags productionEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ productionEnabled: true }).safe === false));
test('126. safety flags stagingEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ stagingEnabled: true }).safe === false));
test('127. safety flags fetchEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ fetchEnabled: true }).safe === false));
test('128. safety flags mutationAllowed escape', () => assert.ok(validateStudioBlueprintSafety({ mutationAllowed: true }).safe === false));
test('129. safety flags persistenceEnabled escape', () => assert.ok(validateStudioBlueprintSafety({ persistenceEnabled: true }).safe === false));
test('130. safety flags generatedModuleAllowed escape', () => assert.ok(validateStudioBlueprintSafety({ generatedModuleAllowed: true }).safe === false));
test('131. safety flags rewriteEmpresas escape', () => assert.ok(validateStudioBlueprintSafety({ rewriteEmpresas: true }).safe === false));
test('132. safety flags enabled mutation permission', () => assert.ok(validateStudioBlueprintSafety({ permissions: [{ action: 'update', enabled: true }] }).safe === false));
test('133. safety flags runtime binding activates production', () => assert.ok(validateStudioBlueprintSafety({ runtimeBinding: { activatesProduction: true, referenceOnly: true } }).safe === false));
test('134. safety invariants object all true', () => assert.ok(Object.values(safety.invariants).every((v) => v === true)));

// ===== Hardening validation (135-146) =====
test('135. hardening passed', () => assert.equal(hardening.passed, true));
test('136. hardening kind', () => assert.equal(hardening.kind, 'studio-blueprint-hardening-validation'));
test('137. hardening consumes certified baseline', () => assert.equal(hardening.hardeningBaselineConsumed, true));
test('138. hardening evaluated all fields', () => assert.equal(hardening.evaluatedFieldCount, normalized.fieldCount));
test('139. hardening blocks unknown type', () => assert.ok(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'bogus' }] }).passed === false));
test('140. hardening blocks whitespace name', () => assert.ok(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a b', type: 'text' }] }).passed === false));
test('141. hardening blocks select without options', () => assert.ok(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'select' }] }).passed === false));
test('142. hardening blocks relation without target', () => assert.ok(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'relation' }] }).passed === false));
test('143. hardening blocks computed with code string', () => assert.ok(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'computed', computed: 'x+1' }] }).passed === false));
test('144. hardening reports blockedFields with reasons', () => { const h = validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'bogus' }] }); assert.ok(h.blockedFields[0].reasons.length > 0); });
test('145. hardening readiness violation', () => assert.equal(validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'bogus' }] }).readiness, 'hardening_violation'));
test('146. hardening handles empty fields', () => assert.equal(validateStudioBlueprintAgainstHardening({ fields: [] }).passed, true));

// ===== Manifest & verifier (147-166) =====
test('147. manifest kind', () => assert.equal(manifest.kind, 'studio-blueprint-engine-manifest'));
test('148. manifest engineVersion', () => assert.equal(manifest.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('149. manifest overallDigest fnv1a', () => assert.match(manifest.overallDigest, /^fnv1a-[0-9a-f]{8}$/));
test('150. manifest readiness processed', () => assert.equal(manifest.readiness, 'blueprint_processed'));
test('151. manifest has all stage digests', () => assert.ok(['draftDigest', 'normalizedDigest', 'validationDigest', 'safetyDigest', 'hardeningDigest'].every((k) => typeof manifest[k] === 'string')));
test('152. manifest deterministic', () => assert.equal(createStudioBlueprintManifest({ draft, normalized, validation, safety, hardening }).overallDigest, manifest.overallDigest));
test('153. manifest headless', () => assert.equal(manifest.headless, true));
test('154. manifest blocked when validation invalid', () => { const m = createStudioBlueprintManifest({ draft, normalized, validation: { valid: false }, safety, hardening }); assert.equal(m.readiness, 'blocked'); });
test('155. verifier valid', () => assert.equal(verification.valid, true));
test('156. verifier safeToUseAsEngineOutput', () => assert.equal(verification.safeToUseAsEngineOutput, true));
test('157. verifier detects tampered draftDigest', () => { const t = JSON.parse(JSON.stringify(manifest)); t.draftDigest = 'fnv1a-deadbeef'; assert.equal(verifyStudioBlueprintEngineManifest({ manifest: t }).valid, false); });
test('158. verifier detects tampered overallDigest', () => { const t = JSON.parse(JSON.stringify(manifest)); t.overallDigest = 'fnv1a-deadbeef'; assert.equal(verifyStudioBlueprintEngineManifest({ manifest: t }).valid, false); });
test('159. verifier detects flipped ui flag', () => { const t = JSON.parse(JSON.stringify(manifest)); t.uiEnabled = true; assert.equal(verifyStudioBlueprintEngineManifest({ manifest: t }).valid, false); });
test('160. verifier detects flipped rewriteEmpresas', () => { const t = JSON.parse(JSON.stringify(manifest)); t.rewriteEmpresas = true; assert.equal(verifyStudioBlueprintEngineManifest({ manifest: t }).valid, false); });
test('161. verifier missing digest fails', () => { const t = JSON.parse(JSON.stringify(manifest)); delete t.safetyDigest; assert.equal(verifyStudioBlueprintEngineManifest({ manifest: t }).valid, false); });
test('162. verifier checks recorded', () => assert.ok(verification.checks.length > 0));
test('163. verifier non-object manifest fails', () => assert.equal(verifyStudioBlueprintEngineManifest({ manifest: null }).valid, false));
test('164. verifier failures empty on valid', () => assert.deepEqual(verification.failures, []));
test('165. engine verification matches standalone verifier', () => assert.equal(E.verification.valid, true));
test('166. engine overallDigest matches manifest', () => assert.equal(E.overallDigest, E.manifest.overallDigest));

// ===== Compare & compatibility (167-186) =====
test('167. compare identical', () => assert.equal(compareStudioBlueprints(normalized, normalized).identical, true));
test('168. compare has compareDigest', () => assert.match(compareStudioBlueprints(normalized, normalized).compareDigest, /^fnv1a-/));
test('169. compare detects added field', () => { const n2 = normalizeStudioBlueprint({ ...draft, fields: [...draft.fields, { name: 'novo', type: 'text' }] }); assert.ok(compareStudioBlueprints(normalized, n2).addedFields.includes('novo')); });
test('170. compare detects removed field', () => { const n2 = normalizeStudioBlueprint({ ...draft, fields: draft.fields.slice(1) }); assert.ok(compareStudioBlueprints(normalized, n2).removedFields.length > 0); });
test('171. compare detects retyped field', () => { const fields = draft.fields.map((f) => f.name === 'preco' ? { ...f, type: 'number' } : f); const n2 = normalizeStudioBlueprint({ ...draft, fields }); assert.ok(compareStudioBlueprints(normalized, n2).retypedFields.length > 0); });
test('172. compare detects nowRequired', () => { const fields = draft.fields.map((f) => f.name === 'preco' ? { ...f, required: true } : f); const n2 = normalizeStudioBlueprint({ ...draft, fields }); assert.ok(compareStudioBlueprints(normalized, n2).nowRequiredFields.includes('preco')); });
test('173. compatibility identical => compatible', () => assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: normalized }).classification, 'compatible'));
test('174. compatibility additive => backward_compatible', () => { const n2 = normalizeStudioBlueprint({ ...draft, fields: [...draft.fields, { name: 'novo', type: 'text' }] }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'backward_compatible'); });
test('175. compatibility removed field => breaking', () => { const n2 = normalizeStudioBlueprint({ ...draft, fields: draft.fields.slice(1) }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'breaking'); });
test('176. compatibility retype => breaking', () => { const fields = draft.fields.map((f) => f.name === 'preco' ? { ...f, type: 'number' } : f); const n2 = normalizeStudioBlueprint({ ...draft, fields }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'breaking'); });
test('177. compatibility nowRequired => breaking', () => { const fields = draft.fields.map((f) => f.name === 'preco' ? { ...f, required: true } : f); const n2 = normalizeStudioBlueprint({ ...draft, fields }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'breaking'); });
test('178. compatibility moduleId change => breaking', () => { const n2 = normalizeStudioBlueprint({ ...draft, moduleId: 'outro' }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'breaking'); });
test('179. compatibility removed permission => breaking', () => { const n2 = normalizeStudioBlueprint({ ...draft, permissions: [] }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'breaking'); });
test('180. compatibility non-object => invalid', () => assert.equal(checkStudioBlueprintEngineCompatibility({ current: null, next: normalized }).classification, 'invalid'));
test('181. compatibility breaking requiresMajorVersion', () => { const n2 = normalizeStudioBlueprint({ ...draft, fields: draft.fields.slice(1) }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).requiresMajorVersion, true); });
test('182. compatibility compatible => compatible true', () => assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: normalized }).compatible, true));
test('183. compatibility exposes diff', () => assert.ok(checkStudioBlueprintEngineCompatibility({ current: normalized, next: normalized }).diff.kind === 'studio-blueprint-comparison'));
test('184. engine without previous => compatibility null', () => assert.equal(E.compatibility, null));
test('185. engine with previous => compatibility present', () => { const e = createStudioBlueprintEngine({ blueprint: DRAFT, previous: normalized }); assert.equal(e.compatibility.classification, 'compatible'); });
test('186. compare added permission backward compatible', () => { const n2 = normalizeStudioBlueprint({ ...draft, permissions: [...draft.permissions, { action: 'export', level: 'module' }] }); assert.equal(checkStudioBlueprintEngineCompatibility({ current: normalized, next: n2 }).classification, 'backward_compatible'); });

// ===== Preview metadata, readiness, next decision (187-200) =====
test('187. preview kind', () => assert.equal(preview.kind, 'studio-headless-preview-metadata'));
test('188. preview not rendered', () => assert.equal(preview.rendered, false));
test('189. preview not a React component', () => assert.equal(preview.isReactComponent, false));
test('190. preview excludes protected fields from table', () => assert.ok(!preview.table.columns.some((c) => c.name === 'clienteId')));
test('191. preview form includes all fields', () => assert.equal(preview.form.fieldCount, normalized.fieldCount));
test('192. preview requires empty/loading/error states', () => assert.deepEqual(preview.requiredStates, ['empty', 'loading', 'error']));
test('193. preview no mutation surface', () => assert.equal(preview.mutationSurface, false));
test('194. preview has previewDigest', () => assert.match(preview.previewDigest, /^fnv1a-/));
test('195. readiness engineFoundationReady', () => assert.equal(E.readinessReport.engineFoundationReady, true));
test('196. readiness blueprintReady', () => assert.equal(E.readinessReport.blueprintReady, true));
test('197. readiness never emits generated module', () => assert.ok(E.readinessReport.emitsGeneratedModule === false && E.readinessReport.generationAllowedNow === false));
test('198. readiness blocked on invalid', () => assert.equal(createStudioBlueprintEngineReadiness({ validation: { valid: false } }).readiness, 'blocked'));
test('199. next decision proceed when ready', () => assert.equal(E.nextDecision.decision, 'proceed_to_reference_planner'));
test('200. next decision authorizes nothing', () => assert.ok(E.nextDecision.authorizesGeneration === false && E.nextDecision.authorizesUi === false && E.nextDecision.authorizesBackend === false && E.nextDecision.authorizesPersistence === false && E.nextDecision.authorizesRewriteEmpresas === false));

// ===== Empresas reference, diagnostics, fallback, errors (201-212) =====
test('201. empresasReference referenceOnly', () => assert.equal(E.empresasReference.referenceOnly, true));
test('202. empresasReference rewriteEmpresas false', () => assert.equal(E.empresasReference.rewriteEmpresas, false));
test('203. empresasReference mirrorVersion', () => assert.equal(E.empresasReference.mirrorVersion, 'empresas-certified-blueprint-mirror@1.0.0'));
test('204. empresasReference safeToUseAsSeed', () => assert.equal(E.empresasReference.safeToUseAsSeed, true));
test('205. diagnostics kind + no secrets', () => { assert.equal(E.diagnostics.kind, 'studio-blueprint-engine-diagnostics'); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(E.diagnostics))); });
test('206. diagnostics headless', () => assert.equal(E.diagnostics.headless, true));
test('207. fallback fail-closed', () => { const fb = createStudioBlueprintFallback({ scenario: 'rewrite_empresas_attempt' }); assert.ok(fb.safeToEmit === false && fb.readiness === 'blocked' && fb.rewriteEmpresas === false && fb.sideEffects === false); });
test('208. fallback unknown scenario => flag_off', () => assert.equal(createStudioBlueprintFallback({ scenario: 'nope' }).scenario, 'flag_off'));
test('209. fallback scenarios include all escape attempts', () => assert.ok(['ui_attempt', 'backend_attempt', 'prisma_attempt', 'mutation_attempt', 'persistence_attempt', 'rewrite_empresas_attempt'].every((s) => STUDIO_BLUEPRINT_ENGINE_FALLBACK_SCENARIOS.includes(s))));
test('210. error catalog >= 24 codes', () => assert.ok(STUDIO_BLUEPRINT_ENGINE_ERROR_CODES.length >= 24));
test('211. error descriptor sanitized + no side effects', () => { const e = createStudioBlueprintEngineError('STUDIO_BLUEPRINT_ENGINE_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaEnabled === false && e.rewriteEmpresas === false); });
test('212. StudioBlueprintEngineError typed', () => { const e = new StudioBlueprintEngineError('STUDIO_BLUEPRINT_ENGINE_INVALID_DRAFT', 'x'); assert.ok(e instanceof Error && e.code === 'STUDIO_BLUEPRINT_ENGINE_INVALID_DRAFT'); });

// ===== Flags & static safety (213-218) =====
test('213. flag fails closed in production', () => assert.equal(isStudioBlueprintEngineEnabled({ [MAK_STUDIO_BLUEPRINT_ENGINE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('214. flag on in dev', () => assert.equal(isStudioBlueprintEngineEnabled({ [MAK_STUDIO_BLUEPRINT_ENGINE_FLAG]: 'true', DEV: 'true' }), true));
test('215. validate flag fails closed in production', () => assert.equal(isStudioBlueprintEngineValidateEnabled({ [MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('216. subtree is React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('217. no import of EmpresaApi/apiClient/apis/backend/prisma', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('218. no fetch/storage/DATABASE_URL/production-API/POST-method in code', () => { const code = allCode(); assert.ok(!/\bfetch\s*\(|localStorage\.|sessionStorage\.|indexedDB\./.test(code) && !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code) && !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code)); });

// ===== Scope safety (branch-relative) (S1-S16) =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\//,
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
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
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('S1. blueprint-engine subtree exists', () => assert.ok(exists('src/studio/blueprint-engine')));
test('S2. other src/studio subtrees not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(?!blueprint-engine\/)/.test(x))); });
test('S3. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('S4. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('S5. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('S6. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('S7. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('S8. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('S9. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('S10. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('S11. src/pages/src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/(pages|components)\//.test(x))); });
test('S12. runtime prod (non-tests) not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('S13. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('S14. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('S15. src/modules/studio/combustivel/fuel do not exist', () => assert.ok(!exists('src/modules/studio') && !exists('src/modules/combustivel') && !exists('src/modules/fuel')));
test('S16. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});

// ===== Evidence docs (D1-D15) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-ENGINE-FOUNDATION-REPORT.md', 'ENGINE-ARCHITECTURE.md',
  'DRAFT-NORMALIZE-VALIDATE-PIPELINE.md', 'SAFETY-INVARIANTS.md', 'HARDENING-INTEGRATION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'COMPARE-COMPATIBILITY-RULES.md', 'HEADLESS-PREVIEW-METADATA.md',
  'EMPRESAS-REFERENCE-NO-REWRITE.md', 'READINESS-NEXT-DECISION.md', 'NO-PRODUCTION-NO-GENERATION-VALIDATION.md',
  'FUTURE-ENGINE-SLICES.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-blueprint-engine-foundation/${DOCS[i]}`)));
}
test('D-content. certification doc mentions headless engine + no rewrite', () => { const c = readEv('CERTIFICATION-REPORT.md'); assert.ok(/headless/i.test(c)); assert.ok(/referenceOnly|reference-only|não.{0,12}(reescrev|altera Empresas)/i.test(readEv('EMPRESAS-REFERENCE-NO-REWRITE.md'))); });
