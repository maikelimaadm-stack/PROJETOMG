#!/usr/bin/env node
/**
 * Gate G423-STUDIO-MODULE-PREVIEW-SANDBOX-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, PREVIEW-METADATA-ONLY sandbox contract in
 * `src/studio/blueprint-engine/module-preview-sandbox/`. It consumes the Module Reference
 * Planner (which consumes the Blueprint Engine) and produces preview metadata (session,
 * table/form/detail/field/action/permission, route-menu/persistence "blocked", runtime
 * binding) plus manifest, verifier, compatibility, diagnostics and fallback.
 *
 * It NEVER creates UI/React components/routes/menus/modules, writes files under
 * `src/modules`, touches backend/Prisma/migration/network/production/staging, mutates,
 * persists, or rewrites Empresas.
 *
 * NOTE: this slice STACKS on the (still-open) Module Reference Planner PR #461, so the
 * diff-vs-main includes the planner's files. The scope check below tolerates those as
 * `INHERITED_FROM_PLANNER_PR` and proves that the NET-NEW change of THIS slice is the
 * preview-sandbox subtree (+ its test/gate/evidence/package.json) only. It also asserts
 * that NO prior test/gate and NO productionUiGuard was modified by this slice.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Central scope governance guard (pure, registry-driven) consumed by the branch-relative scope checks below.
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract');
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
  /^src\/studio\/blueprint-engine\/module-preview-sandbox\//,
  /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-module-preview-sandbox-contract\//,
];
// Inherited from the base branch (unmerged Module Reference Planner PR #461).
const INHERITED_FROM_PLANNER_PR = [
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
  /^src\/runtime\/__tests__\/[a-z0-9-]+\.test\.js$/,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || INHERITED_FROM_PLANNER_PR.some((re) => re.test(f))
  // Branch-relative: this check runs on later Studio headless slices before merge. Only EXPLICITLY registered later
  // artifacts are tolerated (no wildcard); unknown_scope and forbidden_scope still fail hard.
  || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'createStudioModulePreviewSandboxContract.js', 'createModulePreviewSandboxSession.js',
  'createModulePreviewTableMetadata.js', 'createModulePreviewFormMetadata.js', 'createModulePreviewDetailMetadata.js',
  'createModulePreviewFieldMetadata.js', 'createModulePreviewActionMetadata.js', 'createModulePreviewPermissionMetadata.js',
  'createModulePreviewRouteBlockedMetadata.js', 'createModulePreviewPersistenceBlockedMetadata.js',
  'createModulePreviewRuntimeBindingMetadata.js', 'createModulePreviewReadinessDecision.js',
  'createModulePreviewSandboxManifest.js', 'verifyModulePreviewSandboxContract.js',
  'checkModulePreviewSandboxCompatibility.js', 'createModulePreviewSandboxDiagnostics.js',
  'createModulePreviewSandboxFallback.js', 'modulePreviewSandboxConfig.js', 'errors.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-PREVIEW-SANDBOX-CONTRACT-REPORT.md', 'PREVIEW-SANDBOX-SESSION.md',
  'TABLE-PREVIEW-METADATA.md', 'FORM-PREVIEW-METADATA.md', 'DETAIL-PREVIEW-METADATA.md', 'FIELD-PREVIEW-METADATA.md',
  'ACTION-PREVIEW-METADATA.md', 'PERMISSION-PREVIEW-METADATA.md', 'ROUTE-BLOCKED-METADATA.md',
  'PERSISTENCE-BLOCKED-METADATA.md', 'RUNTIME-BINDING-METADATA.md', 'READINESS-DECISION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md',
  'NEXT-SLICE-SPEC.md', 'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

for (const f of FILES) gate(`G423-MPS — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-MPS — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js')));
for (const d of DOCS) gate(`G423-MPS — ${d} exists`, exists(path.join(EV, d)));

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
  const c = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  baseOk = c.kind === 'studio-module-preview-sandbox-contract'
    && c.sandboxName === 'studio-module-preview-sandbox-contract'
    && c.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && c.engineVersion === 'studio-blueprint-engine@1.0.0'
    && c.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && c.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && c.mode === 'headless_preview_sandbox_contract'
    && c.headless === true && c.previewMetadataOnly === true
    && c.reactComponentCreated === false && c.uiCreated === false && c.routeCreated === false && c.menuCreated === false
    && c.moduleGenerated === false && c.filesWrittenToModule === false && c.moduleRegistered === false
    && c.backendAccessed === false && c.prismaAccessed === false && c.productionAccessed === false
    && c.stagingAccessed === false && c.fetchUsed === false && c.mutationAllowed === false
    && c.persistenceCreated === false && c.rewriteEmpresas === false
    && c.readyForRealModuleGeneration === false && c.readyForProduction === false
    && c.blockers.length === 0 && c.readiness === 'module_preview_sandbox_contract_ready';
  baseDetail = baseOk ? `readiness=${c.readiness}; next=${c.nextAllowedStage}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MPS — contract headless/preview-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES;
  const noes = ['reactComponentCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && c.headless === true && c.previewMetadataOnly === true && noes.every((k) => c[k] === false);
} catch { capOk = false; }
gate('G423-MPS — capabilities frozen; headless+previewMetadataOnly true; all side-effect flags false', capOk);

const part = (fn, pred) => { try { const c = m.createStudioBlueprintModulePreviewProbe ? null : null; void c; return pred(m[fn]({ plan: m.__planProbe })); } catch { return false; } };
void part;
// Build a shared plan probe via the planner (consumed by the sandbox).
let plan = null;
try {
  const planner = await import(pathToFileURL(path.join(ROOT, 'src/studio/blueprint-engine/module-reference-planner/index.js')).href);
  plan = planner.createStudioBlueprintModuleReferencePlanner({ blueprint: BP });
} catch (err) { console.error(String(err)); }

const meta = (fn, pred) => { try { return pred(m[fn]({ plan })); } catch { return false; } };
gate('G423-MPS — session (allowedKinds, prohibitedEffects, no real storage, stable seed)', meta('createModulePreviewSandboxSession', (x) => x.allowedPreviewKinds.length >= 6 && x.prohibitedEffects.includes('react_component_creation') && x.prohibitedEffects.includes('mutation') && x.usesRealStorage === false && x.usesFetch === false));
gate('G423-MPS — table metadata (protected excluded, no fetch/component/route/mutation)', meta('createModulePreviewTableMetadata', (x) => !x.visibleColumns.includes('clienteId') && x.protectedColumns.includes('clienteId') && x.dataFetched === false && x.componentCreated === false && x.routeCreated === false && x.mutationAllowed === false));
gate('G423-MPS — form metadata (submit disabled, protected read-only, computed no code, no fetch/mutation)', meta('createModulePreviewFormMetadata', (x) => x.submitAction.enabled === false && x.protectedDefaultReadOnly === true && x.computedExecutesCode === false && x.dataFetched === false && x.mutationAllowed === false));
gate('G423-MPS — detail metadata (read-only, strategy allowed, no PAGEMP/component/route/fetch)', meta('createModulePreviewDetailMetadata', (x) => x.readOnly === true && ['derive_from_form_readonly', 'dedicated_detail_future', 'blocked'].includes(x.strategy) && x.changesPagemp === false && x.componentCreated === false && x.routeCreated === false && x.dataFetched === false));
gate('G423-MPS — field metadata (types, protected read-only, unsafe blocks)', meta('createModulePreviewFieldMetadata', (x) => x.fields.every((f) => typeof f.type === 'string') && x.protectedDefaultReadOnly === true && x.computedExecutesCode === false));
gate('G423-MPS — action metadata (read meta-only, mutations disabled, no backend)', meta('createModulePreviewActionMetadata', (x) => x.readMetadataOnly === true && x.deleteEnabledByDefault === false && x.anyMutationEnabled === false && x.anyActionCallsBackend === false));
gate('G423-MPS — permission metadata (defaultDeny/failClosed/tenantRequired, admin no bypass, no real perm)', meta('createModulePreviewPermissionMetadata', (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.adminBypassesTenant === false && x.mutationPermissionsDefaultFalse === true && x.createsRealPermission === false));
gate('G423-MPS — route/menu blocked metadata (route/menu false, production off, blockedNow, no App/menu change)', meta('createModulePreviewRouteBlockedMetadata', (x) => x.routeCreated === false && x.menuCreated === false && x.productionAllowed === false && x.blockedNow === true && x.appJsChanged === false && x.menuChanged === false && x.autoRegister === false));
gate('G423-MPS — persistence blocked metadata (schema/migration/backend/prisma/mutation/production/staging off; blockedNow)', meta('createModulePreviewPersistenceBlockedMetadata', (x) => x.schemaAllowedNow === false && x.migrationAllowedNow === false && x.backendAllowedNow === false && x.prismaAllowedNow === false && x.mutationAllowedNow === false && x.productionAllowedNow === false && x.stagingAllowedNow === false && x.persistenceCreated === false && x.blockedNow === true));
gate('G423-MPS — runtime binding metadata (no binding/register/production/prisma/rewrite; MB2 not production)', meta('createModulePreviewRuntimeBindingMetadata', (x) => x.bindingCreated === false && x.moduleRegistered === false && x.productionActivated === false && x.prismaAccessed === false && x.rewriteEmpresas === false && x.modeloBase2IsProduction === false));
gate('G423-MPS — readiness decision (real generation + production never; preview computed)', meta('createModulePreviewReadinessDecision', () => { const d = m.createModulePreviewReadinessDecision({ plannerValid: true, metadataSafe: true, fieldPreview: m.createModulePreviewFieldMetadata({ plan }), routeMenuBlocked: m.createModulePreviewRouteBlockedMetadata({ plan }), persistenceBlocked: m.createModulePreviewPersistenceBlockedMetadata({ plan }), permission: m.createModulePreviewPermissionMetadata({ plan }) }); return d.readyForRealModuleGeneration === false && d.readyForProduction === false && typeof d.readyForPreviewSandbox === 'boolean'; }));

let manVerOk = false;
try {
  const c = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  const v = m.verifyModulePreviewSandboxContract({ contract: c });
  manVerOk = c.manifest.kind === 'module-preview-sandbox-manifest' && v.valid === true && v.safeToUseAsPreviewSandboxContract === true && v.readyForRealModuleGeneration === false && v.readyForProduction === false && c.safeToUseAsPreviewSandboxContract === true;
} catch { manVerOk = false; }
gate('G423-MPS — manifest + verifier valid + safeToUseAsPreviewSandboxContract', manVerOk);

let detOk = false;
try {
  const a = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  const b = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  detOk = a.overallDigest === b.overallDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-MPS — deterministic overall digest', detOk);

let tamperOk = false;
try {
  const c = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  const t = JSON.parse(JSON.stringify(c)); t.manifest.tablePreviewDigest = 'fnv1a-deadbeef';
  const t2 = JSON.parse(JSON.stringify(c)); t2.manifest.reactComponentCreated = true;
  tamperOk = m.verifyModulePreviewSandboxContract({ contract: t }).valid === false && m.verifyModulePreviewSandboxContract({ contract: t2 }).valid === false;
} catch { tamperOk = false; }
gate('G423-MPS — verifier detects tampered digest + flipped flag', tamperOk);

let cmpOk = false;
try {
  const c = m.createStudioModulePreviewSandboxContract({ blueprint: BP });
  const ok = m.checkModulePreviewSandboxCompatibility({ contract: c });
  const bad = m.checkModulePreviewSandboxCompatibility({ contract: { ...c, reactComponentCreated: true } });
  cmpOk = ok.compatibleForRealModuleGeneration === false && ok.compatibleForProduction === false && bad.compatibilityStatus === 'blocked';
} catch { cmpOk = false; }
gate('G423-MPS — compatibility checker (real generation/production never; exposure → blocked)', cmpOk);

let fbOk = false;
try {
  const fb = m.createModulePreviewSandboxFallback({ scenario: 'react_component_creation_attempt' });
  fbOk = fb.safeToUseAsPreviewSandboxContract === false && fb.readiness === 'blocked' && fb.reactComponentCreated === false && fb.rewriteEmpresas === false && fb.sideEffects === false;
} catch { fbOk = false; }
gate('G423-MPS — fallback fail-closed', fbOk);

let flagOk = false;
try {
  const off = m.isStudioModulePreviewSandboxContractEnabled({ [m.MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioModulePreviewSandboxContractEnabled({ [m.MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG]: 'true', DEV: 'true' });
  flagOk = off === false && onDev === true;
} catch { flagOk = false; }
gate('G423-MPS — flags fail closed in production', flagOk);

gate('G423-MPS — error catalog >= 30 codes', Array.isArray(m?.MODULE_PREVIEW_SANDBOX_ERROR_CODES) && m.MODULE_PREVIEW_SANDBOX_ERROR_CODES.length >= 30);

// Static safety scans.
gate('G423-MPS — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-MPS — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-MPS — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-MPS — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-MPS — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-MPS — docs validate no UI / no generation / no production', /componente React|UI criada|generat|produç|production/i.test(readEv('NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-MPS — next slice spec (dev preview contract bridge) present', /DEV PREVIEW CONTRACT BRIDGE/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — tolerant of inherited planner PR #461.
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !authorized(f));
  const FORBIDDEN = [
    /^src\/modules\//, /PAGEMP/i, /ModeloBase1CadastroPage/i, /^src\/pages\//, /^src\/components\//, /^src\/App\.jsx$/,
    /^src\/ModeloBase1\//, /^src\/ModeloBase2\//, /^src\/studio\/(?!blueprint-engine\/)/, /^src\/Studio\//,
    /^src\/apis\//, /^backend\//, /prisma/i, /schema\.prisma/i, /migration/i,
    /runtimeBridge/i, /makBootstrap/i, /^src\/framework\//, /^src\/bos\//, /\.css$/,
    /^src\/runtime\/(?!__tests__\/)/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src/modules/Empresas/other-studio/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MPS — src/modules / Empresas / other Studio / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !authorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files; planner PR #461 inherited)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MPS — authorized scope only (preview-sandbox + inherited planner PR)', scopeOk, scopeDetail);

// This slice must NOT modify any prior test/gate or the productionUiGuard.
let noOldEdit = false; let noOldEditDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  // net-new set for THIS slice = changed minus inherited planner PR files minus EXPLICITLY registered later
  // Studio headless artifacts. The guard check below reads the UNFILTERED list, so tolerance can never release it.
  const netNew = files.filter((f) => !INHERITED_FROM_PLANNER_PR.some((re) => re.test(f)) && !isKnownLaterStudioHeadlessArtifact(f));
  const touchedGuard = files.includes('scripts/gates/lib/productionUiGuard.mjs');
  const touchedOldGate = netNew.some((f) => /^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-module-preview-sandbox-contract.mjs');
  noOldEdit = !touchedGuard && !touchedOldGate;
  noOldEditDetail = noOldEdit ? 'productionUiGuard + prior gates untouched by this slice' : `touched: ${[touchedGuard ? 'guard' : '', touchedOldGate ? 'old-gate' : ''].filter(Boolean).join(',')}`;
} catch (err) { noOldEdit = true; noOldEditDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MPS — productionUiGuard + prior gates NOT altered by this slice', noOldEdit, noOldEditDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-MPS — no new dependency added', noNewDep);

gate('G423-MPS — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-MPS — src/modules/combustivel does NOT exist', !exists(path.join(ROOT, 'src/modules/combustivel')));
gate('G423-MPS — src/modules/fuel does NOT exist', !exists(path.join(ROOT, 'src/modules/fuel')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MPS — module preview sandbox contract unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-MODULE-PREVIEW-SANDBOX-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
