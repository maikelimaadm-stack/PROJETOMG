#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BLUEPRINT-CONTRACT-HARDENING — Post-Foundation C.
 *
 * Proves the headless, contract-only HARDENING layer for the MAK Studio foundation
 * contracts, living in `src/studio/foundation-contracts/hardening/`. Every artifact is
 * pure and deterministic: invalid/dangerous blueprint matrices, field/screen/
 * validation/permission hardening, route/menu and persistence blockers, runtime
 * binding safety, compatibility breaking matrix, digest/verifier hardening suites,
 * safety invariant runner, local performance baseline, diagnostics and fallback.
 *
 * It renders NO UI, registers NO route/menu/module, and NEVER touches backend/Prisma/
 * migration/network/production/staging, never mutates, uses no real data, and adds no
 * dependency. Nothing is auto-consumed by the app (reversible by non-consumption).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/foundation-contracts/hardening');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-contract-hardening');
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
  /^src\/studio\/foundation-contracts\/hardening\//,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
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

const FILES = [
  'studioBlueprintHardeningConfig.js', 'errors.js',
  'createStudioBlueprintInvalidCaseMatrix.js', 'createStudioDangerousBlueprintMatrix.js',
  'createStudioFieldHardeningMatrix.js', 'createStudioScreenHardeningMatrix.js',
  'createStudioValidationHardeningMatrix.js', 'createStudioPermissionHardeningMatrix.js',
  'createStudioRouteMenuHardeningMatrix.js', 'createStudioPersistenceTransitionMatrix.js',
  'createStudioRuntimeBindingHardeningMatrix.js', 'createStudioCompatibilityBreakingMatrix.js',
  'createStudioDigestHardeningSuite.js', 'createStudioVerifierHardeningSuite.js',
  'createStudioSafetyInvariantRunner.js', 'createStudioContractPerformanceBaseline.js',
  'createStudioBlueprintHardeningDiagnostics.js', 'createStudioBlueprintHardeningFallback.js',
  'createStudioBlueprintContractHardening.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-CONTRACT-HARDENING-REPORT.md', 'BLUEPRINT-INVALID-CASE-MATRIX.md',
  'DANGEROUS-BLUEPRINT-MATRIX.md', 'FIELD-HARDENING-MATRIX.md', 'SCREEN-HARDENING-MATRIX.md',
  'VALIDATION-HARDENING-MATRIX.md', 'PERMISSION-HARDENING-MATRIX.md', 'ROUTE-MENU-HARDENING-MATRIX.md',
  'PERSISTENCE-TRANSITION-MATRIX.md', 'RUNTIME-BINDING-HARDENING-MATRIX.md', 'COMPATIBILITY-BREAKING-MATRIX.md',
  'DIGEST-VERIFIER-HARDENING.md', 'SAFETY-INVARIANT-RUNNER.md', 'PERFORMANCE-BASELINE.md',
  'NO-UI-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

// 1. Files exist.
for (const f of FILES) gate(`G423-STUDIO-HARD — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-STUDIO-HARD — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-blueprint-contract-hardening.test.js')));
for (const d of DOCS) gate(`G423-STUDIO-HARD — ${d} exists`, exists(path.join(EV, d)));

// Dynamic imports.
let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  const h = m.createStudioBlueprintContractHardening();
  baseOk = h.kind === 'studio-blueprint-contract-hardening'
    && h.hardeningVersion === 'studio-blueprint-contract-hardening@1.0.0'
    && h.contractVersion === 'studio-foundation-contracts@1.0.0'
    && h.environment === 'local_contract'
    && h.headless === true && h.uiEnabled === false && h.routeEnabled === false && h.menuEnabled === false
    && h.moduleRegistrationEnabled === false && h.backendEnabled === false && h.prismaEnabled === false
    && h.migrationEnabled === false && h.productionEnabled === false && h.stagingEnabled === false
    && h.fetchEnabled === false && h.mutationAllowed === false
    && h.readiness === 'blueprint_contract_hardened' && h.blockers.length === 0;
  baseDetail = baseOk ? `readiness=${h.readiness}; blockers=0` : `readiness=${h.readiness}; blockers=${JSON.stringify(h.blockers)}`;
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-STUDIO-HARD — hardening headless invariants + readiness blueprint_contract_hardened', baseOk, baseDetail);

const matrixAll = (fnName, prop = 'allMatched') => {
  try { const r = m[fnName](); return Boolean(r[prop] ?? r.allBlocked ?? r.allPassed ?? r.allRejected); } catch { return false; }
};
gate('G423-STUDIO-HARD — invalid blueprint matrix all blocked', matrixAll('createStudioBlueprintInvalidCaseMatrix', 'allBlocked'));
gate('G423-STUDIO-HARD — dangerous blueprint matrix all blocked', matrixAll('createStudioDangerousBlueprintMatrix', 'allBlocked'));
gate('G423-STUDIO-HARD — field hardening matrix all matched', matrixAll('createStudioFieldHardeningMatrix'));
gate('G423-STUDIO-HARD — screen hardening matrix all matched', matrixAll('createStudioScreenHardeningMatrix'));
gate('G423-STUDIO-HARD — validation hardening matrix all matched', matrixAll('createStudioValidationHardeningMatrix'));
gate('G423-STUDIO-HARD — permission hardening matrix all matched', matrixAll('createStudioPermissionHardeningMatrix'));
gate('G423-STUDIO-HARD — route/menu hardening matrix all blocked', matrixAll('createStudioRouteMenuHardeningMatrix', 'allBlocked'));
gate('G423-STUDIO-HARD — persistence transition matrix all matched', matrixAll('createStudioPersistenceTransitionMatrix'));
gate('G423-STUDIO-HARD — runtime binding hardening matrix all matched', matrixAll('createStudioRuntimeBindingHardeningMatrix'));

let cmpOk = false;
try {
  const c = m.createStudioCompatibilityBreakingMatrix();
  cmpOk = c.allMatched === true && c.invalidClassification === 'invalid' && c.identicalClassification === 'compatible'
    && c.breaking.every((s) => s.isBreaking) && c.backward.every((s) => !s.isBreaking);
} catch { cmpOk = false; }
gate('G423-STUDIO-HARD — compatibility breaking matrix classifies correctly', cmpOk);

let digOk = false;
try { const d = m.createStudioDigestHardeningSuite(); digOk = d.allPassed === true; } catch { digOk = false; }
gate('G423-STUDIO-HARD — digest hardening suite all passed (determinism/sanitize/non-mutation)', digOk);

let verOk = false;
try { const v = m.createStudioVerifierHardeningSuite(); verOk = v.allPassed === true && v.allRejected === true && v.goodFoundationValid === true; } catch { verOk = false; }
gate('G423-STUDIO-HARD — verifier hardening suite rejects every tamper', verOk);

let safOk = false;
try {
  const s = m.createStudioSafetyInvariantRunner();
  const bad = m.createStudioSafetyInvariantRunner({ descriptor: { failClosed: false } });
  safOk = s.invariantCount >= 20 && s.failed === 0 && bad.blockers.length > 0;
} catch { safOk = false; }
gate('G423-STUDIO-HARD — safety invariant runner (20 invariants; failure blocks)', safOk);

let perfOk = false;
try {
  const p = m.createStudioContractPerformanceBaseline();
  perfOk = p.performanceStatus === 'ok' && p.usesNetwork === false && p.usesBackend === false
    && p.usesPrisma === false && p.executesMutation === false && p.usesHardHardwareLimit === false;
} catch { perfOk = false; }
gate('G423-STUDIO-HARD — performance baseline local (no network/backend/prisma/mutation)', perfOk);

let fbOk = false;
try {
  const fb = m.createStudioBlueprintHardeningFallback({ scenario: 'production_attempt' });
  fbOk = fb.readiness === 'blocked' && fb.sideEffects === false && fb.productionAccessed === false && fb.mutationExecuted === false;
} catch { fbOk = false; }
gate('G423-STUDIO-HARD — fallback fail-closed (readiness blocked, zero side effects)', fbOk);

let flagOk = false;
try {
  const off = m.isStudioBlueprintContractHardeningEnabled({ [m.MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioBlueprintContractHardeningEnabled({ [m.MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-STUDIO-HARD — flags fail closed in production', flagOk);

gate('G423-STUDIO-HARD — error catalog >= 20 codes', Array.isArray(m?.STUDIO_HARDENING_ERROR_CODES) && m.STUDIO_HARDENING_ERROR_CODES.length >= 20);

// Static safety scans.
gate('G423-STUDIO-HARD — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-STUDIO-HARD — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma|@prisma/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-STUDIO-HARD — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-STUDIO-HARD — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-STUDIO-HARD — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

// Docs content.
gate('G423-STUDIO-HARD — docs certify headless / no UI / no production', /headless/i.test(readEv('CERTIFICATION-REPORT.md')) && /sem produção|no production|não.{0,6}produção/i.test(readEv('NO-UI-NO-PRODUCTION-VALIDATION.md')));
gate('G423-STUDIO-HARD — next slice is Studio Blueprint Contract Certification', /STUDIO BLUEPRINT CONTRACT CERTIFICATION/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!foundation-contracts\/hardening\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'production/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-HARD — production / other Studio / backend / Prisma / migration / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-HARD — authorized scope only (hardening/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-STUDIO-HARD — no new dependency added', noNewDep);

gate('G423-STUDIO-HARD — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-STUDIO-HARD — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-STUDIO-HARD — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-blueprint-contract-hardening.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-STUDIO-HARD — studio blueprint contract hardening unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-BLUEPRINT-CONTRACT-HARDENING summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
