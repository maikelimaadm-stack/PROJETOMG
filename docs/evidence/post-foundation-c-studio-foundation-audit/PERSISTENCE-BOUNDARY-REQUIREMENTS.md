# Persistence Boundary Requirements

Política de persistência para módulos futuros. Estados (do mais seguro ao mais arriscado):

| Estado | Permitido | Proibido | Gates/Rollback |
|---|---|---|---|
| noPersistence | nada persiste | qualquer escrita | — |
| memoryOnly | draft em memória | I/O real | teste unitário |
| localReadOnly | leitura sintética local | mutation/rede | gate de no-network (existe) |
| localWriteDraft | CRUD sintético local com testRunId | dados reais | cleanup por ID |
| stagingReadOnly | leitura em staging isolado | mutation | environment gate |
| stagingWriteControlled | CRUD sintético em staging | produção | flag + rollback |
| productionRead | leitura de produção controlada | write | aprovação explícita |
| productionWriteControlled | write com política própria | sem aprovação | aprovação + gate dedicado |

## Regras

- **nenhum blueprint cria Prisma/schema automaticamente**;
- **nenhum blueprint cria migration automaticamente**;
- produção exige plano explícito;
- **dados reais nunca são fixture**;
- mutation exige testRunId + tenant/usuário sintéticos em ambiente de teste;
- production write exige aprovação separada e política própria.
