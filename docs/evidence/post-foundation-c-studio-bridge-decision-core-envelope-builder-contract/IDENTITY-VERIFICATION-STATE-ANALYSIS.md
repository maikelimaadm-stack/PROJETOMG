# Identity Verification State — Analysis (B-CORE-ENVELOPE-VERIFICATION-STATE)

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

### O conflito

O Core Envelope v2 fixa `CORE_ENVELOPE_INVARIANTS.identityVerified = false` como invariante absoluta de instância. Simultaneamente, `identityVerified` é um campo de segurança do consumer-runtime. O builder executa recompute-and-compare (uma verificação real de integridade), mas NÃO pode emitir `identityVerified:true` no envelope sem violar a invariante mergeada.

### Decisão

NÃO sobrescrever silenciosamente. Declarar **B-CORE-ENVELOPE-VERIFICATION-STATE = ABERTO**.

### Opções avaliadas (de upstreams reais)

- **Option A** — emendar a invariante do Core Envelope v2 para permitir `identityVerified` derivado do recompute-and-compare (mudança de contrato/estado; exige amendment).
- **Option B (selecionada agora)** — o RESULT do builder carrega o estado verificado FORA do envelope; o envelope permanece `identityVerified:false`. Compatível com o v2 mergeado sem alteração.
- **Option C** — introduzir um campo/estado de lifecycle separado no envelope via amendment.

### Recomendação

Option B para este slice (sem alteração de SSOT). Para verificação anunciada pelo envelope, uma futura **Core Envelope Verification State Amendment** (Option A ou C). `compatibleWithMergedV2Invariant = false`.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
