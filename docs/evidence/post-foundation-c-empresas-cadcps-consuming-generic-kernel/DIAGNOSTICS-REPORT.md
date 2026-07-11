# Diagnostics Report — Generic Kernel Consumption

## `createModeloBase1GenericKernelConsumptionDiagnostics(options)`

Registro **passivo** e serializável do resultado de uma tentativa de consumo.

### Campos

| Campo | Significado |
|---|---|
| `kind` | `'modelobase1-generic-kernel-consumption-diagnostics'` |
| `moduleId` | módulo (`empresas`/`cadcps`/…) |
| `phase` | `'empresas-cadcps-generic-kernel-consumption'` |
| `consumptionEnabled` | flag + beta resolvidos como ligados |
| `consumptionApplied` | kernel efetivamente aplicado |
| `legacyFallback` | caiu no fluxo atual |
| `genericKernelApplied` | espelha `consumptionApplied` |
| `readiness` | `'generic-kernel'` (aplicado) ou `'legacy'` (fallback) |
| `reason` | motivo do fallback, quando houver |
| `validation` | `{ valid, errorCount }` (resumo da validação genérica) |
| `warnings` / `errors` | listas propagadas |

### Invariantes (sempre)

```
localOnly: true · persistenceReal: false
backendTouched: false · prismaTouched: false · runtimeBridgeTouched: false
noSideEffects: true · reversible: true
```

## Estados observáveis

| Cenário | `consumptionApplied` | `readiness` | `legacyFallback` |
|---|---|---|---|
| flag off | false | `legacy` | true |
| flag on + beta (ok) | **true** | **generic-kernel** | false |
| flag on + inválido | false | `legacy` | true |
| adapter falha | false | `legacy` | true |

## Serialização

O diagnóstico passa por `safeCloneGenericModel` (round-trip JSON) — sem funções, sem
referências vivas — de modo que pode ser logado/inspecionado com segurança
(`JSON.parse(JSON.stringify(diagnostics))` nunca lança).

## Uso

O `applyModeloBase1GenericKernelConsumption` sempre devolve `diagnostics` no retorno, tanto no
caminho aplicado quanto no fallback/legacy, permitindo observabilidade sem side effects.
