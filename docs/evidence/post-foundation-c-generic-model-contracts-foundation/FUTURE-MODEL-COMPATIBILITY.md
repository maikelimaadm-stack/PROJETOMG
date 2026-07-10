# FUTURE MODEL COMPATIBILITY

Quais partes da fundação já servem cada tipo, e quais adapters ainda serão necessários.

| Tipo | Já servido pela fundação | Adapter futuro necessário |
|---|---|---|
| **modeloBase1** (cadastro) | read/write-local/persistence/safety/fallback/diagnostics/versioning | ModeloBase1 Adapter (mapReadModelToUi / mapUiEventToMutation) |
| **modeloBase2** (operacional) | write contract + payload validation + adapter + snapshot | modeloBase2Adapter + contrato append/evento (lançamentos) |
| **modeloBase3** (movimentação) | read/write/persistence/checksum | modeloBase3Adapter + contrato de transação/saldo |
| **modeloBase4** (financeiro) | validation/masking/versioning/checksum | modeloBase4Adapter + contrato auditoria/imutabilidade |
| **modeloBase5** (relatório/dashboard) | read contract + diagnostics (read-only puro) | modeloBase5Adapter (mapReadModelToUi de visualização); sem write/persistence |
| **modeloBase6** (workflow) | write-local + safety policy (side-effects blocked) | modeloBase6Adapter + contrato workflow/estado; execução real gated |
| **módulos nativos** | tudo (herdam safety/fallback/diagnostics) | adapter do modelo-base correspondente |
| **Studio** | contratos declarativos + capability gates + safety policy | Studio publica templates → runtime contract |
| **Marketplace** | versioning/schemaVersion + capability gates + template/published contracts (documentados) | validação de instalação + permission/persistence policy |

## Já genérico (usável hoje)
Safety, fallback, rollback plan, diagnostics, versioning, checksum, in-memory adapter, snapshot + validação, read/write contracts + validação, runtime contract, safety policy — todos puros, testados, sem acoplamento a ModeloBase1.

## Ainda pendente (adapters/contratos futuros)
- adapters por modelo (map read/UI/mutation/draft/snapshot);
- contratos de extensão: append/evento, transação/saldo, auditoria/imutabilidade, workflow/estado;
- persistência real (gated); Studio/Marketplace publish contracts.
