# STUDIO SAFETY POLICY

A política de segurança define 20 invariantes que **toda** a fundação preserva.
Qualquer violação é um blocker.

## Invariantes (todas `true`)

`headlessOnly`, `noUi`, `noRoute`, `noMenu`, `noModuleRegistration`, `noBackend`,
`noPrisma`, `noMigration`, `noFetch`, `noProduction`, `noStaging`, `noMutation`,
`noStorage`, `noDependency`, `defaultDeny`, `failClosed`, `tenantRequired`,
`permissionRequired`, `noAutomaticPublication`, `noAutomaticMarketplace`.

## Checker

`createStudioSafetyPolicy().check(descriptor)` retorna
`{ ok, violations }`. Para cada invariante presente no descritor com valor
diferente do esperado, adiciona `"<invariante> must be <esperado>"` a
`violations`. `ok` é `true` somente quando não há violações.

## Digest

`safetyPolicyDigest` é determinístico e entra no manifest agregado.
