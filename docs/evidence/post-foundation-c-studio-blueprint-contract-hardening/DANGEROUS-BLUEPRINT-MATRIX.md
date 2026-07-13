# DANGEROUS BLUEPRINT MATRIX

`createStudioDangerousBlueprintMatrix()` — 27 cenários; todos bloqueados.

## Casos perigosos (bloqueados)

productionAllowed/menuVisible/routeEnabled/backendAllowed/prismaAllowed/
migrationAllowed/mutationAllowed/generatedModuleAllowed/marketplaceEnabled true ·
defaultDeny/failClosed/tenantRequired/permissionRequired false ·
adminBypassesTenant · deleteAllowedByDefault · publicRoute · unauthenticatedAccess ·
autoRegister · autoPublish · autoMigration · rawCodeExecution · customScript ·
unsafeComputed · externalUrlBinding · fetchEnabled · databaseUrlBinding · prismaClientBinding.

## Resultado

`dangerous:true`, `blocked:true`, `blockerCode: STUDIO_HARDENING_DANGEROUS_BLUEPRINT`,
`classification: breaking | invalid`, `readiness: blocked`, zero side effects.
