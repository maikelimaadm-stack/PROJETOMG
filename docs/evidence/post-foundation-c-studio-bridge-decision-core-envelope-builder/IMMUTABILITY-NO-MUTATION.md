# Immutability / No Mutation

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Recebe uma `bridgeDecision` real, extrai o core exato, recomputa e compara o digest, e emite um Core Envelope v2 imutável ou uma rejeição atômica sanitizada. Nenhum consumer runtime, preview, UI/App, persistência, backend/Prisma, módulo, certificação ou produto.

A source nunca é mutada (clone read-only). Todo output (decisão, envelope, core, issues) é deep-frozen.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
