# Rollout / Rollback Plan

`createIsolatedRuntimeRolloutRollbackPlan()` keeps rollout blocked: `rolloutAllowed: false`,
`productionRollout: false`, `stagingRollout: false`, `manualEnablementRequired: true`,
`rollbackByNonConsumption: true`. Nothing rolls out.
