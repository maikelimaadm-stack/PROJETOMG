# Read-Only Repository Contract

`createEmpresasReadOnlyRepository({ dataset })`.

## Operações de leitura permitidas

- `list(query, context)` → `{ ok, items, total, page, pageSize, totalPages, hasNext, nextCursor, ... }`
- `getById(id, context)` → `{ ok, item|null }`
- `count(query, context)` → `{ ok, total }`
- `inspectContract()` → declara operações e invariantes

## Operações de escrita

Existem **apenas para recusar explicitamente** (nenhuma executa nada):
`create`, `update`, `delete`, `upsert`, `save`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `sync` →
lançam `EmpresasLocalReadError` (`MAK-EMP-LOCAL-READ-001`) via `blockEmpresasReadPilotMutation`,
com `mutationExecuted:false`, `datasetChanged:false`, `productionAccessed:false`.

## Garantias

- sempre aplica **tenant scope** (`cliente_id`);
- sempre valida `empresaHeader`/`erpEmpresaId` quando exigido;
- **fail-closed** em contexto inválido;
- retorna **cópias seguras** (`safeCloneGenericModel`);
- **nunca** muta o dataset;
- **nunca** chama API / Prisma / fetch.
