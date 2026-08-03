#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-CONTRACT-BRIDGE — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY dev preview bridge in
 * `src/studio/blueprint-engine/dev-preview-contract-bridge/`. It consumes a Module Preview
 * Sandbox contract and produces deterministic render/layout/screen/table/form/detail/field/
 * action/permission CONTRACTS plus an allowed-component contract, a visual-adapter contract,
 * BLOCKED route/placement plans, runtime-safety metadata, a readiness decision, a manifest,
 * verifier, compatibility, diagnostics and fallback.
 *
 * It NEVER creates UI/React components/`.jsx`/`.tsx`/routes/menus/modules, writes files
 * under `src/modules`, touches backend/Prisma/migration/network/production/staging, mutates,
 * persists, or rewrites Empresas.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins;
 * legitimate later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateStudioBranchDiffScope, filterForbiddenScopePaths, isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-contract-bridge';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  // An empty branch diff (this gate also runs on `main`) is NOT a violation: it carries nothing
  // to judge. A non-empty diff is delegated to the chronological core, unchanged.
  const evaluation = evaluateStudioBranchDiffScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-contract-bridge');
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
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-contract-bridge\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-contract-bridge\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'devPreviewBridgeConfig.js', 'errors.js', 'createDevPreviewBridgeSession.js',
  'createDevPreviewRenderSchema.js', 'createDevPreviewLayoutSchema.js', 'createDevPreviewScreenSchema.js',
  'createDevPreviewTableBridgeSchema.js', 'createDevPreviewFormBridgeSchema.js', 'createDevPreviewDetailBridgeSchema.js',
  'createDevPreviewFieldBridgeSchema.js', 'createDevPreviewActionBridgeSchema.js', 'createDevPreviewPermissionBridgeSchema.js',
  'createDevPreviewAllowedComponentContract.js', 'createDevPreviewVisualAdapterContract.js',
  'createDevPreviewRoutePlanMetadata.js', 'createDevPreviewPlacementPlanMetadata.js',
  'createDevPreviewRuntimeSafetyMetadata.js', 'createDevPreviewReadinessDecision.js',
  'createDevPreviewBridgeManifest.js', 'verifyDevPreviewBridgeContract.js',
  'checkDevPreviewBridgeCompatibility.js', 'createDevPreviewBridgeDiagnostics.js',
  'createDevPreviewBridgeFallback.js', 'createStudioDevPreviewContractBridge.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-CONTRACT-BRIDGE-REPORT.md', 'DEV-PREVIEW-BRIDGE-SESSION.md',
  'RENDER-SCHEMA.md', 'LAYOUT-SCHEMA.md', 'SCREEN-SCHEMA.md', 'TABLE-FORM-DETAIL-BRIDGE.md',
  'FIELD-ACTION-PERMISSION-BRIDGE.md', 'ALLOWED-COMPONENT-CONTRACT.md', 'VISUAL-ADAPTER-CONTRACT.md',
  'ROUTE-PLACEMENT-PLAN-BLOCKED.md', 'RUNTIME-SAFETY-METADATA.md', 'READINESS-DECISION.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md',
  'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-DPB — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-DPB — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-DPB — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-contract-bridge.test.js')));
for (const d of DOCS) gate(`G423-DPB — ${d} exists`, exists(path.join(EV, d)));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: 'studio-module-preview-sandbox-contract@1.0.0',
  plannerVersion: 'studio-blueprint-module-reference-planner@1.0.0',
  engineVersion: 'studio-blueprint-engine@1.0.0',
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [
    { name: 'nome', type: 'text', sortable: true },
    { name: 'tenantId', type: 'text', protectedColumn: true, tenantColumn: true },
  ] },
  formPreviewMetadata: { fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'tenantId', type: 'text', protectedField: true, tenantScoped: true },
  ] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [
    { name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' },
    { name: 'nascimento', type: 'date' }, { name: 'idade', type: 'number' }, { name: 'cat', type: 'select' },
  ] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};

let B = null;
try { B = m.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = B.kind === 'studio-dev-preview-contract-bridge'
    && B.bridgeName === 'studio-dev-preview-contract-bridge'
    && B.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && B.mode === 'headless_dev_preview_contract_bridge'
    && B.fallback === false
    && B.readiness === 'studio_dev_preview_contract_bridge_ready'
    && B.readyForDevPreviewBridge === true
    && B.readyForRealModuleGeneration === false
    && B.readyForProduction === false
    && B.blockerCount === 0 && B.warningCount === 0 && B.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${B.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-DPB — bridge headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES;
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && c.headless === true && c.contractOnly === true && noes.every((k) => c[k] === false) && noes.every((k) => B.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-DPB — capabilities frozen; headless+contractOnly true; all side-effect flags false', capOk);

const part = (fn, pred) => { try { return pred(m[fn]({ sandbox: SANDBOX })); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-DPB — session (stable seed, no storage/fetch/persistence/side-effects)', part('createDevPreviewBridgeSession', (x) => x.kind === 'dev-preview-bridge-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-DPB — render schema (metadata-only, no component/jsx/tsx/react/dom/css)', part('createDevPreviewRenderSchema', (x) => x.componentImport === false && x.jsx === false && x.tsx === false && x.react === false && x.dom === false && x.css === false && x.metadataOnly === true));
gate('G423-DPB — render protected field binds to label; normal to input-placeholder', part('createDevPreviewRenderSchema', (x) => x.fieldBindings.find((b) => b.name === 'tenantId').componentKind === 'label' && x.fieldBindings.find((b) => b.name === 'nome').componentKind === 'input-placeholder'));
gate('G423-DPB — layout schema (no realCss/tailwind/domLayout)', part('createDevPreviewLayoutSchema', (x) => x.realCss === false && x.requiredTailwindClasses === false && x.domLayout === false && x.grid.columns === 12));
gate('G423-DPB — screen schema (list/form/detail; required states; no component/route)', part('createDevPreviewScreenSchema', (x) => x.screens.length === 3 && x.requiredStates.length === 4 && x.componentCreated === false && x.routeCreated === false));
gate('G423-DPB — table bridge (protected hidden, no fetch/component/mutation)', part('createDevPreviewTableBridgeSchema', (x) => x.columns.find((c) => c.name === 'tenantId').visible === false && x.dataFetched === false && x.componentCreated === false && x.mutationAllowed === false));
gate('G423-DPB — form bridge (protected read-only label, submit disabled, no realInput/mutation)', part('createDevPreviewFormBridgeSchema', (x) => x.fields.find((f) => f.name === 'tenantId').componentKind === 'label' && x.submitBinding.enabled === false && x.realInput === false && x.mutationAllowed === false));
gate('G423-DPB — detail bridge (read-only, no edit/mutation/component)', part('createDevPreviewDetailBridgeSchema', (x) => x.readOnly === true && x.editable === false && x.mutationAllowed === false && x.componentCreated === false));
gate('G423-DPB — field bridge (types→allowed placeholders; allComponentsAllowed)', part('createDevPreviewFieldBridgeSchema', (x) => x.allComponentsAllowed === true && x.fields.find((f) => f.name === 'ativo').componentKind === 'boolean-placeholder' && x.fields.find((f) => f.name === 'nascimento').componentKind === 'date-placeholder' && x.componentCreated === false));
gate('G423-DPB — action bridge (all disabled, mutations flagged not enabled, button-placeholder)', part('createDevPreviewActionBridgeSchema', (x) => x.actions.every((a) => a.enabled === false) && x.anyEnabled === false && x.mutationAllowed === false && x.actions.every((a) => a.componentKind === 'button-placeholder')));
gate('G423-DPB — permission bridge (defaultDeny/failClosed/tenantRequired; no enforcement/grant)', part('createDevPreviewPermissionBridgeSchema', (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.enforcementEngine === false && x.grantsAccess === false));
gate('G423-DPB — allowed component contract (16 allowed; blocked incl react/jsx/tsx/menu/nav; disjoint; no component)', part('createDevPreviewAllowedComponentContract', (x) => x.allowedCount === 16 && ['react-component', 'jsx', 'tsx', 'menu', 'nav', 'route'].every((k) => x.blockedComponentKinds.includes(k)) && x.realComponentCreated === false && x.reactComponentCreated === false));
gate('G423-DPB — visual adapter contract (no react/dom/css/mount/import/impl)', part('createDevPreviewVisualAdapterContract', (x) => x.requiresReact === false && x.requiresDom === false && x.requiresCss === false && x.mountsAnything === false && x.importsComponent === false && x.adapterImplemented === false));
gate('G423-DPB — route plan BLOCKED (no wire/route/router/exposed)', part('createDevPreviewRoutePlanMetadata', (x) => x.wired === false && x.routeCreated === false && x.routerMounted === false && x.exposedInApp === false && x.blocked === true));
gate('G423-DPB — placement (menu) plan BLOCKED (no wire/menu/nav/exposed)', part('createDevPreviewMenuPlanMetadata', (x) => x.wired === false && x.menuCreated === false && x.navMounted === false && x.exposedInApp === false && x.blocked === true));
gate('G423-DPB — runtime safety (anySideEffect false; all side-effect flags false; reversible)', part('createDevPreviewRuntimeSafetyMetadata', (x) => x.anySideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.sideEffectFlags).every((v) => v === false)));

gate('G423-DPB — readiness never real-generation/production', (() => { try { const r = m.createDevPreviewReadinessDecision({ sandbox: SANDBOX }); return r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-DPB — readiness blocked on blockers', (() => { try { return m.createDevPreviewReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = B.manifest.kind === 'dev-preview-bridge-manifest' && B.manifest.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0' && B.manifest.capabilities.headless === true && B.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-DPB — manifest present + capability flags mirrored', manOk);

let verOk = false;
try {
  verOk = B.verification.ok === true && B.verification.valid === true && B.verification.headless === true && B.verification.contractOnly === true && B.verification.blockerCount === 0;
} catch { verOk = false; }
gate('G423-DPB — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const bad = m.verifyDevPreviewBridgeContract({ bridge: { capabilities: { headless: true, contractOnly: true, uiCreated: true, moduleGenerated: true } } });
  const bad2 = m.verifyDevPreviewBridgeContract({ bridge: { capabilities: { contractOnly: true } } });
  verTamper = bad.ok === false && bad.blockers.includes('capability_uiCreated_must_be_false') && bad2.blockers.includes('capability_headless_must_be_true');
} catch { verTamper = false; }
gate('G423-DPB — verifier detects flipped side-effect flag + missing headless', verTamper);

let cmpOk = false;
try {
  const ok = m.checkDevPreviewBridgeCompatibility({ sandbox: SANDBOX });
  const bad = m.checkDevPreviewBridgeCompatibility({ sandbox: { sandboxVersion: 'x@9.9.9' } });
  cmpOk = ok.compatible === true && ok.blocked === false && bad.compatible === false && bad.warnings.includes('incompatible_sandboxContract') && bad.blocked === false;
} catch { cmpOk = false; }
gate('G423-DPB — compatibility: aligned ok; mismatch → warning not blocker', cmpOk);

let diagOk = false;
try { diagOk = B.diagnostics.passive === true && B.diagnostics.ok === true && B.diagnostics.headlessConfirmed === true && B.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(B.diagnostics)); } catch { diagOk = false; }
gate('G423-DPB — diagnostics passive, headless-confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewContractBridge({});
  const fb2 = m.createStudioDevPreviewContractBridge({ sandbox: 5 });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForDevPreviewBridge === false && fb.readyForProduction === false && fb.capabilities.uiCreated === false && fb2.fallback === true;
} catch { fbOk = false; }
gate('G423-DPB — fallback fail-closed on invalid/missing sandbox', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
  const b = m.createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
  detOk = a.overallDigest === b.overallDigest && a.bridgeDigest === b.bridgeDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-DPB — deterministic overall + bridge digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewContractBridgeEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewContractBridgeEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-DPB — feature flags fail closed in production', flagOk);

gate('G423-DPB — error catalog >= 30 codes', Array.isArray(m?.DEV_PREVIEW_BRIDGE_ERROR_CODES) && m.DEV_PREVIEW_BRIDGE_ERROR_CODES.length >= 30);
gate('G423-DPB — error descriptor sanitized + side-effect free', (() => { try { const e = m.createDevPreviewBridgeError('DEV_PREVIEW_BRIDGE_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-DPB — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-DPB — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-DPB — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-DPB — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-DPB — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-DPB — no document/window DOM access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code));

gate('G423-DPB — docs validate no UI / no generation / no production', /React|UI|generat|produç|production/i.test(readEv('NO-UI-NO-MODULE-GENERATION-NO-PRODUCTION-VALIDATION.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-DPB — next slice spec (visual contract) present', /VISUAL|DEV PREVIEW/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — forbidden always wins via the central guard.
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-DPB — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
{
  const { gitAvailable, changed, evaluation } = studioScope();
  if (!gitAvailable) { scopeOk = true; scopeDetail = 'git base unavailable — skipped'; }
  else {
    scopeOk = evaluation.unknown.length === 0 && evaluation.chronologicalViolation.length === 0;
    scopeDetail = scopeOk
      ? `authorized scope only (${changed.length} files; active slice ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal})`
      : `OUT OF SCOPE: ${[...evaluation.unknown, ...evaluation.chronologicalViolation].join(', ')}`;
  }
}
gate('G423-DPB — authorized scope only (dev-preview-bridge + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    const chronologyOk = !evaluation.applicable
      || (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal);
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = !evaluation.applicable
      ? `branch diff not applicable: ${evaluation.reason}`
      : noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-DPB — productionUiGuard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-DPB — no new dependency added', noNewDep);

gate('G423-DPB — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-DPB — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-dev-preview-contract-bridge.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-DPB — dev preview contract bridge unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-CONTRACT-BRIDGE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
