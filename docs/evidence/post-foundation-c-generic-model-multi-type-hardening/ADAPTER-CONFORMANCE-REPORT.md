# Adapter Conformance Report

## Regras de conformance (`genericModelConformanceRules.js`)

Cada regra tem um `appliesWhen` (gate por capacidade de `supports`):

| Regra | Aplica quando | Severidade |
|---|---|---|
| `adapterId` | sempre | blocker |
| `modelFamily` | sempre | blocker |
| `modelType` (== esperado) | sempre | blocker |
| `supports` (com read:true) | sempre | blocker |
| `readContract` (direto/runtimeContract/map) | sempre | blocker |
| `writeContract` | `localWrite` | blocker |
| `eventContract` | `eventAppend` | blocker |
| `persistence`/snapshot | `localPersistenceValidation` | blocker |
| `diagnostics` | sempre | blocker |
| `fallback` | sempre | blocker |
| `dangerousCapabilitiesFalse` | sempre | blocker |
| `localOnly` | `localWrite` | blocker |
| `persistenceRealFalse` | sempre | blocker |
| `sentFalse` | `eventAppend` | blocker |
| `noForbiddenTargets` (descriptor) | sempre | blocker |

O validador é **tolerante**: um contrato pode ser exposto diretamente, via `runtimeContract`, ou
via bridge/map. O scan `noForbiddenTargets` cobre apenas a metadata **autorada pelo adapter** —
os contratos confiáveis do kernel (`runtimeContract`/`safetyPolicy`/`capabilities`/…) são
excluídos, pois nomeiam o vocabulário de segurança legitimamente (`backend:false`, etc.).

## ModeloBase1 (cadastro) — result

- `valid: true`, `safeToConsume: true`, `conformanceScore: 1.00`
- readContract via `runtimeContract`/`mapReadToGeneric`; writeContract via `writeBridge`;
  persistence via `persistenceBridge`; diagnostics via `diagnosticsBridge`; fallback via
  `fallbackBridge`.
- `eventAppend` não suportado → `eventContract` **não exigido** (aceito).

## ModeloBase2 (operacional) — result

- `valid: true`, `safeToConsume: true`, `conformanceScore: 1.00`
- readContract + writeContract + `eventContract` presentes; persistence via `createSnapshot`/
  `roundTrip`; diagnostics via `createDiagnostics`; fallback via `createFallback`.
- `sent === false`, `persistenceReal === false`, dangerous capabilities false.

## Diferenças permitidas

| | cadastro (MB1) | operacional (MB2) |
|---|---|---|
| central | table/form | entries/timeline/event |
| localWrite | crud-local | event-append |
| eventAppend | false (aceito) | true (aceito) |
| sent | n/a | false |
| table/form | obrigatório | compatibilidade secundária |

## Invariantes comuns (todos os reports)

`backendTouched/prismaTouched/runtimeBridgeTouched: false`, `persistenceReal: false`,
`localOnly: true`, `noSideEffects: true`.

## Falhas simuladas (cobertas por testes)

- adapter sem `modelType` → falha
- adapter com `backendWrite: true` → falha (`dangerousCapabilitiesFalse`)
- operacional sem `eventContract` → falha
- cadastro sem `readContract`/`runtimeContract`/`map` → falha
- forbidden target (`backendUrl`) introduzido no descriptor → falha (`noForbiddenTargets`)
