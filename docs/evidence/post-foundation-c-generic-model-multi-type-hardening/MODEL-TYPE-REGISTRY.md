# Model Type Registry

`createGenericModelTypeRegistry()` — objeto puro/testável. Cada definição é validada por
`validateGenericModelTypeDefinition` antes de registrar (fail-closed).

## Tipos registrados

| modelType | family | localWrite | eventAppend | read-only | adapter real |
|---|---|---|---|---|---|
| **cadastro** | modeloBase1 | ✓ | — | — | ModeloBase1 |
| **operacional** | modeloBase2 | ✓ | ✓ | — | ModeloBase2 (prototype) |
| **movimentacao** | — | ✓ | ✓ | — | futuro |
| **financeiro** | — | ✓ | — | — | futuro (auditRequired) |
| **relatorio** | — | — | — | ✓ | futuro |
| **dashboard** | — | — | — | ✓ | futuro |
| **workflow** | — | — | — | ✓ (read) | futuro (workflowState) |
| **custom** | — | — | — | mínimo | futuro |

## Campos de cada definição

- `modelType`, `family`, `description`
- `requiredContracts`, `optionalContracts`
- `allowedCapabilities`, `dangerousCapabilities`
- `defaultSafety` (`localOnly:true`, `persistenceReal:false`, `sent:false`, `noSideEffects:true`)
- `expectedReadShape`, `expectedWriteShape`
- `persistencePolicy` (`none`/`local_validation`/`local`)
- `sideEffectPolicy` (`none`/`local-only`)
- `futureAdapters`

## requiredContracts (por tipo)

- **cadastro**: `runtimeContract`, `readContract`, `writeContract`
- **operacional**: `runtimeContract`, `readContract`, `writeContract`, `eventContract`
- **movimentacao/financeiro**: `runtimeContract`, `readContract`, `writeContract`
- **relatorio/dashboard/workflow**: `runtimeContract`, `readContract`
- **custom**: `runtimeContract`

## optionalContracts

`persistenceContract`, `eventContract` (movimentacao), `diagnostics`, `fallback`, `writeContract`
(workflow/custom), conforme o tipo.

## Expected shapes

- **cadastro**: read requires `table`+`form`; write `crud-local`.
- **operacional**: read requires `entries`+`timeline` (com `table`/`form` de compatibilidade);
  write `event-append`.
- **relatorio/dashboard**: read-only (`report`/`widgets`); write `none`.

## Future adapters

- operacional → **ModeloBase2 Operational Runtime Foundation**
- movimentacao → ModeloBase3 (movimentacao) — futuro
- financeiro/relatorio/dashboard/workflow/custom → definições prontas, sem adapter ainda.
