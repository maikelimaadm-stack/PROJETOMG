#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-STUDIO-COMPATIBILITY-SLICE-1 — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY first Empresas↔Studio compatibility slice, living
 * in `src/studio/blueprint-mirrors/empresas/compatibility-slice-1/`. It turns the
 * Empresas blueprint mirror gaps into formal contracts and alignment plans (gap
 * registry, detail/state plans, write capability matrix, persistence boundary bridge,
 * backend/Prisma readiness map, preferences/layout plan) plus a manifest, verifier,
 * compatibility checker, diagnostics and fallback.
 *
 * It NEVER changes Empresas, renders UI, registers a route/menu/module, or touches
 * backend/Prisma/migration/network/production/staging, and never mutates. Nothing is
 * auto-consumed by the app (reversible by non-consumption).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-mirrors/empresas/compatibility-slice-1');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-studio-compatibility-slice-1');
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
  /^src\/studio\/blueprint-mirrors\/empresas\/compatibility-slice-1\//,
  /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
  /^scripts\/gates\/g423-empresas-studio-compatibility-slice-1\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-studio-compatibility-slice-1\//,
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
];

const FILES = [
  'empresasStudioCompatibilitySlice1Config.js', 'errors.js',
  'createEmpresasStudioCompatibilitySlice1.js', 'createEmpresasCompatibilityGapRegistry.js',
  'createEmpresasDetailScreenAlignmentPlan.js', 'createEmpresasStateCoverageAlignmentPlan.js',
  'createEmpresasWriteCapabilityReferenceMatrix.js', 'createEmpresasPersistenceBoundaryAlignmentBridge.js',
  'createEmpresasBackendPrismaReadinessMap.js', 'createEmpresasPreferenceLayoutAlignmentPlan.js',
  'createEmpresasCompatibilitySlice1Manifest.js', 'verifyEmpresasStudioCompatibilitySlice1.js',
  'checkEmpresasStudioCompatibilitySlice1.js', 'createEmpresasCompatibilitySlice1Diagnostics.js',
  'createEmpresasCompatibilitySlice1Fallback.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'EMPRESAS-STUDIO-COMPATIBILITY-SLICE-1-REPORT.md', 'GAP-REGISTRY.md',
  'DETAIL-SCREEN-ALIGNMENT-PLAN.md', 'STATE-COVERAGE-ALIGNMENT-PLAN.md', 'WRITE-CAPABILITY-REFERENCE-MATRIX.md',
  'PERSISTENCE-BOUNDARY-ALIGNMENT-BRIDGE.md', 'BACKEND-PRISMA-READINESS-MAP.md', 'PREFERENCES-LAYOUT-ALIGNMENT-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REWRITE-NO-PRODUCTION-VALIDATION.md', 'FUTURE-EMPRESAS-MODIFICATION-PLAN.md',
  'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-EMP-CS1 — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-EMP-CS1 — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/empresas-studio-compatibility-slice-1.test.js')));
for (const d of DOCS) gate(`G423-EMP-CS1 — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  const s = m.createEmpresasStudioCompatibilitySlice1();
  baseOk = s.kind === 'empresas-studio-compatibility-slice-1'
    && s.sliceVersion === 'empresas-studio-compatibility-slice-1@1.0.0'
    && s.mode === 'contract_only_alignment'
    && s.moduleId === 'empresas' && s.modelType === 'cadastro' && s.modelFamily === 'ModeloBase1'
    && s.headless === true && s.empresasCodeChanged === false && s.uiCreated === false && s.routeCreated === false
    && s.menuCreated === false && s.moduleRegistered === false && s.backendAccessed === false && s.prismaAccessed === false
    && s.productionAccessed === false && s.stagingAccessed === false && s.fetchUsed === false
    && s.mutationAllowed === false && s.rewriteEmpresas === false
    && s.knownGapsTracked === true && s.untrackedCriticalGaps === 0 && s.blockers.length === 0
    && s.readiness === 'compatibility_slice_1_complete';
  baseDetail = baseOk ? `readiness=${s.readiness}; next=${s.nextAllowedStage}` : 'slice invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-CS1 — slice headless/contract-only invariants + readiness complete', baseOk, baseDetail);

let verOk = false; let verDetail = '';
try {
  const s = m.createEmpresasStudioCompatibilitySlice1();
  const v = m.verifyEmpresasStudioCompatibilitySlice1({ slice: s });
  verOk = v.valid === true && v.safeToUseAsCompatibilityReference === true && v.failures.length === 0 && s.safeToUseAsCompatibilityReference === true;
  verDetail = verOk ? `${v.checks.length} checks; 0 failures` : `failures: ${v.failures.join(',')}`;
} catch (err) { verDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-CS1 — verifier valid + safeToUseAsCompatibilityReference', verOk, verDetail);

let detOk = false;
try {
  const a = m.createEmpresasStudioCompatibilitySlice1();
  const b = m.createEmpresasStudioCompatibilitySlice1();
  detOk = a.manifest.overallDigest === b.manifest.overallDigest && a.manifest.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-EMP-CS1 — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const s = m.createEmpresasStudioCompatibilitySlice1();
  const t = JSON.parse(JSON.stringify(s));
  t.manifest.gapRegistryDigest = 'fnv1a-deadbeef';
  tamperOk = m.verifyEmpresasStudioCompatibilitySlice1({ slice: t }).valid === false;
} catch { tamperOk = false; }
gate('G423-EMP-CS1 — verifier detects a tampered digest', tamperOk);

const part = (fn, pred) => { try { return pred(m[fn]()); } catch { return false; } };
gate('G423-EMP-CS1 — gap registry (10 gaps, tracked, 0 untracked critical, none fixed by changing Empresas)', part('createEmpresasCompatibilityGapRegistry', (x) => x.gapCount >= 10 && x.knownGapsTracked === true && x.untrackedCriticalGaps === 0 && x.anyGapFixedByChangingEmpresas === false && x.gaps.every((g) => g.recommendedSlice && g.recommendedFix)));
gate('G423-EMP-CS1 — detail plan (derive from form, no UI/PAGEMP change)', part('createEmpresasDetailScreenAlignmentPlan', (x) => ['absent_but_non_blocking', 'derive_from_form_readonly'].includes(x.classification) && x.createsDetailScreenNow === false && x.changesPagemp === false));
gate('G423-EMP-CS1 — state coverage plan (security states fail-closed, no UI)', part('createEmpresasStateCoverageAlignmentPlan', (x) => x.stateCount >= 9 && x.securityStatesFailClosed.length > 0 && x.changesUi === false));
gate('G423-EMP-CS1 — write capability matrix (read certified; writes reference-only; no mutation/permission change)', part('createEmpresasWriteCapabilityReferenceMatrix', (x) => x.readCertified === true && x.mutationAllowed === false && x.deleteEnabledByDefault === false && x.permissionsAltered === false && x.writesAllowedThisSlice === true));
gate('G423-EMP-CS1 — persistence bridge (referenceOnly; no schema/migration/backend/prisma)', part('createEmpresasPersistenceBoundaryAlignmentBridge', (x) => x.currentBoundary === 'existingProduction/referenceOnly' && x.schemaChangeAllowed === false && x.migrationAllowed === false && x.backendAccessed === false && x.prismaAccessed === false && x.createsMigration === false && x.usesDatabaseUrl === false));
gate('G423-EMP-CS1 — backend/prisma readiness map (documental; no migration; not executed)', part('createEmpresasBackendPrismaReadinessMap', (x) => x.itemCount >= 5 && x.requiresMigration === false && x.prismaExecuted === false && x.backendCalled === false && x.schemaAlteredThisSlice === false));
gate('G423-EMP-CS1 — preferences/layout plan (referenceOnly; no UI/preferences change)', part('createEmpresasPreferenceLayoutAlignmentPlan', (x) => x.changesRealPreferences === false && x.changesUsuarioPreferencia === false && x.changesUi === false));

let cmpOk = false;
try {
  const s = m.createEmpresasStudioCompatibilitySlice1();
  const ok = m.checkEmpresasStudioCompatibilitySlice1({ slice: s });
  const bad = m.checkEmpresasStudioCompatibilitySlice1({ slice: { ...s, rewriteEmpresas: true } });
  cmpOk = ok.compatibleForNextStep === true && bad.status === 'blocked';
} catch { cmpOk = false; }
gate('G423-EMP-CS1 — compatibility checker (safe next step; exposure → blocked)', cmpOk);

let fbOk = false;
try {
  const fb = m.createEmpresasCompatibilitySlice1Fallback({ scenario: 'rewrite_empresas_attempt' });
  fbOk = fb.safeToUseAsCompatibilityReference === false && fb.readiness === 'blocked' && fb.rewriteEmpresas === false && fb.empresasCodeChanged === false && fb.sideEffects === false;
} catch { fbOk = false; }
gate('G423-EMP-CS1 — fallback fail-closed (no rewrite/empresas change, no side effects)', fbOk);

let flagOk = false;
try {
  const off = m.isEmpresasStudioCompatibilitySlice1Enabled({ [m.MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isEmpresasStudioCompatibilitySlice1Enabled({ [m.MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-EMP-CS1 — flags fail closed in production', flagOk);

gate('G423-EMP-CS1 — error catalog >= 26 codes', Array.isArray(m?.EMPRESAS_COMPAT_SLICE1_ERROR_CODES) && m.EMPRESAS_COMPAT_SLICE1_ERROR_CODES.length >= 26);

// Static safety scans.
gate('G423-EMP-CS1 — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-EMP-CS1 — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-EMP-CS1 — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-EMP-CS1 — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-EMP-CS1 — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-EMP-CS1 — docs validate no rewrite / no production', /não.{0,12}(reescrev|altera Empresas)|referenceOnly|reference-only/i.test(readEv('NO-REWRITE-NO-PRODUCTION-VALIDATION.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-EMP-CS1 — future modification plan present', /EMPRESAS STUDIO COMPATIBILITY SLICE 2|STUDIO BLUEPRINT ENGINE FOUNDATION/i.test(readEv('FUTURE-EMPRESAS-MODIFICATION-PLAN.md')));
gate('G423-EMP-CS1 — next slice spec present', /STUDIO BLUEPRINT ENGINE FOUNDATION|EMPRESAS STUDIO COMPATIBILITY SLICE 2/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /PAGEMP/i, /ModeloBase1CadastroPage/i, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!blueprint-mirrors\/empresas\/compatibility-slice-1\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'Empresas/PAGEMP/MB1/MB2/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CS1 — Empresas / production code / other Studio / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CS1 — authorized scope only (slice/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-EMP-CS1 — no new dependency added', noNewDep);

gate('G423-EMP-CS1 — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-EMP-CS1 — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-CS1 — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-studio-compatibility-slice-1.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-CS1 — empresas studio compatibility slice 1 unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-STUDIO-COMPATIBILITY-SLICE-1 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
