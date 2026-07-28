# Risk Matrix

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Recebe uma `bridgeDecision` real, extrai o core exato, recomputa e compara o digest, e emite um Core Envelope v2 imutável ou uma rejeição atômica sanitizada. Nenhum consumer runtime, preview, UI/App, persistência, backend/Prisma, módulo, certificação ou produto.

Riscos mitigados: source/allowlist/digest drift (allowlist derivada do upstream + LIVE digest equivalence), wrong preimage (serialize(core)==serialize(decision-digest)), cross-decision mix (atomicity), identity conflation (ARCHITECTURE 1), envelope true (invariante false), mutation (clone+freeze), partial output (atomic rollback), leak (sanitized rejection), pollution (guard), resource exhaustion (limites), nondeterminism (sem clock/random), version mismatch (exact match), consumer trust without reverification (consumer não implementado; double verification).

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
