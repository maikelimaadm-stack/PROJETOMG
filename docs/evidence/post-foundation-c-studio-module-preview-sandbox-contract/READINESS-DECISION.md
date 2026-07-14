# Readiness Decision

`createModulePreviewReadinessDecision`:

- `readyForPreviewSandbox` — true quando planner válido + metadata segura + route/menu off
  + persistence blocked + permissions fail-closed + tenant ok + sem blockers.
- `readyForDevPreviewContract` — igual ao preview readiness (nomeia o próximo slice, ainda
  contract-only).
- `readyForRealModuleGeneration: false` e `readyForProduction: false` — NUNCA neste slice.
- `needsRegistry: true`.

Readiness: `module_preview_sandbox_contract_ready` / `needs_reference_plan_fix` / `blocked`.
Próximo slice: STUDIO DEV PREVIEW CONTRACT BRIDGE.
