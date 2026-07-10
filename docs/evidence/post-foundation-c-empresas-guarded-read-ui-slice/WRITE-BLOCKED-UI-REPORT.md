# WRITE BLOCKED UI REPORT — EMPRESAS GUARDED READ UI SLICE

A regra central: **write no runtime v2 para Empresas é impossível neste slice**, tanto visualmente quanto logicamente.

---

## Operações bloqueadas (visualmente e logicamente)

`create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `save`, `submit`, `executeAction`, `startWorkflow`, `invokeConnector`.

## Bloqueio visual

- O container e os componentes **não têm** botão funcional de salvar/editar/excluir.
- Nenhum `onClick`/`onSubmit`/`onChange` com side effect (verificado por teste e gate).
- O formulário renderiza campos `readOnly` + `disabled`; não há `<form>` funcional nem `type="submit"`.
- O `EmpresasGuardedReadWriteBlockedPanel` lista explicitamente as operações bloqueadas e seus códigos.

## Bloqueio lógico

- O UI model carrega o **write guard** do read-only candidate; `writeGuard.attempt(op)` sempre retorna `{ ok: false, blocked: true, code }` — nunca executa.
- Códigos: `MAK-L3-EMP-READONLY-001..007` (001 flag off, 002 prod blocked, 003 write blocked, 004 invalid, 005 unsafe payload, 006 data source, 007 pollution).
- Com a flag do guarded UI ligada, o write guard é composto com o env do read-only (report `active`), e uma tentativa de write retorna `003`.

## Códigos de erro

| Código | Significado |
|---|---|
| MAK-L3-EMP-READONLY-001 | flag disabled |
| MAK-L3-EMP-READONLY-002 | production blocked |
| MAK-L3-EMP-READONLY-003 | write operation blocked |
| MAK-L3-EMP-READONLY-004 | invalid operation |
| MAK-L3-EMP-READONLY-005 | unsafe payload |
| MAK-L3-EMP-READONLY-006 | data source not allowed |
| MAK-L3-EMP-READONLY-007 | prototype pollution blocked |

## Evidências de teste

- Não há save/submit funcional (teste 22).
- Não há create/update/delete funcional (teste 23).
- Não há action/workflow/connector funcional (teste 24).
- Component renderiza write blocked panel (teste 21).
- Gate dinâmico valida `writeBlocked === true` e que todas as operações retornam `blocked: true`.
- Gate valida componentes sem `onClick/onSubmit/onChange` com write.

## Por que write real é impossível neste slice

1. **Sem caminho de escrita:** o write guard sempre retorna bloqueio; não existe branch que execute.
2. **Componentes sem handlers de efeito:** nenhum onClick/onSubmit/onChange com write; form apenas `readOnly`/`disabled`.
3. **Sem backend/fetch/Prisma:** nenhum arquivo do slice importa backend/Prisma nem chama `fetch`.
4. **Fail-closed:** flag off e produção sem override → skipped/blocked antes de qualquer render.
5. **Dados mascarados/mock:** rows vêm do controlled dataset; nenhum dado real como fonte principal.
