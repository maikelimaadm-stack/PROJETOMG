# WRITE BLOCKED VALIDATION — Beta UI Hardening

No modo beta (read-only), **nenhuma escrita real** é executada. Este slice **não** introduz write local.

## Camadas de bloqueio

1. **Write guard do read model** (Direct Beta): `writeGuard.attempt(op)` retorna `{ ok:false, blocked:true }` para toda operação.
2. **Engine (ModeloBase1CadastroPage):** `blockRuntimeReadWrite(op)` gateia os handlers **antes** de qualquer chamada real.
3. **Checklist de hardening:** `security.writeBlocked`, `form.readOnly`, `form.noSubmit`, `form.noSave` = `pass` (blocking) — se algum vazasse, o hardening viraria `needs_fixes`.

## Operações cobertas

| Operação | Bloqueio | Evidência |
|---|---|---|
| save | engine (`guardedHandleSubmit`) + write guard | teste 13; checklist `form.noSave` pass |
| submit | engine (`guardedHandleSubmit`) + write guard | teste 13; checklist `form.noSubmit` pass |
| create | engine (`handleNew`/`handleDuplicate`) + write guard | teste 14; write guard `create` blocked |
| update | write guard | teste 14; write guard `update` blocked |
| delete | engine (`handleRequestDelete`) + write guard | teste 14; write guard `delete` blocked |
| bulkCreate/Update/Delete | write guard | write guard blocked |
| executeAction | write guard | teste 15 |
| startWorkflow | write guard | teste 15 |
| invokeConnector | write guard | teste 15 |

## Evidência de bloqueio

- Testes 12–15 do slice + gate check 2 (hardened + write blocked).
- `security.writeBlocked` é **blocking**: se `writeBlocked !== true` em beta, o item vira `fail` bloqueante e o status vira `needs_fixes`.
- `diagnostics.protectedScopes.write = 'blocked'` (herdado do wiring).

## Limites

- Bloqueio vale para o **modo beta aplicado**. Com a flag off (fallback), o comportamento é o legado (write real normal) — nenhuma regressão.
- Write local/controlado é a **próxima fase** (ModeloBase1 Controlled Local Write), fora do escopo deste slice.
