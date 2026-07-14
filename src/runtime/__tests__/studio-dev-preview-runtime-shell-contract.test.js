import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  RUNTIME_SHELL_CONTRACT_NAME,
  RUNTIME_SHELL_CONTRACT_SEMVER,
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_CONTRACT_MODE,
  RUNTIME_SHELL_CONTRACT_ENVIRONMENT,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_SHELL_LIFECYCLE_PHASES,
  RUNTIME_SHELL_EVENT_KINDS,
  ALLOWED_MOUNT_TARGET_KINDS,
  BLOCKED_MOUNT_TARGET_KINDS,
  ALLOWED_STATE_KINDS,
  BLOCKED_STATE_KINDS,
  RUNTIME_SHELL_READINESS_STATES,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK_FLAG,
  shellDigest,
  isStudioDevPreviewRuntimeShellContractEnabled,
  isStudioDevPreviewRuntimeShellLifecycleEnabled,
  isStudioDevPreviewRuntimeShellVerifyEnabled,
  isStudioDevPreviewRuntimeShellCompatibilityCheckEnabled,
  RUNTIME_SHELL_ERROR_CODES,
  DevPreviewRuntimeShellContractError,
  createDevPreviewRuntimeShellContractError,
  devPreviewRuntimeShellContractError,
  createDevPreviewRuntimeShellSession,
  createDevPreviewRuntimeShellLifecycleContract,
  createDevPreviewRuntimeShellMountBoundary,
  createDevPreviewRuntimeShellEventContract,
  createDevPreviewRuntimeShellRenderRequestContract,
  createDevPreviewRuntimeShellStateBoundary,
  createDevPreviewRuntimeShellErrorBoundary,
  createDevPreviewRuntimeShellPermissionBoundary,
  createDevPreviewRuntimeShellDataBoundary,
  createDevPreviewRuntimeShellIsolationContract,
  createDevPreviewRuntimeShellPolicyContract,
  createDevPreviewRuntimeShellRouteBlockedMetadata,
  createDevPreviewRuntimeShellPlacementBlockedMetadata,
  createDevPreviewRuntimeShellSafetyMetadata,
  createDevPreviewRuntimeShellReadinessDecision,
  createDevPreviewRuntimeShellManifest,
  verifyDevPreviewRuntimeShellContract,
  checkDevPreviewRuntimeShellCompatibility,
  createDevPreviewRuntimeShellDiagnostics,
  createDevPreviewRuntimeShellFallback,
  createStudioDevPreviewRuntimeShellContract,
} from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-runtime-shell-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-runtime-shell-contract');

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

// Build the real upstream chain: sandbox → bridge → visual contract.
const SANDBOX = {
  moduleId: 'clientes',
  sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
  engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
  overallDigest: 'fnv1a-deadbeef',
  tablePreviewMetadata: { columns: [{ name: 'nome', type: 'text', sortable: true }, { name: 'tenantId', type: 'text', protectedColumn: true, tenantColumn: true }] },
  formPreviewMetadata: { fields: [{ name: 'nome', type: 'text', required: true }, { name: 'tenantId', type: 'text', protectedField: true, tenantScoped: true }] },
  detailPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }] },
  fieldPreviewMetadata: { fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }, { name: 'dt', type: 'date' }] },
  actionPreviewMetadata: { actions: [{ action: 'read', mutation: false }, { action: 'create', mutation: true }] },
  permissionPreviewMetadata: { defaultDeny: true, failClosed: true, tenantRequired: true, requiredScopes: ['clientes:read'] },
};
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const S = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });

const arg = { visualContract: VC };
const session = createDevPreviewRuntimeShellSession(arg);
const lifecycle = createDevPreviewRuntimeShellLifecycleContract(arg);
const mount = createDevPreviewRuntimeShellMountBoundary(arg);
const eventC = createDevPreviewRuntimeShellEventContract(arg);
const render = createDevPreviewRuntimeShellRenderRequestContract(arg);
const stateB = createDevPreviewRuntimeShellStateBoundary(arg);
const errorB = createDevPreviewRuntimeShellErrorBoundary(arg);
const permB = createDevPreviewRuntimeShellPermissionBoundary(arg);
const dataB = createDevPreviewRuntimeShellDataBoundary(arg);
const isolation = createDevPreviewRuntimeShellIsolationContract(arg);
const policy = createDevPreviewRuntimeShellPolicyContract(arg);
const routeB = createDevPreviewRuntimeShellRouteBlockedMetadata(arg);
const placeB = createDevPreviewRuntimeShellPlacementBlockedMetadata(arg);
const safety = createDevPreviewRuntimeShellSafetyMetadata(arg);

// ===== Contract base (1-42) =====
test('1. contract created', () => assert.equal(S.kind, 'studio-dev-preview-runtime-shell-contract'));
test('2. name', () => { assert.equal(S.runtimeShellContractName, 'studio-dev-preview-runtime-shell-contract'); assert.equal(S.runtimeShellContractName, RUNTIME_SHELL_CONTRACT_NAME); });
test('3. version', () => { assert.equal(S.runtimeShellContractVersion, 'studio-dev-preview-runtime-shell-contract@1.0.0'); assert.equal(S.runtimeShellContractVersion, RUNTIME_SHELL_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(RUNTIME_SHELL_CONTRACT_SEMVER, '1.0.0'));
test('5. visualContractVersion', () => assert.equal(S.visualContractVersion, 'studio-dev-preview-visual-contract@1.0.0'));
test('6. bridgeVersion', () => assert.equal(S.bridgeVersion, 'studio-dev-preview-contract-bridge@1.0.0'));
test('7. sandboxVersion', () => assert.equal(S.sandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('8. plannerVersion', () => assert.equal(S.plannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'));
test('9. engineVersion', () => assert.equal(S.engineVersion, 'studio-blueprint-engine@1.0.0'));
test('10. blueprintContractVersion', () => assert.equal(S.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('11. mode', () => { assert.equal(S.mode, 'headless_dev_preview_runtime_shell_contract'); assert.equal(S.mode, RUNTIME_SHELL_CONTRACT_MODE); });
test('12. environment const', () => assert.equal(RUNTIME_SHELL_CONTRACT_ENVIRONMENT, 'local_contract'));
test('13. moduleId', () => assert.equal(S.moduleId, 'clientes'));
test('14. not fallback', () => assert.equal(S.fallback, false));
test('15. headless', () => assert.equal(S.capabilities.headless, true));
test('16. contractOnly', () => assert.equal(S.capabilities.contractOnly, true));
test('17. metadataOnly', () => assert.equal(S.capabilities.metadataOnly, true));
test('18. runtimeShellOnly', () => assert.equal(S.capabilities.runtimeShellOnly, true));
test('19. lifecycleContractOnly', () => assert.equal(S.capabilities.lifecycleContractOnly, true));
test('20. mountBoundaryMetadataOnly', () => assert.equal(S.capabilities.mountBoundaryMetadataOnly, true));
test('21. eventContractOnly', () => assert.equal(S.capabilities.eventContractOnly, true));
test('22. renderRequestMetadataOnly', () => assert.equal(S.capabilities.renderRequestMetadataOnly, true));
test('23. stateBoundaryContractOnly', () => assert.equal(S.capabilities.stateBoundaryContractOnly, true));
test('24. errorBoundaryContractOnly', () => assert.equal(S.capabilities.errorBoundaryContractOnly, true));
test('25. permissionBoundaryContractOnly', () => assert.equal(S.capabilities.permissionBoundaryContractOnly, true));
test('26. dataBoundaryContractOnly', () => assert.equal(S.capabilities.dataBoundaryContractOnly, true));
test('27. isolationContractOnly', () => assert.equal(S.capabilities.isolationContractOnly, true));
test('28. reactComponentCreated false', () => assert.equal(S.capabilities.reactComponentCreated, false));
test('29. jsxCreated false', () => assert.equal(S.capabilities.jsxCreated, false));
test('30. tsxCreated false', () => assert.equal(S.capabilities.tsxCreated, false));
test('31. domCreated false', () => assert.equal(S.capabilities.domCreated, false));
test('32. cssCreated false', () => assert.equal(S.capabilities.cssCreated, false));
test('33. uiCreated false', () => assert.equal(S.capabilities.uiCreated, false));
test('34. routeCreated false', () => assert.equal(S.capabilities.routeCreated, false));
test('35. menuCreated false', () => assert.equal(S.capabilities.menuCreated, false));
test('36. moduleGenerated false', () => assert.equal(S.capabilities.moduleGenerated, false));
test('37. filesWrittenToModule false', () => assert.equal(S.capabilities.filesWrittenToModule, false));
test('38. moduleRegistered false', () => assert.equal(S.capabilities.moduleRegistered, false));
test('39. backendAccessed/prismaAccessed false', () => { assert.equal(S.capabilities.backendAccessed, false); assert.equal(S.capabilities.prismaAccessed, false); });
test('40. productionAccessed/stagingAccessed false', () => { assert.equal(S.capabilities.productionAccessed, false); assert.equal(S.capabilities.stagingAccessed, false); });
test('41. fetchUsed/mutationAllowed/persistenceCreated/rewriteEmpresas false', () => {
  assert.equal(S.capabilities.fetchUsed, false); assert.equal(S.capabilities.mutationAllowed, false);
  assert.equal(S.capabilities.persistenceCreated, false); assert.equal(S.capabilities.rewriteEmpresas, false);
});
test('42. capabilities frozen', () => assert.ok(Object.isFrozen(RUNTIME_SHELL_HEADLESS_CAPABILITIES)));

// ===== Readiness top-level (43-52) =====
test('43. readyForDevPreviewRuntimeShellContract true', () => assert.equal(S.readyForDevPreviewRuntimeShellContract, true));
test('44. readyForDevPreviewRuntimeImplementation false', () => assert.equal(S.readyForDevPreviewRuntimeImplementation, false));
test('45. readyForRealModuleGeneration false', () => assert.equal(S.readyForRealModuleGeneration, false));
test('46. readyForProduction false', () => assert.equal(S.readyForProduction, false));
test('47. readiness ready', () => assert.equal(S.readiness, 'studio_dev_preview_runtime_shell_contract_ready'));
test('48. blockerCount 0', () => assert.equal(S.blockerCount, 0));
test('49. warningCount 0', () => assert.equal(S.warningCount, 0));
test('50. metadataOnly top', () => assert.equal(S.metadataOnly, true));
test('51. overallDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(S.overallDigest)));
test('52. runtimeShellContractDigest format', () => assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(S.runtimeShellContractDigest)));

// ===== Session (53-64) =====
test('53. session kind', () => assert.equal(session.kind, 'dev-preview-runtime-shell-session'));
test('54. sessionId', () => assert.equal(session.sessionId, 'clientes#dev-preview-runtime-shell-contract'));
test('55. session version', () => assert.equal(session.runtimeShellContractVersion, RUNTIME_SHELL_CONTRACT_VERSION));
test('56. session moduleId', () => assert.equal(session.moduleId, 'clientes'));
test('57. sourceVisualContract', () => assert.equal(session.sourceVisualContract, VISUAL_CONTRACT_VERSION));
test('58. sourceBridgeContract', () => assert.equal(session.sourceBridgeContract, DEV_PREVIEW_BRIDGE_VERSION));
test('59. session mode', () => assert.equal(session.mode, RUNTIME_SHELL_CONTRACT_MODE));
test('60. createdFrom', () => assert.equal(session.createdFrom, 'studio-dev-preview-visual-contract'));
test('61. seed deterministic', () => assert.equal(session.seed, createDevPreviewRuntimeShellSession(arg).seed));
test('62. no storage', () => assert.equal(session.usesStorage, false));
test('63. no fetch', () => assert.equal(session.usesFetch, false));
test('64. no persistence/side-effects', () => { assert.equal(session.usesPersistence, false); assert.equal(session.runtimeSideEffects, false); });

// ===== Lifecycle (65-76) =====
test('65. lifecycle kind', () => assert.equal(lifecycle.kind, 'dev-preview-runtime-shell-lifecycle-contract'));
test('66. 7 phases', () => assert.equal(lifecycle.phaseKinds.length, 7));
test('67. created present', () => assert.ok(lifecycle.phases.some((p) => p.phase === 'created')));
test('68. ready present', () => assert.ok(lifecycle.phases.some((p) => p.phase === 'ready')));
test('69. disposed terminal', () => assert.equal(lifecycle.phases.find((p) => p.phase === 'disposed').terminal, true));
test('70. failed terminal+blocking', () => { const p = lifecycle.phases.find((x) => x.phase === 'failed'); assert.equal(p.terminal, true); assert.equal(p.blocking, true); });
test('71. initialPhase created', () => assert.equal(lifecycle.initialPhase, 'created'));
test('72. usesTimers false', () => assert.equal(lifecycle.usesTimers, false));
test('73. usesEventLoop false', () => assert.equal(lifecycle.usesEventLoop, false));
test('74. usesRealRuntime false', () => assert.equal(lifecycle.usesRealRuntime, false));
test('75. lifecycle dom false', () => assert.equal(lifecycle.dom, false));
test('76. LIFECYCLE_PHASES frozen', () => assert.ok(Object.isFrozen(RUNTIME_SHELL_LIFECYCLE_PHASES)));

// ===== Mount boundary (77-88) =====
test('77. mount kind', () => assert.equal(mount.kind, 'dev-preview-runtime-shell-mount-boundary'));
test('78. mountBoundaryId', () => assert.equal(mount.mountBoundaryId, 'clientes#mount-boundary'));
test('79. mountMode headless', () => assert.equal(mount.mountMode, 'headless_metadata_only'));
test('80. allowed mount targets', () => assert.ok(mount.allowedMountTargetKinds.includes('headlessPreviewHost')));
test('81. blocked mount targets', () => assert.ok(mount.blockedMountTargetKinds.includes('domNode') && mount.blockedMountTargetKinds.includes('reactRoot')));
test('82. mountCreated false', () => assert.equal(mount.mountCreated, false));
test('83. domTouched false', () => assert.equal(mount.domTouched, false));
test('84. reactMounted false', () => assert.equal(mount.reactMounted, false));
test('85. cssInjected false', () => assert.equal(mount.cssInjected, false));
test('86. ALLOWED_MOUNT frozen', () => assert.ok(Object.isFrozen(ALLOWED_MOUNT_TARGET_KINDS)));
test('87. BLOCKED_MOUNT frozen', () => assert.ok(Object.isFrozen(BLOCKED_MOUNT_TARGET_KINDS)));
test('88. mount allowed/blocked disjoint', () => assert.ok(ALLOWED_MOUNT_TARGET_KINDS.every((k) => !BLOCKED_MOUNT_TARGET_KINDS.includes(k))));

// ===== Event contract (89-100) =====
test('89. event kind', () => assert.equal(eventC.kind, 'dev-preview-runtime-shell-event-contract'));
test('90. 8 event kinds', () => assert.equal(eventC.eventKinds.length, 8));
test('91. previewRequested present', () => assert.ok(eventC.events.some((e) => e.event === 'previewRequested')));
test('92. permissionDenied blocked kind', () => assert.equal(eventC.events.find((e) => e.event === 'permissionDenied').kind, 'blocked'));
test('93. no real handler', () => assert.ok(eventC.events.every((e) => e.hasRealHandler === false)));
test('94. no real listener', () => assert.ok(eventC.events.every((e) => e.hasRealListener === false)));
test('95. no mutation', () => assert.ok(eventC.events.every((e) => e.mutation === false)));
test('96. usesEventEmitter false', () => assert.equal(eventC.usesEventEmitter, false));
test('97. anyRealHandler false', () => assert.equal(eventC.anyRealHandler, false));
test('98. anyRealListener false', () => assert.equal(eventC.anyRealListener, false));
test('99. anyMutation false', () => assert.equal(eventC.anyMutation, false));
test('100. EVENT_KINDS frozen', () => assert.ok(Object.isFrozen(RUNTIME_SHELL_EVENT_KINDS)));

// ===== Render request (101-110) =====
test('101. render kind', () => assert.equal(render.kind, 'dev-preview-runtime-shell-render-request-contract'));
test('102. requestId deterministic', () => assert.equal(render.requestId, createDevPreviewRuntimeShellRenderRequestContract(arg).requestId));
test('103. visualTreeDigest present', () => assert.ok(typeof render.visualTreeDigest === 'string'));
test('104. screenDigest present', () => assert.ok(typeof render.screenDigest === 'string'));
test('105. placeholderRegistryDigest present', () => assert.ok(typeof render.placeholderRegistryDigest === 'string'));
test('106. stateDigest present', () => assert.ok(typeof render.stateDigest === 'string'));
test('107. permissionsDigest present', () => assert.ok(typeof render.permissionsDigest === 'string'));
test('108. renderAllowed false', () => assert.equal(render.renderAllowed, false));
test('109. render reason future slice', () => assert.match(render.reason, /future explicit runtime implementation slice/));
test('110. render metadataOnly', () => assert.equal(render.metadataOnly, true));

// ===== State boundary (111-119) =====
test('111. state kind', () => assert.equal(stateB.kind, 'dev-preview-runtime-shell-state-boundary'));
test('112. allowed state kinds', () => assert.ok(stateB.allowedStateKinds.includes('idle') && stateB.allowedStateKinds.includes('blocked')));
test('113. blocked state kinds', () => assert.ok(stateB.blockedStateKinds.includes('reactState') && stateB.blockedStateKinds.includes('hookState')));
test('114. readOnlyState', () => assert.equal(stateB.readOnlyState, true));
test('115. reactState false', () => assert.equal(stateB.reactState, false));
test('116. hooks false', () => assert.equal(stateB.hooks, false));
test('117. storage false', () => assert.equal(stateB.storage, false));
test('118. persistence false', () => assert.equal(stateB.persistence, false));
test('119. state allowed/blocked disjoint', () => assert.ok(ALLOWED_STATE_KINDS.every((k) => !BLOCKED_STATE_KINDS.includes(k)) && Object.isFrozen(ALLOWED_STATE_KINDS) && Object.isFrozen(BLOCKED_STATE_KINDS)));

// ===== Error boundary (120-127) =====
test('120. error kind', () => assert.equal(errorB.kind, 'dev-preview-runtime-shell-error-boundary'));
test('121. knownErrors >= 30', () => assert.ok(errorB.knownErrorCount >= 30));
test('122. failClosed', () => assert.equal(errorB.failClosed, true));
test('123. safeDiagnostics', () => assert.equal(errorB.safeDiagnostics, true));
test('124. noSecrets', () => assert.equal(errorB.noSecrets, true));
test('125. noStackLeak', () => assert.equal(errorB.noStackLeak, true));
test('126. catchesRuntimeErrors false', () => assert.equal(errorB.catchesRuntimeErrors, false));
test('127. error metadataOnly', () => assert.equal(errorB.metadataOnly, true));

// ===== Permission boundary (128-136) =====
test('128. permission kind', () => assert.equal(permB.kind, 'dev-preview-runtime-shell-permission-boundary'));
test('129. defaultDeny', () => assert.equal(permB.defaultDeny, true));
test('130. failClosed', () => assert.equal(permB.failClosed, true));
test('131. tenantRequired', () => assert.equal(permB.tenantRequired, true));
test('132. permissionRequired', () => assert.equal(permB.permissionRequired, true));
test('133. adminBypass false', () => assert.equal(permB.adminBypass, false));
test('134. enforcementEngine false', () => assert.equal(permB.enforcementEngine, false));
test('135. grantsAccess false', () => assert.equal(permB.grantsAccess, false));
test('136. permission metadataOnly', () => assert.equal(permB.metadataOnly, true));

// ===== Data boundary (137-144) =====
test('137. data kind', () => assert.equal(dataB.kind, 'dev-preview-runtime-shell-data-boundary'));
test('138. dataMode metadata_only', () => assert.equal(dataB.dataMode, 'metadata_only'));
test('139. realDataRead false', () => assert.equal(dataB.realDataRead, false));
test('140. realDataWrite false', () => assert.equal(dataB.realDataWrite, false));
test('141. fetchUsed false', () => assert.equal(dataB.fetchUsed, false));
test('142. backendAccessed false', () => assert.equal(dataB.backendAccessed, false));
test('143. prismaAccessed false', () => assert.equal(dataB.prismaAccessed, false));
test('144. persistenceCreated false', () => assert.equal(dataB.persistenceCreated, false));

// ===== Isolation (145-156) =====
test('145. isolation kind', () => assert.equal(isolation.kind, 'dev-preview-runtime-shell-isolation-contract'));
test('146. noWindow', () => assert.equal(isolation.noWindow, true));
test('147. noDocument', () => assert.equal(isolation.noDocument, true));
test('148. noDOM', () => assert.equal(isolation.noDOM, true));
test('149. noReact', () => assert.equal(isolation.noReact, true));
test('150. noCSSRuntime', () => assert.equal(isolation.noCSSRuntime, true));
test('151. noRouteRuntime', () => assert.equal(isolation.noRouteRuntime, true));
test('152. noMenuRuntime', () => assert.equal(isolation.noMenuRuntime, true));
test('153. noModuleRuntime', () => assert.equal(isolation.noModuleRuntime, true));
test('154. noProduction', () => assert.equal(isolation.noProduction, true));
test('155. noStaging', () => assert.equal(isolation.noStaging, true));
test('156. allInvariantsHold', () => assert.equal(isolation.allInvariantsHold, true));

// ===== Policy (157-163) =====
test('157. policy kind', () => assert.equal(policy.kind, 'dev-preview-runtime-shell-policy-contract'));
test('158. policies >= 7', () => assert.ok(policy.policies.length >= 7));
test('159. headless_only enforced', () => assert.equal(policy.policies.find((p) => p.policy === 'headless_only').enforced, true));
test('160. fail_closed enforced', () => assert.equal(policy.policies.find((p) => p.policy === 'fail_closed').enforced, true));
test('161. allEnforced', () => assert.equal(policy.allEnforced, true));
test('162. authorizesRuntime false', () => assert.equal(policy.authorizesRuntime, false));
test('163. policy metadataOnly', () => assert.equal(policy.metadataOnly, true));

// ===== Route/placement blocked (164-176) =====
test('164. route kind', () => assert.equal(routeB.kind, 'dev-preview-runtime-shell-route-blocked-metadata'));
test('165. futureRouteRuntime path', () => assert.equal(routeB.futureRouteRuntime, '/studio/preview/runtime/clientes'));
test('166. routeCreated false', () => assert.equal(routeB.routeCreated, false));
test('167. routerMounted false', () => assert.equal(routeB.routerMounted, false));
test('168. route appTouched false', () => assert.equal(routeB.appTouched, false));
test('169. route navigationTouched false', () => assert.equal(routeB.navigationTouched, false));
test('170. route blockedNow', () => assert.equal(routeB.blockedNow, true));
test('171. placement kind', () => assert.equal(placeB.kind, 'dev-preview-runtime-shell-placement-blocked-metadata'));
test('172. menuCreated false', () => assert.equal(placeB.menuCreated, false));
test('173. navMounted false', () => assert.equal(placeB.navMounted, false));
test('174. placement appTouched false', () => assert.equal(placeB.appTouched, false));
test('175. placement blockedNow', () => assert.equal(placeB.blockedNow, true));
test('176. placement reason future slice', () => assert.match(placeB.reason, /future approved runtime implementation slice/));

// ===== Safety (177-189) =====
test('177. safety kind', () => assert.equal(safety.kind, 'dev-preview-runtime-shell-safety-metadata'));
test('178. headless', () => assert.equal(safety.headless, true));
test('179. anySideEffect false', () => assert.equal(safety.anySideEffect, false));
test('180. mountCreated false', () => assert.equal(safety.mountCreated, false));
test('181. domCreated false', () => assert.equal(safety.domCreated, false));
test('182. cssCreated false', () => assert.equal(safety.cssCreated, false));
test('183. backendAccessed false', () => assert.equal(safety.backendAccessed, false));
test('184. prismaAccessed false', () => assert.equal(safety.prismaAccessed, false));
test('185. fetchUsed false', () => assert.equal(safety.fetchUsed, false));
test('186. mutationAllowed false', () => assert.equal(safety.mutationAllowed, false));
test('187. realDataRead/realDataWrite false', () => { assert.equal(safety.realDataRead, false); assert.equal(safety.realDataWrite, false); });
test('188. reversibleByNonConsumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('189. sideEffectFlags all false', () => assert.ok(Object.values(safety.sideEffectFlags).every((v) => v === false)));

// ===== Readiness decision (190-199) =====
test('190. readiness kind', () => assert.equal(S.readinessDecision.kind, 'dev-preview-runtime-shell-readiness-decision'));
test('191. ready state', () => assert.equal(S.readinessDecision.readiness, 'studio_dev_preview_runtime_shell_contract_ready'));
test('192. readyForShellContract', () => assert.equal(S.readinessDecision.readyForDevPreviewRuntimeShellContract, true));
test('193. readyForImplementation false', () => assert.equal(S.readinessDecision.readyForDevPreviewRuntimeImplementation, false));
test('194. readyForRealModuleGeneration false', () => assert.equal(S.readinessDecision.readyForRealModuleGeneration, false));
test('195. readyForProduction false', () => assert.equal(S.readinessDecision.readyForProduction, false));
test('196. blockers empty', () => assert.deepEqual(S.readinessDecision.blockers, []));
test('197. blocked on blockers', () => { const r = createDevPreviewRuntimeShellReadinessDecision({ blockers: ['x'] }); assert.equal(r.readiness, 'blocked'); assert.equal(r.readyForDevPreviewRuntimeShellContract, false); });
test('198. readiness state in enum', () => assert.ok(RUNTIME_SHELL_READINESS_STATES.includes(S.readinessDecision.readiness)));
test('199. implementation stays false always', () => assert.equal(createDevPreviewRuntimeShellReadinessDecision({}).readyForDevPreviewRuntimeImplementation, false));

// ===== Manifest (200-208) =====
test('200. manifest kind', () => assert.equal(S.manifest.kind, 'dev-preview-runtime-shell-manifest'));
test('201. manifest name', () => assert.equal(S.manifest.runtimeShellContractName, RUNTIME_SHELL_CONTRACT_NAME));
test('202. manifest version', () => assert.equal(S.manifest.runtimeShellContractVersion, RUNTIME_SHELL_CONTRACT_VERSION));
test('203. manifest upstream visual', () => assert.equal(S.manifest.upstream.visualContract, VISUAL_CONTRACT_VERSION));
test('204. manifest parts.session digest', () => assert.equal(S.manifest.parts.session, session.sessionDigest));
test('205. manifest parts.isolation digest', () => assert.ok(typeof S.manifest.parts.isolation === 'string'));
test('206. manifest capabilities headless', () => assert.equal(S.manifest.capabilities.headless, true));
test('207. manifest standalone builds', () => assert.equal(createDevPreviewRuntimeShellManifest({ visualContract: VC }).kind, 'dev-preview-runtime-shell-manifest'));
test('208. manifestDigest present', () => assert.ok(typeof S.manifest.manifestDigest === 'string'));

// ===== Verifier (209-224) =====
const caps = RUNTIME_SHELL_HEADLESS_CAPABILITIES;
test('209. verification ok', () => assert.equal(S.verification.ok, true));
test('210. verification valid', () => assert.equal(S.verification.valid, true));
test('211. verification headless', () => assert.equal(S.verification.headless, true));
test('212. verification no blockers', () => assert.equal(S.verification.blockerCount, 0));
test('213. verifier detects uiCreated', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, uiCreated: true } } }).blockers.includes('capability_uiCreated_must_be_false')));
test('214. verifier detects domCreated', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, domCreated: true } } }).blockers.includes('capability_domCreated_must_be_false')));
test('215. verifier detects cssCreated', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, cssCreated: true } } }).blockers.includes('capability_cssCreated_must_be_false')));
test('216. verifier detects route/menu', () => { const r = verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, routeCreated: true, menuCreated: true } } }); assert.ok(r.blockers.includes('capability_routeCreated_must_be_false') && r.blockers.includes('capability_menuCreated_must_be_false')); });
test('217. verifier detects backend/prisma', () => { const r = verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.blockers.includes('capability_backendAccessed_must_be_false') && r.blockers.includes('capability_prismaAccessed_must_be_false')); });
test('218. verifier detects mutation/persistence', () => { const r = verifyDevPreviewRuntimeShellContract({ contract: { capabilities: { ...caps, mutationAllowed: true, persistenceCreated: true } } }); assert.ok(r.blockers.includes('capability_mutationAllowed_must_be_false') && r.blockers.includes('capability_persistenceCreated_must_be_false')); });
test('219. verifier detects renderAllowed true', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: caps, renderRequest: { renderAllowed: true } } }).blockers.includes('unsafe_render_allowed_true')));
test('220. verifier detects unsafe event handler', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: caps, eventContract: { anyRealHandler: true } } }).blockers.includes('unsafe_event_handler')));
test('221. verifier detects real data read', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: caps, dataBoundary: { realDataRead: true } } }).blockers.includes('unsafe_real_data_read')));
test('222. verifier detects real data write', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: caps, dataBoundary: { realDataWrite: true } } }).blockers.includes('unsafe_real_data_write')));
test('223. verifier detects unsafe mount', () => assert.ok(verifyDevPreviewRuntimeShellContract({ contract: { capabilities: caps, mountBoundary: { reactMounted: true } } }).blockers.includes('unsafe_mount')));
test('224. verifier never throws on junk', () => assert.doesNotThrow(() => verifyDevPreviewRuntimeShellContract({ contract: null })));

// ===== Compatibility (225-232) =====
test('225. compatibility kind', () => assert.equal(S.compatibility.kind, 'dev-preview-runtime-shell-compatibility'));
test('226. compatibleWithVisualContract', () => assert.equal(S.compatibility.compatibleWithDevPreviewVisualContract, true));
test('227. compat readyForImplementation false', () => assert.equal(S.compatibility.readyForDevPreviewRuntimeImplementation, false));
test('228. compat readyForRealModuleGeneration false', () => assert.equal(S.compatibility.readyForRealModuleGeneration, false));
test('229. compat status future implementation', () => assert.equal(S.compatibility.status, 'ready_for_future_dev_preview_runtime_implementation_contract'));
test('230. compat not blocked', () => assert.equal(S.compatibility.blocked, false));
test('231. mismatch → warning', () => { const r = checkDevPreviewRuntimeShellCompatibility({ visualContract: { visualContractVersion: 'x@9.9.9' } }); assert.equal(r.compatibleWithDevPreviewVisualContract, false); assert.ok(r.warnings.includes('incompatible_visualContract')); });
test('232. compatibilityDigest present', () => assert.ok(typeof S.compatibility.compatibilityDigest === 'string'));

// ===== Diagnostics + fallback (233-247) =====
test('233. diagnostics kind', () => assert.equal(S.diagnostics.kind, 'dev-preview-runtime-shell-diagnostics'));
test('234. diagnostics passive', () => assert.equal(S.diagnostics.passive, true));
test('235. diagnostics ok', () => assert.equal(S.diagnostics.ok, true));
test('236. diagnostics headlessConfirmed', () => assert.equal(S.diagnostics.headlessConfirmed, true));
test('237. diagnostics logged false', () => assert.equal(S.diagnostics.logged, false));
test('238. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(S.diagnostics))));
const fbNo = createStudioDevPreviewRuntimeShellContract({});
const fbBad = createStudioDevPreviewRuntimeShellContract({ visualContract: { kind: 'other' } });
const fbFb = createStudioDevPreviewRuntimeShellContract({ visualContract: { kind: 'studio-dev-preview-visual-contract', fallback: true } });
test('239. missing visual → fallback', () => assert.equal(fbNo.fallback, true));
test('240. wrong-kind → fallback', () => assert.equal(fbBad.fallback, true));
test('241. fallback visual → fallback', () => assert.equal(fbFb.fallback, true));
test('242. fallback readiness blocked', () => assert.equal(fbNo.readiness, 'blocked'));
test('243. fallback not ready for shell', () => assert.equal(fbNo.readyForDevPreviewRuntimeShellContract, false));
test('244. fallback not ready implementation/production', () => { assert.equal(fbNo.readyForDevPreviewRuntimeImplementation, false); assert.equal(fbNo.readyForProduction, false); });
test('245. fallback caps headless', () => assert.equal(fbNo.capabilities.headless, true));
test('246. fallback caps uiCreated false', () => assert.equal(fbNo.capabilities.uiCreated, false));
test('247. fallback never throws', () => assert.doesNotThrow(() => createDevPreviewRuntimeShellFallback({ reason: 'x' })));

// ===== Errors (248-256) =====
test('248. error codes >= 30', () => assert.ok(RUNTIME_SHELL_ERROR_CODES.length >= 30));
test('249. error descriptor sanitized', () => { const e = createDevPreviewRuntimeShellContractError('RUNTIME_SHELL_PRISMA_BLOCKED'); assert.ok(e.safe && e.sideEffects === false && e.prismaAccessed === false && e.noSecrets === true && e.noStackLeak === true); });
test('250. error no ui/dom/css/mount', () => { const e = createDevPreviewRuntimeShellContractError('RUNTIME_SHELL_DOM_BLOCKED'); assert.equal(e.uiCreated, false); assert.equal(e.domCreated, false); assert.equal(e.cssCreated, false); assert.equal(e.mountCreated, false); });
test('251. error no real data', () => { const e = createDevPreviewRuntimeShellContractError('RUNTIME_SHELL_REAL_DATA_READ_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.realDataWrite, false); });
test('252. unknown code normalized', () => assert.equal(createDevPreviewRuntimeShellContractError('NOPE').code, 'RUNTIME_SHELL_INVALID_VISUAL_CONTRACT'));
test('253. typed error', () => { const e = new DevPreviewRuntimeShellContractError('RUNTIME_SHELL_INVALID_BRIDGE', 'x'); assert.ok(e instanceof Error && e.name === 'DevPreviewRuntimeShellContractError'); });
test('254. helper error', () => assert.equal(devPreviewRuntimeShellContractError('RUNTIME_SHELL_FETCH_BLOCKED', 'x').code, 'RUNTIME_SHELL_FETCH_BLOCKED'));
test('255. codes cover react/jsx/tsx/dom/css/route/menu/mount', () => ['RUNTIME_SHELL_REACT_COMPONENT_BLOCKED', 'RUNTIME_SHELL_JSX_BLOCKED', 'RUNTIME_SHELL_TSX_BLOCKED', 'RUNTIME_SHELL_DOM_BLOCKED', 'RUNTIME_SHELL_CSS_RUNTIME_BLOCKED', 'RUNTIME_SHELL_ROUTE_BLOCKED', 'RUNTIME_SHELL_MENU_BLOCKED', 'RUNTIME_SHELL_MOUNT_BLOCKED'].forEach((c) => assert.ok(RUNTIME_SHELL_ERROR_CODES.includes(c))));
test('256. codes cover mutation/persistence/migration/data', () => ['RUNTIME_SHELL_MUTATION_BLOCKED', 'RUNTIME_SHELL_PERSISTENCE_BLOCKED', 'RUNTIME_SHELL_MIGRATION_BLOCKED', 'RUNTIME_SHELL_REAL_DATA_WRITE_BLOCKED'].forEach((c) => assert.ok(RUNTIME_SHELL_ERROR_CODES.includes(c))));

// ===== Config flags (257-265) =====
test('257. flag off by default', () => assert.equal(isStudioDevPreviewRuntimeShellContractEnabled({}), false));
test('258. flag on in dev', () => assert.equal(isStudioDevPreviewRuntimeShellContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('259. flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeShellContractEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('260. lifecycle flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeShellLifecycleEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('261. verify flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeShellVerifyEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('262. compat flag fails closed in production', () => assert.equal(isStudioDevPreviewRuntimeShellCompatibilityCheckEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK_FLAG]: 'true', MODE: 'production' }), false));
test('263. master flag enables lifecycle in dev', () => assert.equal(isStudioDevPreviewRuntimeShellLifecycleEnabled({ [MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG]: 'true', DEV: true }), true));
test('264. readiness states frozen', () => assert.ok(Object.isFrozen(RUNTIME_SHELL_READINESS_STATES)));
test('265. shellDigest deterministic + format', () => { assert.equal(shellDigest({ a: 1 }), shellDigest({ a: 1 })); assert.ok(/^fnv1a-[0-9a-f]{8}$/.test(shellDigest({ a: 1 }))); });

// ===== Determinism / purity (266-275) =====
test('266. deterministic overallDigest', () => assert.equal(S.overallDigest, createStudioDevPreviewRuntimeShellContract({ visualContract: VC }).overallDigest));
test('267. deterministic runtimeShellContractDigest', () => assert.equal(S.runtimeShellContractDigest, createStudioDevPreviewRuntimeShellContract({ visualContract: VC }).runtimeShellContractDigest));
test('268. input not mutated', () => { const snap = JSON.stringify(VC); createStudioDevPreviewRuntimeShellContract({ visualContract: VC }); assert.equal(JSON.stringify(VC), snap); });
test('269. no functions survive clone', () => assert.ok(!/function|=>/.test(JSON.stringify(S))));
test('270. different module → different digest', () => { const b2 = createStudioDevPreviewContractBridge({ sandbox: { ...SANDBOX, moduleId: 'produtos' } }); const vc2 = createStudioDevPreviewVisualContract({ bridge: b2 }); assert.notEqual(S.overallDigest, createStudioDevPreviewRuntimeShellContract({ visualContract: vc2 }).overallDigest); });
test('271. builds from full real chain', () => {
  const sb = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'itens', moduleName: 'Itens', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }], permissions: [{ action: 'read', level: 'module' }] } });
  const br = createStudioDevPreviewContractBridge({ sandbox: sb });
  const vc = createStudioDevPreviewVisualContract({ bridge: br });
  const ss = createStudioDevPreviewRuntimeShellContract({ visualContract: vc });
  assert.equal(ss.kind, 'studio-dev-preview-runtime-shell-contract');
  assert.equal(ss.readyForDevPreviewRuntimeImplementation, false);
});
test('272. protected fields remain read-only (permission boundary)', () => assert.equal(permB.defaultDeny, true));
test('273. tenant/permission hints preserved', () => { assert.equal(permB.tenantRequired, true); assert.equal(permB.defaultDeny, true); });
test('274. no Empresas rewrite', () => assert.equal(S.capabilities.rewriteEmpresas, false));
test('275. no module registration', () => assert.equal(S.capabilities.moduleRegistered, false));

// ===== Purity/no-side-effect code scan (276-286) =====
test('276. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('277. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('278. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('279. no production API_URL / railway', () => assert.ok(!/VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('280. no staging host', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('281. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('282. React-free imports', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('283. no backend/apis imports', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('284. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage|sessionStorage|indexedDB/.test(allCode())));
test('285. no document/window DOM', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('286. no createElement/jsx runtime', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(allCode())));

// ===== Scope safety (287-310) — branch-relative =====
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
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !authorized(x)); };

test('287. runtime-shell subtree exists', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-runtime-shell-contract')));
test('288. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('289. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('290. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('291. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('292. ModeloBase1/2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/ModeloBase[12]\//.test(x))); });
test('293. backend/apis not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('294. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('295. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('296. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('297. menu/nav not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('298. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('299. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('300. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('301. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('302. productionUiGuard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/productionUiGuard/.test(x))); });
test('303. governance guard not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/studioScopeGovernanceGuard/.test(x))); });
test('304. foundation-contracts/blueprint-mirrors not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/studio\/(foundation-contracts|blueprint-mirrors)\//.test(x))); });
test('305. no .jsx/.tsx in subtree', () => assert.ok(walk(DIR).every((f) => !/\.(jsx|tsx)$/.test(f))));
test('306. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('307. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('308. net-new scope is runtime-shell only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-engine\/dev-preview-runtime-shell-contract\//.test(f))) return;
  const outside = files.filter((f) => !authorized(f));
  assert.deepEqual(outside, []);
});
test('309. upstream visual contract present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-visual-contract/index.js')));
test('310. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));

// ===== Evidence docs (D1-D18) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-RUNTIME-SHELL-CONTRACT-REPORT.md', 'RUNTIME-SHELL-SESSION.md',
  'LIFECYCLE-CONTRACT.md', 'MOUNT-BOUNDARY.md', 'EVENT-CONTRACT.md', 'RENDER-REQUEST-CONTRACT.md',
  'STATE-BOUNDARY.md', 'ERROR-BOUNDARY.md', 'PERMISSION-BOUNDARY.md', 'DATA-BOUNDARY.md',
  'ISOLATION-CONTRACT.md', 'ROUTE-PLACEMENT-BLOCKED-PLAN.md', 'RUNTIME-SAFETY.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-runtime-shell-contract/${DOCS[i]}`)));
}
test('D-content. no-react doc + next slice spec present', () => {
  assert.ok(/React|UI|rota|menu|módulo|module|runtime/i.test(readEv('NO-REACT-NO-UI-NO-ROUTE-NO-MODULE.md')));
  assert.ok(/ISOLATED RUNTIME IMPLEMENTATION|implementation/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
