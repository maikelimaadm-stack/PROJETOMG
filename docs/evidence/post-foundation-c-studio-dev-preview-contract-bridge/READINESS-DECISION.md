# Readiness Decision

`createDevPreviewReadinessDecision({ blockers, warnings })` aggregates blockers/warnings and
emits `readiness: studio_dev_preview_contract_bridge_ready` when there are no blockers, else
`blocked`. It NEVER reports `readyForRealModuleGeneration` or `readyForProduction` — both are
hard-coded `false`.
