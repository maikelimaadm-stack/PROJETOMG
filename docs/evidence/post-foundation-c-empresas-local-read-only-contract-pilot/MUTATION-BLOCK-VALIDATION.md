# Mutation Block Validation

`blockEmpresasReadPilotMutation({ operation, throwOnBlock })`.

## Tokens bloqueados

`create`, `update`, `delete`, `upsert`, `save`, `patch`, `post`, `put`, `remove`, `bulkCreate`,
`bulkUpdate`, `bulkDelete`, `prisma`, `migration`, `seed`, `sync` (match case-insensitive por substring).

## Resultado

`{ blocked, operation, reason, code: MAK-EMP-LOCAL-READ-001, mutationExecuted: false,
productionAccessed: false, datasetChanged: false }`. Com `throwOnBlock`, lança erro tipado.

## Defesa em profundidade

- repository e API adapter **não expõem** métodos de escrita funcionais — os que existem apenas
  recusam via este blocker;
- nenhum caminho do piloto executa escrita, chama backend/Prisma/fetch ou toca produção;
- verificado por testes (57–61) e pelo gate (mutation blocker + write methods throw).
