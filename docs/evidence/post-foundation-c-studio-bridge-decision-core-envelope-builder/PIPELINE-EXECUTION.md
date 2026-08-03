# Pipeline Execution (first-blocker)

> Builder: `studio-bridge-decision-core-envelope-builder@1.0.0`.

23 estágios reais em ordem exata (derivados de `BUILDER_PIPELINE_STAGES`). `firstBlockerStopsPipeline: true` e
`skipRemainingStagesOnBlocker: true`: após o primeiro blocker nenhum validator posterior executa e nenhum issue
posterior aparece — provado em teste e gate (ex.: `kind` inválido bloqueia em eligibility e **não** produz
`BUILDER_DIGEST_MISMATCH`). O envelope só existe após todos os estágios passarem (atomic emission point).

---
_Evidência do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder. Memória = repositório._
