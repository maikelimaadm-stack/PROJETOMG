# Safe Clone & Normalize

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0` — headless, dev-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Recebe uma `bridgeDecision` real, extrai o core exato, recomputa e compara o digest, e emite um Core Envelope v2 imutável ou uma rejeição atômica sanitizada. Nenhum consumer runtime, preview, UI/App, persistência, backend/Prisma, módulo, certificação ou produto.

Protege contra cycles, depth, NaN/Infinity, BigInt/Symbol/Function, undefined em objeto, accessors/getters/setters, Date/Map/Set/RegExp/Error/instâncias de classe, sparse arrays, protótipos custom e pollution keys. Negative zero → +0. Nenhum getter executado além da inspeção de descriptor; nunca usa JSON.stringify como sanitizer; nunca trunca. Toda exceção interna vira rejeição sanitizada.

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
