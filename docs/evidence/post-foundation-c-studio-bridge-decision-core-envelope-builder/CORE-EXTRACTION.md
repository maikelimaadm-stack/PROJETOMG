# Core Extraction

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Recebe uma `bridgeDecision` real, extrai o core exato, recomputa e compara o digest, e emite um Core Envelope v2 imutável ou uma rejeição atômica sanitizada. Nenhum consumer runtime, preview, UI/App, persistência, backend/Prisma, módulo, certificação ou produto.

`exact_allowlist_pick`: core construído EXATAMENTE dos campos da allowlist presentes na source normalizada. Sem aliases, defaults, coerção ou transformação semântica. O digest nunca entra no core. Output clone independente deep-frozen.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
