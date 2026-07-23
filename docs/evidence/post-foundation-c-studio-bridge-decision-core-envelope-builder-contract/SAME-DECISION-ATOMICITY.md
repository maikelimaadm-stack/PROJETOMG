# Same-Decision Atomicity

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Extração, recomputação e emissão operam sobre uma única decisão imutável, atomicamente: ou um Core Envelope v2 completo é emitido, ou nada (rollback por não-emissão). Decisões distintas produzem cores/digests distintos.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
