# Fallback & Safety — Generic Kernel Consumption

## Princípio

O consumo é **aditivo e reversível**: nunca substitui o fluxo atual do ModeloBase1 e sempre
tem um caminho de volta. Toda falha é recuperável e devolve o `readState` **original**.

## Fallback (`createModeloBase1GenericKernelConsumptionFallback`)

Retorno:

```
{ ok:false, consumptionApplied:false, legacyFallback:true,
  readState: <cópia segura do state original ou null>,
  reason, fallback: <generic fallback, fallbackApplied:true>,
  rollbackPlan: <passivo>, errors, warnings }
```

- `readState` é a **cópia do state original** (via `safeCloneGenericModel`) — o chamador mantém
  exatamente o que já tinha.
- `fallback` e `rollbackPlan` vêm do `createModeloBase1GenericFallbackBridge` (kernel genérico).
- Mapeamento de razão → enum do bridge:
  - `beta-read-model-off` / `runtime-read-model-absent` → `runtime-read-model-absent`
  - `generic-validation-failed` / `invalid-read-model` → `invalid-read-model`
  - outros → `adapter-failure`

## Gatilhos de fallback

| Gatilho | `reason` |
|---|---|
| Flag ligada mas beta ausente | `beta-read-model-off` (via resolve; caminho legacy) |
| `mapReadToGeneric` ⇒ `ok:false` / readModel inválido | `generic-validation-failed` |
| `mapGenericToRead` ⇒ não-objeto | `invalid-read-model` |
| Adapter sem `mapReadToGeneric`/`mapGenericToRead` | `adapter-failure` |
| Adapter lança exceção | `adapter-failure` |

## Safety (invariantes garantidos)

Em **todo** state consumido e **todo** diagnóstico:

| Invariante | Valor |
|---|---|
| `localOnly` | `true` |
| `persistenceReal` | `false` |
| `backendTouched` | `false` |
| `prismaTouched` | `false` |
| `runtimeBridgeTouched` | `false` |
| `noSideEffects` | `true` (diagnóstico) |
| `reversible` | `true` (diagnóstico) |

## Pureza / isolamento (provado por gate estrutural)

- Sem `fetch`/`XMLHttpRequest`/`WebSocket`.
- Sem `localStorage`/`sessionStorage`/`indexedDB`.
- Sem import de `src/apis`, Prisma, `src/backend`, `makBootstrap`, `runtimeBridge`.
- Sem import de `src/modules/empresas|cadcps` (camada desacoplada).
- React importado **apenas** no hook opcional (`useModeloBase1GenericKernelConsumption.js`).

## Sanitização herdada do kernel

O `mapReadToGeneric` do adapter roda o `sanitizeGenericModelPayload` genérico antes de validar:
funções/handlers/elementos React/poluição de protótipo são bloqueados; `token`/`apiKey`/`secret`/
`password` são mascarados (`[REDACTED]`). Assim, mesmo um `readState` "sujo" não vaza para o
state consumido.
