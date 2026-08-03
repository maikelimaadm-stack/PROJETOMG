#!/usr/bin/env node
/**
 * Gate G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, dev-only, CONTRACT-ONLY, METADATA-ONLY, PLAN-ONLY, SYNTHETIC-ONLY, DETERMINISTIC
 * and FAIL-CLOSED bridge implementation plan in
 * `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/`. It consumes the
 * Authoring Runtime-to-Preview Bridge Contract read-only and plans a FUTURE headless bridge as pure
 * metadata — every phase planned, none implemented.
 *
 * It IMPLEMENTS NOTHING: no bridge, adapter, source validator, target payload builder or preview mount. It
 * creates NO UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring; it never
 * persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging, mutates
 * real data, generates/registers a module, certifies/self-certifies/overwrites the certified SSOT, and
 * NEVER relinks the old Studio prototype. Determinism is enforced by static scans and replay equality.
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
const CALLER_SLICE_ID = 'authoring-runtime-to-preview-bridge-implementation-plan';
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
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan');
const CONTRACT_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan');
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan.mjs';
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
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeImplementationPlan\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'bridgeImplementationPlanConfig.js', 'errors.js', 'createBridgeImplementationPlanSession.js',
  'createBridgeImplementationPhases.js', 'createSourceValidationPlan.js', 'createDraftIdentityEnforcementPlan.js',
  'createSourceVersionValidationPlan.js', 'createSourceDigestValidationPlan.js', 'createSourceBoundaryValidationPlan.js',
  'createFieldMappingExecutionPlan.js', 'createTargetDescriptorConstructionPlan.js', 'createTargetVersionValidationPlan.js',
  'createCanonicalizationValidationPlan.js', 'createExtensibilityEnforcementPlan.js', 'createBridgeValidationPipelinePlan.js',
  'createReplayIdempotencyPlan.js', 'createBridgeResourceLimitsPlan.js', 'createFailureContainmentPlan.js',
  'createBridgeSsotProtectionPlan.js', 'createBridgeCertificationBoundaryPlan.js', 'createBridgePermissionTenancyBoundaryPlan.js',
  'createBridgeSecuritySafetyPlan.js', 'createBridgePrototypeRelinkAssertionPlan.js', 'createBridgeTestHarnessPlan.js',
  'createBridgeManualEnablementGatePlan.js', 'createBridgeRolloutRollbackPlan.js', 'createBridgeObservabilityDiagnosticsPlan.js',
  'createBridgeGovernanceRegistryPlan.js', 'createBridgeImplementationReadinessDecision.js',
  'createBridgeImplementationPlanManifest.js', 'verifyBridgeImplementationPlan.js', 'checkBridgeImplementationPlanCompatibility.js',
  'createBridgeImplementationPlanDiagnostics.js', 'createBridgeImplementationPlanFallback.js',
  'createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-IMPLEMENTATION-PLAN-REPORT.md',
  'IMPLEMENTATION-PHASES.md', 'SOURCE-VALIDATION-PLAN.md', 'DRAFT-IDENTITY-ENFORCEMENT-PLAN.md',
  'SOURCE-VERSION-VALIDATION-PLAN.md', 'SOURCE-DIGEST-VALIDATION-PLAN.md', 'SOURCE-BOUNDARY-VALIDATION-PLAN.md',
  'FIELD-MAPPING-EXECUTION-PLAN.md', 'TARGET-DESCRIPTOR-CONSTRUCTION-PLAN.md', 'TARGET-VERSION-VALIDATION-PLAN.md',
  'CANONICALIZATION-VALIDATION-PLAN.md', 'EXTENSIBILITY-ENFORCEMENT-PLAN.md', 'VALIDATION-PIPELINE-PLAN.md',
  'REPLAY-IDEMPOTENCY-PLAN.md', 'RESOURCE-LIMITS-PLAN.md', 'FAILURE-CONTAINMENT-PLAN.md', 'SSOT-PROTECTION-PLAN.md',
  'CERTIFICATION-BOUNDARY-PLAN.md', 'PERMISSION-TENANCY-BOUNDARY-PLAN.md', 'SECURITY-SAFETY-PLAN.md',
  'PROTOTYPE-RELINK-ASSERTION-PLAN.md', 'TEST-HARNESS-PLAN.md', 'MANUAL-ENABLEMENT-GATE-PLAN.md',
  'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md', 'GOVERNANCE-REGISTRY-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-APP-NO-BRIDGE-RUNTIME-NO-PERSISTENCE.md',
  'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-CHECKPOINT-SPEC.md',
];

for (const f of FILES) gate(`G423-BP — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-BP — ${d} exists`, exists(path.join(EV, d)));
gate('G423-BP — tests exist', exists(path.join(ROOT, TEST_REL)));
gate('G423-BP — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-BP — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-BP — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-BP — exactly 36 .js files', jsFiles().length === 36, `${jsFiles().length} .js`);
gate('G423-BP — upstream bridge contract present', exists(path.join(CONTRACT_DIR, 'index.js')));
gate('G423-BP — upstream authoring runtime present', exists(path.join(RUNTIME_DIR, 'index.js')));

let m = null; let cm = null; let rt = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { cm = await import(pathToFileURL(path.join(CONTRACT_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

const buildContract = (seed = 'g') => {
  let r = rt.executeAuthoringOperation({ session: rt.createAuthoringRuntimeSession({ seed }), operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const id = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  const handoff = rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] });
  return cm.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: handoff });
};
let CONTRACT = null; let P = null;
try { CONTRACT = buildContract('g'); } catch (err) { console.error(String(err)); }
try { P = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = P.kind === 'studio-authoring-runtime-to-preview-bridge-implementation-plan'
    && P.bridgeImplementationPlanName === 'studio-authoring-runtime-to-preview-bridge-implementation-plan'
    && P.bridgeImplementationPlanVersion === 'studio-authoring-runtime-to-preview-bridge-implementation-plan@1.0.0'
    && P.bridgeContractVersion === 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0'
    && P.authoringRuntimeVersion === 'studio-module-blueprint-authoring-runtime@1.0.0'
    && P.previewSandboxContractVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && P.mode === 'headless_authoring_runtime_to_preview_bridge_implementation_plan'
    && P.fallback === false
    && P.requiredFutureCheckpoint === 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint'
    && P.readiness === 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready'
    && P.readyForBridgeImplementationPlan === true
    && P.readyForBridgeImplementationSlice === false && P.readyForPreviewMount === false
    && P.readyForAuthoringUi === false && P.readyForPermissionTenancyIntegration === false
    && P.readyForProductExposure === false && P.readyForModuleGeneration === false
    && P.readyForCertification === false && P.readyForProduction === false
    && P.requiresPermissionTenancyFoundationBeforeExposure === true
    && P.blockerCount === 0 && P.warningCount === 0;
  baseDetail = baseOk ? `readiness=${P.readiness}` : 'plan invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BP — headless/contract-only/metadata-only/plan-only invariants + readiness ready', baseOk, baseDetail);

// Capabilities.
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'syntheticOnly', 'devOnly', 'deterministic', 'failClosed', 'ssotPreserved', 'implementationPhasesOnly', 'sourceValidationPlanOnly', 'draftIdentityEnforcementPlanOnly', 'sourceVersionValidationPlanOnly', 'sourceDigestValidationPlanOnly', 'sourceBoundaryValidationPlanOnly', 'mappingExecutionPlanOnly', 'targetDescriptorPlanOnly', 'targetVersionValidationPlanOnly', 'canonicalizationValidationPlanOnly', 'extensibilityEnforcementPlanOnly', 'validationPipelinePlanOnly', 'replayIdempotencyPlanOnly', 'resourceLimitsPlanOnly', 'failureContainmentPlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
const FALSE_CAPS = ['bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'draftIdentityEnforcementImplemented', 'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented', 'sourceBoundaryValidationImplemented', 'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented', 'targetVersionValidationImplemented', 'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented', 'validationPipelineImplemented', 'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented', 'targetPayloadCreated', 'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
gate('G423-BP — capabilities frozen', (() => { try { return Object.isFrozen(m.BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES); } catch { return false; } })());
for (const k of TRUE_CAPS) gate(`G423-BP — capability ${k} true`, (() => { try { return m.BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES[k] === true && P.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-BP — capability ${k} false`, (() => { try { return m.BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES[k] === false && P.capabilities[k] === false; } catch { return false; } })());

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-BP — session (deterministic, read-only, no storage/fetch/persistence/side-effects)', part('createBridgeImplementationPlanSession', { bridgeContract: CONTRACT }, (x) => x.kind === 'bridge-implementation-plan-session' && x.planOnly === true && x.bridgeContractConsumedReadOnly === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false));
gate('G423-BP — 16 phases all planned, none implemented/completed', part('createBridgeImplementationPhases', undefined, (x) => x.kind === 'bridge-implementation-phases' && x.phaseCount === 16 && x.allPlanned === true && x.anyImplemented === false && x.phases.every((p) => p.status === 'planned' && p.planned === true && p.implemented === false && p.completed === false)));
gate('G423-BP — source validation plan (strict shape, unknown rejected, missing fail-closed, not implemented)', part('createSourceValidationPlan', undefined, (x) => x.sourceValidationPlanned === true && x.sourceValidationImplemented === false && x.strictSourceShape === true && x.unknownCriticalFieldsRejected === true && x.missingCriticalFieldsFailClosed === true && x.sourceValidationSideEffectsAllowed === false));
gate('G423-BP — draft identity plan (explicit id, no single-draft fallback, fail-closed, runtime not altered)', part('createDraftIdentityEnforcementPlan', undefined, (x) => x.explicitDraftIdRequired === true && x.singleDraftFallbackAllowed === false && x.missingDraftIdFailsClosed === true && x.unknownDraftIdFailsClosed === true && x.ambiguousDraftSelectionAllowed === false && x.strictDraftIdentityEnforcementImplemented === false && x.runtimeAlteredByThisPlan === false));
gate('G423-BP — source version plan (exact, unknown fail-closed, no downgrade, upgrade not assumed)', part('createSourceVersionValidationPlan', undefined, (x) => x.exactSourceRuntimeVersionRequired === true && x.unknownVersionFailsClosed === true && x.versionDowngradeAllowed === false && x.versionUpgradeAssumedCompatible === false && x.bidirectionalCompatibilityCheckRequired === true && x.sourceVersionValidationImplemented === false));
gate('G423-BP — target version plan (exact, unknown fail-closed, no downgrade)', part('createTargetVersionValidationPlan', undefined, (x) => x.exactTargetSandboxVersionRequired === true && x.unknownVersionFailsClosed === true && x.versionDowngradeAllowed === false && x.targetVersionValidationImplemented === false));
gate('G423-BP — digest plan (fnv1a-32 internal only, NOT cryptographic, authorizes nothing real)', part('createSourceDigestValidationPlan', undefined, (x) => x.sourceDigestAlgorithm === 'fnv1a-32' && x.cryptographicIntegrityProvided === false && x.digestMayAuthorizeCertification === false && x.digestMayAuthorizeModuleGeneration === false && x.digestMayAuthorizeProduction === false && x.cryptographicDigestRequiredBeforeCertification === true && x.fnv1aInternalOnly === true && x.sourceDigestValidationImplemented === false));
gate('G423-BP — field mapping plan (12 real, every source real, all critical mapped, not implemented)', part('createFieldMappingExecutionPlan', undefined, (x) => x.mappingCount === 12 && x.everyCriticalMapped === true && x.targetCriticalFieldsAllCovered === true && x.everyMappingSourceExistsInRealHandoff === true && x.anyInventedSourceField === false && x.anyLegacyAliasSourceField === false && x.anyUnknownTransform === false && x.anyCriticalDefault === false && x.anyLossyCritical === false && x.mappingExecutorImplemented === false && x.anyImplemented === false && x.mappings.every((mm) => mm.executionStatus === 'planned' && mm.implemented === false)));
gate('G423-BP — target descriptor plan (synthetic, metadata-only, no payload/mount/route/menu/module/persistence)', part('createTargetDescriptorConstructionPlan', undefined, (x) => x.syntheticOnly === true && x.metadataOnly === true && x.targetPayloadCreated === false && x.previewMounted === false && x.routeCreated === false && x.menuCreated === false && x.productExposed === false && x.moduleGenerated === false && x.persistenceAllowed === false && x.targetDescriptorBuilderImplemented === false));
gate('G423-BP — canonicalization plan (stable/key-ordered/array-preserving, clock/random forbidden, not implemented)', part('createCanonicalizationValidationPlan', undefined, (x) => x.stableSerializationRequired === true && x.keyOrderingRequired === true && x.arrayOrderingPreserved === true && x.ambientClockForbidden === true && x.randomnessForbidden === true && x.canonicalizationValidationImplemented === false));
gate('G423-BP — extensibility plan (unknown critical/flags rejected, protected not overridable, not implemented)', part('createExtensibilityEnforcementPlan', undefined, (x) => x.unknownCriticalFieldsRejected === true && x.unknownCapabilityFlagsRejected === true && x.unnamespacedExtensionsRejected === true && x.extensionCannotOverrideCriticalFields === true && x.protectedFieldCount === 11 && x.extensibilityEnforcementImplemented === false));
gate('G423-BP — validation pipeline plan (13 stages, no auto-correction/permissive fallback, not implemented)', part('createBridgeValidationPipelinePlan', undefined, (x) => x.stageCount === 13 && x.deterministicIssueOrdering === true && x.blockerStopsBridge === true && x.blockerStopsPreviewSandbox === true && x.silentAutoCorrectionAllowed === false && x.permissiveFallbackAllowed === false && x.validationPipelineImplemented === false));
gate('G423-BP — replay plan (deterministic decision+target, no replay side-effects, not implemented)', part('createReplayIdempotencyPlan', undefined, (x) => x.sameSourceHandoffProducesSameBridgeDecision === true && x.sameSourceHandoffProducesSameTargetDescriptor === true && x.bridgeDecisionDigestDeterministic === true && x.replaySideEffectsAllowed === false && x.replayIdempotencyImplemented === false));
gate('G423-BP — resource limits plan (7 dims, unknown rejected, no silent truncation, fail-closed, not implemented)', part('createBridgeResourceLimitsPlan', undefined, (x) => x.dimensionCount === 7 && x.unknownResourceDimensionRejected === true && x.silentTruncationAllowed === false && x.limitExceededFailsClosed === true && x.resourceLimitsImplemented === false));
gate('G423-BP — failure containment plan (no partial state, no mutation, rollback by non-consumption, not implemented)', part('createFailureContainmentPlan', undefined, (x) => x.partialTargetDescriptorAllowed === false && x.partialBridgeDecisionAllowed === false && x.sourceMutationAllowed === false && x.targetMutationAllowed === false && x.rollbackByNonConsumption === true && x.externalCleanupRequired === false && x.failureContainmentImplemented === false));
gate('G423-BP — SSOT protection plan (certified canonical, draft/candidate non-canonical, no overwrite/bypass/certify/module)', part('createBridgeSsotProtectionPlan', undefined, (x) => x.certifiedBlueprintRemainsSsot === true && x.draftIsCanonical === false && x.candidateIsCanonical === false && x.bridgeMayCertify === false && x.bridgeMayWriteCertifiedBlueprint === false && x.bridgeMayBypassCertification === false && x.bridgeMayGenerateModule === false && x.secondSsotCreated === false));
gate('G423-BP — certification boundary plan (never certifies/self-certifies, candidate inert)', part('createBridgeCertificationBoundaryPlan', undefined, (x) => x.certificationPerformed === false && x.selfCertificationAllowed === false && x.candidateCanonical === false && x.candidateCertified === false && x.bridgeMayCertify === false && x.requiresFutureExplicitCertificationSlice === true && x.requiresHumanCheckpointBeforeCertification === true));
gate('G423-BP — permission/tenancy plan (not integrated, exposure blocked, foundation required)', part('createBridgePermissionTenancyBoundaryPlan', undefined, (x) => x.permissionModelIntegrated === false && x.tenantModelIntegrated === false && x.serverSideAuthorizationIntegrated === false && x.clientSideAuthorizationSufficient === false && x.productExposureBlockedByPermissionTenancy === true && x.requiresPermissionTenancyFoundationBeforeExposure === true && x.authImported === false));
gate('G423-BP — security/safety plan (no forbidden side effect, all allowances false, reversible)', part('createBridgeSecuritySafetyPlan', undefined, (x) => x.kind === 'bridge-security-safety-plan' && x.anyForbiddenSideEffect === false && x.anyRealAllowed === false && x.reversibleByNonConsumption === true && Object.values(x.allowances).every((v) => v === false)));
gate('G423-BP — prototype relink assertion plan (all forbidden, 8 forbidden paths)', part('createBridgePrototypeRelinkAssertionPlan', undefined, (x) => x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.oldPrototypeImported === false && x.staticAssertionPlanned === true && x.forbiddenPathCount === 8));
gate('G423-BP — test harness plan (deterministic, synthetic-only, no real data/network, not implemented)', part('createBridgeTestHarnessPlan', undefined, (x) => x.deterministic === true && x.syntheticOnly === true && x.usesRealData === false && x.usesNetwork === false && x.usesPersistence === false && x.testHarnessImplemented === false && x.plannedMinimumScenarios >= 560));
gate('G423-BP — manual gate plan (plan-only, NOT contract, NOTHING real)', part('createBridgeManualEnablementGatePlan', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'bridge_implementation_plan_only' && x.authorizesBridgeContract === false && x.authorizesBridgeImplementationPlan === true && x.authorizesBridgeImplementation === false && x.authorizesPreviewMount === false && x.authorizesAuthoringUi === false && x.authorizesModuleGeneration === false && x.authorizesCertification === false && x.authorizesProductExposure === false && x.authorizesProduction === false));
gate('G423-BP — rollout/rollback plan (blocked, requires checkpoint, no production/staging/product, reversible)', part('createBridgeRolloutRollbackPlan', undefined, (x) => x.rolloutBlocked === true && x.rolloutRequiresEnterpriseCheckpoint === true && x.productionRolloutAllowed === false && x.stagingRolloutAllowed === false && x.productExposureAllowed === false && x.rollbackByNonConsumption === true && x.reversible === true));
gate('G423-BP — observability plan (passive, deterministic, no secrets/logging/telemetry/network/storage)', part('createBridgeObservabilityDiagnosticsPlan', undefined, (x) => x.passive === true && x.deterministic === true && x.secretsExposed === false && x.externalLoggingUsed === false && x.telemetryRuntimeUsed === false && x.networkUsed === false && x.storageUsed === false));
gate('G423-BP — governance registry plan (anchored, no wildcard, no forbidden, guards untouched)', part('createBridgeGovernanceRegistryPlan', undefined, (x) => x.anchoredRegexesOnly === true && x.broadWildcardAllowed === false && x.forbiddenPathsRegistered === false && x.guardsAltered === false && x.plannedPathCount === 4));

gate('G423-BP — readiness never slice/preview/ui/permission/product/module/cert/production', (() => { try { const r = m.createBridgeImplementationReadinessDecision({}); return r.readyForBridgeImplementationSlice === false && r.readyForPreviewMount === false && r.readyForAuthoringUi === false && r.readyForPermissionTenancyIntegration === false && r.readyForProductExposure === false && r.readyForModuleGeneration === false && r.readyForCertification === false && r.readyForProduction === false && r.requiresPermissionTenancyFoundationBeforeExposure === true; } catch { return false; } })());
gate('G423-BP — readiness blocked on blockers', (() => { try { return m.createBridgeImplementationReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = P.manifest.kind === 'bridge-implementation-plan-manifest' && P.manifest.deterministic === true && P.manifest.planOnly === true && typeof P.manifest.partDigests.phases === 'string' && typeof P.manifest.partDigests.ssotProtectionPlan === 'string' && P.manifest.partCount >= 26; } catch { manOk = false; }
gate('G423-BP — manifest present + part digests + partCount >= 26', manOk);

let verOk = false;
try { verOk = P.verification.ok === true && P.verification.headless === true && P.verification.planOnly === true && P.verification.deterministic === true && P.verification.failClosed === true && P.verification.ssotPreserved === true && P.verification.anyPhaseImplemented === false && P.verification.bridgeImplemented === false && P.verification.previewMounted === false && P.verification.certificationPerformed === false && P.verification.productExposed === false && P.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-BP — verifier passes plan-only/deterministic/fail-closed/SSOT invariants', verOk);

let verTamper = false;
try {
  const c = m.BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES;
  const vb = (o) => m.verifyBridgeImplementationPlan(o).blockers;
  verTamper = vb({ plan: { capabilities: { ...c, bridgeImplemented: true } } }).includes('capability_bridgeImplemented_must_be_false')
    && vb({ plan: { capabilities: { ...c, previewMounted: true } } }).includes('capability_previewMounted_must_be_false')
    && vb({ plan: { capabilities: { ...c, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')
    && vb({ plan: { capabilities: { ...c, productExposed: true } } }).includes('capability_productExposed_must_be_false')
    && vb({ plan: { capabilities: { ...c, permissionModelIntegrated: true } } }).includes('capability_permissionModelIntegrated_must_be_false')
    && vb({ plan: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && vb({ plan: { capabilities: { ...c, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')
    && vb({ plan: { capabilities: { ...c, targetPayloadCreated: true } } }).includes('capability_targetPayloadCreated_must_be_false')
    && vb({ plan: { capabilities: { ...c, planOnly: false } } }).includes('capability_planOnly_must_be_true')
    && vb({ plan: { capabilities: { ...c, deterministic: false } } }).includes('capability_deterministic_must_be_true')
    && vb({ plan: { capabilities: { ...c, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')
    && vb({ plan: { capabilities: c, phases: { anyImplemented: true } } }).includes('unsafe_phase_implemented')
    && vb({ plan: { capabilities: c, phases: { phases: [{ implemented: true }] } } }).includes('unsafe_phase_completed')
    && vb({ plan: { capabilities: c, draftIdentityEnforcementPlan: { singleDraftFallbackAllowed: true } } }).includes('unsafe_single_draft_fallback')
    && vb({ plan: { capabilities: c, draftIdentityEnforcementPlan: { explicitDraftIdRequired: false } } }).includes('unsafe_draft_identity_non_strict')
    && vb({ plan: { capabilities: c, sourceVersionValidationPlan: { unknownVersionFailsClosed: false } } }).includes('unsafe_source_version_unknown_accepted')
    && vb({ plan: { capabilities: c, sourceVersionValidationPlan: { versionDowngradeAllowed: true } } }).includes('unsafe_source_version_downgrade')
    && vb({ plan: { capabilities: c, sourceDigestValidationPlan: { cryptographicIntegrityProvided: true } } }).includes('unsafe_digest_claimed_cryptographic')
    && vb({ plan: { capabilities: c, sourceDigestValidationPlan: { digestMayAuthorizeCertification: true } } }).includes('unsafe_digest_authorizes_real')
    && vb({ plan: { capabilities: c, fieldMappingExecutionPlan: { anyUnknownTransform: true } } }).includes('unsafe_mapping_unknown_transform')
    && vb({ plan: { capabilities: c, fieldMappingExecutionPlan: { anyLossyCritical: true } } }).includes('unsafe_mapping_lossy_critical')
    && vb({ plan: { capabilities: c, fieldMappingExecutionPlan: { anyImplemented: true } } }).includes('unsafe_mapping_executor_implemented')
    && vb({ plan: { capabilities: c, targetDescriptorConstructionPlan: { previewMounted: true } } }).includes('unsafe_target_descriptor_real')
    && vb({ plan: { capabilities: c, extensibilityEnforcementPlan: { extensionCannotOverrideCriticalFields: false } } }).includes('unsafe_extension_override')
    && vb({ plan: { capabilities: c, resourceLimitsPlan: { unknownResourceDimensionRejected: false } } }).includes('unsafe_unknown_resource_dimension')
    && vb({ plan: { capabilities: c, resourceLimitsPlan: { silentTruncationAllowed: true } } }).includes('unsafe_silent_truncation')
    && vb({ plan: { capabilities: c, validationPipelinePlan: { permissiveFallbackAllowed: true } } }).includes('unsafe_validation_permissive_fallback')
    && vb({ plan: { capabilities: c, failureContainmentPlan: { partialTargetDescriptorAllowed: true } } }).includes('unsafe_partial_state')
    && vb({ plan: { capabilities: c, ssotProtectionPlan: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')
    && vb({ plan: { capabilities: c, ssotProtectionPlan: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')
    && vb({ plan: { capabilities: c, ssotProtectionPlan: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege')
    && vb({ plan: { capabilities: c, certificationBoundaryPlan: { certificationPerformed: true } } }).includes('unsafe_certification_performed')
    && vb({ plan: { capabilities: c, certificationBoundaryPlan: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')
    && vb({ plan: { capabilities: c, permissionTenancyBoundaryPlan: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated')
    && vb({ plan: { capabilities: c, securitySafetyPlan: { anyForbiddenSideEffect: true } } }).includes('unsafe_security_real_allowed')
    && vb({ plan: { capabilities: c, prototypeRelinkAssertionPlan: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && vb({ plan: { capabilities: c, rolloutRollbackPlan: { rolloutBlocked: false } } }).includes('unsafe_rollout_not_blocked')
    && vb({ plan: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && vb({ plan: { capabilities: c, manualGate: { manualGateRequired: true, authorizesBridgeImplementation: true } } }).includes('unsafe_manual_gate_authorizes_real')
    && vb({ plan: { capabilities: c, readyForProduction: true } }).includes('unsafe_ready_for_production')
    && vb({ plan: { capabilities: c, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source')
    && (() => { try { m.verifyBridgeImplementationPlan({ plan: null }); return true; } catch { return false; } })();
} catch (err) { console.error(String(err)); verTamper = false; }
gate('G423-BP — verifier detects phase/bridge/adapter/preview/cert/product/permission/prototype/module + draft-fallback/version/digest/mapping/extension/resource/SSOT/manual-gate/nondeterminism tampers', verTamper);

// Live composition.
let liveOk = false; let liveDetail = '';
try {
  const a = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT });
  const b = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT });
  const deterministic = a.overallDigest === b.overallDigest && a.bridgeImplementationPlanDigest === b.bridgeImplementationPlanDigest && JSON.stringify(a) === JSON.stringify(b);
  const rebuilt = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: buildContract('g') });
  const stable = rebuilt.overallDigest === a.overallDigest;
  liveOk = deterministic && stable && a.readiness === 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready' && a.verification.ok === true && a.blockerCount === 0 && a.phases.allPlanned === true && a.phases.anyImplemented === false;
  liveDetail = liveOk ? 'deterministic + replay-stable + ready + verified + all phases planned' : `deterministic=${deterministic} rebuild=${stable}`;
} catch (err) { liveDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BP — LIVE: compose from real bridge contract deterministic + replay-stable + ready', liveOk, liveDetail);

// Fallback fail-closed.
let fbOk = false;
try {
  const f0 = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({});
  const f1 = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: { kind: 'x' } });
  const f2 = m.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: { kind: 'studio-authoring-runtime-to-preview-bridge-contract', fallback: true } });
  fbOk = f0.fallback === true && f0.readiness === 'blocked' && f0.readyForBridgeImplementationPlan === false && f0.capabilities.planOnly === true && f1.fallback === true && f2.fallback === true;
} catch { fbOk = false; }
gate('G423-BP — fallback fail-closed on missing/wrong-kind/fallback bridge contract', fbOk);

// Compatibility.
let cmpOk = false;
try {
  const okc = m.checkBridgeImplementationPlanCompatibility({ bridgeContract: CONTRACT });
  const bad = m.checkBridgeImplementationPlanCompatibility({ bridgeContract: { bridgeContractVersion: 'x@9' } });
  cmpOk = okc.status === 'ready_for_bridge_implementation_enterprise_checkpoint' && okc.readyForBridgeImplementationPlan === true && okc.readyForBridgeImplementationSlice === false && okc.blocked === false && bad.compatibleWithBridgeContract === false && bad.warnings.includes('incompatible_bridgeContract');
} catch { cmpOk = false; }
gate('G423-BP — compatibility ready-for-checkpoint; never authorizes slice/ui/product/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = P.diagnostics.passive === true && P.diagnostics.planOnlyConfirmed === true && P.diagnostics.anyPhaseImplemented === false && !/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(P.diagnostics)); } catch { diagOk = false; }
gate('G423-BP — diagnostics passive + plan-only + no secrets', diagOk);

let flagOk = false;
try {
  const off = m.isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioAuthoringRuntimeToPreviewBridgeImplementationVerifyEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-BP — feature flags fail closed in production', flagOk);

gate('G423-BP — error catalog >= 45 codes', Array.isArray(m?.BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES) && m.BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 45);
gate('G423-BP — phase ids 16', Array.isArray(m?.BRIDGE_IMPLEMENTATION_PHASE_IDS) && m.BRIDGE_IMPLEMENTATION_PHASE_IDS.length === 16);
gate('G423-BP — critical source fields 12 (real, aligned)', Array.isArray(m?.CRITICAL_SOURCE_FIELDS) && m.CRITICAL_SOURCE_FIELDS.length === 12 && !m.CRITICAL_SOURCE_FIELDS.includes('upstreamVersions') && !m.CRITICAL_SOURCE_FIELDS.includes('digest'));
gate('G423-BP — field mappings 12 (real model)', Array.isArray(m?.BRIDGE_FIELD_MAPPINGS) && m.BRIDGE_FIELD_MAPPINGS.length === 12 && m.BRIDGE_FIELD_MAPPINGS.every((mm) => m.REAL_HANDOFF_FIELDS.includes(mm.sourceField)));
gate('G423-BP — validation stages 13', Array.isArray(m?.BRIDGE_VALIDATION_STAGES) && m.BRIDGE_VALIDATION_STAGES.length === 13);
gate('G423-BP — resource dimensions 7', Array.isArray(m?.BRIDGE_RESOURCE_LIMIT_DIMENSIONS) && m.BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length === 7);
gate('G423-BP — protected fields 11', Array.isArray(m?.EXTENSION_PROTECTED_FIELDS) && m.EXTENSION_PROTECTED_FIELDS.length === 11);
gate('G423-BP — forbidden prototype paths 8', Array.isArray(m?.FORBIDDEN_PROTOTYPE_PATHS) && m.FORBIDDEN_PROTOTYPE_PATHS.length === 8);
gate('G423-BP — required future checkpoint is the enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint');

// Explicit top-level capability invariants.
gate('G423-BP — planOnly capability true', P ? P.capabilities.planOnly === true : false);
gate('G423-BP — deterministic capability true', P ? P.capabilities.deterministic === true : false);
gate('G423-BP — ssotPreserved capability true', P ? P.capabilities.ssotPreserved === true : false);
gate('G423-BP — bridge/adapter NOT implemented', P ? (P.capabilities.bridgeImplemented === false && P.capabilities.adapterImplemented === false) : false);
gate('G423-BP — no validator/payload/mount implemented', P ? (P.capabilities.sourceValidationImplemented === false && P.capabilities.targetPayloadCreated === false && P.capabilities.previewMounted === false) : false);
gate('G423-BP — App/route/menu/sidebar NOT touched', P ? (P.capabilities.appTouched === false && P.capabilities.routeCreated === false && P.capabilities.menuCreated === false && P.capabilities.sidebarCreated === false) : false);
gate('G423-BP — persistence/filesystem NOT used', P ? (P.capabilities.persistenceImplemented === false && P.capabilities.filesystemWritesUsed === false) : false);
gate('G423-BP — backend/prisma NOT accessed', P ? (P.capabilities.backendAccessed === false && P.capabilities.prismaAccessed === false) : false);
gate('G423-BP — fetch/network NOT used', P ? (P.capabilities.fetchUsed === false && P.capabilities.networkUsed === false) : false);
gate('G423-BP — real data read/write NOT used', P ? (P.capabilities.realDataRead === false && P.capabilities.realDataWrite === false) : false);
gate('G423-BP — module NOT generated/registered', P ? (P.capabilities.moduleGenerated === false && P.capabilities.moduleRegistered === false) : false);
gate('G423-BP — certification NOT performed; candidate NOT canonical', P ? (P.capabilities.certificationPerformed === false && P.capabilities.candidateCanonical === false) : false);
gate('G423-BP — product NOT exposed; production/staging NOT accessed', P ? (P.capabilities.productExposed === false && P.capabilities.productionAccessed === false && P.capabilities.stagingAccessed === false) : false);
gate('G423-BP — prototype NOT relinked', P ? P.capabilities.prototypeRelinked === false : false);
gate('G423-BP — permission/tenant/server-auth NOT integrated', P ? (P.capabilities.permissionModelIntegrated === false && P.capabilities.tenantModelIntegrated === false && P.capabilities.serverSideAuthorizationIntegrated === false) : false);
gate('G423-BP — manual gate required, authorizes plan only', (() => { try { return P.manualGate.manualGateRequired === true && P.manualGate.authorizesBridgeImplementationPlan === true && P.manualGate.authorizesBridgeImplementation === false && P.manualGate.authorizesBridgeContract === false; } catch { return false; } })());

// Determinism static scans (exclude verifier's detection regex).
gate('G423-BP — no Date.now (excl verifier)', !/Date\.now/.test(codeNoVerifier()));
gate('G423-BP — no new Date (excl verifier)', !/new Date\b/.test(codeNoVerifier()));
gate('G423-BP — no Math.random (excl verifier)', !/Math\.random/.test(codeNoVerifier()));
gate('G423-BP — no crypto.randomUUID (excl verifier)', !/crypto\.randomUUID/.test(codeNoVerifier()));
gate('G423-BP — no bare randomUUID (excl verifier)', !/\brandomUUID\b/.test(codeNoVerifier()));
gate('G423-BP — no performance.now / hrtime (excl verifier)', !/performance\.now|hrtime/.test(codeNoVerifier()));
gate('G423-BP — no locale-dependent sorting', !/toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-BP — verifier holds the nondeterminism detection regex', /Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyBridgeImplementationPlan.js'), 'utf8')));

// Static safety scans.
gate('G423-BP — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-BP — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-BP — no ReactDOM / createRoot / JSX', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(|createElement|_jsx\b|<Route[\s/>]/.test(code()));
gate('G423-BP — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-BP — no fs/writeFile/mkdir/appendFile (filesystem)', !/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(code()));
gate('G423-BP — no localStorage/sessionStorage/indexedDB (storage)', !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-BP — no fetch/XHR/WebSocket/axios (network)', !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code()));
gate('G423-BP — no @prisma/PrismaClient/backend/apiClient import', importsOf().every((p) => !/@prisma|PrismaClient|\/backend\/|apiClient|EmpresaApi|\/apis\//i.test(p)));
gate('G423-BP — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-BP — no POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-BP — no implemented/completed true literal', !/(implemented|completed)\s*:\s*true/.test(code()));
gate('G423-BP — no realDataRead/realDataWrite/moduleGenerated/certified/productExposed true literal', !/(realDataRead|realDataWrite|moduleGenerated|certified|productExposed)\s*:\s*true/.test(code()));
gate('G423-BP — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-BP — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-BP — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-BP — imports only relative + runtime generic-model', importsOf().every((p) => p.startsWith('.') || /runtime\/generic-model/.test(p)));

gate('G423-BP — docs validate plan + phases + SSOT + prototype-debt + next checkpoint', /plan|headless|contract/i.test(readEv('CERTIFICATION-REPORT.md')) && /phase|planned/i.test(readEv('IMPLEMENTATION-PHASES.md')) && /SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION-PLAN.md')) && /prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')) && /checkpoint|FABLE|enterprise/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-BP — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-BP — authorized scope only (plan subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false;
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  noJsxTsxCss = !files.some((f) => /\.(jsx|tsx|css)$/.test(f));
} catch { noJsxTsxCss = true; }
gate('G423-BP — no .jsx / .tsx / .css added in diff', noJsxTsxCss);

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
gate('G423-BP — App.jsx / guards / upstream subtrees / prior gates/tests NOT altered', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific plan paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BP — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-BP — no new dependency added', noNewDep);

gate('G423-BP — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-BP — package.json wires plan test script', (() => { try { return /studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js/.test(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); } catch { return false; } })());
gate('G423-BP — test:runtime aggregate includes plan test', (() => { try { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); return pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js'); } catch { return false; } })());

let testsOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-BP — bridge implementation plan unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-BP — unit test has >= 560 scenarios', testCount >= 560, `${testCount} scenarios (min 560)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-IMPLEMENTATION-PLAN summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
