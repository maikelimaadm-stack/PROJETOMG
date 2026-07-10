# GUARDED READ UI OVERLAY REPORT — EMPRESAS

## Objetivo

Integrar o Guarded Read UI Slice de Empresas em uma área dev-only/preview já existente (a Runtime v2 Dev Preview Route), de forma opt-in, reversível e sem tocar na tela real. **Overlay aqui NÃO significa sobrepor a tela real de produção** — significa uma seção/painel visual dev-only dentro do ambiente de preview runtime v2.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD` (documentado, fail-closed por padrão).
- Respeita também: `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI`, `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE`, `MAK_RUNTIME_V2_EMPRESAS_READONLY`, `MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE`, `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` (matriz de flags no model).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`, `guardedReadUi: null`.
- O container `EmpresasGuardedReadUiOverlay` renderiza um **fallback seguro** (nada da tela real).

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'guarded_read_ui_overlay'`.
- compõe o guarded read UI model (que compõe read-only candidate + dual-read compare).
- renderiza status do overlay + o guarded read UI slice (tabela + form + diagnostics + write-blocked).
- write guard permanece ativo.

## Overlay model

- `moduleId/moduleName`, `mode`, `enabled/skipped/noSideEffects/productionBlocked`
- `currentRuntime: legacy`, `targetRuntime: runtime-v2`
- `guardedReadUi` (o guarded read UI model completo)
- `parityStatus`, `totalDifferences`, `blockingCount`, `criticalCount`
- `writeBlocked: true`, `blockedOperations`, `writeGuard`
- `diagnostics`, `flags` (matriz), `rollback`, `nextAllowedStep`, `warnings`, `limitations`, `evidence`.

## Integração com dev preview

- Uma seção `<EmpresasGuardedReadUiOverlay env={env} />` foi adicionada a `RuntimeV2DevPreviewRoutePage.jsx`, abrível pela rota dev já existente `/__dev/runtime-v2/previews`.
- É **opt-in**: o overlay decide sozinho por env/model e renderiza um fallback próprio quando a flag está off — não força render e não quebra a rota/hub.
- Não altera `src/App.jsx`, não altera o menu, não cria rota pública nova, não renderiza em produção sem override.

## Tabela / formulário read-only

- Herdados do guarded read UI slice: tabela read-only (controlled dataset, mock, mascarado) + formulário `readOnly`/`disabled`, sem submit/save.

## Diagnostics

- flag status, guardedReadUiStatus, parityStatus, totalDifferences, blockingCount, criticalCount, readinessStatus, rollbackStatus, writeGuardStatus, limitations, warnings.

## Write blocked panel

- Herdado do guarded read UI slice + status de write bloqueado no overlay status. Ver `WRITE-BLOCKED-OVERLAY-REPORT.md`.

## Limitations

- dev-only overlay — painel de preview dentro do runtime v2 dev preview, nunca a tela real
- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- nunca substitui a tela real; nunca vira fonte da verdade; nunca no menu
- reversível por flag off.

## Next allowed step

- **Empresas Read UI Parity Hardening** quando `parity`/`acceptable_drift`.
- **Empresas Guarded Read UI Drift Resolution** quando `blocked`.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
