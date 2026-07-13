# EMPRESAS BLUEPRINT ALIGNMENT AUDIT

Classifica cada área contra o contrato certificado do Studio. **Nenhum gap é corrigido
neste slice.**

## Contagem

- aligned: 6 · partially_aligned: 10 · not_aligned: 0 · unknown: 0 · blocked: 0
- overallAlignment: partially_aligned

## Gaps registrados (6)

| gapId | área | severity | slice sugerido |
| --- | --- | --- | --- |
| EMP-GAP-001 | field blueprint (campos_personalizados/cadcps) | medium | SLICE 1 |
| EMP-GAP-002 | screen blueprint (empty/loading/error states) | low | SLICE 2 |
| EMP-GAP-003 | validation (empresasSchema não no contrato) | medium | SLICE 1 |
| EMP-GAP-004 | permission (create/update/delete/configure/admin) | high | SLICE 4 |
| EMP-GAP-005 | persistence boundary (produção real vs noPersistence) | high | SLICE 6 |
| EMP-GAP-006 | preferences/layout | low | SLICE 3 |

Cada gap traz: severity, currentState, expectedState, risk, recommendedFix,
requiresEmpresasCodeChange, requiresUIChange, requiresBackendChange,
requiresPrismaChange, requiresMigration, requiresPermissionChange, suggestedSlice.

Apenas EMP-GAP-005 exige mudança real em Empresas + backend/Prisma (slice dedicado
futuro). Os demais são contract-only / headless.
