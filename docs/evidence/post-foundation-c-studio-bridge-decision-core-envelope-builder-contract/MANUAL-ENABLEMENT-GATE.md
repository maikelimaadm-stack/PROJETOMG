# Manual Enablement Gate

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

O gate manual autoriza APENAS o contrato do builder (`authorizesBuilderContract:true`); tudo o mais (plano de implementação, implementação, runtime, mount, exposição) permanece `false`. Flags de ambiente fail-closed em produção.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
