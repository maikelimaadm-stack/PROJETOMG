import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  APP_INTEGRATION_NAME,
  APP_INTEGRATION_SEMVER,
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_MODE,
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  STUDIO_DEV_PREVIEW_ROUTE_PATH,
  STUDIO_DEV_PREVIEW_ROUTE_FLAG,
  STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG,
  REQUIRED_CHECKPOINT_RECEIPT,
  ISOLATED_HOST_SUBTREE,
  FORBIDDEN_PROTOTYPE_PATHS,
  APP_INTEGRATION_READINESS_STATES,
  APP_INTEGRATION_CAPABILITIES,
  appIntegrationDigest,
  resolveEnvironmentLabel,
  isDevelopmentEnvironment,
  isProductionOrStaging,
  shouldMountStudioDevPreviewRoute,
  isStudioDevPreviewRouteFlagEnabled,
  isStudioDevPreviewCheckpointApproved,
  APP_INTEGRATION_ERROR_CODES,
  AppIntegrationError,
  createAppIntegrationError,
  appIntegrationError,
  createAppIntegrationSession,
  createStudioDevPreviewFeatureGate,
  createStudioDevPreviewCheckpointReceipt,
  createAppIntegrationPreflight,
  createAppAttachmentDescriptor,
  createLazyPreviewLoader,
  createRuntimeUiMountRequest,
  createFailureContainment,
  createAppIntegrationRollback,
  createAppIntegrationDiagnostics,
  createAppIntegrationManifest,
  verifyAppIntegration,
  checkAppIntegrationCompatibility,
  createAppIntegrationFallback,
  createStudioDevPreviewAppIntegration,
} from '../../studio/blueprint-engine/dev-preview-app-integration/index.js';
import { STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN } from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import { classifyStudioScopePath, isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';
import { createStudioModulePreviewSandboxContract } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';
import { createStudioDevPreviewContractBridge } from '../../studio/blueprint-engine/dev-preview-contract-bridge/index.js';
import { createStudioDevPreviewVisualContract } from '../../studio/blueprint-engine/dev-preview-visual-contract/index.js';
import { createStudioDevPreviewRuntimeShellContract } from '../../studio/blueprint-engine/dev-preview-runtime-shell-contract/index.js';
import { createStudioDevPreviewIsolatedRuntimeImplementationPlan } from '../../studio/blueprint-engine/dev-preview-isolated-runtime-implementation-plan/index.js';
import { createStudioDevPreviewIsolatedRuntime } from '../../studio/blueprint-engine/dev-preview-isolated-runtime/index.js';
import { createStudioDevPreviewRuntimeUiContract } from '../../studio/blueprint-engine/dev-preview-runtime-ui-contract/index.js';
import { createStudioDevPreviewRuntimeUi } from '../../studio/blueprint-engine/dev-preview-runtime-ui/index.js';
import { createStudioDevPreviewRouteMenuContract } from '../../studio/blueprint-engine/dev-preview-route-menu-contract/index.js';
import { createStudioDevPreviewRouteMenu } from '../../studio/blueprint-engine/dev-preview-route-menu/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/dev-preview-app-integration');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration');
const APP_JSX = path.join(ROOT, 'src/App.jsx');
const GUARD = path.join(ROOT, 'scripts/gates/lib/productionUiGuard.mjs');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const readAppJsx = () => fs.readFileSync(APP_JSX, 'utf8');
const readGuard = () => fs.readFileSync(GUARD, 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsxFiles = () => walkExt(DIR, /\.jsx$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsxCode = () => stripComments(jsxFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const allCode = () => stripComments([...jsFiles(), ...jsxFiles()].map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const jsxImports = () => jsxFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
// Additive diff vs origin/main (working-tree two-dot, robust pre/post commit). Returns {added, removed} or null.
const fileDiff = (rel) => {
  try {
    const patch = execSync(`git diff origin/main -- ${rel}`, { cwd: ROOT, encoding: 'utf8' });
    if (!patch.trim()) return null;
    const lines = patch.split('\n');
    return {
      added: lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1)),
      removed: lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1)),
    };
  } catch { return null; }
};

// Build the full real upstream chain + integration.
const SANDBOX = createStudioModulePreviewSandboxContract({ blueprint: { moduleId: 'clientes', moduleName: 'Clientes', modelType: 'cadastro', modelFamily: 'ModeloBase1', fields: [{ name: 'nome', type: 'text' }, { name: 'ativo', type: 'boolean' }], permissions: [{ action: 'read', level: 'module' }] } });
const BRIDGE = createStudioDevPreviewContractBridge({ sandbox: SANDBOX });
const VC = createStudioDevPreviewVisualContract({ bridge: BRIDGE });
const RS = createStudioDevPreviewRuntimeShellContract({ visualContract: VC });
const IPLAN = createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract: RS });
const IR = createStudioDevPreviewIsolatedRuntime({ implementationPlan: IPLAN });
const UC = createStudioDevPreviewRuntimeUiContract({ isolatedRuntime: IR });
const UI = createStudioDevPreviewRuntimeUi({ runtimeUiContract: UC, env: { DEV: 'true' } });
const RMC = createStudioDevPreviewRouteMenuContract({ runtimeUi: UI });
const RM = createStudioDevPreviewRouteMenu({ routeMenuContract: RMC, runtimeUi: UI, enabled: true, environment: 'development', checkpointReceipt: 'approved_for_isolated_route_menu_runtime', virtualFrame: { syntheticDataOnly: true }, initialPath: '/__dev/studio/preview' });
const AUTH_ENV = { DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT };
const U = createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: AUTH_ENV, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });

const session = createAppIntegrationSession({ routeMenuRuntime: RM });
const featureGate = createStudioDevPreviewFeatureGate({ env: AUTH_ENV });
const checkpointReceipt = createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT });
const preflight = createAppIntegrationPreflight({ routeMenuRuntime: RM, featureGate, checkpointReceipt });
const appAttachment = createAppAttachmentDescriptor();
const lazyLoader = createLazyPreviewLoader();
const mountRequest = createRuntimeUiMountRequest({ preflight });
const failureContainment = createFailureContainment();
const rollback = createAppIntegrationRollback();
const caps = APP_INTEGRATION_CAPABILITIES;

// ===== Base + versions + mode (1-40) =====
test('1. created', () => assert.equal(U.kind, 'studio-dev-preview-app-integration'));
test('2. name', () => { assert.equal(U.appIntegrationName, 'studio-dev-preview-app-integration'); assert.equal(U.appIntegrationName, APP_INTEGRATION_NAME); });
test('3. version', () => { assert.equal(U.appIntegrationVersion, 'studio-dev-preview-app-integration@1.0.0'); assert.equal(U.appIntegrationVersion, APP_INTEGRATION_VERSION); });
test('4. semver', () => assert.equal(APP_INTEGRATION_SEMVER, '1.0.0'));
test('5. appIntegrationContractVersion', () => assert.equal(U.appIntegrationContractVersion, APP_INTEGRATION_CONTRACT_VERSION));
test('6. appIntegrationImplementationPlanVersion', () => assert.equal(U.appIntegrationImplementationPlanVersion, APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION));
test('7. routeMenuVersion', () => assert.equal(U.routeMenuVersion, ROUTE_MENU_VERSION));
test('8. runtimeUiVersion', () => assert.equal(U.runtimeUiVersion, RUNTIME_UI_VERSION));
test('9. mode', () => { assert.equal(U.mode, 'dev_only_app_integration'); assert.equal(U.mode, APP_INTEGRATION_MODE); });
test('10. route path', () => { assert.equal(U.routePath, '/__dev/studio/preview'); assert.equal(U.routePath, STUDIO_DEV_PREVIEW_ROUTE_PATH); });
test('11. not fallback', () => assert.equal(U.fallback, false));
test('12. devOnly', () => assert.equal(U.devOnly, true));
test('13. defaultOff', () => assert.equal(U.defaultOff, true));
test('14. isolated', () => assert.equal(U.isolated, true));
test('15. failClosed', () => assert.equal(U.failClosed, true));
test('16. syntheticDataOnly', () => assert.equal(U.syntheticDataOnly, true));
test('17. readiness ready', () => assert.equal(U.readiness, 'studio_dev_preview_app_integration_ready'));
test('18. readyForAppIntegration true', () => assert.equal(U.readyForAppIntegration, true));
test('19. readyForProductExposure false', () => assert.equal(U.readyForProductExposure, false));
test('20. readyForRealModuleGeneration false', () => assert.equal(U.readyForRealModuleGeneration, false));
test('21. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('22. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('23. warningCount 0', () => assert.equal(U.warningCount, 0));
test('24. blockers empty', () => assert.deepEqual(U.blockers, []));
test('25. moduleId string', () => assert.equal(typeof U.moduleId, 'string'));
test('26. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('27. appIntegrationDigest fnv1a', () => assert.ok(String(U.appIntegrationDigest).startsWith('fnv1a-')));
test('28. readiness known state', () => assert.ok(APP_INTEGRATION_READINESS_STATES.includes(U.readiness)));
test('29. route flag name', () => assert.equal(STUDIO_DEV_PREVIEW_ROUTE_FLAG, 'MAK_STUDIO_DEV_PREVIEW'));
test('30. checkpoint flag name', () => assert.equal(STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG, 'MAK_STUDIO_DEV_PREVIEW_CHECKPOINT'));
test('31. required checkpoint receipt', () => assert.equal(REQUIRED_CHECKPOINT_RECEIPT, 'approved_for_app_integration_slice'));
test('32. isolated host subtree', () => assert.equal(ISOLATED_HOST_SUBTREE, 'src/studio/blueprint-engine/dev-preview-route-menu/'));
test('33. forbidden prototype paths 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));
test('34. path is /__dev namespace', () => assert.ok(STUDIO_DEV_PREVIEW_ROUTE_PATH.startsWith('/__dev/')));
test('35. capabilities object', () => assert.equal(typeof U.capabilities, 'object'));
test('36. session present', () => assert.equal(U.session.kind, 'app-integration-session'));
test('37. featureGate present', () => assert.equal(U.featureGate.kind, 'app-integration-feature-gate'));
test('38. preflight present', () => assert.equal(U.preflight.kind, 'app-integration-preflight'));
test('39. manifest present', () => assert.equal(U.manifest.kind, 'app-integration-manifest'));
test('40. compatibility present', () => assert.equal(U.compatibility.kind, 'app-integration-compatibility'));

// ===== Capabilities (41-105) =====
const TRUE_CAPS = ['devOnly', 'defaultOff', 'isolated', 'failClosed', 'syntheticDataOnly', 'appIntegrated', 'appTouched', 'appWiringImplemented', 'productionUiGuardExtended', 'featureFlagImplemented', 'featureFlagConnectedToApp', 'devRouteAttached', 'runtimeUiMountedInApp', 'lazyImportUsed', 'rollbackByFlagOff', 'rollbackByRemovingAdditiveBlock'];
const FALSE_CAPS = ['routerWiringImplemented', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedByDefault', 'eagerImportUsed', 'productionBundleContainsPreview', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkPublic', 'moduleGenerated', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); }); }

// ===== shouldMountStudioDevPreviewRoute gate matrix (106-125) =====
test('106. mounts in dev+flag+checkpoint', () => assert.equal(shouldMountStudioDevPreviewRoute(AUTH_ENV), true));
test('107. blocked in production', () => assert.equal(shouldMountStudioDevPreviewRoute({ MAK_ENV_LABEL: 'production', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('108. blocked in production even with DEV', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', MAK_ENV_LABEL: 'production', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('109. blocked in staging', () => assert.equal(shouldMountStudioDevPreviewRoute({ MAK_ENV_LABEL: 'staging', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('110. blocked in staging even with DEV', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', MAK_ENV_LABEL: 'staging', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('111. blocked when PROD flag set', () => assert.equal(shouldMountStudioDevPreviewRoute({ PROD: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('112. blocked when flag absent', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('113. blocked when flag false', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'false', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('114. blocked when flag invalid', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: '1', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('115. blocked when checkpoint absent', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), false));
test('116. blocked when checkpoint invalid', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: 'nope' }), false));
test('117. blocked when not development', () => assert.equal(shouldMountStudioDevPreviewRoute({ NODE_ENV: 'test', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('118. blocked for empty env (production default)', () => assert.equal(shouldMountStudioDevPreviewRoute({}), false));
test('119. strict equality flag (no truthy fallback)', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: true, [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('120. strict equality checkpoint', () => assert.equal(shouldMountStudioDevPreviewRoute({ DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: `${REQUIRED_CHECKPOINT_RECEIPT} ` }), false));
test('121. flag helper', () => { assert.equal(isStudioDevPreviewRouteFlagEnabled({ [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), true); assert.equal(isStudioDevPreviewRouteFlagEnabled({}), false); });
test('122. checkpoint helper', () => { assert.equal(isStudioDevPreviewCheckpointApproved({ [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), true); assert.equal(isStudioDevPreviewCheckpointApproved({}), false); });
test('123. isProductionOrStaging production', () => assert.equal(isProductionOrStaging({ MAK_ENV_LABEL: 'production' }), true));
test('124. isProductionOrStaging staging ignores DEV', () => assert.equal(isProductionOrStaging({ DEV: 'true', MAK_ENV_LABEL: 'staging' }), true));
test('125. isDevelopmentEnvironment', () => { assert.equal(isDevelopmentEnvironment({ DEV: 'true' }), true); assert.equal(isDevelopmentEnvironment({ MAK_ENV_LABEL: 'production' }), false); });

// ===== Feature gate (126-140) =====
test('126. gate kind', () => assert.equal(featureGate.kind, 'app-integration-feature-gate'));
test('127. gate open in dev+flag+ckpt', () => assert.equal(featureGate.open, true));
test('128. gate devOnly', () => assert.equal(featureGate.devOnly, true));
test('129. gate default disabled', () => assert.equal(featureGate.defaultEnabled, false));
test('130. gate productionDenied/stagingDenied', () => { assert.equal(featureGate.productionDenied, true); assert.equal(featureGate.stagingDenied, true); });
test('131. gate production/staging not allowed', () => { assert.equal(featureGate.productionAllowed, false); assert.equal(featureGate.stagingAllowed, false); });
test('132. gate failClosed + runtimeVerified', () => { assert.equal(featureGate.failClosed, true); assert.equal(featureGate.runtimeVerified, true); });
test('133. gate closed in production', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { MAK_ENV_LABEL: 'production', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT } }).open, false));
test('134. gate closed in staging', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { MAK_ENV_LABEL: 'staging', DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT } }).open, false));
test('135. gate closed no flag', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT } }).open, false));
test('136. gate closed no checkpoint', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true' } }).open, false));
test('137. gate closed by default (empty)', () => assert.equal(createStudioDevPreviewFeatureGate({}).open, false));
test('138. gate reason production', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { MAK_ENV_LABEL: 'production' } }).reason, 'production_or_staging_denied'));
test('139. gate reason checkpoint', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true' } }).reason, 'checkpoint_missing_or_invalid'));
test('140. gate digest', () => assert.ok(String(featureGate.featureGateDigest).startsWith('fnv1a-')));

// ===== Checkpoint receipt (141-147) =====
test('141. receipt kind', () => assert.equal(checkpointReceipt.kind, 'app-integration-checkpoint-receipt'));
test('142. receipt approved', () => assert.equal(checkpointReceipt.approved, true));
test('143. receipt required value', () => assert.equal(checkpointReceipt.requiredReceipt, REQUIRED_CHECKPOINT_RECEIPT));
test('144. receipt rejects invalid', () => assert.equal(createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: 'x' }).approved, false));
test('145. receipt rejects missing', () => assert.equal(createStudioDevPreviewCheckpointReceipt({}).approved, false));
test('146. receipt strict equality', () => assert.equal(createStudioDevPreviewCheckpointReceipt({ checkpointReceipt: `${REQUIRED_CHECKPOINT_RECEIPT} ` }).approved, false));
test('147. receipt digest', () => assert.ok(String(checkpointReceipt.checkpointReceiptDigest).startsWith('fnv1a-')));

// ===== Preflight (148-157) =====
test('148. preflight kind', () => assert.equal(preflight.kind, 'app-integration-preflight'));
test('149. preflight ok', () => assert.equal(preflight.ok, true));
test('150. preflight routeMenuCompatible', () => assert.equal(preflight.routeMenuCompatible, true));
test('151. preflight featureGateOpen', () => assert.equal(preflight.featureGateOpen, true));
test('152. preflight checkpointApproved', () => assert.equal(preflight.checkpointApproved, true));
test('153. preflight syntheticDataOnly', () => assert.equal(preflight.syntheticDataOnly, true));
test('154. preflight blocked when gate closed', () => assert.equal(createAppIntegrationPreflight({ routeMenuRuntime: RM, featureGate: createStudioDevPreviewFeatureGate({}), checkpointReceipt }).ok, false));
test('155. preflight blocked when checkpoint not approved', () => assert.equal(createAppIntegrationPreflight({ routeMenuRuntime: RM, featureGate, checkpointReceipt: createStudioDevPreviewCheckpointReceipt({}) }).ok, false));
test('156. preflight blocked when runtime incompatible', () => assert.ok(createAppIntegrationPreflight({ routeMenuRuntime: { kind: 'other' }, featureGate, checkpointReceipt }).blockers.includes('route_menu_runtime_incompatible')));
test('157. preflight digest', () => assert.ok(String(preflight.preflightDigest).startsWith('fnv1a-')));

// ===== Session (158-164) =====
test('158. session kind', () => assert.equal(session.kind, 'app-integration-session'));
test('159. session no storage/fetch/persistence', () => { assert.equal(session.usesStorage, false); assert.equal(session.usesFetch, false); assert.equal(session.usesPersistence, false); });
test('160. session no side effects', () => assert.equal(session.runtimeSideEffects, false));
test('161. session seed', () => assert.equal(typeof session.seed, 'string'));
test('162. session sources route/menu', () => assert.equal(session.sourceRouteMenuRuntime, ROUTE_MENU_VERSION));
test('163. session digest', () => assert.ok(String(session.sessionDigest).startsWith('fnv1a-')));
test('164. session deterministic', () => assert.equal(createAppIntegrationSession({ routeMenuRuntime: RM }).sessionDigest, session.sessionDigest));

// ===== App attachment descriptor (165-180) =====
test('165. attachment kind', () => assert.equal(appAttachment.kind, 'app-integration-app-attachment-descriptor'));
test('166. attachment path', () => assert.equal(appAttachment.path, STUDIO_DEV_PREVIEW_ROUTE_PATH));
test('167. attachment devOnly', () => assert.equal(appAttachment.devOnly, true));
test('168. attachment additiveOnly', () => assert.equal(appAttachment.additiveOnly, true));
test('169. attachment devRouteAttached', () => assert.equal(appAttachment.devRouteAttached, true));
test('170. attachment follows sanctioned pattern', () => assert.equal(appAttachment.followsSanctionedDevRoutePattern, true));
test('171. attachment route not exposed to product', () => assert.equal(appAttachment.routeExposedToProduct, false));
test('172. attachment menu not exposed', () => assert.equal(appAttachment.menuExposedToProduct, false));
test('173. attachment sidebar not exposed', () => assert.equal(appAttachment.sidebarExposedToProduct, false));
test('174. attachment not public route', () => assert.equal(appAttachment.publicRoute, false));
test('175. attachment not in main menu', () => assert.equal(appAttachment.inMainMenu, false));
test('176. attachment no new router', () => assert.equal(appAttachment.newRouterCreated, false));
test('177. attachment no router refactor', () => assert.equal(appAttachment.existingRouterRefactored, false));
test('178. attachment providers/auth/layout untouched', () => { assert.equal(appAttachment.providersTouched, false); assert.equal(appAttachment.authTouched, false); assert.equal(appAttachment.layoutTouched, false); });
test('179. attachment digest', () => assert.ok(String(appAttachment.appAttachmentDigest).startsWith('fnv1a-')));
test('180. attachment in contract', () => assert.equal(U.appAttachment.routeExposedToProduct, false));

// ===== Lazy loader (181-192) =====
test('181. lazy kind', () => assert.equal(lazyLoader.kind, 'app-integration-lazy-preview-loader'));
test('182. lazy import used', () => assert.equal(lazyLoader.lazyImportUsed, true));
test('183. dynamic import used', () => assert.equal(lazyLoader.dynamicImportUsed, true));
test('184. no eager import', () => assert.equal(lazyLoader.eagerImportUsed, false));
test('185. build-time dev guarded', () => assert.equal(lazyLoader.buildTimeDevGuarded, true));
test('186. production bundle absent', () => assert.equal(lazyLoader.productionBundleContainsPreview, false));
test('187. no mount on import', () => assert.equal(lazyLoader.mountsOnImport, false));
test('188. no side effect on import', () => assert.equal(lazyLoader.sideEffectOnImport, false));
test('189. preview subtree', () => assert.equal(lazyLoader.previewSubtree, 'src/studio/blueprint-engine/dev-preview-app-integration/'));
test('190. isolated host subtree', () => assert.equal(lazyLoader.isolatedHostSubtree, ISOLATED_HOST_SUBTREE));
test('191. lazy digest', () => assert.ok(String(lazyLoader.lazyPreviewLoaderDigest).startsWith('fnv1a-')));
test('192. lazy in contract', () => assert.equal(U.lazyPreviewLoader.eagerImportUsed, false));

// ===== Mount request (193-208) =====
test('193. mount kind', () => assert.equal(mountRequest.kind, 'app-integration-runtime-ui-mount-request'));
test('194. mount authorized when preflight ok', () => assert.equal(mountRequest.mountAuthorized, true));
test('195. mount blocked when preflight not ok', () => assert.equal(createRuntimeUiMountRequest({ preflight: { ok: false } }).mountAuthorized, false));
test('196. mount explicit request+mount', () => { assert.equal(mountRequest.explicitRequest, true); assert.equal(mountRequest.explicitMount, true); });
test('197. mount isolated host only', () => assert.equal(mountRequest.mountsIsolatedHostOnly, true));
test('198. mount dependency injected', () => assert.equal(mountRequest.dependencyInjected, true));
test('199. mount requires rootFactory+mountNode', () => { assert.equal(mountRequest.requiresRootFactory, true); assert.equal(mountRequest.requiresMountNode, true); });
test('200. mount not by default', () => assert.equal(mountRequest.runtimeUiMountedByDefault, false));
test('201. mount no global root/singleton/service-locator', () => { assert.equal(mountRequest.globalRootUsed, false); assert.equal(mountRequest.globalSingletonUsed, false); assert.equal(mountRequest.serviceLocatorUsed, false); });
test('202. mount no window/document', () => { assert.equal(mountRequest.windowUsed, false); assert.equal(mountRequest.documentUsed, false); });
test('203. mount no reactDom/createRoot', () => { assert.equal(mountRequest.reactDomUsed, false); assert.equal(mountRequest.createRootUsed, false); });
test('204. mount no storage/network', () => { assert.equal(mountRequest.usesStorage, false); assert.equal(mountRequest.usesNetwork, false); });
test('205. mount no real data', () => { assert.equal(mountRequest.realDataRead, false); assert.equal(mountRequest.realDataWrite, false); });
test('206. mount synthetic only', () => assert.equal(mountRequest.syntheticDataOnly, true));
test('207. mount digest', () => assert.ok(String(mountRequest.mountRequestDigest).startsWith('fnv1a-')));
test('208. mount in contract', () => assert.equal(U.mountRequest.mountAuthorized, true));

// ===== Failure containment (209-220) =====
test('209. failure kind', () => assert.equal(failureContainment.kind, 'app-integration-failure-containment'));
test('210. fail closed', () => assert.equal(failureContainment.failClosed, true));
test('211. failure contained', () => assert.equal(failureContainment.failureContained, true));
test('212. lazy import failure contained', () => assert.equal(failureContainment.lazyImportFailureContained, true));
test('213. mount failure contained', () => assert.equal(failureContainment.mountFailureContained, true));
test('214. isolated runtime failure contained', () => assert.equal(failureContainment.isolatedRuntimeFailureContained, true));
test('215. local safe fallback', () => assert.equal(failureContainment.localSafeFallback, true));
test('216. does not break app', () => assert.equal(failureContainment.breaksApp, false));
test('217. no global redirect', () => assert.equal(failureContainment.globalRedirect, false));
test('218. no mutation/prod-state on failure', () => { assert.equal(failureContainment.mutationOnFailure, false); assert.equal(failureContainment.productionStateChangedOnFailure, false); });
test('219. failure digest', () => assert.ok(String(failureContainment.failureContainmentDigest).startsWith('fnv1a-')));
test('220. failure in contract', () => assert.equal(U.failureContainment.failClosed, true));

// ===== Rollback (221-229) =====
test('221. rollback kind', () => assert.equal(rollback.kind, 'app-integration-rollback'));
test('222. rollback by flag off', () => assert.equal(rollback.rollbackByFlagOff, true));
test('223. rollback by removing additive block', () => assert.equal(rollback.rollbackByRemovingAdditiveBlock, true));
test('224. rollback flag name', () => assert.equal(rollback.flagName, STUDIO_DEV_PREVIEW_ROUTE_FLAG));
test('225. no destructive rollback', () => assert.equal(rollback.destructiveRollbackRequired, false));
test('226. no data migration', () => assert.equal(rollback.dataMigrationRequired, false));
test('227. additive block only', () => assert.equal(rollback.additiveBlockOnly, true));
test('228. reversible by non-consumption', () => assert.equal(rollback.reversibleByNonConsumption, true));
test('229. rollback in contract', () => assert.equal(U.rollback.rollbackByFlagOff, true));

// ===== Manifest (230-243) =====
const manifest = U.manifest;
test('230. manifest kind', () => assert.equal(manifest.kind, 'app-integration-manifest'));
test('231. manifest version', () => assert.equal(manifest.appIntegrationVersion, APP_INTEGRATION_VERSION));
test('232. manifest route path', () => assert.equal(manifest.routePath, STUDIO_DEV_PREVIEW_ROUTE_PATH));
test('233. manifest upstream route/menu', () => assert.equal(manifest.upstream.routeMenuRuntime, ROUTE_MENU_VERSION));
test('234. manifest upstream runtime ui', () => assert.equal(manifest.upstream.runtimeUi, RUNTIME_UI_VERSION));
test('235. manifest parts session', () => assert.equal(manifest.parts.session, session.sessionDigest));
test('236. manifest parts featureGate', () => assert.equal(typeof manifest.parts.featureGate, 'string'));
test('237. manifest parts appAttachment', () => assert.equal(typeof manifest.parts.appAttachment, 'string'));
test('238. manifest parts lazyPreviewLoader', () => assert.equal(typeof manifest.parts.lazyPreviewLoader, 'string'));
test('239. manifest parts mountRequest', () => assert.equal(typeof manifest.parts.mountRequest, 'string'));
test('240. manifest parts rollback', () => assert.equal(typeof manifest.parts.rollback, 'string'));
test('241. manifest capabilities appIntegrated true', () => assert.equal(manifest.capabilities.appIntegrated, true));
test('242. manifest digest', () => assert.ok(String(manifest.manifestDigest).startsWith('fnv1a-')));
test('243. standalone manifest builds', () => assert.equal(createAppIntegrationManifest({}).kind, 'app-integration-manifest'));

// ===== Verifier (244-274) =====
test('244. verification ok', () => assert.equal(U.verification.ok, true));
test('245. verification valid', () => assert.equal(U.verification.valid, true));
test('246. verification devOnly/defaultOff/failClosed', () => { assert.equal(U.verification.devOnly, true); assert.equal(U.verification.defaultOff, true); assert.equal(U.verification.failClosed, true); });
test('247. verification appIntegrated', () => assert.equal(U.verification.appIntegrated, true));
test('248. verification routeExposedToProduct false', () => assert.equal(U.verification.routeExposedToProduct, false));
test('249. verification productionBundleContainsPreview false', () => assert.equal(U.verification.productionBundleContainsPreview, false));
test('250. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
const vok = (o) => verifyAppIntegration(o).blockers;
test('251. verifier detects routeExposedToProduct', () => assert.ok(vok({ contract: { capabilities: { ...caps, routeExposedToProduct: true } } }).includes('capability_routeExposedToProduct_must_be_false')));
test('252. verifier detects menuExposedToProduct', () => assert.ok(vok({ contract: { capabilities: { ...caps, menuExposedToProduct: true } } }).includes('capability_menuExposedToProduct_must_be_false')));
test('253. verifier detects sidebarExposedToProduct', () => assert.ok(vok({ contract: { capabilities: { ...caps, sidebarExposedToProduct: true } } }).includes('capability_sidebarExposedToProduct_must_be_false')));
test('254. verifier detects routerWiringImplemented', () => assert.ok(vok({ contract: { capabilities: { ...caps, routerWiringImplemented: true } } }).includes('capability_routerWiringImplemented_must_be_false')));
test('255. verifier detects eagerImportUsed', () => assert.ok(vok({ contract: { capabilities: { ...caps, eagerImportUsed: true } } }).includes('capability_eagerImportUsed_must_be_false')));
test('256. verifier detects productionBundleContainsPreview', () => assert.ok(vok({ contract: { capabilities: { ...caps, productionBundleContainsPreview: true } } }).includes('capability_productionBundleContainsPreview_must_be_false')));
test('257. verifier detects reactDom/createRoot', () => { const r = vok({ contract: { capabilities: { ...caps, reactDomUsed: true, createRootUsed: true } } }); assert.ok(r.includes('capability_reactDomUsed_must_be_false') && r.includes('capability_createRootUsed_must_be_false')); });
test('258. verifier detects window/document', () => { const r = vok({ contract: { capabilities: { ...caps, windowUsed: true, documentUsed: true } } }); assert.ok(r.includes('capability_windowUsed_must_be_false')); });
test('259. verifier detects deepLinkPublic', () => assert.ok(vok({ contract: { capabilities: { ...caps, deepLinkPublic: true } } }).includes('capability_deepLinkPublic_must_be_false')));
test('260. verifier detects moduleGenerated', () => assert.ok(vok({ contract: { capabilities: { ...caps, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')));
test('261. verifier detects backend/prisma', () => { const r = vok({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false')); });
test('262. verifier detects production/staging', () => { const r = vok({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false')); });
test('263. verifier detects real data', () => { const r = vok({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false')); });
test('264. verifier detects prototypeRelinked', () => assert.ok(vok({ contract: { capabilities: { ...caps, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')));
test('265. verifier detects mustBeTrue inversion (devOnly)', () => assert.ok(vok({ contract: { capabilities: { ...caps, devOnly: false } } }).includes('capability_devOnly_must_be_true')));
test('266. verifier detects feature gate default-on (part)', () => assert.ok(vok({ contract: { capabilities: caps, featureGate: { defaultEnabled: true } } }).includes('unsafe_feature_gate_default_on')));
test('267. verifier detects feature gate prod/staging allowed (part)', () => assert.ok(vok({ contract: { capabilities: caps, featureGate: { productionAllowed: true } } }).includes('unsafe_feature_gate_production_staging_allowed')));
test('268. verifier detects route exposed (part)', () => assert.ok(vok({ contract: { capabilities: caps, appAttachment: { routeExposedToProduct: true } } }).includes('unsafe_route_exposed')));
test('269. verifier detects menu/sidebar exposed (part)', () => assert.ok(vok({ contract: { capabilities: caps, appAttachment: { menuExposedToProduct: true } } }).includes('unsafe_menu_sidebar_exposed')));
test('270. verifier detects new router / core touched (part)', () => { const r1 = vok({ contract: { capabilities: caps, appAttachment: { newRouterCreated: true } } }); const r2 = vok({ contract: { capabilities: caps, appAttachment: { authTouched: true } } }); assert.ok(r1.includes('unsafe_router_change') && r2.includes('unsafe_app_core_touched')); });
test('271. verifier detects eager import / prod bundle (part)', () => { const r1 = vok({ contract: { capabilities: caps, lazyPreviewLoader: { eagerImportUsed: true } } }); const r2 = vok({ contract: { capabilities: caps, lazyPreviewLoader: { productionBundleContainsPreview: true } } }); assert.ok(r1.includes('unsafe_eager_import') && r2.includes('unsafe_production_bundle_contains_preview')); });
test('272. verifier detects global mount / dom globals (part)', () => { const r1 = vok({ contract: { capabilities: caps, mountRequest: { globalRootUsed: true } } }); const r2 = vok({ contract: { capabilities: caps, mountRequest: { windowUsed: true } } }); assert.ok(r1.includes('unsafe_global_mount') && r2.includes('unsafe_dom_globals')); });
test('273. verifier detects mount by default (part)', () => assert.ok(vok({ contract: { capabilities: caps, mountRequest: { runtimeUiMountedByDefault: true } } }).includes('unsafe_mount_by_default')));
test('274. verifier never throws', () => assert.doesNotThrow(() => verifyAppIntegration({ contract: null })));

// ===== Compatibility (275-283) =====
test('275. compatibility kind', () => assert.equal(U.compatibility.kind, 'app-integration-compatibility'));
test('276. compatibleWithRouteMenuRuntime', () => assert.equal(U.compatibility.compatibleWithRouteMenuRuntime, true));
test('277. compatibleWithRuntimeUi', () => assert.equal(U.compatibility.compatibleWithRuntimeUi, true));
test('278. compat readyForAppIntegration', () => assert.equal(U.compatibility.readyForAppIntegration, true));
test('279. compat readyForProductExposure false', () => assert.equal(U.compatibility.readyForProductExposure, false));
test('280. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('281. compat status', () => assert.equal(U.compatibility.status, 'ready_for_dev_only_app_integration_default_off_fail_closed'));
test('282. compat mismatch → warning', () => { const r = checkAppIntegrationCompatibility({ routeMenuRuntime: { runtimeUiVersion: 'x@9.9.9', kind: 'other' } }); assert.equal(r.compatibleWithRuntimeUi, false); assert.ok(r.warnings.includes('incompatible_runtimeUi')); });
test('283. compat digest', () => assert.ok(String(U.compatibility.compatibilityDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback (284-297) =====
test('284. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'app-integration-diagnostics'));
test('285. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('286. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('287. diagnostics devOnly/defaultOff/failClosed confirmed', () => { assert.equal(U.diagnostics.devOnlyConfirmed, true); assert.equal(U.diagnostics.defaultOffConfirmed, true); assert.equal(U.diagnostics.failClosedConfirmed, true); });
test('288. diagnostics prod bundle false', () => assert.equal(U.diagnostics.productionBundleContainsPreview, false));
test('289. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
test('290. diagnostics no external logging', () => { assert.equal(U.diagnostics.logged, false); assert.equal(U.diagnostics.externalLogging, false); });
test('291. fallback missing runtime', () => assert.equal(createStudioDevPreviewAppIntegration({}).fallback, true));
test('292. fallback invalid kind', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: { kind: 'other' } }).fallback, true));
test('293. fallback upstream fallback', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: { kind: 'studio-dev-preview-route-menu', fallback: true } }).fallback, true));
test('294. fallback readiness blocked', () => assert.equal(createAppIntegrationFallback({}).readiness, 'blocked'));
test('295. fallback authorizes nothing', () => { const fb = createAppIntegrationFallback({}); assert.equal(fb.readyForAppIntegration, false); assert.equal(fb.readyForProduction, false); });
test('296. fallback capabilities preserved', () => assert.equal(createAppIntegrationFallback({}).capabilities.devOnly, true));
test('297. fallback digest', () => assert.ok(String(createAppIntegrationFallback({}).overallDigest).startsWith('fnv1a-')));

// ===== Errors (298-307) =====
test('298. error codes >= 40', () => assert.ok(APP_INTEGRATION_ERROR_CODES.length >= 40));
test('299. error descriptor kind', () => assert.equal(createAppIntegrationError(APP_INTEGRATION_ERROR_CODES[0]).kind, 'app-integration-error'));
test('300. error descriptor safe', () => assert.equal(createAppIntegrationError('APP_INTEGRATION_PRISMA_BLOCKED').safe, true));
test('301. error descriptor side-effect free', () => assert.equal(createAppIntegrationError('APP_INTEGRATION_PRISMA_BLOCKED').sideEffects, false));
test('302. error descriptor no real data', () => { const e = createAppIntegrationError('APP_INTEGRATION_BACKEND_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.prototypeRelinked, false); });
test('303. error unknown code normalized', () => assert.equal(createAppIntegrationError('NOPE').code, 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME'));
test('304. error class instance', () => assert.ok(appIntegrationError('APP_INTEGRATION_SESSION_FAILED', 'x') instanceof AppIntegrationError));
test('305. error class normalizes bad code', () => assert.equal(new AppIntegrationError('bad', 'x').code, 'APP_INTEGRATION_INVALID_ROUTE_MENU_RUNTIME'));
test('306. error no secrets in message', () => { const e = createAppIntegrationError('APP_INTEGRATION_FETCH_BLOCKED'); assert.equal(e.withoutSecrets, true); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('307. error codes unique', () => assert.equal(new Set(APP_INTEGRATION_ERROR_CODES).size, APP_INTEGRATION_ERROR_CODES.length));

// ===== Config env helpers + determinism (308-322) =====
test('308. resolveEnvironmentLabel dev', () => assert.equal(resolveEnvironmentLabel({ DEV: 'true' }), 'development'));
test('309. resolveEnvironmentLabel production', () => assert.equal(resolveEnvironmentLabel({ MAK_ENV_LABEL: 'production' }), 'production'));
test('310. resolveEnvironmentLabel unknown', () => assert.equal(resolveEnvironmentLabel({}), 'unknown'));
test('311. digest helper stable', () => assert.equal(appIntegrationDigest({ a: 1 }), appIntegrationDigest({ a: 1 })));
test('312. digest helper handles null', () => assert.ok(String(appIntegrationDigest(null)).startsWith('fnv1a-')));
test('313. deterministic overall digest', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: AUTH_ENV, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).overallDigest, U.overallDigest));
test('314. deterministic integration digest', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: AUTH_ENV, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).appIntegrationDigest, U.appIntegrationDigest));
test('315. no functions in contract', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('316. JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('317. manifest digest stable second build', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: AUTH_ENV, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).manifest.manifestDigest, U.manifest.manifestDigest));
test('318. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('319. capabilities mirror const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('320. building does not mutate route/menu runtime', () => { const before = RM.overallDigest; createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: AUTH_ENV }); assert.equal(RM.overallDigest, before); });
test('321. env-off integration still models default-off safely', () => { const off = createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: {} }); assert.equal(off.featureGate.open, false); assert.equal(off.capabilities.defaultOff, true); });
test('322. integration with checkpoint but no env flag → gate closed', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: { DEV: 'true' }, checkpointReceipt: REQUIRED_CHECKPOINT_RECEIPT }).featureGate.open, false));

// ===== .js static scans (323-340) =====
test('323. .js graph React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('324. .js no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('325. .js no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('326. .js does NOT import the .jsx (node --test safe)', () => assert.ok(jsImports().every((p) => !/\.jsx($|['"])/.test(p))));
test('327. .js no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('328. no ReactDOM/createRoot/hydrateRoot anywhere', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(allCode())));
test('329. no window/document access anywhere', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(allCode())));
test('330. no old Studio prototype import', () => assert.ok(jsImports().concat(jsxImports()).every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('331. no src/components or src/pages import', () => assert.ok(jsImports().concat(jsxImports()).every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('332. no App import', () => assert.ok(jsImports().concat(jsxImports()).every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('333. no EmpresaApi/apiClient/apis/backend/prisma import', () => assert.ok(jsImports().concat(jsxImports()).every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('334. no fetch/XHR/WebSocket/storage-API', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(allCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(allCode())));
test('335. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(allCode())));
test('336. no real POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('337. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(allCode())));
test('338. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('339. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('340. exactly 18 .js files', () => assert.equal(jsFiles().length, 18));

// ===== .jsx scans (341-356) =====
test('341. exactly 4 .jsx files', () => assert.equal(jsxFiles().length, 4));
test('342. .jsx use automatic runtime (no react import)', () => assert.ok(jsxImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('343. .jsx no react-dom import', () => assert.ok(jsxImports().every((p) => !/react-dom/i.test(p))));
test('344. .jsx no react-router import', () => assert.ok(jsxImports().every((p) => !/react-router/i.test(p))));
test('345. .jsx contain real JSX', () => assert.ok(jsxFiles().every((f) => /<[A-Za-z]/.test(fs.readFileSync(f, 'utf8')))));
test('346. .jsx no ReactDOM/createRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsxCode())));
test('347. .jsx no window/document', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsxCode())));
test('348. AppBoundary renders isolated host', () => assert.ok(/StudioDevPreviewRouteMenuHost/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewAppBoundary.jsx'), 'utf8'))));
test('349. AppBoundary imports route-menu isolated host', () => assert.ok(jsxImports().some((p) => /dev-preview-route-menu\/StudioDevPreviewRouteMenuHost\.jsx/.test(p))));
test('350. AppBoundary uses synthetic snapshot', () => assert.ok(/synthetic/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewAppBoundary.jsx'), 'utf8'))));
test('351. failure boundary present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-app-integration/StudioDevPreviewFailureBoundary.jsx')));
test('352. lazy boundary present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-app-integration/StudioDevPreviewLazyBoundary.jsx')));
test('353. fallback present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-app-integration/StudioDevPreviewFallback.jsx')));
test('354. .jsx no <Route JSX / Routes / Link / NavLink', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsxCode())));
test('355. .jsx no BrowserRouter/createBrowserRouter/useNavigate', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsxCode())));
test('356. .jsx no old prototype import', () => assert.ok(jsxImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));

// ===== App.jsx additive + integration assertions (357-380) =====
test('357. App.jsx imports shouldMountStudioDevPreviewRoute', () => assert.ok(/shouldMountStudioDevPreviewRoute/.test(readAppJsx())));
test('358. App.jsx imports STUDIO_DEV_PREVIEW_ROUTE_PATH', () => assert.ok(/STUDIO_DEV_PREVIEW_ROUTE_PATH/.test(readAppJsx())));
test('359. App.jsx uses build-time import.meta.env.DEV guard', () => assert.ok(/import\.meta\.env\.DEV\s*\n?\s*\?\s*lazy\(\(\)\s*=>\s*import\([^)]*StudioDevPreviewAppBoundary/.test(readAppJsx()) || /import\.meta\.env\.DEV[\s\S]{0,120}StudioDevPreviewAppBoundary/.test(readAppJsx())));
test('360. App.jsx uses lazy dynamic import for boundary', () => assert.ok(/lazy\(\(\)\s*=>\s*import\("@\/studio\/blueprint-engine\/dev-preview-app-integration\/StudioDevPreviewAppBoundary\.jsx"\)\)/.test(readAppJsx())));
test('361. App.jsx mounts route conditionally on shouldMount', () => assert.ok(/shouldMountStudioDevPreviewRoute\(\)\s*&&/.test(readAppJsx())));
test('362. App.jsx route uses the dev path constant', () => assert.ok(/path=\{STUDIO_DEV_PREVIEW_ROUTE_PATH\}/.test(readAppJsx())));
test('363. App.jsx boundary gated by StudioDevPreviewAppRoute null check', () => assert.ok(/StudioDevPreviewAppRoute\s*&&\s*shouldMountStudioDevPreviewRoute\(\)/.test(readAppJsx())));
test('364. App.jsx has DEV-ONLY Studio marker comment', () => assert.ok(/DEV-ONLY: Studio dev preview/.test(readAppJsx())));
test('365. App.jsx does not add a menu/sidebar for the preview', () => assert.ok(!/addMenuItem|navItems|menu\.push/.test(readAppJsx())));
test('366. App.jsx does not add a new BrowserRouter', () => { const m = readAppJsx().match(/BrowserRouter/g) || []; assert.ok(m.length <= 1); });
test('367. App.jsx still has exactly one Router usage (no new router)', () => { const m = readAppJsx().match(/<Router>/g) || []; assert.equal(m.length, 1); });
test('368. App.jsx additive-only (0 removed lines vs origin/main)', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.equal(d.removed.length, 0); });
test('369. App.jsx added lines reference the dev preview', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.ok(d.added.some((a) => /StudioDevPreview|__dev\/studio\/preview|shouldMountStudioDevPreviewRoute/.test(a))); });
test('370. App.jsx added lines add no forbidden token', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.ok(d.added.every((a) => !/prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB|addMenuItem|navItems|menu\.push/i.test(a))); });
test('371. App.jsx added path lines are only the dev path', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.ok(d.added.filter((a) => /path\s*=/.test(a)).every((a) => /STUDIO_DEV_PREVIEW_ROUTE_PATH|__dev\/studio\/preview/.test(a))); });
test('372. App.jsx does not touch AuthProvider wiring (additive only)', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.ok(d.added.every((a) => !/AuthProvider|QueryClientProvider|ErpThemeProvider/.test(a))); });
test('373. productionUiGuard still contains prior runtime-v2 markers', () => assert.ok(/RuntimeV2DevPreview/.test(readGuard()) && /__dev\/runtime-v2\/previews/.test(readGuard())));
test('374. productionUiGuard still contains prior modelobase2 markers', () => assert.ok(/ModeloBase2FuelDevPreview/.test(readGuard()) && /__dev\/modelobase2\/fuel/.test(readGuard())));
test('375. productionUiGuard has new Studio marker', () => assert.ok(/shouldMountStudioDevPreviewRoute/.test(readGuard()) && /__dev\\\/studio\\\/preview|__dev\/studio\/preview/.test(readGuard())));
test('376. productionUiGuard FORBIDDEN regex intact', () => assert.ok(/const FORBIDDEN = \/prisma\|PrismaClient/.test(readGuard())));
test('377. productionUiGuard adds no broad wildcard', () => assert.ok(!/\.\*/.test(readGuard())));
test('378. productionUiGuard keeps appJsxChangeIsOnlyDevRouteMount', () => assert.ok(/function appJsxChangeIsOnlyDevRouteMount/.test(readGuard())));
test('379. productionUiGuard additive-only (0 removed non-regex lines)', () => { const d = fileDiff('scripts/gates/lib/productionUiGuard.mjs'); if (!d) return; assert.ok(d.removed.every((r) => /DEV_ROUTE_MARKER|path\\s\*\[=:\]|path\s*\[=:\]|RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH/.test(r))); });
test('380. productionUiGuard removed lines all reappear as extended appends', () => { const d = fileDiff('scripts/gates/lib/productionUiGuard.mjs'); if (!d) return; assert.ok(d.added.length === d.removed.length); });

// ===== Governance registry authorization (381-390) =====
test('381. explicit-forbidden authorization has 2 entries', () => assert.equal(STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.length, 2));
test('382. authorization includes App.jsx', () => assert.ok(STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.some((re) => re.test('src/App.jsx'))));
test('383. authorization includes productionUiGuard', () => assert.ok(STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.some((re) => re.test('scripts/gates/lib/productionUiGuard.mjs'))));
test('384. App.jsx NOT in known-later (leak-safe)', () => assert.equal(isKnownLaterStudioHeadlessArtifact('src/App.jsx'), false));
test('385. productionUiGuard NOT in known-later (leak-safe)', () => assert.equal(isKnownLaterStudioHeadlessArtifact('scripts/gates/lib/productionUiGuard.mjs'), false));
test('386. App.jsx forbidden without option', () => assert.equal(classifyStudioScopePath('src/App.jsx'), 'forbidden_scope'));
test('387. App.jsx own-slice-allowed with option', () => assert.equal(classifyStudioScopePath('src/App.jsx', { explicitlyAuthorizedForbidden: STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN }), 'own_slice_allowed'));
test('388. productionUiGuard own-slice-allowed with option', () => assert.equal(classifyStudioScopePath('scripts/gates/lib/productionUiGuard.mjs', { explicitlyAuthorizedForbidden: STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN }), 'own_slice_allowed'));
test('389. subtree is known-later', () => assert.equal(isKnownLaterStudioHeadlessArtifact('src/studio/blueprint-engine/dev-preview-app-integration/index.js'), true));
test('390. registry known-later leaks no forbidden probe', () => { const probes = ['src/modules/x.js', 'backend/y.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx']; assert.ok(probes.every((p) => isKnownLaterStudioHeadlessArtifact(p) === false)); });

// ===== Scope safety (391-400) =====
test('391. no src/modules in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/modules\//.test(f))); });
test('392. no Empresas in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /empresas/i.test(f))); });
test('393. no backend/prisma/migration in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f))); });
test('394. no .tsx/.css in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /\.(tsx|css)$/.test(f))); });
test('395. only .jsx in diff are the subtree or the authorized additive App.jsx', () => { const files = changed(); if (files === null) return; assert.ok(files.filter((f) => /\.jsx$/.test(f)).every((f) => f === 'src/App.jsx' || /^src\/studio\/blueprint-engine\/dev-preview-app-integration\//.test(f))); });
test('396. governance guard file not in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
test('397. no prior gate/test altered', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => (/^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-dev-preview-app-integration.mjs') || (/^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-dev-preview-app-integration.test.js'))); });
test('398. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('399. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('400. upstream route-menu runtime present', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-route-menu/index.js')));

// ===== Additional gate-matrix, cross-checks and robustness (401-485) =====
// Extended shouldMount matrix across env label sources.
for (const [i, label] of ['production', 'staging'].entries()) {
  test(`${401 + i}. blocked for MODE=${label}`, () => assert.equal(shouldMountStudioDevPreviewRoute({ MODE: label, [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
}
test('403. blocked for NODE_ENV=production', () => assert.equal(shouldMountStudioDevPreviewRoute({ NODE_ENV: 'production', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('404. blocked for VITE_ENV_LABEL=staging', () => assert.equal(shouldMountStudioDevPreviewRoute({ VITE_ENV_LABEL: 'staging', DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('405. mounts for development label (no DEV flag)', () => assert.equal(shouldMountStudioDevPreviewRoute({ MAK_ENV_LABEL: 'development', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), true));
test('406. shouldMount is pure (no throw on undefined)', () => assert.doesNotThrow(() => shouldMountStudioDevPreviewRoute(undefined)));
test('407. isProductionOrStaging false for development', () => assert.equal(isProductionOrStaging({ MAK_ENV_LABEL: 'development' }), false));
test('408. isProductionOrStaging false for empty', () => assert.equal(isProductionOrStaging({}), false));
test('409. resolveEnvironmentLabel from MODE', () => assert.equal(resolveEnvironmentLabel({ MODE: 'test' }), 'test'));
test('410. resolveEnvironmentLabel from NODE_ENV', () => assert.equal(resolveEnvironmentLabel({ NODE_ENV: 'test' }), 'test'));

// Feature gate reasons across matrix.
test('411. gate reason not_development_environment', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { NODE_ENV: 'test', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT } }).reason, 'not_development_environment'));
test('412. gate reason flag_off_or_missing', () => assert.equal(createStudioDevPreviewFeatureGate({ env: { DEV: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT } }).reason, 'flag_off_or_missing'));
test('413. gate open reason when authorized', () => assert.equal(createStudioDevPreviewFeatureGate({ env: AUTH_ENV }).reason, 'open'));
test('414. gate deterministic', () => assert.equal(createStudioDevPreviewFeatureGate({ env: AUTH_ENV }).featureGateDigest, featureGate.featureGateDigest));
test('415. gate flag names exposed', () => { assert.equal(featureGate.flagName, STUDIO_DEV_PREVIEW_ROUTE_FLAG); assert.equal(featureGate.checkpointFlagName, STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG); });

// Per-capability explicit contract-level assertions (repeat as top-level for coverage).
test('416. contract appTouched true', () => assert.equal(U.capabilities.appTouched, true));
test('417. contract appWiringImplemented true', () => assert.equal(U.capabilities.appWiringImplemented, true));
test('418. contract productionUiGuardExtended true', () => assert.equal(U.capabilities.productionUiGuardExtended, true));
test('419. contract featureFlagImplemented true', () => assert.equal(U.capabilities.featureFlagImplemented, true));
test('420. contract featureFlagConnectedToApp true', () => assert.equal(U.capabilities.featureFlagConnectedToApp, true));
test('421. contract devRouteAttached true', () => assert.equal(U.capabilities.devRouteAttached, true));
test('422. contract runtimeUiMountedInApp true', () => assert.equal(U.capabilities.runtimeUiMountedInApp, true));
test('423. contract runtimeUiMountedByDefault false', () => assert.equal(U.capabilities.runtimeUiMountedByDefault, false));
test('424. contract lazyImportUsed true', () => assert.equal(U.capabilities.lazyImportUsed, true));
test('425. contract eagerImportUsed false', () => assert.equal(U.capabilities.eagerImportUsed, false));
test('426. contract productionBundleContainsPreview false', () => assert.equal(U.capabilities.productionBundleContainsPreview, false));
test('427. contract deepLinkPublic false', () => assert.equal(U.capabilities.deepLinkPublic, false));
test('428. contract routeExposedToProduct false', () => assert.equal(U.capabilities.routeExposedToProduct, false));
test('429. contract menuExposedToProduct false', () => assert.equal(U.capabilities.menuExposedToProduct, false));
test('430. contract sidebarExposedToProduct false', () => assert.equal(U.capabilities.sidebarExposedToProduct, false));
test('431. contract routerWiringImplemented false', () => assert.equal(U.capabilities.routerWiringImplemented, false));
test('432. contract prototypeRelinked false', () => assert.equal(U.capabilities.prototypeRelinked, false));
test('433. contract rollbackByFlagOff true', () => assert.equal(U.capabilities.rollbackByFlagOff, true));
test('434. contract rollbackByRemovingAdditiveBlock true', () => assert.equal(U.capabilities.rollbackByRemovingAdditiveBlock, true));

// Verifier: authorized contract has no blockers; each mustBeTrue satisfied.
test('435. verifier authorized contract blockers empty', () => assert.deepEqual(verifyAppIntegration({ contract: { capabilities: caps, featureGate: { defaultEnabled: false }, appAttachment: {}, lazyPreviewLoader: {}, mountRequest: {} } }).blockers, []));
for (const [i, k] of ['defaultOff', 'isolated', 'failClosed', 'syntheticDataOnly', 'appIntegrated', 'appTouched', 'devRouteAttached', 'lazyImportUsed', 'runtimeUiMountedInApp'].entries()) {
  test(`${436 + i}. verifier mustBeTrue ${k} inversion caught`, () => assert.ok(verifyAppIntegration({ contract: { capabilities: { ...caps, [k]: false } } }).blockers.includes(`capability_${k}_must_be_true`)));
}
test('445. verifier checkedCapabilities >= 30', () => assert.ok(U.verification.checkedCapabilities >= 30));
test('446. verifier digest', () => assert.ok(String(U.verification.verificationDigest).startsWith('fnv1a-')));

// App.jsx: existing sanctioned mounts preserved (still present, not modified out).
test('447. App.jsx keeps runtime-v2 mount', () => assert.ok(/shouldMountRuntimeV2DevPreviewRoute/.test(readAppJsx())));
test('448. App.jsx keeps modelobase2 mount', () => assert.ok(/shouldMountModeloBase2FuelDevPreviewRoute/.test(readAppJsx())));
test('449. App.jsx keeps catch-all navigate route', () => assert.ok(/path="\*"\s+element=\{<Navigate to="\/" replace \/>\}/.test(readAppJsx())));
test('450. App.jsx keeps studio production route', () => assert.ok(/StudioProductionPage/.test(readAppJsx())));
test('451. App.jsx no eager import of the boundary', () => assert.ok(!/^import\s+.*StudioDevPreviewAppBoundary/m.test(readAppJsx())));
test('452. App.jsx boundary import is inside a lazy() call', () => assert.ok(/lazy\(\(\)\s*=>\s*import\([^)]*StudioDevPreviewAppBoundary/.test(readAppJsx())));
test('453. App.jsx dev-guard yields null in non-dev branch', () => assert.ok(/:\s*null;/.test(readAppJsx())));
test('454. App.jsx does not import route-menu host directly', () => assert.ok(!/StudioDevPreviewRouteMenuHost/.test(readAppJsx())));
test('455. App.jsx has no addMenuItem/registerRoute', () => assert.ok(!/addMenuItem|registerRoute/.test(readAppJsx())));
test('456. App.jsx no prisma/backend/fetch token added', () => { const d = fileDiff('src/App.jsx'); if (!d) return; assert.ok(d.added.every((a) => !/prisma|\/backend\/|\bfetch\s*\(/i.test(a))); });

// productionUiGuard structural preservation.
test('457. guard keeps productionUiOffendingFiles export', () => assert.ok(/export function productionUiOffendingFiles/.test(readGuard())));
test('458. guard keeps ISOLATED_READONLY_TEST_SUBTREES', () => assert.ok(/ISOLATED_READONLY_TEST_SUBTREES/.test(readGuard())));
test('459. guard keeps blueprint-engine whitelist', () => assert.ok(/src\/studio\/blueprint-engine\//.test(readGuard())));
test('460. guard keeps AUTHORIZED_BETA_FILES', () => assert.ok(/AUTHORIZED_BETA_FILES/.test(readGuard())));
test('461. guard DEV_ROUTE_MARKER has all four prior tokens', () => { const g = readGuard(); assert.ok(/shouldMountRuntimeV2DevPreviewRoute/.test(g) && /shouldMountModeloBase2FuelDevPreviewRoute/.test(g)); });
test('462. guard path allowlist keeps prior paths', () => { const g = readGuard(); assert.ok(/RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH/.test(g) && /MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH/.test(g)); });
test('463. guard no removal of removed-lines check', () => assert.ok(/if \(removed\.length > 0\) return false/.test(readGuard())));

// Route-menu isolated host is what the boundary renders.
test('464. boundary imports route-menu index (real consumption)', () => assert.ok(jsxImports().some((p) => /dev-preview-route-menu\/index\.js/.test(p))));
test('465. boundary references ISOLATED_ROUTE_PATHS', () => assert.ok(/ISOLATED_ROUTE_PATHS/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewAppBoundary.jsx'), 'utf8'))));
test('466. lazy boundary composes failure boundary', () => assert.ok(/StudioDevPreviewFailureBoundary/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewLazyBoundary.jsx'), 'utf8'))));
test('467. failure boundary renders fallback on error', () => assert.ok(/StudioDevPreviewFallback/.test(fs.readFileSync(path.join(DIR, 'StudioDevPreviewFailureBoundary.jsx'), 'utf8'))));

// Compatibility + fallback extra.
test('468. compat compatibleWithAppIntegrationContract', () => assert.equal(U.compatibility.compatibleWithAppIntegrationContract, true));
test('469. fallback reason set', () => assert.equal(typeof createAppIntegrationFallback({ reason: 'x' }).reason, 'string'));
test('470. fallback default reason', () => assert.equal(createAppIntegrationFallback({}).reason, 'invalid_or_missing_route_menu_runtime'));
test('471. integration off-env verify still ok (models default-off safely)', () => { const off = createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: {} }); assert.equal(off.verification.ok, true); });
test('472. integration off-env still not fallback', () => assert.equal(createStudioDevPreviewAppIntegration({ routeMenuRuntime: RM, env: {} }).fallback, false));
test('473. session sources contract version', () => assert.equal(session.sourceAppIntegrationContract, APP_INTEGRATION_CONTRACT_VERSION));
test('474. isProductionOrStaging PROD boolean true', () => assert.equal(isProductionOrStaging({ PROD: true }), true));
test('475. shouldMount blocked when PROD boolean', () => assert.equal(shouldMountStudioDevPreviewRoute({ PROD: true, DEV: 'true', [STUDIO_DEV_PREVIEW_ROUTE_FLAG]: 'true', [STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG]: REQUIRED_CHECKPOINT_RECEIPT }), false));
test('476. error catalog includes production bundle block', () => assert.ok(APP_INTEGRATION_ERROR_CODES.includes('APP_INTEGRATION_PRODUCTION_BUNDLE_CONTAINS_PREVIEW')));
test('477. error catalog includes prototype relink block', () => assert.ok(APP_INTEGRATION_ERROR_CODES.includes('APP_INTEGRATION_PROTOTYPE_RELINK_BLOCKED')));
test('478. error catalog includes app-jsx non-additive block', () => assert.ok(APP_INTEGRATION_ERROR_CODES.includes('APP_INTEGRATION_APP_JSX_NON_ADDITIVE_BLOCKED')));
test('479. error catalog includes guard weakened block', () => assert.ok(APP_INTEGRATION_ERROR_CODES.includes('APP_INTEGRATION_PRODUCTION_UI_GUARD_WEAKENED_BLOCKED')));
test('480. subtree has index.js', () => assert.ok(exists('src/studio/blueprint-engine/dev-preview-app-integration/index.js')));
test('481. subtree total files 22', () => assert.equal(jsFiles().length + jsxFiles().length, 22));
test('482. no .tsx anywhere in diff-subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('483. manifest parts count 8', () => assert.equal(Object.keys(U.manifest.parts).length, 8));
test('484. contract exposes preflight ok', () => assert.equal(U.preflight.ok, true));
test('485. contract exposes checkpoint approved', () => assert.equal(U.checkpointReceipt.approved, true));

// ===== Evidence docs (D1-D20) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-DEV-PREVIEW-APP-INTEGRATION-REPORT.md', 'ARCHITECTURE-DECISION-OPTION-A.md',
  'APP-JSX-ADDITIVE-DIFF.md', 'PRODUCTION-UI-GUARD-ADDITIVE-DIFF.md', 'FEATURE-FLAG-DEFAULT-OFF.md',
  'PRODUCTION-STAGING-FAIL-CLOSED.md', 'LAZY-IMPORT-AND-PRODUCTION-BUNDLE-ABSENCE.md', 'APP-ATTACHMENT.md',
  'RUNTIME-UI-MOUNT.md', 'FAILURE-CONTAINMENT.md', 'ROLLBACK.md', 'PROTOTYPE-RELINK-STATIC-ASSERTION.md',
  'NO-MENU-NO-SIDEBAR-NO-PRODUCT-ROUTE.md', 'NO-MODULE-NO-BACKEND-NO-PRISMA.md', 'NO-REAL-DATA.md',
  'GOVERNANCE-REGISTRY-AUTHORIZATION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'QUALITY-SCALABILITY-NOTES.md',
  'NEXT-CHECKPOINT-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-dev-preview-app-integration/${DOCS[i]}`)));
}
test('D-content. additive + bundle-absence + option-A + next checkpoint present', () => {
  assert.ok(/additive|aditiv/i.test(readEv('APP-JSX-ADDITIVE-DIFF.md')));
  assert.ok(/bundle|chunk|dist/i.test(readEv('LAZY-IMPORT-AND-PRODUCTION-BUNDLE-ABSENCE.md')));
  assert.ok(/option A|opção A|minimal|mínima/i.test(readEv('ARCHITECTURE-DECISION-OPTION-A.md')));
  assert.ok(/checkpoint|FABLE|product exposure|exposição/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));
});
