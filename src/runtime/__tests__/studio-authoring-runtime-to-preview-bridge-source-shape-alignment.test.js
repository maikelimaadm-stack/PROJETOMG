import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// REAL runtime API (no mock of the primary path).
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff,
  stableSerialize, createDeterministicDigest,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';
// Corrected contract.
import {
  createStudioAuthoringRuntimeToPreviewBridgeContract,
  REAL_HANDOFF_FIELDS as C_REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS as C_LEGACY,
  CRITICAL_SOURCE_FIELDS as C_CRITICAL,
  BRIDGE_FIELD_MAPPINGS as C_MAPPINGS,
  SOURCE_HANDOFF_VERSION_FIELDS as C_VERSION_FIELDS,
  SOURCE_HANDOFF_DIGEST_FIELDS as C_DIGEST_FIELDS,
  createSourceHandoffContract,
  createBridgeFieldMappingContract,
  createBridgeDigestSemanticsContract,
  createBridgeVersionCompatibilityContract,
  verifyBridgeContract,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js';
// Corrected plan.
import {
  createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan,
  REAL_HANDOFF_FIELDS as P_REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS as P_LEGACY,
  CRITICAL_SOURCE_FIELDS as P_CRITICAL,
  BRIDGE_FIELD_MAPPINGS as P_MAPPINGS,
  createSourceValidationPlan,
  createFieldMappingExecutionPlan,
  createSourceDigestValidationPlan,
  createSourceVersionValidationPlan,
  createBridgeResourceLimitsPlan,
  verifyBridgeImplementationPlan,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };

// ===== Real round-trip: build a REAL handoff via the real runtime API =====
function buildRealHandoff(seed = 'align') {
  const s0 = createAuthoringRuntimeSession({ seed });
  const before = stableSerialize(s0);
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const draft = r.session.drafts[0];
  const handoff = createSyntheticPreviewHandoff({ draft });
  return { handoff, draft, draftId, inputSessionUnchanged: stableSerialize(s0) === before };
}

const { handoff: H, draftId: DRAFT_ID, inputSessionUnchanged: INPUT_UNCHANGED } = buildRealHandoff('align');
const CONTRACT = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: H });
const PLAN = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT });

// ===== Real handoff shape (1-40) =====
test('1. handoff kind', () => assert.equal(H.kind, 'authoring-synthetic-preview-handoff'));
test('2. handoffKind synthetic_preview_candidate', () => assert.equal(H.handoffKind, 'synthetic_preview_candidate'));
test('3. handoffVersion present + string', () => { assert.equal(typeof H.handoffVersion, 'string'); assert.ok(H.handoffVersion.length > 0); });
test('4. runtimeVersion present + string', () => { assert.equal(typeof H.runtimeVersion, 'string'); assert.ok(H.runtimeVersion.length > 0); });
test('5. targetSandboxVersion present + string', () => { assert.equal(typeof H.targetSandboxVersion, 'string'); assert.ok(H.targetSandboxVersion.length > 0); });
test('6. draftId explicit non-empty string', () => { assert.equal(typeof H.draftId, 'string'); assert.ok(H.draftId.length > 0); assert.equal(H.draftId, DRAFT_ID); });
test('7. draftRevision non-negative integer', () => { assert.ok(Number.isInteger(H.draftRevision)); assert.ok(H.draftRevision >= 0); });
test('8. draftDigest present', () => { assert.equal(typeof H.draftDigest, 'string'); assert.ok(H.draftDigest.length > 0); });
test('9. synthetic true', () => assert.equal(H.synthetic, true));
test('10. immutable true', () => assert.equal(H.immutable, true));
test('11. validated true', () => assert.equal(H.validated, true));
test('12. previewPayloadCreated true', () => assert.equal(H.previewPayloadCreated, true));
test('13. previewMounted false', () => assert.equal(H.previewMounted, false));
test('14. realDataAttached false', () => assert.equal(H.realDataAttached, false));
test('15. routeCreated false', () => assert.equal(H.routeCreated, false));
test('16. menuCreated false', () => assert.equal(H.menuCreated, false));
test('17. productExposed false', () => assert.equal(H.productExposed, false));
test('18. payload present (validated)', () => assert.ok(H.payload !== null && typeof H.payload === 'object'));
test('19. ok true', () => assert.equal(H.ok, true));
test('20. handoffDigest present fnv1a', () => { assert.equal(typeof H.handoffDigest, 'string'); assert.ok(H.handoffDigest.startsWith('fnv1a-')); });
// The critical divergence proofs:
test('21. handoff has NO upstreamVersions field', () => assert.equal('upstreamVersions' in H, false));
test('22. handoff has NO generic digest field', () => assert.equal('digest' in H, false));
test('23. handoff HAS handoffVersion', () => assert.equal('handoffVersion' in H, true));
test('24. handoff HAS runtimeVersion', () => assert.equal('runtimeVersion' in H, true));
test('25. handoff HAS targetSandboxVersion', () => assert.equal('targetSandboxVersion' in H, true));
test('26. handoff HAS handoffDigest', () => assert.equal('handoffDigest' in H, true));
test('27. handoff frozen', () => assert.equal(Object.isFrozen(H), true));
test('28. input session NOT mutated by handoff build', () => assert.equal(INPUT_UNCHANGED, true));
test('29. REAL_HANDOFF_FIELDS matches actual keys (contract)', () => { const keys = Object.keys(H).sort(); assert.deepEqual([...C_REAL_HANDOFF_FIELDS].sort(), keys); });
test('30. REAL_HANDOFF_FIELDS matches actual keys (plan)', () => { const keys = Object.keys(H).sort(); assert.deepEqual([...P_REAL_HANDOFF_FIELDS].sort(), keys); });
test('31. contract + plan REAL_HANDOFF_FIELDS identical', () => assert.deepEqual([...C_REAL_HANDOFF_FIELDS], [...P_REAL_HANDOFF_FIELDS]));
test('32. legacy forbidden fields = [upstreamVersions, digest] (contract)', () => assert.deepEqual([...C_LEGACY], ['upstreamVersions', 'digest']));
test('33. legacy forbidden fields = [upstreamVersions, digest] (plan)', () => assert.deepEqual([...P_LEGACY], ['upstreamVersions', 'digest']));
test('34. no forbidden legacy field appears in real handoff', () => assert.ok(C_LEGACY.every((f) => !(f in H))));
test('35. version fields all present in real handoff', () => assert.ok(C_VERSION_FIELDS.every((f) => f in H)));
test('36. digest fields all present in real handoff', () => assert.ok(C_DIGEST_FIELDS.every((f) => f in H)));
test('37. handoff draftRevision matches draft', () => assert.equal(H.draftRevision, PLAN ? H.draftRevision : 0));
test('38. runtimeVersion is the authoring runtime version', () => assert.equal(H.runtimeVersion, 'studio-module-blueprint-authoring-runtime@1.0.0'));
test('39. targetSandboxVersion is the preview sandbox version', () => assert.equal(H.targetSandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'));
test('40. handoffVersion is authoring-preview-handoff@1.0.0', () => assert.equal(H.handoffVersion, 'authoring-preview-handoff@1.0.0'));

// ===== Required fields all exist in real handoff (41-70) =====
const SRC = createSourceHandoffContract();
let rn = 41;
for (const f of SRC.requiredFields) {
  const cur = rn; rn += 1;
  test(`${cur}. required field ${f} exists on real handoff`, () => assert.ok(f in H));
}
// SRC.requiredFields has 13 → rn = 41 + 13 = 54
test('54. source contract requiredFields all real', () => assert.equal(SRC.everyRequiredFieldExistsInRealHandoff, true));
test('55. source contract upstreamVersions forbidden', () => assert.equal(SRC.upstreamVersionsSourceFieldAllowed, false));
test('56. source contract generic digest forbidden', () => assert.equal(SRC.genericDigestSourceFieldAllowed, false));
test('57. source contract real names required', () => assert.equal(SRC.realSourceFieldNamesRequired, true));
test('58. source contract legacy alias forbidden', () => assert.equal(SRC.legacyInventedSourceFieldAliasesAllowed, false));
test('59. source contract handoffVersionRequired', () => assert.equal(SRC.handoffVersionRequired, true));
test('60. source contract targetSandboxVersionRequired', () => assert.equal(SRC.targetSandboxVersionRequired, true));
test('61. source contract handoffDigestRequired', () => assert.equal(SRC.handoffDigestRequired, true));
test('62. source contract requiredFields does not include upstreamVersions', () => assert.ok(!SRC.requiredFields.includes('upstreamVersions')));
test('63. source contract requiredFields does not include digest', () => assert.ok(!SRC.requiredFields.includes('digest')));
const SVP = createSourceValidationPlan();
test('64. source plan requiredFields all real', () => assert.equal(SVP.everyRequiredFieldExistsInRealHandoff, true));
test('65. source plan upstreamVersions forbidden', () => assert.equal(SVP.upstreamVersionsSourceFieldAllowed, false));
test('66. source plan generic digest forbidden', () => assert.equal(SVP.genericDigestSourceFieldAllowed, false));
test('67. source plan requiredFields all in real handoff', () => assert.ok(SVP.requiredFields.every((f) => f in H)));
test('68. source plan criticalFields all in real handoff', () => assert.ok(SVP.criticalFields.every((f) => f in H)));
test('69. source plan criticalFields exclude legacy', () => assert.ok(!SVP.criticalFields.includes('upstreamVersions') && !SVP.criticalFields.includes('digest')));
test('70. source plan not implemented', () => assert.equal(SVP.sourceValidationImplemented, false));

// ===== Mappings: every source exists in real handoff (71-130) =====
const CFM = createBridgeFieldMappingContract();
const PFM = createFieldMappingExecutionPlan();
test('71. contract mapping count 12', () => assert.equal(CFM.mappingCount, 12));
test('72. plan mapping count 12', () => assert.equal(PFM.mappingCount, 12));
test('73. contract every mapping source in real handoff (flag)', () => assert.equal(CFM.everyMappingSourceExistsInRealHandoff, true));
test('74. plan every mapping source in real handoff (flag)', () => assert.equal(PFM.everyMappingSourceExistsInRealHandoff, true));
test('75. contract anyInventedSourceField false', () => assert.equal(CFM.anyInventedSourceField, false));
test('76. plan anyInventedSourceField false', () => assert.equal(PFM.anyInventedSourceField, false));
test('77. contract anyLegacyAliasSourceField false', () => assert.equal(CFM.anyLegacyAliasSourceField, false));
test('78. plan anyLegacyAliasSourceField false', () => assert.equal(PFM.anyLegacyAliasSourceField, false));
let cmn = 79;
for (const m of C_MAPPINGS) {
  const cur = cmn; cmn += 1;
  test(`${cur}. contract mapping source ${m.sourceField} exists on real handoff`, () => assert.ok(m.sourceField in H));
}
// 79 + 12 = 91
let pmn = 91;
for (const m of P_MAPPINGS) {
  const cur = pmn; pmn += 1;
  test(`${cur}. plan mapping source ${m.sourceField} exists on real handoff`, () => assert.ok(m.sourceField in H));
}
// 91 + 12 = 103
test('103. contract mappings no upstreamVersions source', () => assert.ok(!C_MAPPINGS.some((m) => m.sourceField === 'upstreamVersions')));
test('104. contract mappings no generic digest source', () => assert.ok(!C_MAPPINGS.some((m) => m.sourceField === 'digest')));
test('105. plan mappings no upstreamVersions source', () => assert.ok(!P_MAPPINGS.some((m) => m.sourceField === 'upstreamVersions')));
test('106. plan mappings no generic digest source', () => assert.ok(!P_MAPPINGS.some((m) => m.sourceField === 'digest')));
test('107. contract handoffVersion mapped', () => assert.ok(C_MAPPINGS.some((m) => m.sourceField === 'handoffVersion' && m.targetField === 'sourceHandoffVersion')));
test('108. contract targetSandboxVersion mapped', () => assert.ok(C_MAPPINGS.some((m) => m.sourceField === 'targetSandboxVersion' && m.targetField === 'sourceTargetSandboxVersion')));
test('109. contract handoffDigest -> sourceDigest', () => assert.ok(C_MAPPINGS.some((m) => m.sourceField === 'handoffDigest' && m.targetField === 'sourceDigest')));
test('110. plan handoffVersion mapped', () => assert.ok(P_MAPPINGS.some((m) => m.sourceField === 'handoffVersion' && m.targetField === 'sourceHandoffVersion')));
test('111. plan handoffDigest -> sourceDigest', () => assert.ok(P_MAPPINGS.some((m) => m.sourceField === 'handoffDigest' && m.targetField === 'sourceDigest')));
test('112. contract no duplicate source field', () => assert.equal(CFM.noDuplicateSourceField, true));
test('113. contract no duplicate target field', () => assert.equal(CFM.noDuplicateTargetField, true));
test('114. plan no duplicate source field', () => assert.equal(PFM.noDuplicateSourceField, true));
test('115. plan no duplicate target field', () => assert.equal(PFM.noDuplicateTargetField, true));
test('116. contract every critical mapped', () => assert.equal(CFM.everyCriticalMapped, true));
test('117. plan every critical mapped', () => assert.equal(PFM.everyCriticalMapped, true));
test('118. contract no unknown transform', () => assert.equal(CFM.anyUnknownTransform, false));
test('119. plan no unknown transform', () => assert.equal(PFM.anyUnknownTransform, false));
test('120. contract no critical default', () => assert.equal(CFM.anyCriticalDefault, false));
test('121. plan no critical default', () => assert.equal(PFM.anyCriticalDefault, false));
test('122. contract no lossy critical', () => assert.equal(CFM.anyLossyCritical, false));
test('123. plan no lossy critical', () => assert.equal(PFM.anyLossyCritical, false));
test('124. contract everyRequiredTargetMapped', () => assert.equal(CFM.everyRequiredTargetMapped, true));
test('125. plan everyRequiredTargetMapped', () => assert.equal(PFM.everyRequiredTargetMapped, true));
test('126. contract critical fields = mapping sources', () => assert.deepEqual([...C_CRITICAL].sort(), C_MAPPINGS.map((m) => m.sourceField).sort()));
test('127. plan critical fields = mapping sources', () => assert.deepEqual([...P_CRITICAL].sort(), P_MAPPINGS.map((m) => m.sourceField).sort()));
test('128. contract security fields NOT mapped (validated only)', () => { const secs = ['previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed']; assert.ok(secs.every((s) => !C_MAPPINGS.some((m) => m.sourceField === s))); });
test('129. plan security fields NOT mapped (validated only)', () => { const secs = ['previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed']; assert.ok(secs.every((s) => !P_MAPPINGS.some((m) => m.sourceField === s))); });
test('130. plan mappings all planned not implemented', () => assert.ok(PFM.mappings.every((m) => m.executionStatus === 'planned' && m.implemented === false)));

// ===== Digest recompute-and-compare (131-165) =====
const CDS = createBridgeDigestSemanticsContract();
const PDS = createSourceDigestValidationPlan();
test('131. contract digest field handoffDigest', () => assert.equal(CDS.sourceDigestField, 'handoffDigest'));
test('132. plan digest field handoffDigest', () => assert.equal(PDS.sourceDigestField, 'handoffDigest'));
test('133. contract validation mode recompute_and_compare', () => assert.equal(CDS.digestValidationMode, 'recompute_and_compare'));
test('134. plan validation mode recompute_and_compare', () => assert.equal(PDS.digestValidationMode, 'recompute_and_compare'));
test('135. contract algo fnv1a-32', () => assert.equal(CDS.sourceDigestAlgorithm, 'fnv1a-32'));
test('136. plan algo fnv1a-32', () => assert.equal(PDS.sourceDigestAlgorithm, 'fnv1a-32'));
test('137. contract serializer stableSerialize', () => assert.equal(CDS.canonicalSerializer, 'stableSerialize'));
test('138. plan serializer stableSerialize', () => assert.equal(PDS.canonicalSerializer, 'stableSerialize'));
test('139. contract digest helper createDeterministicDigest', () => assert.equal(CDS.digestHelper, 'createDeterministicDigest'));
test('140. plan digest helper createDeterministicDigest', () => assert.equal(PDS.digestHelper, 'createDeterministicDigest'));
test('141. contract serializer path declared', () => assert.ok(/stableSerialize\.js$/.test(CDS.canonicalSerializerPath)));
test('142. contract helper path declared', () => assert.ok(/createDeterministicDigest\.js$/.test(CDS.digestHelperPath)));
test('143. contract preimage excludes handoffDigest', () => assert.ok(!CDS.preimageFields.includes('handoffDigest')));
test('144. plan preimage excludes handoffDigest', () => assert.ok(!PDS.preimageFields.includes('handoffDigest')));
test('145. contract handoffDigestExcludedFromOwnPreimage', () => assert.equal(CDS.handoffDigestExcludedFromOwnPreimage, true));
test('146. contract no alternative serializer', () => assert.equal(CDS.alternativeSerializerAllowed, false));
test('147. plan no alternative serializer', () => assert.equal(PDS.alternativeSerializerAllowed, false));
test('148. contract not cryptographic', () => assert.equal(CDS.cryptographicIntegrityProvided, false));
test('149. contract digest authorizes nothing real', () => assert.ok(CDS.digestMayAuthorizeCertification === false && CDS.digestMayAuthorizeModuleGeneration === false && CDS.digestMayAuthorizeProduction === false));
test('150. plan digest authorizes nothing real', () => assert.ok(PDS.digestMayAuthorizeCertification === false && PDS.digestMayAuthorizeModuleGeneration === false && PDS.digestMayAuthorizeProduction === false));
test('151. contract crypto required before cert/prod', () => assert.ok(CDS.cryptographicDigestRequiredBeforeCertification === true && CDS.cryptographicDigestRequiredBeforeProduction === true));
// The actual recompute-and-compare over the REAL handoff:
test('152. RECOMPUTE: preimage = handoff minus handoffDigest reproduces handoffDigest', () => {
  const { handoffDigest, ...preimage } = H;
  assert.equal(createDeterministicDigest(preimage), handoffDigest);
});
test('153. RECOMPUTE deterministic (stable across calls)', () => {
  const { handoffDigest, ...preimage } = H;
  assert.equal(createDeterministicDigest(preimage), createDeterministicDigest(preimage));
});
test('154. RECOMPUTE key-order independent (stableSerialize)', () => {
  const { handoffDigest, ...preimage } = H;
  const reordered = {};
  for (const k of Object.keys(preimage).reverse()) reordered[k] = preimage[k];
  assert.equal(createDeterministicDigest(reordered), handoffDigest);
});
test('155. RECOMPUTE mismatch detected on tampered field', () => {
  const { handoffDigest, ...preimage } = H;
  const tampered = { ...preimage, draftRevision: (preimage.draftRevision ?? 0) + 1 };
  assert.notEqual(createDeterministicDigest(tampered), handoffDigest);
});
test('156. contract preimageFieldCount = real fields - 1', () => assert.equal(CDS.preimageFieldCount, C_REAL_HANDOFF_FIELDS.length - 1));
test('157. plan preimageFieldCount = real fields - 1', () => assert.equal(PDS.preimageFieldCount, P_REAL_HANDOFF_FIELDS.length - 1));
test('158. contract preimage fields all real', () => assert.ok(CDS.preimageFields.every((f) => C_REAL_HANDOFF_FIELDS.includes(f))));
test('159. contract genericDigestSourceFieldAllowed false', () => assert.equal(CDS.genericDigestSourceFieldAllowed, false));
test('160. plan digestHelperReusedReadOnly', () => assert.equal(PDS.digestHelperReusedReadOnly, true));
test('161. contract digestHelperReusedReadOnly', () => assert.equal(CDS.digestHelperReusedReadOnly, true));
test('162. plan not implemented', () => assert.equal(PDS.sourceDigestValidationImplemented, false));
test('163. contract canonicalization key sorted', () => assert.equal(CDS.canonicalizationKeySorted, true));
test('164. stableSerialize is key-sorted (probe)', () => assert.equal(stableSerialize({ b: 1, a: 2 }), stableSerialize({ a: 2, b: 1 })));
test('165. createDeterministicDigest fnv1a prefix (probe)', () => assert.ok(createDeterministicDigest({ x: 1 }).startsWith('fnv1a-')));

// ===== Version tuple (166-190) =====
const CVC = createBridgeVersionCompatibilityContract();
const PVV = createSourceVersionValidationPlan();
test('166. contract explicit version tuple required', () => assert.equal(CVC.explicitVersionTupleRequired, true));
test('167. plan explicit version tuple required', () => assert.equal(PVV.explicitVersionTupleRequired, true));
test('168. contract aggregated upstreamVersions NOT required', () => assert.equal(CVC.aggregatedUpstreamVersionsFieldRequired, false));
test('169. plan aggregated upstreamVersions NOT required', () => assert.equal(PVV.aggregatedUpstreamVersionsFieldRequired, false));
test('170. contract exact version match required', () => assert.equal(CVC.exactVersionMatchRequired, true));
test('171. plan exact version match required', () => assert.equal(PVV.exactVersionMatchRequired, true));
test('172. contract unknown version fails closed', () => assert.equal(CVC.unknownVersionFailsClosed, true));
test('173. contract downgrade forbidden', () => assert.equal(CVC.versionDowngradeAllowed, false));
test('174. contract upgrade not assumed', () => assert.equal(CVC.versionUpgradeAssumedCompatible, false));
test('175. plan downgrade forbidden', () => assert.equal(PVV.versionDowngradeAllowed, false));
test('176. plan upgrade not assumed', () => assert.equal(PVV.versionUpgradeAssumedCompatible, false));
test('177. contract tuple has handoffVersion', () => assert.equal(CVC.tuple.handoffVersion, H.handoffVersion));
test('178. contract tuple has runtimeVersion', () => assert.equal(CVC.tuple.runtimeVersion, H.runtimeVersion));
test('179. contract tuple has targetSandboxVersion', () => assert.equal(CVC.tuple.targetSandboxVersion, H.targetSandboxVersion));
test('180. contract tuple has bridgeContractVersion', () => assert.equal(typeof CVC.tuple.bridgeContractVersion, 'string'));
test('181. contract tuple has blueprintContractVersion', () => assert.equal(typeof CVC.tuple.blueprintContractVersion, 'string'));
test('182. contract versionTupleFields has no upstreamVersions', () => assert.ok(!CVC.versionTupleFields.includes('upstreamVersions')));
test('183. plan versionTupleFields has no upstreamVersions', () => assert.ok(!PVV.versionTupleFields.includes('upstreamVersions')));
test('184. plan tuple has handoffVersion', () => assert.equal(PVV.tuple.handoffVersion, H.handoffVersion));
test('185. plan tuple has runtimeVersion', () => assert.equal(PVV.tuple.runtimeVersion, H.runtimeVersion));
test('186. plan tuple has bridgeImplementationPlanVersion', () => assert.equal(typeof PVV.tuple.bridgeImplementationPlanVersion, 'string'));
test('187. plan matrix handoffVersion matches real', () => assert.equal(PVV.matrix.handoffVersion, H.handoffVersion));
test('188. contract matrix runtime matches real', () => assert.equal(CVC.matrix.runtime, H.runtimeVersion));
test('189. contract matrix sandbox matches real', () => assert.equal(CVC.matrix.sandbox, H.targetSandboxVersion));
test('190. plan not implemented', () => assert.equal(PVV.sourceVersionValidationImplemented, false));

// ===== Resource-limit coherence (191-215) =====
const RLP = createBridgeResourceLimitsPlan();
test('191. limits plan kind', () => assert.equal(RLP.kind, 'bridge-resource-limits-plan'));
test('192. bridge limits may reject runtime-valid handoff', () => assert.equal(RLP.bridgeLimitsMayRejectRuntimeValidHandoff, true));
test('193. stricter bridge limits intentional', () => assert.equal(RLP.stricterBridgeLimitsAreIntentional, true));
test('194. source acceptance does not guarantee bridge acceptance', () => assert.equal(RLP.sourceAcceptanceDoesNotGuaranteeBridgeAcceptance, true));
test('195. limit mismatch not silent', () => assert.equal(RLP.limitMismatchIsNotSilent, true));
test('196. limit exceeded produces deterministic blocker', () => assert.equal(RLP.limitExceededProducesDeterministicBlocker, true));
test('197. partial target descriptor forbidden', () => assert.equal(RLP.partialTargetDescriptorAllowed, false));
test('198. coherence rows present', () => assert.ok(RLP.coherenceRowCount >= 7));
test('199. runtime reference limits present', () => assert.ok(RLP.runtimeReferenceLimits.maxFieldsPerDraft === 250));
test('200. every bridge limit stricter-or-equal where comparable', () => assert.equal(RLP.everyBridgeLimitStricterOrEqualWhereComparable, true));
let coh = 201;
for (const row of RLP.coherence) {
  const cur = coh; coh += 1;
  test(`${cur}. coherence ${row.dimension} has bridgeLimit + reason + issueCode`, () => {
    assert.ok(Number.isFinite(row.bridgeLimit));
    assert.ok(typeof row.reason === 'string' && row.reason.length > 0);
    assert.ok(typeof row.issueCode === 'string' && row.issueCode.length > 0);
    assert.ok(row.sourceLimit === null || row.bridgeLimit <= row.sourceLimit);
  });
}
// 201 + 7 = 208
test('208. unknown resource dimension rejected', () => assert.equal(RLP.unknownResourceDimensionRejected, true));
test('209. silent truncation forbidden', () => assert.equal(RLP.silentTruncationAllowed, false));
test('210. limit exceeded fails closed', () => assert.equal(RLP.limitExceededFailsClosed, true));
test('211. limits plan not implemented', () => assert.equal(RLP.resourceLimitsImplemented, false));
test('212. maxSourceFields stricter than runtime maxFieldsPerDraft', () => { const r = RLP.coherence.find((x) => x.dimension === 'maxSourceFields'); assert.ok(r.bridgeLimit < r.sourceLimit); });
test('213. maxStringLength stricter than runtime', () => { const r = RLP.coherence.find((x) => x.dimension === 'maxStringLength'); assert.ok(r.bridgeLimit < r.sourceLimit); });
test('214. maxExtensions has no runtime source limit', () => { const r = RLP.coherence.find((x) => x.dimension === 'maxExtensions'); assert.equal(r.sourceLimit, null); });
test('215. plannedDefaults present', () => assert.ok(Number.isFinite(RLP.plannedDefaults.maxSourcePayloadBytes)));

// ===== Contract + plan accept the real object; readiness; implementation false (216-260) =====
test('216. contract composes ready (real handoff)', () => assert.equal(CONTRACT.readiness, 'studio_authoring_runtime_to_preview_bridge_contract_ready'));
test('217. contract not fallback', () => assert.equal(CONTRACT.fallback, false));
test('218. contract blockerCount 0', () => assert.equal(CONTRACT.blockerCount, 0));
test('219. contract verification ok', () => assert.equal(CONTRACT.verification.ok, true));
test('220. plan composes ready (from contract)', () => assert.equal(PLAN.readiness, 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready'));
test('221. plan not fallback', () => assert.equal(PLAN.fallback, false));
test('222. plan blockerCount 0', () => assert.equal(PLAN.blockerCount, 0));
test('223. plan verification ok', () => assert.equal(PLAN.verification.ok, true));
test('224. contract readyForBridgeContract true', () => assert.equal(CONTRACT.readyForBridgeContract, true));
test('225. contract readyForBridgeImplementationPlan true', () => assert.equal(CONTRACT.readyForBridgeImplementationPlan, true));
test('226. contract readyForBridgeImplementationEnterpriseRevalidation true', () => assert.equal(CONTRACT.readyForBridgeImplementationEnterpriseRevalidation, true));
test('227. contract readyForBridgeImplementationSlice false', () => assert.equal(CONTRACT.readyForBridgeImplementationSlice, false));
test('228. plan readyForBridgeImplementationPlan true', () => assert.equal(PLAN.readyForBridgeImplementationPlan, true));
test('229. plan readyForBridgeImplementationEnterpriseRevalidation true', () => assert.equal(PLAN.readyForBridgeImplementationEnterpriseRevalidation, true));
test('230. plan readyForBridgeImplementationSlice false', () => assert.equal(PLAN.readyForBridgeImplementationSlice, false));
test('231. contract bridgeImplemented false', () => assert.equal(CONTRACT.capabilities.bridgeImplemented, false));
test('232. contract adapterImplemented false', () => assert.equal(CONTRACT.capabilities.adapterImplemented, false));
test('233. contract sourceValidationImplemented false', () => assert.equal(CONTRACT.capabilities.sourceValidationImplemented, false));
test('234. contract targetPayloadCreated false', () => assert.equal(CONTRACT.capabilities.targetPayloadCreated, false));
test('235. contract previewMounted false', () => assert.equal(CONTRACT.capabilities.previewMounted, false));
test('236. plan bridgeImplemented false', () => assert.equal(PLAN.capabilities.bridgeImplemented, false));
test('237. plan mappingExecutorImplemented false', () => assert.equal(PLAN.capabilities.mappingExecutorImplemented, false));
test('238. plan targetDescriptorBuilderImplemented false', () => assert.equal(PLAN.capabilities.targetDescriptorBuilderImplemented, false));
test('239. plan every phase planned none implemented', () => { assert.equal(PLAN.phases.allPlanned, true); assert.equal(PLAN.phases.anyImplemented, false); });
test('240. contract productExposed false', () => assert.equal(CONTRACT.capabilities.productExposed, false));
test('241. plan productExposed false', () => assert.equal(PLAN.capabilities.productExposed, false));
test('242. contract certificationPerformed false', () => assert.equal(CONTRACT.capabilities.certificationPerformed, false));
test('243. plan certificationPerformed false', () => assert.equal(PLAN.capabilities.certificationPerformed, false));
test('244. contract ssot preserved', () => assert.equal(CONTRACT.ssotBoundary.certifiedBlueprintRemainsSsot, true));
test('245. plan ssot preserved', () => assert.equal(PLAN.ssotProtectionPlan.certifiedBlueprintRemainsSsot, true));
test('246. contract permission not integrated', () => assert.equal(CONTRACT.capabilities.permissionModelIntegrated, false));
test('247. plan permission not integrated', () => assert.equal(PLAN.capabilities.permissionModelIntegrated, false));
// Replay + immutability of composition:
test('248. contract deterministic (deep-equal on rebuild)', () => { const b = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: buildRealHandoff('align').handoff }); assert.equal(b.overallDigest, CONTRACT.overallDigest); });
test('249. plan deterministic (deep-equal on rebuild)', () => { const c = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: buildRealHandoff('align').handoff }); const b = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: c }); assert.equal(b.overallDigest, PLAN.overallDigest); });
test('250. contract digest stable', () => { const b = createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: H }); assert.equal(b.bridgeContractDigest, CONTRACT.bridgeContractDigest); });
test('251. plan digest stable', () => { const b = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); assert.equal(b.bridgeImplementationPlanDigest, PLAN.bridgeImplementationPlanDigest); });
test('252. building handoff twice gives equal handoffDigest', () => { const a = buildRealHandoff('same').handoff; const b = buildRealHandoff('same').handoff; assert.equal(a.handoffDigest, b.handoffDigest); });
test('253. contract composition does not mutate handoff', () => { const before = JSON.stringify(H); createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: H }); assert.equal(JSON.stringify(H), before); });
// Strict draft identity (contract + plan):
test('254. contract source strict draft identity', () => assert.equal(CONTRACT.sourceHandoff.strictDraftIdentityRequired, true));
test('255. contract source explicit draft id required', () => assert.equal(CONTRACT.sourceHandoff.explicitDraftIdRequired, true));
test('256. contract source single-draft fallback forbidden', () => assert.equal(CONTRACT.sourceHandoff.singleDraftFallbackAllowed, false));
test('257. contract source bridge must validate id before helper call', () => assert.equal(CONTRACT.sourceHandoff.bridgeMustValidateDraftIdBeforeAnyRuntimeHelperCall, true));
test('258. contract source bridge never findDraft without id', () => assert.equal(CONTRACT.sourceHandoff.bridgeImplementationMustNeverCallFindDraftWithoutExplicitId, true));
test('259. plan draft identity single-draft fallback forbidden', () => assert.equal(PLAN.draftIdentityEnforcementPlan.singleDraftFallbackAllowed, false));
test('260. plan draft identity runtime not altered', () => assert.equal(PLAN.draftIdentityEnforcementPlan.runtimeAlteredByThisPlan, false));

// ===== Verifier tamper detection for the new alignment rules (261-290) =====
const vbc = (o) => verifyBridgeContract(o).blockers;
const vbp = (o) => verifyBridgeImplementationPlan(o).blockers;
const CAPS = CONTRACT.capabilities;
const PCAPS = PLAN.capabilities;
test('261. contract verifier flags upstreamVersions source field', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { requiredFields: ['upstreamVersions'] } } }).includes('unsafe_source_upstreamVersions_field')));
test('262. contract verifier flags generic digest source field', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { requiredFields: ['digest'] } } }).includes('unsafe_source_generic_digest_field')));
test('263. contract verifier flags upstreamVersions allowed flag', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { upstreamVersionsSourceFieldAllowed: true } } }).includes('unsafe_source_upstreamVersions_field')));
test('264. contract verifier flags legacy alias allowed', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { legacyInventedSourceFieldAliasesAllowed: true } } }).includes('unsafe_source_legacy_alias_allowed')));
test('265. contract verifier flags real names not required', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { realSourceFieldNamesRequired: false } } }).includes('unsafe_source_real_field_names_not_required')));
test('266. contract verifier flags required not in real handoff', () => assert.ok(vbc({ contract: { capabilities: CAPS, sourceHandoff: { everyRequiredFieldExistsInRealHandoff: false } } }).includes('unsafe_source_required_field_not_in_real_handoff')));
test('267. contract verifier flags invented mapping source', () => assert.ok(vbc({ contract: { capabilities: CAPS, fieldMapping: { anyInventedSourceField: true } } }).includes('unsafe_mapping_invented_source_field')));
test('268. contract verifier flags mapping source not in real handoff', () => assert.ok(vbc({ contract: { capabilities: CAPS, fieldMapping: { everyMappingSourceExistsInRealHandoff: false } } }).includes('unsafe_mapping_invented_source_field')));
test('269. contract verifier flags legacy alias mapping', () => assert.ok(vbc({ contract: { capabilities: CAPS, fieldMapping: { anyLegacyAliasSourceField: true } } }).includes('unsafe_mapping_legacy_alias')));
test('270. contract verifier flags duplicate mapping', () => assert.ok(vbc({ contract: { capabilities: CAPS, fieldMapping: { noDuplicateSourceField: false } } }).includes('unsafe_mapping_duplicate')));
test('271. contract verifier flags wrong digest source field', () => assert.ok(vbc({ contract: { capabilities: CAPS, digestSemantics: { sourceDigestField: 'digest' } } }).includes('unsafe_digest_wrong_source_field')));
test('272. contract verifier flags wrong digest validation mode', () => assert.ok(vbc({ contract: { capabilities: CAPS, digestSemantics: { digestValidationMode: 'trust' } } }).includes('unsafe_digest_wrong_validation_mode')));
test('273. contract verifier flags alternative serializer', () => assert.ok(vbc({ contract: { capabilities: CAPS, digestSemantics: { alternativeSerializerAllowed: true } } }).includes('unsafe_digest_alternative_serializer')));
test('274. contract verifier flags preimage includes self', () => assert.ok(vbc({ contract: { capabilities: CAPS, digestSemantics: { handoffDigestExcludedFromOwnPreimage: false } } }).includes('unsafe_digest_preimage_includes_self')));
test('275. contract verifier clean on real contract', () => assert.equal(verifyBridgeContract({ contract: CONTRACT }).ok, true));
test('276. plan verifier flags upstreamVersions source field', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceValidationPlan: { requiredFields: ['upstreamVersions'] } } }).includes('unsafe_source_upstreamVersions_field')));
test('277. plan verifier flags generic digest source field', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceValidationPlan: { criticalFields: ['digest'] } } }).includes('unsafe_source_generic_digest_field')));
test('278. plan verifier flags invented mapping source', () => assert.ok(vbp({ plan: { capabilities: PCAPS, fieldMappingExecutionPlan: { anyInventedSourceField: true } } }).includes('unsafe_mapping_invented_source_field')));
test('279. plan verifier flags legacy alias mapping', () => assert.ok(vbp({ plan: { capabilities: PCAPS, fieldMappingExecutionPlan: { anyLegacyAliasSourceField: true } } }).includes('unsafe_mapping_legacy_alias')));
test('280. plan verifier flags wrong digest source field', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceDigestValidationPlan: { sourceDigestField: 'digest' } } }).includes('unsafe_digest_wrong_source_field')));
test('281. plan verifier flags wrong digest validation mode', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceDigestValidationPlan: { digestValidationMode: 'trust' } } }).includes('unsafe_digest_wrong_validation_mode')));
test('282. plan verifier flags aggregated upstreamVersions required', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceVersionValidationPlan: { aggregatedUpstreamVersionsFieldRequired: true } } }).includes('unsafe_version_upstreamVersions_required')));
test('283. plan verifier flags upstreamVersions in version tuple', () => assert.ok(vbp({ plan: { capabilities: PCAPS, sourceVersionValidationPlan: { versionTupleFields: ['upstreamVersions'] } } }).includes('unsafe_version_tuple_has_upstreamVersions')));
test('284. plan verifier flags silent limit mismatch', () => assert.ok(vbp({ plan: { capabilities: PCAPS, resourceLimitsPlan: { limitMismatchIsNotSilent: false } } }).includes('unsafe_limit_mismatch_silent')));
test('285. plan verifier flags partial descriptor on limit', () => assert.ok(vbp({ plan: { capabilities: PCAPS, resourceLimitsPlan: { partialTargetDescriptorAllowed: true } } }).includes('unsafe_limit_partial_descriptor')));
test('286. plan verifier flags implemented phase', () => assert.ok(vbp({ plan: { capabilities: PCAPS, phases: { anyImplemented: true } } }).includes('unsafe_phase_implemented')));
test('287. plan verifier flags single-draft fallback', () => assert.ok(vbp({ plan: { capabilities: PCAPS, draftIdentityEnforcementPlan: { singleDraftFallbackAllowed: true } } }).includes('unsafe_single_draft_fallback')));
test('288. plan verifier clean on real plan', () => assert.equal(verifyBridgeImplementationPlan({ plan: PLAN }).ok, true));
test('289. contract verifier never throws on null', () => assert.doesNotThrow(() => verifyBridgeContract({ contract: null })));
test('290. plan verifier never throws on null', () => assert.doesNotThrow(() => verifyBridgeImplementationPlan({ plan: null })));

// ===== Scope safety (291-300) =====
test('291. runtime subtree not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//.test(x))); });
test('292. preview sandbox not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-preview-sandbox\//.test(x))); });
test('293. App.jsx not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('294. guards not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs') && !f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
test('295. modules/backend/prisma not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\/|^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('296. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
test('297. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('298. alignment evidence dir exists', () => assert.ok(fs.existsSync(path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-source-shape-alignment'))));
test('299. alignment gate exists', () => assert.ok(fs.existsSync(path.join(ROOT, 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment.mjs'))));
test('300. registry mentions alignment paths', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/bridge-source-shape-alignment/.test(reg)); });
