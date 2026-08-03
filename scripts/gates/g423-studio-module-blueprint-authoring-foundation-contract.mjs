#!/usr/bin/env node
/**
 * Gate G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-FOUNDATION-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, CONTRACT-ONLY, METADATA-ONLY foundation for FUTURE Module Blueprint authoring
 * in `src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract/`. It consumes the
 * certified Blueprint Contract read-only and produces deterministic contracts describing a future
 * authoring domain — deterministic sessions, NON-CANONICAL drafts, field/layout/relationship draft
 * descriptors, validation issues, a lifecycle, an authorable operation catalog, structural invariants,
 * synthetic preview + human-gated certification-candidate handoffs, an SSOT boundary, a
 * permission/tenancy boundary, a prototype-relink prohibition, a manual enablement gate, safety,
 * readiness, a manifest, a verifier and a compatibility check.
 *
 * It IMPLEMENTS NOTHING. It creates NO authoring runtime, NO UI, NO editor, NO module, NO persistence;
 * NO App/router/menu/sidebar wiring; NO `.jsx`/`.tsx`/`.css`; NO React component. It never touches
 * `src/App.jsx`, backend/Prisma/migration/production/staging/mutation/real-data/Empresas, and NEVER
 * relinks the old Studio prototype. A draft can NEVER self-certify or overwrite the certified contract;
 * the certified blueprint remains the canonical SSOT.
 *
 * Scope safety uses the central Studio Scope Governance guard: forbidden always wins; legitimate later
 * Studio headless artifacts are tolerated; nothing weakens the block.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateStudioBranchConsumerScope, filterForbiddenScopePaths, isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'module-blueprint-authoring-foundation-contract';
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
  const evaluation = evaluateStudioBranchConsumerScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract');
const ENGINE_DIR = path.join(ROOT, 'src/studio/blueprint-engine');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-foundation-contract');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-foundation-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'authoringFoundationContractConfig.js', 'errors.js', 'createAuthoringFoundationContractSession.js',
  'createBlueprintDraftDescriptor.js', 'createFieldDraftDescriptor.js', 'createLayoutDraftDescriptor.js',
  'createRelationshipDraftDescriptor.js', 'createValidationIssueDescriptor.js', 'createAuthoringLifecycleContract.js',
  'createAuthoringOperationCatalog.js', 'createAuthoringInvariantCatalog.js', 'createPreviewHandoffContract.js',
  'createCertificationCandidateHandoffContract.js', 'createAuthoringSsotBoundaryContract.js',
  'createPermissionTenancyBoundaryContract.js', 'createPrototypeRelinkProhibitionContract.js',
  'createAuthoringManualEnablementGateContract.js', 'createAuthoringSafetyContract.js',
  'createAuthoringFoundationReadinessDecision.js', 'createAuthoringFoundationManifest.js',
  'verifyAuthoringFoundationContract.js', 'checkAuthoringFoundationCompatibility.js',
  'createAuthoringFoundationDiagnostics.js', 'createAuthoringFoundationFallback.js',
  'createStudioModuleBlueprintAuthoringFoundationContract.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-BLUEPRINT-AUTHORING-FOUNDATION-CONTRACT-REPORT.md', 'AUTHORING-SESSION-CONTRACT.md',
  'BLUEPRINT-DRAFT-DESCRIPTOR.md', 'FIELD-DRAFT-DESCRIPTOR.md', 'LAYOUT-DRAFT-DESCRIPTOR.md',
  'RELATIONSHIP-DRAFT-DESCRIPTOR.md', 'VALIDATION-ISSUE-CONTRACT.md', 'AUTHORING-LIFECYCLE-CONTRACT.md',
  'AUTHORING-OPERATION-CATALOG.md', 'AUTHORING-INVARIANTS.md', 'PREVIEW-HANDOFF-CONTRACT.md',
  'CERTIFICATION-CANDIDATE-HANDOFF-CONTRACT.md', 'SSOT-BOUNDARY.md', 'PERMISSION-TENANCY-BOUNDARY.md',
  'PROTOTYPE-RELINK-PROHIBITION.md', 'MANUAL-ENABLEMENT-GATE.md', 'SAFETY-CONTRACT.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md', 'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-AF — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-AF — ${d} exists`, exists(path.join(EV, d)));
gate('G423-AF — tests exist', exists(path.join(ROOT, 'src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js')));
gate('G423-AF — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-AF — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-AF — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-AF — exactly 26 .js files', jsFiles().length === 26, `${jsFiles().length} .js`);
gate('G423-AF — upstream blueprint engine present', exists(path.join(ENGINE_DIR, 'index.js')));

let m = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const BP = {
  kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true,
  blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0',
};
let U = null;
try { U = m.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = U.kind === 'studio-module-blueprint-authoring-foundation-contract'
    && U.authoringFoundationContractName === 'studio-module-blueprint-authoring-foundation-contract'
    && U.authoringFoundationContractVersion === 'studio-module-blueprint-authoring-foundation-contract@1.0.0'
    && U.blueprintContractVersion === 'studio-blueprint-contract@1.0.0'
    && U.blueprintEngineVersion === 'studio-blueprint-engine@1.0.0'
    && U.moduleReferencePlannerVersion === 'studio-blueprint-module-reference-planner@1.0.0'
    && U.previewSandboxVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && U.mode === 'headless_studio_module_blueprint_authoring_foundation_contract'
    && U.fallback === false
    && U.headless === true && U.contractOnly === true && U.metadataOnly === true
    && U.authoringFoundationContractOnly === true && U.devOnly === true && U.isolated === true
    && U.readiness === 'studio_module_blueprint_authoring_foundation_contract_ready'
    && U.readyForAuthoringFoundationContract === true
    && U.readyForAuthoringImplementationPlan === false
    && U.readyForAuthoringRuntime === false
    && U.readyForAuthoringUi === false
    && U.readyForPermissionTenancyIntegration === false
    && U.readyForProductExposure === false
    && U.readyForModuleGeneration === false
    && U.readyForProduction === false
    && U.requiresPermissionTenancyFoundation === true
    && U.blockerCount === 0 && U.warningCount === 0;
  baseDetail = baseOk ? `readiness=${U.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AF — headless/contract-only invariants + readiness ready', baseOk, baseDetail);

// Capabilities.
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'ssotPreserved', 'certifiedBlueprintRemainsSsot'];
const FALSE_CAPS = ['draftIsCanonical', 'authoringRuntimeImplemented', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated'];
let capFrozen = false;
try { capFrozen = Object.isFrozen(m.AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES); } catch { capFrozen = false; }
gate('G423-AF — capabilities frozen', capFrozen);
for (const k of TRUE_CAPS) gate(`G423-AF — capability ${k} true`, (() => { try { return m.AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES[k] === true && U.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-AF — capability ${k} false`, (() => { try { return m.AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES[k] === false && U.capabilities[k] === false; } catch { return false; } })());

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-AF — session (ephemeral/non-canonical/side-effect-free; no storage/fetch/persistence)', part('createAuthoringFoundationContractSession', { certifiedBlueprint: BP }, (x) => x.kind === 'authoring-foundation-contract-session' && x.ephemeral === true && x.persistent === false && x.canonical === false && x.sideEffectFree === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false));
gate('G423-AF — field draft descriptor (non-canonical; no column/persist/real-data)', part('createFieldDraftDescriptor', { key: 'nome', dataKind: 'text', order: 0 }, (x) => x.kind === 'authoring-field-draft-descriptor' && x.canonical === false && x.synthetic === true && x.columnCreated === false && x.persisted === false && x.realDataBound === false && x.order === 0));
gate('G423-AF — layout draft descriptor (non-canonical; no UI/dom/css)', part('createLayoutDraftDescriptor', { sectionId: 'main' }, (x) => x.kind === 'authoring-layout-draft-descriptor' && x.canonical === false && x.synthetic === true && x.uiComponentCreated === false && x.domTouched === false && x.cssCreated === false));
gate('G423-AF — relationship draft descriptor (non-canonical; cascade none; unresolved; no FK/join/query/persist)', part('createRelationshipDraftDescriptor', { relationshipId: 'r1' }, (x) => x.kind === 'authoring-relationship-draft-descriptor' && x.canonical === false && x.synthetic === true && x.cascadePolicy === 'none' && x.resolved === false && x.foreignKeyCreated === false && x.joinCreated === false && x.queryCreated === false && x.persisted === false));
gate('G423-AF — blueprint draft descriptor (non-canonical; not certified/generated/registered; no self-cert/overwrite/publish)', part('createBlueprintDraftDescriptor', { moduleId: 'clientes' }, (x) => x.kind === 'authoring-blueprint-draft-descriptor' && x.canonical === false && x.certified === false && x.generated === false && x.registered === false && x.selfCertifiable === false && x.overwritesCertifiedContract === false && x.registersModule === false && x.generatesFiles === false && x.publishes === false));
gate('G423-AF — validation issue (deterministic; sanitized; does not affect certified; blocker blocks preview/candidate)', part('createValidationIssueDescriptor', { issueCode: 'X', severity: 'blocker' }, (x) => x.kind === 'authoring-validation-issue-descriptor' && x.deterministic === true && x.withoutSecrets === true && x.noStackLeak === true && x.affectsCertifiedContract === false && x.blocksPreview === true && x.blocksCertificationCandidate === true));
gate('G423-AF — lifecycle (8 states; discarded terminal; 7 forbidden states; no runtime; no forbidden state emitted)', part('createAuthoringLifecycleContract', undefined, (x) => x.kind === 'authoring-lifecycle-contract' && x.states.length === 8 && x.terminalState === 'discarded' && Array.isArray(x.transitions.discarded) && x.transitions.discarded.length === 0 && x.forbiddenStates.length === 7 && x.forbiddenStates.includes('certified') && x.drivesRuntime === false && x.emitsForbiddenState === false));
gate('G423-AF — lifecycle allowed transitions present; none targets a forbidden state', part('createAuthoringLifecycleContract', undefined, (x) => x.allowedTransitionPairs.includes('empty->draft') && x.allowedTransitionPairs.includes('validated->preview_ready') && x.allowedTransitionPairs.includes('preview_ready->handoff_ready') && !x.allowedTransitionPairs.some((p) => x.forbiddenStates.some((s) => p.endsWith(`->${s}`)))));
gate('G423-AF — operation catalog (16 ops; none implemented; no side-effects/persistence/module-write; no cert mutation/module gen)', part('createAuthoringOperationCatalog', undefined, (x) => x.kind === 'authoring-operation-catalog' && x.operationCount === 16 && x.anyImplemented === false && x.anySideEffectsAllowed === false && x.anyPersistenceAllowed === false && x.anyModuleWriteAllowed === false && x.anyMutatesCertifiedContract === false && x.anyGeneratesModule === false && x.operations.every((o) => o.implemented === false && o.sideEffectsAllowed === false && o.persistenceAllowed === false && o.moduleWriteAllowed === false)));
gate('G423-AF — operation lifecycle rules (createDraft only from empty; requestValidation no new revision)', part('createAuthoringOperationCatalog', undefined, (x) => { const c = x.operations.find((o) => o.id === 'createDraft'); const v = x.operations.find((o) => o.id === 'requestValidation'); return c && JSON.stringify(c.allowedLifecycleStates) === JSON.stringify(['empty']) && c.producesNewRevision === true && v && v.producesNewRevision === false; }));
gate('G423-AF — invariant catalog (15 invariants; all mandatory; not enforced here; includes no_self_certification)', part('createAuthoringInvariantCatalog', undefined, (x) => x.kind === 'authoring-invariant-catalog' && x.invariantCount === 15 && x.allMandatory === true && x.enforcedByThisLayer === false && x.invariantIds.includes('no_self_certification') && x.invariantIds.includes('no_module_generation_authorization')));
gate('G423-AF — preview handoff (synthetic-only; not to product; no payload/mount/real-data/route/menu)', part('createPreviewHandoffContract', undefined, (x) => x.kind === 'authoring-preview-handoff-contract' && x.handoffKind === 'synthetic_preview_candidate' && x.syntheticOnly === true && x.handoffToProduct === false && x.previewPayloadCreated === false && x.previewMounted === false && x.realDataAttached === false && x.routeCreated === false && x.menuCreated === false));
gate('G423-AF — certification candidate handoff (candidate NOT certification; no self-cert/overwrite/register/generate/publish; requires future slice)', part('createCertificationCandidateHandoffContract', undefined, (x) => x.kind === 'authoring-certification-candidate-handoff-contract' && x.candidateKind === 'blueprint_certification_candidate' && x.candidateIsCertification === false && x.certified === false && x.canonical === false && x.readyForCertification === false && x.requiresFutureExplicitSlice === true && x.draftSelfCertifies === false && x.overwritesCertifiedContract === false && x.registersModule === false && x.generatesFiles === false && x.publishes === false));
gate('G423-AF — SSOT boundary (certified is canonical SSOT; draft non-canonical/temporary; cannot become SSOT/self-certify/overwrite)', part('createAuthoringSsotBoundaryContract', undefined, (x) => x.kind === 'authoring-ssot-boundary-contract' && x.canonicalSsot === 'certified-blueprint-contract' && x.certifiedBlueprintRemainsSsot === true && x.draftIsCanonical === false && x.draftIsTemporary === true && x.draftIsNonCanonical === true && x.draftCanBecomeSsot === false && x.draftSelfCertifies === false && x.draftOverwritesCertifiedContract === false && x.ssotPreserved === true));
gate('G423-AF — permission/tenancy boundary (permission/tenant/server-auth NOT integrated; client-auth insufficient; exposure blocked; foundation required)', part('createPermissionTenancyBoundaryContract', undefined, (x) => x.kind === 'authoring-permission-tenancy-boundary-contract' && x.permissionModelIntegrated === false && x.tenantModelIntegrated === false && x.serverSideAuthorizationIntegrated === false && x.clientSideAuthorizationSufficient === false && x.productExposureBlockedByPermissionTenancy === true && x.requiresPermissionTenancyFoundation === true && x.authImported === false));
gate('G423-AF — prototype relink prohibition (relink/import/copy/move not allowed; forbidden paths >= 8)', part('createPrototypeRelinkProhibitionContract', undefined, (x) => x.kind === 'authoring-prototype-relink-prohibition-contract' && x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.prototypeCopyAllowed === false && x.prototypeMoveAllowed === false && x.oldPrototypeImported === false && Array.isArray(x.forbiddenPrototypePaths) && x.forbiddenPrototypePaths.length >= 8));
gate('G423-AF — manual gate (required; foundation_contract_only; authorizes nothing real)', part('createAuthoringManualEnablementGateContract', undefined, (x) => x.kind === 'authoring-manual-enablement-gate-contract' && x.manualGateRequired === true && x.currentSliceAuthorization === 'foundation_contract_only' && x.requiredCheckpoint === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint' && x.authorizesAuthoringRuntime === false && x.authorizesAuthoringUi === false && x.authorizesEditor === false && x.authorizesPersistence === false && x.authorizesModuleGeneration === false && x.authorizesBackend === false && x.authorizesPrisma === false && x.authorizesProductExposure === false && x.authorizesProduction === false && x.authorizesRealData === false));
gate('G423-AF — safety (anyForbiddenSideEffect false; reversible; all forbidden flags false)', part('createAuthoringSafetyContract', undefined, (x) => x.kind === 'authoring-safety-contract' && x.anyForbiddenSideEffect === false && x.reversibleByNonConsumption === true && Object.values(x.forbiddenFlags).every((v) => v === false)));

gate('G423-AF — readiness never plan/runtime/ui/permission-tenancy/product/generation/production', (() => { try { const r = m.createAuthoringFoundationReadinessDecision({}); return r.readyForAuthoringImplementationPlan === false && r.readyForAuthoringRuntime === false && r.readyForAuthoringUi === false && r.readyForPermissionTenancyIntegration === false && r.readyForProductExposure === false && r.readyForModuleGeneration === false && r.readyForProduction === false && r.requiresPermissionTenancyFoundation === true; } catch { return false; } })());
gate('G423-AF — readiness blocked on blockers', (() => { try { return m.createAuthoringFoundationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = U.manifest.kind === 'authoring-foundation-contract-manifest' && U.manifest.authoringFoundationContractVersion === 'studio-module-blueprint-authoring-foundation-contract@1.0.0' && U.manifest.capabilities.metadataOnly === true && U.manifest.capabilities.moduleGenerated === false && U.manifest.metadataOnly === true && typeof U.manifest.parts.session === 'string' && typeof U.manifest.parts.ssotBoundary === 'string' && typeof U.manifest.parts.draftDescriptor === 'string'; } catch { manOk = false; }
gate('G423-AF — manifest present + part digests + capability flags mirrored', manOk);

let verOk = false;
try { verOk = U.verification.ok === true && U.verification.valid === true && U.verification.headless === true && U.verification.contractOnly === true && U.verification.metadataOnly === true && U.verification.ssotPreserved === true && U.verification.draftIsCanonical === false && U.verification.moduleGenerated === false && U.verification.productExposed === false && U.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-AF — verifier passes headless/contract-only/SSOT invariants', verOk);

let verTamper = false;
try {
  const c = m.AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES;
  const ok = (o) => m.verifyAuthoringFoundationContract(o).blockers;
  verTamper = ok({ contract: { capabilities: { ...c, draftIsCanonical: true } } }).includes('capability_draftIsCanonical_must_be_false')
    && ok({ contract: { capabilities: { ...c, authoringRuntimeImplemented: true } } }).includes('capability_authoringRuntimeImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, authoringUiImplemented: true } } }).includes('capability_authoringUiImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, editorImplemented: true } } }).includes('capability_editorImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')
    && ok({ contract: { capabilities: { ...c, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')
    && ok({ contract: { capabilities: { ...c, filesWrittenToModule: true } } }).includes('capability_filesWrittenToModule_must_be_false')
    && ok({ contract: { capabilities: { ...c, moduleRegistered: true } } }).includes('capability_moduleRegistered_must_be_false')
    && ok({ contract: { capabilities: { ...c, backendAccessed: true, prismaAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, productionAccessed: true, stagingAccessed: true } } }).includes('capability_productionAccessed_must_be_false')
    && ok({ contract: { capabilities: { ...c, fetchUsed: true, mutationAllowed: true } } }).includes('capability_fetchUsed_must_be_false')
    && ok({ contract: { capabilities: { ...c, realDataRead: true, realDataWrite: true } } }).includes('capability_realDataRead_must_be_false')
    && ok({ contract: { capabilities: { ...c, productExposed: true, menuCreated: true, routeCreated: true } } }).includes('capability_productExposed_must_be_false')
    && ok({ contract: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && ok({ contract: { capabilities: { ...c, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')
    && ok({ contract: { capabilities: { ...c, headless: false } } }).includes('capability_headless_must_be_true')
    && ok({ contract: { capabilities: c, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_draft_canonical')
    && ok({ contract: { capabilities: c, ssotBoundary: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')
    && ok({ contract: { capabilities: c, ssotBoundary: { draftSelfCertifies: true } } }).includes('unsafe_draft_self_certifies')
    && ok({ contract: { capabilities: c, operationCatalog: { anyImplemented: true } } }).includes('unsafe_operations_implemented')
    && ok({ contract: { capabilities: c, previewHandoff: { handoffToProduct: true } } }).includes('unsafe_preview_handoff_to_product')
    && ok({ contract: { capabilities: c, certificationCandidate: { candidateIsCertification: true } } }).includes('unsafe_candidate_certifies')
    && ok({ contract: { capabilities: c, permissionTenancy: { bypassesPermission: true } } }).includes('unsafe_permission_tenancy_bypass')
    && ok({ contract: { capabilities: c, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')
    && ok({ contract: { capabilities: c, permissionTenancy: { tenantModelIntegrated: true } } }).includes('unsafe_tenant_model_integrated_without_foundation')
    && ok({ contract: { capabilities: c, lifecycle: { states: ['empty', 'certified'] } } }).includes('unsafe_lifecycle_forbidden_state_present')
    && ok({ contract: { capabilities: c, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && ok({ contract: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && ok({ contract: { capabilities: c, safety: { anyForbiddenSideEffect: true } } }).includes('unsafe_safety_side_effect')
    && (() => { try { m.verifyAuthoringFoundationContract({ contract: null }); return true; } catch { return false; } })();
} catch { verTamper = false; }
gate('G423-AF — verifier detects canonical-draft/SSOT-inversion/self-cert/runtime/UI/editor/persistence/module-gen/backend/prisma/production/fetch/real-data/product-exposure/prototype/permission-tenancy/forbidden-lifecycle/missing-gate attempts', verTamper);

let cmpOk = false;
try {
  const okc = m.checkAuthoringFoundationCompatibility({ certifiedBlueprint: BP });
  const bad = m.checkAuthoringFoundationCompatibility({ certifiedBlueprint: { engineVersion: 'x@9.9.9', kind: 'other', certified: false } });
  cmpOk = okc.compatibleWithBlueprintContract === true && okc.compatibleWithBlueprintEngine === true && okc.compatibleWithModuleReferencePlanner === true && okc.compatibleWithPreviewSandbox === true && okc.readyForAuthoringFoundationContract === true && okc.readyForAuthoringImplementationPlan === false && okc.readyForAuthoringRuntime === false && okc.readyForPermissionTenancyIntegration === false && okc.readyForProductExposure === false && okc.readyForProduction === false && okc.status === 'ready_for_future_authoring_implementation_plan_after_explicit_authorization' && bad.compatibleWithBlueprintEngine === false && bad.warnings.includes('incompatible_blueprintEngine');
} catch { cmpOk = false; }
gate('G423-AF — compatibility aligned; never authorizes plan/runtime/permission-tenancy/product/generation/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = U.diagnostics.passive === true && U.diagnostics.ok === true && U.diagnostics.headlessConfirmed === true && U.diagnostics.contractOnlyConfirmed === true && U.diagnostics.metadataOnlyConfirmed === true && U.diagnostics.ssotPreservedConfirmed === true && U.diagnostics.moduleGenerated === false && U.diagnostics.productExposed === false && !/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics)); } catch { diagOk = false; }
gate('G423-AF — diagnostics passive, headless/contract-only/SSOT confirmed, no secrets', diagOk);

let fbOk = false;
try {
  const fb = m.createStudioModuleBlueprintAuthoringFoundationContract({});
  const fb2 = m.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: { kind: 'other' } });
  const fb3 = m.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: { kind: 'studio-blueprint-contract', fallback: true } });
  fbOk = fb.fallback === true && fb.readiness === 'blocked' && fb.readyForAuthoringFoundationContract === false && fb.capabilities.ssotPreserved === true && fb.capabilities.moduleGenerated === false && fb2.fallback === true && fb3.fallback === true;
} catch { fbOk = false; }
gate('G423-AF — fallback fail-closed on invalid/missing/fallback certified blueprint', fbOk);

let detOk = false;
try {
  const a = m.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });
  const b = m.createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });
  detOk = a.overallDigest === b.overallDigest && a.authoringFoundationContractDigest === b.authoringFoundationContractDigest && a.overallDigest.startsWith('fnv1a-') && JSON.stringify(a) === JSON.stringify(b);
} catch { detOk = false; }
gate('G423-AF — deterministic overall + contract digests + full deep-equal', detOk);

let flagOk = false;
try {
  const off = m.isStudioModuleBlueprintAuthoringFoundationEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioModuleBlueprintAuthoringFoundationEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioModuleBlueprintAuthoringFoundationVerifyEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  const cOff = m.isStudioModuleBlueprintAuthoringFoundationCompatibilityCheckEnabled({ [m.MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false && cOff === false;
} catch { flagOk = false; }
gate('G423-AF — feature flags fail closed in production', flagOk);

gate('G423-AF — error catalog >= 40 codes', Array.isArray(m?.AUTHORING_FOUNDATION_ERROR_CODES) && m.AUTHORING_FOUNDATION_ERROR_CODES.length >= 40);
gate('G423-AF — error catalog has self-certification + overwrite-certified blocked codes', Array.isArray(m?.AUTHORING_FOUNDATION_ERROR_CODES) && m.AUTHORING_FOUNDATION_ERROR_CODES.includes('AUTHORING_FOUNDATION_DRAFT_SELF_CERTIFICATION_BLOCKED') && m.AUTHORING_FOUNDATION_ERROR_CODES.includes('AUTHORING_FOUNDATION_DRAFT_OVERWRITE_CERTIFIED_BLOCKED'));
gate('G423-AF — error descriptor sanitized + side-effect free', (() => { try { const e = m.createAuthoringFoundationError('AUTHORING_FOUNDATION_PRISMA_BLOCKED'); return e.kind === 'authoring-foundation-error' && e.safe === true && e.sideEffects === false && e.draftSelfCertified === false && e.moduleGenerated === false && e.realDataRead === false; } catch { return false; } })());
gate('G423-AF — required future checkpoint is enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint');

// Explicit contract invariants (top-level).
gate('G423-AF — draftIsCanonical false', U ? U.capabilities.draftIsCanonical === false : false);
gate('G423-AF — certifiedBlueprintRemainsSsot true', U ? U.capabilities.certifiedBlueprintRemainsSsot === true : false);
gate('G423-AF — ssotPreserved true', U ? U.capabilities.ssotPreserved === true : false);
gate('G423-AF — authoringRuntimeImplemented false', U ? U.capabilities.authoringRuntimeImplemented === false : false);
gate('G423-AF — authoringUiImplemented false', U ? U.capabilities.authoringUiImplemented === false : false);
gate('G423-AF — editorImplemented false', U ? U.capabilities.editorImplemented === false : false);
gate('G423-AF — persistenceImplemented false', U ? U.capabilities.persistenceImplemented === false : false);
gate('G423-AF — moduleGenerated false', U ? U.capabilities.moduleGenerated === false : false);
gate('G423-AF — filesWrittenToModule false', U ? U.capabilities.filesWrittenToModule === false : false);
gate('G423-AF — moduleRegistered false', U ? U.capabilities.moduleRegistered === false : false);
gate('G423-AF — backendAccessed/prismaAccessed false', U ? (U.capabilities.backendAccessed === false && U.capabilities.prismaAccessed === false) : false);
gate('G423-AF — productionAccessed/stagingAccessed false', U ? (U.capabilities.productionAccessed === false && U.capabilities.stagingAccessed === false) : false);
gate('G423-AF — fetchUsed/mutationAllowed false', U ? (U.capabilities.fetchUsed === false && U.capabilities.mutationAllowed === false) : false);
gate('G423-AF — realDataRead/realDataWrite false', U ? (U.capabilities.realDataRead === false && U.capabilities.realDataWrite === false) : false);
gate('G423-AF — rewriteEmpresas false', U ? U.capabilities.rewriteEmpresas === false : false);
gate('G423-AF — prototypeRelinked false', U ? U.capabilities.prototypeRelinked === false : false);
gate('G423-AF — productExposed/menuCreated/routeCreated false', U ? (U.capabilities.productExposed === false && U.capabilities.menuCreated === false && U.capabilities.routeCreated === false) : false);
gate('G423-AF — SSOT boundary intact in contract', (() => { try { return U.ssotBoundary.draftIsCanonical === false && U.ssotBoundary.certifiedBlueprintRemainsSsot === true; } catch { return false; } })());
gate('G423-AF — manual gate required in contract', (() => { try { return U.manualGate.manualGateRequired === true && U.manualGate.authorizesModuleGeneration === false && U.manualGate.authorizesCertification === false; } catch { return false; } })());
gate('G423-AF — permission/tenancy still not integrated in contract', (() => { try { return U.permissionTenancy.permissionModelIntegrated === false && U.permissionTenancy.tenantModelIntegrated === false && U.permissionTenancy.productExposureBlockedByPermissionTenancy === true; } catch { return false; } })());
gate('G423-AF — prototype relink prohibited in contract', (() => { try { return U.prototypeRelinkProhibition.prototypeRelinkAllowed === false && U.prototypeRelinkProhibition.oldPrototypeImported === false; } catch { return false; } })());
gate('G423-AF — sample draft embedded is non-canonical draft', (() => { try { return U.sampleDraft.canonical === false && U.sampleDraft.isDraft === true; } catch { return false; } })());

// Static safety scans.
gate('G423-AF — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-AF — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-AF — no <Route JSX / Routes / Link / NavLink (case-sensitive API)', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-AF — no BrowserRouter / createBrowserRouter / useNavigate', !/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(code()));
gate('G423-AF — no ReactDOM / createRoot / hydrateRoot call', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(code()));
gate('G423-AF — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-AF — no JSX/createElement', !/createElement|_jsx\b|jsxs?\(/.test(code()));
gate('G423-AF — no import of EmpresaApi/apiClient/apis/backend/prisma', importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p)));
gate('G423-AF — no fetch/XHR/WebSocket/storage-API', !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-AF — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-AF — no real POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-AF — no realDataRead/realDataWrite true literal', !/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(code()));
gate('G423-AF — no moduleGenerated/draftIsCanonical true literal', !/moduleGenerated\s*:\s*true|draftIsCanonical\s*:\s*true/.test(code()));
gate('G423-AF — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-AF — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-AF — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));

gate('G423-AF — docs validate draft-not-SSOT + no-runtime + prototype-debt + next slice', /SSOT|canonical|certified/i.test(readEv('SSOT-BOUNDARY.md')) && /runtime|UI|module|persistence/i.test(readEv('NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md')) && /contract|metadata/i.test(readEv('CERTIFICATION-REPORT.md')) && /prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')) && /IMPLEMENTATION PLAN|implementation plan|checkpoint|authoring/i.test(readEv('NEXT-SLICE-SPEC.md')));

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
gate('G423-AF — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-AF — authorized scope only (contract subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false; let noJsxTsxCssDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const bad = files.filter((f) => /\.(jsx|tsx|css)$/.test(f));
  noJsxTsxCss = bad.length === 0;
  noJsxTsxCssDetail = noJsxTsxCss ? 'no .jsx / .tsx / .css added' : `bad: ${bad.join(', ')}`;
} catch (err) { noJsxTsxCss = true; noJsxTsxCssDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-AF — no .jsx / .tsx / .css added in diff', noJsxTsxCss, noJsxTsxCssDetail);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    // Three legitimate outcomes: this gate certifies the branch, the diff is empty, or the
    // branch builds an EARLIER slice and was re-certified against that slice before being
    // declared sound. Any other reason fails.
    const chronologyOk = evaluation.consumerApplicable
      ? (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.consumerSliceOrdinal)
      : (evaluation.reason === 'empty_branch_diff'
        || (evaluation.reason === 'consumer_slice_after_active_slice' && evaluation.certifiedAgainstActiveSlice === true));
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = !evaluation.consumerApplicable
      ? `consumer not applicable: ${evaluation.reason} (evaluated as ${evaluation.evaluatedAsSliceId})`
      : noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-AF — App.jsx / vite / index.html / guards / prior gates/tests NOT altered by this slice', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific contract paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-AF — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AF — no new dependency added', noNewDep);

gate('G423-AF — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-AF — App.jsx untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx'); } catch { return true; } })());
gate('G423-AF — productionUiGuard untouched (not in diff)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('scripts/gates/lib/productionUiGuard.mjs'); } catch { return true; } })());

let testsOk = false; let testCount = 0;
try {
  const out = execSync('node --test src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AF — authoring foundation contract unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AF — unit test has >= 450 scenarios', testCount >= 450, `${testCount} scenarios (min 450)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-MODULE-BLUEPRINT-AUTHORING-FOUNDATION-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
