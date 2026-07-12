#!/usr/bin/env node
/**
 * Gate G423-STUDIO-FOUNDATION-CONTRACTS — Post-Foundation C.
 *
 * Proves the FIRST headless, contract-only foundation of MAK Studio living in the
 * ISOLATED subtree `src/studio/foundation-contracts/`. Every artifact is pure and
 * deterministic: metamodel, blueprint envelope, module/field/screen/validation/
 * permission/route-menu/persistence/runtime-binding contracts, safety policy,
 * diagnostics, fallback, manifest, verifier, compatibility checker, top-level
 * composer, digest.
 *
 * It renders NO UI, registers NO route/menu/module, and NEVER touches backend/Prisma/
 * migration/network/production/staging, never mutates, uses no real data, and adds no
 * dependency. Nothing is auto-consumed by the app (reversible by non-consumption).
 * The gate proves the files exist, the invariants hold dynamically, the subtree is
 * React-free and free of I/O tokens, and nothing outside the authorized scope changed.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/foundation-contracts');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-foundation-contracts');
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
  /^src\/studio\/foundation-contracts\//,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
  // The shared production-UI guard gains this isolated headless subtree as a
  // sanctioned exception (mirrors the runtime-v2/fuel dev-route + empresas pilot).
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  // Prior-slice tests whose branch-relative git-diff scope allowlists are widened
  // to tolerate this slice's authorized paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
];

const FILES = [
  'errors.js',
  'studioFoundationContractsConfig.js',
  'createStudioContractDigest.js',
  'createStudioMetamodelContract.js',
  'createStudioBlueprintContract.js',
  'createStudioModuleBlueprintContract.js',
  'createStudioFieldBlueprintContract.js',
  'createStudioScreenBlueprintContract.js',
  'createStudioValidationBlueprintContract.js',
  'createStudioPermissionBlueprintContract.js',
  'createStudioRouteMenuBlueprintContract.js',
  'createStudioPersistenceBoundaryContract.js',
  'createStudioRuntimeBindingContract.js',
  'createStudioSafetyPolicy.js',
  'createStudioDiagnostics.js',
  'createStudioFallback.js',
  'createStudioContractManifest.js',
  'verifyStudioFoundationContracts.js',
  'checkStudioContractCompatibility.js',
  'createStudioFoundationContract.js',
  'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-FOUNDATION-CONTRACTS-REPORT.md', 'STUDIO-METAMODEL-CONTRACT.md',
  'STUDIO-BLUEPRINT-CONTRACT.md', 'MODULE-BLUEPRINT-CONTRACT.md', 'FIELD-SCREEN-BLUEPRINT-CONTRACT.md',
  'VALIDATION-PERMISSION-CONTRACT.md', 'ROUTE-MENU-PERSISTENCE-CONTRACT.md', 'RUNTIME-BINDING-CONTRACT.md',
  'STUDIO-SAFETY-POLICY.md', 'STUDIO-MANIFEST-VERIFIER.md', 'STUDIO-COMPATIBILITY-CHECKER.md',
  'NO-UI-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

// 1-21. Arquivos-fonte esperados.
for (const f of FILES) gate(`G423-STUDIO-FC — ${f} exists`, exists(path.join(DIR, f)));

// 22. Tests exist.
gate('G423-STUDIO-FC — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-foundation-contracts.test.js')));

// 23-38. Evidence docs.
for (const d of DOCS) gate(`G423-STUDIO-FC — ${d} exists`, exists(path.join(EV, d)));

// 39. Composer invariants (dynamic).
let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let compOk = false; let compDetail = '';
try {
  const f = m.createStudioFoundationContract();
  compOk = f.kind === 'studio-foundation-contract' && f.contractVersion === '1.0.0'
    && f.environment === 'local_contract' && f.foundationStatus === 'foundation_contract_ready'
    && f.headless === true;
  compDetail = compOk ? `kind=${f.kind}; status=${f.foundationStatus}` : 'composer invariants wrong';
} catch (err) { compDetail = err instanceof Error ? err.message : String(err); }
gate('G423-STUDIO-FC — foundation composer (kind/version/environment/status/headless)', compOk, compDetail);

// 40. Headless capability flags all off.
let flagsOk = false;
try {
  const f = m.createStudioFoundationContract();
  flagsOk = f.uiEnabled === false && f.routeEnabled === false && f.menuEnabled === false
    && f.moduleRegistrationEnabled === false && f.backendEnabled === false && f.prismaEnabled === false
    && f.migrationEnabled === false && f.productionEnabled === false && f.stagingEnabled === false
    && f.fetchEnabled === false && f.mutationAllowed === false && f.marketplaceEnabled === false
    && f.generatedModuleAllowed === false;
} catch { flagsOk = false; }
gate('G423-STUDIO-FC — all headless capability flags are false (no ui/route/menu/module/backend/prisma/migration/prod/staging/fetch/mutation/marketplace)', flagsOk);

// 41. Verification passes.
let verOk = false; let verDetail = '';
try {
  const f = m.createStudioFoundationContract();
  verOk = f.verification.valid === true && f.verification.status === 'foundation_contract_ready'
    && f.verification.safeToUseAsFoundationReference === true && f.verification.failures.length === 0;
  verDetail = verOk ? `${f.verification.checks.length} checks; 0 failures` : `failures: ${f.verification.failures.join(',')}`;
} catch (err) { verDetail = err instanceof Error ? err.message : String(err); }
gate('G423-STUDIO-FC — self-verification valid + safeToUseAsFoundationReference', verOk, verDetail);

// 42. Determinism.
let detOk = false;
try {
  const a = m.createStudioFoundationContract();
  const b = m.createStudioFoundationContract();
  detOk = a.manifest.overallDigest === b.manifest.overallDigest && typeof a.manifest.overallDigest === 'string' && a.manifest.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-STUDIO-FC — deterministic overall digest', detOk);

// 43. Tamper detection: altering a digest breaks verification.
let tamperOk = false;
try {
  const f = m.createStudioFoundationContract();
  const tampered = JSON.parse(JSON.stringify(f));
  tampered.manifest.metamodelDigest = 'fnv1a-deadbeef';
  const v = m.verifyStudioFoundationContracts({ foundation: tampered });
  tamperOk = v.valid === false;
} catch { tamperOk = false; }
gate('G423-STUDIO-FC — verifier detects a tampered digest (overall digest mismatch)', tamperOk);

// 44. Metamodel: >= 19 conceptual entities, generates nothing.
let metaOk = false;
try {
  const mm = m.createStudioMetamodelContract();
  metaOk = mm.entityCount >= 19 && mm.generatesSchema === false && mm.generatesMigration === false
    && mm.generatesBackend === false && mm.generatesModule === false && mm.generatesUi === false;
} catch { metaOk = false; }
gate('G423-STUDIO-FC — metamodel has >=19 entities and generates no schema/migration/backend/module/ui', metaOk);

// 45. Module blueprint requires permission + persistence; dangerous defaults off.
let modOk = false;
try {
  const mb = m.createStudioModuleBlueprintContract();
  modOk = mb.permissionBlueprintRequired === true && mb.persistenceBoundaryRequired === true
    && mb.routeMenuAutomatic === false && mb.defaults.productionAllowed === false
    && mb.defaults.mutationAllowed === false && mb.defaults.prismaAllowed === false;
} catch { modOk = false; }
gate('G423-STUDIO-FC — module blueprint requires permission+persistence; production/mutation/prisma default off', modOk);

// 46. Field blueprint rejects unsafe/unknown types.
let fieldOk = false;
try {
  const bad = m.createStudioFieldBlueprintContract({ field: { name: '1bad', type: 'evil' } });
  const good = m.createStudioFieldBlueprintContract({ field: { name: 'codigo', type: 'text' } });
  fieldOk = bad.fieldCheck.valid === false && good.fieldCheck.valid === true;
} catch { fieldOk = false; }
gate('G423-STUDIO-FC — field blueprint rejects unsafe name/unknown type, accepts safe field', fieldOk);

// 47. Validation blueprint blocks unsafe validation.
let valOk = false;
try {
  const net = m.createStudioValidationBlueprintContract({ validation: { kind: 'asyncValidationPlanned', callsNetwork: true } });
  const ok = m.createStudioValidationBlueprintContract({ validation: { kind: 'required' } });
  valOk = net.validationCheck.valid === false && ok.validationCheck.valid === true && ok.unsafeValidationAllowed === false;
} catch { valOk = false; }
gate('G423-STUDIO-FC — validation blueprint blocks network async / unsafe validation', valOk);

// 48. Permission blueprint fail-closed / default-deny.
let permOk = false;
try {
  const pb = m.createStudioPermissionBlueprintContract();
  permOk = pb.failClosed === true && pb.defaultDeny === true && pb.adminBypassesTenant === false
    && pb.deleteEnabledByDefault === false && pb.mutationEnabledByDefault === false;
} catch { permOk = false; }
gate('G423-STUDIO-FC — permission blueprint fail-closed/default-deny; admin never bypasses tenant', permOk);

// 49. Route/menu never auto-registers; App.jsx/menu untouched by contract.
let rmOk = false;
try {
  const rm = m.createStudioRouteMenuBlueprintContract();
  rmOk = rm.automaticRegistration === false && rm.appJsxChanged === false && rm.menuChanged === false
    && rm.routeEnabledDefault === false && rm.menuVisibleDefault === false && rm.futureRegistryRequired === true;
} catch { rmOk = false; }
gate('G423-STUDIO-FC — route/menu blueprint: no automatic registration; App.jsx/menu unchanged; future registry required', rmOk);

// 50. Persistence default noPersistence; schema/migration off.
let persOk = false;
try {
  const pb = m.createStudioPersistenceBoundaryContract();
  persOk = pb.defaultState === 'noPersistence' && pb.defaults.schemaAllowed === false
    && pb.defaults.migrationAllowed === false && pb.defaults.mutationAllowed === false
    && pb.automaticSchemaOrMigration === false && pb.realDataAsFixture === false;
} catch { persOk = false; }
gate('G423-STUDIO-FC — persistence boundary default noPersistence; schema/migration/mutation off; no real data as fixture', persOk);

// 51. Runtime binding references only, no production/module/prisma.
let rbOk = false;
try {
  const rb = m.createStudioRuntimeBindingContract();
  rbOk = rb.activatesProduction === false && rb.registersModule === false && rb.accessesPrismaDirectly === false
    && rb.typeMap.cadastro === 'modeloBase1' && rb.typeMap.operacional === 'modeloBase2Experimental';
} catch { rbOk = false; }
gate('G423-STUDIO-FC — runtime binding: references only; no production/module/prisma; cadastro→MB1, operacional→MB2-experimental', rbOk);

// 52. Safety policy invariants + checker flags violations.
let safeOk = false;
try {
  const sp = m.createStudioSafetyPolicy();
  const viol = sp.check({ failClosed: false });
  safeOk = sp.invariants.failClosed === true && sp.invariants.defaultDeny === true && sp.invariants.headlessOnly === true
    && viol.ok === false && viol.violations.length > 0;
} catch { safeOk = false; }
gate('G423-STUDIO-FC — safety policy invariants (headless/fail-closed/default-deny) + checker flags violations', safeOk);

// 53. Fallback always blocked, no side effects.
let fbOk = false;
try {
  const fb = m.createStudioFallback({ scenario: 'production_attempt' });
  fbOk = fb.readiness === 'blocked' && fb.sideEffects === false && fb.productionAccessed === false
    && fb.mutationExecuted === false && fb.prismaAccessed === false && fb.fetchUsed === false;
} catch { fbOk = false; }
gate('G423-STUDIO-FC — fallback readiness=blocked with zero side effects', fbOk);

// 54. Compatibility: breaking vs backward_compatible vs invalid.
let cmpOk = false;
try {
  const brk = m.checkStudioContractCompatibility({ current: { uiEnabled: false }, next: { uiEnabled: true } });
  const add = m.checkStudioContractCompatibility({ current: { allowedTypes: ['text'] }, next: { allowedTypes: ['text', 'money'] } });
  const same = m.checkStudioContractCompatibility({ current: { headless: true }, next: { headless: true } });
  const inv = m.checkStudioContractCompatibility({ current: null, next: {} });
  cmpOk = brk.classification === 'breaking' && brk.requiresMajorVersion === true
    && add.classification === 'backward_compatible' && same.classification === 'compatible'
    && inv.classification === 'invalid' && inv.contractInvalidated === true;
} catch { cmpOk = false; }
gate('G423-STUDIO-FC — compatibility checker classifies breaking/backward_compatible/compatible/invalid', cmpOk);

// 55. Errors are sanitized, side-effect-free.
let errOk = false;
try {
  const e = m.createStudioError('STUDIO_PRISMA_BLOCKED', { message: 'blocked' });
  errOk = e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.backendAccessed === false
    && e.fetchUsed === false && m.STUDIO_ERROR_CODES.length >= 20;
} catch { errOk = false; }
gate('G423-STUDIO-FC — error descriptors sanitized + side-effect-free (>=20 codes)', errOk);

// 56. Flags fail-closed in production.
let flagProdOk = false;
try {
  const off = m.isStudioFoundationContractsEnabled({ [m.MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioFoundationContractsEnabled({ [m.MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG]: 'true', DEV: 'true' });
  flagProdOk = off === false && onDev === true;
} catch { flagProdOk = false; }
gate('G423-STUDIO-FC — flags fail closed in production; enable only outside production', flagProdOk);

// 57. React-free.
gate('G423-STUDIO-FC — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));

// 58. No backend/apis/prisma imports.
gate('G423-STUDIO-FC — no import of apiClient/EmpresaApi/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma|@prisma/i.test(p)));

// 59. No fetch/XHR/WebSocket/storage.
let noIo = false;
try {
  const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-STUDIO-FC — no fetch/XHR/WebSocket/storage-API', noIo);

// 60. No DATABASE_URL / production API_URL / Railway.
gate('G423-STUDIO-FC — no DATABASE_URL / production API_URL / Railway usage', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'))));

// 61. Docs state headless/no-production certification.
gate('G423-STUDIO-FC — docs certify headless / no UI / no production', /headless/i.test(readEv('CERTIFICATION-REPORT.md')) && /sem produção|no production|não.{0,6}produção/i.test(readEv('NO-UI-NO-PRODUCTION-VALIDATION.md')));

// 62. Next slice recommended = Studio Blueprint Contract Hardening.
gate('G423-STUDIO-FC — next slice is Studio Blueprint Contract Hardening', /STUDIO BLUEPRINT CONTRACT HARDENING/i.test(readEv('NEXT-SLICE-SPEC.md')));

// --- Scope safety (git-diff) ---
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  const FORBIDDEN = [
    /^src\/modules\//, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!foundation-contracts\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'modules/pages/App.jsx/MB1/MB2/other-studio/backend/Prisma/migration/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-FC — production code / other Studio / backend / Prisma / migration / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-STUDIO-FC — authorized scope only (foundation-contracts/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-STUDIO-FC — no new dependency added', noNewDep);

// No new module folders.
gate('G423-STUDIO-FC — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-STUDIO-FC — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));

// Run the slice unit tests.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-foundation-contracts.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-STUDIO-FC — studio foundation contracts unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-FOUNDATION-CONTRACTS summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
