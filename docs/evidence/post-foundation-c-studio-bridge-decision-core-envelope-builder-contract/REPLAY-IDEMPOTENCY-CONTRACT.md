# Replay / Idempotency Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Recompor o contrato é idempotente: manifest overall digest estável `fnv1a-55113357` em recomposições. A mesma decisão produz o mesmo core/digest/envelope.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
