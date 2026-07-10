# FALLBACK VALIDATION — ModeloBase1 Runtime Wiring

O wiring é **safe-by-fallback**: em qualquer cenário anômalo, o engine mantém a tela legada renderizando e o write real permanece bloqueado no modo beta. Nenhum caminho quebra a tela.

## Cenários

| # | Cenário | `fallbackReason` | betaApplied | writeBlocked | Tela |
|---|---|---|---|---|---|
| 1 | `runtimeReadModel` ausente | `runtime-read-model-absent` | false | false | legada |
| 2 | presente mas `disabled` | `runtime-read-model-disabled` | false | false | legada |
| 3 | inválido (contrato) | `invalid-read-model:<code>` | false | false (legada) | legada |
| 4 | erro interno no `resolve()` | `resolve-failed` | false | false (legada) | legada |
| 5 | payload inseguro (função/React/pollution/sensível) | `unsafe-payload:<code>` | false | false (legada) | legada |
| 6 | write guard ausente / não bloqueia | `invalid-read-model:MAK-MB1-RW-006` | false | false (legada) | legada |
| 7 | erro no hook (apply-error) | `apply-error` | false | false | legada |

> Nos cenários 3–6 (flag ligada mas model problemático), o engine **não aplica beta** e retorna à config legada — a tela continua funcional com write real normal (o problema está no model, não no usuário). O write só é bloqueado quando o beta é **efetivamente aplicado** (cenário feliz).

## Garantia de não-write

- Quando beta **aplicado**: `writeBlocked: true` + write guard do model bloqueia 11 operações + o engine gateia `handleNew`/`handleDuplicate`/`handleRequestDelete`/`guardedHandleSubmit`.
- Quando **fallback**: comportamento legado (write real normal) — nenhuma regressão.

## Garantia de não-backend / não-Prisma / não-runtimeBridge

- O módulo `src/ModeloBase1/runtime-read-model/*` **não importa** `src/runtime/*`, `src/apis/*`, Prisma, `makBootstrap`, `runtimeBridge` (verificado por teste + gate).
- Os helpers de segurança (`safety.js`) são locais e puros — o ModeloBase1 permanece desacoplado do runtime.
- O read model resolvido não pode carregar referências a backend/fetch/Prisma/storage (rejeitado por `hasForbiddenReference` → fallback).

## Verificação automatizada

- Testes 1–4, 14, 18–21 cobrem os cenários de fallback e segurança de payload.
- Gate check 3 (apply) exercita absent/disabled/invalid/unsafe → fallback e on → beta+write-blocked.
- Flag off (estado de CI) → `test:runtime` 1155/1155 confirma comportamento idêntico ao pré-slice.
