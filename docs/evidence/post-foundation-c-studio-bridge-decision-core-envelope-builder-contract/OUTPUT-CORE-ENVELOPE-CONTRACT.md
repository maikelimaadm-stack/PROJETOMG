# Output Core Envelope Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Core Envelope v2 de saída: 12 campos. Invariantes de instância:

```json
{
  "envelopeKind": "bridge_decision_core_envelope",
  "synthetic": true,
  "immutable": true,
  "metadataOnly": true,
  "identityVerified": false,
  "coreConsumed": false,
  "consumerRuntimeInvoked": false,
  "previewMounted": false,
  "productExposed": false
}
```

Nota crítica: `identityVerified` é invariante absoluta `false` no v2 mergeado.

Blocker **B-CORE-ENVELOPE-VERIFICATION-STATE** está **ABERTO**: o contrato Core Envelope v2 mergeado fixa `identityVerified:false` como invariante absoluta de instância, enquanto `identityVerified` é um campo de segurança do consumer-runtime. O builder recompute-and-compare o digest mas não pode emitir `identityVerified:true` no envelope. Resolução selecionada: **Option B** (o RESULT do builder carrega o estado verificado FORA do envelope; o envelope permanece `false`). A resolução enterprise (verificação anunciada pelo envelope) exige uma futura **Core Envelope Verification State Amendment** (Option A ou C). Por isso `bCoreEnvelopeBuilderClosedByContract:false` e `readyForBuilderImplementationPlan:false`.

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
