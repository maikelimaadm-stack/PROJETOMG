# FALLBACK VALIDATION — Beta UI Hardening

O hardening é **safe-by-fallback**: em qualquer entrada anômala o checklist produz `warn`/`skipped` (nunca lança), o status nunca vira `needs_fixes` por dado ausente/parcial, e a tela renderiza a config legada.

## Cenários

| # | Cenário | Comportamento do hardening | Tela |
|---|---|---|---|
| 1 | `runtimeReadModel` ausente | `hardeningStatus='fallback'`, table/form checks `skipped` | legada |
| 2 | `disabled` | `fallback` | legada |
| 3 | inválido (contrato) | `fallback`, `fallbackReason=invalid-read-model:*` | legada |
| 4 | diagnostics ausente | `diagnostics.present='warn'`, status ≠ `needs_fixes` | beta (ok) |
| 5 | rows vazios | `table.emptyStateSafe='pass'` | beta (empty seguro) |
| 6 | columns parciais (sem id) | `table.columnsWellFormed='warn'` (não bloqueante) | beta (ok) |
| 7 | fields parciais (sem id) | `form.fieldsWellFormed='warn'` (não bloqueante) | beta (ok) |
| 8 | outro consumidor (sem runtimeReadModel) | `fallback`, sem checks de table/form ativos | legada |

## Garantia de não-write

- Em qualquer estado beta aplicado: `writeBlocked=true` + write guard + gates no engine.
- Em fallback: comportamento legado (write real normal) — sem regressão.

## Garantia de não-backend / não-Prisma / não-runtimeBridge

- O módulo `hardening/*` e os `components/*` **não importam** `src/runtime/*`, `src/apis/*`, Prisma, `makBootstrap`, `runtimeBridge` (verificado por teste 29 + gate check 6/7).
- `security.noForbiddenRef` derruba qualquer read state que referencie backend/fetch/Prisma/storage.
- Helpers de segurança locais (`../safety.js`) — ModeloBase1 permanece desacoplado do runtime.

## Verificação automatizada

- Testes 3–4, 7–11, 21 cobrem os cenários de fallback/robustez.
- Gate check 2 exercita empty/partial → seguro (warn, não bloqueante) e off → `fallback`.
- Flag off (estado de CI) → `test:runtime` 1182/1182 confirma comportamento idêntico ao pré-slice.
