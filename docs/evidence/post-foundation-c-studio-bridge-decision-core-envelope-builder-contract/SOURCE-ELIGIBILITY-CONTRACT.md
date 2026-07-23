# Source Eligibility Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Elegibilidade de sucesso exigida antes de qualquer extração: `kind === 'bridge-decision'`, `ok === true`, `status === 'bridge_ready'`. Decisões não-elegíveis são rejeitadas fail-closed sem emissão de envelope.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
