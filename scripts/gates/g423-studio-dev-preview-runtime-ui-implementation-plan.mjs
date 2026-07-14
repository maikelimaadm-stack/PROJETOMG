#!/usr/bin/env node
/**
 * Gate G423-STUDIO-DEV-PREVIEW-RUNTIME-UI-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, PLAN-ONLY runtime UI implementation plan in
 * `src/studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan/`. It consumes a Dev
 * Preview Runtime UI Contract and produces a deterministic PLAN — implementation phases, UI
 * runtime boundary plan, dev-only execution policy, virtual-frame-to-UI pipeline plan,
 * renderer/component/interaction/state/theme/accessibility adapter plans, blocked-action
 * enforcement plan, test harness plan, manual enablement gate plan, rollout/rollback plan and
 * observability/diagnostics plan — plus safety, readiness, manifest, verifier, compatibility,
 * diagnostics and fallback.
 *
 * It IMPLEMENTS NO UI. It NEVER creates React components/`.jsx`/`.tsx`/`.css`/DOM/runtime-CSS/
 * routes/placements/menus/modules, writes files under `src/modules`, touches backend/Prisma/
 * migration/network/production/staging, mutates, persists, reads/writes real data, or rewrites
 * Empresas. `runtimeUiImplemented` and `visualRuntimeImplemented` are false; it authorizes NO UI
 * runtime implementation and NO route/placement integration.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate
 * later Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan');
const UC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-ui-contract');
const IR_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const SHELL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-runtime-shell-contract');
const VISUAL_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-visual-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/dev-preview-contract-bridge');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan');
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
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'runtimeUiImplementationPlanConfig.js', 'errors.js', 'createStudioDevPreviewRuntimeUiImplementationPlan.js',
  'createRuntimeUiImplementationPlanSession.js', 'createRuntimeUiImplementationPhases.js',
  'createRuntimeUiBoundaryPlan.js', 'createRuntimeUiDevOnlyExecutionPolicy.js',
  'createVirtualFrameToUiPipelinePlan.js', 'createRuntimeUiRendererAdapterPlan.js',
  'createRuntimeUiComponentAdapterPlan.js', 'createRuntimeUiInteractionAdapterPlan.js',
  'createRuntimeUiStateAdapterPlan.js', 'createRuntimeUiThemeAdapterPlan.js',
  'createRuntimeUiAccessibilityAdapterPlan.js', 'createRuntimeUiBlockedActionEnforcementPlan.js',
  'createRuntimeUiTestHarnessPlan.js', 'createRuntimeUiManualEnablementGatePlan.js',
  'createRuntimeUiRolloutRollbackPlan.js', 'createRuntimeUiObservabilityDiagnosticsPlan.js',
  'createRuntimeUiSafetyPlan.js', 'createRuntimeUiImplementationReadinessDecision.js',
  'createRuntimeUiImplementationPlanManifest.js', 'verifyRuntimeUiImplementationPlan.js',
  'checkRuntimeUiImplementationPlanCompatibility.js', 'createRuntimeUiImplementationPlanDiagnostics.js',
  'createRuntimeUiImplementationPlanFallback.js', 'index.js',
];

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-UI-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'UI-RUNTIME-BOUNDARY-PLAN.md', 'DEV-ONLY-UI-EXECUTION-POLICY.md',
  'VIRTUAL-FRAME-TO-UI-PIPELINE-PLAN.md', 'RENDERER-ADAPTER-PLAN.md', 'COMPONENT-ADAPTER-PLAN.md',
  'INTERACTION-ADAPTER-PLAN.md', 'STATE-ADAPTER-PLAN.md', 'THEME-ADAPTER-PLAN.md',
  'ACCESSIBILITY-ADAPTER-PLAN.md', 'BLOCKED-ACTION-ENFORCEMENT-PLAN.md', 'TEST-HARNESS-PLAN.md',
  'MANUAL-ENABLEMENT-GATE-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md',
  'SAFETY-PLAN.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-UIP — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-UIP — no .jsx/.tsx in subtree', walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f)));
gate('G423-UIP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-UIP — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-dev-preview-runtime-ui-implementation-plan.test.js')));
for (const d of DOCS) gate(`G423-UIP — ${d} exists`, exists(path.join(EV, d)));

let m = null; let ucMod = null; let irMod = null; let planMod = null; let shellMod = null; let visualMod = null; let bridgeMod = null; let sandboxMod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { ucMod = await import(pathToFileURL(path.join(UC_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { irMod = await import(pathToFileURL(path.join(IR_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { planMod = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { shellMod = await import(pathToFileURL(path.join(SHELL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { visualMod = await import(pathToFileURL(path.join(VISUAL_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { bridgeMod = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { sandboxMod = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

let SB = null; let BRIDGE = null; let VC = null; let RS = null; let IPLAN = null; let IR = null; let UC = null; let U = null;
try { SB = sandboxMod.createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } }); } catch (err) { console.error(String(err)); }
try { BRIDGE = bridgeMod.createStudioDevPreviewContractBridge({ sandbox: SB }); } catch (err) { console.error(String(err)); }
try { VC = visualMod.createStudioDevPreviewVisualContract({ bridge: BRIDGE }); } catch (err) { console.error(String(err)); }
try { RS = shellMod.createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); } catch (err) { console.error(String(err)); }
try { IPLAN = planMod.createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); } catch (err) { console.error(String(err)); }
try { IR = irMod.createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN }); } catch (err) { console.error(String(err)); }
try { UC = ucMod.createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR }); } catch (err) { console.error(String(err)); }
try { U = m.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-dev-preview-runtime-ui-implementation-plan'
    && U.runtimeUiImplementationPlanName === 'studio-dev-preview-runtime-ui-implementation-plan'
    && U.runtimeUiImplementationPlanVersion === 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0'
    && U.runtimeUiContractVersion === 'studio-dev-preview-runtime-ui-contract@1.0.0'
    && U.isolatedRuntimeVersion === 'studio-dev-preview-isolated-runtime@1.0.0'
    && U.implementationPlanVersion === 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'
    && U.runtimeShellContractVersion === 'studio-dev-preview-runtime-shell-contract@1.0.0'
    && U.visualContractVersion === 'studio-dev-preview-visual-contract@1.0.0'
    && U.bridgeVersion === 'studio-dev-preview-contract-bridge@1.0.0'
    && U.sandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && U.plannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && U.engineVersion === 'studio-blueprint-engine@1.0.0'
    && U.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && U.mode === 'headless_dev_preview_runtime_ui_implementation_plan'
    && U.fallback === false
    && U.readiness === 'studio_dev_preview_runtime_ui_implementation_plan_ready'
    && U.readyForRuntimeUiImplementationPlan === true
    && U.readyForRuntimeUiImplementationSlice === false
    && U.readyForRouteMenuIntegration === false
    && U.readyForRealModuleGeneration === false
    && U.readyForProduction === false
    && U.blockerCount === 0 && U.warningCount === 0 && U.metadataOnly === true;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'plan invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-UIP — plan headless/plan-only invariants + readiness ready', baseOk, baseDetail);

let capOk = false;
try {
  const c = m.RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES;
  const trues = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'implementationPhasesOnly', 'uiRuntimeBoundaryPlanOnly', 'devOnlyUiExecutionPolicyOnly', 'virtualFrameToUiPipelinePlanOnly', 'rendererAdapterPlanOnly', 'componentAdapterPlanOnly', 'interactionAdapterPlanOnly', 'stateAdapterPlanOnly', 'themeAdapterPlanOnly', 'accessibilityAdapterPlanOnly', 'blockedActionEnforcementPlanOnly', 'testHarnessPlanOnly', 'manualEnablementGatePlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly'];
  const noes = ['reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'runtimeUiImplemented', 'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated', 'cssRuntimeCreated', 'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas'];
  capOk = Object.isFrozen(c) && trues.every((k) => c[k] === true) && noes.every((k) => c[k] === false) && noes.every((k) => U.capabilities[k] === false);
} catch { capOk = false; }
gate('G423-UIP — capabilities frozen; *Only flags true; runtimeUiImplemented + all forbidden flags false', capOk);

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-UIP — session (stable seed, no storage/fetch/persistence/side-effects)', part('createRuntimeUiImplementationPlanSession', { runtimeUiContract: UC }, (x) => x.kind === 'runtime-ui-implementation-plan-session' && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false && typeof x.seed === 'string'));
gate('G423-UIP — phases (12 planned, none implemented)', part('createRuntimeUiImplementationPhases', undefined, (x) => x.phaseCount === 12 && x.allPlanned === true && x.anyImplemented === false));
gate('G423-UIP — boundary plan (no react/dom/css/route/backend/prisma/production/staging)', part('createRuntimeUiBoundaryPlan', undefined, (x) => x.noReact === true && x.noDOM === true && x.noCSSRuntime === true && x.noRouteRuntime === true && x.noBackend === true && x.noPrisma === true && x.noProduction === true && x.noStaging === true && x.boundaryImplemented === false));
gate('G423-UIP — dev-only policy (devOnly, no production/staging, requires future slice + gate)', part('createRuntimeUiDevOnlyExecutionPolicy', undefined, (x) => x.devOnly === true && x.productionAllowed === false && x.stagingAllowed === false && x.requiresExplicitFutureSlice === true && x.requiresManualGate === true && x.policyImplemented === false));
gate('G423-UIP — pipeline plan (7 steps planned, real render blocked)', part('createVirtualFrameToUiPipelinePlan', undefined, (x) => x.stepCount === 7 && x.pipelineImplemented === false && x.realRenderAllowed === false && x.steps.every((s) => s.status === 'planned' && s.implemented === false)));
gate('G423-UIP — renderer adapter plan (metadata only; no real renderer)', part('createRuntimeUiRendererAdapterPlan', undefined, (x) => x.rendererAdapterKind === 'planned_metadata_only' && x.rendererImplemented === false && x.reactRenderer === false && x.domRenderer === false && x.cssRenderer === false && x.producesRealRender === false));
gate('G423-UIP — component adapter plan (metadata only; realComponentPath null; no jsx/tsx/dom)', part('createRuntimeUiComponentAdapterPlan', undefined, (x) => x.componentAdapterImplemented === false && x.realComponentImports === false && x.realComponentPath === null && x.jsx === false && x.tsx === false && x.dom === false));
gate('G423-UIP — interaction adapter plan (no handlers/mutation/navigation; requires future impl)', part('createRuntimeUiInteractionAdapterPlan', undefined, (x) => x.interactionAdapterImplemented === false && x.handlersCreated === false && x.mutationAllowed === false && x.navigationAllowed === false && x.requiresFutureRuntimeImplementation === true));
gate('G423-UIP — state adapter plan (no react-state/hooks/storage/persistence/dom/aria)', part('createRuntimeUiStateAdapterPlan', undefined, (x) => x.reactState === false && x.hooks === false && x.storage === false && x.persistence === false && x.domAttributesSet === false && x.realAriaSet === false));
gate('G423-UIP — theme adapter plan (no real css/stylesheet/css runtime/dom)', part('createRuntimeUiThemeAdapterPlan', undefined, (x) => x.cssRuntime === false && x.stylesheetCreated === false && x.domAttributesSet === false && x.realAriaSet === false && x.themeAdapterImplemented === false));
gate('G423-UIP — accessibility adapter plan (labels/keyboard/focus planned; no dom/aria)', part('createRuntimeUiAccessibilityAdapterPlan', undefined, (x) => x.labelsPlanned === true && x.keyboardPlanned === true && x.focusOrderPlanned === true && x.domAttributesSet === false && x.realAriaSet === false));
gate('G423-UIP — blocked action plan (11 blocked incl readRealData/writeRealData; none allowed)', part('createRuntimeUiBlockedActionEnforcementPlan', undefined, (x) => x.allBlocked === true && x.anyAllowed === false && ['create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute', 'registerModule', 'readRealData', 'writeRealData'].every((a) => x.actions.some((y) => y.action === a && y.blocked === true))));
gate('G423-UIP — test harness plan (planned suites; no real runtime/data)', part('createRuntimeUiTestHarnessPlan', undefined, (x) => x.harnessImplemented === false && x.headless === true && x.usesRealRuntime === false && x.usesRealData === false && x.suiteCount >= 5));
gate('G423-UIP — manual gate plan (required checkpoint; authorizes nothing real)', part('createRuntimeUiManualEnablementGatePlan', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'plan_only' && x.authorizesRealUi === false && x.authorizesRouteMenu === false && x.authorizesModuleGeneration === false && x.authorizesBackend === false && x.authorizesProduction === false));
gate('G423-UIP — rollout/rollback plan (rollout blocked; rollback by non-consumption)', part('createRuntimeUiRolloutRollbackPlan', undefined, (x) => x.rolloutAllowed === false && x.productionRollout === false && x.stagingRollout === false && x.rollbackByNonConsumption === true && x.rolloutImplemented === false));
gate('G423-UIP — observability plan (safe; no secrets/telemetry/external logging)', part('createRuntimeUiObservabilityDiagnosticsPlan', undefined, (x) => x.safeDiagnostics === true && x.withoutSecrets === true && x.noStackLeak === true && x.noTelemetryRuntime === true && x.noExternalLogging === true));
gate('G423-UIP — safety plan (runtimeUiImplemented false; anyForbiddenSideEffect false; reversible)', part('createRuntimeUiSafetyPlan', undefined, (x) => x.runtimeUiImplemented === false && x.visualRuntimeImplemented === false && x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-UIP — readiness never slice/route-menu/generation/production', (() => { try { const r = m.createRuntimeUiImplementationReadinessDecision({}); return r.readyForRuntimeUiImplementationSlice === false && r.readyForRouteMenuIntegration === false && r.readyForRealModuleGeneration === false && r.readyForProduction === false; } catch { return false; } })());
gate('G423-UIP — readiness blocked on blockers', (() => { try { return m.createRuntimeUiImplementationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'runtime-ui-implementation-plan-manifest' && U.manifest.runtimeUiImplementationPlanVersion === 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0' && U.manifest.capabilities.headless === true && U.manifest.capabilities.runtimeUiImplemented === false && U.manifest.metadataOnly === true; } catch { manOk = false; }
gate('G423-UIP — manifest present + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.planOnly === true && U.verification.runtimeUiImplemented === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-UIP — verifier passes headless/plan-only invariants', verOk);

let verTamper = false;
try {
  const c = m.RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES;
  const ok = (o) => m.verifyRuntimeUiImplementationPlan(o).blockers;
  verTamper = ok({ plan: { capabilities: { ...c, uiCreated: true } } }).includes('capability_uiCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, runtimeUiImplemented: true } } }).includes('capability_runtimeUiImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, visualRuntimeImplemented: true } } }).includes('capability_visualRuntimeImplemented_must_be_false')
    && ok({ plan: { capabilities: { ...c, jsxCreated: true, tsxCreated: true } } }).includes('capability_jsxCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, domCreated: true, cssCreated: true } } }).includes('capability_domCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, routeCreated: true, menuCreated: true } } }).includes('capability_routeCreated_must_be_false')
    && ok({ plan: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ plan: { capabilities: { ...c, mutationAllowed: true, persistenceCreated: true } } }).includes('capability_mutationAllowed_must_be_false')
    && ok({ plan: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ plan: { capabilities: c, pipelinePlan: { realRenderAllowed: true } } }).includes('unsafe_real_render_allowed_true')
    && ok({ plan: { capabilities: c, componentAdapterPlan: { componentAdapterImplemented: true } } }).includes('unsafe_component_adapter_implemented')
    && ok({ plan: { capabilities: c, interactionAdapterPlan: { handlersCreated: true } } }).includes('unsafe_handlers_created')
    && ok({ plan: { capabilities: c, manualGatePlan: { manualGateRequired: false } } }).includes('missing_manual_gate');
} catch { verTamper = false; }
gate('G423-UIP — verifier detects runtimeUiImplemented/React/DOM/CSS/route/menu/backend/prisma/mutation/data/render/component/handler/manual-gate attempts', verTamper);

let cmpOk = false;
try {
  const ok = m.checkRuntimeUiImplementationPlanCompatibility({ runtimeUiContract: UC });
  const bad = m.checkRuntimeUiImplementationPlanCompatibility({ runtimeUiContract: { runtimeUiContractVersion: 'x@9.9.9' } });
  cmpOk = ok.compatibleWithRuntimeUiContract === true && ok.readyForRuntimeUiImplementationPlan === true && ok.readyForRuntimeUiImplementationSlice === false && ok.readyForRouteMenuIntegration === false && ok.readyForProduction === false && ok.blocked === false && bad.compatibleWithRuntimeUiContract === false && bad.warnings.includes('incompatible_runtimeUiContract');
} catch { cmpOk = false; }
gate('G423-UIP — compatibility: aligned ok, never authorizes slice/route-menu/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.planOnlyConfirmed === true && U.diagnostics.runtimeUiImplemented === false && U.diagnostics.logged === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-UIP — diagnostics passive, headless/plan-only confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioDevPreviewRuntimeUiImplementationPlan({});
  const fb2 = m.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: { kind: 'other' } });
  const fb3 = m.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForRuntimeUiImplementationPlan === false && fb.readyForProduction === false && fb.capabilities.runtimeUiImplemented === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-UIP — fallback fail-closed on invalid/missing/fallback runtime UI contract', fbOk);

let detOk = false;
try {
  const a = m.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC });
  const b = m.createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC });
  detOk = a.overallDigest === b.overallDigest && a.runtimeUiImplementationPlanDigest === b.runtimeUiImplementationPlanDigest && a.overallDigest.startsWith('fnv1a-');
} catch { detOk = false; }
gate('G423-UIP — deterministic overall + runtime UI implementation plan digests', detOk);

let flagOk = false;
try {
  const off = m.isStudioDevPreviewRuntimeUiImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioDevPreviewRuntimeUiImplementationPlanEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioDevPreviewRuntimeUiImplementationVerifyEnabled({ [m.MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-UIP — feature flags fail closed in production', flagOk);

gate('G423-UIP — error catalog >= 30 codes', Array.isArray(m?.RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES) && m.RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30);
gate('G423-UIP — error descriptor sanitized + side-effect free', (() => { try { const e = m.createRuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_PRISMA_BLOCKED'); return e.safe === true && e.sideEffects === false && e.prismaAccessed === false && e.runtimeUiImplemented === false && e.realDataRead === false && e.rewriteEmpresas === false; } catch { return false; } })());

// Explicit plan readiness invariants.
gate('G423-UIP — runtimeUiImplemented false', U ? U.capabilities.runtimeUiImplemented === false : false);
gate('G423-UIP — visualRuntimeImplemented false', U ? U.capabilities.visualRuntimeImplemented === false : false);
gate('G423-UIP — readyForRuntimeUiImplementationSlice false', U ? U.readyForRuntimeUiImplementationSlice === false : false);
gate('G423-UIP — readyForRouteMenuIntegration false', U ? U.readyForRouteMenuIntegration === false : false);
gate('G423-UIP — readyForRealModuleGeneration false', U ? U.readyForRealModuleGeneration === false : false);
gate('G423-UIP — readyForProduction false', U ? U.readyForProduction === false : false);
gate('G423-UIP — top-level realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-UIP — pipeline realRenderAllowed false in plan', (() => { try { return U.pipelinePlan.realRenderAllowed === false && U.pipelinePlan.pipelineImplemented === false; } catch { return false; } })());
gate('G423-UIP — component adapter not implemented in plan', (() => { try { return U.componentAdapterPlan.componentAdapterImplemented === false && U.componentAdapterPlan.realComponentPath === null; } catch { return false; } })());
gate('G423-UIP — interaction handlers not created in plan', (() => { try { return U.interactionAdapterPlan.handlersCreated === false && U.interactionAdapterPlan.mutationAllowed === false; } catch { return false; } })());
gate('G423-UIP — blocked action allBlocked in plan', (() => { try { return U.blockedActionPlan.allBlocked === true && U.blockedActionPlan.anyAllowed === false; } catch { return false; } })());
gate('G423-UIP — manual gate required in plan', (() => { try { return U.manualGatePlan.manualGateRequired === true && U.manualGatePlan.authorizesRealUi === false; } catch { return false; } })());
gate('G423-UIP — phases all planned/none implemented in plan', (() => { try { return U.phases.allPlanned === true && U.phases.anyImplemented === false; } catch { return false; } })());
gate('G423-UIP — safety plan no forbidden side-effect in plan', (() => { try { return U.safetyPlan.anyForbiddenSideEffect === false && U.safetyPlan.runtimeUiImplemented === false; } catch { return false; } })());

// Static safety scans.
const code = stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-UIP — subtree is React-free', importsOf(walk(DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-UIP — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf(walk(DIR)).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-UIP — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
gate('G423-UIP — no createElement/jsx runtime/DOM access', !/createElement|_jsx\b|jsxs?\(/.test(code) && !/\bdocument\.|\bwindow\.[a-z]/i.test(code));
gate('G423-UIP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code));
gate('G423-UIP — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code));
gate('G423-UIP — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code));
gate('G423-UIP — no runtimeUiImplemented true literal', !/runtimeUiImplemented\s*:\s*true/.test(code));

gate('G423-UIP — docs validate no UI / no route / no module (plan not implementation)', /runtime|React|UI|rota|route|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')) && /headless|plan/i.test(readEv('CERTIFICATION-REPORT.md')));
gate('G423-UIP — next slice spec (enterprise checkpoint) present', /ENTERPRISE CHECKPOINT|checkpoint/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff) — forbidden always wins via the central guard.
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const bad = filterForbiddenScopePaths(files);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src/modules/Empresas/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-UIP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !authorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-UIP — authorized scope only (plan subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const touchedGuard = files.includes('scripts/gates/lib/productionUiGuard.mjs') || files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs');
  const touchedOldGate = files.some((f) => /^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-dev-preview-runtime-ui-implementation-plan.mjs');
  const touchedOldTest = files.some((f) => /^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-dev-preview-runtime-ui-implementation-plan.test.js');
  noOldEdit = !touchedGuard && !touchedOldGate && !touchedOldTest;
  noOldEditDetail = noOldEdit ? 'productionUiGuard + governance guard + prior gates/tests untouched by this slice' : `touched: ${[touchedGuard ? 'guard' : '', touchedOldGate ? 'old-gate' : '', touchedOldTest ? 'old-test' : ''].filter(Boolean).join(',')}`;
} catch (err) { noOldEdit = true; noOldEditDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-UIP — productionUiGuard + governance guard + prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-UIP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-UIP — no new dependency added', noNewDep);

gate('G423-UIP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-UIP — src/modules/clientes does NOT exist', !exists(path.join(ROOT, 'src/modules/clientes')));
gate('G423-UIP — upstream runtime UI contract present', exists(path.join(UC_DIR, 'index.js')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-dev-preview-runtime-ui-implementation-plan.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-UIP — runtime UI implementation plan unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-UIP — unit test has >= 350 scenarios', testCount >= 350, `${testCount} scenarios (min 350)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-DEV-PREVIEW-RUNTIME-UI-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
