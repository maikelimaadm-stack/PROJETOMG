# Module Identity Plan

`createModuleIdentityPlan` planeja a identidade do módulo a partir do blueprint
normalizado. Nada é registrado; nenhum diretório em `src/modules` é criado.

Campos: `moduleId` (identificador seguro), `displayName`, `modelType`, `modelFamily`,
`sourceBlueprintId`, `sourceBlueprintVersion`, `sourceEngineManifest` (digest do engine),
`sourceReadiness`, `namespacePlan` (`plannedOnly`, `createdNow:false`), `ownershipPlan`,
`versionPlan` (`bumpedNow:false`), `statusPlan`.

Regras: `moduleId` de Empresas ⇒ `referenceOnly_lab`; qualquer moduleId novo ⇒
`plannedOnly`. `registeredNow:false`, `directoryCreatedNow:false`,
`routeCreatedNow:false`, `menuCreatedNow:false`.
