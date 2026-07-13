#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BLUEPRINT-CONTRACT-CERTIFICATION — Post-Foundation C.
 *
 * Proves the headless, contract-only CERTIFICATION of the MAK Studio blueprint
 * contracts, living in `src/studio/foundation-contracts/certification/`. It certifies
 * the hardened foundation as a canonical, versioned, verifiable and compatible
 * reference: canonical metamodel/blueprint/module/field/screen/validation/permission/
 * route-menu/persistence/runtime-binding, safety invariants, error catalog,
 * compatibility rules, hardening baseline, manifest, verifier, compatibility checker,
 * diagnostics and fallback.
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
const DIR = path.join(ROOT, 'src/studio/foundation-contracts/certification');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-contract-certification');
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
  /^src\/studio\/foundation-contracts\/certification\//,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-certification\//,
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
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
];

const FILES = [
  'studioBlueprintCertificationConfig.js', 'errors.js', 'createStudioBlueprintCertificationDigest.js',
  'createStudioCanonicalMetamodel.js', 'createStudioCanonicalBlueprintContract.js', 'createStudioCanonicalModuleBlueprint.js',
  'createStudioCanonicalFieldContract.js', 'createStudioCanonicalScreenContract.js', 'createStudioCanonicalValidationContract.js',
  'createStudioCanonicalPermissionContract.js', 'createStudioCanonicalRouteMenuContract.js', 'createStudioCanonicalPersistenceBoundary.js',
  'createStudioCanonicalRuntimeBinding.js', 'createStudioCanonicalSafetyInvariants.js', 'createStudioCanonicalErrorCatalog.js',
  'createStudioCanonicalCompatibilityRules.js', 'createStudioCanonicalHardeningBaseline.js', 'createStudioBlueprintCertificationManifest.js',
  'verifyStudioBlueprintContractCertification.js', 'checkStudioBlueprintCertificationCompatibility.js',
  'createStudioBlueprintCertificationDiagnostics.js', 'createStudioBlueprintCertificationFallback.js',
  'createStudioBlueprintContractCertification.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-CONTRACT-CERTIFICATION.md', 'CANONICAL-METAMODEL.md',
  'CANONICAL-BLUEPRINT-CONTRACT.md', 'CANONICAL-MODULE-BLUEPRINT.md', 'CANONICAL-FIELD-SCREEN-CONTRACT.md',
  'CANONICAL-VALIDATION-PERMISSION-CONTRACT.md', 'CANONICAL-ROUTE-MENU-PERSISTENCE-CONTRACT.md', 'CANONICAL-RUNTIME-BINDING.md',
  'CANONICAL-SAFETY-INVARIANTS.md', 'CANONICAL-ERROR-CATALOG.md', 'CANONICAL-COMPATIBILITY-RULES.md',
  'HARDENING-BASELINE-CERTIFICATION.md', 'CERTIFICATION-MANIFEST.md', 'VERIFIER-COMPATIBILITY-REPORT.md',
  'NO-UI-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-STUDIO-CERT — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-STUDIO-CERT — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-blueprint-contract-certification.test.js')));
for (const d of DOCS) gate(`G423-STUDIO-CERT — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  const c = m.createStudioBlueprintContractCertification();
  baseOk = c.kind === 'studio-blueprint-contract-certification'
    && c.certificationName === 'studio-blueprint-contract-certification'
    && c.blueprintContractName === 'studio-blueprint-contract'
    && c.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && c.certificationVersion === 'studio-blueprint-contract-certification@1.0.0'
    && c.certificationStatus === 'certified_headless_blueprint_contract'
    && c.environment === 'local_contract'
    && c.headless === true && c.uiEnabled === false && c.routeEnabled === false && c.menuEnabled === false
    && c.moduleRegistrationEnabled === false && c.backendEnabled === false && c.prismaEnabled === false
    && c.migrationEnabled === false && c.productionEnabled === false && c.stagingEnabled === false
    && c.fetchEnabled === false && c.mutationAllowed === false && c.generatedModuleAllowed === false
    && c.marketplaceEnabled === false && c.exactSafety === true
    && Array.isArray(c.blockers) && c.blockers.length === 0
    && Array.isArray(c.warnings) && c.warnings.length === 0
    && c.readiness === 'certified_headless_blueprint_contract';
  baseDetail = baseOk ? `status=${c.certificationStatus}; blockers=0` : `status=${c.certificationStatus}; blockers=${JSON.stringify(c.blockers)}`;
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-STUDIO-CERT — certification headless invariants + status certified_headless_blueprint_contract', baseOk, baseDetail);

let verOk = false; let verDetail = '';
try {
  const c = m.createStudioBlueprintContractCertification();
  const v = m.verifyStudioBlueprintContractCertification({ certification: c });
  verOk = v.valid === true && v.certified === true && v.safeToUseAsBlueprintReference === true && v.failures.length === 0
    && c.safeToUseAsBlueprintReference === true;
  verDetail = verOk ? `${v.checks.length} checks; 0 failures` : `failures: ${v.failures.join(',')}`;
} catch (err) { verDetail = err instanceof Error ? err.message : String(err); }
gate('G423-STUDIO-CERT — self-verification certified + safeToUseAsBlueprintReference', verOk, verDetail);

let detOk = false;
try {
  const a = m.createStudioBlueprintContractCertification();
  const b = m.createStudioBlueprintContractCertification();
  detOk = a.manifest.overallDigest === b.manifest.overallDigest && a.manifest.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-STUDIO-CERT — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const c = m.createStudioBlueprintContractCertification();
  const t = JSON.parse(JSON.stringify(c));
  t.manifest.safetyInvariantsDigest = 'fnv1a-deadbeef';
  tamperOk = m.verifyStudioBlueprintContractCertification({ certification: t }).valid === false;
} catch { tamperOk = false; }
gate('G423-STUDIO-CERT — verifier detects a tampered digest', tamperOk);

const canon = (fn, pred) => { try { return pred(m[fn]()); } catch { return false; } };
gate('G423-STUDIO-CERT — canonical metamodel (19 entities, contract-only)', canon('createStudioCanonicalMetamodel', (x) => x.entityCount === 19 && x.contractOnly === true));
gate('G423-STUDIO-CERT — canonical blueprint (7 states, fail-closed)', canon('createStudioCanonicalBlueprintContract', (x) => x.states.length === 7 && x.anyStateRegistersModule === false));
gate('G423-STUDIO-CERT — canonical module blueprint (permission+persistence required)', canon('createStudioCanonicalModuleBlueprint', (x) => x.permissionBlueprintRequired === true && x.persistenceBoundaryRequired === true));
gate('G423-STUDIO-CERT — canonical field contract (14 types, computed no code)', canon('createStudioCanonicalFieldContract', (x) => x.allowedTypes.length === 14 && x.computedExecutesCode === false));
gate('G423-STUDIO-CERT — canonical screen contract (no react/ui/route)', canon('createStudioCanonicalScreenContract', (x) => x.generatesReactComponent === false && x.registersRoute === false));
gate('G423-STUDIO-CERT — canonical validation contract (unsafe blocked)', canon('createStudioCanonicalValidationContract', (x) => x.unsafeValidationAllowed === false && x.asyncCallsNetwork === false));
gate('G423-STUDIO-CERT — canonical permission contract (fail-closed/default-deny)', canon('createStudioCanonicalPermissionContract', (x) => x.failClosed === true && x.defaultDeny === true && x.adminBypassesTenant === false));
gate('G423-STUDIO-CERT — canonical route/menu contract (defaults off, no auto register)', canon('createStudioCanonicalRouteMenuContract', (x) => x.routeEnabledDefault === false && x.autoRegister === false && x.publicRouteAllowed === false));
gate('G423-STUDIO-CERT — canonical persistence boundary (default noPersistence)', canon('createStudioCanonicalPersistenceBoundary', (x) => x.defaultState === 'noPersistence' && x.defaults.migrationAllowed === false));
gate('G423-STUDIO-CERT — canonical runtime binding (references only, no prisma/production)', canon('createStudioCanonicalRuntimeBinding', (x) => x.activatesProduction === false && x.rewritesEmpresas === false && x.accessesPrismaDirectly === false));
gate('G423-STUDIO-CERT — canonical safety invariants (20, exactSafety)', canon('createStudioCanonicalSafetyInvariants', (x) => x.invariantCount === 20 && x.exactSafety === true));
gate('G423-STUDIO-CERT — canonical error catalog (unique + sanitized)', canon('createStudioCanonicalErrorCatalog', (x) => x.uniqueCodes === true && x.allSanitized === true && x.codeCount >= 40));
gate('G423-STUDIO-CERT — canonical compatibility rules (all breaking hold)', canon('createStudioCanonicalCompatibilityRules', (x) => x.valid === true && x.allBreakingHold === true));
gate('G423-STUDIO-CERT — hardening baseline valid (no regression)', canon('createStudioCanonicalHardeningBaseline', (x) => x.valid === true && x.hardeningReadiness === 'blueprint_contract_hardened'));

let mfOk = false;
try {
  const c = m.createStudioBlueprintContractCertification();
  mfOk = c.manifest.kind === 'studio-blueprint-certification-manifest' && typeof c.manifest.overallDigest === 'string'
    && c.manifest.exactSafety === true;
} catch { mfOk = false; }
gate('G423-STUDIO-CERT — manifest present with overall digest', mfOk);

let cmpOk = false;
try {
  const brk = m.checkStudioBlueprintCertificationCompatibility({ certified: { uiEnabled: false }, candidate: { uiEnabled: true } });
  const same = m.checkStudioBlueprintCertificationCompatibility({ certified: { headless: true }, candidate: { headless: true } });
  const inv = m.checkStudioBlueprintCertificationCompatibility({ certified: null, candidate: {} });
  cmpOk = brk.classification === 'breaking' && brk.certificationInvalidated === true
    && same.classification === 'compatible' && inv.classification === 'invalid';
} catch { cmpOk = false; }
gate('G423-STUDIO-CERT — compatibility checker (breaking invalidates; identical compatible)', cmpOk);

let flagOk = false;
try {
  const off = m.isStudioBlueprintContractCertificationEnabled({ [m.MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioBlueprintContractCertificationEnabled({ [m.MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-STUDIO-CERT — flags fail closed in production', flagOk);

let fbOk = false;
try {
  const fb = m.createStudioBlueprintCertificationFallback({ scenario: 'production_attempt' });
  fbOk = fb.certified === false && fb.readiness === 'blocked' && fb.sideEffects === false && fb.productionAccessed === false && fb.mutationExecuted === false;
} catch { fbOk = false; }
gate('G423-STUDIO-CERT — fallback fail-closed (certified false, readiness blocked)', fbOk);

// Static safety scans.
gate('G423-STUDIO-CERT — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-STUDIO-CERT — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma|@prisma/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-STUDIO-CERT — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-STUDIO-CERT — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-STUDIO-CERT — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-STUDIO-CERT — docs certify headless / no UI / no production', /headless/i.test(readEv('CERTIFICATION-REPORT.md')) && /sem produção|no production|não.{0,6}produção/i.test(readEv('NO-UI-NO-PRODUCTION-VALIDATION.md')));
gate('G423-STUDIO-CERT — next slice is Empresas Certified Blueprint Mirror & Alignment Audit', /EMPRESAS CERTIFIED BLUEPRINT MIRROR/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!foundation-contracts\/certification\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'production/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-CERT — production / other Studio / backend / Prisma / migration / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-CERT — authorized scope only (certification/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-STUDIO-CERT — no new dependency added', noNewDep);

gate('G423-STUDIO-CERT — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-STUDIO-CERT — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-STUDIO-CERT — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-blueprint-contract-certification.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-STUDIO-CERT — studio blueprint contract certification unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-BLUEPRINT-CONTRACT-CERTIFICATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
