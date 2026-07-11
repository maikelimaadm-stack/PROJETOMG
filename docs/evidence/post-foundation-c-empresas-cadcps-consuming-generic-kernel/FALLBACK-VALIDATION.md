# Fallback Validation

Todo cenário de falha mantém o **fluxo atual do ModeloBase1**, não quebra o render, não executa
write real e não toca backend/Prisma/runtimeBridge. Cada um registra `diagnostics`/`fallbackReason`.

| # | Cenário | `reason` | Resultado |
|---|---|---|---|
| 1 | **flag off** | `consumption-flag-off` | `readState` atual verbatim; `consumptionApplied:false` |
| 2 | **runtimeReadModel ausente** (flag on, sem beta) | `beta-read-model-off` | legacy; `readState` original/null |
| 3 | **adapter ausente** (sem `mapReadToGeneric`/`mapGenericToRead`) | `adapter-failure` | fallback; original preservado |
| 4 | **generic validation falha** (`mapReadToGeneric` ok=false) | `generic-validation-failed` | fallback; `fallback.fallbackApplied:true` |
| 5 | **mapping back falha** (`mapGenericToRead` não-objeto) | `invalid-read-model` | fallback; original preservado |
| 6 | **unsafe payload** | sanitizado pelo kernel antes de validar; se inválido → `generic-validation-failed` | fallback |
| 7 | **erro interno** (adapter lança) | `adapter-failure` | fallback; original preservado |

## Garantias (todas cobertas por teste + gate)

- `backendTouched: false`, `prismaTouched: false`, `runtimeBridgeTouched: false`,
  `persistenceReal: false` em todos os caminhos.
- `rollbackPlan` passivo (`safety.executesRollback === false`) — nunca executa rollback.
- `fallback` **não muta** o `config` original nem o `runtimeReadModel` original (cópias seguras).
- Retorno é cópia segura: mutar o `readState` retornado não altera estado interno nem chamadas
  futuras.

## Casos de teste correspondentes

`empresas-cadcps-consuming-generic-kernel.test.js`: #10 (off), #14 (validation), #15 (throw),
#16 (ok=false), #17 (mapping back), #18 (adapter sem métodos), #22 (cópia segura), #26/#27
(readState null), #30–32 (fallback builder).
