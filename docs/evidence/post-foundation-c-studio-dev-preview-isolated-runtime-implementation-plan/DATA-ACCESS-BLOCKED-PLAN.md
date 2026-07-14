# Data Access Blocked Plan

`createIsolatedRuntimeDataAccessBlockedPlan()` confirms a future runtime accesses no real data:
`realDataRead`, `realDataWrite`, `backendAccessed`, `prismaAccessed`, `fetchUsed`,
`persistenceCreated`, `mutationAllowed` are all `false`; `blockedNow: true`.
