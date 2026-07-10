# LOCAL WRITE PLAN REPORT

## Objetivo

Fundação de **escrita local controlada** (in-memory) para o ModeloBase1 beta. Este slice **não** habilita escrita em backend — cria o plano, o contrato, o controller local e a validação, preparando o próximo slice (Activation).

## Flags

- `MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN` (umbrella)
- `MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN`
- `MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN`
- `*_ALLOW_PROD` (escape hatch explícito)

Off por padrão. Flag off → beta read-only atual (controller = null). Fail-closed em produção salvo override. Reversível por flag off.

## Contract

`createModeloBase1LocalWriteContract({ moduleId, enabled })` — declarativo, puro, cópia segura. Contém `contractId`, `mode='controlled_local_write_plan'`, `allowedOperations`, `blockedOperations`, `mutationOperations`, `requiredInputs`, `producedOutputs`, `safety` (localOnly/backendTouched:false/prismaTouched:false/runtimeBridgeTouched:false/persistence:'none'), `fallback`, `rollback`, `diagnostics`, `nextAllowedStep`.

## Controller

`createModeloBase1LocalWriteController({ readState|runtimeReadModel, moduleId })` — in-memory. Semeia o draft a partir de uma **cópia segura** do read state; expõe `createRow`/`updateRow`/`deleteRow`/`saveDraft`/`submitDraft`/`inspectLocalDraft`/`diagnostics`/`getHistory`. **Nunca** muta o original, nunca persiste, nunca chama backend/Prisma/fetch/storage/runtimeBridge.

## Local mutations

`applyModeloBase1LocalWriteMutation` (pura, determinística): createRow (id local `local-<moduleId>-<seq>`), updateRow (merge de cells), deleteRow (soft `_localDeleted`), saveDraft (localOnly), submitDraft (`simulatedSubmit`, `sent:false`). Cada uma retorna resultado estruturado com `backendTouched/prismaTouched/runtimeBridgeTouched = false`.

## Fallback

Flag off → controller = null; o beta read-only continua. Nenhuma dependência do plano na leitura.

## Rollback

Por flag off (o controller deixa de existir) ou descarte do draft local (in-memory). Sem schema, sem persistência a desfazer.

## Limitations

- **Plan-only / local-only:** nenhuma persistência real; nada é enviado a backend/Prisma.
- **UI não wired:** a tela real não executa local write neste slice (componentes dev-only criados mas não montados).
- cadcps compartilha o mesmo controller base (só muda moduleId/config/readModel).

## Próximo passo recomendado

**ModeloBase1 Controlled Local Write Activation** — montar o controller na UI beta (dev-only, atrás de flag), permitir edição local do draft, ainda sem persistência real.
