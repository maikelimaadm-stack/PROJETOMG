# Safety Invariants

`validateStudioBlueprintSafety(blueprint)` é fail-closed. Qualquer flag de escape
setada `true` no blueprint é uma violação:

uiEnabled · routeEnabled · menuEnabled · moduleRegistrationEnabled · backendEnabled ·
prismaEnabled · migrationEnabled · productionEnabled · stagingEnabled · fetchEnabled ·
mutationAllowed · persistenceEnabled · generatedModuleAllowed · rewriteEmpresas.

Além disso são violações:
- qualquer permissão de mutação com `enabled: true`;
- `persistence.migrationRequired === true` ou `referenceOnly === false`;
- `runtimeBinding.activatesProduction === true`, `registersModule === true` ou
  `referenceOnly === false`.

O resultado inclui um objeto `invariants` afirmando positivamente (todos `true`):
headless, failClosed, defaultDeny, noUi, noRoute, noMenu, noModuleRegistration,
noBackend, noPrisma, noMigration, noProduction, noStaging, noFetch, noMutation,
noPersistence, noGeneratedModule, noRewriteEmpresas.
