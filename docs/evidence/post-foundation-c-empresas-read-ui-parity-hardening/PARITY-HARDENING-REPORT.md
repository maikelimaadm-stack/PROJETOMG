# PARITY HARDENING REPORT — EMPRESAS READ UI

## Objetivo

Endurecer a paridade do read UI runtime v2 de Empresas antes de avançar para qualquer aproximação com a tela real. O objetivo **não** é criar uma nova tela operacional — é criar uma camada de hardening, checklist, diagnostics e evidência automatizada garantindo que o read UI overlay está consistente, seguro, determinístico e pronto para o próximo estágio.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING_ALLOW_PROD` (documentado, fail-closed).
- Respeita também: overlay, guarded read UI, dual-read, read-only, dev preview route/hub (matriz de flags no model).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`, `readinessStatus: skipped`.
- Checklist com todos os itens `skipped`; componente renderiza fallback seguro.

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'read_ui_parity_hardening'`.
- compõe o overlay model (→ guarded read UI → dual-read + read-only).
- constrói checklist (6 categorias), score/readiness, diagnostics, blockers/warnings.
- write guard permanece ativo.

## Hardening model

- `moduleId/moduleName`, `mode`, `enabled/skipped/noSideEffects/productionBlocked`
- `currentRuntime: legacy`, `targetRuntime: runtime-v2`
- refs compactas: `overlay`, `guardedReadUi`, `readOnlyCandidate`, `dualReadCompare`
- `parityChecklist`, `parityScore`, `readinessStatus`, `blockers`, `warnings`
- `writeBlocked: true`, `blockedOperations`, `writeGuard`
- `diagnostics`, `flags`, `rollback`, `nextAllowedStep`, `limitations`, `evidence`.

## Checklist

6 categorias — **estrutura**, **tabela**, **formulário**, **diagnostics**, **segurança**, **integração dev** — 43 itens. Cada item: `id`, `category`, `label`, `status` (pass/warn/fail/skipped), `severity` (info/low/medium/high/critical), `evidence`, `remediation`, `blocking`. Ver `PARITY-CHECKLIST.md`.

## Score

`totalItems`, `passCount`, `warnCount`, `failCount`, `skippedCount`, `blockingCount`, `criticalCount`, `scorePercent`, `readinessStatus`.

Regras: critical fail → `blocked`; blocking item → `blocked`; fail não-crítico → `needs_hardening`; só warnings/tudo pass → `ready_for_next_slice`; flag off → `skipped`.

**Resultado atual:** 42 pass, 1 warn, 0 fail (99%) → `ready_for_next_slice`.

## Diagnostics

flag/overlay/guarded-UI/dual-read/read-only status, parity score, readiness, blockers, warnings, limitations, rollback status, writeGuardStatus, writeBlocked, noSideEffects.

## Blockers / warnings

- **blockers:** nenhum (0 critical/blocking).
- **warnings:** 1 — `tabela/table.rowShape` (o header da tabela usa as colunas do descriptor enquanto as linhas controladas carregam o vocabulário de colunas do dataset; drift conhecido, não-bloqueante, a alinhar em slice futuro).

## Integração com dev preview

Os helpers puros são exportáveis; o painel `EmpresasReadUiParityHardeningPanel.jsx` é dev-only e pode ser renderizado dentro do overlay/rota dev (`/__dev/runtime-v2/previews`). Neste slice nenhuma alteração de rota foi necessária — os componentes ficam exportáveis e a integração é opt-in (documentada), sem tocar App.jsx/menu.

## Limitations

- dev-only hardening — checklist/score passivo dentro do runtime v2 dev preview, nunca a tela real
- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- nunca substitui a tela real; nunca vira fonte da verdade; nunca no menu
- reversível por flag off.

## Next allowed step

- **Empresas Read UI Runtime Bridge Dry Run** quando `readinessStatus = ready_for_next_slice`.
- **Empresas Read UI Parity Hardening Fixes** quando houver critical/blocking failures.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
