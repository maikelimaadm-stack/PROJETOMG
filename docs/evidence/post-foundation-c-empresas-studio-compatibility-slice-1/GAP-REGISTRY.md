# GAP REGISTRY

`createEmpresasCompatibilityGapRegistry()` — 10 gaps formais, todos rastreados
(`knownGapsTracked: true`), `untrackedCriticalGaps: 0`, nenhum corrigido alterando Empresas.

| gapId | área | severity | contract-only | recommendedSlice |
| --- | --- | --- | --- | --- |
| ECS1-GAP-001 | screen (detail) | low | sim | SLICE 2 |
| ECS1-GAP-002 | state coverage | low | sim | SLICE 2 |
| ECS1-GAP-003 | write capability | high | não | SLICE 4 |
| ECS1-GAP-004 | persistence boundary | high | sim | SLICE 6 |
| ECS1-GAP-005 | backend/prisma readiness | medium | sim | SLICE 6 |
| ECS1-GAP-006 | preferences/layout | low | sim | SLICE 3 |
| ECS1-GAP-007 | permission | medium | sim | SLICE 4 |
| ECS1-GAP-008 | tenant | medium | sim | SLICE 4 |
| ECS1-GAP-009 | validation | medium | sim | SLICE 2 |
| ECS1-GAP-010 | diagnostics/fallback | low | sim | SLICE 5 |

Cada gap traz: gapId, title, area, source, currentState, expectedStudioState, severity,
risk, status, canResolveContractOnly, requiresEmpresasCodeChange, requiresUIChange,
requiresModeloBase1Change, requiresBackendChange, requiresPrismaSchemaChange,
requiresMigration, requiresPermissionChange, requiresRuntimeBindingChange,
recommendedFix, recommendedSlice, blockedNow, notes.

Regra: nenhum gap é corrigido alterando Empresas neste slice. migration = false para
todos. backend/Prisma só como future readiness.
