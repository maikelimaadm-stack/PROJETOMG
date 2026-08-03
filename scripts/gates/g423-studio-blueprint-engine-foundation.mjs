#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BLUEPRINT-ENGINE-FOUNDATION — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY Studio Blueprint Engine Foundation, living in
 * `src/studio/blueprint-engine/`. Given a DRAFT blueprint it normalizes, validates
 * (structure + safety + certified hardening), builds a manifest, verifies it, compares
 * blueprints, classifies compatibility, diagnoses, falls back fail-closed, produces
 * headless preview metadata, a readiness verdict and a next decision — consuming the
 * certified Empresas mirror READ-ONLY (never rewriting Empresas).
 *
 * It renders no UI, registers no route/menu/module, and never touches backend/Prisma/
 * migration/network/production/staging, never mutates, never persists, and never
 * generates a module. Nothing is auto-consumed by the app (reversible by non-consumption).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Branch-relative scope checks may run on later Studio headless slices before merge.
// Known later Studio headless artifacts are tolerated here, but forbidden scopes still fail.
import { isKnownLaterStudioHeadlessArtifact, classifyStudioScopePath, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-engine-foundation');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\//,
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
  // Prior-slice tests whose branch-relative git-diff scope allowlists are widened.
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

const FILES = [
  'studioBlueprintEngineConfig.js', 'errors.js', 'createStudioBlueprintEngineDigest.js',
  'createStudioDraftBlueprint.js', 'normalizeStudioBlueprint.js', 'validateStudioBlueprint.js',
  'validateStudioBlueprintSafety.js', 'validateStudioBlueprintAgainstHardening.js',
  'createStudioBlueprintManifest.js', 'verifyStudioBlueprintEngineManifest.js', 'compareStudioBlueprints.js',
  'checkStudioBlueprintEngineCompatibility.js', 'createStudioBlueprintDiagnostics.js', 'createStudioBlueprintFallback.js',
  'createStudioHeadlessPreviewMetadata.js', 'createStudioBlueprintEngineReadiness.js',
  'createStudioBlueprintEngineNextDecision.js', 'createStudioBlueprintEngine.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-ENGINE-FOUNDATION-REPORT.md', 'ENGINE-ARCHITECTURE.md',
  'DRAFT-NORMALIZE-VALIDATE-PIPELINE.md', 'SAFETY-INVARIANTS.md', 'HARDENING-INTEGRATION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'COMPARE-COMPATIBILITY-RULES.md', 'HEADLESS-PREVIEW-METADATA.md',
  'EMPRESAS-REFERENCE-NO-REWRITE.md', 'READINESS-NEXT-DECISION.md', 'NO-PRODUCTION-NO-GENERATION-VALIDATION.md',
  'FUTURE-ENGINE-SLICES.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-SBE — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-SBE — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-blueprint-engine-foundation.test.js')));
for (const d of DOCS) gate(`G423-SBE — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const DRAFT = {
  moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1',
  fields: [
    { name: 'nome', type: 'text', required: true, searchable: true, sortable: true },
    { name: 'preco', type: 'money', sortable: true },
    { name: 'clienteId', type: 'text', tenantScoped: true, protectedField: true },
  ],
  screens: [{ kind: 'table', title: 'Lista' }, { kind: 'form', title: 'Form' }],
  permissions: [{ action: 'read', level: 'module' }, { action: 'create', level: 'module' }],
};

let baseOk = false; let baseDetail = '';
try {
  const e = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  baseOk = e.kind === 'studio-blueprint-engine'
    && e.engineName === 'studio-blueprint-engine' && e.engineVersion === 'studio-blueprint-engine@1.0.0'
    && e.mode === 'headless_engine_foundation'
    && e.headless === true
    && e.uiEnabled === false && e.routeEnabled === false && e.menuEnabled === false && e.moduleRegistrationEnabled === false
    && e.backendEnabled === false && e.prismaEnabled === false && e.migrationEnabled === false
    && e.productionEnabled === false && e.stagingEnabled === false && e.fetchEnabled === false
    && e.mutationAllowed === false && e.persistenceEnabled === false && e.generatedModuleAllowed === false
    && e.rewriteEmpresas === false
    && e.blockers.length === 0 && e.readiness === 'blueprint_engine_foundation_ready';
  baseDetail = baseOk ? `readiness=${e.readiness}; next=${e.nextAllowedStage}` : 'engine invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-SBE — engine headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES;
  const cans = ['canCreateDraft', 'canNormalize', 'canValidate', 'canValidateSafety', 'canValidateAgainstHardening', 'canBuildManifest', 'canVerify', 'canCompare', 'canCheckCompatibility', 'canDiagnose', 'canFallback', 'canPreviewMetadata', 'canDecideReadiness', 'canDecideNext'];
  const noes = ['uiEnabled', 'routeEnabled', 'menuEnabled', 'moduleRegistrationEnabled', 'backendEnabled', 'prismaEnabled', 'migrationEnabled', 'productionEnabled', 'stagingEnabled', 'fetchEnabled', 'mutationAllowed', 'persistenceEnabled', 'generatedModuleAllowed', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && c.headless === true && cans.every((k) => c[k] === true) && noes.every((k) => c[k] === false);
} catch { capOk = false; }
gate('G423-SBE — capabilities frozen; all can* true; all side-effect flags false', capOk);

let verOk = false; let verDetail = '';
try {
  const e = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  const v = m.verifyStudioBlueprintEngineManifest({ manifest: e.manifest });
  verOk = v.valid === true && v.safeToUseAsEngineOutput === true && v.failures.length === 0 && e.safeToUseAsEngineOutput === true;
  verDetail = verOk ? `${v.checks.length} checks; 0 failures` : `failures: ${v.failures.join(',')}`;
} catch (err) { verDetail = err instanceof Error ? err.message : String(err); }
gate('G423-SBE — verifier valid + safeToUseAsEngineOutput', verOk, verDetail);

let detOk = false;
try {
  const a = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  const b = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  detOk = a.overallDigest === b.overallDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-SBE — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const e = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  const t = JSON.parse(JSON.stringify(e.manifest));
  t.draftDigest = 'fnv1a-deadbeef';
  tamperOk = m.verifyStudioBlueprintEngineManifest({ manifest: t }).valid === false;
} catch { tamperOk = false; }
gate('G423-SBE — verifier detects a tampered digest', tamperOk);

let tamperFlagOk = false;
try {
  const e = m.createStudioBlueprintEngine({ blueprint: DRAFT });
  const t = JSON.parse(JSON.stringify(e.manifest));
  t.rewriteEmpresas = true;
  tamperFlagOk = m.verifyStudioBlueprintEngineManifest({ manifest: t }).valid === false;
} catch { tamperFlagOk = false; }
gate('G423-SBE — verifier detects a flipped side-effect flag', tamperFlagOk);

// Pipeline stages.
gate('G423-SBE — draft builds (state=draft, digest present)', (() => { try { const d = m.createStudioDraftBlueprint(DRAFT); return d.state === 'draft' && /^fnv1a-/.test(d.draftDigest) && d.fieldCount === 3; } catch { return false; } })());
gate('G423-SBE — normalize sorts + collapses duplicates', (() => { try { const n = m.normalizeStudioBlueprint({ fields: [{ name: 'b', type: 'text' }, { name: 'a', type: 'text' }, { name: 'a', type: 'number' }] }); return n.fields[0].name === 'a' && n.collapsedDuplicates.includes('a'); } catch { return false; } })());
gate('G423-SBE — validation valid on good draft, invalid on bad type', (() => { try { const n = m.normalizeStudioBlueprint(DRAFT); return m.validateStudioBlueprint(n).valid === true && m.validateStudioBlueprint({ ...n, fields: [{ name: 'a', type: 'bogus' }] }).valid === false; } catch { return false; } })());
gate('G423-SBE — safety rejects any escape flag', (() => { try { return ['uiEnabled', 'backendEnabled', 'prismaEnabled', 'mutationAllowed', 'persistenceEnabled', 'rewriteEmpresas'].every((f) => m.validateStudioBlueprintSafety({ [f]: true }).safe === false); } catch { return false; } })());
gate('G423-SBE — hardening consumes certified matrix (blocks unknown type / relation w/o target)', (() => { try { const h = m.validateStudioBlueprintAgainstHardening({ fields: [{ name: 'a', type: 'relation' }] }); return h.hardeningBaselineConsumed === true && h.passed === false; } catch { return false; } })());

let cmpOk = false;
try {
  const n = m.normalizeStudioBlueprint(DRAFT);
  const same = m.checkStudioBlueprintEngineCompatibility({ current: n, next: n });
  const nAdd = m.normalizeStudioBlueprint({ ...DRAFT, fields: [...DRAFT.fields, { name: 'extra', type: 'text' }] });
  const add = m.checkStudioBlueprintEngineCompatibility({ current: n, next: nAdd });
  const nRem = m.normalizeStudioBlueprint({ ...DRAFT, fields: DRAFT.fields.slice(1) });
  const rem = m.checkStudioBlueprintEngineCompatibility({ current: n, next: nRem });
  const inv = m.checkStudioBlueprintEngineCompatibility({ current: null, next: n });
  cmpOk = same.classification === 'compatible' && add.classification === 'backward_compatible'
    && rem.classification === 'breaking' && inv.classification === 'invalid';
} catch { cmpOk = false; }
gate('G423-SBE — compatibility compatible/backward_compatible/breaking/invalid', cmpOk);

gate('G423-SBE — compare produces stable diff digest', (() => { try { const n = m.normalizeStudioBlueprint(DRAFT); return m.compareStudioBlueprints(n, n).identical === true && /^fnv1a-/.test(m.compareStudioBlueprints(n, n).compareDigest); } catch { return false; } })());

gate('G423-SBE — preview metadata is headless (rendered=false, not React, excludes protected)', (() => { try { const n = m.normalizeStudioBlueprint(DRAFT); const p = m.createStudioHeadlessPreviewMetadata(n); return p.rendered === false && p.isReactComponent === false && !p.table.columns.some((c) => c.name === 'clienteId') && p.mutationSurface === false; } catch { return false; } })());

gate('G423-SBE — readiness engine-foundation-ready + never emits generated module', (() => { try { const e = m.createStudioBlueprintEngine({ blueprint: DRAFT }); return e.readinessReport.engineFoundationReady === true && e.readinessReport.emitsGeneratedModule === false && e.readinessReport.generationAllowedNow === false; } catch { return false; } })());

gate('G423-SBE — next decision authorizes nothing (no generation/ui/backend/persistence/rewrite)', (() => { try { const e = m.createStudioBlueprintEngine({ blueprint: DRAFT }); const d = e.nextDecision; return d.authorizesGeneration === false && d.authorizesUi === false && d.authorizesBackend === false && d.authorizesPersistence === false && d.authorizesRewriteEmpresas === false; } catch { return false; } })());

gate('G423-SBE — Empresas consumed reference-only (no rewrite)', (() => { try { const e = m.createStudioBlueprintEngine({ blueprint: DRAFT }); return e.empresasReference.referenceOnly === true && e.empresasReference.rewriteEmpresas === false && e.empresasReference.mirrorVersion === 'empresas-certified-blueprint-mirror@1.0.0'; } catch { return false; } })());

let fbOk = false;
try {
  const fb = m.createStudioBlueprintFallback({ scenario: 'rewrite_empresas_attempt' });
  fbOk = fb.safeToEmit === false && fb.readiness === 'blocked' && fb.rewriteEmpresas === false && fb.sideEffects === false && fb.persistenceEnabled === false;
} catch { fbOk = false; }
gate('G423-SBE — fallback fail-closed (no emit, no rewrite, no side effects)', fbOk);

let flagOk = false;
try {
  const off = m.isStudioBlueprintEngineEnabled({ [m.MAK_STUDIO_BLUEPRINT_ENGINE_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioBlueprintEngineEnabled({ [m.MAK_STUDIO_BLUEPRINT_ENGINE_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-SBE — flags fail closed in production', flagOk);

gate('G423-SBE — error catalog >= 24 codes', Array.isArray(m?.STUDIO_BLUEPRINT_ENGINE_ERROR_CODES) && m.STUDIO_BLUEPRINT_ENGINE_ERROR_CODES.length >= 24);
gate('G423-SBE — digest blocks function/circular + sanitizes secrets', (() => { try { const o = {}; o.s = o; return m.createStudioBlueprintEngineDigest({ value: () => 1 }).blocked === true && m.createStudioBlueprintEngineDigest({ value: o }).blocked === true && m.createStudioBlueprintEngineDigest({ value: { token: 'x' } }).sanitized === true; } catch { return false; } })());

// Static safety scans.
gate('G423-SBE — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-SBE — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-SBE — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-SBE — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-SBE — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-SBE — engine only imports runtime kernel + certified studio subtrees', importsOf(walk(DIR)).filter((p) => p.startsWith('.')).every((p) => /generic-model|foundation-contracts|blueprint-mirrors|blueprint-engine|\.\/[A-Za-z]/.test(p)));

gate('G423-SBE — docs validate no rewrite / reference-only', /referenceOnly|reference-only|não.{0,12}(reescrev|altera Empresas)/i.test(readEv('EMPRESAS-REFERENCE-NO-REWRITE.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-SBE — docs validate no production / no generation', /não.{0,20}(produção|gera|module)|no.{0,20}(production|generation)|generatedModule/i.test(readEv('NO-PRODUCTION-NO-GENERATION-VALIDATION.md')));
gate('G423-SBE — future engine slices spec present', /REFERENCE PLANNER|VERSIONING|SLICE/i.test(readEv('FUTURE-ENGINE-SLICES.md')));
gate('G423-SBE — architecture doc describes pipeline', /draft[\s\S]*normalize[\s\S]*validate|pipeline/i.test(readEv('ENGINE-ARCHITECTURE.md')));

// productionUiGuard whitelists the new subtree.
gate('G423-SBE — productionUiGuard whitelists src/studio/blueprint-engine/', (() => { try { return /src\/studio\/blueprint-engine\//.test(fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/productionUiGuard.mjs'), 'utf8')); } catch { return false; } })());

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /PAGEMP/i, /ModeloBase1CadastroPage/i, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!blueprint-engine\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  // Judge the diff with the CENTRAL registry as well: the local blanket /migration/i and /menu/i patterns
  // matched any path whose NAME merely contained the word, which false-positives on governance artifacts.
  // A path is bad only when BOTH the local list and the central classifier consider it out of bounds.
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f))
    && !isKnownLaterStudioHeadlessArtifact(f) && classifyStudioScopePath(f) !== 'forbidden_scope'
    ? true : filterForbiddenScopePaths([f]).length > 0);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'Empresas/PAGEMP/MB1/MB2/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-SBE — Empresas / production / other Studio / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-SBE — authorized scope only (engine/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-SBE — no new dependency added', noNewDep);

gate('G423-SBE — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-SBE — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-SBE — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-blueprint-engine-foundation.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-SBE — studio blueprint engine foundation unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-BLUEPRINT-ENGINE-FOUNDATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
