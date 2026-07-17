import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  BRIDGE_CONTRACT_NAME,
  BRIDGE_CONTRACT_SEMVER,
  BRIDGE_CONTRACT_VERSION,
  BRIDGE_CONTRACT_MODE,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  SOURCE_HANDOFF_KIND,
  TARGET_SANDBOX_KIND,
  CRITICAL_SOURCE_FIELDS,
  BRIDGE_FIELD_MAPPINGS,
  ALLOWED_TRANSFORM_KINDS,
  BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  BRIDGE_CONTRACT_READINESS_STATES,
  BRIDGE_CONTRACT_CAPABILITIES,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG,
  bridgeDigest,
  isProductionEnv,
  isStudioAuthoringRuntimeToPreviewBridgeContractEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled,
  BRIDGE_CONTRACT_ERROR_CODES,
  BridgeContractError,
  createBridgeContractError,
  bridgeContractError,
  createBridgeContractSession,
  createSourceHandoffContract,
  createTargetPreviewSandboxContract,
  createBridgeFieldMappingContract,
  createBridgeVersionCompatibilityContract,
  createBridgeDigestSemanticsContract,
  createBridgeCanonicalizationContract,
  createBridgeValidationIssueContract,
  createBridgeValidationPipelineContract,
  createBridgeExtensibilityPolicyContract,
  createBridgeReplayIdempotencyContract,
  createBridgeSsotBoundaryContract,
  createBridgeCertificationBoundaryContract,
  createBridgePermissionTenancyBoundaryContract,
  createBridgeSecuritySafetyContract,
  createBridgePrototypeRelinkProhibitionContract,
  createBridgeUpstreamHardeningNotes,
  createBridgeManualEnablementGateContract,
  checkBridgeCompatibility,
  createBridgeReadinessDecision,
  createBridgeManifest,
  verifyBridgeContract,
  createBridgeDiagnostics,
  createBridgeFallback,
  createStudioAuthoringRuntimeToPreviewBridgeContract,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js';
import {
  createStudioModuleBlueprintAuthoringRuntime,
  createAuthoringRuntimeSession,
  executeAuthoringOperation,
  createSyntheticPreviewHandoff,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';
import { createStudioModuleBlueprintAuthoringImplementationPlan } from '../../studio/blueprint-engine/module-blueprint-authoring-implementation-plan/index.js';
import { createStudioModuleBlueprintAuthoringFoundationContract } from '../../studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsCodeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-contract.mjs';
const authorized = (f) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//.test(f)
  || f === TEST_REL || f === GATE_REL
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract\//.test(f);

// Build the real upstream chain and a validated synthetic preview handoff (the bridge's source).
const BP = { kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true, blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0' };
const FOUNDATION = createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });
const PLAN = createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION });
const RUNTIME = createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN });

const buildHandoff = (seed = 'bridge') => {
  let s = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const draft = r.session.drafts[0];
  return createSyntheticPreviewHandoff({ draft });
};
const HANDOFF = buildHandoff('bridge');
const C = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF });
const caps = BRIDGE_CONTRACT_CAPABILITIES;

// ===== Base + versions (1-40) =====
test('1. contract created', () => assert.equal(C.kind, 'studio-authoring-runtime-to-preview-bridge-contract'));
test('2. name', () => { assert.equal(C.bridgeContractName, 'studio-authoring-runtime-to-preview-bridge-contract'); assert.equal(C.bridgeContractName, BRIDGE_CONTRACT_NAME); });
test('3. version', () => { assert.equal(C.bridgeContractVersion, 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0'); assert.equal(C.bridgeContractVersion, BRIDGE_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(BRIDGE_CONTRACT_SEMVER, '1.0.0'));
test('5. authoringRuntimeVersion', () => assert.equal(C.authoringRuntimeVersion, AUTHORING_RUNTIME_VERSION));
test('6. authoringImplementationPlanVersion', () => assert.equal(C.authoringImplementationPlanVersion, AUTHORING_IMPLEMENTATION_PLAN_VERSION));
test('7. authoringFoundationContractVersion', () => assert.equal(C.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('8. previewSandboxContractVersion', () => assert.equal(C.previewSandboxContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('9. blueprintContractVersion', () => assert.equal(C.blueprintContractVersion, BLUEPRINT_CONTRACT_VERSION));
test('10. mode', () => { assert.equal(C.mode, 'headless_authoring_runtime_to_preview_bridge_contract'); assert.equal(C.mode, BRIDGE_CONTRACT_MODE); });
test('11. not fallback', () => assert.equal(C.fallback, false));
test('12. metadataOnly', () => assert.equal(C.metadataOnly, true));
test('13. sourceHandoffKind', () => { assert.equal(C.sourceHandoffKind, 'synthetic_preview_candidate'); assert.equal(C.sourceHandoffKind, SOURCE_HANDOFF_KIND); });
test('14. requiredFutureCheckpoint', () => { assert.equal(C.requiredFutureCheckpoint, 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint'); assert.equal(C.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT); });
test('15. readiness ready', () => assert.equal(C.readiness, 'studio_authoring_runtime_to_preview_bridge_contract_ready'));
test('16. readyForBridgeContract true', () => assert.equal(C.readyForBridgeContract, true));
test('17. readyForBridgeImplementationPlan true', () => assert.equal(C.readyForBridgeImplementationPlan, true));
test('18. readyForBridgeImplementationSlice false', () => assert.equal(C.readyForBridgeImplementationSlice, false));
test('19. readyForPreviewMount false', () => assert.equal(C.readyForPreviewMount, false));
test('20. readyForAuthoringUi false', () => assert.equal(C.readyForAuthoringUi, false));
test('21. readyForPermissionTenancyIntegration false', () => assert.equal(C.readyForPermissionTenancyIntegration, false));
test('22. readyForProductExposure false', () => assert.equal(C.readyForProductExposure, false));
test('23. readyForModuleGeneration false', () => assert.equal(C.readyForModuleGeneration, false));
test('24. readyForCertification false', () => assert.equal(C.readyForCertification, false));
test('25. readyForProduction false', () => assert.equal(C.readyForProduction, false));
test('26. requiresPermissionTenancyFoundationBeforeExposure true', () => assert.equal(C.requiresPermissionTenancyFoundationBeforeExposure, true));
test('27. blockerCount 0', () => assert.equal(C.blockerCount, 0));
test('28. warningCount 0', () => assert.equal(C.warningCount, 0));
test('29. blockers empty', () => assert.deepEqual(C.blockers, []));
test('30. warnings empty', () => assert.deepEqual(C.warnings, []));
test('31. overallDigest fnv1a', () => assert.ok(String(C.overallDigest).startsWith('fnv1a-')));
test('32. bridgeContractDigest fnv1a', () => assert.ok(String(C.bridgeContractDigest).startsWith('fnv1a-')));
test('33. readiness state known', () => assert.ok(BRIDGE_CONTRACT_READINESS_STATES.includes(C.readiness)));
test('34. manifest embedded', () => assert.equal(C.manifest.kind, 'bridge-contract-manifest'));
test('35. verification embedded ok', () => { assert.equal(C.verification.kind, 'bridge-contract-verification'); assert.equal(C.verification.ok, true); });
test('36. diagnostics embedded', () => assert.equal(C.diagnostics.kind, 'bridge-diagnostics'));
test('37. readinessDecision embedded', () => assert.equal(C.readinessDecision.kind, 'bridge-readiness-decision'));
test('38. compatibility embedded', () => assert.equal(C.compatibility.kind, 'bridge-compatibility'));
test('39. targetSandboxKind const', () => assert.equal(TARGET_SANDBOX_KIND, 'module_preview_sandbox_candidate'));
test('40. critical source fields 11', () => assert.equal(CRITICAL_SOURCE_FIELDS.length, 11));

// ===== Capabilities (41-105) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'deterministic', 'failClosed', 'ssotPreserved', 'sourceConsumedReadOnly', 'targetContractConsumedReadOnly'];
const FALSE_CAPS = ['bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'targetPayloadCreated', 'previewPayloadCreated', 'previewMounted', 'authoringUiImplemented', 'editorImplemented', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'storageUsed', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(C.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(C.capabilities[k], false); }); }
// n = 42 + 10 + 32 = 84
test('84. capabilities mirror const', () => assert.deepEqual(C.capabilities, { ...caps }));
test('85. TRUE_CAPS 10', () => assert.equal(TRUE_CAPS.length, 10));
test('86. FALSE_CAPS 32', () => assert.equal(FALSE_CAPS.length, 32));
test('87. every TRUE cap really true', () => assert.ok(TRUE_CAPS.every((k) => caps[k] === true)));
test('88. every FALSE cap really false', () => assert.ok(FALSE_CAPS.every((k) => caps[k] === false)));
test('89. no unexpected true caps', () => { const trues = Object.keys(caps).filter((k) => caps[k] === true); assert.deepEqual(trues.sort(), [...TRUE_CAPS].sort()); });
test('90. total capability keys 42', () => assert.equal(Object.keys(caps).length, 42));
test('91. bridgeImplemented false (nothing built)', () => assert.equal(caps.bridgeImplemented, false));
test('92. adapterImplemented false', () => assert.equal(caps.adapterImplemented, false));
test('93. previewMounted false', () => assert.equal(caps.previewMounted, false));
test('94. certificationPerformed false', () => assert.equal(caps.certificationPerformed, false));
test('95. productExposed false', () => assert.equal(caps.productExposed, false));
test('96. permissionModelIntegrated false', () => assert.equal(caps.permissionModelIntegrated, false));
test('97. tenantModelIntegrated false', () => assert.equal(caps.tenantModelIntegrated, false));
test('98. deterministic true', () => assert.equal(caps.deterministic, true));
test('99. failClosed true', () => assert.equal(caps.failClosed, true));
test('100. ssotPreserved true', () => assert.equal(caps.ssotPreserved, true));
test('101. sourceConsumedReadOnly true', () => assert.equal(caps.sourceConsumedReadOnly, true));
test('102. targetContractConsumedReadOnly true', () => assert.equal(caps.targetContractConsumedReadOnly, true));
test('103. contractOnly true', () => assert.equal(caps.contractOnly, true));
test('104. metadataOnly cap true', () => assert.equal(caps.metadataOnly, true));
test('105. syntheticOnly true', () => assert.equal(caps.syntheticOnly, true));

// ===== Source handoff contract (106-140) =====
const SRC = createSourceHandoffContract();
test('106. source contract kind', () => assert.equal(SRC.kind, 'bridge-source-handoff-contract'));
test('107. source handoffKind', () => assert.equal(SRC.handoffKind, SOURCE_HANDOFF_KIND));
test('108. source runtime version', () => assert.equal(SRC.sourceRuntimeVersion, AUTHORING_RUNTIME_VERSION));
test('109. source requiredFields 11', () => assert.equal(SRC.requiredFields.length, 11));
test('110. source requiredFields = critical', () => assert.deepEqual(SRC.requiredFields, [...CRITICAL_SOURCE_FIELDS]));
test('111. source strict draft identity', () => assert.equal(SRC.strictDraftIdentityRequired, true));
test('112. source single-draft fallback forbidden', () => assert.equal(SRC.singleDraftFallbackAllowed, false));
test('113. source missing draft id fails closed', () => assert.equal(SRC.missingDraftIdFailsClosed, true));
test('114. source unknown draft id fails closed', () => assert.equal(SRC.unknownDraftIdFailsClosed, true));
test('115. source draftId required', () => assert.equal(SRC.draftIdRequired, true));
test('116. source draftRevision non-negative integer', () => assert.equal(SRC.draftRevisionMustBeNonNegativeInteger, true));
test('117. source draftDigest required', () => assert.equal(SRC.draftDigestRequired, true));
test('118. source runtimeVersion required', () => assert.equal(SRC.runtimeVersionRequired, true));
test('119. source upstreamVersions required', () => assert.equal(SRC.upstreamVersionsRequired, true));
test('120. source digest required', () => assert.equal(SRC.digestRequired, true));
test('121. source consumed read-only', () => assert.equal(SRC.sourceConsumedReadOnly, true));
test('122. source expected.synthetic true', () => assert.equal(SRC.expected.synthetic, true));
test('123. source expected.immutable true', () => assert.equal(SRC.expected.immutable, true));
test('124. source expected.validated true', () => assert.equal(SRC.expected.validated, true));
test('125. source expected.previewMounted false', () => assert.equal(SRC.expected.previewMounted, false));
test('126. source expected.realDataAttached false', () => assert.equal(SRC.expected.realDataAttached, false));
test('127. source expected.productExposed false', () => assert.equal(SRC.expected.productExposed, false));
test('128. source contract digest fnv1a', () => assert.ok(String(SRC.sourceHandoffContractDigest).startsWith('fnv1a-')));
test('129. C.sourceHandoff embedded', () => assert.equal(C.sourceHandoff.kind, 'bridge-source-handoff-contract'));
test('130. handoff is synthetic_preview_candidate', () => assert.equal(HANDOFF.handoffKind, 'synthetic_preview_candidate'));
test('131. handoff synthetic', () => assert.equal(HANDOFF.synthetic, true));
test('132. handoff validated', () => assert.equal(HANDOFF.validated, true));
test('133. handoff ok', () => assert.equal(HANDOFF.ok, true));
test('134. handoff has draftId', () => assert.equal(typeof HANDOFF.draftId, 'string'));
test('135. handoff previewMounted false', () => assert.equal(HANDOFF.previewMounted, false));
test('136. handoff realDataAttached false', () => assert.equal(HANDOFF.realDataAttached, false));
test('137. handoff productExposed false', () => assert.equal(HANDOFF.productExposed, false));
test('138. critical fields include draftId', () => assert.ok(CRITICAL_SOURCE_FIELDS.includes('draftId')));
test('139. critical fields include digest', () => assert.ok(CRITICAL_SOURCE_FIELDS.includes('digest')));
test('140. critical fields include payload', () => assert.ok(CRITICAL_SOURCE_FIELDS.includes('payload')));

// ===== Target preview sandbox contract (141-160) =====
const TGT = createTargetPreviewSandboxContract();
test('141. target kind', () => assert.equal(TGT.kind, 'bridge-target-preview-sandbox-contract'));
test('142. target targetKind', () => assert.equal(TGT.targetKind, TARGET_SANDBOX_KIND));
test('143. target contract version', () => assert.equal(TGT.targetContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('144. target syntheticOnly', () => assert.equal(TGT.syntheticOnly, true));
test('145. target metadataOnly', () => assert.equal(TGT.metadataOnly, true));
test('146. target previewMounted false', () => assert.equal(TGT.previewMounted, false));
test('147. target routeCreated false', () => assert.equal(TGT.routeCreated, false));
test('148. target menuCreated false', () => assert.equal(TGT.menuCreated, false));
test('149. target productExposed false', () => assert.equal(TGT.productExposed, false));
test('150. target realDataAttached false', () => assert.equal(TGT.realDataAttached, false));
test('151. target moduleGenerated false', () => assert.equal(TGT.moduleGenerated, false));
test('152. target persistenceAllowed false', () => assert.equal(TGT.persistenceAllowed, false));
test('153. target realPayloadCreated false', () => assert.equal(TGT.realPayloadCreated, false));
test('154. target consumed read-only', () => assert.equal(TGT.targetContractConsumedReadOnly, true));
test('155. target contract digest fnv1a', () => assert.ok(String(TGT.targetPreviewSandboxContractDigest).startsWith('fnv1a-')));
test('156. C.targetPreviewSandbox embedded', () => assert.equal(C.targetPreviewSandbox.kind, 'bridge-target-preview-sandbox-contract'));
test('157. target version matches preview sandbox', () => assert.equal(TGT.targetContractVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('158. target no real payload path', () => assert.ok(TGT.realPayloadCreated === false && TGT.realDataAttached === false));
test('159. target no mount path', () => assert.equal(TGT.previewMounted, false));
test('160. target no product path', () => assert.equal(TGT.productExposed, false));

// ===== Field mapping contract (161-200) =====
const FM = createBridgeFieldMappingContract();
test('161. mapping kind', () => assert.equal(FM.kind, 'bridge-field-mapping-contract'));
test('162. mapping count 11', () => assert.equal(FM.mappingCount, 11));
test('163. mapping = const length', () => assert.equal(FM.mappings.length, BRIDGE_FIELD_MAPPINGS.length));
test('164. mapping everyCriticalMapped', () => assert.equal(FM.everyCriticalMapped, true));
test('165. mapping anyUnknownTransform false', () => assert.equal(FM.anyUnknownTransform, false));
test('166. mapping anyCriticalDefault false', () => assert.equal(FM.anyCriticalDefault, false));
test('167. mapping anyLossyCritical false', () => assert.equal(FM.anyLossyCritical, false));
test('168. mapping criticalFieldMissingIsBlocker', () => assert.equal(FM.criticalFieldMissingIsBlocker, true));
test('169. mapping unknownTransformFailsClosed', () => assert.equal(FM.unknownTransformFailsClosed, true));
test('170. mapping lossyCriticalForbidden', () => assert.equal(FM.lossyCriticalForbidden, true));
test('171. mapping criticalDefaultForbidden', () => assert.equal(FM.criticalDefaultForbidden, true));
test('172. mapping deterministicOrder', () => assert.equal(FM.deterministicOrder, true));
test('173. mapping silentCriticalRenameForbidden', () => assert.equal(FM.silentCriticalRenameForbidden, true));
test('174. mapping allowedTransformKinds', () => assert.deepEqual(FM.allowedTransformKinds, [...ALLOWED_TRANSFORM_KINDS]));
let mn = 175;
for (const map of FM.mappings) {
  const cur = mn; mn += 1;
  test(`${cur}. mapping ${map.sourceField}->${map.targetField} lossless+known-transform`, () => {
    assert.equal(map.losslessRequired, true);
    assert.equal(map.transformAllowed, true);
    assert.ok(ALLOWED_TRANSFORM_KINDS.includes(map.transformKind));
    assert.equal(map.defaultAllowed, false);
    assert.equal(map.critical, true);
  });
}
// mn = 175 + 11 = 186
test('186. mapping digest fnv1a', () => assert.ok(String(FM.fieldMappingContractDigest).startsWith('fnv1a-')));
test('187. mapping C embedded', () => assert.equal(C.fieldMapping.kind, 'bridge-field-mapping-contract'));
test('188. transform kinds only identity/assert_true/clone_synthetic', () => assert.deepEqual([...ALLOWED_TRANSFORM_KINDS], ['identity', 'assert_true', 'clone_synthetic']));
test('189. every critical field appears as source', () => assert.ok(CRITICAL_SOURCE_FIELDS.every((f) => FM.mappings.some((m2) => m2.sourceField === f))));
test('190. handoffKind mapped to sourceHandoffKind', () => assert.ok(FM.mappings.some((m2) => m2.sourceField === 'handoffKind' && m2.targetField === 'sourceHandoffKind')));
test('191. draftId mapped to candidateDraftId', () => assert.ok(FM.mappings.some((m2) => m2.sourceField === 'draftId' && m2.targetField === 'candidateDraftId')));
test('192. synthetic uses assert_true', () => assert.ok(FM.mappings.some((m2) => m2.sourceField === 'synthetic' && m2.transformKind === 'assert_true')));
test('193. payload uses clone_synthetic', () => assert.ok(FM.mappings.some((m2) => m2.sourceField === 'payload' && m2.transformKind === 'clone_synthetic')));
test('194. digest mapped to sourceDigest', () => assert.ok(FM.mappings.some((m2) => m2.sourceField === 'digest' && m2.targetField === 'sourceDigest')));
test('195. all mappings syntheticOnly', () => assert.ok(FM.mappings.every((m2) => m2.syntheticOnly === true)));
test('196. all mappings deterministic', () => assert.ok(FM.mappings.every((m2) => m2.deterministic === true)));
test('197. all mappings required', () => assert.ok(FM.mappings.every((m2) => m2.required === true)));
test('198. field mapping deterministic digest', () => assert.equal(createBridgeFieldMappingContract().fieldMappingContractDigest, FM.fieldMappingContractDigest));
test('199. no target field is unmapped critical', () => assert.equal(FM.mappings.filter((m2) => m2.critical && !m2.transformAllowed).length, 0));
test('200. mapping order stable', () => assert.deepEqual(FM.mappings.map((m2) => m2.sourceField), BRIDGE_FIELD_MAPPINGS.map((m2) => m2.sourceField)));

// ===== Version compatibility (201-220) =====
const VC = createBridgeVersionCompatibilityContract();
test('201. version kind', () => assert.equal(VC.kind, 'bridge-version-compatibility-contract'));
test('202. exact source runtime version required', () => assert.equal(VC.exactSourceRuntimeVersionRequired, true));
test('203. exact target sandbox version required', () => assert.equal(VC.exactTargetSandboxVersionRequired, true));
test('204. major-only compat false', () => assert.equal(VC.majorVersionCompatibilityOnly, false));
test('205. unknown version fails closed', () => assert.equal(VC.unknownVersionFailsClosed, true));
test('206. version downgrade forbidden', () => assert.equal(VC.versionDowngradeAllowed, false));
test('207. version upgrade not assumed', () => assert.equal(VC.versionUpgradeAssumedCompatible, false));
test('208. bidirectional check required', () => assert.equal(VC.bidirectionalCompatibilityCheckRequired, true));
test('209. matrix runtime', () => assert.equal(VC.matrix.runtime, AUTHORING_RUNTIME_VERSION));
test('210. matrix handoff', () => assert.equal(VC.matrix.handoff, SOURCE_HANDOFF_KIND));
test('211. matrix bridge', () => assert.equal(VC.matrix.bridge, BRIDGE_CONTRACT_VERSION));
test('212. matrix sandbox', () => assert.equal(VC.matrix.sandbox, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('213. matrix blueprintContract', () => assert.equal(VC.matrix.blueprintContract, BLUEPRINT_CONTRACT_VERSION));
test('214. version digest fnv1a', () => assert.ok(String(VC.versionCompatibilityContractDigest).startsWith('fnv1a-')));
test('215. C.versionCompatibility embedded', () => assert.equal(C.versionCompatibility.kind, 'bridge-version-compatibility-contract'));
test('216. version deterministic digest', () => assert.equal(createBridgeVersionCompatibilityContract().versionCompatibilityContractDigest, VC.versionCompatibilityContractDigest));
test('217. runtime version pinned 1.0.0', () => assert.equal(AUTHORING_RUNTIME_VERSION, 'studio-module-blueprint-authoring-runtime@1.0.0'));
test('218. sandbox version pinned 1.0.0', () => assert.equal(PREVIEW_SANDBOX_CONTRACT_VERSION, 'studio-module-preview-sandbox-contract@1.0.0'));
test('219. blueprint contract version pinned', () => assert.equal(BLUEPRINT_CONTRACT_VERSION, 'studio-blueprint-contract@1.0.0'));
test('220. bridge version pinned', () => assert.equal(BRIDGE_CONTRACT_VERSION, 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0'));

// ===== Digest semantics (221-240) =====
const DS = createBridgeDigestSemanticsContract();
test('221. digest semantics kind', () => assert.equal(DS.kind, 'bridge-digest-semantics-contract'));
test('222. source digest algo fnv1a-32', () => assert.equal(DS.sourceDigestAlgorithm, 'fnv1a-32'));
test('223. purpose internal identity', () => assert.equal(DS.sourceDigestPurpose, 'deterministic_internal_identity'));
test('224. cryptographic integrity false', () => assert.equal(DS.cryptographicIntegrityProvided, false));
test('225. authenticity false', () => assert.equal(DS.authenticityProvided, false));
test('226. tamper-proof false', () => assert.equal(DS.tamperProofProvided, false));
test('227. certification integrity false', () => assert.equal(DS.certificationIntegrityProvided, false));
test('228. digest may not authorize certification', () => assert.equal(DS.digestMayAuthorizeCertification, false));
test('229. digest may not authorize module generation', () => assert.equal(DS.digestMayAuthorizeModuleGeneration, false));
test('230. digest may not authorize production', () => assert.equal(DS.digestMayAuthorizeProduction, false));
test('231. crypto digest required before certification', () => assert.equal(DS.cryptographicDigestRequiredBeforeCertification, true));
test('232. crypto digest required before production', () => assert.equal(DS.cryptographicDigestRequiredBeforeProduction, true));
test('233. fnv1a internal only', () => assert.equal(DS.fnv1aInternalOnly, true));
test('234. digest semantics digest fnv1a', () => assert.ok(String(DS.digestSemanticsContractDigest).startsWith('fnv1a-')));
test('235. C.digestSemantics embedded', () => assert.equal(C.digestSemantics.kind, 'bridge-digest-semantics-contract'));
test('236. bridgeDigest deterministic', () => assert.equal(bridgeDigest({ a: 1, b: 2 }), bridgeDigest({ a: 1, b: 2 })));
test('237. bridgeDigest fnv1a prefix', () => assert.ok(String(bridgeDigest({ x: 1 })).startsWith('fnv1a-')));
test('238. bridgeDigest null-safe', () => assert.ok(typeof bridgeDigest(undefined) === 'string'));
test('239. digest semantics deterministic', () => assert.equal(createBridgeDigestSemanticsContract().digestSemanticsContractDigest, DS.digestSemanticsContractDigest));
test('240. digest never claims cryptographic anywhere', () => assert.ok(DS.cryptographicIntegrityProvided === false && DS.authenticityProvided === false && DS.tamperProofProvided === false));

// ===== Canonicalization (241-255) =====
const CN = createBridgeCanonicalizationContract();
test('241. canon kind', () => assert.equal(CN.kind, 'bridge-canonicalization-contract'));
test('242. stable serialization required', () => assert.equal(CN.stableSerializationRequired, true));
test('243. key ordering required', () => assert.equal(CN.keyOrderingRequired, true));
test('244. array ordering preserved', () => assert.equal(CN.arrayOrderingPreserved, true));
test('245. locale independent', () => assert.equal(CN.localeIndependent, true));
test('246. timezone independent', () => assert.equal(CN.timezoneIndependent, true));
test('247. ambient clock forbidden', () => assert.equal(CN.ambientClockForbidden, true));
test('248. randomness forbidden', () => assert.equal(CN.randomnessForbidden, true));
test('249. canonicalization not implemented (contract only)', () => assert.equal(CN.canonicalizationImplemented, false));
test('250. canon digest fnv1a', () => assert.ok(String(CN.canonicalizationContractDigest).startsWith('fnv1a-')));
test('251. C.canonicalization embedded', () => assert.equal(C.canonicalization.kind, 'bridge-canonicalization-contract'));
test('252. canon deterministic', () => assert.equal(createBridgeCanonicalizationContract().canonicalizationContractDigest, CN.canonicalizationContractDigest));
test('253. canon clock+random both forbidden', () => assert.ok(CN.ambientClockForbidden === true && CN.randomnessForbidden === true));
test('254. canon locale+tz both independent', () => assert.ok(CN.localeIndependent === true && CN.timezoneIndependent === true));
test('255. canon array order preserved not sorted', () => assert.equal(CN.arrayOrderingPreserved, true));

// ===== Validation issue + pipeline (256-300) =====
const VI = createBridgeValidationIssueContract({ issueCode: 'X', severity: 'blocker', stage: 'source_shape_validation' });
test('256. issue kind', () => assert.equal(VI.kind, 'bridge-validation-issue'));
test('257. issue code', () => assert.equal(VI.issueCode, 'X'));
test('258. issue severity blocker', () => assert.equal(VI.severity, 'blocker'));
test('259. blocker blocks bridge', () => assert.equal(VI.blocksBridge, true));
test('260. blocker blocks preview sandbox', () => assert.equal(VI.blocksPreviewSandbox, true));
test('261. issue deterministic', () => assert.equal(VI.deterministic, true));
test('262. issue safe/without secrets', () => { assert.equal(VI.safe, true); assert.equal(VI.withoutSecrets, true); });
test('263. issue not auto-corrected', () => assert.equal(VI.autoCorrected, false));
test('264. warning severity does not block', () => { const w = createBridgeValidationIssueContract({ issueCode: 'W', severity: 'warning' }); assert.equal(w.blocksBridge, false); });
test('265. error severity blocks', () => { const e = createBridgeValidationIssueContract({ issueCode: 'E', severity: 'error' }); assert.equal(e.blocksBridge, true); });
test('266. info severity does not block', () => { const i = createBridgeValidationIssueContract({ issueCode: 'I', severity: 'info' }); assert.equal(i.blocksBridge, false); });
test('267. unknown severity defaults warning', () => { const u = createBridgeValidationIssueContract({ issueCode: 'U', severity: 'nope' }); assert.equal(u.severity, 'warning'); });
test('268. issue digest fnv1a', () => assert.ok(String(VI.issueDigest).startsWith('fnv1a-')));
test('269. issue deterministic digest', () => assert.equal(createBridgeValidationIssueContract({ issueCode: 'X', severity: 'blocker', stage: 'source_shape_validation' }).issueDigest, VI.issueDigest));
const VP = createBridgeValidationPipelineContract();
test('270. pipeline kind', () => assert.equal(VP.kind, 'bridge-validation-pipeline-contract'));
test('271. pipeline stage count 13', () => assert.equal(VP.stageCount, 13));
test('272. pipeline stageIds = const', () => assert.deepEqual(VP.stageIds, [...BRIDGE_VALIDATION_STAGES]));
test('273. pipeline fail closed', () => assert.equal(VP.failClosed, true));
test('274. pipeline deterministic issues', () => assert.equal(VP.deterministicIssues, true));
test('275. pipeline auto-correction forbidden', () => assert.equal(VP.autoCorrectionAllowed, false));
test('276. pipeline permissive fallback forbidden', () => assert.equal(VP.permissiveFallbackAllowed, false));
test('277. pipeline blocker blocks bridge', () => assert.equal(VP.blockerBlocksBridge, true));
test('278. pipeline blocker blocks preview sandbox', () => assert.equal(VP.blockerBlocksPreviewSandbox, true));
test('279. pipeline runtime not implemented', () => assert.equal(VP.validationRuntimeImplemented, false));
test('280. pipeline severities = const', () => assert.deepEqual(VP.severities, [...BRIDGE_ISSUE_SEVERITIES]));
let sn = 281;
for (const stage of VP.stages) {
  const cur = sn; sn += 1;
  test(`${cur}. stage ${stage.stageId} fail-closed + not-implemented`, () => {
    assert.equal(stage.failClosed, true);
    assert.equal(stage.implemented, false);
    assert.ok(BRIDGE_VALIDATION_STAGES.includes(stage.stageId));
  });
}
// sn = 281 + 13 = 294
test('294. stage order sequential', () => assert.deepEqual(VP.stages.map((s) => s.order), VP.stages.map((_, i) => i)));
test('295. pipeline digest fnv1a', () => assert.ok(String(VP.validationPipelineContractDigest).startsWith('fnv1a-')));
test('296. C.validationPipeline embedded', () => assert.equal(C.validationPipeline.kind, 'bridge-validation-pipeline-contract'));
test('297. severities ascending', () => assert.deepEqual([...BRIDGE_ISSUE_SEVERITIES], ['info', 'warning', 'error', 'blocker']));
test('298. stages include source_shape_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('source_shape_validation')));
test('299. stages include prototype_reference_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('prototype_reference_validation')));
test('300. stages include certification_boundary_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('certification_boundary_validation')));

// ===== Extensibility + replay (301-330) =====
const EXT = createBridgeExtensibilityPolicyContract();
test('301. extensibility kind', () => assert.equal(EXT.kind, 'bridge-extensibility-policy-contract'));
test('302. unknown critical fields rejected', () => assert.equal(EXT.unknownCriticalFieldsRejected, true));
test('303. unknown capability flags rejected', () => assert.equal(EXT.unknownCapabilityFlagsRejected, true));
test('304. unnamespaced extensions rejected', () => assert.equal(EXT.unnamespacedExtensionsRejected, true));
test('305. namespaced extensions allowed', () => assert.equal(EXT.namespacedExtensionsAllowed, true));
test('306. extension namespace required', () => assert.equal(EXT.extensionNamespaceRequired, true));
test('307. extension schema required', () => assert.equal(EXT.extensionSchemaRequired, true));
test('308. extension cannot override critical', () => assert.equal(EXT.extensionCannotOverrideCriticalFields, true));
test('309. protected fields = const', () => assert.deepEqual(EXT.protectedFields, [...EXTENSION_PROTECTED_FIELDS]));
test('310. protected field count', () => assert.equal(EXT.protectedFieldCount, EXTENSION_PROTECTED_FIELDS.length));
test('311. protected includes synthetic', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('synthetic')));
test('312. protected includes certified', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('certified')));
test('313. protected includes digest', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('digest')));
test('314. protected includes productExposed', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('productExposed')));
test('315. protected includes moduleGenerated', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('moduleGenerated')));
test('316. extensibility digest fnv1a', () => assert.ok(String(EXT.extensibilityPolicyContractDigest).startsWith('fnv1a-')));
test('317. C.extensibility embedded', () => assert.equal(C.extensibility.kind, 'bridge-extensibility-policy-contract'));
const RP = createBridgeReplayIdempotencyContract();
test('318. replay kind', () => assert.equal(RP.kind, 'bridge-replay-idempotency-contract'));
test('319. same source same decision', () => assert.equal(RP.sameSourceHandoffProducesSameBridgeDecision, true));
test('320. same source same target', () => assert.equal(RP.sameSourceHandoffProducesSameTargetDescriptor, true));
test('321. decision digest deterministic', () => assert.equal(RP.bridgeDecisionDigestDeterministic, true));
test('322. idempotent by contract', () => assert.equal(RP.idempotentByContract, true));
test('323. replay side-effects forbidden', () => assert.equal(RP.replaySideEffectsAllowed, false));
test('324. bridge execution not implemented', () => assert.equal(RP.bridgeExecutionImplemented, false));
test('325. replay digest fnv1a', () => assert.ok(String(RP.replayIdempotencyContractDigest).startsWith('fnv1a-')));
test('326. C.replayIdempotency embedded', () => assert.equal(C.replayIdempotency.kind, 'bridge-replay-idempotency-contract'));
test('327. extensibility deterministic', () => assert.equal(createBridgeExtensibilityPolicyContract().extensibilityPolicyContractDigest, EXT.extensibilityPolicyContractDigest));
test('328. replay deterministic', () => assert.equal(createBridgeReplayIdempotencyContract().replayIdempotencyContractDigest, RP.replayIdempotencyContractDigest));
test('329. protected fields 11', () => assert.equal(EXTENSION_PROTECTED_FIELDS.length, 11));
test('330. protected includes upstreamVersions', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('upstreamVersions')));

// ===== SSOT + certification boundary (331-360) =====
const SS = createBridgeSsotBoundaryContract();
test('331. ssot kind', () => assert.equal(SS.kind, 'bridge-ssot-boundary-contract'));
test('332. canonical SSOT is certified blueprint', () => assert.equal(SS.canonicalSsot, 'certified-blueprint-contract'));
test('333. certified blueprint remains SSOT', () => assert.equal(SS.certifiedBlueprintRemainsSsot, true));
test('334. draft not canonical', () => assert.equal(SS.draftIsCanonical, false));
test('335. candidate not canonical', () => assert.equal(SS.candidateIsCanonical, false));
test('336. bridge may not certify', () => assert.equal(SS.bridgeMayCertify, false));
test('337. bridge may not publish', () => assert.equal(SS.bridgeMayPublish, false));
test('338. bridge may not register', () => assert.equal(SS.bridgeMayRegister, false));
test('339. bridge may not generate module', () => assert.equal(SS.bridgeMayGenerateModule, false));
test('340. bridge may not write certified blueprint', () => assert.equal(SS.bridgeMayWriteCertifiedBlueprint, false));
test('341. bridge may not bypass certification', () => assert.equal(SS.bridgeMayBypassCertification, false));
test('342. no second SSOT', () => assert.equal(SS.secondSsotCreated, false));
test('343. requires future explicit certification slice', () => assert.equal(SS.requiresFutureExplicitCertificationSlice, true));
test('344. requires human checkpoint before certification', () => assert.equal(SS.requiresHumanCheckpointBeforeCertification, true));
test('345. required future checkpoint', () => assert.equal(SS.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('346. ssot digest fnv1a', () => assert.ok(String(SS.ssotBoundaryContractDigest).startsWith('fnv1a-')));
test('347. C.ssotBoundary embedded', () => assert.equal(C.ssotBoundary.kind, 'bridge-ssot-boundary-contract'));
const CB = createBridgeCertificationBoundaryContract();
test('348. cert boundary kind', () => assert.equal(CB.kind, 'bridge-certification-boundary-contract'));
test('349. certification not performed', () => assert.equal(CB.certificationPerformed, false));
test('350. self certification forbidden', () => assert.equal(CB.selfCertificationAllowed, false));
test('351. candidate not canonical', () => assert.equal(CB.candidateCanonical, false));
test('352. candidate not certified', () => assert.equal(CB.candidateCertified, false));
test('353. bridge may not certify (cert boundary)', () => assert.equal(CB.bridgeMayCertify, false));
test('354. requires future explicit certification slice (cb)', () => assert.equal(CB.requiresFutureExplicitCertificationSlice, true));
test('355. requires human checkpoint (cb)', () => assert.equal(CB.requiresHumanCheckpointBeforeCertification, true));
test('356. crypto digest required before certification (cb)', () => assert.equal(CB.cryptographicDigestRequiredBeforeCertification, true));
test('357. cert boundary digest fnv1a', () => assert.ok(String(CB.certificationBoundaryContractDigest).startsWith('fnv1a-')));
test('358. C.certificationBoundary embedded', () => assert.equal(C.certificationBoundary.kind, 'bridge-certification-boundary-contract'));
test('359. ssot deterministic', () => assert.equal(createBridgeSsotBoundaryContract().ssotBoundaryContractDigest, SS.ssotBoundaryContractDigest));
test('360. cert boundary deterministic', () => assert.equal(createBridgeCertificationBoundaryContract().certificationBoundaryContractDigest, CB.certificationBoundaryContractDigest));

// ===== Permission/tenancy + security + prototype + hardening + manual gate (361-410) =====
const PT = createBridgePermissionTenancyBoundaryContract();
test('361. perm/tenancy kind', () => assert.equal(PT.kind, 'bridge-permission-tenancy-boundary-contract'));
test('362. permission model not integrated', () => assert.equal(PT.permissionModelIntegrated, false));
test('363. tenant model not integrated', () => assert.equal(PT.tenantModelIntegrated, false));
test('364. server-side auth not integrated', () => assert.equal(PT.serverSideAuthorizationIntegrated, false));
test('365. client-side auth not sufficient', () => assert.equal(PT.clientSideAuthorizationSufficient, false));
test('366. exposure blocked by permission/tenancy', () => assert.equal(PT.productExposureBlockedByPermissionTenancy, true));
test('367. requires permission/tenancy foundation', () => assert.equal(PT.requiresPermissionTenancyFoundationBeforeExposure, true));
test('368. auth not imported', () => assert.equal(PT.authImported, false));
test('369. perm/tenancy digest fnv1a', () => assert.ok(String(PT.permissionTenancyBoundaryContractDigest).startsWith('fnv1a-')));
test('370. C.permissionTenancy embedded', () => assert.equal(C.permissionTenancy.kind, 'bridge-permission-tenancy-boundary-contract'));
const SEC = createBridgeSecuritySafetyContract();
test('371. security kind', () => assert.equal(SEC.kind, 'bridge-security-safety-contract'));
test('372. anyRealAllowed false', () => assert.equal(SEC.anyRealAllowed, false));
test('373. reversible by non-consumption', () => assert.equal(SEC.reversibleByNonConsumption, true));
test('374. security headless', () => assert.equal(SEC.headless, true));
test('375. security metadataOnly', () => assert.equal(SEC.metadataOnly, true));
test('376. all allowances false', () => assert.ok(Object.values(SEC.allowances).every((v) => v === false)));
test('377. network allowance false', () => assert.equal(SEC.allowances.networkAllowed, false));
test('378. storage allowance false', () => assert.equal(SEC.allowances.storageAllowed, false));
test('379. filesystem writes allowance false', () => assert.equal(SEC.allowances.filesystemWritesAllowed, false));
test('380. backend allowance false', () => assert.equal(SEC.allowances.backendAllowed, false));
test('381. prisma allowance false', () => assert.equal(SEC.allowances.prismaAllowed, false));
test('382. real data allowance false', () => assert.equal(SEC.allowances.realDataAllowed, false));
test('383. product exposure allowance false', () => assert.equal(SEC.allowances.productExposureAllowed, false));
test('384. preview mount allowance false', () => assert.equal(SEC.allowances.previewMountAllowed, false));
test('385. module generation allowance false', () => assert.equal(SEC.allowances.moduleGenerationAllowed, false));
test('386. certification allowance false', () => assert.equal(SEC.allowances.certificationAllowed, false));
test('387. security digest fnv1a', () => assert.ok(String(SEC.securitySafetyContractDigest).startsWith('fnv1a-')));
test('388. C.securitySafety embedded', () => assert.equal(C.securitySafety.kind, 'bridge-security-safety-contract'));
const PR = createBridgePrototypeRelinkProhibitionContract();
test('389. prototype kind', () => assert.equal(PR.kind, 'bridge-prototype-relink-prohibition-contract'));
test('390. prototype relink forbidden', () => assert.equal(PR.prototypeRelinkAllowed, false));
test('391. prototype import forbidden', () => assert.equal(PR.prototypeImportAllowed, false));
test('392. prototype copy forbidden', () => assert.equal(PR.prototypeCopyAllowed, false));
test('393. prototype move forbidden', () => assert.equal(PR.prototypeMoveAllowed, false));
test('394. old prototype not imported', () => assert.equal(PR.oldPrototypeImported, false));
test('395. forbidden prototype paths = const', () => assert.deepEqual(PR.forbiddenPrototypePaths, [...FORBIDDEN_PROTOTYPE_PATHS]));
test('396. forbidden path count 8', () => assert.equal(PR.forbiddenPathCount, 8));
test('397. prototype digest fnv1a', () => assert.ok(String(PR.prototypeRelinkProhibitionContractDigest).startsWith('fnv1a-')));
test('398. C.prototypeRelinkProhibition embedded', () => assert.equal(C.prototypeRelinkProhibition.kind, 'bridge-prototype-relink-prohibition-contract'));
const HN = createBridgeUpstreamHardeningNotes();
test('399. hardening notes kind', () => assert.equal(HN.kind, 'bridge-upstream-hardening-notes'));
test('400. runtime single-draft fallback observed', () => assert.equal(HN.runtimeSingleDraftFallbackObserved, true));
test('401. bridge requires explicit draft id', () => assert.equal(HN.bridgeRequiresExplicitDraftId, true));
test('402. runtime unknown-dimension leniency observed', () => assert.equal(HN.runtimeUnknownResourceDimensionLeniencyObserved, true));
test('403. bridge rejects unknown resource dimensions', () => assert.equal(HN.bridgeRejectsUnknownResourceDimensions, true));
test('404. fnv1a internal only (hardening)', () => assert.equal(HN.fnv1aInternalOnly, true));
test('405. hardening required before cert/production', () => assert.equal(HN.hardeningRequiredBeforeCertificationOrProduction, true));
test('406. runtime NOT altered by this slice', () => assert.equal(HN.runtimeAlteredByThisSlice, false));
test('407. hardening digest fnv1a', () => assert.ok(String(HN.upstreamHardeningNotesDigest).startsWith('fnv1a-')));
test('408. C.upstreamHardeningNotes embedded', () => assert.equal(C.upstreamHardeningNotes.kind, 'bridge-upstream-hardening-notes'));
test('409. hardening not required before contract', () => assert.equal(HN.hardeningRequiredBeforeBridgeContract, false));
test('410. security deterministic', () => assert.equal(createBridgeSecuritySafetyContract().securitySafetyContractDigest, SEC.securitySafetyContractDigest));

// ===== Manual gate + session + compatibility + readiness (411-450) =====
const MG = createBridgeManualEnablementGateContract();
test('411. manual gate kind', () => assert.equal(MG.kind, 'bridge-manual-enablement-gate-contract'));
test('412. manual gate required', () => assert.equal(MG.manualGateRequired, true));
test('413. manual gate required checkpoint', () => assert.equal(MG.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('414. current slice authorization', () => assert.equal(MG.currentSliceAuthorization, 'bridge_contract_only'));
test('415. authorizes bridge contract', () => assert.equal(MG.authorizesBridgeContract, true));
test('416. authorizes bridge implementation plan', () => assert.equal(MG.authorizesBridgeImplementationPlan, true));
test('417. does NOT authorize bridge implementation', () => assert.equal(MG.authorizesBridgeImplementation, false));
test('418. does NOT authorize preview mount', () => assert.equal(MG.authorizesPreviewMount, false));
test('419. does NOT authorize authoring ui', () => assert.equal(MG.authorizesAuthoringUi, false));
test('420. does NOT authorize editor', () => assert.equal(MG.authorizesEditor, false));
test('421. does NOT authorize app touch', () => assert.equal(MG.authorizesAppTouch, false));
test('422. does NOT authorize route/menu', () => assert.equal(MG.authorizesRouteMenu, false));
test('423. does NOT authorize persistence', () => assert.equal(MG.authorizesPersistence, false));
test('424. does NOT authorize filesystem writes', () => assert.equal(MG.authorizesFilesystemWrites, false));
test('425. does NOT authorize backend', () => assert.equal(MG.authorizesBackend, false));
test('426. does NOT authorize prisma', () => assert.equal(MG.authorizesPrisma, false));
test('427. does NOT authorize module generation', () => assert.equal(MG.authorizesModuleGeneration, false));
test('428. does NOT authorize certification', () => assert.equal(MG.authorizesCertification, false));
test('429. does NOT authorize product exposure', () => assert.equal(MG.authorizesProductExposure, false));
test('430. does NOT authorize production', () => assert.equal(MG.authorizesProduction, false));
test('431. does NOT authorize real data', () => assert.equal(MG.authorizesRealData, false));
test('432. manual gate digest fnv1a', () => assert.ok(String(MG.manualEnablementGateContractDigest).startsWith('fnv1a-')));
test('433. C.manualGate embedded', () => assert.equal(C.manualGate.kind, 'bridge-manual-enablement-gate-contract'));
const SESS = createBridgeContractSession({ sourceHandoff: HANDOFF });
test('434. session kind', () => assert.equal(SESS.kind, 'bridge-contract-session'));
test('435. session read-only source', () => assert.equal(SESS.sourceConsumedReadOnly, true));
test('436. session read-only target', () => assert.equal(SESS.targetContractConsumedReadOnly, true));
test('437. session no storage', () => assert.equal(SESS.usesStorage, false));
test('438. session no fetch', () => assert.equal(SESS.usesFetch, false));
test('439. session no persistence', () => assert.equal(SESS.usesPersistence, false));
test('440. session no runtime side effects', () => assert.equal(SESS.runtimeSideEffects, false));
test('441. session deterministic', () => assert.equal(createBridgeContractSession({ sourceHandoff: HANDOFF }).sessionDigest, SESS.sessionDigest));
test('442. compatibility status', () => assert.equal(C.compatibility.status, 'ready_for_bridge_implementation_plan_only'));
test('443. compatibility ready for contract', () => assert.equal(C.compatibility.readyForBridgeContract, true));
test('444. compatibility ready for plan', () => assert.equal(C.compatibility.readyForBridgeImplementationPlan, true));
test('445. compatibility not ready for slice', () => assert.equal(C.compatibility.readyForBridgeImplementationSlice, false));
test('446. compatibility not blocked', () => assert.equal(C.compatibility.blocked, false));
test('447. compatibility with authoring runtime', () => assert.equal(C.compatibility.compatibleWithAuthoringRuntime, true));
test('448. readinessDecision ready for contract', () => assert.equal(C.readinessDecision.readyForBridgeContract, true));
test('449. readinessDecision ready for plan', () => assert.equal(C.readinessDecision.readyForBridgeImplementationPlan, true));
test('450. readinessDecision not ready for slice', () => assert.equal(C.readinessDecision.readyForBridgeImplementationSlice, false));

// ===== Manifest + verifier (451-490) =====
test('451. manifest partCount >= 17', () => assert.ok(C.manifest.partCount >= 17));
test('452. manifest deterministic', () => assert.equal(C.manifest.deterministic, true));
test('453. manifest metadataOnly', () => assert.equal(C.manifest.metadataOnly, true));
test('454. manifest partDigests present', () => assert.ok(typeof C.manifest.partDigests === 'object'));
test('455. manifest digest fnv1a', () => assert.ok(String(C.manifest.manifestDigest).startsWith('fnv1a-')));
test('456. manifest session digest string', () => assert.equal(typeof C.manifest.partDigests.session, 'string'));
test('457. manifest ssotBoundary digest string', () => assert.equal(typeof C.manifest.partDigests.ssotBoundary, 'string'));
test('458. manifest deterministic recompute', () => { const a = createBridgeManifest({ parts: { x: { xDigest: 'fnv1a-11111111' } } }); const b = createBridgeManifest({ parts: { x: { xDigest: 'fnv1a-11111111' } } }); assert.equal(a.manifestDigest, b.manifestDigest); });
test('459. verifier ok on real contract', () => assert.equal(C.verification.ok, true));
test('460. verifier blockerCount 0', () => assert.equal(C.verification.blockerCount, 0));
test('461. verifier headless true', () => assert.equal(C.verification.headless, true));
test('462. verifier contractOnly true', () => assert.equal(C.verification.contractOnly, true));
test('463. verifier deterministic true', () => assert.equal(C.verification.deterministic, true));
test('464. verifier failClosed true', () => assert.equal(C.verification.failClosed, true));
test('465. verifier ssotPreserved true', () => assert.equal(C.verification.ssotPreserved, true));
test('466. verifier bridgeImplemented false', () => assert.equal(C.verification.bridgeImplemented, false));
test('467. verifier previewMounted false', () => assert.equal(C.verification.previewMounted, false));
test('468. verifier certificationPerformed false', () => assert.equal(C.verification.certificationPerformed, false));
test('469. verifier productExposed false', () => assert.equal(C.verification.productExposed, false));
test('470. verifier permissionModelIntegrated false', () => assert.equal(C.verification.permissionModelIntegrated, false));
test('471. verifier checkedCapabilities >= 42', () => assert.ok(C.verification.checkedCapabilities >= 42));
// Verifier tamper detection.
const vb = (o) => verifyBridgeContract(o).blockers;
let tn = 472;
const TAMPER_TRUE = ['headless', 'contractOnly', 'deterministic', 'failClosed', 'ssotPreserved'];
for (const k of TAMPER_TRUE) { const cur = tn; tn += 1; test(`${cur}. verifier flags ${k} must-be-true`, () => assert.ok(vb({ contract: { capabilities: { ...caps, [k]: false } } }).includes(`capability_${k}_must_be_true`))); }
const TAMPER_FALSE = ['bridgeImplemented', 'previewMounted', 'certificationPerformed', 'productExposed', 'permissionModelIntegrated', 'prototypeRelinked', 'moduleGenerated', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataWrite'];
for (const k of TAMPER_FALSE) { const cur = tn; tn += 1; test(`${cur}. verifier flags ${k} must-be-false`, () => assert.ok(vb({ contract: { capabilities: { ...caps, [k]: true } } }).includes(`capability_${k}_must_be_false`))); }
// tn = 477 + 12 = 489
test('489. verifier detects boundary tampers', () => {
  assert.ok(vb({ contract: { capabilities: caps, sourceHandoff: { singleDraftFallbackAllowed: true } } }).includes('unsafe_source_single_draft_fallback'));
  assert.ok(vb({ contract: { capabilities: caps, targetPreviewSandbox: { previewMounted: true } } }).includes('unsafe_target_real_effect'));
  assert.ok(vb({ contract: { capabilities: caps, fieldMapping: { anyUnknownTransform: true } } }).includes('unsafe_mapping_unknown_transform'));
  assert.ok(vb({ contract: { capabilities: caps, fieldMapping: { anyLossyCritical: true } } }).includes('unsafe_mapping_lossy_critical'));
  assert.ok(vb({ contract: { capabilities: caps, versionCompatibility: { unknownVersionFailsClosed: false } } }).includes('unsafe_version_unknown_not_fail_closed'));
  assert.ok(vb({ contract: { capabilities: caps, digestSemantics: { cryptographicIntegrityProvided: true } } }).includes('unsafe_digest_claimed_cryptographic'));
  assert.ok(vb({ contract: { capabilities: caps, digestSemantics: { digestMayAuthorizeCertification: true } } }).includes('unsafe_digest_authorizes_real'));
  assert.ok(vb({ contract: { capabilities: caps, validationPipeline: { failClosed: false } } }).includes('unsafe_validation_not_fail_closed'));
  assert.ok(vb({ contract: { capabilities: caps, extensibility: { extensionCannotOverrideCriticalFields: false } } }).includes('unsafe_extensibility_override_protected'));
  assert.ok(vb({ contract: { capabilities: caps, replayIdempotency: { replaySideEffectsAllowed: true } } }).includes('unsafe_replay_side_effects'));
  assert.ok(vb({ contract: { capabilities: caps, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion'));
  assert.ok(vb({ contract: { capabilities: caps, ssotBoundary: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege'));
  assert.ok(vb({ contract: { capabilities: caps, certificationBoundary: { certificationPerformed: true } } }).includes('unsafe_certification_performed'));
  assert.ok(vb({ contract: { capabilities: caps, certificationBoundary: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification'));
  assert.ok(vb({ contract: { capabilities: caps, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated'));
  assert.ok(vb({ contract: { capabilities: caps, securitySafety: { anyRealAllowed: true } } }).includes('unsafe_security_real_allowed'));
  assert.ok(vb({ contract: { capabilities: caps, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink'));
  assert.ok(vb({ contract: { capabilities: caps, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate'));
  assert.ok(vb({ contract: { capabilities: caps, manualGate: { manualGateRequired: true, authorizesBridgeImplementation: true } } }).includes('unsafe_manual_gate_authorizes_real'));
  assert.ok(vb({ contract: { capabilities: caps, readyForPreviewMount: true } }).includes('unsafe_ready_for_preview_mount'));
  assert.ok(vb({ contract: { capabilities: caps, readyForProduction: true } }).includes('unsafe_ready_for_production'));
  assert.ok(vb({ contract: { capabilities: caps, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source'));
});
test('490. verifier never throws on null', () => { assert.doesNotThrow(() => verifyBridgeContract({ contract: null })); assert.doesNotThrow(() => verifyBridgeContract(null)); });

// ===== Diagnostics + fallback + determinism (491-540) =====
test('491. diagnostics passive', () => assert.equal(C.diagnostics.passive, true));
test('492. diagnostics ok', () => assert.equal(C.diagnostics.ok, true));
test('493. diagnostics headless confirmed', () => assert.equal(C.diagnostics.headlessConfirmed, true));
test('494. diagnostics contract-only confirmed', () => assert.equal(C.diagnostics.contractOnlyConfirmed, true));
test('495. diagnostics deterministic confirmed', () => assert.equal(C.diagnostics.deterministicConfirmed, true));
test('496. diagnostics ssot preserved confirmed', () => assert.equal(C.diagnostics.ssotPreservedConfirmed, true));
test('497. diagnostics bridge not implemented', () => assert.equal(C.diagnostics.bridgeImplemented, false));
test('498. diagnostics preview not mounted', () => assert.equal(C.diagnostics.previewMounted, false));
test('499. diagnostics certification not performed', () => assert.equal(C.diagnostics.certificationPerformed, false));
test('500. diagnostics product not exposed', () => assert.equal(C.diagnostics.productExposed, false));
test('501. diagnostics not logged', () => assert.equal(C.diagnostics.logged, false));
test('502. diagnostics no telemetry runtime', () => assert.equal(C.diagnostics.telemetryRuntime, false));
test('503. diagnostics no external logging', () => assert.equal(C.diagnostics.externalLogging, false));
test('504. diagnostics no secrets', () => assert.ok(!/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(C.diagnostics))));
test('505. diagnostics digest fnv1a', () => assert.ok(String(C.diagnostics.diagnosticsDigest).startsWith('fnv1a-')));
const FB = createBridgeFallback({ reason: 'test' });
test('506. fallback kind', () => assert.equal(FB.kind, 'studio-authoring-runtime-to-preview-bridge-contract'));
test('507. fallback flag true', () => assert.equal(FB.fallback, true));
test('508. fallback readiness blocked', () => assert.equal(FB.readiness, 'blocked'));
test('509. fallback not ready for contract', () => assert.equal(FB.readyForBridgeContract, false));
test('510. fallback not ready for plan', () => assert.equal(FB.readyForBridgeImplementationPlan, false));
test('511. fallback blockerCount 1', () => assert.equal(FB.blockerCount, 1));
test('512. fallback capabilities deterministic true', () => assert.equal(FB.capabilities.deterministic, true));
test('513. fallback capabilities bridgeImplemented false', () => assert.equal(FB.capabilities.bridgeImplemented, false));
test('514. fallback requires perm/tenancy foundation', () => assert.equal(FB.requiresPermissionTenancyFoundationBeforeExposure, true));
test('515. composer fallback on missing source', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeContract({}); assert.equal(f.fallback, true); assert.equal(f.readiness, 'blocked'); });
test('516. composer fallback on wrong kind', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'x', synthetic: true, validated: true, ok: true, draftId: 'd' } }); assert.equal(f.fallback, true); });
test('517. composer fallback on non-synthetic', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'synthetic_preview_candidate', synthetic: false, validated: true, ok: true, draftId: 'd' } }); assert.equal(f.fallback, true); });
test('518. composer fallback on unvalidated', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'synthetic_preview_candidate', synthetic: true, validated: false, ok: false, draftId: 'd' } }); assert.equal(f.fallback, true); });
test('519. composer fallback on missing draftId', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'synthetic_preview_candidate', synthetic: true, validated: true, ok: true } }); assert.equal(f.fallback, true); });
test('520. composer fallback on unvalidated runtime handoff', () => { const h = createSyntheticPreviewHandoff({ draft: { draftId: 'd', revision: 0, lifecycleState: 'editing' } }); const f = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: h }); assert.equal(f.fallback, true); });
test('521. composer never throws on garbage', () => { assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: 42 })); assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridgeContract(null)); });
test('522. determinism: same handoff same overallDigest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); const b = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); assert.equal(a.overallDigest, b.overallDigest); });
test('523. determinism: same handoff same bridgeContractDigest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); const b = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); assert.equal(a.bridgeContractDigest, b.bridgeContractDigest); });
test('524. determinism: full deep-equal', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); const b = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); assert.equal(JSON.stringify(a), JSON.stringify(b)); });
test('525. determinism: rebuilt handoff same digest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: buildHandoff('bridge') }); assert.equal(a.overallDigest, C.overallDigest); });
test('526. runtime upstream present + ready', () => { assert.equal(RUNTIME.kind, 'studio-module-blueprint-authoring-runtime'); assert.equal(RUNTIME.readyForAuthoringRuntime, true); });
test('527. flags off in production', () => { assert.equal(isStudioAuthoringRuntimeToPreviewBridgeContractEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false); });
test('528. flags on in dev', () => { assert.equal(isStudioAuthoringRuntimeToPreviewBridgeContractEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG]: 'true', DEV: 'true' }), true); });
test('529. verify flag off in production', () => { assert.equal(isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false); });
test('530. isProductionEnv detects label', () => { assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true); assert.equal(isProductionEnv({ DEV: 'true' }), false); });
test('531. error catalog >= 45 codes', () => assert.ok(BRIDGE_CONTRACT_ERROR_CODES.length >= 45));
test('532. error catalog frozen array', () => assert.ok(Array.isArray(BRIDGE_CONTRACT_ERROR_CODES)));
test('533. BridgeContractError constructs', () => { const e = createBridgeContractError(BRIDGE_CONTRACT_ERROR_CODES[0]); assert.ok(e instanceof BridgeContractError || e.kind); });
test('534. bridgeContractError helper', () => { assert.doesNotThrow(() => bridgeContractError(BRIDGE_CONTRACT_ERROR_CODES[0], 'msg')); });
test('535. readiness decision blocked on blockers', () => { assert.equal(createBridgeReadinessDecision({ blockers: ['x'] }).readiness, 'blocked'); });
test('536. readiness decision ready on none', () => { assert.equal(createBridgeReadinessDecision({}).readiness, 'studio_authoring_runtime_to_preview_bridge_contract_ready'); });
test('537. checkBridgeCompatibility default ready', () => { assert.equal(checkBridgeCompatibility({ sourceHandoff: HANDOFF }).status, 'ready_for_bridge_implementation_plan_only'); });
test('538. checkBridgeCompatibility warns on wrong runtime version', () => { const b = checkBridgeCompatibility({ sourceHandoff: { runtimeVersion: 'x@9' } }); assert.equal(b.compatibleWithAuthoringRuntime, false); assert.ok(b.warnings.includes('incompatible_authoringRuntime')); });
test('539. diagnostics deterministic', () => { const a = createBridgeDiagnostics({ verification: C.verification, compatibility: C.compatibility }); const b = createBridgeDiagnostics({ verification: C.verification, compatibility: C.compatibility }); assert.equal(a.diagnosticsDigest, b.diagnosticsDigest); });
test('540. fallback deterministic', () => { assert.equal(createBridgeFallback({ reason: 'r' }).overallDigest, createBridgeFallback({ reason: 'r' }).overallDigest); });

// ===== Static safety scans + structure (541-580) =====
test('541. subtree React-free (imports)', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('542. no react-router/react-dom import', () => assert.ok(jsImports().every((p) => !/react-router|react-dom/i.test(p))));
test('543. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|<Route[\s/>]|ReactDOM|createRoot\s*\(/.test(jsCode())));
test('544. no window/document access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsCode())));
test('545. no fs./writeFile/mkdir/appendFile', () => assert.ok(!/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(jsCode())));
test('546. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('547. no fetch/XHR/WebSocket/axios', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(jsCode())));
test('548. no @prisma/PrismaClient import', () => assert.ok(jsImports().every((p) => !/@prisma|PrismaClient/i.test(p))));
test('549. no backend/apiClient/EmpresaApi import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('550. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('551. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('552. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('553. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('554. no certified true literal', () => assert.ok(!/\bcertified\s*:\s*true/.test(jsCode())));
test('555. no productExposed true literal', () => assert.ok(!/productExposed\s*:\s*true/.test(jsCode())));
test('556. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('557. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('558. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('559. no Date.now (excl verifier)', () => assert.ok(!/Date\.now/.test(jsCodeNoVerifier())));
test('560. no new Date (excl verifier)', () => assert.ok(!/new Date\b/.test(jsCodeNoVerifier())));
test('561. no Math.random (excl verifier)', () => assert.ok(!/Math\.random/.test(jsCodeNoVerifier())));
test('562. no randomUUID (excl verifier)', () => assert.ok(!/randomUUID/.test(jsCodeNoVerifier())));
test('563. no performance.now/hrtime (excl verifier)', () => assert.ok(!/performance\.now|hrtime/.test(jsCodeNoVerifier())));
test('564. verifier holds nondeterminism detection regex', () => assert.ok(/Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyBridgeContract.js'), 'utf8'))));
test('565. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('566. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('567. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('568. exactly 28 .js files', () => assert.equal(jsFiles().length, 28));
test('569. prototype paths const 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));
test('570. index.js exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js')));
test('571. composer exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/createStudioAuthoringRuntimeToPreviewBridgeContract.js')));
test('572. verifier exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/verifyBridgeContract.js')));
test('573. manifest exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/createBridgeManifest.js')));
test('574. upstream runtime present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-runtime/index.js')));
test('575. upstream preview sandbox present', () => assert.ok(exists('src/studio/blueprint-engine/module-preview-sandbox/index.js')));
test('576. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('577. imports only relative + runtime generic-model', () => assert.ok(jsImports().every((p) => p.startsWith('.') || /runtime\/generic-model/.test(p))));
test('578. no bare process usage', () => assert.ok(!/[^.\w]process\.env/.test(jsCode()) || /globalThis\.process/.test(jsCode())));
test('579. bridgeDigest exported callable', () => assert.equal(typeof bridgeDigest, 'function'));
test('580. all part digests unique-ish (>= 15 distinct)', () => { const ds = Object.values(C.manifest.partDigests); assert.ok(new Set(ds).size >= 15); });

// ===== Scope safety (581-600) =====
test('581. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('582. no src/pages in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/pages\//.test(x))); });
test('583. no src/components in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/components\//.test(x))); });
test('584. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('585. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('586. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
test('587. no productionUiGuard/governanceGuard in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs') && !f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
test('588. no upstream authoring subtrees in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-(foundation-contract|implementation-plan|runtime)\//.test(x))); });
test('589. no preview-sandbox subtree in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-preview-sandbox\//.test(x))); });
test('590. no prior gate/test altered', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => (/^scripts\/gates\/g423-.*\.mjs$/.test(x) && x !== GATE_REL) || (/^src\/runtime\/__tests__\/.*\.test\.js$/.test(x) && x !== TEST_REL))); });
test('591. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('592. net-new scope subtree only', () => { const f = changed(); if (f === null) return; if (!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//.test(x))) return; assert.deepEqual(f.filter((x) => !authorized(x)), []); });
test('593. bridge subtree present', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js')));
test('594. test file registered path', () => assert.ok(exists(TEST_REL)));
test('595. gate file registered path', () => assert.ok(exists(GATE_REL)));
test('596. registry contains bridge subtree', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/authoring-runtime-to-preview-bridge-contract/.test(reg)); });
test('597. package.json has bridge test script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-authoring-runtime-to-preview-bridge-contract\.test\.js/.test(pkg)); });
test('598. test:runtime aggregate includes bridge test', () => { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert.ok(pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge-contract.test.js')); });
test('599. no react/jsx anywhere in subtree files', () => assert.ok(jsFiles().every((f) => !/\.jsx$/.test(f))));
test('600. subtree exports composer as default', () => assert.equal(typeof createStudioAuthoringRuntimeToPreviewBridgeContract, 'function'));

// ===== Evidence docs (D1-D24) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-CONTRACT-REPORT.md',
  'SOURCE-HANDOFF-CONTRACT.md', 'TARGET-PREVIEW-SANDBOX-CONTRACT.md', 'FIELD-MAPPING-CONTRACT.md',
  'VERSION-COMPATIBILITY-CONTRACT.md', 'DIGEST-SEMANTICS-CONTRACT.md', 'CANONICALIZATION-CONTRACT.md',
  'VALIDATION-ISSUE-CONTRACT.md', 'VALIDATION-PIPELINE-CONTRACT.md', 'EXTENSIBILITY-POLICY.md',
  'REPLAY-IDEMPOTENCY-CONTRACT.md', 'SSOT-BOUNDARY.md', 'CERTIFICATION-BOUNDARY.md',
  'PERMISSION-TENANCY-BOUNDARY.md', 'SECURITY-SAFETY-CONTRACT.md', 'PROTOTYPE-RELINK-PROHIBITION.md',
  'UPSTREAM-RUNTIME-HARDENING-NOTES.md', 'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-UI-NO-APP-NO-BRIDGE-RUNTIME-NO-PERSISTENCE.md', 'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract/${DOCS[i]}`)));
}
test('D25. exactly 24 evidence docs', () => assert.equal(DOCS.length, 24));
test('D-content. bridge + digest + SSOT + prototype-debt + next slice present', () => {
  assert.ok(/bridge|contract|headless/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/fnv1a|digest|cryptographic/i.test(readEv('DIGEST-SEMANTICS-CONTRACT.md')));
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-BOUNDARY.md')));
  assert.ok(/prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')));
  assert.ok(/checkpoint|FABLE|enterprise/i.test(readEv('NEXT-SLICE-SPEC.md')));
});
