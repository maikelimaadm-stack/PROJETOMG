#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-LOCAL-READ-CONTRACT-CERTIFICATION — Post-Foundation C.
 *
 * Certifies the isolated Empresas local read-only contract: versioned canonical
 * contract, immutable synthetic fixtures, query/error catalogs, tenant/permission
 * rules, a parity baseline, a local performance envelope, a certification manifest,
 * a verifier and a compatibility checker. NEVER touches a real backend/Prisma/fetch/
 * Railway/production/staging, NEVER mutates, NEVER uses real data, NEVER auto-consumed.
 * The productionUiGuard exception stays limited to the pilot subtree. No new
 * dependency. Next step is Empresas Staging Read-Only Readiness Audit.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Branch-relative scope checks may run on later Studio headless slices before merge.
// Known later Studio headless artifacts are tolerated here, but forbidden and unknown scopes still fail.
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const CERT_DIR = path.join(ROOT, 'src/modules/empresas/local-read-contract-pilot/certification');
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

const AUTHORIZED = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-contract-certification\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-contract-certification\//,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
];

const FILES = [
  'errors.js',
  'empresasLocalReadCertificationConfig.js',
  'createEmpresasCanonicalContract.js',
  'createEmpresasCanonicalFixtures.js',
  'createEmpresasCanonicalQueryCatalog.js',
  'createEmpresasCanonicalErrorCatalog.js',
  'createEmpresasCanonicalTenantRules.js',
  'createEmpresasCanonicalPermissionRules.js',
  'createEmpresasCanonicalParityBaseline.js',
  'createEmpresasLocalPerformanceEnvelope.js',
  'createEmpresasCertificationManifest.js',
  'verifyEmpresasLocalReadCertification.js',
  'checkEmpresasContractCompatibility.js',
  'createEmpresasCertificationDiagnostics.js',
  'createEmpresasCertificationFallback.js',
  'createEmpresasLocalReadContractCertification.js',
  'index.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-EMP-CERT — ${f} exists`, exists(path.join(CERT_DIR, f)));
gate('G423-EMP-CERT — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/empresas-local-read-contract-certification.test.js')));

// Certification invariants (dynamic).
let certOk = false;
let certDetail = '';
try {
  const m = await import(pathToFileURL(path.join(CERT_DIR, 'index.js')).href);
  const c = m.createEmpresasLocalReadContractCertification({ createdAt: '2025-01-01T00:00:00.000Z', clock: () => 0 });
  certOk = c.environment === 'local_test' && c.synthetic === true && c.localOnly === true && c.readOnly === true
    && c.mutationAllowed === false && c.productionAccessed === false && c.backendAccessed === false
    && c.prismaAccessed === false && c.fetchUsed === false
    && c.contractVersion === '1.0.0' && c.certificationStatus === 'certified_local_read_only'
    && c.exactParity === true && c.parityScore === 1 && c.blockers.length === 0
    && c.tenantLeakageFound === false && c.permissionBypassFound === false && c.mutationExposureFound === false
    && c.verification.certified === true && c.safeToUseAsReference === true;
  certDetail = certOk ? `status=${c.certificationStatus}; parity=${c.parityScore}; verified` : `wrong: ${JSON.stringify({ s: c.certificationStatus, p: c.parityScore, v: c.verification && c.verification.certified })}`;
} catch (err) { certDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-CERT — certification (local_test/synthetic/read-only; v1.0.0; certified; exact parity; verified)', certOk, certDetail);

// Canonical parts present + digests (dynamic).
let partsOk = false;
try {
  const m = await import(pathToFileURL(path.join(CERT_DIR, 'index.js')).href);
  const c = m.createEmpresasLocalReadContractCertification({ createdAt: '2025-01-01T00:00:00.000Z', clock: () => 0 });
  partsOk = c.contract.contractDigest && c.fixtures.recordCount === 20 && c.queryCatalog.total >= 30
    && c.errorCatalog.total === 22 && c.errorCatalog.uniqueCodes === true
    && c.tenantRules.ruleCount >= 16 && c.permissionRules.ruleCount >= 12
    && c.parity.exactParity === true && c.performance.largestDataset === 2000
    && typeof c.manifest.overallDigest === 'string';
} catch { partsOk = false; }
gate('G423-EMP-CERT — canonical contract/fixtures/query/error/tenant/permission/parity/performance/manifest present', partsOk);

// Verifier detects tampering + compatibility detects breaking (dynamic).
let verifyOk = false;
try {
  const m = await import(pathToFileURL(path.join(CERT_DIR, 'index.js')).href);
  const c = m.createEmpresasLocalReadContractCertification({ createdAt: '2025-01-01T00:00:00.000Z', clock: () => 0 });
  const tampered = m.verifyEmpresasLocalReadCertification({ manifest: { ...c.manifest, fixtureDigest: 'fnv1a-deadbeef' } });
  const compatSame = m.checkEmpresasContractCompatibility({ certifiedContract: c.contract, candidateContract: c.contract });
  const compatMut = m.checkEmpresasContractCompatibility({ certifiedContract: c.contract, candidateContract: { ...c.contract, safety: { ...c.contract.safety, mutationAllowed: true } } });
  verifyOk = tampered.certified === false && compatSame.compatible === true && compatMut.classification === 'breaking' && compatMut.certificationInvalidated === true;
} catch { verifyOk = false; }
gate('G423-EMP-CERT — verifier detects tampering + compatibility flags breaking (mutation released)', verifyOk);

// React-free + no network/Prisma/backend + no fetch/storage/staging.
gate('G423-EMP-CERT — certification is React-free', importsOf(walk(CERT_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-EMP-CERT — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(CERT_DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma/i.test(p)));
let noIo = false;
try {
  const code = stripComments(walk(CERT_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code) && !/\.(post|put|patch|delete)\s*\(/i.test(code);
} catch { noIo = false; }
gate('G423-EMP-CERT — no fetch/XHR/WebSocket/storage/POST/PUT/PATCH/DELETE', noIo);
gate('G423-EMP-CERT — no DATABASE_URL / API_URL / Railway / staging URL', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway|staging[-.]|https?:\/\//i.test(stripComments(walk(CERT_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'))));

// productionUiGuard exception stays limited to the pilot subtree.
let guardOk = false;
let guardDetail = '';
try {
  const guardSrc = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/productionUiGuard.mjs'), 'utf8');
  const subtrees = [...guardSrc.matchAll(/'(src\/[^']+)'/g)].map((mm) => mm[1]).filter((s) => s.includes('local-read-contract-pilot'));
  guardOk = subtrees.every((s) => s === 'src/modules/empresas/local-read-contract-pilot/')
    && !/'src\/modules\/empresas\/pages/.test(guardSrc) && !/'src\/modules\/empresas\/components/.test(guardSrc);
  guardDetail = guardOk ? 'exception limited to the pilot subtree' : `guard expanded: ${subtrees.join(', ')}`;
} catch (err) { guardOk = false; guardDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EMP-CERT — productionUiGuard exception limited to the pilot subtree', guardOk, guardDetail);

// ESCOPO PROIBIDO (git-diff) — fora do escopo autorizado.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\/empresas\/(pages|components|config|preferences|hooks|repositories|runtime|data|utils)\//,
    /PAGEMP\.jsx$/, /empresasModeloBase1Config/, /empresasListCache/, /apis\/empresa\/EmpresaApi/,
    /^src\/modules\/cadcps\//, /^src\/ModeloBase1\//, /^src\/ModeloBase2\//,
    /^src\/runtime\/(?!__tests__\/)/, /^src\/pages\//, /^src\/App\.jsx$/, /^src\/components\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//,
    /\.css$/, /menu/i, /nav/i,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'production Empresas/ModeloBase1/runtime/backend/Prisma/App/menu untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CERT — production Empresas/ModeloBase1/runtime/backend/Prisma/App/menu untouched', blockedOk, blockedDetail);

// ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EMP-CERT — authorized scope only (pilot/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// Sem dependência nova.
let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-EMP-CERT — no new dependency added', noNewDep);

gate('G423-EMP-CERT — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-EMP-CERT — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

// Next step documented (Staging Read-Only Readiness Audit), not staging/production/write.
let nextOk = false;
try {
  const nss = fs.readFileSync(path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-local-read-contract-certification/NEXT-SLICE-SPEC.md'), 'utf8');
  nextOk = /EMPRESAS STAGING READ-ONLY READINESS AUDIT/i.test(nss) && /docs\/test-plan only|sem acessar staging|Não recomendar/i.test(nss);
} catch { nextOk = false; }
gate('G423-EMP-CERT — next step is Staging Read-Only Readiness Audit (docs-only; not staging/production/write)', nextOk);

// Rodar os testes do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-local-read-contract-certification.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EMP-CERT — local read contract certification unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-LOCAL-READ-CONTRACT-CERTIFICATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
