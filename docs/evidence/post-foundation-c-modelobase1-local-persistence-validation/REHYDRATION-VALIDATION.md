# REHYDRATION VALIDATION

`rehydrateModeloBase1LocalDraft({ snapshot, moduleId })` valida antes de reidratar e nunca muta o snapshot.

## Casos

| Caso | Resultado |
|---|---|
| snapshot válido | `ok:true`, draft seguro `{ table:{columns,rows,rowCount}, form }` |
| snapshot inválido/ausente | `ok:false`, errors |
| moduleId errado | `ok:false` (moduleId mismatch, blocker) |
| checksum inválido (adulterado) | `ok:false` (checksum mismatch) |
| função/handler | `ok:false` (payload unsafe) |
| React element | `ok:false` (payload unsafe) |
| backend target (chave `backend*`) | `ok:false` (non-local sink) |
| Prisma target (chave `prisma*`) | `ok:false` |
| runtimeBridge target (chave `runtimeBridge*`) | `ok:false` |

## Garantias
- Snapshot original **nunca** mutado (draft = `safeClone`; teste 35–36).
- Nenhuma função executada, nenhum React element montado.
- Sem backend/Prisma/fetch/storage.
- Resultado estruturado (`ok`, `draft`, `rows`, `form`, `diagnostics`, `errors`, `warnings`) — nunca lança ao chamador para snapshot inválido.
