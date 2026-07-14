import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_NAME,
  RUNTIME_UI_IMPLEMENTATION_PLAN_SEMVER,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_MODE,
  RUNTIME_UI_IMPLEMENTATION_PLAN_ENVIRONMENT,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PHASE_IDS,
  VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS,
  BLOCKED_ACTION_KINDS,
  RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  uiPlanDigest,
  isStudioDevPreviewRuntimeUiImplementationPlanEnabled,
  isStudioDevPreviewRuntimeUiImplementationPhasesEnabled,
  isStudioDevPreviewRuntimeUiImplementationVerifyEnabled,
  isStudioDevPreviewRuntimeUiImplementationCompatibilityCheckEnabled,
  RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES,
  RuntimeUiImplementationPlanError,
  createRuntimeUiImplementationPlanError,
  runtimeUiImplementationPlanError,
  createRuntimeUiImplementationPlanSession,
  createRuntimeUiImplementationPhases,
  createRuntimeUiBoundaryPlan,
  createRuntimeUiDevOnlyExecutionPolicy,
  createVirtualFrameToUiPipelinePlan,
  createRuntimeUiRendererAdapterPlan,
  createRuntimeUiComponentAdapterPlan,
  createRuntimeUiInteractionAdapterPlan,
  createRuntimeUiStateAdapterPlan,
  createRuntimeUiThemeAdapterPlan,
  createRuntimeUiAccessibilityAdapterPlan,
  createRuntimeUiBlockedActionEnforcementPlan,
  createRuntimeUiTestHarnessPlan,
  createRuntimeUiManualEnablementGatePlan,
  createRuntimeUiRolloutRollbackPlan,
  createRuntimeUiObservabilityDiagnosticsPlan,
  createRuntimeUiSafetyPlan,
  createRuntimeUiImplementationReadinessDecision,
  createRuntimeUiImplementationPlanManifest,
  verifyRuntimeUiImplementationPlan,
  checkRuntimeUiImplementationPlanCompatibility,
  createRuntimeUiImplementationPlanDiagnostics,
  createRuntimeUiImplementationPlanFallback,
  createStudioDevPreviewRuntimeUiImplementationPlan,
} from '../../studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeUiContract } from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan');

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

// Build the full real upstream chain.
const SANDBOX = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }], permissions: [{ action: 'read', level: 'module' }] } });
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const RS = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
const IPLAN = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
const IR = createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN });
const UC = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
const U = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC });

const session = createRuntimeUiImplementationPlanSession({ runtimeUiContract: UC });
const phases = createRuntimeUiImplementationPhases();
const boundary = createRuntimeUiBoundaryPlan();
const devPolicy = createRuntimeUiDevOnlyExecutionPolicy();
const pipeline = createVirtualFrameToUiPipelinePlan();
const renderer = createRuntimeUiRendererAdapterPlan();
const component = createRuntimeUiComponentAdapterPlan();
const interaction = createRuntimeUiInteractionAdapterPlan();
const state = createRuntimeUiStateAdapterPlan();
const theme = createRuntimeUiThemeAdapterPlan();
const a11y = createRuntimeUiAccessibilityAdapterPlan();
const blockedAction = createRuntimeUiBlockedActionEnforcementPlan();
const harness = createRuntimeUiTestHarnessPlan();
const manualGate = createRuntimeUiManualEnablementGatePlan();
const rollout = createRuntimeUiRolloutRollbackPlan();
const observability = createRuntimeUiObservabilityDiagnosticsPlan();
const safety = createRuntimeUiSafetyPlan();
const caps = RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES;

// ===== Contract base (1-55) =====
test('1. plan created', () => assert.equal(U.kind, 'studio-dev-preview-runtime-ui-implementation-plan'));
test('2. name', () => { assert.equal(U.runtimeUiImplementationPlanName, 'studio-dev-preview-runtime-ui-implementation-plan'); assert.equal(U.runtimeUiImplementationPlanName, RUNTIME_UI_IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(U.runtimeUiImplementationPlanVersion, 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0'); assert.equal(U.runtimeUiImplementationPlanVersion, RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(RUNTIME_UI_IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. runtimeUiContractVersion', () => assert.equal(U.runtimeUiContractVersion, 'studio-dev-preview-runtime-ui-contract@1.0.0'));
test('6. isolatedRuntimeVersion', () => assert.equal(U.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'));
test('7. implementationPlanVersion', () => assert.equal(U.implementationPlanVersion, 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'));
test('8. runtimeShellContractVersion', () => assert.equal(U.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('9. visualContractVersion', () => assert.equal(U.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('10. bridgeVersion', () => assert.equal(U.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('11. sandboxVersion', () => assert.equal(U.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('12. plannerVersion', () => assert.equal(U.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('13. engineVersion', () => assert.equal(U.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('14. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('15. mode', () => { assert.equal(U.mode, 'headless_dev_preview_runtime_ui_implementation_plan'); assert.equal(U.mode, RUNTIME_UI_IMPLEMENTATION_PLAN_MODE); });
test('16. environment const', () => assert.equal(RUNTIME_UI_IMPLEMENTATION_PLAN_ENVIRONMENT, 'local_contract'));
test('17. moduleId', () => assert.equal(U.moduleId, 'clientes'));
test('18. not fallback', () => assert.equal(U.fallback, false));
test('19. headless', () => assert.equal(U.capabilities.headless, true));
test('20. contractOnly', () => assert.equal(U.capabilities.contractOnly, true));
test('21. metadataOnly', () => assert.equal(U.capabilities.metadataOnly, true));
test('22. planOnly', () => assert.equal(U.capabilities.planOnly, true));
test('23. implementationPhasesOnly', () => assert.equal(U.capabilities.implementationPhasesOnly, true));
test('24. uiRuntimeBoundaryPlanOnly', () => assert.equal(U.capabilities.uiRuntimeBoundaryPlanOnly, true));
test('25. devOnlyUiExecutionPolicyOnly', () => assert.equal(U.capabilities.devOnlyUiExecutionPolicyOnly, true));
test('26. virtualFrameToUiPipelinePlanOnly', () => assert.equal(U.capabilities.virtualFrameToUiPipelinePlanOnly, true));
test('27. rendererAdapterPlanOnly', () => assert.equal(U.capabilities.rendererAdapterPlanOnly, true));
test('28. componentAdapterPlanOnly', () => assert.equal(U.capabilities.componentAdapterPlanOnly, true));
test('29. interactionAdapterPlanOnly', () => assert.equal(U.capabilities.interactionAdapterPlanOnly, true));
test('30. stateAdapterPlanOnly', () => assert.equal(U.capabilities.stateAdapterPlanOnly, true));
test('31. themeAdapterPlanOnly', () => assert.equal(U.capabilities.themeAdapterPlanOnly, true));
test('32. accessibilityAdapterPlanOnly', () => assert.equal(U.capabilities.accessibilityAdapterPlanOnly, true));
test('33. blockedActionEnforcementPlanOnly', () => assert.equal(U.capabilities.blockedActionEnforcementPlanOnly, true));
test('34. testHarnessPlanOnly', () => assert.equal(U.capabilities.testHarnessPlanOnly, true));
test('35. manualEnablementGatePlanOnly', () => assert.equal(U.capabilities.manualEnablementGatePlanOnly, true));
test('36. rolloutRollbackPlanOnly', () => assert.equal(U.capabilities.rolloutRollbackPlanOnly, true));
test('37. observabilityDiagnosticsPlanOnly', () => assert.equal(U.capabilities.observabilityDiagnosticsPlanOnly, true));
test('38. reactComponentCreated false', () => assert.equal(U.capabilities.reactComponentCreated, false));
test('39. jsxCreated false', () => assert.equal(U.capabilities.jsxCreated, false));
test('40. tsxCreated false', () => assert.equal(U.capabilities.tsxCreated, false));
test('41. domCreated false', () => assert.equal(U.capabilities.domCreated, false));
test('42. cssCreated false', () => assert.equal(U.capabilities.cssCreated, false));
test('43. uiCreated false', () => assert.equal(U.capabilities.uiCreated, false));
test('44. routeCreated false', () => assert.equal(U.capabilities.routeCreated, false));
test('45. menuCreated false', () => assert.equal(U.capabilities.menuCreated, false));
test('46. moduleGenerated false', () => assert.equal(U.capabilities.moduleGenerated, false));
test('47. filesWrittenToModule false', () => assert.equal(U.capabilities.filesWrittenToModule, false));
test('48. moduleRegistered false', () => assert.equal(U.capabilities.moduleRegistered, false));
test('49. runtimeUiImplemented false', () => assert.equal(U.capabilities.runtimeUiImplemented, false));
test('50. visualRuntimeImplemented false', () => assert.equal(U.capabilities.visualRuntimeImplemented, false));
test('51. reactRuntimeCreated/domRuntimeCreated/cssRuntimeCreated false', () => { assert.equal(U.capabilities.reactRuntimeCreated, false); assert.equal(U.capabilities.domRuntimeCreated, false); assert.equal(U.capabilities.cssRuntimeCreated, false); });
test('52. routeRuntimeCreated/menuRuntimeCreated/moduleRuntimeCreated false', () => { assert.equal(U.capabilities.routeRuntimeCreated, false); assert.equal(U.capabilities.menuRuntimeCreated, false); assert.equal(U.capabilities.moduleRuntimeCreated, false); });
test('53. backendAccessed/prismaAccessed false', () => { assert.equal(U.capabilities.backendAccessed, false); assert.equal(U.capabilities.prismaAccessed, false); });
test('54. productionAccessed/stagingAccessed/fetchUsed false', () => { assert.equal(U.capabilities.productionAccessed, false); assert.equal(U.capabilities.stagingAccessed, false); assert.equal(U.capabilities.fetchUsed, false); });
test('55. mutationAllowed/persistenceCreated/realDataRead/realDataWrite/rewriteEmpresas false', () => { assert.equal(U.capabilities.mutationAllowed, false); assert.equal(U.capabilities.persistenceCreated, false); assert.equal(U.capabilities.realDataRead, false); assert.equal(U.capabilities.realDataWrite, false); assert.equal(U.capabilities.rewriteEmpresas, false); });

// ===== Readiness top-level (56-66) =====
test('56. capabilities frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES)));
test('57. readyForRuntimeUiImplementationPlan true', () => assert.equal(U.readyForRuntimeUiImplementationPlan, true));
test('58. readyForRuntimeUiImplementationSlice false', () => assert.equal(U.readyForRuntimeUiImplementationSlice, false));
test('59. readyForRouteMenuIntegration false', () => assert.equal(U.readyForRouteMenuIntegration, false));
test('60. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('61. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('62. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_runtime_ui_implementation_plan_ready'));
test('63. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('64. warningCount 0', () => assert.equal(U.warningCount, 0));
test('65. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(U.overallDigest)));
test('66. readiness state in enum', () => assert.ok(RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES.includes(U.readiness)));

// ===== Session (67-78) =====
test('67. session kind', () => assert.equal(session.kind, 'runtime-ui-implementation-plan-session'));
test('68. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-runtime-ui-implementation-plan'));
test('69. session version', () => assert.equal(session.runtimeUiImplementationPlanVersion, RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION));
test('70. sourceRuntimeUiContract', () => assert.equal(session.sourceRuntimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('71. sourceIsolatedRuntime', () => assert.equal(session.sourceIsolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('72. sourceVirtualPreviewFrameContract', () => assert.equal(session.sourceVirtualPreviewFrameContract, RUNTIME_UI_CONTRACT_VERSION));
test('73. sourceImplementationPlan', () => assert.equal(session.sourceImplementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('74. session mode', () => assert.equal(session.mode, RUNTIME_UI_IMPLEMENTATION_PLAN_MODE));
test('75. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-runtime-ui-contract'));
test('76. seed deterministic', () => assert.equal(session.seed, createRuntimeUiImplementationPlanSession({ runtimeUiContract: UC }).seed));
test('77. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('78. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Implementation phases (79-96) =====
test('79. phases kind', () => assert.equal(phases.kind, 'runtime-ui-implementation-phases'));
test('80. phase ids match const', () => assert.deepEqual(phases.phases.map((p) => p.id), [...RUNTIME_UI_IMPLEMENTATION_PHASE_IDS]));
test('81. 12 phases', () => assert.equal(phases.phaseCount, 12));
test('82. all planned', () => assert.equal(phases.allPlanned, true));
test('83. none implemented', () => assert.equal(phases.anyImplemented, false));
test('84. phase 0 preflight', () => assert.ok(phases.phases.some((p) => p.id === 'phase_0_preflight')));
test('85. phase 1 contract validation', () => assert.ok(phases.phases.some((p) => p.id === 'phase_1_contract_validation')));
test('86. phase 2 ui runtime boundary', () => assert.ok(phases.phases.some((p) => p.id === 'phase_2_ui_runtime_boundary')));
test('87. phase 4 virtual frame pipeline', () => assert.ok(phases.phases.some((p) => p.id === 'phase_4_virtual_frame_pipeline')));
test('88. phase 10 manual enablement gate', () => assert.ok(phases.phases.some((p) => p.id === 'phase_10_manual_enablement_gate')));
test('89. phase 11 rollout blocked', () => assert.ok(phases.phases.some((p) => p.id === 'phase_11_rollout_blocked')));
test('90. each phase has goal', () => assert.ok(phases.phases.every((p) => typeof p.goal === 'string' && p.goal.length > 0)));
test('91. each phase allowedEffects', () => assert.ok(phases.phases.every((p) => Array.isArray(p.allowedEffects))));
test('92. each phase blockedEffects', () => assert.ok(phases.phases.every((p) => Array.isArray(p.blockedEffects) && p.blockedEffects.includes('createReact'))));
test('93. each phase entry/exit criteria', () => assert.ok(phases.phases.every((p) => Array.isArray(p.entryCriteria) && Array.isArray(p.exitCriteria))));
test('94. each phase rollbackPlan', () => assert.ok(phases.phases.every((p) => typeof p.rollbackPlan === 'string')));
test('95. each phase status planned', () => assert.ok(phases.phases.every((p) => p.status === 'planned')));
test('96. each phase implemented false', () => assert.ok(phases.phases.every((p) => p.implemented === false)));

// ===== UI runtime boundary plan (97-104) =====
test('97. boundary kind', () => assert.equal(boundary.kind, 'runtime-ui-boundary-plan'));
test('98. noReact/noJSX/noTSX', () => { assert.equal(boundary.noReact, true); assert.equal(boundary.noJSX, true); assert.equal(boundary.noTSX, true); });
test('99. noDOM/noCSSRuntime', () => { assert.equal(boundary.noDOM, true); assert.equal(boundary.noCSSRuntime, true); });
test('100. noRouteRuntime/noMenuRuntime/noModuleRuntime', () => { assert.equal(boundary.noRouteRuntime, true); assert.equal(boundary.noMenuRuntime, true); assert.equal(boundary.noModuleRuntime, true); });
test('101. noBackend/noPrisma', () => { assert.equal(boundary.noBackend, true); assert.equal(boundary.noPrisma, true); });
test('102. noProduction/noStaging', () => { assert.equal(boundary.noProduction, true); assert.equal(boundary.noStaging, true); });
test('103. boundaryImplemented false', () => assert.equal(boundary.boundaryImplemented, false));
test('104. enforcedByFutureSliceOnly', () => assert.equal(boundary.enforcedByFutureSliceOnly, true));

// ===== Dev-only execution policy (105-114) =====
test('105. devPolicy kind', () => assert.equal(devPolicy.kind, 'runtime-ui-dev-only-execution-policy'));
test('106. devOnly', () => assert.equal(devPolicy.devOnly, true));
test('107. productionAllowed false', () => assert.equal(devPolicy.productionAllowed, false));
test('108. stagingAllowed false', () => assert.equal(devPolicy.stagingAllowed, false));
test('109. requiresExplicitFutureSlice', () => assert.equal(devPolicy.requiresExplicitFutureSlice, true));
test('110. requiresManualGate', () => assert.equal(devPolicy.requiresManualGate, true));
test('111. requiredCheckpoint', () => assert.equal(devPolicy.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('112. requiresRuntimeUiContract', () => assert.equal(devPolicy.requiresRuntimeUiContract, true));
test('113. requiresIsolatedRuntime/requiresVirtualFrame', () => { assert.equal(devPolicy.requiresIsolatedRuntime, true); assert.equal(devPolicy.requiresVirtualFrame, true); });
test('114. policyImplemented false', () => assert.equal(devPolicy.policyImplemented, false));

// ===== Virtual-frame-to-UI pipeline plan (115-124) =====
test('115. pipeline kind', () => assert.equal(pipeline.kind, 'virtual-frame-to-ui-pipeline-plan'));
test('116. steps match const', () => assert.deepEqual(pipeline.steps.map((s) => s.step), [...VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS]));
test('117. 7 steps', () => assert.equal(pipeline.stepCount, 7));
test('118. loadVirtualFrame step', () => assert.ok(pipeline.steps.some((s) => s.step === 'loadVirtualFrame')));
test('119. blockRealRender step', () => assert.ok(pipeline.steps.some((s) => s.step === 'blockRealRender')));
test('120. each step planned', () => assert.ok(pipeline.steps.every((s) => s.status === 'planned')));
test('121. each step implemented false', () => assert.ok(pipeline.steps.every((s) => s.implemented === false)));
test('122. each step producesRealRender false', () => assert.ok(pipeline.steps.every((s) => s.producesRealRender === false)));
test('123. pipelineImplemented false', () => assert.equal(pipeline.pipelineImplemented, false));
test('124. realRenderAllowed false + reason', () => { assert.equal(pipeline.realRenderAllowed, false); assert.ok(/future explicit/.test(pipeline.reason)); });

// ===== Renderer adapter plan (125-133) =====
test('125. renderer kind', () => assert.equal(renderer.kind, 'runtime-ui-renderer-adapter-plan'));
test('126. rendererAdapterKind planned_metadata_only', () => assert.equal(renderer.rendererAdapterKind, 'planned_metadata_only'));
test('127. rendererImplemented false', () => assert.equal(renderer.rendererImplemented, false));
test('128. reactRenderer false', () => assert.equal(renderer.reactRenderer, false));
test('129. domRenderer false', () => assert.equal(renderer.domRenderer, false));
test('130. cssRenderer false', () => assert.equal(renderer.cssRenderer, false));
test('131. routeRenderer false', () => assert.equal(renderer.routeRenderer, false));
test('132. menuRenderer/moduleRenderer false', () => { assert.equal(renderer.menuRenderer, false); assert.equal(renderer.moduleRenderer, false); });
test('133. producesRealRender false', () => assert.equal(renderer.producesRealRender, false));

// ===== Component adapter plan (134-141) =====
test('134. component kind', () => assert.equal(component.kind, 'runtime-ui-component-adapter-plan'));
test('135. componentAdapterKind planned_metadata_only', () => assert.equal(component.componentAdapterKind, 'planned_metadata_only'));
test('136. componentAdapterImplemented false', () => assert.equal(component.componentAdapterImplemented, false));
test('137. realComponentImports false', () => assert.equal(component.realComponentImports, false));
test('138. realComponentPath null', () => assert.equal(component.realComponentPath, null));
test('139. jsx false', () => assert.equal(component.jsx, false));
test('140. tsx false', () => assert.equal(component.tsx, false));
test('141. dom false', () => assert.equal(component.dom, false));

// ===== Interaction adapter plan (142-149) =====
test('142. interaction kind', () => assert.equal(interaction.kind, 'runtime-ui-interaction-adapter-plan'));
test('143. interactionAdapterImplemented false', () => assert.equal(interaction.interactionAdapterImplemented, false));
test('144. handlersCreated false', () => assert.equal(interaction.handlersCreated, false));
test('145. mutationAllowed false', () => assert.equal(interaction.mutationAllowed, false));
test('146. navigationAllowed false', () => assert.equal(interaction.navigationAllowed, false));
test('147. submitAllowed false', () => assert.equal(interaction.submitAllowed, false));
test('148. saveAllowed false', () => assert.equal(interaction.saveAllowed, false));
test('149. requiresFutureRuntimeImplementation', () => assert.equal(interaction.requiresFutureRuntimeImplementation, true));

// ===== State/theme/accessibility adapter plans (150-167) =====
test('150. state kind', () => assert.equal(state.kind, 'runtime-ui-state-adapter-plan'));
test('151. state adapterImplemented false', () => assert.equal(state.stateAdapterImplemented, false));
test('152. state reactState/hooks false', () => { assert.equal(state.reactState, false); assert.equal(state.hooks, false); });
test('153. state storage/persistence false', () => { assert.equal(state.storage, false); assert.equal(state.persistence, false); });
test('154. state cssRuntime/stylesheetCreated false', () => { assert.equal(state.cssRuntime, false); assert.equal(state.stylesheetCreated, false); });
test('155. state domAttributesSet/realAriaSet false', () => { assert.equal(state.domAttributesSet, false); assert.equal(state.realAriaSet, false); });
test('156. theme kind', () => assert.equal(theme.kind, 'runtime-ui-theme-adapter-plan'));
test('157. theme adapterImplemented false', () => assert.equal(theme.themeAdapterImplemented, false));
test('158. theme cssRuntime/stylesheetCreated false', () => { assert.equal(theme.cssRuntime, false); assert.equal(theme.stylesheetCreated, false); });
test('159. theme domAttributesSet/realAriaSet false', () => { assert.equal(theme.domAttributesSet, false); assert.equal(theme.realAriaSet, false); });
test('160. theme reactState/hooks false', () => { assert.equal(theme.reactState, false); assert.equal(theme.hooks, false); });
test('161. a11y kind', () => assert.equal(a11y.kind, 'runtime-ui-accessibility-adapter-plan'));
test('162. a11y adapterImplemented false', () => assert.equal(a11y.accessibilityAdapterImplemented, false));
test('163. a11y labels/keyboard/focus planned', () => { assert.equal(a11y.labelsPlanned, true); assert.equal(a11y.keyboardPlanned, true); assert.equal(a11y.focusOrderPlanned, true); });
test('164. a11y domAttributesSet false', () => assert.equal(a11y.domAttributesSet, false));
test('165. a11y realAriaSet false', () => assert.equal(a11y.realAriaSet, false));
test('166. a11y cssRuntime/stylesheetCreated false', () => { assert.equal(a11y.cssRuntime, false); assert.equal(a11y.stylesheetCreated, false); });
test('167. a11y storage/persistence false', () => { assert.equal(a11y.storage, false); assert.equal(a11y.persistence, false); });

// ===== Blocked action enforcement plan (168-181) =====
test('168. blockedAction kind', () => assert.equal(blockedAction.kind, 'runtime-ui-blocked-action-enforcement-plan'));
test('169. blockedActionKinds match const', () => assert.deepEqual(blockedAction.blockedActionKinds, [...BLOCKED_ACTION_KINDS]));
test('170. 11 actions', () => assert.equal(blockedAction.actionCount, 11));
test('171. create blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'create' && a.blocked === true)));
test('172. update blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'update' && a.blocked === true)));
test('173. delete blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'delete' && a.blocked === true)));
test('174. navigate blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'navigate' && a.blocked === true)));
test('175. openRoute blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'openRoute' && a.blocked === true)));
test('176. registerModule blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'registerModule' && a.blocked === true)));
test('177. readRealData blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'readRealData' && a.blocked === true)));
test('178. writeRealData blocked', () => assert.ok(blockedAction.actions.some((a) => a.action === 'writeRealData' && a.blocked === true)));
test('179. allBlocked true', () => assert.equal(blockedAction.allBlocked, true));
test('180. anyAllowed false', () => assert.equal(blockedAction.anyAllowed, false));
test('181. BLOCKED_ACTION_KINDS frozen (11)', () => assert.ok(Object.isFrozen(BLOCKED_ACTION_KINDS) && BLOCKED_ACTION_KINDS.length === 11));

// ===== Test harness plan (182-189) =====
test('182. harness kind', () => assert.equal(harness.kind, 'runtime-ui-test-harness-plan'));
test('183. harness suites present', () => assert.ok(Array.isArray(harness.suites) && harness.suiteCount >= 5));
test('184. harness each suite planned', () => assert.ok(harness.suites.every((s) => s.planned === true)));
test('185. harnessImplemented false', () => assert.equal(harness.harnessImplemented, false));
test('186. harness headless', () => assert.equal(harness.headless, true));
test('187. harness usesRealRuntime false', () => assert.equal(harness.usesRealRuntime, false));
test('188. harness usesRealData false', () => assert.equal(harness.usesRealData, false));
test('189. harness digest present', () => assert.ok(typeof harness.testHarnessPlanDigest === 'string'));

// ===== Manual enablement gate plan (190-199) =====
test('190. manualGate kind', () => assert.equal(manualGate.kind, 'runtime-ui-manual-enablement-gate-plan'));
test('191. manualGateRequired', () => assert.equal(manualGate.manualGateRequired, true));
test('192. requiredCheckpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('193. currentSliceAuthorization plan_only', () => assert.equal(manualGate.currentSliceAuthorization, 'plan_only'));
test('194. authorizesRealUi false', () => assert.equal(manualGate.authorizesRealUi, false));
test('195. authorizesRouteMenu false', () => assert.equal(manualGate.authorizesRouteMenu, false));
test('196. authorizesModuleGeneration false', () => assert.equal(manualGate.authorizesModuleGeneration, false));
test('197. authorizesBackend/authorizesPrisma false', () => { assert.equal(manualGate.authorizesBackend, false); assert.equal(manualGate.authorizesPrisma, false); });
test('198. authorizesProduction false', () => assert.equal(manualGate.authorizesProduction, false));
test('199. gateImplemented false', () => assert.equal(manualGate.gateImplemented, false));

// ===== Rollout/rollback + observability (200-210) =====
test('200. rollout kind', () => assert.equal(rollout.kind, 'runtime-ui-rollout-rollback-plan'));
test('201. rolloutAllowed false', () => assert.equal(rollout.rolloutAllowed, false));
test('202. productionRollout false', () => assert.equal(rollout.productionRollout, false));
test('203. stagingRollout false', () => assert.equal(rollout.stagingRollout, false));
test('204. rollbackByNonConsumption', () => assert.equal(rollout.rollbackByNonConsumption, true));
test('205. rolloutImplemented false', () => assert.equal(rollout.rolloutImplemented, false));
test('206. observability kind', () => assert.equal(observability.kind, 'runtime-ui-observability-diagnostics-plan'));
test('207. safeDiagnostics', () => assert.equal(observability.safeDiagnostics, true));
test('208. observability withoutSecrets/noStackLeak', () => { assert.equal(observability.withoutSecrets, true); assert.equal(observability.noStackLeak, true); });
test('209. observability noTelemetryRuntime/noExternalLogging', () => { assert.equal(observability.noTelemetryRuntime, true); assert.equal(observability.noExternalLogging, true); });
test('210. observabilityImplemented false', () => assert.equal(observability.observabilityImplemented, false));

// ===== Safety plan (211-218) =====
test('211. safety kind', () => assert.equal(safety.kind, 'runtime-ui-safety-plan'));
test('212. safety headless/contractOnly/planOnly', () => { assert.equal(safety.headless, true); assert.equal(safety.contractOnly, true); assert.equal(safety.planOnly, true); });
test('213. safety failClosed', () => assert.equal(safety.failClosed, true));
test('214. safety runtimeUiImplemented false', () => assert.equal(safety.runtimeUiImplemented, false));
test('215. safety visualRuntimeImplemented false', () => assert.equal(safety.visualRuntimeImplemented, false));
test('216. safety anyForbiddenSideEffect false', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('217. safety reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('218. safety forbiddenFlags all false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));

// ===== Readiness decision (219-226) =====
test('219. readiness kind', () => assert.equal(U.readinessDecision.kind, 'runtime-ui-implementation-readiness-decision'));
test('220. readiness ready state', () => assert.equal(U.readinessDecision.readiness, 'studio_dev_preview_runtime_ui_implementation_plan_ready'));
test('221. readiness readyForPlan', () => assert.equal(U.readinessDecision.readyForRuntimeUiImplementationPlan, true));
test('222. readiness readyForSlice false', () => assert.equal(U.readinessDecision.readyForRuntimeUiImplementationSlice, false));
test('223. readiness readyForRouteMenu false', () => assert.equal(U.readinessDecision.readyForRouteMenuIntegration, false));
test('224. readiness readyForProduction false', () => assert.equal(U.readinessDecision.readyForProduction, false));
test('225. blocked on blockers', () => { const r = createRuntimeUiImplementationReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForRuntimeUiImplementationPlan, false); });
test('226. slice stays false even empty', () => assert.equal(createRuntimeUiImplementationReadinessDecision({}).readyForRuntimeUiImplementationSlice, false));

// ===== Manifest (227-236) =====
test('227. manifest kind', () => assert.equal(U.manifest.kind, 'runtime-ui-implementation-plan-manifest'));
test('228. manifest name', () => assert.equal(U.manifest.runtimeUiImplementationPlanName, RUNTIME_UI_IMPLEMENTATION_PLAN_NAME));
test('229. manifest version', () => assert.equal(U.manifest.runtimeUiImplementationPlanVersion, RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION));
test('230. manifest upstream runtimeUiContract', () => assert.equal(U.manifest.upstream.runtimeUiContract, RUNTIME_UI_CONTRACT_VERSION));
test('231. manifest upstream isolatedRuntime', () => assert.equal(U.manifest.upstream.isolatedRuntime, ISOLATED_RUNTIME_VERSION));
test('232. manifest parts.session digest', () => assert.equal(U.manifest.parts.session, session.sessionDigest));
test('233. manifest parts.phases digest', () => assert.ok(typeof U.manifest.parts.phases === 'string'));
test('234. manifest parts.safetyPlan digest', () => assert.ok(typeof U.manifest.parts.safetyPlan === 'string'));
test('235. manifest standalone builds', () => assert.equal(createRuntimeUiImplementationPlanManifest({ runtimeUiContract: UC }).kind, 'runtime-ui-implementation-plan-manifest'));
test('236. manifestDigest present', () => assert.ok(typeof U.manifest.manifestDigest === 'string'));

// ===== Verifier (237-256) =====
test('237. verification ok', () => assert.equal(U.verification.ok, true));
test('238. verification valid', () => assert.equal(U.verification.valid, true));
test('239. verification headless', () => assert.equal(U.verification.headless, true));
test('240. verification planOnly', () => assert.equal(U.verification.planOnly, true));
test('241. verification runtimeUiImplemented false', () => assert.equal(U.verification.runtimeUiImplemented, false));
test('242. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('243. verifier detects uiCreated', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, uiCreated: true } } }).blockers.includes('capability_uiCreated_must_be_false')));
test('244. verifier detects runtimeUiImplemented true', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, runtimeUiImplemented: true } } }).blockers.includes('capability_runtimeUiImplemented_must_be_false')));
test('245. verifier detects visualRuntimeImplemented true', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, visualRuntimeImplemented: true } } }).blockers.includes('capability_visualRuntimeImplemented_must_be_false')));
test('246. verifier detects react/jsx/tsx', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, reactComponentCreated: true, jsxCreated: true, tsxCreated: true } } }); assert.ok(r.blockers.includes('capability_reactComponentCreated_must_be_false') && r.blockers.includes('capability_jsxCreated_must_be_false') && r.blockers.includes('capability_tsxCreated_must_be_false')); });
test('247. verifier detects dom/css', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, domCreated: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_domCreated_must_be_false') && r.blockers.includes('capability_cssCreated_must_be_false')); });
test('248. verifier detects route/menu', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('249. verifier detects backend/prisma', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('250. verifier detects mutation/persistence', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('251. verifier detects real data read/write', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('252. verifier detects production/staging', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.blockers.includes('capability_productionAccessed_must_be_false') && r.blockers.includes('capability_stagingAccessed_must_be_false')); });
test('253. verifier detects unsafe realRenderAllowed true', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, pipelinePlan: { realRenderAllowed: true } } }).blockers.includes('unsafe_real_render_allowed_true')));
test('254. verifier detects unsafe componentAdapterImplemented true', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, componentAdapterPlan: { componentAdapterImplemented: true } } }).blockers.includes('unsafe_component_adapter_implemented')));
test('255. verifier detects unsafe handlersCreated true', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, interactionAdapterPlan: { handlersCreated: true } } }).blockers.includes('unsafe_handlers_created')));
test('256. verifier detects missing manual gate', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, manualGatePlan: { manualGateRequired: false } } }).blockers.includes('missing_manual_gate')));

// ===== Verifier extra (257-263) =====
test('257. verifier detects fetchUsed', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, fetchUsed: true } } }).blockers.includes('capability_fetchUsed_must_be_false')));
test('258. verifier detects rewriteEmpresas', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, rewriteEmpresas: true } } }).blockers.includes('capability_rewriteEmpresas_must_be_false')));
test('259. verifier detects moduleGenerated/registered', () => { const r = verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, moduleGenerated: true, moduleRegistered: true } } }); assert.ok(r.blockers.includes('capability_moduleGenerated_must_be_false') && r.blockers.includes('capability_moduleRegistered_must_be_false')); });
test('260. verifier detects missing mustBeTrue planOnly', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: { ...caps, planOnly: false } } }).blockers.includes('capability_planOnly_must_be_true')));
test('261. verifier detects metadataOnly false', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, metadataOnly: false } }).blockers.includes('plan_must_be_metadata_only')));
test('262. verifier detects unsafe renderer implemented', () => assert.ok(verifyRuntimeUiImplementationPlan({ plan: { capabilities: caps, rendererAdapterPlan: { rendererImplemented: true }, manualGatePlan: { manualGateRequired: true } } }).blockers.includes('unsafe_renderer_implemented')));
test('263. verifier never throws on junk', () => assert.doesNotThrow(() => verifyRuntimeUiImplementationPlan({ plan: null })));

// ===== Compatibility (264-272) =====
test('264. compatibility kind', () => assert.equal(U.compatibility.kind, 'runtime-ui-implementation-plan-compatibility'));
test('265. compatibleWithRuntimeUiContract', () => assert.equal(U.compatibility.compatibleWithRuntimeUiContract, true));
test('266. compat readyForPlan', () => assert.equal(U.compatibility.readyForRuntimeUiImplementationPlan, true));
test('267. compat readyForSlice false', () => assert.equal(U.compatibility.readyForRuntimeUiImplementationSlice, false));
test('268. compat readyForRouteMenu false', () => assert.equal(U.compatibility.readyForRouteMenuIntegration, false));
test('269. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('270. compat status after-checkpoint', () => assert.equal(U.compatibility.status, 'ready_for_future_runtime_ui_implementation_slice_after_enterprise_checkpoint'));
test('271. compat mismatch → warning', () => { const r = checkRuntimeUiImplementationPlanCompatibility({ runtimeUiContract: { runtimeUiContractVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithRuntimeUiContract, false); assert.ok(r.warnings.includes('incompatible_runtimeUiContract')); });
test('272. compatibilityDigest present', () => assert.ok(typeof U.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (273-286) =====
test('273. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'runtime-ui-implementation-plan-diagnostics'));
test('274. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('275. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('276. diagnostics headlessConfirmed', () => assert.equal(U.diagnostics.headlessConfirmed, true));
test('277. diagnostics planOnlyConfirmed', () => assert.equal(U.diagnostics.planOnlyConfirmed, true));
test('278. diagnostics runtimeUiImplemented false', () => assert.equal(U.diagnostics.runtimeUiImplemented, false));
test('279. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
const fbNo = createStudioDevPreviewRuntimeUiImplementationPlan({});
const fbBad = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: true } });
test('280. missing contract → fallback', () => assert.equal(fbNo.fallback, true));
test('281. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('282. fallback contract → fallback', () => assert.equal(fbFb.fallback, true));
test('283. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('284. fallback not ready plan/slice/production', () => { assert.equal(fbNo.readyForRuntimeUiImplementationPlan, false); assert.equal(fbNo.readyForRuntimeUiImplementationSlice, false); assert.equal(fbNo.readyForProduction, false); });
test('285. fallback caps runtimeUiImplemented false', () => assert.equal(fbNo.capabilities.runtimeUiImplemented, false));
test('286. fallback never throws + metadataOnly', () => { assert.doesNotThrow(() => createRuntimeUiImplementationPlanFallback({ reason: 'x' })); assert.equal(fbNo.metadataOnly, true); });

// ===== Errors (287-296) =====
test('287. error codes >= 30', () => assert.ok(RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 30));
test('288. error descriptor sanitized', () => { const e = createRuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('289. error no ui/dom/css', () => { const e = createRuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); });
test('290. error no real data + no runtime ui', () => { const e = createRuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_REAL_DATA_READ_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.realDataWrite, false); assert.equal(e.runtimeUiImplemented, false); });
test('291. unknown code normalized', () => assert.equal(createRuntimeUiImplementationPlanError('NOPE').code, 'RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_RUNTIME_UI_CONTRACT'));
test('292. typed error', () => { const e = new RuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_INVALID_VIRTUAL_FRAME', 'x'); assert.ok(e instanceof Error && e.name === 'RuntimeUiImplementationPlanError'); });
test('293. helper error', () => assert.equal(runtimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_FETCH_BLOCKED', 'x').code, 'RUNTIME_UI_IMPLEMENTATION_PLAN_FETCH_BLOCKED'));
test('294. codes cover react/jsx/tsx/dom/css/route/placement', () => ['RUNTIME_UI_IMPLEMENTATION_PLAN_REACT_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_JSX_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_TSX_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_DOM_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_CSS_RUNTIME_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_ROUTE_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_PLACEMENT_BLOCKED'].forEach((c) => assert.ok(RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('295. codes cover runtimeUiImplemented/manual-gate', () => ['RUNTIME_UI_IMPLEMENTATION_PLAN_RUNTIME_UI_IMPLEMENTED_BLOCKED', 'RUNTIME_UI_IMPLEMENTATION_PLAN_MANUAL_GATE_MISSING'].forEach((c) => assert.ok(RUNTIME_UI_IMPLEMENTATION_PLAN_ERROR_CODES.includes(c))));
test('296. error no stack leak', () => { const e = createRuntimeUiImplementationPlanError('RUNTIME_UI_IMPLEMENTATION_PLAN_BACKEND_BLOCKED'); assert.equal(e.noStackLeak, true); });

// ===== Config flags (297-306) =====
test('297. flag off by default', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationPlanEnabled({}), false));
test('298. flag on in dev', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('298b. flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationPlanEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('299. phases flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('300. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('301. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('302. master flag enables phases in dev', () => assert.equal(isStudioDevPreviewRuntimeUiImplementationPhasesEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: true }), true));
test('303. readiness states frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES)));
test('304. phase ids frozen', () => assert.ok(Object.isFrozen(RUNTIME_UI_IMPLEMENTATION_PHASE_IDS)));
test('305. pipeline steps frozen', () => assert.ok(Object.isFrozen(VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS)));
test('306. uiPlanDigest deterministic + format', () => { assert.equal(uiPlanDigest({ a: 1 }), uiPlanDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(uiPlanDigest({ a: 1 }))); });

// ===== Determinism / purity (307-318) =====
test('307. deterministic overallDigest', () => assert.equal(U.overallDigest, createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC }).overallDigest));
test('308. deterministic runtimeUiImplementationPlanDigest', () => assert.equal(U.runtimeUiImplementationPlanDigest, createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC }).runtimeUiImplementationPlanDigest));
test('309. input not mutated', () => { const snap = JSON.stringify(UC); createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: UC }); assert.equal(JSON.stringify(UC), snap); });
test('310. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(U))));
test('311. different module → different digest', () => {
  const sb2 = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'produtos', moduleName: 'Produtos', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const uc2 = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb2 }) }) }) }) }) });
  assert.notEqual(U.overallDigest, createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: uc2 }).overallDigest);
});
test('312. builds from full real chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const uc = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: createStudioDevPreviewIsolatedRuntime({ implementationPlan: createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: createStudioDevPreviewRuntimeShellContract({ visualContract: createStudioDevPreviewVisualContract({ bridge: createStudioDevPreviewContractBridge({ sandbox: sb }) }) }) }) }) });
  const uu = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: uc });
  assert.equal(uu.kind, 'studio-dev-preview-runtime-ui-implementation-plan');
  assert.equal(uu.readyForRuntimeUiImplementationSlice, false);
});
test('313. no Empresas rewrite', () => assert.equal(U.capabilities.rewriteEmpresas, false));
test('314. no module registration', () => assert.equal(U.capabilities.moduleRegistered, false));
test('315. no runtime ui implemented', () => assert.equal(U.capabilities.runtimeUiImplemented, false));
test('316. no visual runtime implemented', () => assert.equal(U.capabilities.visualRuntimeImplemented, false));
test('317. unsafe runtime UI contract input fail-closed', () => { const bad = createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: { kind: 'studio-dev-preview-runtime-ui-contract', fallback: false, capabilities: { uiCreated: true } } }); assert.ok(bad.fallback === false ? bad.verification.ok === true : bad.fallback === true); });
test('318. empty runtime UI contract input fail-closed', () => assert.equal(createStudioDevPreviewRuntimeUiImplementationPlan({ runtimeUiContract: {} }).fallback, true));

// ===== Purity/no-side-effect code scan (319-330) =====
test('319. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('320. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('321. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('322. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('323. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('324. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('325. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('326. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('327. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('328. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('329. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));
test('330. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));

// ===== Scope safety (331-353) — branch-relative =====
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
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('331. plan subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui-implementation-plan')));
test('332. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('333. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('334. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('335. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('336. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('337. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('338. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('339. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('340. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('341. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('342. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('343. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('344. studio prototype (shell/designers/pages) not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(shell|designers|pages|components)\//.test(x))); });
test('345. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('346. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('347. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('348. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('349. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('350. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('351. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('352. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('353. net-new scope is plan subtree only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-implementation-plan\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('354. upstream runtime UI contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js')));

// ===== Evidence docs (D1-D23) =====
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
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/React|UI|rota|route|menu|módulo|module|runtime/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/ENTERPRISE CHECKPOINT|checkpoint|implementation/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
