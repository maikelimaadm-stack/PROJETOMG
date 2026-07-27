# Implementation Phases (22)

> Plano: `studio-bridge-decision-core-envelope-builder-implementation-plan@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free, PLAN-ONLY. Nenhum builder/factory/build/extractor/digest/consumer runtime; nenhum envelope construído; nenhuma subtree futura criada; nenhum amendment criado.

1. `PHASE_01_CONFIG_AND_FACTORY_BOUNDARY` — Establish createBridgeDecisionCoreEnvelopeBuilder(config) boundary and validate/freeze config.
2. `PHASE_02_SAFE_CONFIG_NORMALIZATION` — Safe-normalize the config fail-closed (no code copied from upstream hardening).
3. `PHASE_03_SAFE_SOURCE_NORMALIZATION` — Safe-normalize the incoming bridgeDecision (cycles/depth/types) read-only.
4. `PHASE_04_SOURCE_SHAPE_VALIDATION` — Validate the source shape against the real 33-field bridgeDecision; reject invented/missing.
5. `PHASE_05_SOURCE_ELIGIBILITY_VALIDATION` — Enforce success eligibility: kind=bridge-decision, ok=true, status=bridge_ready, target+digest present.
6. `PHASE_06_SOURCE_VERSION_VALIDATION` — Exact upstream version match; version drift fails closed.
7. `PHASE_07_SOURCE_SECURITY_BOUNDARY` — Reject forbidden security/exposure flags asserted on the source.
8. `PHASE_08_TARGET_DESCRIPTOR_VALIDATION` — Validate the target descriptor inside the source decision.
9. `PHASE_09_CORE_ALLOWLIST_RESOLUTION` — Resolve the real DECISION_DIGEST_PREIMAGE_FIELDS allowlist (32) — no local divergent list.
10. `PHASE_10_CORE_EXTRACTION` — exact_allowlist_pick extraction of bridgeDecisionCore (32 fields; digest excluded).
11. `PHASE_11_CORE_COMPLETENESS_AND_DRIFT_VALIDATION` — Validate core completeness; unknown source field ⇒ fail-closed drift.
12. `PHASE_12_DIGEST_RECOMPUTE_AND_COMPARE` — Recompute createDeterministicDigest(core) and compare exactly with source.bridgeDecisionDigest.
13. `PHASE_13_SAME_DECISION_ATOMICITY` — Ensure digest and core come from the SAME decision; reject cross-decision mixing.
14. `PHASE_14_CORE_ENVELOPE_CONSTRUCTION` — Construct Core Envelope v2 (12 fields); identityVerified stays false; clone + deep-freeze.
15. `PHASE_15_CORE_ENVELOPE_SHAPE_VALIDATION` — Validate exact envelope shape/invariants; digest once, core once, target only inside core.
16. `PHASE_16_IDENTITY_LIFECYCLE_RECORDING` — Record identity lifecycle per ARCHITECTURE 1: builder-side verified outside the envelope only.
17. `PHASE_17_BUILDER_DECISION_CONSTRUCTION` — Construct the deterministic builder decision (success) carrying the envelope + producer verification.
18. `PHASE_18_FAILURE_AND_EMERGENCY_REJECTION` — Deterministic rejection + sanitized emergency rejection on unexpected errors; no leaks.
19. `PHASE_19_RESOURCE_LIMITS_AND_EXTENSIONS` — Enforce real resource limits + reject core/digest/version overrides and prototype pollution.
20. `PHASE_20_REPLAY_IDEMPOTENCY_AND_MANIFEST` — Cross-instance determinism + deterministic manifest of the build result.
21. `PHASE_21_TEST_GATE_AND_BUNDLE_EVIDENCE` — Author the future implementation test (>=1050) + gate (>=330) + bundle-absence evidence.
22. `PHASE_22_READINESS_AND_MANUAL_CHECKPOINT` — Declare readiness for the pre-implementation authorization checkpoint (still gated externally).

Cada fase: objective, inputs, outputs, dependencies, pre/postconditions, futureFiles, contractReferences, issues, limits, security, failure/rollback, determinism, tests, gates, acceptanceCriteria, `sideEffectsAllowed:false`, `implementationStatus:planned`.

**Plan-only.** Consome o Builder Contract auditado READ-ONLY: B-CORE-ENVELOPE-BUILDER **CLOSED_BY_CONTRACT**; `identityVerified` é **consumer-owned** (ARCHITECTURE 1, final); **nenhum** Core Envelope Verification State Amendment é necessário. O builder futuro está ausente. Próximo passo somente após a auditoria pós-merge deste plano.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Implementation Plan (plan-only). Memória = repositório._
