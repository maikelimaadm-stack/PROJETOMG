# Replay / Idempotency Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Recompor o contrato é idempotente: manifest overall digest estável `fnv1a-c7de1b64` em recomposições. O digest reflete os novos estados corrigidos.

---
_Evidência do slice Post-Foundation C — Studio Core Envelope Builder Verification State Classification Correction (correção pós-#492). Memória = repositório._
