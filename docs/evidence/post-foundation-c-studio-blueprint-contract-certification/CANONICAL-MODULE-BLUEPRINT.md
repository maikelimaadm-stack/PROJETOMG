# CANONICAL MODULE BLUEPRINT

`createStudioCanonicalModuleBlueprint()` certifica os requisitos e defaults do module
blueprint.

## Campos obrigatórios

moduleId · version · modelType · permissions · persistenceBoundary.

## Defaults canônicos (todos false)

productionAllowed · menuVisible · routeEnabled · mutationAllowed · backendAllowed ·
prismaAllowed · migrationAllowed · generatedModuleAllowed · marketplaceEnabled.

## Regras

Permission blueprint obrigatório · persistence boundary obrigatória ·
route/menu nunca automático.
