# SAFETY INVARIANT RUNNER

`createStudioSafetyInvariantRunner({ descriptor })` executa as 20 invariantes de
segurança do Studio contra um descritor.

## Invariantes (20)

headlessOnly · noUi · noRoute · noMenu · noModuleRegistration · noBackend · noPrisma ·
noMigration · noFetch · noProduction · noStaging · noMutation · noStorage · noDependency ·
defaultDeny · failClosed · tenantRequired · permissionRequired · noAutomaticPublication ·
noAutomaticMarketplace.

## Resultado

`invariantCount`, `results` (por invariante: expected/actual/passed), `passed`, `failed`,
`blockers`, `readiness`. Qualquer invariante falha → blocker → readiness `blocked`.
O descritor canônico (todas true) passa todas.
