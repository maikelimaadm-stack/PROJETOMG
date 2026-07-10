# GUARDED READ UI REPORT — EMPRESAS

## Objetivo

Entregar o primeiro UI slice read-only de Empresas controlado pelo runtime v2, de forma guardada, opt-in, reversível e fora da tela real de produção. A UI é uma visualização segura/read-only baseada no read-only candidate e no dual-read compare, dev-only.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_ALLOW_PROD` (documentado, fail-closed por padrão).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`, `viewModel: null`.
- O container `EmpresasGuardedReadUiSlice` renderiza um **fallback seguro** (nada da tela real).

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'guarded_read_ui_slice'`.
- compõe o read-only candidate (view model) + dual-read compare (parity/differences).
- renderiza tabela read-only + formulário read-only + diagnostics + painel de write bloqueado.
- write guard permanece ativo.

## UI model

- `moduleId/moduleName`, `mode`, `enabled/skipped/noSideEffects/productionBlocked`
- `currentRuntime: legacy`, `targetRuntime: runtime-v2`
- `readOnlyCandidate` (compacto), `dualReadCompare` (mode + parityStatus + summary)
- `parityStatus`, `viewModel`, `table`, `form`, `diagnostics`, `differences`
- `writeBlocked: true`, `blockedOperations`, `writeGuard`
- `rollback`, `nextAllowedStep`, `warnings`, `limitations`, `evidence`.

## Tabela read-only

- colunas + linhas do controlled dataset (mock, mascarado)
- sem edição inline, sem seleção com side effect, sem ação real
- estado vazio seguro quando sem linhas.

## Formulário read-only

- campos em modo leitura (`readOnly` + `disabled`)
- sem submit, sem save, sem update, sem delete.

## Diagnostics

- parityStatus, totalDifferences, blockingCount, criticalCount
- warnings, limitations, rollbackStatus, writeGuardStatus.

## Write blocked panel

- lista as operações bloqueadas + código de bloqueio (probe passivo do write guard)
- deixa claro que write é impossível neste slice.

## Limitations

- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- dev-only — nunca na tela real ou no menu
- nunca substitui a tela real; nunca vira fonte da verdade
- reversível por flag off.

## Next allowed step

- **Empresas Guarded Read UI Overlay** quando `parity`/`acceptable_drift`.
- **Empresas Guarded Read UI Drift Resolution** quando `blocked`.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
