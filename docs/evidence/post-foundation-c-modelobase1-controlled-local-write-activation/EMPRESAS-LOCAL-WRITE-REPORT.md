# EMPRESAS LOCAL WRITE REPORT

## Flags

`MAK_MODELOBASE1_EMPRESAS_BETA` + `MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN` + `MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION` (ou umbrellas correspondentes). Off por padrão; fail-closed em produção.

## Comportamento OFF

- `/CadastroEmpresas` mantém o comportamento atual / beta read-only.
- `activationApplied=false`, `readOnlyFallback=true`. Toolbar/painel não renderizam.
- Write real continua bloqueado (nenhuma escrita).

## Comportamento ON

- `/CadastroEmpresas` (modo beta) exibe a toolbar de local write + badge "local beta / não persistido".
- create/update/delete/save/submit **locais** operam sobre o draft in-memory.
- saveDraft → `localOnly:true`. submitDraft → `simulatedSubmit:true`, `sent:false`.
- `backendTouched:false`, `prismaTouched:false`, `runtimeBridgeTouched:false`, `persistence:'none'`.
- reset restaura o read model original.

## create/update/delete/save/submit local

Via `useModeloBase1ControlledLocalWrite().operations`, ligados à toolbar. Todas as operações passam pela validação de payload (fail-closed) e pelo controller local — nunca backend/Prisma.

## Fallback

Activation/plan/beta off → read-only. Payload/op inválido → não altera o draft.

## Limitações

- O submit do FormPanel de produção não é rerroteado para write local (limite documentado); as operações locais são pela toolbar/controller.
- Sem persistência (draft in-memory).
- Rota, App.jsx, backend, Prisma não alterados.
