# Risk Matrix

> Plano: `studio-bridge-decision-core-envelope-builder-implementation-plan@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free, PLAN-ONLY. Nenhum builder/factory/build/extractor/digest/consumer runtime; nenhum envelope construído; nenhuma subtree futura criada; nenhum amendment criado.

- `R01_SOURCE_FIELD_DRIFT` — high — derive shape from real upstream; reject invented/missing (verify: shape validation tests)
- `R02_ALLOWLIST_DRIFT` — high — allowlist == DECISION_DIGEST_PREIMAGE_FIELDS; no local list (verify: allowlist equivalence gate)
- `R03_DIGEST_DRIFT` — critical — real helper; exact compare; no synthesis (verify: LIVE digest equivalence)
- `R04_WRONG_PREIMAGE` — critical — preimage=core=decision minus digest (verify: serialize(core)==serialize(decision-digest))
- `R05_CROSS_DECISION_MIX` — high — atomic pair; reject mixing (verify: digest A + core B mismatch tests)
- `R06_IDENTITY_CONFLATION` — high — builder verified outside envelope; consumer owns envelope flag (verify: identity lifecycle tests)
- `R07_ENVELOPE_IDENTITY_TRUE` — high — envelope.identityVerified always false (verify: envelope invariant gate)
- `R08_ENVELOPE_MUTATION` — high — clone + deep-freeze; consumer does not mutate (verify: immutability tests)
- `R09_PARTIAL_OUTPUT` — high — atomic; rollback by non-emission (verify: failure containment tests)
- `R10_LEAK` — high — sanitized rejection; no stack/secret/message leak (verify: no-leak tests)
- `R11_PROTOTYPE_POLLUTION` — high — reject __proto__/constructor/prototype (verify: pollution key tests)
- `R12_RESOURCE_EXHAUSTION` — medium — enforce real limits; no silent truncation (verify: boundary limit tests)
- `R13_NONDETERMINISM` — high — no clock/random/locale/timezone (verify: cross-instance determinism tests)
- `R14_VERSION_MISMATCH` — high — exact version match; drift fail-closed (verify: version drift tests)
- `R15_CONSUMER_TRUST_WITHOUT_REVERIFICATION` — high — doubleVerificationRequired; consumer re-verifies independently (verify: lifecycle + consumer-decision plan tests)
- `R16_SCOPE_LEAK_TO_UI_OR_PRODUCTION` — critical — headless/dev-only; bundle absence; scope gate (verify: dist scan 0 hits + scope gate)
- `R17_SILENT_CORE_SYNTHESIS` — critical — no alias/default/coercion/synthesis (verify: extraction adversarial tests)

Total: 17 riscos.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Implementation Plan (plan-only). Memória = repositório._
