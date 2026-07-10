# CADCPS LOCAL WRITE REPORT

## Flags

`MAK_MODELOBASE1_CADCPS_BETA` + `MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_PLAN` + `MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_ACTIVATION` (ou umbrellas). Off por padrão; fail-closed em produção.

## Comportamento OFF

- `/CadastroCamposPersonalizados` mantém comportamento atual / beta read-only.
- `activationApplied=false`; toolbar/painel não renderizam.

## Comportamento ON

- `/CadastroCamposPersonalizados` usa o **mesmo hook/session/controller base** de Empresas.
- create/update/delete/save/submit locais sobre o read model cadcps.
- saveDraft `localOnly`; submitDraft `simulatedSubmit`/`sent:false`.
- backend/prisma/runtimeBridge Touched false; persistence none.

## create/update/delete/save/submit local

Idênticos a Empresas — sem arquitetura separada. Diferença apenas em `moduleId`/`readState`/flags.

## Fallback

Activation/plan/beta off → read-only. Payload/op inválido → não altera o draft.

## Limitações

- Mesmo limite de Empresas: submit do FormPanel de produção não rerroteado (limite documentado).
- Sem persistência.
- Rota, App.jsx, backend, Prisma, `framework/cadastro` não alterados.
