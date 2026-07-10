# WRITE BLOCKED OVERLAY REPORT — EMPRESAS GUARDED READ UI OVERLAY

A regra central: **write no runtime v2 para Empresas é impossível neste slice**, tanto no overlay quanto no guarded read UI que ele embute.

---

## Operações bloqueadas (visualmente e logicamente)

`create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `save`, `submit`, `executeAction`, `startWorkflow`, `invokeConnector`.

## Bloqueio visual

- O overlay e seus componentes **não têm** botão funcional de salvar/editar/excluir.
- Nenhum `onClick`/`onSubmit`/`onChange` com side effect (verificado por teste e gate).
- O `EmpresasGuardedReadUiOverlayStatus` mostra `writeBlocked: true`.
- O painel embute o guarded read UI slice, que já renderiza o `EmpresasGuardedReadWriteBlockedPanel` (lista de operações + códigos) e um formulário `readOnly`/`disabled`.

## Bloqueio lógico

- O overlay model reusa o **write guard** vivo do guarded read UI model; `writeGuard.attempt(op)` sempre retorna `{ ok: false, blocked: true, code }` — nunca executa.
- Com o overlay ligado, o write guard é composto com o env de leitura completo (report `active`), e uma tentativa de write retorna `MAK-L3-EMP-READONLY-003`.

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

(Erros estruturais do overlay: `MAK-L3-EMP-OVERLAY-001..005`.)

## Evidências de teste

- Overlay inclui writeBlocked (teste 14) e blockedOperations (teste 15).
- Component não possui save/submit funcional (teste 22).
- Component não possui create/update/delete funcional (teste 23).
- Component não possui action/workflow/connector funcional (teste 24).
- Gate dinâmico valida `writeBlocked === true` e que todas as operações retornam `blocked: true` com o guard ativo.
- Gate valida componentes sem `onClick/onSubmit/onChange` com write.

## Por que write real é impossível neste slice

1. **Sem caminho de escrita:** o write guard sempre retorna bloqueio; não há branch que execute.
2. **Componentes sem handlers de efeito:** nenhum onClick/onSubmit/onChange com write; form apenas `readOnly`/`disabled`.
3. **Sem backend/fetch/Prisma:** nenhum arquivo do overlay importa backend/Prisma nem chama `fetch`.
4. **Fail-closed:** flag off e produção sem override → skipped/blocked antes de qualquer render.
5. **Dados mascarados/mock:** rows vêm do controlled dataset; nenhum dado real como fonte principal.
