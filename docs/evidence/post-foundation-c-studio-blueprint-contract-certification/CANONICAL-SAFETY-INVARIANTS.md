# CANONICAL SAFETY INVARIANTS

`createStudioCanonicalSafetyInvariants()` certifica as 20 invariantes (todas true),
rodando o safety invariant runner do hardening sobre o descritor canônico.

headlessOnly · noUi · noRoute · noMenu · noModuleRegistration · noBackend · noPrisma ·
noMigration · noFetch · noProduction · noStaging · noMutation · noStorage · noDependency ·
defaultDeny · failClosed · tenantRequired · permissionRequired · noAutomaticPublication ·
noAutomaticMarketplace.

Resultado: `invariantCount: 20`, `exactSafety: true`, `failed: []`, `blockers: []`.
Qualquer invariante violada quebra a certificação.
