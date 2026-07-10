# EMPRESAS BETA UI REPORT

## Flag

`MAK_MODELOBASE1_EMPRESAS_BETA` (umbrella `MAK_MODELOBASE1_DIRECT_BETA`) — off por padrão; fail-closed em produção.

## Comportamento OFF

- `/CadastroEmpresas` mantém o comportamento atual, byte-idêntico.
- Hardening model → `fallback` (0 falhas bloqueantes), `betaApplied=false`, `writeBlocked=false`.
- Painel de diagnostics **não** renderiza (beta off).
- Write real normal.

## Comportamento ON

- `/CadastroEmpresas` consome `config.runtimeReadModel` (read-only) e o hardening model reporta `hardened`.
- Banner beta + badge read-only exibidos.
- Painel de diagnostics **dev-only** (só com `MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS=true` em dev).

## table/form

- **table:** colunas do descritor Empresas + linhas do controlled dataset (mock, mascarado); `emptyStateSafe` = pass; `sensitiveMasked` = pass.
- **form:** fields do runtime v2; `readOnly`/`noSubmit`/`noSave` = pass (write bloqueado).

## Diagnostics

`hardened` — 24 pass / 2 warn / 0 fail / 5 skip. Os 2 warns são não-bloqueantes (drift conhecido de vocabulário de colunas header×dataset). Sem dados sensíveis expostos.

## Fallback

Model inválido / resolve falha / payload inseguro → `fallback`; tela legada de Empresas.

## Write guard

Ativo — `createEmpresasReadOnlyWriteGuard` bloqueia create/update/delete/save/submit/bulk*/executeAction/startWorkflow/invokeConnector.

## Limitações

- Rota, App.jsx, backend, Prisma **não** alterados.
- Grid live não substituído (próxima fase).
