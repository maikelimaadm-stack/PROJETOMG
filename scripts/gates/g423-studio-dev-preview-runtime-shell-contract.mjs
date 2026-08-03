#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-RUNTIME-SHELL-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY dev preview runtime shell contract in
 * `src/studio/blueprint-engine/dev-preview-runtime-shell-contract/`. It consumes a Dev Preview
 * Visual Contract and produces deterministic lifecycle / mount-boundary / event / render-request /
 * state / error / permission / data / isolation / policy CONTRACTS plus BLOCKED route/placement
 * plans, safety metadata, a readiness decision, a manifest, verifier, compatibility, diagnostics
 * and fallback.
 *
 * It NEVER creates UI/React components/`.jsx`/`.tsx`/`.css`/DOM/runtime-CSS/routes/menus/modules,
 * mounts anything, writes files under `src/modules`, touches backend/Prisma/migration/network/
 * production/staging, mutates, persists, or rewrites Empresas. It authorizes NO runtime.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins;
 * legitimate later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';
import { evaluateStudioBranchScope } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'dev-preview-runtime-shell-contract';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  const evaluation = evaluateStudioBranchScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-shell-contract');
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
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-shell-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-shell-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-shell-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'devPreviewRuntimeShellContractConfig.js', 'errors.js', 'createStudioDevPreviewRuntimeShellContract.js',
  'createDevPreviewRuntimeShellSession.js', 'createDevPreviewRuntimeShellLifecycleContract.js',
  'createDevPreviewRuntimeShellMountBoundary.js', 'createDevPreviewRuntimeShellEventContract.js',
  'createDevPreviewRuntimeShellRenderRequestContract.js', 'createDevPreviewRuntimeShellStateBoundary.js',
  'createDevPreviewRuntimeShellErrorBoundary.js', 'createDevPreviewRuntimeShellPermissionBoundary.js',
  'createDevPreviewRuntimeShellDataBoundary.js', 'createDevPreviewRuntimeShellIsolationContract.js',
  'createDevPreviewRuntimeShellPolicyContract.js', 'createDevPreviewRuntimeShellRouteBlockedMetadata.js',
  'createDevPreviewRuntimeShellPlacementBlockedMetadata.js', 'createDevPreviewRuntimeShellSafetyMetadata.js',
  'createDevPreviewRuntimeShellReadinessDecision.js', 'createDevPreviewRuntimeShellManifest.js',
  'verifyDevPreviewRuntimeShellContract.js', 'checkDevPreviewRuntimeShellCompatibility.js',
  'createDevPreviewRuntimeShellDiagnostics.js', 'createDevPreviewRuntimeShellFallback.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-SHELL-CONTRACT-REPORT.md', 'RUNTIME-SHELL-SESSION.md',
  'LIFECYCLE-CONTRACT.md', 'MOUNT-BOUNDARY.md', 'EVENT-CONTRACT.md', 'RENDER-REQUEST-CONTRACT.md',
  'STATE-BOUNDARY.md', 'ERROR-BOUNDARY.md', 'PERMISSION-BOUNDARY.md', 'DATA-BOUNDARY.md',
  'ISOLATION-CONTRACT.md', 'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-RS — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-RS — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-RS — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-RS — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-runtime-shell-contract.test.js')));
for (const d of DOCS) gate(`G423-RS — ${d} exists`, exists(path.join(EV, d)));

let m = null; let visualMod = null; let bridgeMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: 'studio-module-preview-sandbox-contract@1.0.0',
  plannerVersion: 'studio-blueprint-module-reference-planner@1.0.0',
  engineVersion: 'studio-blueprint-engine@1.0.0',
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};

let BRIDGE = null; let VC = null; let S = null;
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { S = m.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = S.kind === 'studio-dev-preview-runtime-shell-contract'
    && S.runtimeShellContractName === 'studio-dev-preview-runtime-shell-contract'
    && S.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0'
    && S.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && S.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && S.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && S.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && S.engineVersion === 'studio-blueprint-engine@1.0.0'
    && S.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && S.mode === 'headless_dev_preview_runtime_shell_contract'
    && S.fallback === false
    && S.readiness === 'studio_dev_preview_runtime_shell_contract_ready'
    && S.readyForDevPreviewRuntimeShellContract === true
    && S.readyForDevPreviewRuntimeImplementation === false
    && S.readyForRealModuleGeneration === false
    && S.readyForProduction === false
    && S.blockerCount === 0 && S.warningCount === 0 && S.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${S.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RS — runtime shell headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.RUNTIME_SHELL_HEADLESS_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'runtimeShellOnly', 'lifecycleContractOnly', 'mountBoundaryMetadataOnly', 'eventContractOnly', 'renderRequestMetadataOnly', 'stateBoundaryContractOnly', 'errorBoundaryContractOnly', 'permissionBoundaryContractOnly', 'dataBoundaryContractOnly', 'isolationContractOnly'];
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => S.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-RS — capabilities frozen; *Only flags true; all side-effect flags false', capOk);

const part = (fn, pred) => { try { return pred(m[fn]({ visualContract: VC })); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-RS — session (stable seed, no storage/fetch/persistence/side-effects)', part('createDevPreviewRuntimeShellSession', (x) => x.kind === 'dev-preview-runtime-shell-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-RS — lifecycle (7 phases; no timers/event-loop/runtime/dom)', part('createDevPreviewRuntimeShellLifecycleContract', (x) => x.phaseKinds.length === 7 && x.usesTimers === false && x.usesEventLoop === false && x.usesRealRuntime === false && x.dom === false));
gate('G423-RS — mount boundary (allowed/blocked targets; nothing mounted)', part('createDevPreviewRuntimeShellMountBoundary', (x) => x.blockedMountTargetKinds.includes('domNode') && x.blockedMountTargetKinds.includes('reactRoot') && x.mountCreated === false && x.domTouched === false && x.reactMounted === false && x.cssInjected === false));
gate('G423-RS — event contract (8 kinds; no emitter/handler/listener/mutation)', part('createDevPreviewRuntimeShellEventContract', (x) => x.eventKinds.length === 8 && x.usesEventEmitter === false && x.anyRealHandler === false && x.anyRealListener === false && x.anyMutation === false));
gate('G423-RS — render request (digests; renderAllowed false; future-slice reason)', part('createDevPreviewRuntimeShellRenderRequestContract', (x) => x.renderAllowed === false && typeof x.requestId === 'string' && /future explicit runtime implementation slice/.test(x.reason)));
gate('G423-RS — state boundary (read-only; no react-state/hooks/storage/persistence)', part('createDevPreviewRuntimeShellStateBoundary', (x) => x.readOnlyState === true && x.reactState === false && x.hooks === false && x.storage === false && x.persistence === false && x.blockedStateKinds.includes('reactState')));
gate('G423-RS — error boundary (fail-closed; safe diagnostics; no secrets/stack leak)', part('createDevPreviewRuntimeShellErrorBoundary', (x) => x.failClosed === true && x.safeDiagnostics === true && x.noSecrets === true && x.noStackLeak === true && x.catchesRuntimeErrors === false && x.knownErrorCount >= 30));
gate('G423-RS — permission boundary (defaultDeny/failClosed/tenantRequired/permissionRequired; no admin bypass/grant)', part('createDevPreviewRuntimeShellPermissionBoundary', (x) => x.defaultDeny === true && x.failClosed === true && x.tenantRequired === true && x.permissionRequired === true && x.adminBypass === false && x.grantsAccess === false));
gate('G423-RS — data boundary (metadata_only; no real read/write/fetch/backend/prisma/persistence)', part('createDevPreviewRuntimeShellDataBoundary', (x) => x.dataMode === 'metadata_only' && x.realDataRead === false && x.realDataWrite === false && x.fetchUsed === false && x.backendAccessed === false && x.prismaAccessed === false && x.persistenceCreated === false));
gate('G423-RS — isolation (noWindow/document/DOM/React/CSS/route/menu/module/production/staging)', part('createDevPreviewRuntimeShellIsolationContract', (x) => x.allInvariantsHold === true && x.noWindow === true && x.noDocument === true && x.noDOM === true && x.noReact === true && x.noCSSRuntime === true && x.noRouteRuntime === true && x.noMenuRuntime === true && x.noModuleRuntime === true && x.noProduction === true && x.noStaging === true));
gate('G423-RS — policy (all enforced; authorizes no runtime)', part('createDevPreviewRuntimeShellPolicyContract', (x) => x.allEnforced === true && x.authorizesRuntime === false && x.policies.length >= 7));
gate('G423-RS — route blocked (no route/router/app/nav; blockedNow)', part('createDevPreviewRuntimeShellRouteBlockedMetadata', (x) => x.routeCreated === false && x.routerMounted === false && x.appTouched === false && x.navigationTouched === false && x.blockedNow === true));
gate('G423-RS — placement blocked (no menu/nav/app; blockedNow)', part('createDevPreviewRuntimeShellPlacementBlockedMetadata', (x) => x.menuCreated === false && x.navMounted === false && x.appTouched === false && x.blockedNow === true));
gate('G423-RS — safety (anySideEffect false; all side-effect flags false; reversible)', part('createDevPreviewRuntimeShellSafetyMetadata', (x) => x.anySideEffect === false && x.reversibleByNonConsumption === true && x.mountCreated === false && x.domCreated === false && x.cssCreated === false && x.realDataRead === false && x.realDataWrite === false && Object.values(x.sideEffectFlags).every((v) => v === false)));

gate('G423-RS — readiness never runtime-implementation/real-generation/production', (() => { try { const r = m.createDevPreviewRuntimeShellReadinessDecision({ visualContract: VC }); return r.readyForDevPreviewRuntimeImplementation === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-RS — readiness blocked on blockers', (() => { try { return m.createDevPreviewRuntimeShellReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = S.manifest.kind === 'dev-preview-runtime-shell-manifest' && S.manifest.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0' && S.manifest.capabilities.headless === true && S.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-RS — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = S.verification.ok === true && S.verification.valid === true && S.verification.headless === true && S.verification.contractOnly === true && S.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-RS — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const c = m.RUNTIME_SHELL_HEADLESS_CAPABILITIES;
  const ui = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, uiCreated: true } } });
  const dom = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, domCreated: true } } });
  const css = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, cssCreated: true } } });
  const rm = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, routeCreated: true, menuCreated: true } } });
  const be = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } });
  const mut = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true } } });
  const rr = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: c, renderRequest: { renderAllowed: true } } });
  const ev = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: c, eventContract: { anyRealHandler: true } } });
  const dr = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: c, dataBoundary: { realDataRead: true } } });
  const dw = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: c, dataBoundary: { realDataWrite: true } } });
  const mo = m.verifyDevPreviewRuntimeShellContract({ contract: { capabilities: c, mountBoundary: { reactMounted: true } } });
  verTamper = ui.ok === false && dom.ok === false && css.ok === false && rm.ok === false && be.ok === false && mut.ok === false
    && rr.blockers.includes('unsafe_render_allowed_true') && ev.blockers.includes('unsafe_event_handler')
    && dr.blockers.includes('unsafe_real_data_read') && dw.blockers.includes('unsafe_real_data_write') && mo.blockers.includes('unsafe_mount');
} catch { verTamper = false; }
gate('G423-RS — verifier detects React/DOM/CSS/route/menu/backend/prisma/mutation/render/event/data/mount attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkDevPreviewRuntimeShellCompatibility({ visualContract: VC });
  const bad = m.checkDevPreviewRuntimeShellCompatibility({ visualContract: { visualContractVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithDevPreviewVisualContract === true && ok.readyForDevPreviewRuntimeImplementation === false && ok.readyForRealModuleGeneration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithDevPreviewVisualContract === false && bad.warnings.includes('incompatible_visualContract');
} catch { cmpOk = false; }
gate('G423-RS — compatibility: aligned ok, never authorizes runtime/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = S.diagnostics.passive === true && S.diagnostics.ok === true && S.diagnostics.headlessConfirmed === true && S.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(S.diagnostics)); } catch { diagOk = false; }
gate('G423-RS — diagnostics passive, headless-confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRuntimeShellContract({});
  const fb2 = m.createStudioDevPreviewRuntimeShellContract({ visualContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRuntimeShellContract({ visualContract: { kind: 'studio-dev-preview-visual-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForDevPreviewRuntimeShellContract === false && fb.readyForProduction === false && fb.capabilities.uiCreated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-RS — fallback fail-closed on invalid/missing/fallback visual contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
  const b = m.createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
  detOk = a.overallDigest === b.overallDigest && a.runtimeShellContractDigest === b.runtimeShellContractDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-RS — deterministic overall + runtime shell contract digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRuntimeShellContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRuntimeShellContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRuntimeShellVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-RS — feature flags fail closed in production', flagOk);

gate('G423-RS — error catalog >= 30 codes', Array.isArray(m?.RUNTIME_SHELL_ERROR_CODES) && m.RUNTIME_SHELL_ERROR_CODES.length >= 30);
gate('G423-RS — error descriptor sanitized + side-effect free', (() => { try { const e = m.createDevPreviewRuntimeShellContractError('RUNTIME_SHELL_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.domCreated === false && e.cssCreated === false && e.realDataRead === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-RS — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-RS — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-RS — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-RS — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-RS — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-RS — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-RS — docs validate no React / no UI / no route / no module', /React|UI|rota|menu|módulo|module|runtime/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-RS — next slice spec (isolated runtime implementation) present', /ISOLATED RUNTIME IMPLEMENTATION|implementation/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-RS — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-RS — authorized scope only (runtime-shell + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    const chronologyOk = evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal;
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-RS — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

// Registry: only this slice's specific paths added; no dangerous broad wildcard (tested functionally).
let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific runtime-shell paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-RS — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-RS — no new dependency added', noNewDep);

gate('G423-RS — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-RS — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-RS — upstream dev preview visual contract present', exists(path.join(VISUAL_DIR, 'index.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-dev-preview-runtime-shell-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-RS — dev preview runtime shell contract unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-RUNTIME-SHELL-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
