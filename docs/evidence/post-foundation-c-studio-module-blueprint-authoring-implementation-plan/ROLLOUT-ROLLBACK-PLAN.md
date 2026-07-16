# Rollout / Rollback Plan

`createAuthoringRolloutRollbackPlan()` — rollout stays blocked until the enterprise checkpoint;
rollback is by non-consumption/flag-off, never destructive.

`rolloutBlocked:true`, `rolloutRequiresCheckpoint:true`, `rollbackByNonConsumption:true`,
`rollbackByFlagOff:true`, `destructiveRollbackRequired:false`, `productionRolloutAllowed:false`,
`stagingRolloutAllowed:false`.
