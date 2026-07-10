# BRIDGE DRY RUN REPORT — EMPRESAS READ UI RUNTIME BRIDGE

## Objetivo

Criar um dry run da ponte entre o Read UI runtime v2 de Empresas e o ambiente de bridge legado, sem tocar no bridge real de produção. Dry run significa: simular contrato, validar payloads, validar montagem teórica, validar fallback, validar rollback, validar bloqueio de write, gerar diagnostics — **sem executar efeito real e sem montar o runtime v2 na tela real de Empresas**.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN_ALLOW_PROD` (documentado, fail-closed).
- Respeita também: hardening, overlay, guarded read UI, dual-read, read-only, dev preview route/hub (matriz de flags no model).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`, `bridgeContract: null`, `mountSimulation: null`, `bridgeReady: false`.
- Componente renderiza fallback seguro.

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'read_ui_runtime_bridge_dry_run'`, `bridgeMode: 'dry_run'`.
- compõe o hardening model (→ overlay → guarded read UI → dual-read + read-only).
- constrói o bridge read contract + a mount simulation + diagnostics.
- write guard permanece ativo.

## Dry run model

- `moduleId/moduleName`, `mode`, `bridgeMode`, `enabled/skipped/noSideEffects/productionBlocked`
- `currentRuntime: legacy`, `targetRuntime: runtime-v2`
- refs compactas: `hardening`, `overlay`, `guardedReadUi`, `readOnlyCandidate`, `dualReadCompare`
- `bridgeContract`, `mountSimulation`, `readinessStatus`, `bridgeReady`, `blockers`, `warnings`
- `writeBlocked: true`, `blockedOperations`, `writeGuard`
- `diagnostics`, `flags`, `rollback`, `nextAllowedStep`, `limitations`, `evidence`.

## Bridge contract

Contrato read-only da futura ponte (não executa nada). allowed (5, só leitura), blocked (14, write/legacy/backend/storage), requiredInputs, producedOutputs, fallback, rollback, safety, diagnostics. Ver `BRIDGE-CONTRACT.md`.

## Mount simulation

`wouldMount`/`safeToProceed` derivados de preconditions (hardening enabled+ready, sem blockers, sem critical/blocking, writeBlocked, contract read-only, rollback available). `mountTarget: dev_preview_only`, `futureMountTarget: future_guarded_slot`. Monta **nada** de verdade: `mountedAnythingReal:false`, `touchedAppJsx:false`, `touchedRealScreen:false`, `touchedRuntimeBridge:false`.

## Diagnostics

flag/hardening/overlay/guarded-UI/dual-read/read-only status, bridge contract status, mount simulation status, write guard status, rollback status, blockers, warnings, limitations, noSideEffects.

## Blockers / warnings

- **blockers:** nenhum (preconditions satisfeitas).
- **warnings:** herda o warning não-bloqueante do hardening (row shape de vocabulário de colunas).

## Integração com dev preview

Os helpers puros são exportáveis; o painel `EmpresasRuntimeBridgeDryRunPanel.jsx` é dev-only e pode ser renderizado dentro do overlay/rota dev (`/__dev/runtime-v2/previews`). Neste slice nenhuma alteração de rota foi necessária — os componentes ficam exportáveis e a integração é opt-in (documentada), sem tocar App.jsx/menu/runtimeBridge.

## Limitations

- dry run only — simula uma futura ponte read-only, não monta nada de verdade
- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- nunca altera o runtimeBridge/makBootstrap real
- nunca substitui a tela real; nunca vira fonte da verdade; nunca no menu
- reversível por flag off.

## Next allowed step

- **Empresas Runtime Bridge Read Slot Candidate** quando `bridgeReady = true` e `safeToProceed = true` e `readinessStatus = ready_for_next_slice`.
- **Empresas Runtime Bridge Dry Run Fixes** quando houver critical/blocking failures.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- montar slot real / ativar bridge real
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
