# Multi-Model Compatibility

## ModeloBase1 — cadastro

- `modelType: 'cadastro'`; table/form config-driven; CRUD local.
- Consome o generic kernel via `generic-model-adapter/` (PR #438) e é consumido por Empresas/cadcps
  por flag (PR #439). **Inalterado neste slice.**

## ModeloBase2 — operacional

- `modelType: 'operacional'`; entries + timeline de eventos locais; append/event log; draft
  operacional. Headless (sem UI).
- Consome o **mesmo** generic kernel — nenhum stack novo.

## Contratos compartilhados (mesmo kernel para os dois tipos)

| Primitivo genérico | ModeloBase1 | ModeloBase2 |
|---|---|---|
| `createGenericModelRuntimeContract` | ✓ | ✓ |
| `createGenericModelReadContract` / `validateGenericModelReadModel` | ✓ | ✓ |
| `createGenericModelWriteContract` / `validateGenericModelWritePayload` | ✓ | ✓ |
| `createGenericModelSnapshot` / `validateGenericModelSnapshot` | ✓ | ✓ |
| `createGenericModelVersion` / `createGenericModelChecksum` | ✓ | ✓ |
| `createGenericModelInMemoryAdapter` | ✓ | ✓ |
| `createGenericModelDiagnostics` / `createGenericModelFallback` / `RollbackPlan` | ✓ | ✓ |
| safety (`sanitize`/`detectUnsafeMarkers`) | ✓ | ✓ |

## Diferenças

- **Superfície**: MB1 = table/form; MB2 = entries + event timeline.
- **Escrita**: MB1 = CRUD local; MB2 = append de eventos locais.
- **Operações**: conjuntos distintos, ambos mapeados para as operações locais genéricas.

## O que isso prova

O Generic Model Runtime **serve mais de um tipo de modelo**: dois modelFamily
(`modeloBase1`/cadastro e `modeloBase2`/operacional) coexistem sobre o mesmo kernel puro, cada um
com seu adapter fino, **sem** o kernel conhecer nenhum dos dois. Dangerous capabilities `false` em
ambos; nenhuma persistência real; nenhum efeito colateral.

## Coexistência (provada)

- ModeloBase2 **não importa** ModeloBase1 nem Empresas/cadcps (import-scan no gate).
- `gate:g423-modelobase1-generic-adapter` e `gate:g423-empresas-cadcps-generic-kernel` continuam
  **PASS** com ModeloBase2 presente.

## Riscos restantes

- modelType operacional ainda simplificado (sem transações reais).
- event append não cobre transações/replicação futuras.
- risco de confundir prototype com módulo real, ou generalizar antes de validar com tela real.

## Próximos modelos sugeridos

- Multi-Type Hardening (endurecer o kernel para N tipos).
- ModeloBase2 Operational Runtime Foundation.
- Futuro: `movimentacao`, `financeiro` (já presentes em `GENERIC_MODEL_TYPES`).
