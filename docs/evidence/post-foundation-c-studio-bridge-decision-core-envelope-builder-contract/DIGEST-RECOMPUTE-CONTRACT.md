# Digest Recompute Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

O builder recomputa `createDeterministicDigest(core)` e compara com `decision.bridgeDecisionDigest`. Divergência ⇒ rejeição fail-closed. Digest de identidade interna (FNV-1a, key-sorted), NÃO-criptográfico. Inalterado por esta correção.

---
_Evidência do slice Post-Foundation C — Studio Core Envelope Builder Verification State Classification Correction (correção pós-#492). Memória = repositório._
