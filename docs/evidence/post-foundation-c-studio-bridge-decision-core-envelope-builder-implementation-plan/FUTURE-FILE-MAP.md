# Future File Map

> Plano: `studio-bridge-decision-core-envelope-builder-implementation-plan@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free, PLAN-ONLY. Nenhum builder/factory/build/extractor/digest/consumer runtime; nenhum envelope construído; nenhuma subtree futura criada; nenhum amendment criado.

Mapa de arquivos futuros (responsabilidade única; nenhum criado neste slice):

- `builderConfig.js` — validate + freeze the builder config (dev-only flags, limits refs)
- `safeCloneAndNormalize.js` — cycle/depth/type-safe structural clone (no upstream code copy)
- `normalizeBuilderConfig.js` — normalize + fail-closed the config
- `normalizeSourceDecision.js` — safe-normalize the incoming bridgeDecision (read-only)
- `validateSourceDecisionShape.js` — reject invented/missing source fields vs real shape
- `validateSourceEligibility.js` — kind/ok/status/target/digest eligibility, fail-closed
- `validateSourceVersions.js` — exact upstream version match, drift fail-closed
- `validateSourceSecurityBoundary.js` — reject forbidden security/exposure flags on source
- `validateTargetDescriptor.js` — validate the target descriptor inside the source
- `resolveCoreFieldAllowlist.js` — resolve the real DECISION_DIGEST_PREIMAGE_FIELDS allowlist
- `extractBridgeDecisionCore.js` — exact_allowlist_pick extraction of bridgeDecisionCore
- `validateExtractedCore.js` — completeness + drift validation of the extracted core
- `recomputeBridgeDecisionDigest.js` — recompute digest over the core (real helper)
- `validateSameDecisionAtomicity.js` — digest+core from the same decision; reject mixing
- `constructCoreEnvelope.js` — build the Core Envelope v2 (identityVerified stays false)
- `validateCoreEnvelopeShape.js` — exact envelope field/invariant validation
- `createBuilderDecision.js` — success builder decision (identityVerified=true outside envelope)
- `createBuilderRejection.js` — deterministic rejection (coreEnvelope null, stable issues)
- `createEmergencyBuilderRejection.js` — sanitized fail-closed rejection on unexpected error
- `normalizeIssues.js` — deterministic ordering + shape of issues, no leaks
- `resourceLimitEnforcer.js` — enforce real resource limits, no silent truncation
- `extensionValidator.js` — reject core/digest/version override + prototype pollution
- `prototypePollutionGuard.js` — reject __proto__/constructor/prototype keys
- `replayIdempotency.js` — cross-instance determinism (no clock/random/locale)
- `builderDiagnostics.js` — deterministic diagnostics from a build result
- `builderManifest.js` — deterministic manifest (FNV internal identity)
- `verifyBuilderCompatibility.js` — live compatibility with real upstreams
- `createBridgeDecisionCoreEnvelopeBuilder.js` — public factory → { build(bridgeDecision) }
- `index.js` — public surface (only .js)

**Plan-only.** Consome o Builder Contract auditado READ-ONLY: B-CORE-ENVELOPE-BUILDER **CLOSED_BY_CONTRACT**; `identityVerified` é **consumer-owned** (ARCHITECTURE 1, final); **nenhum** Core Envelope Verification State Amendment é necessário. O builder futuro está ausente. Próximo passo somente após a auditoria pós-merge deste plano.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Implementation Plan (plan-only). Memória = repositório._
