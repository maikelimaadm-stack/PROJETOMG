# FALLBACK & ROLLBACK VALIDATION

A ativação é **safe-by-fallback** e reversível. Em qualquer cenário anômalo, a tela mantém render, read-only, sem backend/Prisma/persistência.

## Cenários de fallback

| # | Cenário | `activation.reason` | Efeito |
|---|---|---|---|
| 1 | activation flag off | `activation-flag-off` | read-only; controller=null |
| 2 | local write plan off | `local-write-plan-off` | read-only; controller=null |
| 3 | beta read model off | `beta-read-model-off` | read-only; controller=null |
| 4 | controller indisponível | — | operações no-op (`ok:false`), não contam, não alteram draft |
| 5 | payload inválido | — | operação `ok:false`, draft inalterado |
| 6 | operação desconhecida | — | fail-closed na validação |
| 7 | erro interno | — | resultado estruturado `ok:false` (sem throw ao chamador) |

## Rollback

- **Por flag off:** activation flag desligada → controller deixa de existir → beta read-only.
- **Por resetDraft:** recria o controller do read state original (draft volta ao inicial).
- **Por descarte:** draft é in-memory; recarregar descarta.
- Sem schema, sem persistência, nada a desfazer no backend.

## Garantia de não-write / não-backend / não-Prisma / não-runtimeBridge

- Em todos os cenários: `backendTouched:false`, `prismaTouched:false`, `runtimeBridgeTouched:false`, `persistence:'none'`.
- submitDraft nunca envia (`sent:false`).
- Módulo `local-write/*` não importa `src/runtime`, `/apis`, Prisma, `makBootstrap`, `runtimeBridge` (teste + gate).

## Verificação

Testes 5, 16–17, 31–34 + gate checks 2/3/6.
