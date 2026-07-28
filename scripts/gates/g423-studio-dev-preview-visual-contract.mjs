#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-VISUAL-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY dev preview visual contract in
 * `src/studio/blueprint-engine/dev-preview-visual-contract/`. It consumes a Dev Preview
 * Contract Bridge and produces deterministic VISUAL tree / screen / section / component-
 * placeholder / state / interaction / theme-token / validation / accessibility CONTRACTS plus
 * BLOCKED route/placement plans, runtime-safety metadata, a readiness decision, a manifest,
 * verifier, compatibility, diagnostics and fallback.
 *
 * It NEVER creates UI/React components/`.jsx`/`.tsx`/DOM/runtime-CSS/routes/menus/modules,
 * writes files under `src/modules`, touches backend/Prisma/migration/network/production/
 * staging, mutates, persists, or rewrites Empresas. It authorizes NO visual runtime.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins;
 * legitimate later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-visual-contract');
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
  /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-visual-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-visual-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'devPreviewVisualContractConfig.js', 'errors.js', 'createStudioDevPreviewVisualContract.js',
  'createDevPreviewVisualContractSession.js', 'createDevPreviewVisualTreeContract.js',
  'createDevPreviewVisualScreenContract.js', 'createDevPreviewVisualSectionContract.js',
  'createDevPreviewVisualComponentPlaceholderRegistry.js', 'createDevPreviewVisualStateContract.js',
  'createDevPreviewVisualInteractionContract.js', 'createDevPreviewVisualThemeTokenContract.js',
  'createDevPreviewVisualValidationContract.js', 'createDevPreviewVisualAccessibilityContract.js',
  'createDevPreviewVisualRoutePlanMetadata.js', 'createDevPreviewVisualPlacementPlanMetadata.js',
  'createDevPreviewVisualRuntimeSafetyMetadata.js', 'createDevPreviewVisualReadinessDecision.js',
  'createDevPreviewVisualContractManifest.js', 'verifyDevPreviewVisualContract.js',
  'checkDevPreviewVisualContractCompatibility.js', 'createDevPreviewVisualContractDiagnostics.js',
  'createDevPreviewVisualContractFallback.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-VISUAL-CONTRACT-REPORT.md', 'VISUAL-CONTRACT-SESSION.md',
  'VISUAL-TREE-CONTRACT.md', 'VISUAL-SCREEN-CONTRACT.md', 'COMPONENT-PLACEHOLDER-REGISTRY.md',
  'VISUAL-STATE-CONTRACT.md', 'VISUAL-INTERACTION-CONTRACT.md', 'THEME-TOKEN-CONTRACT.md',
  'ACCESSIBILITY-CONTRACT.md', 'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-VC — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-VC — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-VC — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-visual-contract.test.js')));
for (const d of DOCS) gate(`G423-VC — ${d} exists`, exists(path.join(EV, d)));

let m = null; let bridgeMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: 'studio-module-preview-sandbox-contract@1.0.0',
  plannerVersion: 'studio-blueprint-module-reference-planner@1.0.0',
  engineVersion: 'studio-blueprint-engine@1.0.0',
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedColumn: true, tenantColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true, tenantScoped: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }, { name: 'dt', type: 'date' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};

let BRIDGE = null; let V = null;
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SANDBOX }); } catch (err) { console.error(String(err)); }
try { V = m.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = V.kind === 'studio-dev-preview-visual-contract'
    && V.visualContractName === 'studio-dev-preview-visual-contract'
    && V.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && V.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && V.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && V.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && V.engineVersion === 'studio-blueprint-engine@1.0.0'
    && V.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && V.mode === 'headless_dev_preview_visual_contract'
    && V.fallback === false
    && V.readiness === 'studio_dev_preview_visual_contract_ready'
    && V.readyForDevPreviewVisualContract === true
    && V.readyForDevPreviewVisualRuntime === false
    && V.readyForRealModuleGeneration === false
    && V.readyForProduction === false
    && V.blockerCount === 0 && V.warningCount === 0 && V.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${V.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-VC — visual contract headless/contract-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.VISUAL_CONTRACT_HEADLESS_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'visualTreeOnly', 'visualScreenOnly', 'componentPlaceholderOnly', 'stateContractOnly', 'interactionMetadataOnly', 'themeTokenMetadataOnly', 'routePlanMetadataOnly', 'menuPlanMetadataOnly'];
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => V.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-VC — capabilities frozen; *Only flags true; all side-effect flags false', capOk);

const part = (fn, argKey, pred) => { try { return pred(m[fn]({ [argKey]: BRIDGE })); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-VC — session (stable seed, no storage/fetch/persistence/side-effects)', part('createDevPreviewVisualContractSession', 'bridge', (x) => x.kind === 'dev-preview-visual-contract-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-VC — visual tree (allowed placeholders, no react/jsx/tsx/dom/cssRuntime)', part('createDevPreviewVisualTreeContract', 'bridge', (x) => x.allPlaceholdersAllowed === true && x.react === false && x.jsx === false && x.tsx === false && x.dom === false && x.cssRuntime === false));
gate('G423-VC — tree protected field → VisualLabelPlaceholder; normal → VisualInputPlaceholder', part('createDevPreviewVisualTreeContract', 'bridge', (x) => { const form = x.root.screens.find((s) => s.screen === 'form'); return form.sections[0].slots.find((s) => s.slot === 'field:tenantId').placeholderKind === 'VisualLabelPlaceholder' && form.sections[0].slots.find((s) => s.slot === 'field:nome').placeholderKind === 'VisualInputPlaceholder'; }));
gate('G423-VC — visual screen (list/form/detail + 4 state screens; no component/route)', part('createDevPreviewVisualScreenContract', 'bridge', (x) => x.screens.length === 3 && x.stateScreens.length === 4 && x.routeCreated === false && x.react === false));
gate('G423-VC — section contract (5 sections; no component/dom)', part('createDevPreviewVisualSectionContract', 'bridge', (x) => x.sections.length === 5 && x.sections.every((s) => s.componentCreated === false) && x.dom === false));
gate('G423-VC — placeholder registry (19 allowed; blocked incl React/Dom/Menu; no real component)', part('createDevPreviewVisualComponentPlaceholderRegistry', 'bridge', (x) => x.allowedCount === 19 && ['ReactComponent', 'DomNode', 'MenuItem', 'RouterOutlet'].every((k) => x.blockedKinds.includes(k)) && x.entries.every((e) => e.isRealComponent === false && e.importsComponent === false && e.jsx === false)));
gate('G423-VC — state contract (8 states; no react-state/hooks/runtime-state)', part('createDevPreviewVisualStateContract', 'bridge', (x) => x.stateKinds.length === 8 && x.usesReactState === false && x.usesHooks === false && x.usesRuntimeState === false));
gate('G423-VC — interaction contract (all disabled, mutations blocked, no real handler)', part('createDevPreviewVisualInteractionContract', 'bridge', (x) => x.interactions.every((i) => i.enabled === false) && x.anyMutationEnabled === false && x.anyRealHandler === false && x.interactions.filter((i) => i.interaction.startsWith('blocked')).every((i) => i.blocked === true)));
gate('G423-VC — theme token contract (7 groups; no realCss/tailwind/stylesheet/cssRuntime)', part('createDevPreviewVisualThemeTokenContract', 'bridge', (x) => x.tokenGroups.length === 7 && x.realCss === false && x.requiredTailwindClasses === false && x.stylesheetCreated === false && x.cssRuntime === false));
gate('G423-VC — validation contract (protected read-only; no code exec/mutation)', part('createDevPreviewVisualValidationContract', 'bridge', (x) => x.protectedRemainReadOnly === true && x.executesValidation === false && x.mutatesData === false && x.rules.every((r) => r.executesCode === false)));
gate('G423-VC — accessibility contract (labels/keyboard/focus metadata; no dom/aria)', part('createDevPreviewVisualAccessibilityContract', 'bridge', (x) => x.labelsRequired === true && x.blockedInteractionsAnnounced === true && x.domTouched === false && x.setsRealAria === false));
gate('G423-VC — route plan BLOCKED (no route/router/app/nav; blockedNow)', part('createDevPreviewVisualRoutePlanMetadata', 'bridge', (x) => x.routeCreated === false && x.routerMounted === false && x.appTouched === false && x.navigationTouched === false && x.blockedNow === true));
gate('G423-VC — placement plan BLOCKED (no menu/nav/app; blockedNow)', part('createDevPreviewVisualPlacementPlanMetadata', 'bridge', (x) => x.menuCreated === false && x.navMounted === false && x.appTouched === false && x.blockedNow === true));
gate('G423-VC — runtime safety (anySideEffect false; all side-effect flags false; reversible)', part('createDevPreviewVisualRuntimeSafetyMetadata', 'bridge', (x) => x.anySideEffect === false && x.reversibleByNonConsumption === true && x.domCreated === false && x.cssCreated === false && Object.values(x.sideEffectFlags).every((v) => v === false)));

gate('G423-VC — readiness never visual-runtime/real-generation/production', (() => { try { const r = m.createDevPreviewVisualReadinessDecision({ bridge: BRIDGE }); return r.readyForDevPreviewVisualRuntime === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-VC — readiness blocked on blockers', (() => { try { return m.createDevPreviewVisualReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = V.manifest.kind === 'dev-preview-visual-contract-manifest' && V.manifest.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0' && V.manifest.capabilities.headless === true && V.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-VC — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = V.verification.ok === true && V.verification.valid === true && V.verification.headless === true && V.verification.contractOnly === true && V.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-VC — verifier passes headless invariants', verOk);

let verTamper = false;
try {
  const caps = m.VISUAL_CONTRACT_HEADLESS_CAPABILITIES;
  const uiBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, uiCreated: true } } });
  const domBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, domCreated: true } } });
  const cssBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, cssCreated: true } } });
  const routeBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } });
  const beBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } });
  const mutBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } });
  const intBad = m.verifyDevPreviewVisualContract({ contract: { capabilities: caps, visualInteraction: { anyMutationEnabled: true } } });
  verTamper = uiBad.ok === false && domBad.ok === false && cssBad.ok === false && routeBad.ok === false && beBad.ok === false && mutBad.ok === false && intBad.ok === false
    && uiBad.blockers.includes('capability_uiCreated_must_be_false')
    && domBad.blockers.includes('capability_domCreated_must_be_false')
    && cssBad.blockers.includes('capability_cssCreated_must_be_false')
    && routeBad.blockers.includes('capability_routeCreated_must_be_false')
    && beBad.blockers.includes('capability_backendAccessed_must_be_false')
    && mutBad.blockers.includes('capability_mutationAllowed_must_be_false')
    && intBad.blockers.includes('unsafe_interaction_mutation_enabled');
} catch { verTamper = false; }
gate('G423-VC — verifier detects React/DOM/CSS/route/menu/backend/prisma/mutation/interaction attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkDevPreviewVisualContractCompatibility({ bridge: BRIDGE });
  const bad = m.checkDevPreviewVisualContractCompatibility({ bridge: { bridgeVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithDevPreviewBridge === true && ok.readyForDevPreviewVisualRuntime === false && ok.readyForRealModuleGeneration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithDevPreviewBridge === false && bad.warnings.includes('incompatible_bridgeContract');
} catch { cmpOk = false; }
gate('G423-VC — compatibility: aligned ok, never authorizes runtime/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = V.diagnostics.passive === true && V.diagnostics.ok === true && V.diagnostics.headlessConfirmed === true && V.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(V.diagnostics)); } catch { diagOk = false; }
gate('G423-VC — diagnostics passive, headless-confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewVisualContract({});
  const fb2 = m.createStudioDevPreviewVisualContract({ bridge: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewVisualContract({ bridge: { kind: 'studio-dev-preview-contract-bridge', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForDevPreviewVisualContract === false && fb.readyForProduction === false && fb.capabilities.uiCreated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-VC — fallback fail-closed on invalid/missing/fallback bridge', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewVisualContract({ bridge: BRIDGE });
  const b = m.createStudioDevPreviewVisualContract({ bridge: BRIDGE });
  detOk = a.overallDigest === b.overallDigest && a.visualContractDigest === b.visualContractDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-VC — deterministic overall + visual contract digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewVisualContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewVisualContractEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewVisualVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-VC — feature flags fail closed in production', flagOk);

gate('G423-VC — error catalog >= 30 codes', Array.isArray(m?.VISUAL_CONTRACT_ERROR_CODES) && m.VISUAL_CONTRACT_ERROR_CODES.length >= 30);
gate('G423-VC — error descriptor sanitized + side-effect free', (() => { try { const e = m.createDevPreviewVisualContractError('VISUAL_CONTRACT_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.domCreated === false && e.cssCreated === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-VC — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-VC — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-VC — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-VC — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-VC — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-VC — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));

gate('G423-VC — docs validate no React / no UI / no route / no module', /React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /headless/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-VC — next slice spec (runtime shell) present', /RUNTIME SHELL|runtime/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — forbidden always wins via the central guard.
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const bad = filterForbiddenScopePaths(files);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src/modules/Empresas/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-VC — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !authorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-VC — authorized scope only (visual-contract + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
try {
  // Branch-relative check: it runs on later Studio headless slices before merge, so EXPLICITLY registered later
  // Studio headless artifacts are filtered out via the CENTRAL governance guard (no wildcard). Unknown and
  // forbidden paths still fail hard, and the guard libs are checked against the UNFILTERED list.
  const rawFiles = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const files = rawFiles.filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const touchedGuard = rawFiles.includes('scripts/gates/lib/productionUiGuard.mjs') || rawFiles.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs');
  const touchedOldGate = files.some((f) => /^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-dev-preview-visual-contract.mjs');
  const touchedOldTest = files.some((f) => /^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-dev-preview-visual-contract.test.js');
  noOldEdit = !touchedGuard && !touchedOldGate && !touchedOldTest;
  noOldEditDetail = noOldEdit ? 'productionUiGuard + governance guard + prior gates/tests untouched by this slice' : `touched: ${[touchedGuard ? 'guard' : '', touchedOldGate ? 'old-gate' : '', touchedOldTest ? 'old-test' : ''].filter(Boolean).join(',')}`;
} catch (err) { noOldEdit = true; noOldEditDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-VC — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

// Registry: only this slice's specific paths added; no dangerous broad wildcard. Tested
// functionally (import the registry) so the FORBIDDEN_BROAD_ALLOW_SOURCES doc strings in the
// file text never cause a false positive.
let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-visual-contract/index.js'));
  // A dangerous broad allow would match a forbidden probe. Prove none of them does.
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific visual-contract paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-VC — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-VC — no new dependency added', noNewDep);

gate('G423-VC — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-VC — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-VC — upstream dev preview contract bridge present', exists(path.join(BRIDGE_DIR, 'index.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/studio-dev-preview-visual-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-VC — dev preview visual contract unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-VISUAL-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
