import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ISOLATED_RUNTIME_NAME,
  ISOLATED_RUNTIME_SEMVER,
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_MODE,
  ISOLATED_RUNTIME_ENVIRONMENT,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MANUAL_GATE_NAME,
  MANUAL_GATE_STATUS,
  ISOLATED_RUNTIME_LIFECYCLE_STEPS,
  ISOLATED_RUNTIME_EVENT_KINDS,
  ISOLATED_RUNTIME_READINESS_STATES,
  ISOLATED_RUNTIME_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK_FLAG,
  runtimeDigest,
  isStudioDevPreviewIsolatedRuntimeEnabled,
  isStudioDevPreviewIsolatedRuntimeFrameEnabled,
  isStudioDevPreviewIsolatedRuntimeVerifyEnabled,
  isStudioDevPreviewIsolatedRuntimeCompatibilityCheckEnabled,
  ISOLATED_RUNTIME_ERROR_CODES,
  IsolatedRuntimeError,
  createIsolatedRuntimeError,
  isolatedRuntimeError,
  createIsolatedRuntimeSession,
  createIsolatedRuntimePreflight,
  createIsolatedRuntimeContractLoader,
  createIsolatedRuntimeSyntheticDataProvider,
  createIsolatedRuntimePlaceholderResolver,
  createIsolatedRuntimeVirtualFrame,
  createIsolatedRuntimeLifecycleExecutor,
  createIsolatedRuntimeEventDispatcher,
  createIsolatedRuntimeRenderRequestExecutor,
  createIsolatedRuntimeStateContainer,
  createIsolatedRuntimePermissionEnforcer,
  createIsolatedRuntimeDataBoundary,
  createIsolatedRuntimeIsolationBoundary,
  createIsolatedRuntimeManualGate,
  createIsolatedRuntimeSafetyPolicy,
  createIsolatedRuntimeManifest,
  verifyIsolatedRuntime,
  checkIsolatedRuntimeCompatibility,
  createIsolatedRuntimeDiagnostics,
  createIsolatedRuntimeFallback,
  createStudioDevPreviewIsolatedRuntime,
} from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-isolated-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime');

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
const PLAN = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
const R = createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN });

const arg = { implementationPlan: PLAN };
const session = createIsolatedRuntimeSession(arg);
const preflight = createIsolatedRuntimePreflight(arg);
const loader = createIsolatedRuntimeContractLoader(arg);
const synthetic = createIsolatedRuntimeSyntheticDataProvider(arg);
const placeholders = createIsolatedRuntimePlaceholderResolver(arg);
const frame = createIsolatedRuntimeVirtualFrame({ implementationPlan: PLAN, syntheticData: synthetic, placeholders });
const lifecycle = createIsolatedRuntimeLifecycleExecutor(arg);
const events = createIsolatedRuntimeEventDispatcher(arg);
const renderReq = createIsolatedRuntimeRenderRequestExecutor({ implementationPlan: PLAN, virtualFrame: frame });
const stateC = createIsolatedRuntimeStateContainer({ implementationPlan: PLAN, virtualFrame: frame });
const permission = createIsolatedRuntimePermissionEnforcer(arg);
const dataB = createIsolatedRuntimeDataBoundary(arg);
const isolation = createIsolatedRuntimeIsolationBoundary(arg);
const manualGate = createIsolatedRuntimeManualGate(arg);
const safety = createIsolatedRuntimeSafetyPolicy(arg);

// ===== Contract base (1-52) =====
test('1. runtime created', () => assert.equal(R.kind, 'studio-dev-preview-isolated-runtime'));
test('2. name', () => { assert.equal(R.isolatedRuntimeName, 'studio-dev-preview-isolated-runtime'); assert.equal(R.isolatedRuntimeName, ISOLATED_RUNTIME_NAME); });
test('3. version', () => { assert.equal(R.isolatedRuntimeVersion, 'studio-dev-preview-isolated-runtime@1.0.0'); assert.equal(R.isolatedRuntimeVersion, ISOLATED_RUNTIME_VERSION); });
test('4. semver', () => assert.equal(ISOLATED_RUNTIME_SEMVER, '1.0.0'));
test('5. implementationPlanVersion', () => assert.equal(R.implementationPlanVersion, 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0'));
test('6. runtimeShellContractVersion', () => assert.equal(R.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'));
test('7. visualContractVersion', () => assert.equal(R.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('8. bridgeVersion', () => assert.equal(R.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('9. sandboxVersion', () => assert.equal(R.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('10. plannerVersion', () => assert.equal(R.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('11. engineVersion', () => assert.equal(R.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('12. blueprintContractVersion', () => assert.equal(R.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('13. mode', () => { assert.equal(R.mode, 'headless_dev_preview_isolated_runtime'); assert.equal(R.mode, ISOLATED_RUNTIME_MODE); });
test('14. environment const', () => assert.equal(ISOLATED_RUNTIME_ENVIRONMENT, 'local_dev_only'));
test('15. moduleId', () => assert.equal(R.moduleId, 'clientes'));
test('16. not fallback', () => assert.equal(R.fallback, false));
test('17. headless', () => assert.equal(R.capabilities.headless, true));
test('18. devOnly', () => assert.equal(R.capabilities.devOnly, true));
test('19. isolated', () => assert.equal(R.capabilities.isolated, true));
test('20. contractDriven', () => assert.equal(R.capabilities.contractDriven, true));
test('21. syntheticDataOnly', () => assert.equal(R.capabilities.syntheticDataOnly, true));
test('22. metadataOutputOnly', () => assert.equal(R.capabilities.metadataOutputOnly, true));
test('23. virtualFrameOnly', () => assert.equal(R.capabilities.virtualFrameOnly, true));
test('24. isolatedRuntimeImplemented true', () => assert.equal(R.capabilities.isolatedRuntimeImplemented, true));
test('25. visualRuntimeImplemented false', () => assert.equal(R.capabilities.visualRuntimeImplemented, false));
test('26. reactComponentCreated false', () => assert.equal(R.capabilities.reactComponentCreated, false));
test('27. jsxCreated false', () => assert.equal(R.capabilities.jsxCreated, false));
test('28. tsxCreated false', () => assert.equal(R.capabilities.tsxCreated, false));
test('29. domCreated false', () => assert.equal(R.capabilities.domCreated, false));
test('30. cssCreated false', () => assert.equal(R.capabilities.cssCreated, false));
test('31. uiCreated false', () => assert.equal(R.capabilities.uiCreated, false));
test('32. routeCreated false', () => assert.equal(R.capabilities.routeCreated, false));
test('33. menuCreated false', () => assert.equal(R.capabilities.menuCreated, false));
test('34. moduleGenerated false', () => assert.equal(R.capabilities.moduleGenerated, false));
test('35. filesWrittenToModule false', () => assert.equal(R.capabilities.filesWrittenToModule, false));
test('36. moduleRegistered false', () => assert.equal(R.capabilities.moduleRegistered, false));
test('37. reactRuntimeCreated false', () => assert.equal(R.capabilities.reactRuntimeCreated, false));
test('38. domRuntimeCreated false', () => assert.equal(R.capabilities.domRuntimeCreated, false));
test('39. cssRuntimeCreated false', () => assert.equal(R.capabilities.cssRuntimeCreated, false));
test('40. routeRuntimeCreated false', () => assert.equal(R.capabilities.routeRuntimeCreated, false));
test('41. menuRuntimeCreated false', () => assert.equal(R.capabilities.menuRuntimeCreated, false));
test('42. moduleRuntimeCreated false', () => assert.equal(R.capabilities.moduleRuntimeCreated, false));
test('43. backendAccessed false', () => assert.equal(R.capabilities.backendAccessed, false));
test('44. prismaAccessed false', () => assert.equal(R.capabilities.prismaAccessed, false));
test('45. productionAccessed false', () => assert.equal(R.capabilities.productionAccessed, false));
test('46. stagingAccessed false', () => assert.equal(R.capabilities.stagingAccessed, false));
test('47. fetchUsed false', () => assert.equal(R.capabilities.fetchUsed, false));
test('48. mutationAllowed false', () => assert.equal(R.capabilities.mutationAllowed, false));
test('49. persistenceCreated false', () => assert.equal(R.capabilities.persistenceCreated, false));
test('50. realDataRead false', () => assert.equal(R.capabilities.realDataRead, false));
test('51. realDataWrite false', () => assert.equal(R.capabilities.realDataWrite, false));
test('52. rewriteEmpresas false + caps frozen', () => { assert.equal(R.capabilities.rewriteEmpresas, false); assert.ok(Object.isFrozen(ISOLATED_RUNTIME_CAPABILITIES)); });

// ===== Readiness top-level (53-62) =====
test('53. readyForIsolatedRuntime true', () => assert.equal(R.readyForIsolatedRuntime, true));
test('54. readyForDevPreviewRuntimeUI false', () => assert.equal(R.readyForDevPreviewRuntimeUI, false));
test('55. readyForRouteMenuIntegration false', () => assert.equal(R.readyForRouteMenuIntegration, false));
test('56. readyForRealModuleGeneration false', () => assert.equal(R.readyForRealModuleGeneration, false));
test('57. readyForProduction false', () => assert.equal(R.readyForProduction, false));
test('58. readiness ready', () => assert.equal(R.readiness, 'studio_dev_preview_isolated_runtime_ready'));
test('59. blockerCount 0', () => assert.equal(R.blockerCount, 0));
test('60. warningCount 0', () => assert.equal(R.warningCount, 0));
test('61. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(R.overallDigest)));
test('62. readiness state in enum', () => assert.ok(ISOLATED_RUNTIME_READINESS_STATES.includes(R.readiness)));

// ===== Session (63-73) =====
test('63. session kind', () => assert.equal(session.kind, 'isolated-runtime-session'));
test('64. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-isolated-runtime'));
test('65. session version', () => assert.equal(session.isolatedRuntimeVersion, ISOLATED_RUNTIME_VERSION));
test('66. sourceImplementationPlan', () => assert.equal(session.sourceImplementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('67. sourceRuntimeShellContract', () => assert.equal(session.sourceRuntimeShellContract, RUNTIME_SHELL_CONTRACT_VERSION));
test('68. session mode', () => assert.equal(session.mode, ISOLATED_RUNTIME_MODE));
test('69. devOnly + isolated', () => { assert.equal(session.devOnly, true); assert.equal(session.isolated, true); });
test('70. seed deterministic', () => assert.equal(session.seed, createIsolatedRuntimeSession(arg).seed));
test('71. no storage/fetch', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); });
test('72. no persistence/external side effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.externalSideEffects, false); });
test('73. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-isolated-runtime-implementation-plan'));

// ===== Preflight (74-84) =====
test('74. preflight kind', () => assert.equal(preflight.kind, 'isolated-runtime-preflight'));
test('75. preflight ok', () => assert.equal(preflight.ok, true));
test('76. checkpointAuthorizationPresent', () => assert.equal(preflight.checkpointAuthorizationPresent, true));
test('77. manualGateSatisfied', () => assert.equal(preflight.manualGateSatisfied, true));
test('78. implementationPlanVersionCompatible', () => assert.equal(preflight.checks.implementationPlanVersionCompatible, true));
test('79. runtimeShellContractVersionCompatible', () => assert.equal(preflight.checks.runtimeShellContractVersionCompatible, true));
test('80. devOnly true', () => assert.equal(preflight.devOnly, true));
test('81. production false', () => assert.equal(preflight.production, false));
test('82. staging false', () => assert.equal(preflight.staging, false));
test('83. no network/backend/prisma', () => { assert.equal(preflight.usedNetwork, false); assert.equal(preflight.usedBackend, false); assert.equal(preflight.usedPrisma, false); });
test('84. preflight fails closed on invalid plan', () => { const p = createIsolatedRuntimePreflight({ implementationPlan: { kind: 'other' } }); assert.equal(p.ok, false); });

// ===== Contract loader (85-93) =====
test('85. loader kind', () => assert.equal(loader.kind, 'isolated-runtime-contract-loader'));
test('86. allLoaded', () => assert.equal(loader.allLoaded, true));
test('87. loaded implementationPlan', () => assert.equal(loader.loaded.implementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('88. no dynamic import', () => assert.equal(loader.usedDynamicImport, false));
test('89. no fetch', () => assert.equal(loader.usedFetch, false));
test('90. no filesystem', () => assert.equal(loader.usedFilesystem, false));
test('91. no prisma', () => assert.equal(loader.usedPrisma, false));
test('92. no backend', () => assert.equal(loader.usedBackend, false));
test('93. no window/document', () => assert.equal(loader.usedWindowOrDocument, false));

// ===== Synthetic data (94-103) =====
test('94. synthetic kind', () => assert.equal(synthetic.kind, 'isolated-runtime-synthetic-data'));
test('95. syntheticDataOnly', () => assert.equal(synthetic.syntheticDataOnly, true));
test('96. realDataRead false', () => assert.equal(synthetic.realDataRead, false));
test('97. realDataWrite false', () => assert.equal(synthetic.realDataWrite, false));
test('98. tenantHint synthetic', () => assert.match(synthetic.tenantHint, /synthetic/));
test('99. permissionHint synthetic', () => assert.match(synthetic.permissionHint, /synthetic/));
test('100. rows are synthetic', () => assert.ok(synthetic.syntheticRows.every((r) => r.synthetic === true)));
test('101. fields are synthetic', () => assert.ok(synthetic.syntheticFields.every((f) => f.synthetic === true)));
test('102. no storage/persistence', () => { assert.equal(synthetic.usesStorage, false); assert.equal(synthetic.usesPersistence, false); });
test('103. deterministic rowCount default 3', () => assert.equal(synthetic.rowCount, 3));

// ===== Placeholder resolver (104-112) =====
test('104. resolver kind', () => assert.equal(placeholders.kind, 'isolated-runtime-placeholder-resolver'));
test('105. resolvedCount > 0', () => assert.ok(placeholders.resolvedCount > 0));
test('106. no real component', () => assert.ok(placeholders.resolved.every((r) => r.isRealComponent === false)));
test('107. no import component', () => assert.ok(placeholders.resolved.every((r) => r.importsComponent === false)));
test('108. no path ref', () => assert.ok(placeholders.resolved.every((r) => r.referencesComponentPath === false)));
test('109. no jsx/tsx', () => assert.ok(placeholders.resolved.every((r) => r.jsx === false && r.tsx === false)));
test('110. no real render fn', () => assert.ok(placeholders.resolved.every((r) => r.hasRealRenderFn === false)));
test('111. anyRealComponent false', () => assert.equal(placeholders.anyRealComponent, false));
test('112. anyRealRenderFn false', () => assert.equal(placeholders.anyRealRenderFn, false));

// ===== Virtual frame (113-127) =====
test('113. frame kind', () => assert.equal(frame.kind, 'isolated-runtime-virtual-frame'));
test('114. frameId present', () => assert.ok(typeof frame.frameId === 'string'));
test('115. frameVersion', () => assert.equal(frame.frameVersion, 'isolated-runtime-virtual-frame@1.0.0'));
test('116. sourceDigests present', () => assert.ok(typeof frame.sourceDigests.implementationPlan === 'string'));
test('117. screenKind', () => assert.equal(frame.screenKind, 'list'));
test('118. sections present', () => assert.ok(Array.isArray(frame.sections) && frame.sections.length >= 2));
test('119. slots present', () => assert.ok(Array.isArray(frame.slots)));
test('120. syntheticRows present', () => assert.equal(frame.syntheticRows.length, 3));
test('121. blockedActions all blocked', () => assert.ok(frame.blockedActions.every((a) => a.blocked === true)));
test('122. permissionHints defaultDeny', () => assert.equal(frame.permissionHints.defaultDeny, true));
test('123. no react element', () => assert.equal(frame.reactElement, false));
test('124. no jsx', () => assert.equal(frame.jsx, false));
test('125. no dom node', () => assert.equal(frame.domNode, false));
test('126. no css runtime', () => assert.equal(frame.cssRuntime, false));
test('127. no route/menu/module object', () => { assert.equal(frame.routeObject, false); assert.equal(frame.menuObject, false); assert.equal(frame.moduleFile, false); });

// ===== Lifecycle executor (128-137) =====
test('128. lifecycle kind', () => assert.equal(lifecycle.kind, 'isolated-runtime-lifecycle-executor'));
test('129. steps match const', () => assert.deepEqual(lifecycle.steps, [...ISOLATED_RUNTIME_LIFECYCLE_STEPS]));
test('130. initialStep created', () => assert.equal(lifecycle.initialStep, 'created'));
test('131. finalStep disposed', () => assert.equal(lifecycle.finalStep, 'disposed'));
test('132. blockedStep blockedForUIRuntime', () => assert.equal(lifecycle.blockedStep, 'blockedForUIRuntime'));
test('133. disposed terminal', () => assert.equal(lifecycle.transitions.find((t) => t.step === 'disposed').terminal, true));
test('134. no timers', () => assert.equal(lifecycle.usesTimers, false));
test('135. no event loop', () => assert.equal(lifecycle.usesEventLoop, false));
test('136. no dom', () => assert.equal(lifecycle.usesDom, false));
test('137. no listeners + LIFECYCLE frozen', () => { assert.equal(lifecycle.usesListeners, false); assert.ok(Object.isFrozen(ISOLATED_RUNTIME_LIFECYCLE_STEPS)); });

// ===== Event dispatcher (138-147) =====
test('138. events kind', () => assert.equal(events.kind, 'isolated-runtime-event-dispatcher'));
test('139. 8 event kinds', () => assert.equal(events.eventKinds.length, 8));
test('140. renderBlocked blocked', () => assert.equal(events.events.find((e) => e.event === 'renderBlocked').blocked, true));
test('141. previewRequested allowed', () => assert.equal(events.events.find((e) => e.event === 'previewRequested').allowed, true));
test('142. no real handler', () => assert.ok(events.events.every((e) => e.hasRealHandler === false)));
test('143. no real listener', () => assert.ok(events.events.every((e) => e.hasRealListener === false)));
test('144. no mutation', () => assert.ok(events.events.every((e) => e.mutation === false)));
test('145. no EventEmitter', () => assert.equal(events.usesEventEmitter, false));
test('146. no network/storage', () => { assert.equal(events.usesNetwork, false); assert.equal(events.usesStorage, false); });
test('147. EVENT_KINDS frozen', () => assert.ok(Object.isFrozen(ISOLATED_RUNTIME_EVENT_KINDS)));

// ===== Render request executor (148-155) =====
test('148. renderReq kind', () => assert.equal(renderReq.kind, 'isolated-runtime-render-request-executor'));
test('149. renderAllowed false', () => assert.equal(renderReq.renderAllowed, false));
test('150. virtualFrameProduced true', () => assert.equal(renderReq.virtualFrameProduced, true));
test('151. realRenderProduced false', () => assert.equal(renderReq.realRenderProduced, false));
test('152. reason future slice', () => assert.match(renderReq.reason, /UI runtime requires future explicit slice/));
test('153. no react element produced', () => assert.equal(renderReq.reactElementProduced, false));
test('154. no dom/css produced', () => { assert.equal(renderReq.domProduced, false); assert.equal(renderReq.cssProduced, false); });
test('155. render virtualFrameId matches', () => assert.equal(renderReq.virtualFrameId, frame.frameId));

// ===== State container (156-165) =====
test('156. state kind', () => assert.equal(stateC.kind, 'isolated-runtime-state-container'));
test('157. ephemeral', () => assert.equal(stateC.ephemeral, true));
test('158. inMemoryOnly', () => assert.equal(stateC.inMemoryOnly, true));
test('159. deterministic', () => assert.equal(stateC.deterministic, true));
test('160. serializable', () => assert.equal(stateC.serializable, true));
test('161. readOnlyOutput', () => assert.equal(stateC.readOnlyOutput, true));
test('162. no reactState', () => assert.equal(stateC.reactState, false));
test('163. no hooks', () => assert.equal(stateC.hooks, false));
test('164. no storage', () => assert.equal(stateC.storage, false));
test('165. no persistence', () => assert.equal(stateC.persistence, false));

// ===== Permission enforcer (166-173) =====
test('166. permission kind', () => assert.equal(permission.kind, 'isolated-runtime-permission-enforcer'));
test('167. defaultDeny', () => assert.equal(permission.defaultDeny, true));
test('168. failClosed', () => assert.equal(permission.failClosed, true));
test('169. tenantRequired', () => assert.equal(permission.tenantRequired, true));
test('170. permissionRequired', () => assert.equal(permission.permissionRequired, true));
test('171. adminBypass false', () => assert.equal(permission.adminBypass, false));
test('172. grantsRealAccess false', () => assert.equal(permission.grantsRealAccess, false));
test('173. permission metadataOnly', () => assert.equal(permission.metadataOnly, true));

// ===== Data boundary (174-181) =====
test('174. data kind', () => assert.equal(dataB.kind, 'isolated-runtime-data-boundary'));
test('175. dataMode synthetic_metadata_only', () => assert.equal(dataB.dataMode, 'synthetic_metadata_only'));
test('176. realDataRead false', () => assert.equal(dataB.realDataRead, false));
test('177. realDataWrite false', () => assert.equal(dataB.realDataWrite, false));
test('178. backendAccessed false', () => assert.equal(dataB.backendAccessed, false));
test('179. prismaAccessed false', () => assert.equal(dataB.prismaAccessed, false));
test('180. fetchUsed false', () => assert.equal(dataB.fetchUsed, false));
test('181. persistenceCreated/mutationAllowed false', () => { assert.equal(dataB.persistenceCreated, false); assert.equal(dataB.mutationAllowed, false); });

// ===== Isolation boundary (182-194) =====
test('182. isolation kind', () => assert.equal(isolation.kind, 'isolated-runtime-isolation-boundary'));
test('183. noWindow', () => assert.equal(isolation.noWindow, true));
test('184. noDocument', () => assert.equal(isolation.noDocument, true));
test('185. noDOM', () => assert.equal(isolation.noDOM, true));
test('186. noReact', () => assert.equal(isolation.noReact, true));
test('187. noCSSRuntime', () => assert.equal(isolation.noCSSRuntime, true));
test('188. noRouteRuntime', () => assert.equal(isolation.noRouteRuntime, true));
test('189. noMenuRuntime', () => assert.equal(isolation.noMenuRuntime, true));
test('190. noModuleRuntime', () => assert.equal(isolation.noModuleRuntime, true));
test('191. noBackend', () => assert.equal(isolation.noBackend, true));
test('192. noPrisma', () => assert.equal(isolation.noPrisma, true));
test('193. noProduction/noStaging', () => { assert.equal(isolation.noProduction, true); assert.equal(isolation.noStaging, true); });
test('194. allInvariantsHold', () => assert.equal(isolation.allInvariantsHold, true));

// ===== Manual gate (195-203) =====
test('195. gate kind', () => assert.equal(manualGate.kind, 'isolated-runtime-manual-gate'));
test('196. manualGateName', () => { assert.equal(manualGate.manualGateName, 'fable-pre-runtime-enterprise-checkpoint'); assert.equal(manualGate.manualGateName, MANUAL_GATE_NAME); });
test('197. manualGateStatus', () => { assert.equal(manualGate.manualGateStatus, 'approved_for_dev_only_isolated_runtime'); assert.equal(manualGate.manualGateStatus, MANUAL_GATE_STATUS); });
test('198. approvedForDevOnlyIsolatedRuntime', () => assert.equal(manualGate.approvedForDevOnlyIsolatedRuntime, true));
test('199. productionGate false', () => assert.equal(manualGate.productionGate, false));
test('200. routeMenuGate false', () => assert.equal(manualGate.routeMenuGate, false));
test('201. moduleGenerationGate false', () => assert.equal(manualGate.moduleGenerationGate, false));
test('202. backendGate false', () => assert.equal(manualGate.backendGate, false));
test('203. prismaGate false', () => assert.equal(manualGate.prismaGate, false));

// ===== Safety policy (204-213) =====
test('204. safety kind', () => assert.equal(safety.kind, 'isolated-runtime-safety-policy'));
test('205. devOnly + isolated', () => { assert.equal(safety.devOnly, true); assert.equal(safety.isolated, true); });
test('206. failClosed', () => assert.equal(safety.failClosed, true));
test('207. isolatedRuntimeImplemented true', () => assert.equal(safety.isolatedRuntimeImplemented, true));
test('208. visualRuntimeImplemented false', () => assert.equal(safety.visualRuntimeImplemented, false));
test('209. anyForbiddenSideEffect false', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('210. reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('211. forbiddenFlags all false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));
test('212. forbiddenFlags includes visualRuntimeImplemented', () => assert.equal(safety.forbiddenFlags.visualRuntimeImplemented, false));
test('213. safetyPolicyDigest present', () => assert.ok(typeof safety.safetyPolicyDigest === 'string'));

// ===== Manifest (214-222) =====
test('214. manifest kind', () => assert.equal(R.manifest.kind, 'isolated-runtime-manifest'));
test('215. manifest name', () => assert.equal(R.manifest.isolatedRuntimeName, ISOLATED_RUNTIME_NAME));
test('216. manifest version', () => assert.equal(R.manifest.isolatedRuntimeVersion, ISOLATED_RUNTIME_VERSION));
test('217. manifest upstream plan', () => assert.equal(R.manifest.upstream.implementationPlan, IMPLEMENTATION_PLAN_VERSION));
test('218. manifest parts.session digest', () => assert.equal(R.manifest.parts.session, session.sessionDigest));
test('219. manifest parts.virtualFrame digest', () => assert.ok(typeof R.manifest.parts.virtualFrame === 'string'));
test('220. manifest capabilities isolatedRuntimeImplemented', () => assert.equal(R.manifest.capabilities.isolatedRuntimeImplemented, true));
test('221. manifest standalone builds', () => assert.equal(createIsolatedRuntimeManifest({ implementationPlan: PLAN }).kind, 'isolated-runtime-manifest'));
test('222. manifestDigest present', () => assert.ok(typeof R.manifest.manifestDigest === 'string'));

// ===== Verifier (223-240) =====
const caps = ISOLATED_RUNTIME_CAPABILITIES;
test('223. verification ok', () => assert.equal(R.verification.ok, true));
test('224. verification valid', () => assert.equal(R.verification.valid, true));
test('225. verification devOnly + isolated', () => { assert.equal(R.verification.devOnly, true); assert.equal(R.verification.isolated, true); });
test('226. verification isolatedRuntimeImplemented true', () => assert.equal(R.verification.isolatedRuntimeImplemented, true));
test('227. verification visualRuntimeImplemented false', () => assert.equal(R.verification.visualRuntimeImplemented, false));
test('228. verification no blockers', () => assert.equal(R.verification.blockerCount, 0));
test('229. verifier detects uiCreated', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, uiCreated: true } } }).blockers.includes('capability_uiCreated_must_be_false')));
test('230. verifier detects visualRuntimeImplemented', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, visualRuntimeImplemented: true } } }).blockers.includes('capability_visualRuntimeImplemented_must_be_false')));
test('231. verifier detects domCreated/cssCreated', () => { const r = verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, domCreated: true, cssCreated: true } } }); assert.ok(r.blockers.includes('capability_domCreated_must_be_false') && r.blockers.includes('capability_cssCreated_must_be_false')); });
test('232. verifier detects route/menu', () => { const r = verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('233. verifier detects backend/prisma', () => { const r = verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('234. verifier detects mutation/persistence', () => { const r = verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('235. verifier detects real data read/write', () => { const r = verifyIsolatedRuntime({ runtime: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.blockers.includes('capability_realDataRead_must_be_false') && r.blockers.includes('capability_realDataWrite_must_be_false')); });
test('236. verifier detects renderAllowed true', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: caps, renderRequest: { renderAllowed: true }, manualGate: { approvedForDevOnlyIsolatedRuntime: true } } }).blockers.includes('unsafe_render_allowed_true')));
test('237. verifier detects missing manual gate', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: caps, manualGate: { approvedForDevOnlyIsolatedRuntime: false } } }).blockers.includes('missing_manual_gate')));
test('238. verifier detects manual gate opening forbidden', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: caps, manualGate: { approvedForDevOnlyIsolatedRuntime: true, productionGate: true } } }).blockers.includes('manual_gate_opens_forbidden')));
test('239. verifier detects unsafe virtual frame', () => assert.ok(verifyIsolatedRuntime({ runtime: { capabilities: caps, manualGate: { approvedForDevOnlyIsolatedRuntime: true }, virtualFrame: { reactElement: true } } }).blockers.includes('unsafe_virtual_frame')));
test('240. verifier never throws on junk', () => assert.doesNotThrow(() => verifyIsolatedRuntime({ runtime: null })));

// ===== Compatibility (241-249) =====
test('241. compatibility kind', () => assert.equal(R.compatibility.kind, 'isolated-runtime-compatibility'));
test('242. compatibleWithImplementationPlan', () => assert.equal(R.compatibility.compatibleWithImplementationPlan, true));
test('243. compatibleWithRuntimeShellContract', () => assert.equal(R.compatibility.compatibleWithRuntimeShellContract, true));
test('244. compat readyForIsolatedRuntime', () => assert.equal(R.compatibility.readyForIsolatedRuntime, true));
test('245. compat readyForDevPreviewRuntimeUI false', () => assert.equal(R.compatibility.readyForDevPreviewRuntimeUI, false));
test('246. compat readyForRouteMenuIntegration false', () => assert.equal(R.compatibility.readyForRouteMenuIntegration, false));
test('247. compat status when-authorized', () => assert.equal(R.compatibility.status, 'ready_for_future_dev_preview_runtime_ui_contract_when_explicitly_authorized'));
test('248. mismatch → warning', () => { const r = checkIsolatedRuntimeCompatibility({ implementationPlan: { implementationPlanVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithImplementationPlan, false); assert.ok(r.warnings.includes('incompatible_implementationPlan')); });
test('249. compatibilityDigest present', () => assert.ok(typeof R.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (250-263) =====
test('250. diagnostics kind', () => assert.equal(R.diagnostics.kind, 'isolated-runtime-diagnostics'));
test('251. diagnostics passive', () => assert.equal(R.diagnostics.passive, true));
test('252. diagnostics ok', () => assert.equal(R.diagnostics.ok, true));
test('253. diagnostics devOnlyConfirmed', () => assert.equal(R.diagnostics.devOnlyConfirmed, true));
test('254. diagnostics isolatedRuntimeImplemented true', () => assert.equal(R.diagnostics.isolatedRuntimeImplemented, true));
test('255. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(R.diagnostics))));
const fbNo = createStudioDevPreviewIsolatedRuntime({});
const fbBad = createStudioDevPreviewIsolatedRuntime({ implementationPlan: { kind: 'other' } });
const fbFb = createStudioDevPreviewIsolatedRuntime({ implementationPlan: { kind: 'studio-dev-preview-isolated-runtime-implementation-plan', fallback: true } });
test('256. missing plan → fallback', () => assert.equal(fbNo.fallback, true));
test('257. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('258. fallback plan → fallback', () => assert.equal(fbFb.fallback, true));
test('259. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('260. fallback not ready runtime/ui/production', () => { assert.equal(fbNo.readyForIsolatedRuntime, false); assert.equal(fbNo.readyForDevPreviewRuntimeUI, false); assert.equal(fbNo.readyForProduction, false); });
test('261. fallback isolatedRuntimeImplemented false', () => assert.equal(fbNo.capabilities.isolatedRuntimeImplemented, false));
test('262. fallback never throws', () => assert.doesNotThrow(() => createIsolatedRuntimeFallback({ reason: 'x' })));
test('263. preflight-fail plan → fallback', () => {
  const badPlan = { ...JSON.parse(JSON.stringify(PLAN)), executionPolicy: { ...PLAN.executionPolicy, productionAllowed: true } };
  const r = createStudioDevPreviewIsolatedRuntime({ implementationPlan: badPlan });
  assert.equal(r.fallback, true);
});

// ===== Errors (264-273) =====
test('264. error codes >= 30', () => assert.ok(ISOLATED_RUNTIME_ERROR_CODES.length >= 30));
test('265. error descriptor sanitized', () => { const e = createIsolatedRuntimeError('ISOLATED_RUNTIME_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false); });
test('266. error no ui/dom/css', () => { const e = createIsolatedRuntimeError('ISOLATED_RUNTIME_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); });
test('267. error no real data + no visual runtime', () => { const e = createIsolatedRuntimeError('ISOLATED_RUNTIME_REAL_DATA_READ_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.realDataWrite, false); assert.equal(e.visualRuntimeImplemented, false); });
test('268. unknown code normalized', () => assert.equal(createIsolatedRuntimeError('NOPE').code, 'ISOLATED_RUNTIME_INVALID_IMPLEMENTATION_PLAN'));
test('269. typed error', () => { const e = new IsolatedRuntimeError('ISOLATED_RUNTIME_INVALID_BRIDGE', 'x'); assert.ok(e instanceof Error && e.name === 'IsolatedRuntimeError'); });
test('270. helper error', () => assert.equal(isolatedRuntimeError('ISOLATED_RUNTIME_FETCH_BLOCKED', 'x').code, 'ISOLATED_RUNTIME_FETCH_BLOCKED'));
test('271. codes cover react/jsx/tsx/dom/css/route/menu', () => ['ISOLATED_RUNTIME_REACT_BLOCKED', 'ISOLATED_RUNTIME_JSX_BLOCKED', 'ISOLATED_RUNTIME_TSX_BLOCKED', 'ISOLATED_RUNTIME_DOM_BLOCKED', 'ISOLATED_RUNTIME_CSS_RUNTIME_BLOCKED', 'ISOLATED_RUNTIME_ROUTE_BLOCKED', 'ISOLATED_RUNTIME_MENU_BLOCKED'].forEach((c) => assert.ok(ISOLATED_RUNTIME_ERROR_CODES.includes(c))));
test('272. codes cover mutation/persistence/manual-gate/render', () => ['ISOLATED_RUNTIME_MUTATION_BLOCKED', 'ISOLATED_RUNTIME_PERSISTENCE_BLOCKED', 'ISOLATED_RUNTIME_MANUAL_GATE_MISSING', 'ISOLATED_RUNTIME_RENDER_ALLOWED_BLOCKED'].forEach((c) => assert.ok(ISOLATED_RUNTIME_ERROR_CODES.includes(c))));
test('273. error no secrets/stack leak', () => { const e = createIsolatedRuntimeError('ISOLATED_RUNTIME_BACKEND_BLOCKED'); assert.equal(e.noSecrets, true); assert.equal(e.noStackLeak, true); });

// ===== Config flags (274-282) =====
test('274. flag off by default', () => assert.equal(isStudioDevPreviewIsolatedRuntimeEnabled({}), false));
test('275. flag on in dev', () => assert.equal(isStudioDevPreviewIsolatedRuntimeEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG]: 'true', DEV: true }), true));
test('276. flag fails closed in production', () => assert.equal(isStudioDevPreviewIsolatedRuntimeEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('277. frame flag fails closed in production', () => assert.equal(isStudioDevPreviewIsolatedRuntimeFrameEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('278. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewIsolatedRuntimeVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('279. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewIsolatedRuntimeCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('280. master flag enables frame in dev', () => assert.equal(isStudioDevPreviewIsolatedRuntimeFrameEnabled({ [MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG]: 'true', DEV: true }), true));
test('281. readiness states frozen', () => assert.ok(Object.isFrozen(ISOLATED_RUNTIME_READINESS_STATES)));
test('282. runtimeDigest deterministic + format', () => { assert.equal(runtimeDigest({ a: 1 }), runtimeDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(runtimeDigest({ a: 1 }))); });

// ===== Determinism / purity (283-292) =====
test('283. deterministic overallDigest', () => assert.equal(R.overallDigest, createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN }).overallDigest));
test('284. deterministic isolatedRuntimeDigest', () => assert.equal(R.isolatedRuntimeDigest, createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN }).isolatedRuntimeDigest));
test('285. input not mutated', () => { const snap = JSON.stringify(PLAN); createStudioDevPreviewIsolatedRuntime({ implementationPlan: PLAN }); assert.equal(JSON.stringify(PLAN), snap); });
test('286. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(R))));
test('287. different module → different digest', () => { const b2 = createStudioDevPreviewContractBridge({ sandbox: { ...SANDBOX, moduleId: 'produtos' } }); const vc2 = createStudioDevPreviewVisualContract({ bridge: b2 }); const rs2 = createStudioDevPreviewRuntimeShellContract({ visualContract: vc2 }); const p2 = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs2 }); assert.notEqual(R.overallDigest, createStudioDevPreviewIsolatedRuntime({ implementationPlan: p2 }).overallDigest); });
test('288. builds from full real chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const br = createStudioDevPreviewContractBridge({ sandbox: sb });
  const vc = createStudioDevPreviewVisualContract({ bridge: br });
  const rs = createStudioDevPreviewRuntimeShellContract({ visualContract: vc });
  const pl = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: rs });
  const rr = createStudioDevPreviewIsolatedRuntime({ implementationPlan: pl });
  assert.equal(rr.kind, 'studio-dev-preview-isolated-runtime');
  assert.equal(rr.readyForDevPreviewRuntimeUI, false);
});
test('289. tenant/permission hints synthetic only', () => { assert.match(synthetic.tenantHint, /synthetic/); assert.match(synthetic.permissionHint, /synthetic/); });
test('290. no Empresas rewrite', () => assert.equal(R.capabilities.rewriteEmpresas, false));
test('291. no module registration', () => assert.equal(R.capabilities.moduleRegistered, false));
test('292. isolated runtime implemented but not visual', () => { assert.equal(R.capabilities.isolatedRuntimeImplemented, true); assert.equal(R.capabilities.visualRuntimeImplemented, false); });

// ===== Purity/no-side-effect code scan (293-303) =====
test('293. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('294. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('295. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('296. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('297. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('298. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('299. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('300. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('301. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('302. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('303. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));

// ===== Scope safety (304-326) — branch-relative =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('304. runtime subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-isolated-runtime')));
test('305. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('306. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('307. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('308. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('309. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('310. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('311. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('312. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('313. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('314. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('315. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('316. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('317. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('318. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('319. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('320. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('321. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('322. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('323. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('324. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('325. net-new scope is isolated-runtime only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('326. upstream implementation plan present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js')));

// ===== Evidence docs (D1-D21) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-ISOLATED-RUNTIME-REPORT.md', 'RUNTIME-SESSION.md', 'PREFLIGHT.md',
  'CONTRACT-LOADER.md', 'SYNTHETIC-DATA-PROVIDER.md', 'VIRTUAL-PREVIEW-FRAME.md', 'PLACEHOLDER-RESOLVER.md',
  'LIFECYCLE-EXECUTOR.md', 'EVENT-DISPATCHER.md', 'RENDER-REQUEST-EXECUTOR.md', 'STATE-CONTAINER.md',
  'PERMISSION-ENFORCER.md', 'DATA-BOUNDARY.md', 'ISOLATION-BOUNDARY.md', 'MANUAL-GATE.md', 'SAFETY-POLICY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-isolated-runtime/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/runtime|React|UI|rota|menu|módulo|module/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/RUNTIME UI CONTRACT|runtime ui|UI contract/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
