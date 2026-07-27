# Digest Recompute Plan

> Plano: `studio-bridge-decision-core-envelope-builder-implementation-plan@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free, PLAN-ONLY. Nenhum builder/factory/build/extractor/digest/consumer runtime; nenhum envelope construído; nenhuma subtree futura criada; nenhum amendment criado.

serializer = `stableSerialize (real runtime helper)`; helper = `createDeterministicDigest (real runtime helper, FNV-1a key-sorted)`; preimage = `bridgeDecisionCore (exact allowlist, digest excluded)`; exact compare; mismatch rejeita atomicamente; não-cripto. Tamper: `every core field`, `deep target descriptor`, `arrays/order`, `digest`, `cross-decision mix`.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Implementation Plan (plan-only). Memória = repositório._
