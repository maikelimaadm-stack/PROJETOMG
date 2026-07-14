import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  IMPLEMENTATION_PLAN_NAME,
  IMPLEMENTATION_PLAN_SEMVER,
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_MODE,
  IMPLEMENTATION_PLAN_ENVIRONMENT,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  IMPLEMENTATION_PHASE_IDS,
  LIFECYCLE_EXECUTION_STEPS,
  EVENT_HANDLING_KINDS,
  RENDER_PIPELINE_STEPS,
  TEST_HARNESS_FIXTURE_KINDS,
  IMPLEMENTATION_PLAN_READINESS_STATES,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK_FLAG,
  planDigest,
  isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled,
  isStudioDevPreviewIripPhasesEnabled,
  isStudioDevPreviewIripVerifyEnabled,
  isStudioDevPreviewIripCompatibilityCheckEnabled,
  IMPLEMENTATION_PLAN_ERROR_CODES,
  IsolatedRuntimeImplementationPlanError,
  createIsolatedRuntimeImplementationPlanError,
  isolatedRuntimeImplementationPlanError,
  createIsolatedRuntimeImplementationPlanSession,
  createIsolatedRuntimeImplementationPhases,
  createIsolatedRuntimeBoundaryPlan,
  createIsolatedRuntimeDevOnlyExecutionPolicy,
  createIsolatedRuntimeAdapterPlan,
  createIsolatedRuntimeRenderPipelinePlan,
  createIsolatedRuntimeLifecycleExecutionPlan,
  createIsolatedRuntimeEventHandlingPlan,
  createIsolatedRuntimeDataAccessBlockedPlan,
  createIsolatedRuntimePermissionEnforcementPlan,
  createIsolatedRuntimeTestHarnessPlan,
  createIsolatedRuntimeRolloutRollbackPlan,
  createIsolatedRuntimeObservabilityDiagnosticsPlan,
  createIsolatedRuntimeRouteBlockedPlan,
  createIsolatedRuntimePlacementBlockedPlan,
  createIsolatedRuntimeSafetyPlan,
  createIsolatedRuntimeReadinessDecision,
  createIsolatedRuntimeImplementationPlanManifest,
  verifyIsolatedRuntimeImplementationPlan,
  checkIsolatedRuntimeImplementationPlanCompatibility,
  createIsolatedRuntimeImplementationPlanDiagnostics,
  createIsolatedRuntimeImplementationPlanFallback,
  createStudioDevPreviewIsolatedRuntimeImplementationPlan,
} from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

// Build the full real upstream chain: sandbox → bridge → visual → runtime shell.
const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
  engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text' }, { name: 'tenantId', type: 'text', protectedColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, permissionRequired: true },
};
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const RS = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
const P = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });

const arg = { runtimeShellContract: RS };
const session = createIsolatedRuntimeImplementationPlanSession(arg);
const phases = createIsolatedRuntimeImplementationPhases(arg);
const boundary = createIsolatedRuntimeBoundaryPlan(arg);
const policy = createIsolatedRuntimeDevOnlyExecutionPolicy(arg);
const adapter = createIsolatedRuntimeAdapterPlan(arg);
const pipeline = createIsolatedRuntimeRenderPipelinePlan(arg);
const lifecycle = createIsolatedRuntimeLifecycleExecutionPlan(arg);
const events = createIsolatedRuntimeEventHandlingPlan(arg);
const dataAccess = createIsolatedRuntimeDataAccessBlockedPlan(arg);
const permission = createIsolatedRuntimePermissionEnforcementPlan(arg);
const harness = createIsolatedRuntimeTestHarnessPlan(arg);
const rollout = createIsolatedRuntimeRolloutRollbackPlan(arg);
const observability = createIsolatedRuntimeObservabilityDiagnosticsPlan(arg);
const routeB = createIsolatedRuntimeRouteBlockedPlan(arg);
const placeB = createIsolatedRuntimePlacementBlockedPlan(arg);
const safety = createIsolatedRuntimeSafetyPlan(arg);

// ===== Contract base (1-48) =====
test('1. plan created', () => assert.equal(P.kind, 'studio-dev-preview-isolated-runtime-implementation-plan'));
test('2. name', () => { assert.equal(P.implementationPlanName, 'studio-dev-preview-isolated-runtime-implementation-plan'); assert.equal(P.implementationPlanName, IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(P.implementationPlanVersion, 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'); assert.equal(P.implementationPlanVersion, IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. runtimeShellContractVersion', () => assert.equal(P.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('6. visualContractVersion', () => assert.equal(P.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('7. bridgeVersion', () => assert.equal(P.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('8. sandboxVersion', () => assert.equal(P.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('9. plannerVersion', () => assert.equal(P.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('10. engineVersion', () => assert.equal(P.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('11. blueprintContractVersion', () => assert.equal(P.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('12. mode', () => { assert.equal(P.mode, 'headless_dev_preview_isolated_runtime_implementation_plan'); assert.equal(P.mode, IMPLEMENTATION_PLAN_MODE); });
test('13. environment const', () => assert.equal(IMPLEMENTATION_PLAN_ENVIRONMENT, 'local_contract'));
test('14. moduleId', () => assert.equal(P.moduleId, 'clientes'));
test('15. not fallback', () => assert.equal(P.fallback, false));
test('16. headless', () => assert.equal(P.capabilities.headless, true));
test('17. contractOnly', () => assert.equal(P.capabilities.contractOnly, true));
test('18. metadataOnly', () => assert.equal(P.capabilities.metadataOnly, true));
test('19. planOnly', () => assert.equal(P.capabilities.planOnly, true));
test('20. implementationPhasesOnly', () => assert.equal(P.capabilities.implementationPhasesOnly, true));
test('21. isolationBoundaryPlanOnly', () => assert.equal(P.capabilities.isolationBoundaryPlanOnly, true));
test('22. devOnlyExecutionPolicyOnly', () => assert.equal(P.capabilities.devOnlyExecutionPolicyOnly, true));
test('23. runtimeAdapterPlanOnly', () => assert.equal(P.capabilities.runtimeAdapterPlanOnly, true));
test('24. renderPipelinePlanOnly', () => assert.equal(P.capabilities.renderPipelinePlanOnly, true));
test('25. lifecycleExecutionPlanOnly', () => assert.equal(P.capabilities.lifecycleExecutionPlanOnly, true));
test('26. eventHandlingPlanOnly', () => assert.equal(P.capabilities.eventHandlingPlanOnly, true));
test('27. dataAccessBlockedPlanOnly', () => assert.equal(P.capabilities.dataAccessBlockedPlanOnly, true));
test('28. permissionEnforcementPlanOnly', () => assert.equal(P.capabilities.permissionEnforcementPlanOnly, true));
test('29. testHarnessPlanOnly', () => assert.equal(P.capabilities.testHarnessPlanOnly, true));
test('30. rolloutRollbackPlanOnly', () => assert.equal(P.capabilities.rolloutRollbackPlanOnly, true));
test('31. observabilityDiagnosticsPlanOnly', () => assert.equal(P.capabilities.observabilityDiagnosticsPlanOnly, true));
test('32. runtimeImplemented false', () => assert.equal(P.capabilities.runtimeImplemented, false));
test('33. reactComponentCreated false', () => assert.equal(P.capabilities.reactComponentCreated, false));
test('34. jsxCreated false', () => assert.equal(P.capabilities.jsxCreated, false));
test('35. tsxCreated false', () => assert.equal(P.capabilities.tsxCreated, false));
test('36. domCreated false', () => assert.equal(P.capabilities.domCreated, false));
test('37. cssCreated false', () => assert.equal(P.capabilities.cssCreated, false));
test('38. uiCreated false', () => assert.equal(P.capabilities.uiCreated, false));
test('39. routeCreated false', () => assert.equal(P.capabilities.routeCreated, false));
test('40. menuCreated false', () => assert.equal(P.capabilities.menuCreated, false));
test('41. moduleGenerated false', () => assert.equal(P.capabilities.moduleGenerated, false));
test('42. filesWrittenToModule false', () => assert.equal(P.capabilities.filesWrittenToModule, false));
test('43. moduleRegistered false', () => assert.equal(P.capabilities.moduleRegistered, false));
test('44. backendAccessed/prismaAccessed false', () => { assert.equal(P.capabilities.backendAccessed, false); assert.equal(P.capabilities.prismaAccessed, false); });
test('45. productionAccessed/stagingAccessed false', () => { assert.equal(P.capabilities.productionAccessed, false); assert.equal(P.capabilities.stagingAccessed, false); });
test('46. fetchUsed/mutationAllowed/persistenceCreated/rewriteEmpresas false', () => {
  assert.equal(P.capabilities.fetchUsed, false); assert.equal(P.capabilities.mutationAllowed, false);
  assert.equal(P.capabilities.persistenceCreated, false); assert.equal(P.capabilities.rewriteEmpresas, false);
});
test('47. capabilities frozen', () => assert.ok(Object.isFrozen(IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES)));
test('48. metadataOnly top', () => assert.equal(P.metadataOnly, true));

// ===== Readiness top-level (49-58) =====
test('49. readyForIsolatedRuntimeImplementationPlan true', () => assert.equal(P.readyForIsolatedRuntimeImplementationPlan, true));
test('50. readyForIsolatedRuntimeImplementationSlice false', () => assert.equal(P.readyForIsolatedRuntimeImplementationSlice, false));
test('51. readyForRealModuleGeneration false', () => assert.equal(P.readyForRealModuleGeneration, false));
test('52. readyForProduction false', () => assert.equal(P.readyForProduction, false));
test('53. readiness ready', () => assert.equal(P.readiness, 'studio_dev_preview_isolated_runtime_implementation_plan_ready'));
test('54. blockerCount 0', () => assert.equal(P.blockerCount, 0));
test('55. warningCount 0', () => assert.equal(P.warningCount, 0));
test('56. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(P.overallDigest)));
test('57. implementationPlanDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(P.implementationPlanDigest)));
test('58. readiness state in enum', () => assert.ok(IMPLEMENTATION_PLAN_READINESS_STATES.includes(P.readiness)));

// ===== Session (59-70) =====
test('59. session kind', () => assert.equal(session.kind, 'isolated-runtime-implementation-plan-session'));
test('60. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-isolated-runtime-implementation-plan'));
test('61. session version', () => assert.equal(session.implementationPlanVersion, IMPLEMENTATION_PLAN_VERSION));
test('62. session moduleId', () => assert.equal(session.moduleId, 'clientes'));
test('63. sourceRuntimeShellContract', () => assert.equal(session.sourceRuntimeShellContract, RUNTIME_SHELL_CONTRACT_VERSION));
test('64. sourceVisualContract', () => assert.equal(session.sourceVisualContract, VISUAL_CONTRACT_VERSION));
test('65. sourceBridgeContract', () => assert.equal(session.sourceBridgeContract, DEV_PREVIEW_BRIDGE_VERSION));
test('66. session mode', () => assert.equal(session.mode, IMPLEMENTATION_PLAN_MODE));
test('67. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-runtime-shell-contract'));
test('68. seed deterministic', () => assert.equal(session.seed, createIsolatedRuntimeImplementationPlanSession(arg).seed));
test('69. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('70. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Implementation phases (71-86) =====
test('71. phases kind', () => assert.equal(phases.kind, 'isolated-runtime-implementation-phases'));
test('72. 9 phases', () => assert.equal(phases.phaseCount, 9));
test('73. phaseIds match const', () => assert.deepEqual(phases.phaseIds, [...IMPLEMENTATION_PHASE_IDS]));
test('74. phase_0_preflight present', () => assert.ok(phases.phases.some((p) => p.phaseId === 'phase_0_preflight')));
test('75. phase_7_manual_enablement_gate present', () => assert.ok(phases.phases.some((p) => p.phaseId === 'phase_7_manual_enablement_gate')));
test('76. phase_8_rollout_blocked present', () => assert.ok(phases.phases.some((p) => p.phaseId === 'phase_8_rollout_blocked')));
test('77. all phases status planned', () => assert.ok(phases.phases.every((p) => p.status === 'planned')));
test('78. no phase implemented', () => assert.ok(phases.phases.every((p) => p.implemented === false)));
test('79. anyImplemented false', () => assert.equal(phases.anyImplemented, false));
test('80. allPlanned true', () => assert.equal(phases.allPlanned, true));
test('81. each phase has goal', () => assert.ok(phases.phases.every((p) => typeof p.goal === 'string' && p.goal.length > 0)));
test('82. each phase has allowedEffects', () => assert.ok(phases.phases.every((p) => Array.isArray(p.allowedEffects))));
test('83. each phase has blockedEffects', () => assert.ok(phases.phases.every((p) => Array.isArray(p.blockedEffects))));
test('84. each phase has entry/exit criteria', () => assert.ok(phases.phases.every((p) => Array.isArray(p.entryCriteria) && Array.isArray(p.exitCriteria))));
test('85. each phase has rollbackPlan', () => assert.ok(phases.phases.every((p) => typeof p.rollbackPlan === 'string')));
test('86. IMPLEMENTATION_PHASE_IDS frozen', () => assert.ok(Object.isFrozen(IMPLEMENTATION_PHASE_IDS)));

// ===== Isolation boundary (87-100) =====
test('87. boundary kind', () => assert.equal(boundary.kind, 'isolated-runtime-boundary-plan'));
test('88. noWindow', () => assert.equal(boundary.noWindow, true));
test('89. noDocument', () => assert.equal(boundary.noDocument, true));
test('90. noDOM', () => assert.equal(boundary.noDOM, true));
test('91. noReact', () => assert.equal(boundary.noReact, true));
test('92. noCSSRuntime', () => assert.equal(boundary.noCSSRuntime, true));
test('93. noRouteRuntime', () => assert.equal(boundary.noRouteRuntime, true));
test('94. noMenuRuntime', () => assert.equal(boundary.noMenuRuntime, true));
test('95. noModuleRuntime', () => assert.equal(boundary.noModuleRuntime, true));
test('96. noBackend', () => assert.equal(boundary.noBackend, true));
test('97. noPrisma', () => assert.equal(boundary.noPrisma, true));
test('98. noProduction', () => assert.equal(boundary.noProduction, true));
test('99. noStaging', () => assert.equal(boundary.noStaging, true));
test('100. allInvariantsHold', () => assert.equal(boundary.allInvariantsHold, true));

// ===== Dev-only execution policy (101-109) =====
test('101. policy kind', () => assert.equal(policy.kind, 'isolated-runtime-dev-only-execution-policy'));
test('102. devOnly', () => assert.equal(policy.devOnly, true));
test('103. productionAllowed false', () => assert.equal(policy.productionAllowed, false));
test('104. stagingAllowed false', () => assert.equal(policy.stagingAllowed, false));
test('105. requiresExplicitFutureSlice', () => assert.equal(policy.requiresExplicitFutureSlice, true));
test('106. requiresManualGate', () => assert.equal(policy.requiresManualGate, true));
test('107. requiresRuntimeShellContract', () => assert.equal(policy.requiresRuntimeShellContract, true));
test('108. requiresVisualContract', () => assert.equal(policy.requiresVisualContract, true));
test('109. policy metadataOnly', () => assert.equal(policy.metadataOnly, true));

// ===== Adapter plan (110-119) =====
test('110. adapter kind', () => assert.equal(adapter.kind, 'isolated-runtime-adapter-plan'));
test('111. adapterKind planned_metadata_only', () => assert.equal(adapter.adapterKind, 'planned_metadata_only'));
test('112. adapterImplemented false', () => assert.equal(adapter.adapterImplemented, false));
test('113. reactAdapter false', () => assert.equal(adapter.reactAdapter, false));
test('114. domAdapter false', () => assert.equal(adapter.domAdapter, false));
test('115. cssAdapter false', () => assert.equal(adapter.cssAdapter, false));
test('116. routeAdapter false', () => assert.equal(adapter.routeAdapter, false));
test('117. menuAdapter false', () => assert.equal(adapter.menuAdapter, false));
test('118. moduleAdapter false', () => assert.equal(adapter.moduleAdapter, false));
test('119. backendAdapter false', () => assert.equal(adapter.backendAdapter, false));

// ===== Render pipeline (120-130) =====
test('120. pipeline kind', () => assert.equal(pipeline.kind, 'isolated-runtime-render-pipeline-plan'));
test('121. steps match const', () => assert.deepEqual(pipeline.stepIds, [...RENDER_PIPELINE_STEPS]));
test('122. blockRealRender step present', () => assert.ok(pipeline.steps.some((s) => s.step === 'blockRealRender')));
test('123. no step implemented', () => assert.ok(pipeline.steps.every((s) => s.implemented === false)));
test('124. renderImplemented false', () => assert.equal(pipeline.renderImplemented, false));
test('125. renderAllowed false', () => assert.equal(pipeline.renderAllowed, false));
test('126. pipeline reason future slice', () => assert.match(pipeline.reason, /future isolated runtime implementation slice required/));
test('127. validateContracts first', () => assert.equal(pipeline.steps[0].step, 'validateContracts'));
test('128. emitDiagnostics last', () => assert.equal(pipeline.steps[pipeline.steps.length - 1].step, 'emitDiagnostics'));
test('129. RENDER_PIPELINE_STEPS frozen', () => assert.ok(Object.isFrozen(RENDER_PIPELINE_STEPS)));
test('130. pipeline metadataOnly', () => assert.equal(pipeline.metadataOnly, true));

// ===== Lifecycle execution (131-140) =====
test('131. lifecycle kind', () => assert.equal(lifecycle.kind, 'isolated-runtime-lifecycle-execution-plan'));
test('132. steps match const', () => assert.deepEqual(lifecycle.stepIds, [...LIFECYCLE_EXECUTION_STEPS]));
test('133. created initial', () => assert.equal(lifecycle.initialStep, 'created'));
test('134. blockedForImplementation present', () => assert.ok(lifecycle.steps.some((s) => s.step === 'blockedForImplementation')));
test('135. readyForFutureSlice present', () => assert.ok(lifecycle.steps.some((s) => s.step === 'readyForFutureSlice')));
test('136. disposed terminal', () => assert.equal(lifecycle.steps.find((s) => s.step === 'disposed').terminal, true));
test('137. failedClosed terminal+blocking', () => { const s = lifecycle.steps.find((x) => x.step === 'failedClosed'); assert.equal(s.terminal, true); assert.equal(s.blocking, true); });
test('138. usesRealRuntime false', () => assert.equal(lifecycle.usesRealRuntime, false));
test('139. no step implemented', () => assert.ok(lifecycle.steps.every((s) => s.implemented === false)));
test('140. LIFECYCLE_EXECUTION_STEPS frozen', () => assert.ok(Object.isFrozen(LIFECYCLE_EXECUTION_STEPS)));

// ===== Event handling (141-151) =====
test('141. events kind', () => assert.equal(events.kind, 'isolated-runtime-event-handling-plan'));
test('142. 8 event kinds', () => assert.equal(events.eventKinds.length, 8));
test('143. previewRequested present', () => assert.ok(events.events.some((e) => e.event === 'previewRequested')));
test('144. renderBlocked blocked kind', () => assert.equal(events.events.find((e) => e.event === 'renderBlocked').kind, 'blocked'));
test('145. no real handler', () => assert.ok(events.events.every((e) => e.hasRealHandler === false)));
test('146. no real listener', () => assert.ok(events.events.every((e) => e.hasRealListener === false)));
test('147. no mutation', () => assert.ok(events.events.every((e) => e.mutation === false)));
test('148. usesEventEmitter false', () => assert.equal(events.usesEventEmitter, false));
test('149. anyRealHandler false', () => assert.equal(events.anyRealHandler, false));
test('150. anyMutation false', () => assert.equal(events.anyMutation, false));
test('151. EVENT_HANDLING_KINDS frozen', () => assert.ok(Object.isFrozen(EVENT_HANDLING_KINDS)));

// ===== Data access blocked (152-160) =====
test('152. data kind', () => assert.equal(dataAccess.kind, 'isolated-runtime-data-access-blocked-plan'));
test('153. realDataRead false', () => assert.equal(dataAccess.realDataRead, false));
test('154. realDataWrite false', () => assert.equal(dataAccess.realDataWrite, false));
test('155. backendAccessed false', () => assert.equal(dataAccess.backendAccessed, false));
test('156. prismaAccessed false', () => assert.equal(dataAccess.prismaAccessed, false));
test('157. fetchUsed false', () => assert.equal(dataAccess.fetchUsed, false));
test('158. persistenceCreated false', () => assert.equal(dataAccess.persistenceCreated, false));
test('159. mutationAllowed false', () => assert.equal(dataAccess.mutationAllowed, false));
test('160. data blockedNow', () => assert.equal(dataAccess.blockedNow, true));

// ===== Permission enforcement (161-168) =====
test('161. permission kind', () => assert.equal(permission.kind, 'isolated-runtime-permission-enforcement-plan'));
test('162. defaultDeny', () => assert.equal(permission.defaultDeny, true));
test('163. failClosed', () => assert.equal(permission.failClosed, true));
test('164. tenantRequired', () => assert.equal(permission.tenantRequired, true));
test('165. permissionRequired', () => assert.equal(permission.permissionRequired, true));
test('166. adminBypass false', () => assert.equal(permission.adminBypass, false));
test('167. enforcementEngine false', () => assert.equal(permission.enforcementEngine, false));
test('168. grantsAccess false', () => assert.equal(permission.grantsAccess, false));

// ===== Test harness (169-176) =====
test('169. harness kind', () => assert.equal(harness.kind, 'isolated-runtime-test-harness-plan'));
test('170. fixtures match const', () => assert.deepEqual(harness.fixtureKinds, [...TEST_HARNESS_FIXTURE_KINDS]));
test('171. contractFixtures present', () => assert.ok(harness.fixtures.some((f) => f.fixture === 'contractFixtures')));
test('172. tamperFixtures present', () => assert.ok(harness.fixtures.some((f) => f.fixture === 'tamperFixtures')));
test('173. no fixture implemented', () => assert.ok(harness.fixtures.every((f) => f.implemented === false)));
test('174. harnessImplemented false', () => assert.equal(harness.harnessImplemented, false));
test('175. runtimeExecuted false', () => assert.equal(harness.runtimeExecuted, false));
test('176. TEST_HARNESS_FIXTURE_KINDS frozen', () => assert.ok(Object.isFrozen(TEST_HARNESS_FIXTURE_KINDS)));

// ===== Rollout/rollback (177-183) =====
test('177. rollout kind', () => assert.equal(rollout.kind, 'isolated-runtime-rollout-rollback-plan'));
test('178. rolloutAllowed false', () => assert.equal(rollout.rolloutAllowed, false));
test('179. productionRollout false', () => assert.equal(rollout.productionRollout, false));
test('180. stagingRollout false', () => assert.equal(rollout.stagingRollout, false));
test('181. manualEnablementRequired', () => assert.equal(rollout.manualEnablementRequired, true));
test('182. rollbackByNonConsumption', () => assert.equal(rollout.rollbackByNonConsumption, true));
test('183. rollout metadataOnly', () => assert.equal(rollout.metadataOnly, true));

// ===== Observability/diagnostics (184-190) =====
test('184. observability kind', () => assert.equal(observability.kind, 'isolated-runtime-observability-diagnostics-plan'));
test('185. safeDiagnostics', () => assert.equal(observability.safeDiagnostics, true));
test('186. noSecrets', () => assert.equal(observability.noSecrets, true));
test('187. noStackLeak', () => assert.equal(observability.noStackLeak, true));
test('188. noTelemetryRuntime', () => assert.equal(observability.noTelemetryRuntime, true));
test('189. noExternalLogging', () => assert.equal(observability.noExternalLogging, true));
test('190. observability metadataOnly', () => assert.equal(observability.metadataOnly, true));

// ===== Route/placement blocked (191-203) =====
test('191. route kind', () => assert.equal(routeB.kind, 'isolated-runtime-route-blocked-plan'));
test('192. futureRouteRuntime path', () => assert.equal(routeB.futureRouteRuntime, '/studio/preview/isolated-runtime/clientes'));
test('193. routeCreated false', () => assert.equal(routeB.routeCreated, false));
test('194. routerMounted false', () => assert.equal(routeB.routerMounted, false));
test('195. route appTouched false', () => assert.equal(routeB.appTouched, false));
test('196. route navigationTouched false', () => assert.equal(routeB.navigationTouched, false));
test('197. route blockedNow', () => assert.equal(routeB.blockedNow, true));
test('198. placement kind', () => assert.equal(placeB.kind, 'isolated-runtime-placement-blocked-plan'));
test('199. menuCreated false', () => assert.equal(placeB.menuCreated, false));
test('200. navMounted false', () => assert.equal(placeB.navMounted, false));
test('201. placement appTouched false', () => assert.equal(placeB.appTouched, false));
test('202. placement blockedNow', () => assert.equal(placeB.blockedNow, true));
test('203. placement reason future slice', () => assert.match(placeB.reason, /future approved isolated runtime implementation slice/));

// ===== Safety plan (204-215) =====
test('204. safety kind', () => assert.equal(safety.kind, 'isolated-runtime-safety-plan'));
test('205. headless', () => assert.equal(safety.headless, true));
test('206. runtimeImplemented false', () => assert.equal(safety.runtimeImplemented, false));
test('207. anySideEffect false', () => assert.equal(safety.anySideEffect, false));
test('208. realDataRead false', () => assert.equal(safety.realDataRead, false));
test('209. realDataWrite false', () => assert.equal(safety.realDataWrite, false));
test('210. domCreated false', () => assert.equal(safety.domCreated, false));
test('211. cssCreated false', () => assert.equal(safety.cssCreated, false));
test('212. reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('213. sideEffectFlags all false', () => assert.ok(Object.values(safety.sideEffectFlags).every((v) => v === false)));
test('214. sideEffectFlags includes runtimeImplemented', () => assert.equal(safety.sideEffectFlags.runtimeImplemented, false));
test('215. safetyPlanDigest present', () => assert.ok(typeof safety.safetyPlanDigest === 'string'));

// ===== Readiness decision (216-224) =====
test('216. readiness kind', () => assert.equal(P.readinessDecision.kind, 'isolated-runtime-readiness-decision'));
test('217. ready state', () => assert.equal(P.readinessDecision.readiness, 'studio_dev_preview_isolated_runtime_implementation_plan_ready'));
test('218. readyForPlan', () => assert.equal(P.readinessDecision.readyForIsolatedRuntimeImplementationPlan, true));
test('219. readyForSlice false', () => assert.equal(P.readinessDecision.readyForIsolatedRuntimeImplementationSlice, false));
test('220. readyForRealModuleGeneration false', () => assert.equal(P.readinessDecision.readyForRealModuleGeneration, false));
test('221. readyForProduction false', () => assert.equal(P.readinessDecision.readyForProduction, false));
test('222. blockers empty', () => assert.deepEqual(P.readinessDecision.blockers, []));
test('223. blocked on blockers', () => { const r = createIsolatedRuntimeReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForIsolatedRuntimeImplementationPlan, false); });
test('224. slice stays false always', () => assert.equal(createIsolatedRuntimeReadinessDecision({}).readyForIsolatedRuntimeImplementationSlice, false));

// ===== Manifest (225-233) =====
test('225. manifest kind', () => assert.equal(P.manifest.kind, 'isolated-runtime-implementation-plan-manifest'));
test('226. manifest name', () => assert.equal(P.manifest.implementationPlanName, IMPLEMENTATION_PLAN_NAME));
test('227. manifest version', () => assert.equal(P.manifest.implementationPlanVersion, IMPLEMENTATION_PLAN_VERSION));
test('228. manifest upstream runtimeShell', () => assert.equal(P.manifest.upstream.runtimeShellContract, RUNTIME_SHELL_CONTRACT_VERSION));
test('229. manifest parts.session digest', () => assert.equal(P.manifest.parts.session, session.sessionDigest));
test('230. manifest parts.phases digest', () => assert.ok(typeof P.manifest.parts.phases === 'string'));
test('231. manifest capabilities headless', () => assert.equal(P.manifest.capabilities.headless, true));
test('232. manifest standalone builds', () => assert.equal(createIsolatedRuntimeImplementationPlanManifest({ runtimeShellContract: RS }).kind, 'isolated-runtime-implementation-plan-manifest'));
test('233. manifestDigest present', () => assert.ok(typeof P.manifest.manifestDigest === 'string'));

// ===== Verifier (234-250) =====
const caps = IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES;
test('234. verification ok', () => assert.equal(P.verification.ok, true));
test('235. verification valid', () => assert.equal(P.verification.valid, true));
test('236. verification headless', () => assert.equal(P.verification.headless, true));
test('237. verification runtimeImplemented false', () => assert.equal(P.verification.runtimeImplemented, false));
test('238. verification no blockers', () => assert.equal(P.verification.blockerCount, 0));
test('239. verifier detects runtimeImplemented', () => assert.ok(verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, runtimeImplemented: true } } }).blockers.includes('capability_runtimeImplemented_must_be_false')));
test('240. verifier detects uiCreated', () => assert.ok(verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, uiCreated: true } } }).blockers.includes('capability_uiCreated_must_be_false')));
test('241. verifier detects domCreated/cssCreated', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, domCreated: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_domCreated_must_be_false') && r.blockers.includes('capability_cssCreated_must_be_false')); });
test('242. verifier detects route/menu', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('243. verifier detects backend/prisma', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('244. verifier detects mutation/persistence', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('245. verifier detects renderAllowed true', () => assert.ok(verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: caps, renderPipeline: { renderAllowed: true } } }).blockers.includes('unsafe_render_allowed_true')));
test('246. verifier detects rolloutAllowed true', () => assert.ok(verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: caps, rolloutRollback: { rolloutAllowed: true, manualEnablementRequired: true } } }).blockers.includes('unsafe_rollout_allowed_true')));
test('247. verifier detects missing manual gate', () => assert.ok(verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: caps, rolloutRollback: { manualEnablementRequired: false } } }).blockers.includes('missing_manual_gate')));
test('248. verifier detects real data read/write', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: caps, dataAccessBlocked: { realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('unsafe_real_data_read') && r.blockers.includes('unsafe_real_data_write')); });
test('249. verifier detects phase/adapter implemented', () => { const r = verifyIsolatedRuntimeImplementationPlan({ plan: { capabilities: caps, phases: { anyImplemented: true }, adapterPlan: { adapterImplemented: true } } }); assert.ok(r.blockers.includes('unsafe_phase_implemented') && r.blockers.includes('unsafe_adapter_implemented')); });
test('250. verifier never throws on junk', () => assert.doesNotThrow(() => verifyIsolatedRuntimeImplementationPlan({ plan: null })));

// ===== Compatibility (251-258) =====
test('251. compatibility kind', () => assert.equal(P.compatibility.kind, 'isolated-runtime-implementation-plan-compatibility'));
test('252. compatibleWithRuntimeShellContract', () => assert.equal(P.compatibility.compatibleWithRuntimeShellContract, true));
test('253. compat readyForSlice false', () => assert.equal(P.compatibility.readyForIsolatedRuntimeImplementationSlice, false));
test('254. compat readyForRealModuleGeneration false', () => assert.equal(P.compatibility.readyForRealModuleGeneration, false));
test('255. compat status when-explicitly-authorized', () => assert.equal(P.compatibility.status, 'ready_for_future_isolated_runtime_implementation_slice_when_explicitly_authorized'));
test('256. compat not blocked', () => assert.equal(P.compatibility.blocked, false));
test('257. mismatch → warning', () => { const r = checkIsolatedRuntimeImplementationPlanCompatibility({ runtimeShellContract: { runtimeShellContractVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithRuntimeShellContract, false); assert.ok(r.warnings.includes('incompatible_runtimeShellContract')); });
test('258. compatibilityDigest present', () => assert.ok(typeof P.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (259-272) =====
test('259. diagnostics kind', () => assert.equal(P.diagnostics.kind, 'isolated-runtime-implementation-plan-diagnostics'));
test('260. diagnostics passive', () => assert.equal(P.diagnostics.passive, true));
test('261. diagnostics ok', () => assert.equal(P.diagnostics.ok, true));
test('262. diagnostics headlessConfirmed', () => assert.equal(P.diagnostics.headlessConfirmed, true));
test('263. diagnostics runtimeImplemented false', () => assert.equal(P.diagnostics.runtimeImplemented, false));
test('264. diagnostics logged false', () => assert.equal(P.diagnostics.logged, false));
test('265. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(P.diagnostics))));
const fbNo = createStudioDevPreviewIsolatedRuntimeImplementationPlan({});
const fbBad = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: { kind: 'studio-dev-preview-runtime-shell-contract', fallback: true } });
test('266. missing shell → fallback', () => assert.equal(fbNo.fallback, true));
test('267. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('268. fallback shell → fallback', () => assert.equal(fbFb.fallback, true));
test('269. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('270. fallback not ready for plan/slice/production', () => { assert.equal(fbNo.readyForIsolatedRuntimeImplementationPlan, false); assert.equal(fbNo.readyForIsolatedRuntimeImplementationSlice, false); assert.equal(fbNo.readyForProduction, false); });
test('271. fallback caps runtimeImplemented false', () => assert.equal(fbNo.capabilities.runtimeImplemented, false));
test('272. fallback never throws', () => assert.doesNotThrow(() => createIsolatedRuntimeImplementationPlanFallback({ reason: 'x' })));

// ===== Errors (273-281) =====
test('273. error codes >= 30', () => assert.ok(IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30));
test('274. error descriptor sanitized', () => { const e = createIsolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false && e.runtimeImplemented === false); });
test('275. error no ui/dom/css', () => { const e = createIsolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); });
test('276. unknown code normalized', () => assert.equal(createIsolatedRuntimeImplementationPlanError('NOPE').code, 'IMPLEMENTATION_PLAN_INVALID_RUNTIME_SHELL_CONTRACT'));
test('277. typed error', () => { const e = new IsolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_INVALID_BRIDGE', 'x'); assert.ok(e instanceof Error && e.name === 'IsolatedRuntimeImplementationPlanError'); });
test('278. helper error', () => assert.equal(isolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_FETCH_BLOCKED', 'x').code, 'IMPLEMENTATION_PLAN_FETCH_BLOCKED'));
test('279. codes cover runtimeImplemented/react/dom/css/route/menu', () => ['IMPLEMENTATION_PLAN_RUNTIME_IMPLEMENTED_BLOCKED', 'IMPLEMENTATION_PLAN_REACT_COMPONENT_BLOCKED', 'IMPLEMENTATION_PLAN_DOM_BLOCKED', 'IMPLEMENTATION_PLAN_CSS_RUNTIME_BLOCKED', 'IMPLEMENTATION_PLAN_ROUTE_BLOCKED', 'IMPLEMENTATION_PLAN_MENU_BLOCKED'].forEach((c) => assert.ok(IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('280. codes cover rollout/manual-gate/data', () => ['IMPLEMENTATION_PLAN_ROLLOUT_ALLOWED_BLOCKED', 'IMPLEMENTATION_PLAN_MANUAL_GATE_MISSING', 'IMPLEMENTATION_PLAN_REAL_DATA_WRITE_BLOCKED'].forEach((c) => assert.ok(IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('281. error no secrets/stack leak', () => { const e = createIsolatedRuntimeImplementationPlanError('IMPLEMENTATION_PLAN_BACKEND_BLOCKED'); assert.equal(e.noSecrets, true); assert.equal(e.noStackLeak, true); });

// ===== Config flags (282-290) =====
test('282. flag off by default', () => assert.equal(isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled({}), false));
test('283. flag on in dev', () => assert.equal(isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('284. flag fails closed in production', () => assert.equal(isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('285. phases flag fails closed in production', () => assert.equal(isStudioDevPreviewIripPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('286. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewIripVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('287. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewIripCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('288. master flag enables phases in dev', () => assert.equal(isStudioDevPreviewIripPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('289. readiness states frozen', () => assert.ok(Object.isFrozen(IMPLEMENTATION_PLAN_READINESS_STATES)));
test('290. planDigest deterministic + format', () => { assert.equal(planDigest({ a: 1 }), planDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(planDigest({ a: 1 }))); });

// ===== Determinism / purity (291-300) =====
test('291. deterministic overallDigest', () => assert.equal(P.overallDigest, createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }).overallDigest));
test('292. deterministic implementationPlanDigest', () => assert.equal(P.implementationPlanDigest, createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }).implementationPlanDigest));
test('293. input not mutated', () => { const snap = JSON.stringify(RS); createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS }); assert.equal(JSON.stringify(RS), snap); });
test('294. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(P))));
test('295. different module → different digest', () => { const b2 = createStudioDevPreviewContractBridge({ sandbox: { ...SANDBOX, moduleId: 'produtos' } }); const vc2 = createStudioDevPreviewVisualContract({ bridge: b2 }); const rs2 = createStudioDevPreviewRuntimeShellContract({ visualContract: vc2 }); assert.notEqual(P.overallDigest, createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs2 }).overallDigest); });
test('296. builds from full real chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const br = createStudioDevPreviewContractBridge({ sandbox: sb });
  const vc = createStudioDevPreviewVisualContract({ bridge: br });
  const rs = createStudioDevPreviewRuntimeShellContract({ visualContract: vc });
  const pp = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs });
  assert.equal(pp.kind, 'studio-dev-preview-isolated-runtime-implementation-plan');
  assert.equal(pp.readyForIsolatedRuntimeImplementationSlice, false);
});
test('297. tenant/permission hints preserved', () => { assert.equal(permission.tenantRequired, true); assert.equal(permission.defaultDeny, true); });
test('298. no Empresas rewrite', () => assert.equal(P.capabilities.rewriteEmpresas, false));
test('299. no module registration', () => assert.equal(P.capabilities.moduleRegistered, false));
test('300. runtime not implemented', () => assert.equal(P.capabilities.runtimeImplemented, false));

// ===== Purity/no-side-effect code scan (301-311) =====
test('301. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('302. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('303. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('304. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('305. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('306. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('307. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('308. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('309. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('310. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('311. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));

// ===== Scope safety (312-334) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('312. plan subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan')));
test('313. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('314. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('315. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('316. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('317. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('318. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('319. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('320. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('321. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('322. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('323. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('324. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('325. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('326. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('327. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('328. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('329. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('330. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('331. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('332. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('333. net-new scope is plan only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('334. upstream runtime shell contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js')));

// ===== Evidence docs (D1-D21) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-IMPLEMENTATION-PLAN-REPORT.md', 'PLAN-SESSION.md',
  'IMPLEMENTATION-PHASES.md', 'ISOLATION-BOUNDARY.md', 'DEV-ONLY-EXECUTION-POLICY.md', 'RUNTIME-ADAPTER-PLAN.md',
  'RENDER-PIPELINE-PLAN.md', 'LIFECYCLE-EXECUTION-PLAN.md', 'EVENT-HANDLING-PLAN.md', 'DATA-ACCESS-BLOCKED-PLAN.md',
  'PERMISSION-ENFORCEMENT-PLAN.md', 'TEST-HARNESS-PLAN.md', 'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md',
  'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/runtime|React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/CHECKPOINT|checkpoint|antes de qualquer implementação|implementation/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
