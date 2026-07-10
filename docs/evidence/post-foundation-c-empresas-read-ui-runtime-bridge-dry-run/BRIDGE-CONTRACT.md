# BRIDGE CONTRACT — EMPRESAS RUNTIME BRIDGE READ CONTRACT

Espelho legível de `createEmpresasRuntimeBridgeReadContract()`. Contrato **read-only**, **dryRun: true** — descreve uma futura ponte sem executar nada.

---

## allowedOperations (somente leitura)

| Operação | Significado |
|---|---|
| `readModel` | ler o read-only view model (mock/controlled) |
| `renderReadOnly` | renderizar a UI read-only (dev-only) |
| `inspectDiagnostics` | inspecionar diagnostics |
| `compareSnapshots` | comparar snapshots (dual-read) |
| `reportReadiness` | reportar readiness/score |

Nenhuma operação de write, execução, mutação de legado, backend ou storage está no allowed.

## blockedOperations

`create`, `update`, `delete`, `save`, `submit`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `executeAction`, `startWorkflow`, `invokeConnector`, `mutateLegacyRuntime`, `writeBackend`, `writeStorage`.

## requiredInputs

- `guardedReadUiModel`
- `parityHardeningModel`
- `readOnlyCandidate`
- `dualReadCompare`
- `featureFlags`

## producedOutputs

- `readOnlyViewModel`
- `bridgeDiagnostics`
- `mountPlan`
- `rollbackPlan`
- `readinessStatus`

## fallback

- **target:** legacy Empresas screen
- **mechanism:** flag off — a tela real continua legada; a ponte nunca ativa
- **dataSource:** runtime legado (inalterado)

## rollback

- **strategy:** flag-off reversal
- **featureFlagDefault:** off
- **destructive:** false · **schemaChange:** false · **realWrite:** false

## safety guarantees

`readOnly: true`, `noSideEffects: true`, `noBackend: true`, `noPrismaMmm: true`, `noStorage: true`, `noLegacyMutation: true`, `writeImpossible: true`.

## future read slot notes

O próximo passo (**Empresas Runtime Bridge Read Slot Candidate**) poderia, num slice futuro, usar este contrato para expor um slot **read-only** dev-guarded — ainda sem write, sem dados reais como fonte principal, sem tocar a tela real ou o runtimeBridge de produção. Este slice apenas descreve o contrato e simula a montagem; não monta nada.
