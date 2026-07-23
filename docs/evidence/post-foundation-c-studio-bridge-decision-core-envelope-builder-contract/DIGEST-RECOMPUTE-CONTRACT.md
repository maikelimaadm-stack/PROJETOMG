# Digest Recompute Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

O builder recomputa `createDeterministicDigest(core)` e compara com `decision.bridgeDecisionDigest`. Divergência ⇒ rejeição fail-closed. O digest é de identidade interna (FNV-1a, key-sorted), declarado NÃO-criptográfico. Categorias de adulteração detectadas: 9.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
