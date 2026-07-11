# ModeloBase2 Prototype Adapter Report

## Objetivo

Primeira prova de um **segundo tipo de modelo** sobre o Generic Model Runtime: **ModeloBase2 =
modelo operacional / lançamento / apontamento / evento**. Exemplos futuros: lançamento de
combustível, pesagem, apontamento diário, movimentação simples, coleta offline-first.

Neste slice tudo é **prototype/headless** — sem UI real, sem rota, sem menu, sem tocar módulo real.

## Adapter principal

`createModeloBase2PrototypeAdapter({ moduleId })` retorna um objeto plano com:

- `adapterId`, `modelFamily: 'modeloBase2'`, `modelType: 'operacional'`, `modelId`, `moduleId`
- `supports`: `read`, `localWrite`, `operationalDraft`, `eventAppend`, `localPersistenceValidation`,
  `diagnostics`, `fallback`
- `capabilities` (do runtime contract genérico; perigosas `false`)
- `genericKernelVersion`, `runtimeContract`, `readContract`, `writeContract`, `eventContract`,
  `persistenceContract`, `safetyPolicy`
- métodos vivos: `createReadModel`, `createDraft`, `applyMutation`, `createSnapshot`,
  `validateSnapshot`, `roundTrip`, `createDiagnostics`, `createFallback`
- `limitations`, `nextSteps`, `localOnly: true`, `persistenceReal: false`, `sent: false`

Usa os primitivos genéricos: `createGenericModelRuntimeContract`, `createGenericModelReadContract`,
`createGenericModelWriteContract`, `validateGenericModelWritePayload`, `createGenericModelSnapshot`,
`validateGenericModelSnapshot`, `createGenericModelVersion`, `createGenericModelChecksum`,
`createGenericModelInMemoryAdapter`, `createGenericModelDiagnostics`, `createGenericModelFallback`,
`createGenericModelRollbackPlan`, `sanitizeGenericModelPayload`.

## Diferença ModeloBase1 vs ModeloBase2

| | ModeloBase1 | ModeloBase2 |
|---|---|---|
| modelType | `cadastro` | `operacional` |
| Foco | table/form, config-driven, CRUD local | lançamento/evento, append/event log, rascunho operacional |
| Diferencial | colunas/campos | **entries + timeline de eventos locais** |
| Escrita | CRUD local | **append de eventos** (draft.created, entry.added, ...) |
| UI | telas reais (Empresas/cadcps) beta | **headless** (sem UI neste slice) |

## modelType operacional

`operacional` já pertence a `GENERIC_MODEL_TYPES` — nenhum ajuste ao kernel foi necessário. O
read model operacional é validável por `validateGenericModelReadModel` (mantém `table`/`form` para
compatibilidade, além de `entries`/`summary`/`timeline`).

## supports / capabilities

`supports` cobre read/localWrite/operationalDraft/eventAppend/localPersistenceValidation/
diagnostics/fallback. `capabilities` vem do runtime contract genérico com as perigosas
(`backendWrite`/`workflow`/`connector`/`marketplacePublish`) em `false`.

## Limitations

- Headless — sem UI/rota/menu real.
- Modelo operacional intencionalmente mínimo (entries + timeline de eventos locais).
- Persistência memory-only (`persistenceReal:false`); eventos nunca enviados (`sent:false`).
- Não toca módulos reais (Empresas/cadcps/pesagem/combustível) nem ModeloBase1.

## Próximo passo recomendado

**Generic Model Multi-Type Hardening** ou **ModeloBase2 Operational Runtime Foundation** — **não**
backend write.
