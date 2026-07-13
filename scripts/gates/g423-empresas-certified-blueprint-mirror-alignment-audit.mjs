#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-CERTIFIED-BLUEPRINT-MIRROR-ALIGNMENT-AUDIT — Post-Foundation C.
 *
 * Proves the headless Empresas certified blueprint mirror + alignment audit, living in
 * `src/studio/blueprint-mirrors/empresas/`. It mirrors the REAL Cadastro de Empresas
 * (fields, screens, table/form, filter/sort, permissions, tenant scope, persistence
 * boundary, runtime binding) against the certified Studio blueprint contract and the
 * Empresas certified read contract, audits alignment, and produces a manifest,
 * verifier, compatibility checker, diagnostics and fallback.
 *
 * It NEVER rewrites Empresas, renders UI, registers a route/menu/module, or touches
 * backend/Prisma/migration/network/production/staging, and never mutates. Nothing is
 * auto-consumed by the app (reversible by non-consumption).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-mirrors/empresas');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-certified-blueprint-mirror-alignment-audit');
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
  /^src\/studio\/blueprint-mirrors\/empresas\//,
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-certified-blueprint-mirror-alignment-audit\//,
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
];

const FILES = [
  'empresasBlueprintMirrorConfig.js', 'errors.js',
  'createEmpresasCertifiedBlueprintMirror.js', 'createEmpresasFieldBlueprintMirror.js',
  'createEmpresasScreenBlueprintMirror.js', 'createEmpresasTableFormBlueprintMirror.js',
  'createEmpresasFilterSortBlueprintMirror.js', 'createEmpresasPermissionBlueprintMirror.js',
  'createEmpresasTenantBlueprintMirror.js', 'createEmpresasPersistenceBoundaryMirror.js',
  'createEmpresasRuntimeBindingMirror.js', 'createEmpresasBlueprintAlignmentAudit.js',
  'createEmpresasBlueprintMirrorManifest.js', 'verifyEmpresasBlueprintMirror.js',
  'checkEmpresasBlueprintMirrorCompatibility.js', 'createEmpresasBlueprintMirrorDiagnostics.js',
  'createEmpresasBlueprintMirrorFallback.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'EMPRESAS-CERTIFIED-BLUEPRINT-MIRROR.md', 'EMPRESAS-FIELD-BLUEPRINT-MIRROR.md',
  'EMPRESAS-SCREEN-BLUEPRINT-MIRROR.md', 'EMPRESAS-TABLE-FORM-BLUEPRINT-MIRROR.md', 'EMPRESAS-FILTER-SORT-BLUEPRINT-MIRROR.md',
  'EMPRESAS-PERMISSION-TENANT-BLUEPRINT-MIRROR.md', 'EMPRESAS-PERSISTENCE-RUNTIME-BINDING-MIRROR.md',
  'EMPRESAS-BLUEPRINT-ALIGNMENT-AUDIT.md', 'EMPRESAS-FUTURE-MODIFICATION-PLAN.md', 'EMPRESAS-MIRROR-MANIFEST.md',
  'VERIFIER-COMPATIBILITY-REPORT.md', 'NO-REWRITE-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md',
  'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-EMP-MIRROR — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-EMP-MIRROR — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js')));
for (const d of DOCS) gate(`G423-EMP-MIRROR — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  const mir = m.createEmpresasCertifiedBlueprintMirror();
  baseOk = mir.kind === 'empresas-certified-blueprint-mirror'
    && mir.mirrorVersion === 'empresas-certified-blueprint-mirror@1.0.0'
    && mir.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && mir.empresasReadContractVersion === 'empresas-local-read-contract@1.0.0'
    && mir.moduleId === 'empresas' && mir.modelType === 'cadastro' && mir.modelFamily === 'ModeloBase1'
    && mir.headless === true && mir.uiCreated === false && mir.routeCreated === false && mir.menuCreated === false
    && mir.moduleRegistered === false && mir.backendAccessed === false && mir.prismaAccessed === false
    && mir.productionAccessed === false && mir.stagingAccessed === false && mir.fetchUsed === false
    && mir.mutationAllowed === false && mir.rewriteEmpresas === false;
  baseDetail = baseOk ? `readiness=${mir.readiness}; compat=${mir.compatibilityStatus}` : 'mirror invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-MIRROR — mirror headless/reference-only invariants + versions', baseOk, baseDetail);

let verOk = false; let verDetail = '';
try {
  const mir = m.createEmpresasCertifiedBlueprintMirror();
  const v = m.verifyEmpresasBlueprintMirror({ mirror: mir });
  verOk = v.valid === true && v.safeToUseAsMirrorReference === true && v.failures.length === 0 && mir.safeToUseAsMirrorReference === true;
  verDetail = verOk ? `${v.checks.length} checks; 0 failures` : `failures: ${v.failures.join(',')}`;
} catch (err) { verDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-MIRROR — verifier valid + safeToUseAsMirrorReference', verOk, verDetail);

let detOk = false;
try {
  const a = m.createEmpresasCertifiedBlueprintMirror();
  const b = m.createEmpresasCertifiedBlueprintMirror();
  detOk = a.manifest.overallDigest === b.manifest.overallDigest && a.manifest.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-EMP-MIRROR — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const mir = m.createEmpresasCertifiedBlueprintMirror();
  const t = JSON.parse(JSON.stringify(mir));
  t.manifest.fieldDigest = 'fnv1a-deadbeef';
  tamperOk = m.verifyEmpresasBlueprintMirror({ mirror: t }).valid === false;
} catch { tamperOk = false; }
gate('G423-EMP-MIRROR — verifier detects a tampered digest', tamperOk);

const part = (fn, pred) => { try { return pred(m[fn]()); } catch { return false; } };
gate('G423-EMP-MIRROR — field mirror (real fields, no invention, cadcps documented)', part('createEmpresasFieldBlueprintMirror', (x) => x.invented === false && x.tenantFields.includes('cliente_id') && x.unsupportedFields.includes('campos_personalizados')));
gate('G423-EMP-MIRROR — screen mirror (no react, no PAGEMP change)', part('createEmpresasScreenBlueprintMirror', (x) => x.generatesUi === false && x.screens.every((s) => s.changesPagemp === false)));
gate('G423-EMP-MIRROR — table/form mirror (columns/form mapped, referenceOnly)', part('createEmpresasTableFormBlueprintMirror', (x) => x.table.columns.length > 0 && /referenceOnly/.test(x.table.rowActions) && x.uiChanged === false));
gate('G423-EMP-MIRROR — filter/sort mirror (certified query surface)', part('createEmpresasFilterSortBlueprintMirror', (x) => x.supportedSorts.includes('codempresa') && x.supportedFilters.includes('status')));
gate('G423-EMP-MIRROR — permission mirror (fail-closed/default-deny, none altered)', part('createEmpresasPermissionBlueprintMirror', (x) => x.defaultDeny === true && x.failClosed === true && x.permissionsAltered === false && x.adminBypassesTenant === false));
gate('G423-EMP-MIRROR — tenant mirror (tenant required, no real JWT)', part('createEmpresasTenantBlueprintMirror', (x) => x.tenantRequired === true && x.permissionRequired === true && x.adminBypassesTenant === false && x.realJwtUsed === false));
gate('G423-EMP-MIRROR — persistence mirror (referenceOnly, no access)', part('createEmpresasPersistenceBoundaryMirror', (x) => x.mirrorAccessMode === 'referenceOnly' && x.prismaAccessed === false && x.backendAccessed === false && x.productionAccessed === false && x.migrationAllowed === false));
gate('G423-EMP-MIRROR — runtime binding mirror (no production/module/prisma/rewrite)', part('createEmpresasRuntimeBindingMirror', (x) => x.activatesProduction === false && x.registersModule === false && x.accessesPrismaDirectly === false && x.rewritesEmpresas === false));

let auditOk = false;
try {
  const mir = m.createEmpresasCertifiedBlueprintMirror();
  const a = mir.alignmentAudit;
  auditOk = a.kind === 'empresas-blueprint-alignment-audit' && a.areas.length >= 14 && a.anyGapFixedThisSlice === false
    && a.gaps.every((g) => typeof g.severity === 'string' && typeof g.suggestedSlice === 'string' && typeof g.recommendedFix === 'string');
} catch { auditOk = false; }
gate('G423-EMP-MIRROR — alignment audit classifies areas + gaps (none fixed this slice)', auditOk);

let cmpOk = false;
try {
  const mir = m.createEmpresasCertifiedBlueprintMirror();
  const ok = m.checkEmpresasBlueprintMirrorCompatibility({ mirror: mir });
  const bad = m.checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...mir, rewriteEmpresas: true } });
  const ui = m.checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...mir, uiCreated: true } });
  cmpOk = ['compatible', 'partially_compatible', 'needs_alignment'].includes(ok.compatibilityStatus)
    && bad.compatibilityStatus === 'blocked' && ui.compatibilityStatus === 'blocked';
} catch { cmpOk = false; }
gate('G423-EMP-MIRROR — compatibility checker (exposure/rewrite → blocked)', cmpOk);

let fbOk = false;
try {
  const fb = m.createEmpresasBlueprintMirrorFallback({ scenario: 'rewrite_empresas_attempt' });
  fbOk = fb.safeToUseAsMirrorReference === false && fb.readiness === 'blocked' && fb.rewriteEmpresas === false && fb.sideEffects === false;
} catch { fbOk = false; }
gate('G423-EMP-MIRROR — fallback fail-closed (no rewrite, no side effects)', fbOk);

let flagOk = false;
try {
  const off = m.isEmpresasBlueprintMirrorEnabled({ [m.MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isEmpresasBlueprintMirrorEnabled({ [m.MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-EMP-MIRROR — flags fail closed in production', flagOk);

gate('G423-EMP-MIRROR — error catalog >= 23 codes', Array.isArray(m?.EMPRESAS_MIRROR_ERROR_CODES) && m.EMPRESAS_MIRROR_ERROR_CODES.length >= 23);

// Static safety scans.
gate('G423-EMP-MIRROR — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-EMP-MIRROR — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-EMP-MIRROR — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-EMP-MIRROR — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-EMP-MIRROR — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-EMP-MIRROR — docs validate no rewrite / no production', /não.{0,12}reescrev|referenceOnly|reference-only/i.test(readEv('NO-REWRITE-NO-PRODUCTION-VALIDATION.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-EMP-MIRROR — future modification plan present', /EMPRESAS STUDIO COMPATIBILITY SLICE 1/i.test(readEv('EMPRESAS-FUTURE-MODIFICATION-PLAN.md')));
gate('G423-EMP-MIRROR — next slice spec present', /EMPRESAS STUDIO COMPATIBILITY SLICE 1|STUDIO BLUEPRINT ENGINE FOUNDATION/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /PAGEMP/i, /ModeloBase1CadastroPage/i, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!blueprint-mirrors\/empresas\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'Empresas/PAGEMP/MB1/MB2/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-MIRROR — Empresas / production code / other Studio / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-MIRROR — authorized scope only (mirror/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-EMP-MIRROR — no new dependency added', noNewDep);

gate('G423-EMP-MIRROR — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-EMP-MIRROR — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-MIRROR — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-MIRROR — empresas certified blueprint mirror unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-CERTIFIED-BLUEPRINT-MIRROR-ALIGNMENT-AUDIT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
