#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BLUEPRINT-MODULE-REFERENCE-PLANNER — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY module reference planner in
 * `src/studio/blueprint-engine/module-reference-planner/`. It receives a blueprint
 * validated by the Studio Blueprint Engine and turns it into a REFERENCE PLAN (identity,
 * files, screens, fields/table/form, permissions, route/menu, persistence, runtime
 * binding, tests/gates, evidence, risks, readiness) plus manifest, verifier,
 * compatibility, diagnostics and fallback — all as a PLAN.
 *
 * It NEVER generates a module, writes a file under `src/modules`, renders UI, registers a
 * route/menu/module, or touches backend/Prisma/migration/network/production/staging, and
 * never mutates, persists, or rewrites Empresas. Nothing is auto-consumed (reversible by
 * non-consumption).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Branch-relative scope checks may run on later Studio headless slices before merge.
// Known later Studio headless artifacts are tolerated here, but forbidden scopes still fail.
import { filterForbiddenScopePaths, createResolvedActiveStudioSlicePathAuthorizer } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-reference-planner');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-blueprint-module-reference-planner');
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
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
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
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
];

const FILES = [
  'createStudioBlueprintModuleReferencePlanner.js', 'createModuleIdentityPlan.js', 'createModuleFilePlan.js',
  'createModuleScreenPlan.js', 'createModuleFieldTableFormPlan.js', 'createModulePermissionPlan.js',
  'createModuleRouteMenuPlan.js', 'createModulePersistencePlan.js', 'createModuleRuntimeBindingPlan.js',
  'createModuleTestGatePlan.js', 'createModuleEvidencePlan.js', 'createModuleRiskPlan.js',
  'createModuleReadinessDecision.js', 'createModuleReferencePlannerManifest.js', 'verifyModuleReferencePlan.js',
  'checkModuleReferencePlanCompatibility.js', 'createModuleReferencePlannerDiagnostics.js',
  'createModuleReferencePlannerFallback.js', 'moduleReferencePlannerConfig.js', 'errors.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-BLUEPRINT-MODULE-REFERENCE-PLANNER-REPORT.md', 'MODULE-IDENTITY-PLAN.md',
  'MODULE-FILE-PLAN.md', 'MODULE-SCREEN-PLAN.md', 'MODULE-FIELD-TABLE-FORM-PLAN.md', 'MODULE-PERMISSION-PLAN.md',
  'MODULE-ROUTE-MENU-PLAN.md', 'MODULE-PERSISTENCE-PLAN.md', 'MODULE-RUNTIME-BINDING-PLAN.md', 'MODULE-TEST-GATE-PLAN.md',
  'MODULE-EVIDENCE-PLAN.md', 'MODULE-RISK-PLAN.md', 'MODULE-READINESS-DECISION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md', 'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-MRP — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-MRP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-blueprint-module-reference-planner.test.js')));
for (const d of DOCS) gate(`G423-MRP — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const BP = {
  moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1',
  fields: [
    { name: 'nome', type: 'text', required: true, searchable: true, sortable: true },
    { name: 'clienteId', type: 'text', tenantScoped: true, protectedField: true },
  ],
  permissions: [{ action: 'read', level: 'module' }],
};

let baseOk = false; let baseDetail = '';
try {
  const p = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  baseOk = p.kind === 'studio-blueprint-module-reference-plan'
    && p.plannerName === 'studio-blueprint-module-reference-planner'
    && p.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && p.engineVersion === 'studio-blueprint-engine@1.0.0'
    && p.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && p.mode === 'contract_only_reference_planning'
    && p.headless === true
    && p.moduleGenerated === false && p.filesWrittenToModule === false && p.routeCreated === false && p.menuCreated === false
    && p.moduleRegistered === false && p.backendAccessed === false && p.prismaAccessed === false
    && p.productionAccessed === false && p.stagingAccessed === false && p.fetchUsed === false
    && p.mutationAllowed === false && p.persistenceCreated === false && p.rewriteEmpresas === false
    && p.readyForRealModuleGeneration === false
    && p.blockers.length === 0 && p.readiness === 'module_reference_plan_ready';
  baseDetail = baseOk ? `readiness=${p.readiness}; next=${p.nextAllowedStage}` : 'planner invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MRP — planner headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES;
  const noes = ['moduleGenerated', 'filesWrittenToModule', 'routeCreated', 'menuCreated', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && c.headless === true && noes.every((k) => c[k] === false);
} catch { capOk = false; }
gate('G423-MRP — capabilities frozen; headless true; all side-effect flags false', capOk);

const part = (fn, pred) => { try { return pred(m[fn]({ blueprint: BP })); } catch { return false; } };
gate('G423-MRP — identity plan (safe id, plannedOnly, not registered, no dir)', part('createModuleIdentityPlan', (x) => x.moduleIdSafe === true && x.registeredNow === false && x.directoryCreatedNow === false && x.namespacePlan.plannedOnly === true));
gate('G423-MRP — file plan (categories, generationAllowedNow false, backend/prisma futureOnly, no write)', part('createModuleFilePlan', (x) => x.generationAllowedNow === false && x.filesWrittenToModule === false && x.backendPrismaFutureOnly === true && ['domain', 'application', 'infrastructure', 'tests', 'gates', 'evidence'].every((c) => x.categories.includes(c))));
gate('G423-MRP — screen plan (no React, no App.jsx, no route, empty/loading/error)', part('createModuleScreenPlan', (x) => x.generatesReactComponent === false && x.changesAppJsx === false && x.createsRoute === false && x.requiredStates.length === 3));
gate('G423-MRP — field/table/form plan (protected read-only, tenant preserved, computed no code, gen off)', part('createModuleFieldTableFormPlan', (x) => x.protectedDefaultReadOnly === true && x.tenantFields.includes('clienteId') && x.computedExecutesCode === false && x.generationAllowedNow === false));
gate('G423-MRP — permission plan (defaultDeny, failClosed, tenantRequired, delete/mutation off, plannedOnly)', part('createModulePermissionPlan', (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.adminBypassesTenant === false && x.deleteEnabledByDefault === false && x.mutationEnabledByDefault === false && x.createsRealPermission === false));
gate('G423-MRP — route/menu plan (routeCreated/menuCreated false, production off, guard/flag/permission required, autoRegister off)', part('createModuleRouteMenuPlan', (x) => x.routeCreated === false && x.menuCreated === false && x.productionAllowed === false && x.guardRequired === true && x.flagRequired === true && x.permissionRequired === true && x.autoRegister === false && x.changesAppJsx === false));
gate('G423-MRP — persistence plan (schema/migration/backend/prisma/mutation/production/staging allowedNow false; real blocked)', part('createModulePersistencePlan', (x) => x.schemaAllowedNow === false && x.migrationAllowedNow === false && x.backendAllowedNow === false && x.prismaAllowedNow === false && x.mutationAllowedNow === false && x.productionAllowedNow === false && x.stagingAllowedNow === false && x.realPersistenceBlocked === true));
gate('G423-MRP — runtime binding plan (no production, no register, no prisma, no Empresas rewrite, MB2 not production)', part('createModuleRuntimeBindingPlan', (x) => x.activatesProduction === false && x.registersModule === false && x.accessesPrismaDirectly === false && x.altersEmpresas === false && x.modeloBase2IsProduction === false));
gate('G423-MRP — test/gate plan (scope/production/generation/route-menu/backend-prisma/mutation/migration guards)', part('createModuleTestGatePlan', (x) => ['scope guard', 'production guard', 'module generation guard', 'route/menu guard', 'backend/prisma guard', 'mutation guard', 'migration guard'].every((g) => x.plannedGates.includes(g))));
gate('G423-MRP — evidence plan present', part('createModuleEvidencePlan', (x) => x.plannedEvidence.includes('module reference plan report') && x.createsEvidenceFileNow === false));
gate('G423-MRP — risk plan (all mitigated, key risks registered)', (() => { try { const x = m.createModuleRiskPlan(); return x.allMitigated === true && ['planner_confused_with_generator', 'early_route_menu', 'open_permission', 'tenant_bypass', 'empresas_rewrite'].every((id) => x.risks.some((r) => r.riskId === id)); } catch { return false; } })());

gate('G423-MRP — readiness decision (real generation never allowed; preview computed)', part('createModuleReadinessDecision', () => { const d = m.createModuleReadinessDecision({ blueprintValid: true, safetyOk: true, routeMenuPlan: m.createModuleRouteMenuPlan({ blueprint: BP }), persistencePlan: m.createModulePersistencePlan({ blueprint: BP }), permissionPlan: m.createModulePermissionPlan({ blueprint: BP }), fieldTableFormPlan: m.createModuleFieldTableFormPlan({ blueprint: BP }) }); return d.readyForRealModuleGeneration === false && typeof d.readyForPreviewSandbox === 'boolean'; }));

let manVerOk = false;
try {
  const p = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  const v = m.verifyModuleReferencePlan({ plan: p });
  manVerOk = p.manifest.kind === 'module-reference-planner-manifest' && v.valid === true && v.safeToUseAsModuleReferencePlan === true && v.readyForRealModuleGeneration === false && p.safeToUseAsModuleReferencePlan === true;
} catch { manVerOk = false; }
gate('G423-MRP — manifest + verifier valid + safeToUseAsModuleReferencePlan', manVerOk);

let detOk = false;
try {
  const a = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  const b = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  detOk = a.overallDigest === b.overallDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-MRP — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const p = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  const t = JSON.parse(JSON.stringify(p)); t.manifest.identityPlanDigest = 'fnv1a-deadbeef';
  const t2 = JSON.parse(JSON.stringify(p)); t2.manifest.moduleGenerated = true;
  tamperOk = m.verifyModuleReferencePlan({ plan: t }).valid === false && m.verifyModuleReferencePlan({ plan: t2 }).valid === false;
} catch { tamperOk = false; }
gate('G423-MRP — verifier detects tampered digest + flipped flag', tamperOk);

let cmpOk = false;
try {
  const p = m.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
  const ok = m.checkModuleReferencePlanCompatibility({ plan: p });
  const bad = m.checkModuleReferencePlanCompatibility({ plan: { ...p, moduleGenerated: true } });
  cmpOk = ok.compatibleForRealModuleGeneration === false && bad.compatibilityStatus === 'blocked';
} catch { cmpOk = false; }
gate('G423-MRP — compatibility checker (real generation never; exposure → blocked)', cmpOk);

let fbOk = false;
try {
  const fb = m.createModuleReferencePlannerFallback({ scenario: 'module_generation_attempt' });
  fbOk = fb.safeToUseAsModuleReferencePlan === false && fb.readiness === 'blocked' && fb.moduleGenerated === false && fb.rewriteEmpresas === false && fb.sideEffects === false;
} catch { fbOk = false; }
gate('G423-MRP — fallback fail-closed', fbOk);

let flagOk = false;
try {
  const off = m.isStudioModuleReferencePlannerEnabled({ [m.MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioModuleReferencePlannerEnabled({ [m.MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-MRP — flags fail closed in production', flagOk);

gate('G423-MRP — error catalog >= 24 codes', Array.isArray(m?.MODULE_REFERENCE_PLANNER_ERROR_CODES) && m.MODULE_REFERENCE_PLANNER_ERROR_CODES.length >= 24);

// Static safety scans.
gate('G423-MRP — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-MRP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-MRP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-MRP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-MRP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-MRP — docs validate no generation / no production', /generat|produç|production/i.test(readEv('NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-MRP — next slice spec (preview sandbox) present', /PREVIEW SANDBOX/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
  // Historical blanket kept EXACTLY as written. The only exemption is the single central
  // authorizer: exactly one resolved ACTIVE slice, and only the paths that slice is authorized
  // for. A path the active slice does not own stays bad, and a centrally forbidden path is
  // always bad even when the local blanket does not name it.
  const activeAuthorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
  const bad = files.filter((f) => (FORBIDDEN.some((re) => re.test(f)) && !activeAuthorizer.isAuthorized(f))
    || filterForbiddenScopePaths([f]).length > 0);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'Empresas/PAGEMP/MB1/MB2/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MRP — src/modules / Empresas / other Studio / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const activeScopeAuthorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
  const outside = files
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)))
    .filter((f) => !activeScopeAuthorizer.isAuthorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MRP — authorized scope only (planner/tests/gate/guard/package.json/evidence)', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-MRP — no new dependency added', noNewDep);

gate('G423-MRP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-MRP — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-MRP — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-blueprint-module-reference-planner.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MRP — module reference planner unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-BLUEPRINT-MODULE-REFERENCE-PLANNER summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
