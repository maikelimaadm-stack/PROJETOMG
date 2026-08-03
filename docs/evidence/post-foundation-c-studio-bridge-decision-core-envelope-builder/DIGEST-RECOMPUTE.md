# Digest Recompute

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Recebe uma `bridgeDecision` real, extrai o core exato, recomputa e compara o digest, e emite um Core Envelope v2 imutável ou uma rejeição atômica sanitizada. Nenhum consumer runtime, preview, UI/App, persistência, backend/Prisma, módulo, certificação ou produto.

Recomputa `createDeterministicDigest(core)` (helper real, FNV-1a key-sorted) e compara EXATAMENTE com `source.bridgeDecisionDigest`. Não-criptográfico. Sem synthesis/alias/fallback. Mismatch ⇒ rejeição atômica.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
