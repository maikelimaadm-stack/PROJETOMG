# READ SLOT CANDIDATE REPORT — EMPRESAS RUNTIME BRIDGE READ SLOT

## Objetivo

Criar um candidato de slot read-only para Empresas, baseado no dry run anterior. O slot candidate é um **ponto controlado de encaixe futuro** entre o runtime v2 read UI e o bridge/ambiente legado — mas ainda **NÃO** ativado na tela real. Read Slot Candidate significa: contrato de slot realista, payload read-only validado, mount plan seguro, fallback para legado, rollback por flag, diagnostics, bloqueio total de write, zero side effects, zero alteração no runtimeBridge real, zero alteração na tela real.

## Feature flag

- **Flag:** `MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE`
- **Default:** desligada.
- **Override de produção explícito:** `MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE_ALLOW_PROD` (documentado, fail-closed).
- Respeita também: bridge dry run, hardening, overlay, guarded read UI, dual-read, read-only, dev preview route/hub (matriz de flags no model).

## Comportamento enabled / off

### Flag OFF (default)
- `enabled: false`, `skipped: true`, `noSideEffects: true`, `readSlotContract: null`, `readSlotPayload: null`, `mountPlan: null`, `slotReady: false`.
- Componente renderiza fallback seguro.

### Produção sem override
- `enabled: false`, `productionBlocked: true` (fail-closed).

### Flag ON (dev + flag)
- `enabled: true`, `mode: 'runtime_bridge_read_slot_candidate'`, `slotMode: 'read_only_candidate'`.
- compõe o bridge dry run (→ toda a cadeia read-only).
- constrói contrato + payload + validação + mount plan + diagnostics.
- write guard permanece ativo.

## Read slot model

Refs compactas (dryRun, hardening, overlay, guardedReadUi, readOnlyCandidate) + `readSlotContract`, `readSlotPayload`, `payloadValidation`, `mountPlan`, `readinessStatus`, `slotReady`, `safeToProceed`, `blockers`, `warnings`, `writeBlocked`, `blockedOperations`, `writeGuard`, `diagnostics`, `flags`, `rollback`, `nextAllowedStep`, `limitations`, `evidence`.

## Read slot contract

Contrato read-only do slot — 6 allowed (só leitura), 16 blocked (write/legacy/bridge/backend/storage/ui-replacement), requiredInputs, producedOutputs, slotConsumers (devPreviewRoute, guardedReadUiOverlay, futureRuntimeBridgeReadSlot), fallback/rollback/safety. Ver `READ-SLOT-CONTRACT.md`.

## Read slot payload

Payload serializável construído do view model read-only: table/form, diagnostics, writeGuard SUMMARY (sem função), parity, flags, safety, rollback. Sem função, sem React element, sem handler, sem write action executável; dados sensíveis mascarados; determinístico (timestamp source estável).

## Payload validation

`valid`/`errors`/`warnings`/`blockers`/`score`/`safeToProceed`. Valida moduleId/mode/slotId/table/form/diagnostics/writeGuard/writeBlocked/blockedOperations/safety, e faz um scan profundo que **bloqueia** funções, React elements (`$$typeof`), chaves de prototype pollution e valores sensíveis expostos. Resultado atual: valid, score 100, safeToProceed.

## Mount plan

`wouldMount`/`safeToProceed` derivados de preconditions (dry run enabled+bridgeReady+ready+mountSafe+noBlockers, contract read-only, payload valid). `mountTarget: dev_preview_only`, `futureMountTarget: runtime_bridge_read_slot`. Monta **nada** de verdade: `mountedAnythingReal:false`, `touchedAppJsx:false`, `touchedRealScreen:false`, `touchedRuntimeBridge:false`.

## Diagnostics

flag/bridge-dry-run/hardening/overlay/guarded-UI/read-only status, contract status, payload validation status, mount plan status, write guard status, rollback status, blockers, warnings, limitations, noSideEffects.

## Blockers / warnings

- **blockers:** nenhum (preconditions e payload OK).
- **warnings:** herda o warning não-bloqueante do dry run/hardening (row shape).

## Integração com dev preview

Os helpers puros são exportáveis; o painel `EmpresasRuntimeBridgeReadSlotPanel.jsx` é dev-only e pode ser renderizado dentro do overlay/rota dev (`/__dev/runtime-v2/previews`). Neste slice nenhuma alteração de rota foi necessária — os componentes ficam exportáveis e a integração é opt-in (documentada), sem tocar App.jsx/menu/runtimeBridge.

## Limitations

- candidate only — um slot read-only futuro controlado, nunca montado na tela real
- read-only — nunca salva/edita/exclui
- mock/controlled data only — sem dados reais como fonte principal, sem backend, sem Prisma/MMM
- nunca altera o runtimeBridge/makBootstrap real
- nunca substitui a tela real; nunca vira fonte da verdade; nunca no menu
- reversível por flag off.

## Next allowed step

- **Empresas Runtime Bridge Read Slot Dev Activation** quando `slotReady = true`, `safeToProceed = true`, `payloadValidation.valid = true`, `readinessStatus = ready_for_next_slice`.
- **Empresas Runtime Bridge Read Slot Candidate Fixes** quando houver critical/blocking failures.

## O que está fora de escopo

- salvar/editar/excluir dados reais
- substituir a tela real inteira
- montar o slot real / ativar bridge real
- remover o runtime legado
- alterar backend/Prisma
- full cutover
- Studio/Marketplace
- Foundation D/E.
