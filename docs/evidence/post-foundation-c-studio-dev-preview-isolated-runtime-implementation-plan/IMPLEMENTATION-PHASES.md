# Implementation Phases

`createIsolatedRuntimeImplementationPhases()` declares 9 phases (phase_0_preflight …
phase_8_rollout_blocked). Each phase carries `goal`, `allowedEffects`, `blockedEffects`,
`entryCriteria`, `exitCriteria`, `rollbackPlan`, `status: planned`, `implemented: false`.
`anyImplemented` is `false` and `allPlanned` is `true` — nothing executes. A manual enablement
gate (phase_7) precedes any rollout, which remains blocked (phase_8).
