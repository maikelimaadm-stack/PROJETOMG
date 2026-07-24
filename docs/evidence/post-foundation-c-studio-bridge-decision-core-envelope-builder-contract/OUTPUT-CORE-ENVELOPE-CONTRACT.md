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

`identityVerified` permanece `false` no envelope imutável pré-consumer — CORRETO (flag de lifecycle do consumer).

**Correção semântica (pós-auditoria da PR #492).** O identificador histórico **B-CORE-ENVELOPE-VERIFICATION-STATE** é reclassificado como **NOT_A_BLOCKER** — **no amendment required**. O campo `identityVerified` é **consumer-owned**: no Core Envelope v2 ele pertence a `CORE_ENVELOPE_SECURITY_FIELDS` (ao lado de `coreConsumed`, `consumerRuntimeInvoked`, `previewMounted`, `productExposed`), e a decisão do consumer carrega o SEU próprio `identityVerified`. A verificação do builder (recompute-and-compare) é registrada na **builder decision**, FORA do envelope imutável; o envelope pré-consumer permanece corretamente `identityVerified:false` (= "ainda não verificado pelo consumer"); o consumer reverifica independentemente. Isto é a **ARCHITECTURE 1**, e ela é **FINAL**. Consequência: `bCoreEnvelopeBuilderClosedByContract:true` e `readyForBuilderImplementationPlan:true`. Nenhum Core Envelope Verification State Amendment será criado.

---
_Evidência do slice Post-Foundation C — Studio Core Envelope Builder Verification State Classification Correction (correção pós-#492). Memória = repositório._
