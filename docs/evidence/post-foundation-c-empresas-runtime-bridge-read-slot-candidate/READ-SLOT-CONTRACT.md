# READ SLOT CONTRACT — EMPRESAS RUNTIME BRIDGE READ SLOT CONTRACT

Espelho legível de `createEmpresasRuntimeBridgeReadSlotContract()`. Contrato **read-only**, **candidate: true** — descreve um futuro slot controlado sem executar nada.

---

## allowedOperations (somente leitura)

| Operação | Significado |
|---|---|
| `receiveReadModel` | receber o read-only view model (mock/controlled) |
| `renderReadOnly` | renderizar a UI read-only (dev-only) |
| `inspectDiagnostics` | inspecionar diagnostics |
| `inspectParity` | inspecionar parity/score |
| `inspectWriteGuard` | inspecionar o write guard (somente leitura) |
| `reportReadiness` | reportar readiness |

Todas começam com verbos read-only (`receive`/`render`/`inspect`/`report`).

## blockedOperations

`create`, `update`, `delete`, `save`, `submit`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `executeAction`, `startWorkflow`, `invokeConnector`, `mutateLegacyRuntime`, `mutateRuntimeBridge`, `writeBackend`, `writeStorage`, `replaceProductionUi`.

## requiredInputs

- `readOnlyViewModel`
- `guardedReadUiModel`
- `bridgeDryRun`
- `parityHardeningModel`
- `featureFlags`

## producedOutputs

- `readSlotPayload`
- `readOnlyRenderModel`
- `slotDiagnostics`
- `mountPlan`
- `rollbackPlan`
- `readinessStatus`

## slotConsumers

- `devPreviewRoute`
- `guardedReadUiOverlay`
- `futureRuntimeBridgeReadSlot`

(Nunca uma rota pública/produção.)

## fallback

- **target:** legacy Empresas screen
- **mechanism:** flag off — a tela real continua legada; o slot nunca ativa
- **dataSource:** runtime legado (inalterado)

## rollback

- **strategy:** flag-off reversal
- **featureFlagDefault:** off
- **destructive:** false · **schemaChange:** false · **realWrite:** false

## safety guarantees

`readOnly: true`, `candidateOnly: true`, `noSideEffects: true`, `noBackend: true`, `noPrismaMmm: true`, `noStorage: true`, `noLegacyMutation: true`, `noRuntimeBridgeMutation: true`, `noProductionUiReplacement: true`, `writeImpossible: true`.

## future dev activation notes

O próximo passo (**Empresas Runtime Bridge Read Slot Dev Activation**) poderia, num slice futuro, ativar este slot **dev-only** dentro do ambiente de preview (`/__dev/runtime-v2/previews`) — ainda sem write, sem dados reais como fonte principal, sem tocar a tela real ou o runtimeBridge de produção. Este slice apenas descreve o contrato, gera o payload validado e simula a montagem; não monta nada.
