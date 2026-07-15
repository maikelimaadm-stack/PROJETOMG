# Rollout / Rollback Plan — `createAppIntegrationRolloutRollbackPlan`

`rolloutAllowed: false`, `productionRollout: false`, `stagingRollout: false`,
`rollbackByNonConsumption: true`, `rollbackByFlagOff: true`, `destructiveRollbackRequired: false`.
Rollout is blocked; rollback is by non-consumption or flag-off — no destructive rollback is ever
required.
