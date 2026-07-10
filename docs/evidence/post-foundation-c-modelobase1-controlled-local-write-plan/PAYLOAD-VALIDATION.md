# PAYLOAD VALIDATION

`validateModeloBase1LocalWritePayload({ moduleId, operation, payload })` — fail-closed. Retorna `{ valid, errors, warnings, blockers, score, safeToApply }`.

## Payload válido

`{ moduleId:'empresas', operation:'createRow', payload:{ cells:{ razao_social:'OK' } } }` → `valid=true`, `safeToApply=true`.

## Casos bloqueados (fail-closed)

| Caso | Payload | Resultado |
|---|---|---|
| função/handler | `{ fn: () => {} }` / `{ onClick: () => {} }` | `valid=false` (function/handler) |
| React element | `{ el: { $$typeof: Symbol.for('react.element') } }` | `valid=false` |
| prototype pollution | `{"__proto__":{"x":1}}` | `valid=false` |
| dados sensíveis não mascarados | `{ password:'secret123' }` | `valid=false` |
| backend target | `{ target:'backend' }` | `valid=false` |
| Prisma target | `{ target:'prisma' }` | `valid=false` |
| runtimeBridge target | `{ target:'runtimeBridge' }` | `valid=false` |
| sink por chave | `{ backendUrl:'/api/x' }` | `valid=false` (key targets a non-local sink) |
| writeMode não-local | `{ writeMode:'backend' }` | `valid=false` |
| operação desconhecida | `operation:'frobnicate'` | `valid=false` (not an allowed local mutation) |

## Regras

- `moduleId` obrigatório (string).
- `operation` ∈ { createRow, updateRow, deleteRow, saveDraft, submitDraft } (fail-closed caso contrário).
- `createRow`/`updateRow` exigem payload objeto plano; payload presente deve ser objeto plano.
- Deep-scan: função/handler/React element/prototype pollution/profundidade > 8 → bloqueado.
- Sensível não mascarado → bloqueado.
- Referência a backend/fetch/Prisma/storage (valor string) → bloqueado.
- `target`/chaves começando com backend|prisma|runtimeBridge|fetch|api|storage|persist → bloqueado.
- `writeMode` ≠ `localOnly` → bloqueado.

## Evidência

Testes 18–26 do slice + gate check 5. Operações inválidas nunca chegam ao `applyModeloBase1LocalWriteMutation` (o controller barra em `validateModeloBase1LocalWritePayload` antes de aplicar).
