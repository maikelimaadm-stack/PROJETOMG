# LOCAL WRITE ACTIVATION REPORT

## Objetivo

Conectar o controller local write à UI beta do ModeloBase1 — ativar create/update/delete/save/submit **local-only** (in-memory), atrás de flags, reversível, sem persistência real.

## Flags

- `MAK_MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION` (umbrella)
- `MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION`
- `MAK_MODELOBASE1_CADCPS_LOCAL_WRITE_ACTIVATION`

Activation **só liga** quando: beta read model aplicado **E** local write plan ligado **E** activation flag on. Off por padrão; fail-closed em produção salvo `*_ALLOW_PROD`. Reversível por flag off.

## Hook / controller

- **Session headless** (`createModeloBase1LocalWriteSession`, React-free): resolve activation, cria o controller local (só quando ativo), executa mutações no draft, rastreia operationCount/lastOperation, e faz `resetDraft`.
- **Hook React** (`useModeloBase1ControlledLocalWrite`): envolve a session com `useState`/`useMemo`, re-renderiza após cada operação, expõe `operations`, `rows`, `form`, `localDraft`, `diagnostics`, `reset`, `activationApplied`, `readOnlyFallback`.

## Operações UI/local

| Operação | Efeito | Garantia |
|---|---|---|
| createRow | adiciona row local (`local-<mod>-<seq>`) | localOnly |
| updateRow | merge de cells na row local | localOnly |
| deleteRow | soft delete (`_localDeleted`, some da lista) | localOnly |
| saveDraft | `savedLocally:true` | localOnly, sem persistência |
| submitDraft | `simulatedSubmit:true`, `sent:false` | **não envia nada** |
| resetDraft | recria o controller do read state original | restaura o original |

## Local draft

Mantido em memória pela session/controller (cópia segura do read state). `rows`/`form` refletem o draft quando ativo; caem para o read state (read-only) quando inativo. Perdido ao recarregar (sem persistência — por design nesta fase).

## Diagnostics

`createModeloBase1LocalWriteActivationDiagnostics` — `activationApplied`, `localOnly`, `backendTouched:false`, `prismaTouched:false`, `runtimeBridgeTouched:false`, `persistence:'none'`, `operationCount`, `hasLocalChanges`, `lastOperation`, `nextAllowedStep`.

## UI beta

No modo activation (dev-gated): toolbar (＋ linha local · 💾 salvar rascunho · 📤 submeter simulado · ↺ reset · contagem de linhas locais), badge "local beta / não persistido", painel de diagnostics dev-only. Sem CSS global, sem side effect real, fail-closed em produção.

## Fallback

Activation off / plan off / beta off / controller indisponível / payload inválido / operação desconhecida → read-only mantido, sem backend/Prisma/persistência, diagnostics registram o `reason`.

## Limitations

- **UI de execução via toolbar/controller.** O caminho de submit do FormPanel de produção **não** foi rerroteado para o write local (para evitar regressão na tela real) — as operações locais acontecem pela toolbar/controller. Documentado como limite.
- **Sem persistência:** o draft vive em memória; recarregar descarta.
- cadcps usa o mesmo hook/session/controller base (só muda moduleId/readModel).

## Próximo passo recomendado

**ModeloBase1 Local Persistence Validation** — validar persistência controlada (ainda beta, comparativa) antes de qualquer write real.
