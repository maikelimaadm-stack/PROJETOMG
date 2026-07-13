# Module Readiness Decision

`createModuleReadinessDecision` computa o veredito.

- `readyForRealModuleGeneration: false` — NUNCA neste slice.
- `readyForPreviewSandbox` — true somente quando: blueprint validado + safety ok +
  route/menu off + backend/prisma off + persistence off/referenceOnly + permissions
  fail-closed + tenant ok + sem blockers.
- `needsRegistry: true` — um módulo real ainda precisa do registry (futuro).

Readiness resultante: `module_reference_plan_ready` (sem blockers), `needs_blueprint_fix`
(precisa corrigir), ou `blocked`. `recommendedNextSlice`: STUDIO MODULE PREVIEW SANDBOX
CONTRACT quando pronto.
